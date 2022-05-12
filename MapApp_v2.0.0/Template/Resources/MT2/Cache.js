/**
 * Cache management module for Mode54 mobile templates.
 *
 * @version 1.0.0
 * @author Mode54
 * @modules Config, Log
 * @supports iOS, Android
 *
 * @instructions
 	- you can override cache manager object name in config module.
 	  this name is used to create a Ti.App.Properties object to manage
 	  cache ttls. the default name is cachedXHRObjs

 	- you can also override the bundled cache manager file path.
 	  this is used to load any bundled data included in the app package.
 	  the format for this file is

 	  {
		"bundledCacheManager" : {
			"http://mode54.com/example.json" : {
				"path" : "/data/example.json",
				"ttl" : 100
			}
		}
 	  }

 	  the key for each data node in bundledCacheManager can be any string.
 	  use urls for any data that the XHR module will fetch that has a bundled
 	  cache data file. the path is used to point to the bundled data file and
 	  the ttl is for the bundled file... the ttl for the actual data request
 	  can be different.

 	-
*/

var
	managerPropName = config.CachePropertyName || "cachedObjs",

	// Create or retrieve cached object
	cacheObj = {

		// Cache manager object
		"manager" : Ti.App.Properties.getObject(managerPropName, {}),

		// In memory cache
		"cache" : {}
	},

	// Log manager
	Log = new ( require("/MT2/Log") )("Cache");

// Public API
var Cache = {
	init : function(callback){

		Log.info("init()::Load Fresh Cache manager object from properties...");

		cacheObj.manager = Ti.App.Properties.getObject(managerPropName, {});

		Cache.clean();

		if(Object.keys(cacheObj.manager).length>0){
			Log.info(
				"Cache manager data detected... skip loading bundled data."
			);
			callback();
			return;
		}

		var
			// Get bundled cache manager file (Read Only)
			bundled = Ti.Filesystem.getFile(
				Ti.Filesystem.resourcesDirectory,
				config.BundledCachePath || "/data/cache.json"
			),

			json;

		if(bundled.exists()){
			try{
				json = JSON.parse(bundled.read().text);
			}
			catch(e){
				Log.warn("Can't parse bundled cache manager file");
				Log.debug(e);
			}

			if(json){
				loadBundledContent(json.bundledCacheManager, callback);
			}
			else{
				callback();
			}
		}
		else{
			callback();
		}
	},

	/**
	 * Retrieve specific cached content
	 */
	read : function(id){
		Log.debug("Reading [" + id + "] content from cache...");

		var
			hashedId = Ti.Utils.md5HexDigest(id),
			cacheManagerEntry = cacheObj.manager[id],
			result = null,
			file;

		Log.debug(
			"Value of cache info in manager for...\n" + id + ":\n" +
			JSON.stringify(cacheManagerEntry)
		);

		if(cacheManagerEntry){
			if(
				cacheManagerEntry.timestamp == 0 ||
				cacheManagerEntry.timestamp >= new Date().getTime()
			){
				// fetch data from memory or file
				if(cacheObj.cache[hashedId]){
					Log.debug("Found cache data from memory [" + id + "]");
					result = cacheObj.cache[hashedId];
				}
				else{
					file = Ti.Filesystem.getFile(
						Ti.Filesystem.applicationDataDirectory,
						hashedId
					);
					if(file.exists()){
						Log.debug("Found cache data from file [" + id + "]");
						result = file.read().text;
					}
					else{
						Log.warn(
							"Cache data for " + id +
							" does not exist in memory or file."
						);
					}
				}
			}
			else{
				// data has expired... remove from cache
				Cache.clear(id);
				Log.warn("Cache data from [" + id + "] has expired!!");
			}
		}
		else{
			Log.warn("Cache manager data for " + id + " does not exist.");
		}

		return result;
	},

	/**
	 * Removes specific cached content
	 */
	clear : function(id){
		var
			hashedId = Ti.Utils.md5HexDigest(id),
			cacheManagerEntry = cacheObj.manager[id];

		delete cacheObj.cache[hashedId];
		delete cacheObj.manager[id];

		if(
			cacheManagerEntry &&
			(
				cacheManagerEntry.type=="File" ||
				cacheManagerEntry.type=="MemoryAndFile"
			)
		){
			Ti.Filesystem.getFile(
				Ti.Filesystem.applicationDataDirectory,
				hashedId
			).deleteFile();

			persistManager(cacheObj.manager);
		}
	},

	/**
	 * Removes all expired content
	 */
	clean : function(){
		var
			now = new Date().getTime(),
			expiredIds = [],
			cacheManagerEntry, key;

		for(key in cacheObj.manager){
			cacheManagerEntry = cacheObj.manager[key];

			if(cacheManagerEntry.timestamp <= now){
				expiredIds.push(key);
				Cache.clear(key);
			}
		}

		return expiredIds;
	},

	/**
	 * Removes all content
	 */
	purge : function(){
		var key;

		Log.debug("Purge cache data.");
		for(key in cacheObj.manager){
			cacheManagerEntry = cacheObj.manager[key];

			Cache.clear(key);
		}
	},

	/**
	 * Return full list of all cached object ids
	 */
	listCacheIds : function(){
		var
			list = [],
			key;

		for(key in cacheObj.manager){
			list.push(key);
		}

		return list;
	},

	/**
	 * Save content to cache
	 *
	 * @param id (string) Id of the data to cache
	 * @param data (string) Data to store in cache
	 * @param ttl (number) The time for cache to live in minutes
	 * @param type (object) Save to memory (default), file,
	 * 		or both [Memory, File, MemoryAndFile]
	 */
	save : function(id, data, ttl, type){

		Log.debug("Saving [" + id + "] content to cache... type=" + type);

		var
			hashedId = Ti.Utils.md5HexDigest(id),
			now = (!ttl || ttl==0) ? 0 : new Date().getTime();

		if(cacheObj.manager[id]){
			cacheObj.manager[id].timestamp = now + ( ttl * 60 * 1000 );
		}
		else{
			cacheObj.manager[id] = {
				timestamp : now + ( ttl * 60 * 1000 )
			};
		}

		// use stored cache type if not specified
		// if doesn't exist in stored cache then default will kick in (Memory)
		if(!type && cacheObj.manager[id].type){
			type = cacheObj.manager[id].type;
		}

		cacheObj.manager[id].type = type || "Memory";

		switch(type){

			case "MemoryAndFile" :
				cacheObj.cache[hashedId] = data;
				Log.debug("Done saving [" + id + "] to Memory!");

			case "File" :
				(Ti.Filesystem.getFile(
					Ti.Filesystem.applicationDataDirectory,
					hashedId
				)).write(data);

				persistManager(cacheObj.manager);

				Log.debug("Done saving [" + id + "] to File!");
				break;

			default :
				cacheObj.cache[hashedId] = data;
				Log.debug("Done saving [" + id + "] to Memory!");
				break;
		}
	}
};

