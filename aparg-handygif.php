<?php
/*
  Plugin Name: Aparg HandyGIF
  Description: With HandyGIF you will be able to make your WordPress post more trending by inserting GIFs into it.
  Version:     1.0
  Author:      Aparg
  Author URI:  http://aparg.com/
  License:     GPL2
  Text Domain: aparg-handygif
  Domain Path: /languages/
  ​
  This plugin is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as active by
  the Free Software Foundation, either version 2 of the License, or
  any later version.
  ​
  This plugin is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.
  ​
  You should have received a copy of the GNU General Public License
  along with this plugin. If not, see https://wordpress.org/about/gpl/.
 */
defined('ABSPATH') or die('No script kiddies please!');

require_once("aphg-functions.php");
require_once("aphg-settings-page.php");

/*
 * Including scripts and styles to admin page 
 */
/**
 * Load text domain
 */
add_action('init', 'aphg_text_domain');

function aphg_text_domain() {
    load_plugin_textdomain('aparg-handygif', dirname(__FILE__) . DIRECTORY_SEPARATOR . 'languages' . DIRECTORY_SEPARATOR, basename(dirname(__FILE__)) . DIRECTORY_SEPARATOR . 'languages' . DIRECTORY_SEPARATOR);
}

function aphg_my_plugin_scripts($hook) {

    wp_register_style('aparg_editor_styles', plugins_url('css/aphg-editors.css', __FILE__), false, false, 'all');
    wp_enqueue_style('aparg_editor_styles');
    wp_enqueue_media();
    wp_enqueue_script('jquery-ui-draggable');
    wp_register_script('aparg_handygif_style', plugins_url('js/aphg-admin-editors.js', __FILE__), array('jquery', 'jquery-ui-core'), false, true);
    wp_enqueue_script('aparg_handygif_style');
    $nonce = wp_create_nonce('aparg-handyGIF');
    $aphg_settings = get_option('aphg_settings');
    $aphg_hot_key = $aphg_settings ? $aphg_settings['aphg_hot_key'] : 'g';
    $aphg_gif_bot = $aphg_settings ? $aphg_settings['aphg_gif_bot'] : 'gif';
    $aphg_gif_gpu = $aphg_settings ? $aphg_settings['aphg_gif_gpu'] : 'off';
    $aphg_client_id = $aphg_settings ? $aphg_settings['aphg_client_id'] : '';
    $aphg_client_secret = $aphg_settings ? $aphg_settings['aphg_client_secret'] : '';



    $settings = array(
        'hotKey' => $aphg_hot_key,
        'gifBot' => $aphg_gif_bot,
        'gifGpu' => $aphg_gif_gpu,
        'client_secret' => $aphg_client_secret,
        'client_id' => $aphg_client_id,
    );
    $aphg_localize_array = array(
        'url' => admin_url('admin-ajax.php'),
        'nonce' => $nonce,
        'botText' => __('GIF bot must be latin lowercase word with length of minimum two and maximum five characters', 'aparg-handygif'),
        'hotKeyText' => __('Hot key must be single latin lowercase letter', 'aparg-handygif'),
        'search' => __('Search GIFs', 'aparg-handygif'),
        'playOn' => __('Play On', 'aparg-handygif'),
        'hover' => __('Hover', 'aparg-handygif'),
        'click' => __('Click', 'aparg-handygif'),
        'view' => __('View', 'aparg-handygif'),
        'chooseImg' => __('Choose GIF', 'aparg-handygif'),
        'wentWrong' => __('Something went wrong', 'aparg-handygif'),
        'alert' => __("Sorry can't insert GIF ", 'aparg-handygif'),
        'noGifsFound' => __("No Gifs found", 'aparg-handygif'),
        'settings' => $settings,
        'icon_url' => plugins_url('/images/logo.png', __FILE__)
    );
    wp_localize_script('aparg_handygif_style', 'handyGIF', $aphg_localize_array);

    if ("toplevel_page_aparghandygif" != $hook) {
        return;
    }
    wp_register_style('aphg_custom_styles', plugins_url('css/aphg-admin-settings.css', __FILE__), false, false, 'all');
    wp_enqueue_style('aphg_custom_styles');
    wp_register_script('aphg_custom_script', plugins_url('js/aphg-admin-settings.js', __FILE__), array('jquery'));
    wp_enqueue_script('aphg_custom_script');
}

