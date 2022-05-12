// Location Window

var
	Log = new ( require("/MT2/Log") )("LocationWindow"),
	GoogleMapsScreen = require("/ui/screen/GoogleMapsScreen"),
	LocationListView = require("/ui/view/LocationListView"),
	LocationManager = require("/lib/LocationManager"),
	LocationWindow;

//::TODO:: turn map and list modules into widgets
(require("/MT2/ui/screen/WebScreen"))();

// Add any widget dependencies
// (require("/ui/screen/GoogleMapsScreen"))();
// (require("/ui/view/LocationListView"))();

function getMapOffset(){
	var
		listHeightVal = ui.getProps("LocationList").height,
		listHeightPercent = (parseInt(listHeightVal, 10)+30) * 0.01, // add 30 for category height
		listHeightPx = Math.floor(util.HEIGHT * listHeightPercent.toFixed(2)),
		mapCenter = util.HEIGHT/2;

	if(config.AdMob){
		listHeightPx -= 50;
		mapCenter -= 50;
	}

	// make sure to remove navbar height (47)
	return (mapCenter - Math.floor(listHeightPx/2)) + 47;
}

LocationWindow = function(){

	var
		window = ui.create("Window", Ti.UI.createWindow, {
			exitOnClose : true,
			title : L("appName"),
			navBarHidden : true
		}),
		ListView = new LocationListView(),
		MapScreen = new GoogleMapsScreen(
			function(isInStreetView){

				if(isInStreetView && !listViewVisible){
					keepListViewHidden = true;
					return;
				}

				if(!keepListViewHidden){
					toggleLocationList(isInStreetView);
				}

			},
			getMapOffset()
		),
		InfoWindow = ui.create("Window", Ti.UI.createWindow, {
			backgroundColor : "#fff",
			navBarHidden : true
		}),
		listButton = ui.create(
			"Label",
			Ti.UI.createLabel,
			"ListIcon",
			"MapButton",
			{
				color : "#aaa",
				top : 10,
				backgroundColor : "#fff"
			}
		),
		locateButton = ui.create(
			"Label",
			Ti.UI.createLabel,
			"LocationIcon",
			"MapButton",
			{
				color : "#aaa",
				top : 10,
				backgroundColor : "#fff"
			}
		),
		infoButton = ui.create(
			"Label",
			Ti.UI.createLabel,
			"InfoIcon",
			"MapButton",
			{
				color : "#aaa",
				top : 10,
				backgroundColor : "#fff"
			}
		),
		mapButtonView = ui.create("View", Ti.UI.createView, {
			layout : "vertical",
			right : 8,
			top : 50,
			height : Ti.UI.SIZE,
			width : Ti.UI.SIZE
		}),
		locations = LocationManager.get(),
		ListViewObj = ListView.getScreenView(),
		listViewVisible = true,
		keepListViewHidden = false,
		Admob, adView, adReceived;

	mapButtonView.add(locateButton);
	mapButtonView.add(infoButton);
	mapButtonView.add(listButton);

	window.add(MapScreen.getScreenView());

	if(config.AdMob){
		Admob = require("ti.admob");
		adView = Admob.createView({
			bottom : -50,
			width : Ti.UI.FILL,
			height : 50,
			backgroundColor : "#000",
			adUnitId: config.AdMobAdUnitId,
			keyworkds : config.AdMobKeywords
		});

		if(config.isSimulator){
			adView.testDevices = [Admob.SIMULATOR_ID];
		}

		adView.addEventListener(
			Admob.AD_RECEIVED || "didReceiveAd",
			function(e){
				if(adReceived) { return; }
				adReceived = true;
				adView.animate({
					bottom : 0,
					duration : 750
				});

				ListViewObj.animate({
					bottom : 50,
					duration : 750
				}, function(){
					MapScreen.getScreenView().bottom = 50;
				});
			}
		);

		adView.addEventListener(
			Admob.AD_NOT_RECEIVED || "didFailToReceiveAd",
			function(e){
				console.error("Error recieving Admob ad");
			}
		);
	}

	function toggleLocationList(hideList){
		var listBottom = (config.AdMob) ? 50 : 0;
		if(listViewVisible || hideList){
			ListViewObj.animate(
				{ bottom : -util.HEIGHT, duration : 400 },
				function(){
					listViewVisible = false;
				}
			);
		}
		else{
			ListViewObj.animate(
				{ bottom : listBottom, duration : 400 },
				function(){
					listViewVisible = true;
					keepListViewHidden = false;
				}
			);
		}
	}

	function loadInfoScreen(){

		var
			backButton = ui.create("Label", Ti.UI.createLabel, "BackIcon", "NavButton"),
			infoScreen = ui.create("WebScreen", {
				title : L("info"),
				showShadow : true,
				leftButton : backButton,
				properties : {
					scalesPageToFit : false,
					url : config.InfoURL
				}
			});

		InfoWindow.add(infoScreen.getScreenView());

		backButton.addEventListener(
			"click",
			function(){
				if (util.IOS) {
					appRoot.closeWindow(InfoWindow);
				}
				else{
					InfoWindow.close();
				}
			}
		);

		if(util.IOS){
			appRoot.openWindow(InfoWindow);
		}
		else{
			InfoWindow.open();
		}
	}

	locateButton.addEventListener("click", function(){
		var offset = getMapOffset();

		// adjust for ad height
		// after map resize during ad animation
		if(config.AdMob){
			offset -= 25;
		}

		Ti.App.fireEvent(
			"GoogleMap::PAN_TO_LOCATION",
			{
				lat : util.CurrentLocation.lat,
				lon : util.CurrentLocation.lon,
				mapOffset : offset
			}
		);
	});

	infoButton.addEventListener( "click", loadInfoScreen);

	Ti.App.addEventListener(
		"GoogleMapHTML::STREET_VIEW_VISIBLE",
		function(e){
			var isInStreetView = e.visible;
			if(isInStreetView){
				mapButtonView.visible =  false;
			}
			else{
				mapButtonView.visible =  true;
			}
		}
	);

	listButton.addEventListener(
		"click",
		function(){
			toggleLocationList();
		}
	);

	// default to all locations
	ListView.getListView().fireEvent("SetList", { rows : locations });

	window.add(mapButtonView);
	window.add(ListViewObj);
	if(config.AdMob){
		window.add(adView);
	}

	return window;
}

module.exports = LocationWindow;
