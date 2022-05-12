
var
	defaults, theme;

// include theme sub-files
var
	icons = require("./icons");


defaults = {
	"backgroundColor" : "#FFF"
};

theme = {

	// Default UI Object properties
	"Window" : {
		backgroundColor : defaults.backgroundColor,
		top : util.TOP
	},

	"NavigationBar" : {
		fontSize : 22,
		fontWeight : "normal",
		font : {
			fontFamily : "Rounded M+ 1p"
		}
	},

	"NavButton" : {
		color : "#aaa",
		width : 50,
		height : 44,
		textAlign : "center",
		font : {
			fontSize : "26sp"
		}
	},

	"MapButton" : {
		width : 40,
		height : 40,
		textAlign : "center",
		borderWidth : 1,
		borderColor : "#aaa",
		font : {
			fontSize : "20sp"
		}
	},

	"LocationList" : {
		backgroundColor : "#fff",
		showShadow : true,
		navBarHidden : true,
		bottom : 0,
		height : "40%",
	},

	"TileButtonIcon" : {
		color : "#666",
		font : {
			fontSize : "34sp"
		}
	},

	"TileButtonLabel" : {
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		color : "#666",
		font : {
			fontFamily : "Rounded M+ 1p"
		}
	}
};

// apply theme sub-files properties
util.extend(true, theme, icons);

module.exports = theme;
