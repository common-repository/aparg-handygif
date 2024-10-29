<?php
defined('ABSPATH') or die('No script kiddies please!');
/*
 * Adding handygif admin page
 */
add_action('admin_menu', 'aphg_handygif_menu');

function aphg_handygif_menu() {
    add_menu_page(__("HandyGIF", "aparg-handygif"), __('HandyGIF', "aparg-handygif"), "manage_options", 'aparghandygif', 'aphg_render_settings_page', plugins_url('/images/logo.png', __FILE__));
}

function aphg_render_settings_page() {

    if (isset($_POST['save_settings']) && check_admin_referer( 'aphg_sumbit_settings', 'aphg_settings_nonce' )) {

        $aphg_settings = array(
            'aphg_hot_key' => sanitize_text_field($_POST['hot_key']),
            'aphg_gif_bot' => sanitize_text_field($_POST['gif_bot']),
            'aphg_client_id' => sanitize_text_field($_POST['client_id']),
            'aphg_client_secret' => sanitize_text_field($_POST['client_secret']),
            'aphg_gif_gpu' => isset($_POST['gif_gpu']) ? sanitize_text_field($_POST['gif_gpu']) : "off"
        );

        update_option('aphg_settings', $aphg_settings);



        echo '<div id="message" class="updated fade"><p><strong>' . __('Settings Saved.', 'aparg-handygif') . '</strong></p></div>';
    }
    $aphg_settings = get_option('aphg_settings');

    $aphg_client_id = $aphg_settings ? $aphg_settings['aphg_client_id'] : '';
    $aphg_client_secret = $aphg_settings ? $aphg_settings['aphg_client_secret'] : '';
    $aphg_hot_key = $aphg_settings ? $aphg_settings['aphg_hot_key'] : 'g';
    $aphg_gif_bot = $aphg_settings ? $aphg_settings['aphg_gif_bot'] : 'gif';
    $aphg_gif_gpu = $aphg_settings ? $aphg_settings['aphg_gif_gpu'] : 'off';
    ?>  
    <div class='wrap'>
        <h2><?php _e('Settings', 'aparg-handygif'); ?> 
            <div class="aphg-developed-by"><?php _e('GIFs powered by', 'aparg-handygif') ?> <a href="https://gfycat.com/" target="_blank">Gfycat</a> | <?php _e('Developed by', 'aparg-handygif') ?> <a href="https://www.aparg.com" target="_blank">Aparg</a> </div>
        </h2>

        <form method="post" action="" enctype="multipart/form-data" id="handyGifForm">
            <table class="form-table" id="form-table-resize">
                <tbody>
                    <tr>
                        <th scope="row">
                            <label for="aphg-hot-key"><?php _e('Hot Key', 'aparg-handygif') ?></label>
                        </th>
                        <td>
                            <?php _e('Ctrl + ', 'aparg-handygif') ?><input id="aphg-hot-key" class="small-text" type="text" value="<?php echo $aphg_hot_key; ?>" name="hot_key"/>
                            </br>
                            <span class="aphg-instructions"></span>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="aphg-gif-bot"><?php _e('Gif Bot', 'aparg-handygif') ?></label>
                        </th>
                        <td id="gif-bot-td">
                            <?php _e(' @ ', 'aparg-handygif') ?><input id="aphg-gif-bot" class="small-text" type="text" value="<?php echo $aphg_gif_bot; ?>" name="gif_bot"/>
                            </br>
                            <span class="aphg-instructions"></span>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <?php _e('Hardwere Acceleration On Insert', 'aparg-handygif') ?>
                        </th>
                        <td>
                            <input type="checkbox" name="gif_gpu" value="on" <?php checked('on', $aphg_gif_gpu, true); ?> />
                            </br>

                            <span class=""></span>

                        </td>
                    </tr>
                    <tr>
                        <th colspan="2">
                <h3 class="aphg-api-heading"> <?php _e('API Credentials', 'aparg-handygif') ?></h3>
                </th>
                </tr>
                <?php if ($aphg_client_secret === '' || $aphg_client_id === '') { ?>
                    <tr>
                        <td class="aphg-api-info-wrap" colspan="2">
                            <div class="aphg-api-info"> <?php _e('To get Gfycat API credentials please', 'aparg-handygif') ?> <a  target="_blank" href="https://developers.gfycat.com/signup/#/apiform"> <?php _e('sign up', 'aparg-handygif') ?></a>, <?php _e('create project and you will receive your client id and secret. For more information check Gfycat ', 'aparg-handygif') ?>
                                <a  target="_blank" href="https://developers.gfycat.com/api/#introduction"> <?php _e('documentation', 'aparg-handygif') ?></a>.</div>
                        </td>
                    </tr>
                    <tr>
                    <?php } ?>
                    <th scope="row">
                        <label for="aphg-client-id">  <?php _e('Gfycat client id', 'aparg-handygif') ?></label>
                    </th>
                    <td>
                        <input type="text" id="aphg-client-id" name="client_id" class="regular-text" value="<?php echo $aphg_client_id; ?>"  />
                        <div class="aphg-api-btn-wrap" >
                            <a target="_blank" href="https://developers.gfycat.com/signup/#/apiform" class="aphg-api-btn button"><?php _e('Get Credentials', 'aparg-handygif') ?></a>
                        </div>
                        </br>

                        <span class=""></span>

                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="aphg-client_secret">  <?php _e('Gfycat client secret', 'aparg-handygif') ?></label>
                    </th>
                    <td>
                        <input type="text" id="aphg-client_secret" name="client_secret" class="regular-text" value="<?php echo $aphg_client_secret; ?>"  />
                        </br>

                        <span class=""></span>
                        <?php wp_nonce_field('aphg_sumbit_settings', 'aphg_settings_nonce'); ?>
                    </td>
                </tr>

                </tbody>
            </table>
            <p class="submit">
                <input id="save-settings" class="button button-primary" type="submit" value="<?php _e('Save Settings', 'aparg-handygif') ?>" name="save_settings">
            </p>

        </form>

    </div>




    <?php
}
