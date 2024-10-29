/**
 * * === function for getting carret index===
 * 
 * @param {type} el
 * @returns {Number|re@call;duplicate.text.length}
 */
function aphg_get_caret(el) {
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        el.focus();

        var r = document.selection.createRange();
        if (r == null) {
            return 0;
        }

        var re = el.createTextRange(),
                rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return rc.text.length;
    }
    return 0;
}

(function () {
    var shiftCheck, keyCode, flag, ctrlCheck, atIndex;
    var keyCodes = {
        "a": 65,
        "b": 66,
        "c": 67,
        "d": 68,
        "e": 69,
        "f": 70,
        "g": 71,
        "h": 72,
        "i": 73,
        "j": 74,
        "k": 75,
        "l": 76,
        "m": 77,
        "n": 78,
        "o": 79,
        "p": 80,
        "q": 81,
        "r": 82,
        "s": 83,
        "t": 84,
        "u": 85,
        "v": 86,
        "w": 87,
        "x": 88,
        "y": 89,
        "z": 90,
    }



    jQuery(document).off("keydown.qtags").on("keydown.qtags", function (e) {
        if (jQuery(e.target).siblings().find("input[id*='apargHandyGifButton']").length) {//Qtags etitor onkedown event
            ctrlCheck = e.ctrlKey;
            keyCode = e.keyCode;
            shiftCheck = e.shiftKey;

            if (e.ctrlKey && e.keyCode == keyCodes[ handyGIF.settings.hotKey]) {
                window.aphg_qtags_active_editor = e.target;
                aphg_create_popup('default', jQuery(e.target));
            }
        }

    })
    jQuery(document).off('keyup.qtags').on("keyup.qtags", function (e) {
        if (jQuery(e.target).siblings().find("input[id*='apargHandyGifButton']").length) {//Qtags onkedown event

            if (!ctrlCheck)
                jQuery('.aphg-white-content').remove();

            if (keyCode == 50 && shiftCheck) {
                flag = true;
                atIndex = aphg_get_caret(e.target) - 1;

            }

            if (flag) {
                var currentCaret = aphg_get_caret(e.target);
                var text = jQuery(e.target).val();
                var botIndex = atIndex + handyGIF.settings.gifBot.length + 1;
                var botText = text.substring(atIndex, botIndex);
                if (botText == '@' + handyGIF.settings.gifBot && currentCaret === botIndex) {
                    jQuery('body').attr('data-bot', true);
                    window.aphg_qtags_active_editor = e.target;
                    aphg_create_popup('default', jQuery(e.target));
                    //  flag = false;
                }
            }


        }

    })

})()
/*
 * medialibrary popup
 */
var aphgAddimgUploader;
jQuery(document).on("click", "#aphg-medialibrary-button", function (e) {
    e.preventDefault();
    var gifAction = jQuery(".aphg-white-content input[type='radio']:checked").val();
    jQuery('.aphg-white-content').remove();
    aphgAddimgUploader = wp.media.frames.file_frame = wp.media({
        title: handyGIF.chooseImg,
        button: {
            text: handyGIF.chooseImg
        },
        library: {type: 'image/gif'},
        multiple: false
    });

    aphgAddimgUploader.open();

    aphgAddimgUploader.on('select', function () {

        attachment = aphgAddimgUploader.state().get('selection').toJSON();
        var gifUrl = attachment[0].url;
        var stillGif = '';
        var gifUrl = attachment[0].url;

        if (!(attachment[0].mime == 'image/gif')) {
            return true;
        }

        jQuery.ajax({
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

                    return false;
                }
                stillGif = res;
                aphg_insert_from_media(stillGif, gifUrl, 'media', gifAction)

            },
            error: function () {
                alert(handyGIF.alert);
            }
        });


    })


});


/*
 * Closeing Popup
 */

jQuery(document).on("click", "#aphg-popup-close", function () {
    jQuery('.aphg-white-content').remove();
});




/*
 * inserting gif to editor 
 */
