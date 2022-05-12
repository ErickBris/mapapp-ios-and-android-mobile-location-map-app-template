/**
 * Log management module for Mode54 mobile templates.
 * 
 * @version 1.0.0
 * @author Mode54
 * @modules Config
 * @supports iOS, Android
*/

var
	colors = {
		"none"         : "\033[0m",
		"black"        : "\033[0;30m",
		"dark_gray"    : "\033[1;30m",
		"blue"         : "\033[0;34m",
		"light_blue"   : "\033[1;34m",
		"green"        : "\033[0;32m",
		"light_green"  : "\033[1;32m",
		"cyan"         : "\033[0;36m",
		"light_cyan"   : "\033[1;36m",
		"red"          : "\033[0;31m",
		"light_red"    : "\033[1;31m",
		"brown"        : "\033[0;33m",
		"yellow"       : "\033[1;33m",
		"light_gray"   : "\033[0;37m",
		"white"        : "\033[1;37m",
		"purple"       : "\033[0;35m",
		"light_purple" : "\033[1;35m"
	};

/**
 * @constructor Log
 */
function Log( category, options ){
	var
		options = options || {},
		prefix = options.prefix || ">> ",
		color = options.color ? colors[options.color] : "";

	this.getLabel = function(){
		var label;
		if(color!==""){
			label = [
				color,
				prefix,
				(category || "Unknown"),
				": ",
				colors.none
			].join("");
		}
		else{
			label = prefix + (category || "Unknown") + ": ";
		}

		return label;
	};

	this.setColor = function(aColor){
		color = colors[aColor];
	};
}

/**
 * Log a message at the debug level.
 *
 * @method debug
 * @param msg (object) The message(s) to log.
 */
Log.prototype.debug = function( msg ){
	if(config.log.debug){
		console.debug(this.getLabel() + msg);
	}
};

/**
 * Log a message at the error level.
 *
 * @method error
 * @param msg (object) The message(s) to log.
 */
Log.prototype.error = function( msg ){
	if(config.log.error){
		console.error(this.getLabel() + msg);
	}
};

/**
 * Log a message at the info level.
 *
 * @method info
 * @param msg (object) The message(s) to log.
 */
Log.prototype.info = function( msg ){
	if(config.log.info){
		console.info(this.getLabel() + msg);
	}
};

/**
 * Log a message at the log level.
 *
 * @method log
 * @param msg (object) The message(s) to log.
 */
Log.prototype.log = function( msg ){
	if(config.log.log){
		console.log(this.getLabel() + msg);
	}
};

/**
 * Log a message at the warn level.
 *
 * @method warn
 * @param msg (object) The message(s) to log.
 */
Log.prototype.warn = function( msg ){
	if(config.log.warn){
		console.warn(this.getLabel() + msg);
	}
};

module.exports = Log;

