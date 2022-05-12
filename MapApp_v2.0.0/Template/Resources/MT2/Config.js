/**
 * Configuration
 *
 * @version 1.0.0
 * @author Mode54
 * @supports All
 */


var
	// Get app configuration file
	configFile = Ti.Filesystem.getFile(
		Ti.Filesystem.resourcesDirectory,
		"/config.json"
	),

	configBase = (function(){
		var json;

		if(configFile.exists()){
			try{
				json = JSON.parse(configFile.read().text);
			}
			catch(e){
				console.error("*** Can't parse config.json file. ***");
				console.error(e);
				json = {};
			}
		}
		else{
			console.error("*** The config.json file does not exist. ***");
			json = {};
		}

		return json;
	})();

// Required config settings
configBase.version = "1.0.0";

configBase.theme = configBase.theme || "default";

configBase.isSimulator = configBase.isSimulator || false;

configBase.log = configBase.log || {
	debug : true,
	error : true,
	info  : true,
	log   : true,
	warn  : true
};

configBase.FontIcons = configBase.FontIcons || "FontAwesome";

configBase.ListTemplatesPath = configBase.ListTemplatesPath || "/ui/list/";

module.exports = configBase;
