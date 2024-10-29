jQuery(".aphg-visual-gif-conteiner").css('display', 'block');
/*
 * search input 
 */
var aphg_set_vc_timeout;
jQuery(document).on("keyup", "#aphg-visual-input", function () {
    clearTimeout(aphg_set_vc_timeout)
    aphg_set_vc_timeout = setTimeout(function () {
        aphg_gif_ajax('#aphg-visual-conteiner');

    }, 300)

});
jQuery(document).ready(function ($) {

    /*
     * function for inserting img to tab
     */
    function aphg_insert_into_visual(stillGif, gifUrl) {
        var img_value = '<div class="aphg-vc-gif-frame" style="background-image:url(' + gifUrl + ')" ></div>';
        img_value += '<a href="#" class="aphg-icon-remove"></a>';

        if ($('.aphg-visual-gif-conteiner').length === 0) {
            $('ul.aphg-visual-gif-ul').append('<li style="display:block" class="aphg-visual-gif-conteiner">' + img_value + '</li>');

        } else {
            $('.aphg-visual-gif-conteiner').empty();
            $('.aphg-visual-gif-conteiner').append(img_value).css('display', 'block');
        }
        var value = gifUrl + '{APARG}' + stillGif;
        $('#aphg-visual-hidden').val(value)
    }
    
    
    aphg_gif_ajax('#aphg-visual-conteiner');


    /*
     * inserting gif to visual composer
     */

    $(document).off("click.aphg_popup_gif").on("click.aphg_popup_gif", ".aphg-popup-gif", function (e) {
        if (jQuery(e.target).closest('#aphg-gif-conteiner').length) {
            return false;
        }
        var stillGif = $(this).attr('data-still');
        var gifUrl = $(this).attr('data-link');
        aphg_insert_into_visual(stillGif, gifUrl);


    });



    /*
     * removing gif from tab
     */
    $(document).on("click", ".aphg-icon-remove", function () {
        $('.aphg-visual-gif-conteiner').empty().css('display', 'none');
        $('#aphg-visual-hidden').val('');
    });

    /*
     * media library 
     */


    var aphgAddGif_uploader;
    $(document).off("click.aphg_visual_add_gif").on("click.aphg_visual_add_gif", ".aphg-visual-add-gif", function (e) {
        e.preventDefault();
        aphgAddGif_uploader = wp.media.frames.file_frame = wp.media({
            title: handyGIF.chooseImg,
            button: {
                text: handyGIF.chooseImg
            },
            library: {type: 'image/gif'},
            multiple: false
        });

        aphgAddGif_uploader.open();

        aphgAddGif_uploader.on('select', function () {

            attachment = aphgAddGif_uploader.state().get('selection').toJSON();
            var gifUrl = attachment[0].url;
            var stillGif = '';


            if (!(attachment[0].mime == 'image/gif')) {
                return true;
            }

            $.ajax({
                type: 'POST',
                url: handyGIF.url,
                dataType: "json",
                data: {
                    id: attachment[0].id,
                    action: 'aphg_create_still_gif',
                    nonce: handyGIF.nonce
                },
                success: function (res) {
                    if (!res) {
                        alert(handyGIF.alert);
                        return false;
                    }
                    stillGif = res;

                    aphg_insert_into_visual(stillGif, gifUrl)
                },
                error: function () {
                    alert(handyGIF.alert);
                }
            });


        })

    })


})
