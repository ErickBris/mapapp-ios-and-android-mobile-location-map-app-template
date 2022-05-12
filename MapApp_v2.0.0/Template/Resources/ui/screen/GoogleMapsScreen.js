// Google Maps WebView Screen

var
	Log = new ( require("/MT2/Log") )("GoogleMapsScren"),
	LocationManager = require("/lib/LocationManager");

// Add any widget dependencies
(require("/MT2/ui/screen/WebScreen"))();

module.exports = function(enableFullscreen, offset) {
	var
		mapHTML = "/html/map.html",
		GoogleMapsScreen = ui.create("WebScreen", {
			title : L("appName"),
			showShadow : true,
			navAsLayer : true,
			properties : {
				scalesPageToFit : false,
				url : mapHTML
			}
		}),
		closeButton = ui.create("Label", Ti.UI.createLabel, "CloseIcon", "NavButton", {
			top : 0,
			right : 0,
			backgroundColor : "#fff",
			visible : false,
			font : {
				fontSize : "26sp"
			}
		}),
		BrowserWindow = ui.create("Window", Ti.UI.createWindow, {
			backgroundColor : "#fff",
			navBarHidden : true
		}),
		InfoWindow = ui.create("Window", Ti.UI.createWindow, {
			backgroundColor : "#fff",
			navBarHidden : true
		}),
		navBar = GoogleMapsScreen.getNavBar(),
		isInStreetView = false,
		navBarVisible = true,
		webview, annotations = [], locations;

	GoogleMapsScreen.add(closeButton);

	function init(aLocation){
		var
			annotationParams = {
				latitude : aLocation.latitude,
				longitude : aLocation.longitude,
				title : aLocation.name,
				location : aLocation
			};

		annotations.push(annotationParams);
	}

	webview = GoogleMapsScreen.getWebView();

	locations = LocationManager.get();

	function toggleNavBar(){
		if(navBarVisible){
			navBar.animate(
				{ top : -67, duration : 400 },
				function(){
					navBarVisible = false;
				}
			);
		}
		else{
			navBar.animate(
				{ top : 0, duration : 400 },
				function(){
					navBarVisible = true;
				}
			);
		}
	}

	closeButton.addEventListener(
		"click",
		function(){
			Log.info("@#$@#$%@#%#$");
			Log.info(Ti.Platform.displayCaps.platformHeight);
			Log.info(util.HEIGHT);
			Log.info("Close Street View Button Clicked!! isInStreetView=" + isInStreetView);
			if(isInStreetView) {
				Log.info("GoogleMap::CLOSE_STREET_VIEW");
				Ti.App.fireEvent( "GoogleMap::CLOSE_STREET_VIEW" );
			}
		}
	);

	Ti.App.addEventListener(
		"GoogleMapHTML::STREET_VIEW_VISIBLE",
		function(e){
			isInStreetView = e.visible;
			if(isInStreetView){
				closeButton.visible =  true;
			}
			else{
				closeButton.visible =  false;
			}
			toggleNavBar();
			enableFullscreen(isInStreetView);
		}
	);

	webview.addEventListener(
		"beforeload",
		function(e){

			var
				backButton = ui.create("Label", Ti.UI.createLabel, "BackIcon", "NavButton"),
				BrowserScreen,
				urlArr,
				title;

			if(!Ti.Network.getOnline()){
				ui.create("AlertDialog", Ti.UI.createAlertDialog, {
					title : L("appName"),
					message : L("googleMapError")
				}).show();
				return;
			}

			if(e.url.indexOf(mapHTML)<0 && externalUrl!=e.url){
				webview.stopLoading();
				externalUrl = e.url;

				urlArr = externalUrl.split("://");

				if (urlArr.length>1){
					title = urlArr[1];
				}
				else{
					title = urlArr[0];
				}

				BrowserScreen = ui.create("WebScreen", {
					title : title,
					showShadow : true,
					leftButton : backButton,
					properties : {
						scalesPageToFit : false,
						url : externalUrl
					}
				});

				backButton.addEventListener(
					"click",
					function(){
						if (util.IOS) {
							appRoot.closeWindow(BrowserWindow);
						}
						else{
							BrowserWindow.close();
						}
					}
				);

				BrowserWindow.add(BrowserScreen.getScreenView());

				if(util.IOS){
					appRoot.openWindow(BrowserWindow);
				}
				else{
					BrowserWindow.open();
				}
			}
			else{
				externalUrl = "";
			}
		}
	);

	webview.addEventListener(
		"load",
		function(){
			if(util.CurrentLocation.lat && util.CurrentLocation.lon){
				Ti.App.fireEvent(
					"GoogleMap::CURRENT_LOCATION_READY",
					{
						lat : util.CurrentLocation.lat,
						lon : util.CurrentLocation.lon,
						mapType : config.MapType,
						zoom : config.MapZoom,
						apiKey : config.GoogleMapAPIKey,
						mapOffset : offset
					}
				);
			}

			Ti.App.addEventListener(
				util.Event.CurrentLocation,
				function(e){
					Ti.App.fireEvent(
						"GoogleMap::CURRENT_LOCATION_READY",
						{
							lat : util.CurrentLocation.lat,
							lon : util.CurrentLocation.lon,
							mapType : config.MapType,
							zoom : config.MapZoom,
							apiKey : config.GoogleMapAPIKey,
							mapOffset : offset
						}
					);
				}
			);

			for(var x=0, len=locations.length;x<len;x++){
				init(locations[x]);
			}

			Ti.App.fireEvent(
				"GoogleMap::LOCATION_MARKERS_READY",
				{ markers : annotations }
			);
		}
	);

	webview.addEventListener(
		"error",
		function(e){
			Ti.API.error(e.error);
			Ti.UI.createAlertDialog({
				title : L("appName"),
				message : L("googleMapError")
			}).show();
		}
	);

	return GoogleMapsScreen;
};
