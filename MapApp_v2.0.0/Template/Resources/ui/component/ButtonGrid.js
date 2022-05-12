// Button Grid Module

var
	// Log manager
	Log = new ( require("/MT2/Log") )("ButtonGrid"),

	ButtonGrid;

(require("/ui/component/FlatButton"))();

ButtonGrid = function(options){
	var
		view = ui.create("View", Ti.UI.createView, {
			width : options.width || Ti.UI.FILL,
			height : options.height || Ti.UI.FILL,
			backgroundColor : options.backgroundColor
		}),
		tileButtonOne = ui.create("FlatButton", "GridButton", {
			label : L("directions"),
			backgroundColor : "#eee",
			icon : "Globe",
			width : "50%",
			height : "50%",
			eventData : {
				location : options.location
			},
			singleTap : function(){
				directions(options.location);
			}
		}),
		tileButtonTwo = ui.create("FlatButton", "GridButton", {
			label : L("call"),
			backgroundColor : "#eee",
			icon : "Phone",
			width : "50%",
			height : "50%",
			eventData : {
				location : options.location
			},
			singleTap : function(){
				call(options.location);
			}
		}),
		tileButtonThree = ui.create("FlatButton", "GridButton", {
			label : L("save"),
			backgroundColor : "#eee",
			icon : "Plus",
			width : "50%",
			height : "50%",
			eventData : {
				location : options.location
			},
			singleTap : function(){
				save(options.location);
			}
		}),
		tileButtonFour = ui.create("FlatButton", "GridButton", {
			label : L("mail"),
			backgroundColor : "#eee",
			icon : "Envelope",
			width : "50%",
			height : "50%",
			eventData : {
				location : options.location
			},
			singleTap : function(){
				mail(options.location);
			}
		}),
		verticalSeperator = ui.create("View", Ti.UI.createView, {
			top : "7%",
			left : "50%",
			height : "86%",
			width : 1,
			backgroundColor : "#999"
		}),
		horizontalSeperator = ui.create("View", Ti.UI.createView, {
			top : "50%",
			left : "7%",
			height : 1,
			width : "86%",
			backgroundColor : "#999"
		}),
		tilesWrapper = Ti.UI.createView({
			height : Ti.UI.FILL,
			width : Ti.UI.FILL
		}),
		buttonTiles = Ti.UI.createView({
			height : Ti.UI.FILL,
			width : Ti.UI.FILL,
			layout : "horizontal"
		});

	buttonTiles.add(tileButtonOne);
	buttonTiles.add(tileButtonTwo);
	buttonTiles.add(tileButtonThree);
	buttonTiles.add(tileButtonFour);

	tilesWrapper.add(buttonTiles);
	tilesWrapper.add(verticalSeperator);
	tilesWrapper.add(horizontalSeperator);

	view.add(tilesWrapper);

	return view;
}

function directions(location){
	var
		currLocation = util.CurrentLocation.lat + "," + util.CurrentLocation.lon,
		destLocation = (location.latitude && location.longitude) ?
			location.latitude + "," + location.longitude :
			"0,0",
		address = location.street +
			"+" + location.city +
			"+" + location.state +
			"+" + location.zip,
		destination;

	destination = (destLocation==="0,0") ? address : destLocation;

	url = (
		(util.IOS) ?
			"http://maps.apple.com/?saddr=" + currLocation + "&daddr=" + destination :
			"geo:" + destLocation + "?q=" + destination + "(" + location.name + ")"
	);

	Log.info("currLocation: " + currLocation);
	Log.info("destLocation: " + destLocation);
	Log.info("address: " + address);
	Log.info("url: " + url);

	if(util.IOS){
		if(Ti.Platform.canOpenURL(url)){
			Ti.Platform.openURL(url);
		}
		else{
			Ti.UI.createAlertDialog({
				title : L("appName"),
				message : L("directionsError")
			}).show();
		}
	}
	else{
		mapIntent = Ti.Android.createIntent({
			action : Ti.Android.ACTION_VIEW,
			data : url
		});

		try{
			Ti.Android.currentActivity.startActivity(mapIntent);
		}
		catch(e){
			Log.error("Directions activity error");
			Log.error(e);

			Ti.UI.createAlertDialog({
				title : L("appName"),
				message : L("directionsError")
			}).show();
		}

	}
}

function call(location){
	var url = "tel:" + location.phone;

	try{
		Ti.Platform.openURL(url);
		// if (globals.iOS) {
		// 	globals.navGroup.closeWindow(window);
		// }
		// else{
		// 	window.close();
		// }
	}
	catch(e){
		Ti.UI.createAlertDialog({
			title : L("appName"),
			message : L("phoneError")
		}).show();
	}
}

function mail(location){
	var
		emailDialog = Ti.UI.createEmailDialog(),
		destLocation = (location.latitude && location.longitude) ?
			location.latitude + "," + location.longitude :
			"0,0",
		address = location.street + " " +
			location.city + ", " +
			location.state + " " +
			location.zip,
		url = "http://map.google.com/?q=" +
			((destLocation!=="0,0") ? encodeURIComponent(destLocation) : encodeURIComponent(address));

	emailDialog.subject = L("shareEmailSubject");
	emailDialog.messageBody = L("shareEmailBody") + "\n\n" + location.name + ":\n" + url;
	emailDialog.open();
}

function save(location){
	var
		performAddressBookFunction = function(){
			var contact = {
				"organization" : location.name,
				"address" : {
					"work" : [{
						"CountryCode" : location.countryCode,
						"Street" : location.street,
						"City" : location.city,
						"County" : location.county,
						"State" : location.state,
						"Country" : location.country,
						"ZIP" : location.zip
					}]
				},
				"phone" : {
					"work" : [ location.phone ]
				}
			};

			Ti.Contacts.createPerson(contact);

			Ti.UI.createAlertDialog({
				title : L("appName"),
				message : location.name + " " + L("contactAdded")
			}).show();
		},

		addressBookDisallowed = function(){
			Ti.UI.createAlertDialog({
				title : L("appName"),
				message : L("contactsError")
			}).show();
		};

	if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_AUTHORIZED){
		performAddressBookFunction();
	}
	else if (Ti.Contacts.contactsAuthorization == Ti.Contacts.AUTHORIZATION_UNKNOWN){
		Ti.Contacts.requestAuthorization(function(e){
			if (e.success) {
				performAddressBookFunction();
			}
			else {
				addressBookDisallowed();
			}
		});
	}
}

module.exports = function(){
	ui.register("ButtonGrid", ButtonGrid);
};
