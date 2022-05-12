// Slider
"use strict";

var _navHeight       = 20,
	_opacity         = 0.5,
	_captionHeight   = 25,
	_captionFontSize = 14,
	_black           = "#000",
	_white           = "#fff",
	_scrollDelay     = 4000,
	_extKey          = "$", //keyword used to extend returned Ti objects
	_youTubeUrl      = [
		"http://www.youtube-nocookie.com/embed/", 
		"?autoplay=1&autohide=1&cc_load_policy=0&color=white&controls=0&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0"
	],
	_vimeoUrl        = [
		"http://player.vimeo.com/video/", 
		"?title=0&byline=0&portrait=0"
	],
	_videoEmbedHTML  = [
		'<!DOCTYPE html>\n<html><head><meta name="viewport" content="initial-scale=1.0,maximum-scale=1.0,user-scalable=no"></head>' +
		'<body style="margin:0;padding:0;"><iframe width="', '" height="', '" src="',
		'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></body></html>'
	],
	_NAV_STYLE       = {
		BLOCK  : "block",
		CIRCLE : "circle"
	},
	_VIDEO_TYPE = {
		YOUTUBE : "youtube",
		VIMEO   : "vimeo"
	},
	_EVENT = {
		"SlideAnimationEnd" : "SLIDER::SlideAnimationEnd",
		"SlideSingleTap"    : "SLIDER::SlideSingleTap"
	};

/**
 * @method create
 * Creates a slider component.
 * @param {Object} options Optional settings for slider object
 * @return {Ti.UI.View}
 *
 */
