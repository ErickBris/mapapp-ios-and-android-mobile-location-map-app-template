// Application Root Window

var
	Log = new ( require("/MT2/Log") )("RootWindow"),
	RootWindow, Window;

/**
 *
 */
RootWindow = function(aWindow) {

	if(util.IPAD){ }
	else if(util.IOS){
		Window = Ti.UI.iOS.createNavigationWindow({
			navBarHidden : true,
			window : aWindow
		});
	}
	else{
		Window = aWindow;
	}

	return Window;
};

module.exports = RootWindow;
