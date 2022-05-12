var
	FontAwesome = util.FontIcon["FontAwesome"],
	icons;

// Icon props should be used with a Ti.UI.Label object
icons = {
	"BackIcon" : {
		text : FontAwesome.icon("fa-angle-left"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"CloseIcon" : {
		text : FontAwesome.icon("fa-times"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"InfoIcon" : {
		text : FontAwesome.icon("fa-info-circle"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"ListIcon" : {
		text : FontAwesome.icon("fa-list"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"LocationIcon" : {
		text : FontAwesome.icon("fa-location-arrow"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"AngleDownIcon" : {
		text : FontAwesome.icon("fa-angle-down"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"SpinnerIcon" : {
		text : FontAwesome.icon("fa-spinner"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"Globe" : {
		text : FontAwesome.icon("fa-globe"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"Phone" : {
		text : FontAwesome.icon("fa-phone"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"Envelope" : {
		text : FontAwesome.icon("fa-envelope-o"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	},

	"Plus" : {
		text : FontAwesome.icon("fa-plus"),
		font : {
			fontFamily : FontAwesome.fontfamily
		}
	}
};

module.exports = icons;
