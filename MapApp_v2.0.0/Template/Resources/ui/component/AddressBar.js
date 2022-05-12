// Address Bar

var
	// Log manager
	Log = new ( require("/MT2/Log") )("AddressBar"),

	AddressBar;

AddressBar = function(options){
	var
		location = options.location,

		addr1Lbl = ui.create("View", Ti.UI.createLabel, {
			top : 4,
			text : location.street || "",
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			color : "#000",
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
			opacity : 1,
			font : {
				fontFamily : "Rounded M+ 1p",
				fontSize : 14
			}
		}),
		addr2Lbl = ui.create("View", Ti.UI.createLabel, {
			text : location.city + ", " + location.state + " " + location.zip,
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			color : "#000",
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
			opacity : 1,
			font : {
				fontFamily : "Rounded M+ 1p",
				fontSize : 14
			}
		}),
		phoneLbl = ui.create("View", Ti.UI.createLabel, {
			text : location.phone || "",
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			color : "#000",
			bottom : 4,
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
			font : {
				fontFamily : "Rounded M+ 1p",
				fontSize : 14
			}
		}),
		view = ui.create("View", Ti.UI.createView, {
			backgroundColor : "#fff",
			opacity : 0.9,
			width  : Ti.UI.FILL,
			height : Ti.UI.SIZE
		}),
		labelView = ui.create("View", Ti.UI.createView, {
			height : Ti.UI.SIZE,
			right : 4,
			left : 4,
			layout : "vertical"
		}),
		separator = ui.create("View", Ti.UI.createView, {
			top : 0,
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
			opacity : 0.6,
			width : Ti.UI.FILL
		});

	labelView.add(addr1Lbl);
	labelView.add(addr2Lbl);
	labelView.add(phoneLbl);

	view.add(labelView);
	view.add(separator);

	return view;
}

module.exports = function(){
	ui.register("AddressBar", AddressBar);
};