exports.create = function(options){
	var 
		//*** Main UI Components

		container  = Ti.UI.createView({
			width  : options.width  || Ti.UI.FILL,
			height : options.height || Ti.UI.FILL,
			top    : options.top,
			right  : options.right,
			bottom : options.bottom,
			left   : options.left,
			backgroundColor : options.backgroundColor || _black
		}),
		navigation = Ti.UI.createView({
			height    : _navHeight,
			width     : Ti.UI.SIZE,
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
			layout    : "horizontal"
		}),
		scrollableView = Ti.UI.createScrollableView({
			showPagingControl : false,
			width             : Ti.UI.FILL,
			height            : Ti.UI.FILL,
			disableBounce     : options.disableBounce || false,
			backgroundColor   : options.backgroundColor || _black
		}),

		//*** Local variables

		navigationPageControls = [],
		slideBlocks = [],
		currentPage = 0,
		isScrolling = false,
		isSlideBlocksAnimating = false,
		disableAutoScroll = false,
		autoScrollTimeout, caption, aView, aSlide, aBlock, aImage;

	//*** Local helper functions

	// Used in auto scrolling timer to trigger next slide
	function autoScroll(){
		if(isScrolling || disableAutoScroll){ return; }

		if(container.isSlideBlocksAnimating){
			//Delay auto scroll
			setAutoScroll(500);
			return;
		}

		if(currentPage<options.slides.length-1){
			scrollableView.scrollToView(currentPage+1);
		}
		else{
			scrollableView.scrollToView(0);
		}
	};

	// Trigger timer for next autoScroll call
	function setAutoScroll(timerOverride){
		autoScrollTimeout && clearTimeout(autoScrollTimeout);
		autoScrollTimeout = setTimeout(autoScroll, timerOverride || options.delay || _scrollDelay);
	};

	// Initialize slide behavior (animations, caption, video, etc...)
	function initSlide(viewSlide){
		var webView;

		if(slideBlocks[currentPage]){ initSlideBlocks(viewSlide, slideBlocks[currentPage], container); }
		if(options.auto && !isScrolling){ setAutoScroll(); }
		if(viewSlide.caption){
			if(!caption){
				caption = createCaptionView(
					viewSlide.caption,
					options.navigation && options.navigation.backgroundColor || _black,
					options.navigation.selectedColor
				);
				caption[options.navigation.onTop ? "top" : "bottom"] = options.navigation ? _navHeight : 0;
				container.add(caption);
			}
			else{
				caption.updateCaption(viewSlide.caption);
				caption.visible = true;
			}
			
		}
		if(viewSlide.videoId){
			webView = Ti.UI.createWebView({
				width              : Ti.UI.FILL,
				height             : Ti.UI.FILL,
				backgroundColor    : options.backgroundColor || _black,
			 	enableZoomControls : false,
				scalesPageToFit    : false,
				scrollsToTop       : false,
				showScrollbars     : false
			});

			if(Ti.Platform.osname == "android"){
				webView.pluginState = Ti.UI.Android.WEBVIEW_PLUGINS_ON_DEMAND;
			}

			webView.html = _videoEmbedHTML[0] + 
				container.rect.width +
				_videoEmbedHTML[1] + 
				container.rect.height +
				_videoEmbedHTML[2] + 
				getVideoUrl(viewSlide.videoId, viewSlide.videoType) +
				 _videoEmbedHTML[3];

			viewSlide.add(webView);
		}
	};

	//*** Create Slides

	if(options.slides){
		for(var i=0, len=options.slides.length; i<len; i++){
			aSlide = options.slides[i];

			if(aSlide.image){
				aView = options.maxZoomScale ? 
					Ti.UI.createScrollView({
						width  : Ti.UI.FILL,
						height : Ti.UI.FILL,
						maxZoomScale : options.maxZoomScale
					}) :
					Ti.UI.createView({
						width  : Ti.UI.FILL,
						height : Ti.UI.FILL
					});

				aImage = Ti.UI.createImageView({
					image   : aSlide.image,
					enableZoomControls : (options.maxZoomScale) ? true : false,
					width   : (options.scale) ? Ti.UI.FILL : options.width,
					height  : (options.scale) ? Ti.UI.FILL : options.height
				});

				aView.add(aImage);

				aImage.slideImage = true;
				aImage.currentPage = i;

				aImage.addEventListener(
					"singletap",
					function(e){
						if(e.source.slideImage){
							container.fireEvent(
								_EVENT.SlideSingleTap, 
								{ "slideType" : "image", "currentPage" : e.source.currentPage }
							);
						}

					}
				);
			}
			else if(aSlide.view){
				aView = aSlide.view;
				aView.slideView = true;
				aView.currentPage = i;

				aView.addEventListener(
					"singletap",
					function(e){
						if(e.source.slideView){
							container.fireEvent(
								_EVENT.SlideSingleTap,
								{ "slideType" : "video", "currentPage" : e.source.currentPage }
							);
						}

					}
				);
			}
			else if(aSlide.video){
				aView = Ti.UI.createView({
					width  : Ti.UI.FILL,
					height : Ti.UI.FILL
				});
				aView.videoId = aSlide.video;
				aView.videoType = aSlide.type;
			}

			if(aSlide.caption){ aView.caption = aSlide.caption; }
			else{ aView.caption = false; }

			scrollableView.addView(aView);

			if(aSlide.blocks){
				for(var x=0, l=aSlide.blocks.length; x<l; x++){
					aBlock = aSlide.blocks[x];

					if(!slideBlocks[i]){
						slideBlocks[i] = [];
					}

					if(aBlock.moveFrom || aBlock.fade){
						aBlock.hasAnimation = true;
						aBlock.animation = Ti.UI.createAnimation();
						aBlock.animation.duration = aBlock.duration || 1000;
						aBlock.animation.delay = aBlock.delay || 100;
						aBlock.offset = aBlock.offset || 10;
						if(aBlock.moveFrom){
							aBlock.startPosition = parseInt(aBlock.view[aBlock.moveFrom] || 0);
							aBlock.animation[aBlock.moveFrom] = aBlock.startPosition + aBlock.offset;
						}
						if(aBlock.fade){
							aBlock.view.opacity = 0;
							aBlock.animation.opacity = 1;
						}

					}
					else{
						aBlock.hasAnimation = false;
					}
					slideBlocks[i][x] = aBlock;
				}
			}
			else{
				slideBlocks[i] = false;
			}

			if(options.navigation){
				navigationPageControls.push(
					createNavPage(
						(i==0) ? options.navigation.selectedColor : options.navigation.color,
						options.navigation.borderColor || options.navigation.selectedColor,
						options.navigation.showBorder,
						options.navigation.style || _NAV_STYLE.CIRCLE
					)
				);
				navigation.add(navigationPageControls[i]);
			}
		}
	}

	//*** Event Handlers

	function scrollEndHandler(e){
		isScrolling = false;
		if(e.view){ initSlide(e.view); }
	}

	function scrollHandler(e){
		if("currentPage" in e){
			if(
				!isScrolling 
				&& currentPage==e.currentPage
			){
				if(slideBlocks[currentPage]){ removeSlideBlocks(e.view, slideBlocks[currentPage]); }
				if(e.view && e.view.videoId){
					e.view.remove(e.view.children[0]);
				}
			}

			if(currentPage!=e.currentPage){
				if(caption){ caption.visible = false; }
				if(options.navigation){
					navigationPageControls[currentPage].backgroundColor = options.navigation.color;
					navigationPageControls[e.currentPage].backgroundColor = options.navigation.selectedColor;
				}
			}

			currentPage = e.currentPage;
		}
		isScrolling = true;
	}

	function orientationChangeHandler(e){
		isScrolling = false;
		if(options.auto){ setAutoScroll(); }
	}

	scrollableView.addEventListener( "scrollEnd", scrollEndHandler );
	scrollableView.addEventListener( "scroll", scrollHandler );
	Ti.Gesture.addEventListener( "orientationchange", orientationChangeHandler );

	//*** Assemble UI

	container.add(scrollableView);

	if(options.navigation){

		_opacity = options.navigation.opacity || _opacity;

		aView = Ti.UI.createView({
			width   : Ti.UI.FILL,
			opacity : _opacity,
			height  : _navHeight,
			bottom  : 0,
			backgroundColor : options.navigation.backgroundColor || _black
		});
		aView[options.navigation.onTop ? "top" : "bottom"] = 0;
		navigation[options.navigation.onTop ? "top" : "bottom"] = 0;
		container.add(aView);
		container.add(navigation);
		aView = null;
	}

	//*** Custom ViewScrollr 'Methods'

	container[_extKey] = {
		/**
		 * @method stop
		 * Disable auto scrolling
		 */
		stop : function(){
			disableAutoScroll = true;
		},
		/**
		 * @method start
		 * enable auto scrolling & caption animations
		 */
		start : function(){
			disableAutoScroll = false;
			initSlide(scrollableView.getViews()[currentPage]);
		},
		/**
		 * @method getScrollableView
		 * Get reference to the Ti.UI.ScrollableView object
		 * @return {Ti.UI.ScrollableView}
		 */
		getScrollableView : function(){
			return scrollableView;
		}
	};

	return container;
};

