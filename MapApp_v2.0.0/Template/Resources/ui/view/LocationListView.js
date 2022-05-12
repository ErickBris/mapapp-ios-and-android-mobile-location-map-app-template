var
	// Log manager
	Log = new ( require("/MT2/Log") )("LocationListView"),
	LocationManager = require("/lib/LocationManager"),
	LocationDetailWindow = require("/ui/window/LocationDetailWindow");

// Add any widget dependencies
(require("/MT2/ui/screen/ListScreen"))();

module.exports = function() {
	var
		ListHeader = ui.create("View", Ti.UI.createView, {
			backgroundColor : "#ddd",
			height : 30,
			top : 1
		}),
		selectButton = ui.create(
			"Label",
			Ti.UI.createLabel,
			"AngleDownIcon",
			{
				color : "#aaa",
				width : 30,
				height : 30,
				textAlign : "center",
				font : {
					fontSize : "22sp"
				},
				left : 3
			}
		),
		selectedCategory = ui.create(
			"Label",
			Ti.UI.createLabel, {
				color : "#666",
				left : 30,
				height : 30,
				text : "All"
			}
		),
		selectorTop = ui.create("View", Ti.UI.createView, {
			top : 0,
			height : 1,
			backgroundColor: "#aaa",
			width : Ti.UI.FILL
		}),
		selectorBottom = ui.create("View", Ti.UI.createView, {
			top : 31,
			height : 3,
			backgroundGradient: {
				type : "linear",
				startPoint : {
					x: "0%",
					y: "0%"
				},
				endPoint : {
					x: "0%",
					y: "100%"
				},
				colors: [
					{ color : "#000", offset : 0.0},
					{ color : "transparent", offset : 1.0 }
				]
			},
			opacity : 0.4,
			width : Ti.UI.FILL
		}),
		LocationListScreen = ui.create("ListScreen", "LocationList", {
			template : "LocationRow",
			clickHandler : itemClickHandler,
			props : {
				ListView : {
					top : 30,
					separatorColor : "#000",
					backgroundColor : "transparent",
					separatorInsets : { left : 0, right : 0 },
					defaultItemTemplate : "LocationRow"
				}
			}
		}),
		listView = LocationListScreen.getListView(),
		CategorySelectWindow = ui.create("Window", Ti.UI.createWindow, {
			backgroundColor : "transparent",
			theme: "Theme.NoActionBar",
			top : 0
		}),
		categorySelectBG = ui.create("view", Ti.UI.createView, {
			backgroundColor : "#000",
			opacity : 0.7,
			top : 0,
			bottom : 0,
			width : Ti.UI.FILL
		}),
		categoryTable = ui.create("TableView", Ti.UI.createTableView, {
			backgroundColor:"#fff",
			width : "80%",
			height : "70%",
			separatorColor:"#d3d3d3",
			separatorInsets : { left : 0, right : 0 },
			borderRadius : 6,
			data : getCategories()
		});

	CategorySelectWindow.add(categorySelectBG);
	CategorySelectWindow.add(categoryTable);

	ListHeader.add(selectButton);
	ListHeader.add(selectedCategory);

	LocationListScreen.add(selectorTop);
	LocationListScreen.add(ListHeader);
	LocationListScreen.add(selectorBottom);

	function itemClickHandler(e){
		var LocationDetailWidnow = new LocationDetailWindow(e.itemId);

		if(!LocationDetailWidnow){
			Log.error("Error creating LocationDetailWidnow");
			return;
		}

		if (util.IOS) {
			appRoot.openWindow(LocationDetailWidnow);
		}
		else{
			LocationDetailWidnow.open();
		}
	}

	function getCategories(){
		var
			categoryRowsData = [],
			categories = LocationManager.getCategories();

		if(categories.length){
			categories.forEach(function(aCategory){
				categoryRowsData.push({
					title : aCategory,
					textAlign : "center",
					color : "#000",
					height: 44
				});
			});
		}

		return categoryRowsData;
	}

	Ti.App.addEventListener(
		"GoogleMapHTML::LOAD_LOCATION_DETAIL",
		function(e){
			itemClickHandler({
				itemId : e.location.location.name
			});
		}
	);

	categoryTable.addEventListener("click", function(e){
		listView.fireEvent(
			"SetList",
			{ rows : LocationManager.get(e.row.title), category : e.row.title }
		);
	});

	CategorySelectWindow.addEventListener("click", function(){
		CategorySelectWindow.close();
	});

	ListHeader.addEventListener("click", function(){
		CategorySelectWindow.open();
	})

	listView.addEventListener(
		"SetList",
		function(e){
			var
				section = ui.create("ListSection", Ti.UI.createListSection, {}),
				locations = e.rows,
				i = 0,
				locationListData = [],
				aLocation, listDataItem, distanceVal,
				converted, distanceType, dis;

			selectedCategory.text = (e.category) ? e.category : "All";

			for (len = locations.length; i < len; i++) {
				aLocation = locations[i];

				if(util.CurrentLocation.lat!=0){
					distanceVal = LocationManager.getDistance(
						aLocation.latitude,
						aLocation.longitude,
						util.CurrentLocation.lat,
						util.CurrentLocation.lon
					);

					converted = (config.Use_Miles) ? distanceVal * 0.000621371192 : distanceVal/1000;
					distanceType = (config.Use_Miles) ? " mi" : " km";

					distanceVal = converted.toFixed(1) + distanceType;
				}

				// Add list data items
				// http://docs.appcelerator.com/titanium/latest/#!/api/ListDataItem
				listDataItem = {
					locationName : {
						text  : aLocation.name
					},
					locationAddrOne : {
						text : aLocation.street
					},
					locationAddrTwo : {
						text : aLocation.city + ", " + aLocation.state + " " + aLocation.zip
					},
					locationDistance : {
						text : distanceVal
					},
					properties : {
						itemId : aLocation.name
					}
				};

				locationListData.push(listDataItem);
			}

			locationListData.sort(function(a,b){
				return parseInt(a.locationDistance.text)-parseInt(b.locationDistance.text);
			});

			section.setItems(locationListData);
			listView.setSections([section]);
			LocationListScreen.done();
		}
	);

	return LocationListScreen;

};
