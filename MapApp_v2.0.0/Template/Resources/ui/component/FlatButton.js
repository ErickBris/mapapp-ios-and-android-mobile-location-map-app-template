// Flat Button Module

var
	// Log manager
	Log = new ( require("/MT2/Log") )("FlatButton"),

	FlatButton;

FlatButton = function(options){
	var
		view = ui.create("View", Ti.UI.createView, {
			width : options.width,
			height : options.height,
			backgroundColor : options.backgroundColor
		}),
		iconWrapper = ui.create("View", Ti.UI.createView, {
			width : Ti.UI.SIZE
		}),
		icon = ui.create("Label", Ti.UI.createLabel, options.icon, "TileButtonIcon", {
			color : options.color
		}),
		label = ui.create("Label", Ti.UI.createLabel, "TileButtonLabel", {
			text : options.label
		});

	if(options.horizontal){
		view.applyProperties({
			layout : "horizontal"
		});
		iconWrapper.applyProperties({
			height : Ti.UI.SIZE
		});
		icon.left = "3%";
		label.textAlign = Ti.UI.TEXT_ALIGNMENT_LEFT;
	}
	else{
		view.applyProperties({
			layout : "vertical"
		});
		iconWrapper.applyProperties({
			height : "60%"
		});
		icon.bottom = "3%";
		label.textAlign = Ti.UI.TEXT_ALIGNMENT_CENTER;
	}

	iconWrapper.add(icon);
	view.add(iconWrapper);
	view.add(label);

	view.addEventListener(
		"singletap",
		function(e){
			e.cancelBubble = true;
			options.singleTap({
				"name" : options.label,
				"data" : options.eventData || {}
			});
		}
	);

	return view;
}

module.exports = function(){
	ui.register("FlatButton", FlatButton);
};
