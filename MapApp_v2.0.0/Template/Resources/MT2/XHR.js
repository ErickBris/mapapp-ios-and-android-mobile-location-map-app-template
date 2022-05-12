/**
 * XHR is a wrapper around Titanium's HTTPClient.
 * Forked from XHR module by Raul Riera [https://github.com/raulriera/XHR]
 * Updates made to trim down features for use on Mode54 templates files.
 *
 * @license MIT License [https://github.com/raulriera/XHR/blob/master/LICENSE]
 * @modules Log
 * @version 1.0.0
 * @author Mode54
 */

var
	// Log manager
	Log = new ( require("/MT2/Log") )("XHR");

/**
 * @constructor XHR
 */
function XHR(){};

/**
 * Get action for HTTP calls.
 *
 * @method get
 * @param url (string) URL to fetch
 * @param onSuccess (function) success callback
 * @param onError (function) error callback
 * @param options (object)
 */
XHR.prototype.get = function(url, onSuccess, onError, options) {

	Log.debug("Get [" + url + "]");
	Log.info("Ti.Network.online = " + Ti.Network.online);

	// Create some default params
	var
		onSuccess = onSuccess || function(){},
		onError = onError || function(){},
		options = options || {},
		cachedData = cache.read(url);

	// Fire error callback if offline
	if(!Ti.Network.online){
		onError({ status : "offline" });
		return false;
	}

	options.async = (options.hasOwnProperty("async"))
		? options.async
		: true;

	// if you set this to true, pass "username" and "password" as well
	options.shouldAuthenticate = options.shouldAuthenticate || false;
	options.contentType = options.contentType || "application/json";

	Log.info("Fetch new data for [" + url + "]");

	var
		// Create the HTTP connection
		xhr = Ti.Network.createHTTPClient({
			enableKeepAlive: false
		}),

		// Create the result object
		result = {},

		authstr;

	// Open the HTTP connection
	xhr.open("GET", url, options.async);
	xhr.setRequestHeader("Content-Type", options.contentType);

	xhr.cache = options.cache || false;

	// If we need to authenticate
	if (options.shouldAuthenticate) {
		authstr = "Basic " + Ti.Utils.base64encode(options.username +
			":" + options.password);

		xhr.setRequestHeader("Authorization", authstr);
	}

	if(options.customHeaders){
		for(var key in options.customHeaders){
			xhr.setRequestHeader(key, options.customHeaders[key]);
		}
	}

	if(options.timeout){
		xhr.setTimeout(options.timeout);
	}

	// When the connection was successful
	xhr.onload = function() {
		Log.debug("Status code: " + xhr.status);
		// Check the status of this
		result.status = xhr.status == 200 ? "ok" : xhr.status;

		// Check the type of content we should serve back to the user
		if (options.contentType.indexOf("application/json") != -1) {
			result.data = xhr.responseText;
		}
		else if (options.contentType.indexOf("text/xml") != -1) {
			result.data = xhr.responseXML;
		}
		else {
			result.data = xhr.responseData;
		}

		Log.debug(
			"XHR Results for " + url +
			"\n" + JSON.stringify(result.data)
		);

		onSuccess(result);
	};

	// When there was an error
	xhr.onerror = function(e) {
		// Check the status of this
		result.status = "error";
		result.data = e;
		result.code = xhr.status;
		onError(result);
	};

	xhr.send();
};

/**
 * POST requests
 * @param url (string) URL to fetch
 * @param data (object)
 * @param onSuccess (function) success callback
 * @param onError (function) error callback
 * @param options (object)
 */
XHR.prototype.post = function(url, data, onSuccess, onError, options) {

	Log.debug("Post to [" + url + "]\n" + JSON.stringify(data));
	Log.info("Ti.Network.online = " + Ti.Network.online);

	if(!Ti.Network.online){
		onError({ status : "offline" });
		return false;
	}

	// Create some default params
	var
		onSuccess = onSuccess || function(){},
		onError = onError || function(){},
		options = options || {},

		// Create the HTTP connection
		xhr = Ti.Network.createHTTPClient({
			enableKeepAlive: false
		}),

		// Create the result object
		result = {},

		authstr;

	options.async = (options.hasOwnProperty("async"))
		? options.async
		: true;

	// if you set this to true, pass "username" and "password" as well
	options.shouldAuthenticate = options.shouldAuthenticate || false;
	options.contentType = options.contentType || "application/json";

	// Open the HTTP connection
	xhr.open("POST", url, options.async);
	xhr.setRequestHeader("Content-Type", options.contentType);

	// If we need to authenticate
	if (options.shouldAuthenticate) {
		authstr = "Basic " + Ti.Utils.base64encode(options.username +
			":" + options.password);
		xhr.setRequestHeader("Authorization", authstr);
	}

	if(options.customHeaders){
		for(var key in options.customHeaders){
			xhr.setRequestHeader(key, options.customHeaders[key]);
		}
	}

	if(options.timeout){
		xhr.timeout = options.timeout;
	}

	// When the connection was successful
	xhr.onload = function() {
		// Check the status of this
		result.status = xhr.status == 200 ? "ok" : xhr.status;
		result.data = xhr.responseText;

		onSuccess(result);
	};

	// When there was an error
	xhr.onerror = function(e) {
		// Check the status of this
		result.status = "error";
		result.data = e.error;
		result.code = xhr.status;
		onError(result);
	};

	xhr.send(data);
};