jQuery(document).off('click.tinMCE').on('click.tinMCE', '.aphg-popup-gif', function (e) {
    if (jQuery(e.target).closest('#aphg-visual-parent').length) {
        return false;
    }
    var gifAction = jQuery(".aphg-white-content input[type='radio']:checked").val();
    aphg_insert_from_media(jQuery(this).attr('data-still'), jQuery(this).attr('data-link'), 'gifApi', gifAction, jQuery(this).attr('data-editor'));
    jQuery('.aphg-white-content').remove();
})

/*
 * popup search field 
 */
var aphg_set_key_timeout;
jQuery(document).on('keyup', '#aphg-shearch-bar', function () {
    clearTimeout(aphg_set_key_timeout)
    aphg_set_key_timeout = setTimeout(function () {

        aphg_gif_ajax('#aphg-gif-conteiner');

    }, 350)


})

/*
 * functon for inserting GIF from media library and  API
 */

function aphg_insert_from_media(stillGif, gifUrl, insertFlag, gifAction, editor_type) {
    var gpuAcceleration = handyGIF.settings.gifGpu == 'on' ? 'aphg-gpu-acceleration' : '';
    var img_value = '';

    switch (gifAction) {
        case "hover":
            img_value = '<img class="aphg-front-gif ' + gpuAcceleration + ' aphg-gif " style="width:auto;height:auto;"  src="' + stillGif + '" data-playon="hover"  data-gif="' + gifUrl + '" alt=""/>';
            break;
        case "click":
            img_value = '<img class="aphg-front-gif ' + gpuAcceleration + ' aphg-gif " style="width:auto;height:auto;" src="' + stillGif + '"  data-playon="click"  data-gif="' + gifUrl + '" alt=""/>';
            break;
        case "view" :
            img_value = '<img  class="aphg-front-gif ' + gpuAcceleration + ' aphg-gif " style="width:auto;height:auto;" src="' + stillGif + '" data-playon="view"  data-gif="' + gifUrl + '" alt=""/>';
            break;
        default:
            img_value = '<img class="aphg-front-gif ' + gpuAcceleration + '" style="width:auto;height:auto;" src="' + gifUrl + '"  alt=""/>';
    }

    /*
     * bot support 
     */
    if (jQuery('body').attr('data-bot') == 'true') {
        jQuery('body').attr('data-bot', 'false');
        if (editor_type != 'default') {
            var ed = tinyMCE.activeEditor;
            var spanId = tinymce.DOM.uniqueId();
            var span = '<span id="' + spanId + '"></span>';
            ed.execCommand('mceInsertContent', 0, span);
            var text = tinyMCE.activeEditor.getContent();
            var index = text.search(span.trim());
            var botIndex = index - (handyGIF.settings.gifBot.length);
            var changedText = text.slice(0, botIndex) + text.slice(index);
            ed.setContent(changedText);
            var newNode = ed.dom.select('span#' + spanId);
            ed.selection.select(newNode[0]);
        } else {
            var ed = window.aphg_qtags_active_editor;
            var text = jQuery(ed).val();
            var index = aphg_get_caret(ed);
            var botIndex = (index - 1) - (handyGIF.settings.gifBot.length);
            var changedText = text.slice(0, botIndex) + img_value + text.slice(index);
            jQuery(ed).val(changedText);
            return;
        }
    }
    if (insertFlag == "media") {
        wp.media.editor.insert(img_value);
    } else if (insertFlag == "gifApi") {
        if (editor_type != 'default') {
            tinyMCE.activeEditor.execCommand('mceInsertContent', 0, img_value);
        } else {
            var ed = window.aphg_qtags_active_editor;
            var text = jQuery(ed).val();
            var index = aphg_get_caret(ed);
            var changedText = text.slice(0, index) + img_value + text.slice(index);
            jQuery(ed).val(changedText);
        }
    }
}


/*
 * function for creating popup and it's functionality
 */

