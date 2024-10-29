
jQuery(document).ready(function ($) {
    /*
     * set value for event type 
     */
   
    $("#aphg-radiobutton-parent input[type='radio']").change(function () {
        $('#aphg-visual-radio-hidden').val($(this).val());
    })
})