/**
 * PUT requests
 * @param url (string) URL to fetch
 * @param data (object)
 * @param onSuccess (function) success callback
 * @param onError (function) error callback
 * @param options (object)
 */
XHR.prototype.put = function(url, data, onSuccess, onError, options) {

	Log.debug("Put HTTP to [" + url + "]\n" + JSON.stringify(data));
	Log.info("Ti.Network.online = " + Ti.Network.online);

	if(!Ti.Network.online){
		onError({ status : "offline" });
		return false;
	}

	// Create some default params
	var
		onSuccess = onSuccess || function(){},
		onError = onError || function(){},
		options = options || {};

		// Create the HTTP connection
		xhr = Ti.Network.createHTTPClient({
			enableKeepAlive: false
		}),

		// Create the result object
		result = {},

		authstr;

	options.async = (options.hasOwnProperty("async"))
		? options.async
		: true;

	// if you set this to true, pass "username" and "password" as well
	options.shouldAuthenticate = options.shouldAuthenticate || false;
	options.contentType = options.contentType || "application/json";

	// Open the HTTP connection
	xhr.open("PUT", url, options.async);
	xhr.setRequestHeader("Content-Type", options.contentType);

	// If we need to authenticate
	if (options.shouldAuthenticate) {
		authstr = "Basic " + Ti.Utils.base64encode(options.username +
			":" + options.password);
		xhr.setRequestHeader("Authorization", authstr);
	}

	if(options.customHeaders){
		for(var key in options.customHeaders){
			xhr.setRequestHeader(key, options.customHeaders[key]);
		}
	}

	if(options.timeout){
		xhr.timeout = options.timeout;
	}

	// When the connection was successful
	xhr.onload = function() {
		// Check the status of this
		result.status = xhr.status == 200 ? "ok" : xhr.status;
		result.data = xhr.responseText;

		onSuccess(result);
	};

	// When there was an error
	xhr.onerror = function(e) {
		// Check the status of this
		result.status = "error";
		result.data = e.error;
		result.code = xhr.status;
		onError(result);
	};

	xhr.send(data);
};

/**
 * DELETE requests
 * @url (string) URL to fetch
 * @onSuccess (function) success callback
 * @onError (function) error callback
 * @options (object)
 */
XHR.prototype.destroy = function(url, onSuccess, onError, options) {

	Log.debug("Delete HTTP to [" + url + "]");
	Log.info("Ti.Network.online = " + Ti.Network.online);

	if(!Ti.Network.online){
		onError({ status : "offline" });
		return false;
	}

	Log.debug(url);

	// Create some default params
	var
		onSuccess = onSuccess || function(){},
		onError = onError || function(){},
		options = options || {},

		// Create the HTTP connection
		xhr = Ti.Network.createHTTPClient({
			enableKeepAlive: false
		}),

		// Create the result object
		result = {},

		authstr;

	options.async = (options.hasOwnProperty("async"))
		? options.async
		: true;

	// if you set this to true, pass "username" and "password" as well
	options.shouldAuthenticate = options.shouldAuthenticate || false;
	options.contentType = options.contentType || "application/json";

	// Open the HTTP connection
	xhr.open("DELETE", url, options.async);
	xhr.setRequestHeader("Content-Type", options.contentType);

	// If we need to authenticate
	if (options.shouldAuthenticate) {
		authstr = "Basic " + Ti.Utils.base64encode(options.username +
			":" + options.password);
		xhr.setRequestHeader("Authorization", authstr);
	}

	if(options.customHeaders){
		for(var key in options.customHeaders){
			xhr.setRequestHeader(key, options.customHeaders[key]);
		}
	}

	if(options.timeout){
		xhr.timeout = options.timeout;
	}

	// When the connection was successful
	xhr.onload = function() {
		// Check the status of this
		result.status = xhr.status == 200 ? "ok" : xhr.status;
		result.data = xhr.responseText;

		onSuccess(result);
	};

	// When there was an error
	xhr.onerror = function(e) {
		// Check the status of this
		result.status = "error";
		result.data = e.error;
		result.code = xhr.status;
		onError(result);
	};

	xhr.send();
};

/**
 * validate url
 * @string (string) URL to validate
 */
XHR.prototype.isValidURL = function(str) {
	if(typeof str!=="string") return false;

	return (/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/).test(str);
}

// Return everything
module.exports = XHR;
