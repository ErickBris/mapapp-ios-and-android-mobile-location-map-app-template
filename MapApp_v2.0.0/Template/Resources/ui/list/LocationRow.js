var
	fontFamily = "Rounded M+ 1p",
	undef;

module.exports = {
	properties : {
		hasChild : true,
		height : Ti.UI.SIZE,
		selectedBackgroundColor : "#ddd",
		backgroundColor : "transparent",
		accessoryType   : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
		selectionStyle  : util.IOS ? Ti.UI.iPhone.ListViewCellSelectionStyle.NONE : undef
	},
	childTemplates : [
		{
			type   : "Ti.UI.Label",
			bindId : "locationDistance",
			properties : {
				width  : Ti.UI.SIZE,
				height : Ti.UI.SIZE,
				text   : "",
				color  : "#000",
				right  : 5,
				font   : {
					fontFamily : fontFamily,
					fontSize : 10
				}
			}
		},
		{
			type : "Ti.UI.View",
			properties : {
				width  : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				layout : "vertical"
			},
			childTemplates : [
				{
					type   : "Ti.UI.Label",
					bindId : "locationName",
					properties : {
						top : 2,
						left : 12,
						width : Ti.UI.FILL,
						height : Ti.UI.SIZE,
						color : "#000",
						textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
						font : {
							fontFamily : fontFamily,
							fontSize : 14
						}
					}
				},
				{
					type   : "Ti.UI.Label",
					bindId : "locationAddrOne",
					properties : {
						left : 12,
						width : Ti.UI.FILL,
						height : Ti.UI.SIZE,
						color : "#000",
						textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
						font : {
							fontFamily : fontFamily,
							fontSize : 12
						}
					}
				},
				{
					type   : "Ti.UI.Label",
					bindId : "locationAddrTwo",
					properties : {
						left : 12,
						width : Ti.UI.FILL,
						height : Ti.UI.SIZE,
						color : "#000",
						textAlign : Ti.UI.TEXT_ALIGNMENT_LEFT,
						font : {
							fontFamily : fontFamily,
							fontSize : 12
						}
					}
				}
			]
		}
	]
}
