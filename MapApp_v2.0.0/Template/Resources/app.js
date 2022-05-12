
// Global objects accessible across entire app (including modules)
var
	config = require("/MT2/Config"),
	util   = require("/MT2/Util"),
	cache  = require("/MT2/Cache"),
	ui     = require("/MT2/UI"),
	appRoot;

// Add custom params to global util object
util.CurrentLocation = {};

// Add custom constant to global util object
// for location updates
util.Event = {
	CurrentLocation : "MapApp::CurrentLocation"
};

(function(){

	var
		theme = require("/themes/" + config.theme + "/main"),
		Log = new ( require("/MT2/Log") )("App"),
		LocationManager = require("/lib/LocationManager"),
		LocationWindow = require("/ui/window/LocationWindow"),
		RootWindow = require("/ui/RootWindow");

	Ti.UI.setBackgroundColor("#fff");

	ui.registerProps(theme);

	LocationManager.load(function(err){
		if(err){
			return;
		}

		appRoot = new RootWindow(new LocationWindow());
		appRoot.open();
	});

})();
