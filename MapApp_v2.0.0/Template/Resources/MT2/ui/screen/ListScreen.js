var
	// Log manager
	Log = new ( require("/MT2/Log") )("ListScreen"),

	ListScreen;

// Add any widget dependencies
(require("/MT2/ui/screen/Screen"))();

ListScreen = function(options){
	var
		templateNames = options.templates || [options.template || "default"],

		// Create Screen
		screenView = ui.create("Screen", {
			title           : options.title || "",
			showShadow      : options.showShadow,
			backgroundColor : "transparant",
			navBarHidden : options.navBarHidden || false,
			height : options.height,
			bottom : options.bottom
		}),
		bgView =  ui.create("View", Ti.UI.createView, {
			backgroundColor : options.backgroundColor,
			opacity : 0.8,
			width : Ti.UI.FILL,
			top : 0,
			bottom : 0
		}),

		loadingView = ui.create("View", Ti.UI.createView, {
			backgroundColor : "transparant",
			top : 0,
			bottom : 0
		}),

		spinner = ui.create("Label", Ti.UI.createLabel, "SpinnerIcon", "NavButton"),

		templates = {},

		matrix = ui.create("2DMatrix", Ti.UI.create2DMatrix, {}),

		spinAnimation = ui.create("Animation", Ti.UI.createAnimation, {
			duration : 20
		}),

		listView;


	if(options.rightButton) screenView.rightButton = options.rightButton;
	if(options.leftButton) screenView.leftButton = options.leftButton;

	templateNames.forEach(function(template){
		try{
			templates[template] = require(config.ListTemplatesPath + template);
		}
		catch(e){
			console.error(
				"ListScreen:: Can not load " + template + " list template\n" +
				config.ListTemplatesPath + template
			);
		}
	});

	options.props.ListView.templates = templates;

	listView = ui.create("ListView", Ti.UI.createListView, options.props.ListView);

	listView.addEventListener("itemclick", function(e){
		options.clickHandler(e);
	});

	function spinIt(view){
		matrix = matrix.rotate(3);
		spinAnimation.transform = matrix;
		view.animate(spinAnimation);
	}

	spinAnimation.addEventListener("complete", function(e) {
		spinIt(spinner);
	});

	spinIt(spinner);

	loadingView.add(spinner);

	screenView.add(bgView);
	screenView.add(listView);
	screenView.add(loadingView);


	return {
		"getListView" : function(){
			return listView;
		},
		"getScreenView" : function(){
			return screenView.getScreenView();
		},
		"getNavBar" : function(){
			return screenView.getNavBar();
		},
		"add" : function(){
			for(var i=0,l=arguments.length;i<l;i++){
				screenView.add(arguments[i]);
			}
		},
		"remove" : function(){
			for(var i=0,l=arguments.length;i<l;i++){
				screenView.remove(arguments[i]);
			}
		},
		"loading" : function(){
			screenView.add(loadingView);
		},
		"done" : function(){
			screenView.remove(loadingView);
		}
	}

};

module.exports = function(){
	ui.register("ListScreen", ListScreen);
};
