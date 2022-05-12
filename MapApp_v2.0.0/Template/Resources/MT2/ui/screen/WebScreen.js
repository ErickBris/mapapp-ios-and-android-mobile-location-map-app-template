var
	// Log manager
	Log = new ( require("/MT2/Log") )("WebScreen"),

	WebScreen, undef;

// Add any widget dependencies
(require("/MT2/ui/screen/Screen"))();

WebScreen = function(options){
	var
		// Create Screen
		screenView = ui.create("Screen", {
			title : options.title || "",
			navBarHidden : options.navBarHidden,
			backgroundColor : options.backgroundColor,
			rightButton : options.rightButton || undef,
			leftButton : options.leftButton || undef,
			showShadow : options.showShadow || true,
			navAsLayer : options.navAsLayer
		}),
		webview = ui.create("WebView", Ti.UI.createWebView, options.properties);

	screenView.add(webview);

	return {
		"getWebView" : function(){
			return webview;
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
		"load" : function(opts){
			if(opts.url){
				webview.setUrl(opts.url);
			}
			else if(opts.html){
				webview.setHtml(opts.html);
			}
			else{
				Log.error("Missing url or html for load()\n" + opts);
			}
		}
	}
};

module.exports = function(){
	ui.register("WebScreen", WebScreen);
};