//*** Set Public Constants

exports.NAV_STYLE   = _NAV_STYLE;
exports.EVENT       = _EVENT;
exports.VIDEO_TYPE  = _VIDEO_TYPE;

//*** Private Utility Funcitons

// Set slide block to pre-animation state
function resetBlock(block){
	var settings = {};
	if(block.moveFrom){
		settings[block.moveFrom] = block.startPosition;
	}
	if(block.fade){
		settings.opacity = 0;
	}
	block.view.applyProperties(settings);
}

// Initialize behavior for each slide block (display & animate)
function initSlideBlocks(slide, blocks, container){
	var count        = 0,
		currentBlock = blocks[0],
		lastBlock,
		handler = function(e){
			lastBlock = blocks[count-1];

			if(lastBlock.hasAnimation){ lastBlock.animation.removeEventListener("complete", handler); }

			if(count<blocks.length){
				currentBlock = blocks[count];
				if(!currentBlock.hasAnimation){
					count++;
					handler(e);
					return;
				}
				currentBlock.animation.addEventListener("complete",handler);
				currentBlock.view.animate(currentBlock.animation);
				count++;
			}
			else{
				container.isSlideBlocksAnimating = false;
				container.fireEvent(_EVENT.SlideAnimationEnd);
			}
		};

	for(var x=0, l=blocks.length; x<l; x++){
		slide.add(blocks[x].view);
	}

	if(currentBlock.hasAnimation){
		container.isSlideBlocksAnimating = true;
		currentBlock.animation.addEventListener("complete",handler);
		currentBlock.view.animate(currentBlock.animation);
		count++;
	}
}

// Clean up all blocks from slide
function removeSlideBlocks(slide, blocks){
	var aBlock;
	for(var x=0, l=blocks.length; x<l; x++){
		aBlock = blocks[x];
		resetBlock(aBlock);
		slide.remove(aBlock.view);
	}
}

function createCaptionView(text, bgColor, color){
	var view = Ti.UI.createView({
			height : _captionHeight,
			width  : Ti.UI.FILL
		}),
		background = Ti.UI.createView({
			opacity : _opacity,
			width   : Ti.UI.FILL,
			height  : Ti.UI.FILL,
			backgroundColor : bgColor
		}),
		label = Ti.UI.createLabel({
			text      : text,
			color     : color || _white,
			font      : { fontSize : _captionFontSize },
			height    : Ti.UI.FILL,
			width     : Ti.UI.FILL,
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
		});

	view.add(background);
	view.add(label);

	view.updateCaption = function(text){
		label.text = text;
	}

	return view;
}

function createNavPage(color, borderColor, showBorder, style){
	return Ti.UI.createView({
		backgroundColor : color,
		width           : 8,
		height          : 8,
		top             : 6,
		right           : 4,
		borderWidth     : showBorder ? 1 : 0,
		borderColor     : borderColor,
		borderRadius    : (style===_NAV_STYLE.CIRCLE) ? 4 : 0
	});
}

function getVideoUrl(id, type){
	switch(type){
		case _VIDEO_TYPE.YOUTUBE :
			return _youTubeUrl[0] + id + _youTubeUrl[1];
		break;
		case _VIDEO_TYPE.VIMEO :
			return _vimeoUrl[0] + id + _vimeoUrl[1]
		break;
	}
}