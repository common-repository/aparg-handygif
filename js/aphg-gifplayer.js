(function ($) {

    function GifPlayer(preview, options) {
        this.previewElement = preview;
        this.options = options;
        this.animationLoaded = false;
    }

    GifPlayer.scopes = new Array();

    GifPlayer.prototype = {
        supportedFormats: ['gif', 'jpeg', 'jpg', 'png'],
        activate: function () {
            var self = this;
            if (this.previewElement.width() === 0) {
                setTimeout(function () {
                    self.activate();
                }, 100);
            } else {
                self.mode = self.getOption('mode');
                self.wrap();
                self.addSpinner();
                self.addControl();
                self.addEvents();
            }
        },
        wrap: function () {
            this.previewElement.addClass('aphg-gifplayer-ready');
            var wrap_classes = this.previewElement.attr('class').split(' ').filter(function (index) {
                return index.trim().indexOf('aphg') === -1;
            })

            this.wrapper = this.previewElement.wrap("<div class='aphg-gifplayer-wrapper " + wrap_classes.join(' ') + "'></div>").parent();
            this.wrapper.css('width', this.previewElement.width());
            this.wrapper.css('height', this.previewElement.height());

        },
        addSpinner: function () {
            this.spinnerElement = $("<div class = 'aphg-spinner'></div>");
            this.wrapper.append(this.spinnerElement);
            this.spinnerElement.hide();
        },
        getOption: function (option) {
            var dataOption = this.previewElement.data(option.toLowerCase());
            if (dataOption != undefined && dataOption != '') {
                return dataOption;
            } else {
                return this.options[option];
            }
        },
        addControl: function () {
            var label = this.getOption('label');
            this.playElement = $("<span class='aphg-play-gif'>" + label + "</span>");
            this.wrapper.append(this.playElement);

        },
        addEvents: function () {
            var gp = this;
            var playOn = gp.previewElement.attr('data-playon')
            playOn = playOn ? playOn : "click";
            switch (playOn) {
                case 'click':
                    gp.playElement.on('click', function (e) {
                        gp.previewElement.trigger('click');
                    });
                    gp.previewElement.on('click', function (e) {
                        gp.loadAnimation();
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    break;
                case 'hover':
                    gp.previewElement.on('mouseover', function (e) {
                        gp.loadAnimation();
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    break;
                case 'view':
                    gp.previewElement.off('gifView.aphg').on('gifView.aphg', function (e) {
                        gp.loadAnimation();
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    break;
                default:
                    console.log(playOn + ' is not accepted as playOn value.');
            }
        },
        processScope: function () {
            var scope = this.getOption('scope');
            if (scope) {
                if (GifPlayer.scopes[scope]) {
                    GifPlayer.scopes[scope].stopGif();
                }
                GifPlayer.scopes[scope] = this;
            }
        },
        loadAnimation: function () {
            this.processScope();

            this.spinnerElement.show();

            if (this.mode == 'gif') {
                this.loadGif();
            } else if (this.mode == 'video') {
                if (!this.videoLoaded) {
                    this.loadVideo();
                } else {
                    this.playVideo();
                }

            }
            // Fire event onPlay
            this.getOption('onPlay').call(this.previewElement);
        },
        stopGif: function () {
            this.gifElement.hide();
            this.previewElement.show();
            this.playElement.show();
            this.resetEvents();
            this.getOption('onStop').call(this.previewElement);
        },
        getFile: function (ext) {
            // Obtain the resource default path
            var gif = this.getOption(ext);
            if (gif != undefined && gif != '') {
                return gif;
            } else {
                replaceString = this.previewElement.attr('src');

                for (i = 0; i < this.supportedFormats.length; i++) {
                    pattrn = new RegExp(this.supportedFormats[i] + '$', 'i');
                    replaceString = replaceString.replace(pattrn, ext);
                }

                return replaceString;
            }
        },
        loadGif: function () {
            var gp = this;

            gp.playElement.hide();

            if (!this.animationLoaded) {
                this.enableAbort();
            }
            var gifSrc = this.getFile('gif');
            var gifWidth = this.previewElement.width();
            var gifHeight = this.previewElement.height();

            this.gifElement = $("<img class='aphg-gp-gif-element'  width='" + gifWidth + "' height=' " + gifHeight + " '/>");

            var wait = this.getOption('wait');
            wait = true;
            if (wait) {
                //Wait until gif loads
                this.gifElement.load(function () {
                    gp.animationLoaded = true;
                    gp.resetEvents();
                    gp.previewElement.hide();
                    gp.wrapper.append(gp.gifElement);
                    gp.spinnerElement.hide();
                    gp.getOption('onLoadComplete').call(gp.previewElement);
                });
            } else {
                //Try to show gif instantly
                gp.animationLoaded = true;
                gp.resetEvents();
                gp.previewElement.hide();
                gp.wrapper.append(gp.gifElement);
                gp.spinnerElement.hide();
            }

            this.gifElement.css('position', 'absolute');
            this.gifElement.css('top', '0');
            this.gifElement.css('left', '0');
            this.gifElement.css('width', gifWidth);
            this.gifElement.css('height', gifHeight);
            this.gifElement.attr('src', gifSrc);
            if (this.previewElement.attr('data-playon') === 'click') {
                this.gifElement.on('click', function (e) {
                    $(this).remove();
                    gp.stopGif();
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
            if (this.previewElement.attr('data-playon') === 'hover') {
                this.gifElement.on('mouseout', function (e) {
                    $(this).remove();
                    gp.stopGif();
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
            if (this.previewElement.attr('data-playon') === 'view') {
                this.gifElement.off('gifView.aphg').on('gifView.aphg', function (e) {
                    $(this).remove();
                    gp.stopGif();
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
            gp.getOption('onLoad').call(gp.previewElement);
        },
        loadVideo: function () {
            this.videoLoaded = true;

            var videoSrcMp4 = this.getFile('mp4');
            var videoSrcWebm = this.getFile('webm');
            var videoWidth = this.previewElement.width();
            var videoHeight = this.previewElement.height();

            this.videoElement = $('<video class="aphg-gp-video-element" width="' +
                    videoWidth + 'px" height="' + videoHeight + '" style="margin:0 auto;width:' +
                    videoWidth + 'px;height:' + videoHeight + 'px;" autoplay="autoplay" loop="loop" muted="muted" poster="' +
                    this.previewElement.attr('src') + '"><source type="video/mp4" src="' +
                    videoSrcMp4 + '"><source type="video/webm" src="' + videoSrcWebm + '"></video>');

            var gp = this;

            var checkLoad = function () {
                if (gp.videoElement[0].readyState === 4) {
                    gp.playVideo();
                    gp.animationLoaded = true;
                } else {
                    setTimeout(checkLoad, 100);
                }
            };

            var wait = this.getOption('wait');
            if (wait) {
                checkLoad();
            } else {
                this.playVideo();
            }

            this.videoElement.on('click', function () {
                if (gp.videoPaused) {
                    gp.resumeVideo();
                } else {
                    gp.pauseVideo();
                }
            });
        },
        playVideo: function () {
            this.spinnerElement.hide();
            this.previewElement.hide();
            this.playElement.hide();

            this.gifLoaded = true;
            this.previewElement.hide();
            this.wrapper.append(this.videoElement);
            this.videoPaused = false;
            this.videoElement[0].play();
            this.getOption('onPlay').call(this.previewElement);
        },
        pauseVideo: function () {
            this.videoPaused = true;
            this.videoElement[0].pause();
            this.playElement.show();
            this.mouseoverEnabled = false;
            this.getOption('onStop').call(this.previewElement);
        },
        resumeVideo: function () {
            this.videoPaused = false;
            this.videoElement[0].play();
            this.playElement.hide();
            this.getOption('onPlay').call(this.previewElement);
        },
        enableAbort: function () {
            var gp = this;
            this.previewElement.click(function (e) {
                gp.abortLoading(e);
            });
            this.spinnerElement.click(function (e) {
                //gp.abortLoading(e);
            });
        },
        abortLoading: function (e) {
            this.spinnerElement.hide();
            this.playElement.show();
            e.preventDefault();
            e.stopPropagation();
            this.gifElement.off('load').on('load', function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            });
            this.resetEvents();
            this.getOption('onStop').call(this.previewElement);
        },
        resetEvents: function () {
            this.previewElement.off('click');
            this.previewElement.off('mouseover');
            this.playElement.off('click');
            this.spinnerElement.off('click');
            this.addEvents();
        }

    };

    $.fn.apargGifplayer = function (options) {
        var thiz = this
        $(window).on('scroll.gifplay',function () {

            thiz.each(function () {
                if ($(this).attr('data-playon') === 'view') {
                    var that = $(this);

                    if (aphg_isScrolledIntoView(this)) {
                        if (that.attr('data-played') !== "true") {
                            that.attr('data-played', 'true');
                            that.trigger('gifView');
                        }

                    } else {
                        that.attr('data-played', 'false');
                        that.siblings('.aphg-gp-gif-element').trigger('gifView');

                    }
                }
            })
        });
       
        // Check if we should operate with some method
        if (/^(play|stop)$/i.test(options)) {

            return this.each(function () {
                // Normalize method's name
                options = options.toLowerCase();
                if ($(this).hasClass('aphg-gifplayer-ready')) {
                    //Setup gifplayer object
                    var gp = new GifPlayer($(this), null);
                    gp.options = {};
                    gp.options = $.extend({}, $.fn.apargGifplayer.defaults, gp.options);
                    gp.wrapper = $(this).parent();
                    gp.spinnerElement = gp.wrapper.find('.aphg-spinner');
                    gp.playElement = gp.wrapper.find('.aphg-play-gif');
                    gp.gifElement = gp.wrapper.find('.aphg-gp-gif-element');
                    gp.videoElement = gp.wrapper.find('.aphg-gp-video-element');
                    gp.mode = gp.getOption('mode');

                    switch (options) {
                        case 'play':
                            gp.playElement.trigger('click');
                            break;
                        case 'stop':
                            if (!gp.playElement.is(':visible')) {
                                if (gp.mode == 'gif') {
                                    gp.stopGif();
                                } else if (gp.mode == 'video') {
                                    gp.videoElement.trigger('click');
                                }
                            }
                            break;
                    }
                }
            });

        } else { //Create instance
            return this.each(function () {
                options = $.extend({}, $.fn.apargGifplayer.defaults, options);
                var gifplayer = new GifPlayer($(this), options);
                gifplayer.activate();
            });
        }
    };

    $.fn.apargGifplayer.defaults = {
        label: 'GIF',
        playOn: 'click',
        mode: 'gif',
        gif: '',
        mp4: '',
        webm: '',
        wait: false,
        scope: false,
        onPlay: function () {
        },
        onStop: function () {
        },
        onLoad: function () {
        },
        onLoadComplete: function () {
        }
    };



})(jQuery);
