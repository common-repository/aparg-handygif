(function ($) {

    tinymce.create('tinymce.plugins.aphg', {
        init: function (ed, url) {

            ed.addButton('handyGIF', {
                title: 'Insert Gif',
                cmd: 'handyGIF',
                image: handyGIF.icon_url
            });

            ed.addShortcut('ctrl+' + handyGIF.settings.hotKey + '', '', function () {
                aphg_create_popup();
            });
            var shiftCheck, keyCode, flag, ctrlCheck, atPosition, atIndex;
            /*
             * Checking tinymce version 
             */
            if (typeof ed.on == 'undefined') {

                ed.onKeyDown.add(function (ed, e) {
                    aphgKeydown(e);
                });
                ed.onKeyUp.add(function (e) {
                    aphgKeyUp(e)
                })

            } else {

                ed.on('KeyDown', function (e) {

                    aphgKeydown(e);
                });
                ed.on('KeyUp', function (e) {

                    aphgKeyUp(e)
                });
            }


            function aphgKeydown(e) {

                ctrlCheck = e.ctrlKey;
                keyCode = e.keyCode;
                shiftCheck = e.shiftKey;

            }
            function aphgKeyUp(e) {
                if (!ctrlCheck)
                    $('.aphg-white-content').remove();

                if (keyCode == 50 && shiftCheck) {
                    flag = true;
                    atIndex = ed.selection.getRng().startOffset - 1;
                }

                if (flag) {
                    var currentCaret = ed.selection.getRng().startOffset;
                    var text = ed.selection.getRng().endContainer.data;
                    if (text) {
                        var botIndex = atIndex + handyGIF.settings.gifBot.length + 1;
                        var botText = text.substring(atIndex, botIndex);
                        if (botText == '@' + handyGIF.settings.gifBot && currentCaret === botIndex) {
                            $('body').attr('data-bot', true);
                            aphg_create_popup();
                            //flag = false;
                        }
                    }
                }
            }

            ed.addCommand('handyGIF', function () {
                aphg_create_popup();
            });

        },
    });

    tinymce.PluginManager.add('aphg', tinymce.plugins.aphg);


})(jQuery);


