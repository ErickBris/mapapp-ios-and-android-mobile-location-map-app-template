var
	// Log manager
	Log = new ( require("/MT2/Log") )("NavigationBar"),

	NavigationBar;

NavigationBar = function(options){
	var
		title = (options.image)
			? getTitleLogo(options.image)
			: getTitleLabel(options.text, options),

		container = ui.create("View", Ti.UI.createView, {
			top    : 0,
			width  : Ti.UI.FILL,
			height : 47
		}),
		navBar = ui.create("View", Ti.UI.createView, {
			top    : -1,
			left   : -1,
			right  : -1,
			height : 45,
			backgroundColor : options.backgroundColor || "#fff"
		}),

		topShadow, flexSpace, navBarItems;

	if(options.leftButton){
		options.leftButton.left = 5;
		options.leftButton.top = 0;
		navBar.add(options.leftButton);
	}

	if(options.rightButton){
		options.rightButton.right = 5;
		options.rightButton.top = 0;
		navBar.add(options.rightButton);
	}

	container.add(navBar);
	container.add(title);

	if(options.showShadow){
 		topShadow = createDropShadow(options.dropShadowColor);
		topShadow.top = 44;
		container.add(topShadow);
	}

	return container;
};

function getTitleLabel(title, options){
	var
		label = ui.create("Label", Ti.UI.createLabel, {
			text      : title,
			height    : 44,
			left      : 50,
			right     : 50,
			wordWrap  : false,
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
			color     : options.fontColor,
			font : {
				fontFamily : options.fontFamily,
				fontSize   : options.fontSize,
				fontWeight : options.fontWeight
			}
		});

	return label;
}

function getTitleLogo(image){
	var
		image = ui.create("ImageView", Ti.UI.createImageView, {
			image  : image,
			height : 44,
			width  : Ti.UI.SIZE
		}),
		container = ui.create("View", Ti.UI.createView, {
			left  : 50,
			right : 50,
			top   : 0
		});

	container.add(image);

	return container;
}

function createDropShadow(bgColor, bottom, height){

	var shadow = ui.create("View", Ti.UI.createView, {
		height : height || 3,
		backgroundGradient: {
			type : "linear",
			startPoint : {
				x: "0%",
				y: (bottom) ? "100%" : "0%"
			},
			endPoint : {
				x: "0%",
				y: (bottom) ? "0%" : "100%"
			},
			colors: [
				{ color : bgColor, offset : 0.0},
				{ color : "transparent", offset : 1.0 }
			]
		},
		opacity : 0.4,
		width : Ti.UI.FILL
	});

	shadow[bottom ? "bottom" : "top"] = 0;

	return shadow;
}


module.exports = function(){
	ui.register("NavigationBar", NavigationBar);
};