add_action('admin_enqueue_scripts', 'aphg_my_plugin_scripts');
/*
 * Including scripts and styles to front page
 * 
 */

function aphg_load_custom_files() {
    if (!is_admin()) {
        wp_enqueue_script('jquery');
        wp_register_style('aphg-front', plugins_url('css/aphg-front.css', __FILE__));
        wp_enqueue_style('aphg-front');
        wp_register_script('aparg_handyGIF_scripts', plugins_url('js/aphg-front-script.js', __FILE__), array('jquery'));
        wp_enqueue_script('aparg_handyGIF_scripts');
        wp_register_script('aparg_gifplay_scripts', plugins_url('js/aphg-gifplayer.js', __FILE__), array('jquery'));
        wp_enqueue_script('aparg_gifplay_scripts');
    }
}

add_action('wp_enqueue_scripts', 'aphg_load_custom_files');



/*
 *  add menue icon in tinymce editor
 */

add_action('init', 'aphg_tinymce_button');

function aphg_tinymce_button() {
    add_filter("mce_external_plugins", "aphg_add_button");
    add_filter('mce_buttons', 'aphg_register_button');
}

function aphg_add_button($plugin_array) {
    $plugin_array['aphg'] = plugins_url('/js/aphg-tinymce-button.js', __FILE__);
    return $plugin_array;
}

function aphg_register_button($buttons) {
    array_push($buttons, 'handyGIF');
    return $buttons;
}

/*
 * ajax handler function for creating still GIF  when uploading from media library 
 */
add_action('wp_ajax_aphg_create_still_gif', 'aphg_create_still_gif');

function aphg_create_still_gif() {
    $nonce = sanitize_text_field($_POST['nonce']);
    if (!wp_verify_nonce($nonce, 'aparg-handyGIF') && !current_user_can('edit_posts'))
        die();
    $id = intval(sanitize_text_field($_POST['id']));
    $fullsize_path = get_attached_file($id);
    $still_gif_path = plugin_dir_path(__FILE__) . 'images/media-upload/' . $id . '.gif';

    if (file_exists($still_gif_path)) {
        $result = plugins_url('images/media-upload/' . $id . '.gif', __FILE__);
    } else {
        if (aphg_convertImage($fullsize_path, $still_gif_path)) {
            $result = plugins_url('images/media-upload/' . $id . '.gif', __FILE__);
        } else {
            $result = "";
        }
    }

    echo json_encode($result);
    wp_die();
}

/*
 * deleting created gif from media upload when attachment deleting
 */
add_action('delete_attachment', 'aphg_deleting_created_gif');

function aphg_deleting_created_gif($postid) {
    $created_gif_path = plugin_dir_path(__FILE__) . 'images/media-upload/' . $postid . '.gif';
    if (file_exists($created_gif_path)) {
        unlink($created_gif_path);
    }
}

/*
 * visual composer support
 */

add_action('vc_before_init', 'aphg_visual_composer_custom_param');

