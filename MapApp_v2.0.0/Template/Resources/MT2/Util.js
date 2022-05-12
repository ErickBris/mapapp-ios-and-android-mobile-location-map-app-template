var
    densityFactor  = (Ti.Platform.osname === "android") ? Ti.Platform.displayCaps.logicalDensityFactor : 1,
    osName         = Ti.Platform.osname,
    platform       = Ti.Platform.name,
    version        = Ti.Platform.version,
    major          = parseInt(version.split(".")[0],10),
    platformHeight = Ti.Platform.displayCaps.platformHeight,
    platformWidth  = Ti.Platform.displayCaps.platformWidth,
    iOS7           = (platform == "iPhone OS" && major >= 7) ? true : false,
    class2type     = {},
    fontPath       = config.FontIconsPath || "/font_icons/";

"Boolean Number String Function Array Date RegExp Object Error"
	.split(" ")
	.forEach(
		function(name){
			class2type[ "[object " + name + "]" ] = name.toLowerCase();
		}
	);

function type(obj){
	if( obj == null ){
		return obj + "";
	}

	if(typeof obj === "object" || typeof obj === "function"){

		// check if obj.toString() returns type string
		if( (obj+"").indexOf("[object Ti")==0 ){
			// use obj's toString function
			return class2type[ obj.toString.call(obj) ]
		}
		else{
			// use native object toString function (doesn't detect Ti objects)
			return class2type[ Object.prototype.toString.call(obj) ];
		}
	}
	else{
		return typeof obj;
	}
};

function loadFontIcons(){
	var
		icons = config.FontIcons,
		iconicFont = require("/MT2/IconicFont");

	if(icons){
		icons = Array.isArray(icons)
			? icons
			: [icons];

		icons.forEach(function(icon){
			Util.FontIcon[icon] = new iconicFont({
				font: fontPath + icon
			});
		});
	}
}

var Util = {

	// Global variables

	"OS_NAME" : osName,
	"IOS"     : osName === "iphone" || osName === "ipad",
	"ANDROID" : platform === "android",
	"IOS7"    : iOS7,
	"IPAD"    : osName === "ipad",
	"IPHONE"  : osName === "iphone",
	"TOP"     : iOS7 ? 20 : 0,
	"HEIGHT"  : Math.floor(platformHeight/densityFactor),
	"WIDTH"   : Math.floor(platformWidth/densityFactor),
	"THEME"   : {},
	"FontIcon" : {},

	// Global functions

	type : type,

	/**
	 * Check if object is a function
	 *
	 * @param {object} obj Object to check
	 */
	isFunction : function (obj){
		return type(obj) === "function";
	},

	/**
	 * Check if object is a plain object
	 *
	 * @param {object} obj Object to check
	 */
	isPlainObject : function(obj){
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - Ti objects
		if (type(obj) !== "object"){
			return false;
		}

		if(
			obj.constructor &&
			!class2type.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")
		){
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	/**
	 * Extend an object with another based on jQuery.extend()
	 */
	extend : function() {
		var
			options, name, src,
			copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if(
			typeof target !== "object" &&
			!Util.isFunction(target)
		){
			target = {};
		}

		for( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if(
						deep && copy &&
						(
							Util.isPlainObject(copy) ||
							( copyIsArray = Array.isArray(copy) )
						)
					){

						if( copyIsArray ) {
							copyIsArray = false;
							clone = src && Array.isArray(src) ? src : [];

						}
						else{
							clone = src && Util.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = Util.extend( deep, clone, copy );

					// Don't bring in undefined values
					}
					else if( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	}
};

loadFontIcons();

module.exports = Util;
