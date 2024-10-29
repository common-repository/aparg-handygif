jQuery(window).load(function () {

    /*
     * turning gifplayer
     */
    jQuery('.aphg-gif').apargGifplayer({
        onPlay: function () {

            if (jQuery(this).hasClass('aphg-gpu-acceleration')) {
                jQuery(this).siblings('.aphg-gp-gif-element').addClass('aphg-gpu-acceleration');
            }
            if (jQuery(this).attr('onclick')) {
                var gifOnclik = $(this).attr('onclick');
                jQuery(this).siblings('.aphg-gp-gif-element').attr('onclick', gifOnclik);
            }
        },
    });

    /*
     * play on view
     */
    jQuery(window).trigger('scroll.gifplay');



});

/*
 * function for detecting img in view
 */
function aphg_isScrolledIntoView(elem, partial) {

    if (jQuery(elem).length == 0)
        return false;

    /*custom case for gif image*/
    if (jQuery(elem).css('display') === 'none') {
        elem = jQuery(elem).siblings('.aphg-gp-gif-element').length ? jQuery(elem).siblings('.aphg-gp-gif-element').get(0) : elem;
    }
    var docViewTop = jQuery(window).scrollTop();
    var docViewBottom = docViewTop + jQuery(window).height();

    var elemTop = jQuery(elem).offset().top;
    var elemBottom = elemTop + jQuery(elem).height();
    var elemHeight = jQuery(elem).height();
    if (elemHeight <= jQuery(window).height()) {
        return (((elemBottom - (elemHeight * 30) / 100) <= docViewBottom) && ((elemTop + (elemHeight * 30) / 100) >= docViewTop));
    } else {
        return ((elemBottom <= docViewBottom && (elemBottom - (elemHeight * 30) / 100) >= docViewTop) || (elemTop >= docViewTop && (elemTop + (elemHeight * 30) / 100) < docViewBottom) || (elemTop <= docViewTop && elemBottom >= docViewBottom));
    }

}    