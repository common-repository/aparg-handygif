jQuery(document).ready(function ($) {

    /*
     *
     * validation for admin screen
     */
    $('#save-settings').click(function () {
        var valid = true;

        if (aphgCheckInput() == false) {
            valid = false;
        }

        if (!valid) {
            return false;
        }

    });
    function aphgCheckInput() {
        var check = true;
        var match = true;
        $('input[type="text"]').each(function () {

            var value = $(this).val();
            if ($(this).attr('id') == 'aphg-hot-key') {
                match = value.match(/^[a-z]$/g) ? true : false;
                if (!match) {
                    $(this).parent('td').find('span').text(handyGIF.hotKeyText)
                } else {
                    $(this).parent('td').find('span').text('')
                }
            } else if ($(this).attr('id') == 'aphg-gif-bot') {
                match = value.match(/^[a-z]{2,5}$/g) ? true : false;
                 if (!match) {
                    $(this).parent('td').find('span').text(handyGIF.botText)
                } else {
                    $(this).parent('td').find('span').text('')
                }
            }
            if (!match) {
                check = false;
                $(this).addClass('aphg-invalid');
            } else {
                $(this).removeClass('aphg-invalid');
            }


        })
        return check;
    }


});
  