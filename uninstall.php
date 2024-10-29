<?php

defined('ABSPATH') or die('No script kiddies please!');
if (!defined('WP_UNINSTALL_PLUGIN'))
    exit();

$aphg_all_options = array(
    'aphg_settings'
);

if (function_exists('is_multisite') && is_multisite()) {
    global $wpdb;
    $old_blog = $wpdb->blogid;

    foreach ($aphg_all_options as $aphg_option) {
        delete_option($aphg_option);
    }
    switch_to_blog($old_blog);
} else {
    foreach ($aphg_all_options as $aphg_option) {
        delete_option($aphg_option);
    }
}