function persistManager(manager){

	Log.info("Persisting manager data...");

	var
		cleanManager = {},
		cacheManagerKey;

	// Remove memory cache objects before saving
	// Memory cache objects will not exist after app close
	for(cacheManagerKey in manager){
		if(
			manager[cacheManagerKey].type ||
			manager[cacheManagerKey].type!=="Memory"
		){
			cleanManager[cacheManagerKey] = manager[cacheManagerKey];
			Log.info(
				"Save ["+ cacheManagerKey +"] to manager clone before saving."
			);
		}
		else{
			Log.warn(
				"Remove ["+ cacheManagerKey +"] from manager before saving."
			);
		}
	}

	Ti.App.Properties.setObject(
		managerPropName,
		cleanManager
	);
}

function loadBundledContent(manager, callback){
	Log.info("Load bundled data into cache...");
	Log.debug(JSON.stringify(manager));

	var key, file;

	for(key in manager){
		cacheManagerEntry = manager[key];

		if(cacheManagerEntry.path){
			file = Ti.Filesystem.getFile(
				Ti.Filesystem.resourcesDirectory,
				cacheManagerEntry.path
			);
		}
		else{
			Log.warn("Can't find bundled cache file path for " + key);
		}

		if(file.exists()){
			Cache.save(
				key,
				file.read().text,
				cacheManagerEntry.ttl,
				cacheManagerEntry.type
			);
		}
		else{
			Log.warn(
				"Can't find bundled cache file: " + cacheManagerEntry.path
			);
		}
	}

	persistManager(manager);

	Log.info("Done loading bundled data into cache!");
	callback();
}

module.exports = Cache;
