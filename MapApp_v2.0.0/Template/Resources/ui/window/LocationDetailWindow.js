// Location Detail Window

var
	Log = new ( require("/MT2/Log") )("LocationDetailWindow"),
	LocationManager = require("/lib/LocationManager"),
	LocationDetailWindow;

(require("/MT2/ui/screen/Screen"))();
(require("/ui/component/AddressBar"))();
(require("/ui/component/ButtonGrid"))();

function getHDHeight(width){
	return Math.floor(width/16*9);
}

LocationDetailWindow = function(id){

	if(!id){
		return false;
	}

	var
		location = LocationManager.getByParam("name", id),
		window = ui.create("Window", Ti.UI.createWindow, {
			exitOnClose : false,
			title : L("appName"),
			navBarHidden : true
		}),
		backButton = ui.create("Label", Ti.UI.createLabel, "BackIcon", "NavButton"),
		detailScreen = ui.create("Screen", {
			title : location.name,
			showShadow : true,
			backgroundColor : "transparant",
			leftButton : backButton,
			top : 0,
			bottom : 0,
			layout : "vertical"
		}),
		addressBar = ui.create("AddressBar", {
			location : location
		}),
		buttonGrid = ui.create("ButtonGrid", {
			backgroundColor : "#bbb",
			location : location
		}),
		hdHeight = getHDHeight(util.WIDTH),
		slides = [],
		ViewScrollr, imageView, imageScrollr;

	window.add(detailScreen.getScreenView());

	if(location.images){
		if(location.images instanceof Array){
			ViewScrollr = require("/MT2/ui/component/ViewScrollrPro");

			for(var x=0,l=location.images.length;x<l;x++){
				slides.push({ image : location.images[x] });
			}

			imageScrollr = ViewScrollr.create({
				width : util.WIDTH,
				height : hdHeight,
				auto : true,
				scale : false,
				maxZoomScale : 4.0,
				backgroundColor : "#000",
				navigation : {
					onTop : false,
					style : ViewScrollr.NAV_STYLE.BLOCK,
					selectedColor : "#fff",
					color : "#000",
					showBorder : true,
					borderColor : "#fff",
					backgroundColor : "transparant"
				},
				slides : slides
			});

			detailScreen.add(imageScrollr);
			imageScrollr.$.start();
		}
		else{
			var container = Ti.UI.createScrollView({
				backgroundColor : "#000",
				width  : util.WIDTH,
				height : hdHeight,
				maxZoomScale : 4.0
			}),
			imageView = Ti.UI.createImageView({
				enableZoomControls : true,
				image : location.images,
				width : util.WIDTH,
				height : hdHeight
			});
			container.add(imageView);
			detailScreen.add(container);
		}
	}

	backButton.addEventListener(
		"click",
		function(){
			if (util.IOS) {
				appRoot.closeWindow(window);
			}
			else{
				window.close();
			}
		}
	);

	detailScreen.add(addressBar);
	detailScreen.add(buttonGrid);

	return window;
}

module.exports = LocationDetailWindow;
