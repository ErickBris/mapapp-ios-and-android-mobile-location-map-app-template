var
	// Log manager
	Log = new ( require("/MT2/Log") )("Screen"),

	Screen, undef;

// Add any widget dependencies
(require("/MT2/ui/component/NavigationBar"))();

Screen = function(options){
	var screenView = ui.create("View", Ti.UI.createView, {
			top  : options.top,
			left : options.left,
			width : options.width || util.width,
			height : options.height,
			bottom : options.bottom
		}),
		container = ui.create("View", Ti.UI.createView, {
			top : (options.navAsLayer) ? 0 : 44,
			layout : options.layout || "composite"
		}),
		navBar;

	if(options.backgroundColor){
		container.backgroundColor = options.backgroundColor;
	}

	screenView.add(container);

	if(!options.navBarHidden){

		navBar = ui.create("NavigationBar", {
			text : options.title || "",
			image : options.titleImage || undef,
			leftButton : options.leftButton || undef,
			rightButton : options.rightButton || undef,
			navBarBackgroundColor : options.navBarBackgroundColor,
			dropShadowColor : "#000",
			showShadow : options.showShadow
		});

		screenView.add(navBar);
	}
	else{
		container.top = 0;
	}

	return {
		"getScreenView" : function(){
			return screenView;
		},
		"getNavBar" : function(){
			return navBar || undef;
		},
		"add" : function(){
			for(var i=0,l=arguments.length;i<l;i++){
				container.add(arguments[i]);
			}
		},
		"remove" : function(){
			for(var i=0,l=arguments.length;i<l;i++){
				container.remove(arguments[i]);
			}
		}
	};
};

module.exports = function(){
	ui.register("Screen", Screen);
};
