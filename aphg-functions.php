<?php

defined('ABSPATH') or die('No script kiddies please!');

/*
 * function for getting all image sizes
 */

function aphg_get_image_sizes() {
    global $_wp_additional_image_sizes;

    $sizes = array();

    foreach (get_intermediate_image_sizes() as $_size) {
        if (in_array($_size, array('thumbnail', 'medium', 'medium_large', 'large'))) {
            $sizes[$_size]['width'] = get_option("{$_size}_size_w");
            $sizes[$_size]['height'] = get_option("{$_size}_size_h");
        } elseif (isset($_wp_additional_image_sizes[$_size])) {
            $sizes[$_size] = array(
                'width' => $_wp_additional_image_sizes[$_size]['width'],
                'height' => $_wp_additional_image_sizes[$_size]['height'],
            );
        }
    }

    return $sizes;
}

/*
 * function for creating still GIF
 */

function aphg_convertImage($originalImage, $outputImage) {
    $status = true;
    $imageTmp = imagecreatefromgif($originalImage);

    if (!$imageTmp) {
        $status = false;
    }

    $imgcreate = imagegif($imageTmp, $outputImage);
    if (!$imgcreate) {
        $status = false;
    }
    imagedestroy($imageTmp);

    return $status;
}