function aphg_create_popup(editor_type, editor) {
    var tinymcePosition, toolbarPosition, caretPosition, popupCord, x, absolutelCord, y;
    if (!editor_type) {//===== tinyMCE editor ======
        /*
         * getting tinymce cursor possition
         */

        var ed = tinyMCE.activeEditor;

        tinymcePosition = jQuery(ed.getContainer()).offset();
        var tinymceRelPosition = jQuery(ed.getContainer()).position();
        toolbarPosition = jQuery(ed.getContainer()).find(".mce-toolbar").first();

        var nodePosition = jQuery(ed.selection.getNode()).position();
        var textareaTop = 0;
        var textareaLeft = 0;
        ed.selection.getBookmark(2, true);
        if (ed.selection.getRng().getClientRects().length > 0) {
            textareaTop = ed.selection.getRng().getClientRects()[0].top + ed.selection.getRng().getClientRects()[0].height;
            textareaLeft = ed.selection.getRng().getClientRects()[0].left;
        } else if (ed.selection.getRng().startOffset == 0) {
            textareaTop = parseInt(jQuery(ed.selection.getNode()).css("font-size")) * 1.3 + nodePosition.top;
            textareaLeft = nodePosition.left;
        } else {
            var boxChilds = ed.selection.getRng().startContainer.childNodes

            if (typeof boxChilds[ed.selection.getRng().endOffset - 1] == 'undefined' || typeof boxChilds[ed.selection.getRng().endOffset - 1].getBoundingClientRect == 'undefined') {
                textareaTop = parseInt(jQuery(ed.selection.getNode()).css("font-size")) * 1.3 + nodePosition.top;
                textareaLeft = nodePosition.left;
            } else {
                var elemetBox = boxChilds[ed.selection.getRng().endOffset - 1].getBoundingClientRect();
                textareaTop = elemetBox.top + elemetBox.height;
                textareaLeft = elemetBox.left + elemetBox.width;
            }
        }

        var position = jQuery(ed.getContainer()).offset();
        caretPosition = {
            top: tinymcePosition.top + toolbarPosition.innerHeight() + textareaTop,
            left: tinymceRelPosition.left + textareaLeft + position.left
        }
        popupCord = caretPosition.top + 408;
        x;
        absolutelCord = jQuery(window).height() + jQuery(window).scrollTop();
        var popTop = jQuery(window).height() - (absolutelCord - caretPosition.top);

        if (absolutelCord >= popupCord) {

            x = popTop;

        } else {
            if ((popTop + 408) > jQuery(window).height()) {
                x = popTop - (430 - (jQuery(window).height() - popTop));
            } else {
                x = popTop - 350;
            }


        }
        x = x <= 0 ? 20 : x;
        y = caretPosition.left;

    } else {
        tinymcePosition = jQuery(editor).offset();
        toolbarPosition = jQuery(editor).getCaretPosition();

        var top = (tinymcePosition.top + toolbarPosition.top);

        top = (top <= 0) ? tinymcePosition.top + toolbarPosition.top : top;

        caretPosition = {
            top: top,
            left: tinymcePosition.left + toolbarPosition.left}
        popupCord = caretPosition.top + 408;
        absolutelCord = jQuery(window).height() + jQuery(window).scrollTop();
        var popTop = jQuery(window).height() - (absolutelCord - caretPosition.top);
        if (absolutelCord >= popupCord) {

            x = popTop;

        } else {
            if ((popTop + 408) > jQuery(window).height()) {
                x = popTop - (430 - (jQuery(window).height() - popTop));

            } else {
                x = popTop - 350;
            }


        }
        x = x <= 0 ? 20 : x;
        y = caretPosition.left;
    }

    jQuery('.aphg-white-content').remove();
    jQuery('body').append('<div class="aphg-white-content" style="top:' + x + 'px;left:' + y + 'px;">\n\
<div id="aphg-gif-conteiner" class="aphg-loader-layer"> </div> <a id="aphg-popup-close"> <span class="aphg-close">×</span></a> \n\
<div><input type="text" placeholder="' + handyGIF.search + '" id="aphg-shearch-bar"/>\n\
<div id="aphg-media-buttons" class="wp-media-buttons">\n\
<button type="button" id="aphg-medialibrary-button" class="button  add_media" data-editor="content"><span class="wp-media-buttons-icon"></span>\n\
</button></div></div>\n\
<div class="aphg-popup-radiobutton-div">\n\
<span class="aphg-play-on"> <b>' + handyGIF.playOn + '</b></span>\n\
<input type="radio" id="aphg-on-hover" value="hover" name="action">\n\
<label for="aphg-on-hover"> ' + handyGIF.hover + ' </label>\n\
<input type="radio" id="aphg-on-click" value="click" name="action">\n\
<label for="aphg-on-click"> ' + handyGIF.click + ' </label>\n\
<input type="radio" value="view" id="aphg-on-view"  name="action"><label for="aphg-on-view"> ' + handyGIF.view + ' </label>\n\
</div>\n\
</div>');


    jQuery(".aphg-white-content").draggable({
        cancel: "#aphg-gif-conteiner,input,.aphg-popup-radiobutton-div",
        containment: 'window'
    });
    aphg_gif_ajax('#aphg-gif-conteiner');
    aphg_gif_ajax.editor_type = editor_type;
    jQuery('#aphg-gif-conteiner').off('scroll').on('scroll', function (e) {
        var elem = jQuery(e.currentTarget);
        if (elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()) {

            if (!aphg_no_gifs_found) {
                jQuery('#aphg-gif-conteiner').find('.aphg-loader-block').remove();
                jQuery('#aphg-gif-conteiner').append('<p class="aphg-loader-block"></p>');

                aphg_gif_ajax('#aphg-gif-conteiner', true);
                aphg_gif_ajax.editor_type = editor_type;
            }
        }

    })
}