function aphg_visual_composer_custom_param() {

    /*
     * registering new parametr types checking version of visual composer
     */
    if (function_exists('vc_add_shortcode_param')) {
        vc_add_shortcode_param('aprgGifChekbox', 'aphg_gif_chekbox_param_settings', plugins_url('/js/visual-composer/aphg-vc-radiobutton.js', __FILE__));
        vc_add_shortcode_param('aprgGif', 'aphg_gif_param_settings', plugins_url('/js/visual-composer/aphg-vc.js', __FILE__));
    } else {
        add_shortcode_param('aprgGifChekbox', 'aphg_gif_chekbox_param_settings', plugins_url('/js/visual-composer/aphg-vc-radiobutton.js', __FILE__));
        add_shortcode_param('aprgGif', 'aphg_gif_param_settings', plugins_url('/js/visual-composer/aphg-vc.js', __FILE__));
    }

    function aphg_gif_chekbox_param_settings($settings, $value) {

        $checked_hover = ($value == "hover") ? 'checked' : "";
        $checked_click = ($value == "click") ? 'checked' : "";
        $checked_view = ($value == "view") ? 'checked' : "";

        $return_content = '<div id="aphg-radiobutton-parent" >'
                . '<input id="aphg-visual-radio-hidden" class="wpb_vc_param_value wpb-textinput ' . esc_attr($settings['param_name']) . ' ' .
                esc_attr($settings['type']) . '_field" type="hidden" name="' . esc_attr($settings['param_name']) . '" value="' . esc_attr($value) . '" />
             <input type="radio" id="aphg-visual-hover" value="hover" name="gifAction" ' . esc_attr($checked_hover) . ' >
            <label for="aphg-visual-hover"> ' . __("Hover", "aparg-handygif") . ' </label>
            <input  type="radio" id="aphg-visual-click" value="click" name="gifAction" ' . esc_attr($checked_click) . '>
            <label for="aphg-visual-click">' . __("Click", "aparg-handygif") . '</label>
            <input type="radio" value="view" id="aphg-visual-view"  name="gifAction" ' . esc_attr($checked_view) . '><label for="aphg-visual-view"> ' . __("View", "aparg-handygif") . ' </label> </div>';

        return $return_content;
    }

    function aphg_gif_param_settings($settings, $value) {
        $content = "";

        if ($value) {
            $value_array = explode('{APARG}', $value);
            $gif_url = $value_array[0];
            $content = '<li class="aphg-visual-gif-conteiner" > <div class="aphg-vc-gif-frame" style="background-image:url(' . esc_url($gif_url) . ')" ></div>';
            $content.='<a href="#" class="aphg-icon-remove"></a></li>';
        }

        $return_content = '<div id="aphg-visual-parent">'
                . '<div id="aphg-visual-conteiner" class="aphg-loader-layer"> </div></br>'
                . '<input id="aphg-visual-hidden" class="wpb_vc_param_value wpb-textinput ' . esc_attr($settings['param_name']) . ' ' .
                esc_attr($settings['type']) . '_field" type="hidden" name="' . esc_attr($settings['param_name']) . '" value="' . esc_attr($value) . '" /> '
                . '<input  id="aphg-visual-input" class="wpb_vc_param_value wpb-textinput" type="text" placeholder="' . __('Shearch GIFs', 'aparg-handygif') . '"  /></br></br></div>
                <div class="edit_form_line"><div class="gallery_widget_attached_images">
                <ul class="gallery_widget_attached_images_list ui-sortable aphg-visual-gif-ul">
		' . $content . '
		</ul></div><div class="gallery_widget_site_images">
                </div><a class="aphg-visual-add-gif" href="#" use-single="true" title="Add Gif">Add Gif</a></div>
                <script>
                jQuery("#aphg-visual-conteiner").off("scroll").on("scroll", function (e) {
                var elem = jQuery(e.currentTarget);
                if (elem.scrollLeft() + elem.innerWidth() >= elem[0].scrollWidth) {
                 if (!aphg_no_gifs_found) {
                 jQuery("#aphg-visual-conteiner").find(".aphg-loader-block").remove();
                  jQuery("#aphg-visual-conteiner").append(\'<p class="aphg-loader-block"></p>\');
                  aphg_gif_ajax("#aphg-visual-conteiner", true);
                  }
                } 
                })</script>';

        return $return_content;
    }

}

/*
 * extending visual composer settings
 */
add_action('vc_before_init', 'aphg_visual_composer');

function aphg_visual_composer() {

    $img_for_editor = '<img width="150" height="150" src="' . plugins_url('/images/composer_logo.png', __FILE__) . '" class="attachment-thumbnail aphg-test vc_general vc_element-icon"  alt="" title="" style="float:left;margin-right: 10px; background-image:none;">';
    $content_for_editor = '<div class="wpb_tabs_holder wpb_holder vc_container_for_children">
    <h4 class="wpb_element_title vc_handyGif"> HandyGIF ' . $img_for_editor . '</h4></div>';

    /*
     * extending visual composer vc_map
     */
    vc_map(array(
        "name" => __("HandyGIF", "aparg-handygif"),
        "base" => "handygif",
        "class" => "",
        'custom_markup' => $content_for_editor,
        "icon" => plugins_url('images/composer_logo.png', __FILE__),
        "category" => __("Content", "aparg-handygif"),
        "params" => array(
            array(
                "type" => "aprgGif",
                "holder" => "div",
                "class" => "",
                "heading" => __("Choose GIFs", "aparg-handygif"),
                "param_name" => "gif",
                "value" => '',
                "description" => __("Select GIF from media library", "aparg-handygif"),
            ),
            array(
                "type" => "aprgGifChekbox",
                "heading" => __("Play On:", "aparg-handygif"),
                "holder" => "div",
                "param_name" => "gifaction",
                "value" => '',
            ),
            array(
                'type' => 'vc_link',
                'heading' => __('URL (Link)', 'aparg-handygif'),
                'param_name' => 'url',
                'dependency' => array(
                    'element' => 'link',
                    'value' => ''
                ),
                'description' => __('Add custom link.', 'aparg-handygif'),
            ),
            array(
                "type" => "textfield",
                "heading" => __("Gif Size", "aparg-handygif"),
                "param_name" => "size",
                'description' => __('Enter image size (Example: "thumbnail", "medium", "large", "full" or other sizes defined by theme). Alternatively enter size in pixels (Example: 200x100 (Width x Height)). Leave parameter empty to use "thumbnail" by default.', 'aparg-handygif'),
            ),
            array(
                "type" => "textfield",
                "heading" => __("Extra Class Name", "aparg-handygif"),
                "param_name" => "class",
                "value" => ''
            ),
            array(
                "type" => "dropdown",
                "heading" => __("Image alignment", "aparg-handygif"),
                "param_name" => "alignment",
                "value" => array(
                    __('Left', "aparg-handygif") => 'text-align:left;',
                    __('Right', "aparg-handygif") => 'text-align:right;',
                    __('Center', "aparg-handygif") => 'text-align:center;'
                ),
            ),
            array(
                'type' => 'css_editor',
                'heading' => __('Css', 'handygif'),
                'param_name' => 'css',
                'group' => __('Design options', 'aparg-handygif'),
            ),
        )
    ));
}

/*
 * creating shortcode for visual composer
 */

function aphg_shortcode_function($atts, $content) {
    $atts = shortcode_atts(
            array(
        'gif' => '',
        'css' => '',
        'size' => '',
        'class' => '',
        'alignment' => '',
        'gifaction' => '',
        'url' => '',
            ), $atts, 'handygif'
    );


    $css = '';
    extract(shortcode_atts(array(
        'css' => ''
                    ), $atts));
    $css_class = apply_filters(VC_SHORTCODE_CUSTOM_CSS_FILTER_TAG, vc_shortcode_custom_css_class($css, ' '), 'handygif', $atts);
    $img_value = "";
    $title = "";
    $url_attribute = "";
    $link_target = "_self";
    $sizes = '';
    $height_auto = '';
    $aphg_settings = get_option('aphg_settings');
    $gpu_acceleration = ($aphg_settings && $aphg_settings['aphg_gif_gpu']) == 'on' ? 'aphg-gpu-acceleration' : '';
    /*
     * checking and returning  img to shortcode 
     */
    if ($atts['gif']) {

        /*
         * checking size 
         */
        $width = '';
        $height = '';
        if ($atts['size']) {
            $img_size_array = aphg_get_image_sizes();
            if (array_key_exists($atts['size'], $img_size_array)) {
                $width = $img_size_array[$atts['size']]['width'];
                $height = $img_size_array[$atts['size']]['height'];
                $sizes = 'width=' . $width . ' height=' . $height . '';
                $height_auto = 'height:auto !important;width:' . $width . 'px';
            } else {
                preg_match("/(\d+(\d*)?)x(\d+(\d*))/", $atts['size'], $matches);
                if ($matches && $matches[0] == $atts['size']) {
                    list($width, $height) = explode('x', $matches[0]);
                    $sizes = 'width=' . $width . ' height=' . $height . '';
                    $height_auto = 'height:auto !important;width:' . $width . 'px';
                }
            }
        }


        list($gif_url, $still_url) = explode('{APARG}', $atts['gif']);
        $gifAction = $atts['gifaction'];
        if ($atts['url']) {
            $gif_link_array = explode('|', urldecode($atts['url']));

            if ($gif_link_array[0]) {
                $link_string_array = explode(':', $gif_link_array[0]);
                array_shift($link_string_array);
                $href = join(':', $link_string_array);

                if ($gif_link_array[1]) {
                    $link_title_array = explode(':', $gif_link_array[1]);
                    array_shift($link_title_array);
                    $title = 'title=' . join('', $link_title_array);
                }
                if ($gif_link_array[2]) {
                    $link_target_array = explode(':', $gif_link_array[2]);
                    array_shift($link_target_array);
                    $link_target = join('', $link_target_array);
                }
                $url_attribute = 'onclick="window.open(' . '\'' . $href . '\'' . ',\'' . $link_target . '\' )"';
            }
        }

        switch ($gifAction) {
            case "hover":
                $img_value = '<img style="' . esc_attr($height_auto) . '" ' . esc_attr($sizes) . '  ' . $url_attribute . ' class="' . esc_attr($gpu_acceleration) . ' aphg-front-gif aphg-gif ' . esc_attr($atts['class']) . ' " data-playon="hover" src="' . esc_url($still_url) . '"  data-gif="' . esc_url($gif_url) . '"  alt="" ' . esc_attr($title) . ' />';
                break;
            case "click":
                $img_value = '<img style="' . esc_attr($height_auto) . '" ' . esc_attr($sizes) . ' ' . $url_attribute . ' class="' . esc_attr($gpu_acceleration) . ' aphg-front-gif aphg-gif ' . esc_attr($atts['class']) . '" src="' . esc_url($still_url) . '" data-playon="click"  data-gif="' . esc_url($gif_url) . '"  alt=""  ' . esc_attr($title) . ' />';
                break;
            case "view" :
                $img_value = '<img data-played="false" style="' . esc_attr($height_auto) . '" ' . esc_attr($sizes) . ' ' . $url_attribute . ' class="' . esc_attr($gpu_acceleration) . ' aphg-front-gif aphg-gif ' . esc_attr($atts['class']) . '" data-playon="view" src="' . esc_url($still_url) . '"  data-gif="' . esc_url($gif_url) . '"  alt="" ' . esc_attr($title) . ' />';
                break;
            default:
                $img_value = '<img style="' . esc_attr($height_auto) . '" ' . esc_attr($sizes) . ' ' . $url_attribute . ' class="' . esc_attr($gpu_acceleration) . ' aphg-front-gif ' . esc_attr($atts['class']) . '" src="' . esc_url($gif_url) . '" alt="" ' . esc_attr($title) . ' />';
        }
    }

    $html = '<style type="text/css">' . esc_attr($atts['css']) . '</style><div class="' . esc_attr($css_class) . '" style="' . esc_attr($atts['alignment']) . '">' . $img_value . '</div>';
    return $html;
}

add_shortcode('handygif', 'aphg_shortcode_function');

/**
 * *===== adding functions and required logic for creating wp native editor buttuns =====
 * 
 * @global type $aphg_admin_labels
 */
function aphg_text_editor_hook() {


    if (wp_script_is('quicktags') || wp_script_is('tinymce-templates')) {
        ?>
        <script type="text/javascript">
            (function () {
                if (!window.QTags)
                    return;
                window.QTags.addButton('apargHandyGifButton', 'HandyGIF', aphg_text_editor_hook, '', 'g', 'Insert Gif');


            }());

            function aphg_text_editor_hook(button, editor, ed) {
                window.aphg_qtags_active_editor = editor;
                aphg_create_popup('default', editor);

            }
        </script>
        <?php
    }
}

add_action('admin_print_footer_scripts', 'aphg_text_editor_hook');

function aphg_get_gifs() {
    $client_id = isset($_GET['client_id']) ? $_GET['client_id'] : "";
    $client_secret = isset($_GET['client_secret']) ? $_GET['client_secret'] : "";
    $search_text = isset($_GET['search_text']) ? $_GET['search_text'] : '';
    $count = isset($_GET['count']) ? $_GET['count'] : '';
    $cursor = isset($_GET['cursor']) ? $_GET['cursor'] : '';
    $rpcRequest = '{"grant_type":"client_credentials", "client_id":"' . $client_id . '","client_secret":"' . $client_secret . '"}';
    $request = wp_remote_post('https://api.gfycat.com/v1/oauth/token', array(
        'headers' => array('Content-type: application/json'),
        'body' => sprintf($rpcRequest)));
    $response = wp_remote_retrieve_body($request) ? json_decode(wp_remote_retrieve_body($request), true) : false;
    $access_token = false;

    if ($response && isset($response['access_token'])) {
        $access_token = $response['access_token'];
    }


    $final_response = array('errorMessage' => 'No search results');
    if ($access_token) {

        $gif_request = wp_remote_get(
                'https://api.gfycat.com/v1/gfycats/search?search_text=' . urlencode($search_text) . '&count=' . $count . '&cursor=' . $cursor, array('headers' => array('Content-type' => 'application/json', 'Authorization' => 'Bearer ' . $access_token))
        );

        $gif_response = wp_remote_retrieve_body($gif_request) ? json_decode(wp_remote_retrieve_body($gif_request), true) : false;
        if ($gif_response) {
            $final_response = $gif_response;
        }
    }


    echo json_encode($final_response);
    wp_die();
}

/*
 * ajax handler function for getting  GIF  eith API Authorization
 */
add_action('wp_ajax_aphg_get_gifs', 'aphg_get_gifs');

/**
 * *========= Hook for allowing data attributes ======
 * 
 * @param arr $allowed
 * @param str|arr $context
 * @return arr
 */
function aphg_filter_allowed_html($allowed, $context) {

    if (is_array($context)) {
        return $allowed;
    }

    if ($context === 'post') {
        $allowed['img']['data-gif'] = true;
        $allowed['img']['data-playon'] = true;
        $allowed['img']['data-played'] = true;
        $allowed['img']['data-bot'] = true;
        $allowed['img']['data-still'] = true;
        $allowed['img']['data-link'] = true;
        $allowed['img']['data-editor'] = true;
    }

    return $allowed;
}

add_filter('wp_kses_allowed_html', 'aphg_filter_allowed_html', 10, 2);

/**
 * ===== Adding Admin Notice if Credential are empty =======
 * 
 * @global str $pagenow
 */
function aphg_admin_notice() {
    global $pagenow;
    $aphg_admin_settings = get_option('aphg_settings');
    if (!$aphg_admin_settings || !$aphg_admin_settings['aphg_client_id'] || !$aphg_admin_settings['aphg_client_secret']) {
        if ($pagenow === "post.php" && (current_user_can('edit_plugins') || current_user_can('manage_network_plugins'))) {
            ?>
            <div class="notice notice-warning  is-dismissible">
                <p><?php _e('To unlock all Gfycat features please fill API credentials in ', 'aparg-handygif'); ?> <a href="<?php echo menu_page_url('aparghandygif', FALSE) ?>"><?php _e("settings", "aparg-handygif") ?></a> <?php _e(' page.', 'aparg-handygif'); ?> </p>
            </div>
            <?php
        }
    }
}

add_action('admin_notices', 'aphg_admin_notice');