/*
 *  GIF API ajax call function  
 */
var aphg_cursor, aphg_no_gifs_found, aphg_ajax_request;
function aphg_gif_ajax(gifConteiner, offsetFlag, resoltFlag) {
    offsetFlag = offsetFlag || false;
    if (!offsetFlag) {
        if (aphg_ajax_request) {
            aphg_ajax_request.abort();
        }
        jQuery(gifConteiner).empty();
        jQuery(gifConteiner).addClass('aphg-loader-layer');
        aphg_cursor = false;
    }
    /*========== API CREDENTIALS =============*/
    var trending = false, client_secret, client_id;

    if (handyGIF.settings.client_id === '' || handyGIF.settings.client_secret === '') {
        trending = true;
    } else {
        client_secret = handyGIF.settings.client_secret;
        client_id = handyGIF.settings.client_id;
    }


    var titleSuggestion = jQuery('#title').val();
    var categorySuggestion = "";
    var tagsSuggestion = "";
    var searchBar;
    if (gifConteiner == '#aphg-gif-conteiner') {
        searchBar = jQuery('#aphg-shearch-bar').val();
    } else {
        searchBar = jQuery('#aphg-visual-input').val();
    }
    var data = {}, url, value;

    jQuery(".categorydiv").find('input[type="checkbox"]:checked').each(function () {
        var catergoryLabel = jQuery(this).parent('label').text().trim();
        if (catergoryLabel.toLowerCase() != "uncategorized" && categorySuggestion.indexOf(catergoryLabel) === -1) {
            categorySuggestion += catergoryLabel + ' ';
        }

    });
    jQuery(".tagsdiv .tagchecklist>*").each(function () {
        if (jQuery(this).contents().get(2)) {
            tagsSuggestion += jQuery(this).contents().get(2).nodeValue + " ";
        }

    })

    if (resoltFlag) {
        titleSuggestion = categorySuggestion = tagsSuggestion = '';
    }
    if (searchBar) {
        if (trending) {
            searchBar = searchBar.trim();
            searchBar = searchBar.indexOf(' ') !== -1 ? searchBar.substr(0, searchBar.indexOf(' ')) : searchBar
            data = {
                'tagName': searchBar,
                'count': 15,
                'cursor': aphg_cursor
            }
            url = "https://api.gfycat.com/v1/gfycats/trending";
        } else {
            data = {
                'search_text': searchBar,
                'count': 15,
                'cursor': aphg_cursor,
                'client_secret': client_secret,
                'client_id': client_id,
                'action': 'aphg_get_gifs'
            };
            url = handyGIF.url;
        }
    } else {
        if (!titleSuggestion && !categorySuggestion && !tagsSuggestion) {
            data = {
                'count': 15,
                'cursor': aphg_cursor
            }

            url = "https://api.gfycat.com/v1/gfycats/trending";
        } else {
            tagsSuggestion = tagsSuggestion ? tagsSuggestion : "";
            titleSuggestion = titleSuggestion ? titleSuggestion : "";
            categorySuggestion = categorySuggestion ? categorySuggestion : "";
            if (titleSuggestion) {
                value = titleSuggestion;
            } else if (tagsSuggestion) {
                value = tagsSuggestion;

            } else {
                value = categorySuggestion;
            }
            if (trending) {
                value = value.trim();
                value = value.indexOf(' ') !== -1 ? value.substr(0, value.indexOf(' ')) : value
                data = {
                    'tagName': value,
                    'count': 15,
                    'cursor': aphg_cursor
                }
                url = "https://api.gfycat.com/v1/gfycats/trending";
            } else {
                data = {
                    'search_text': value,
                    'count': 15,
                    'cursor': aphg_cursor,
                    'action': 'aphg_get_gifs',
                    'client_secret': client_secret,
                    'client_id': client_id,
                };
                url = handyGIF.url;
            }
        }
    }
    /*
     * Ajax for Ghiphy api 
     */



    aphg_ajax_request = jQuery.ajax({
        data: data,
        url: url,
        type: "GET",
        dataType: 'json',
        success: function (response) {
            if (!offsetFlag) {
                jQuery(gifConteiner).empty();
            }

            aphg_cursor = response.cursor;


            if (searchBar && response.errorMessage == 'No search results' || (trending && response.gfycats && response.gfycats.length == 0)) {
                jQuery(gifConteiner).removeClass('aphg-loader-layer');
                jQuery(gifConteiner).find('p').remove();
                if (!offsetFlag) {
                    jQuery(gifConteiner).append('<p class="aphg-no-gifs">' + handyGIF.noGifsFound + '</p>');
                }
                aphg_no_gifs_found = true;
                return;
            } else {
                if ((!response.cursor && (!response.gfycats || !response.gfycats.length))) {
                    aphg_gif_ajax(gifConteiner, offsetFlag, true);
                    return false;
                }

                aphg_no_gifs_found = false;
                if (!response.cursor && (response.gfycats && response.gfycats.length) && searchBar || !response.cursor && (response.gfycats && response.gfycats.length < 15)) {
                    aphg_no_gifs_found = true;
                }
            }

            var new_image = new Image();
            new_image.onload = function () {

                jQuery(gifConteiner).removeClass('aphg-loader-layer');

            }
            new_image.onerror = function () {

            }
            new_image.src = response.gfycats[0].max1mbGif
            jQuery(gifConteiner).find('.aphg-loader-block').remove();
            for (var i = 0; i < response.gfycats.length; i++) {

                jQuery(gifConteiner).append('<img data-editor="' + aphg_gif_ajax.editor_type + '" class="aphg-popup-gif" src="' + response.gfycats[i].max1mbGif + '" data-link="' + response.gfycats[i].gifUrl + '"  data-still="' + (response.gfycats[i].posterUrl ? response.gfycats[i].posterUrl : response.gfycats[i].mobilePosterUrl) + '" alt=""/>')
            }


        },
        error: function () {
            jQuery(gifConteiner).removeClass('aphg-loader-layer');
            jQuery(gifConteiner).find('p').remove();
            jQuery(gifConteiner).append('<p class="aphg-no-gifs">' + handyGIF.wentWrong + '</p>');
        }
    });

}
/*Get cursor position from textarea*/

(function (jQuery, window, document, undefined) {
    jQuery(function () {
        var calculator = {
            // key styles
            primaryStyles: ['fontFamily', 'fontSize', 'fontWeight', 'fontVariant', 'fontStyle',
                'paddingLeft', 'paddingTop', 'paddingBottom', 'paddingRight',
                'marginLeft', 'marginTop', 'marginBottom', 'marginRight',
                'borderLeftColor', 'borderTopColor', 'borderBottomColor', 'borderRightColor',
                'borderLeftStyle', 'borderTopStyle', 'borderBottomStyle', 'borderRightStyle',
                'borderLeftWidth', 'borderTopWidth', 'borderBottomWidth', 'borderRightWidth',
                'line-height', 'outline'],
            specificStyle: {
                'word-wrap': 'break-word',
                'overflow-x': 'hidden',
                'overflow-y': 'auto'
            },
            simulator: jQuery('<div id="textarea_simulator" contenteditable="true"/>').css({
                position: 'absolute',
                top: 0,
                left: 0,
                visibility: 'hidden'
            }).appendTo(document.body),
            toHtml: function (text) {
                return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
                        .replace(/(\s)/g, '<span style="white-space:pre-wrap;">jQuery1</span>');
            },
            // calculate position
            getCaretPosition: function () {
                var cal = calculator, self = this, element = self[0], elementOffset = self.offset();

                // IE has easy way to get caret offset position
                if (jQuery.browser.msie) {
                    // must get focus first
                    element.focus();
                    var range = document.selection.createRange();
                    return {
                        left: range.boundingLeft - elementOffset.left,
                        top: parseInt(range.boundingTop) - elementOffset.top + element.scrollTop
                                + document.documentElement.scrollTop + parseInt(self.getComputedStyle("fontSize"))
                    };
                }
                cal.simulator.empty();
                // clone primary styles to imitate textarea
                jQuery.each(cal.primaryStyles, function (index, styleName) {
                    self.cloneStyle(cal.simulator, styleName);
                });

                // caculate width and height
                cal.simulator.css(jQuery.extend({
                    'width': self.width(),
                    'height': self.height()
                }, cal.specificStyle));

                var value = self.val(), cursorPosition = self.getCursorPosition();
                var beforeText = value.substring(0, cursorPosition),
                        afterText = value.substring(cursorPosition);

                var before = jQuery('<span class="before"/>').html(cal.toHtml(beforeText)),
                        focus = jQuery('<span class="focus"/>'),
                        after = jQuery('<span class="after"/>').html(cal.toHtml(afterText));

                cal.simulator.append(before).append(focus).append(after);
                var focusOffset = focus.offset(), simulatorOffset = cal.simulator.offset();
                // alert(focusOffset.left  + ',' +  simulatorOffset.left + ',' + element.scrollLeft);
                return {
                    top: focusOffset.top - simulatorOffset.top - element.scrollTop
                            // calculate and add the font height except Firefox
                            + (jQuery.browser.mozilla ? 0 : parseInt(self.getComputedStyle("fontSize"))),
                    left: focus[0].offsetLeft - cal.simulator[0].offsetLeft - element.scrollLeft
                };
            }
        };

        jQuery.fn.extend({
            getComputedStyle: function (styleName) {
                if (this.length == 0)
                    return;
                var thiz = this[0];
                var result = this.css(styleName);
                result = result || (jQuery.browser.msie ?
                        thiz.currentStyle[styleName] :
                        document.defaultView.getComputedStyle(thiz, null)[styleName]);
                return result;
            },
            // easy clone method
            cloneStyle: function (target, styleName) {
                var styleVal = this.getComputedStyle(styleName);
                if (!!styleVal) {
                    jQuery(target).css(styleName, styleVal);
                }
            },
            cloneAllStyle: function (target, style) {
                var thiz = this[0];
                for (var styleName in thiz.style) {
                    var val = thiz.style[styleName];
                    typeof val == 'string' || typeof val == 'number'
                            ? this.cloneStyle(target, styleName)
                            : NaN;
                }
            },
            getCursorPosition: function () {
                var thiz = this[0], result = 0;
                if ('selectionStart' in thiz) {
                    result = thiz.selectionStart;
                } else if ('selection' in document) {
                    var range = document.selection.createRange();
                    if (parseInt(jQuery.browser.version) > 6) {
                        thiz.focus();
                        var length = document.selection.createRange().text.length;
                        range.moveStart('character', -thiz.value.length);
                        result = range.text.length - length;
                    } else {
                        var bodyRange = document.body.createTextRange();
                        bodyRange.moveToElementText(thiz);
                        for (; bodyRange.compareEndPoints("StartToStart", range) < 0; result++)
                            bodyRange.moveStart('character', 1);
                        for (var i = 0; i <= result; i++) {
                            if (thiz.value.charAt(i) == '\n')
                                result++;
                        }
                        var enterCount = thiz.value.split('\n').length - 1;
                        result -= enterCount;
                        return result;
                    }
                }
                return result;
            },
            getCaretPosition: calculator.getCaretPosition
        });
    });
})(jQuery, window, document);