// Location Manager

var
	Log = new ( require("/MT2/Log") )("LocationManager"),
	XHR = new ( require("/MT2/XHR") ),
	categories = {},
	categoryNames = ["All"],
	locations,
	LocationManager;

function getLatLon(addr, callback){
	Ti.Geolocation.forwardGeocoder(
		addr,
		function(e){
			var coords = [e.latitude, e.longitude];
			if(callback){
				callback({coords : coords});
			}
		}
	);
}

function processLocations(data, callback){
	Log.info("Process locations and store in memory.");

	try{
		locations = JSON.parse(data).locations;
	}
	catch(err){
		callback(err);
	}

	var
		tempObj = [],
		lookupCount = 0,
		len = locations.length,
		loopCount = len*1, // make sure is copy (not reference to len)
		x, aLocation;

	for( x=0; x<len; x++ ){
		aLocation = locations[x];

		categorize(aLocation);

		if(!aLocation.latitude || !aLocation.longitude){
			tempObj.push(x*1); //used to track which location to update
			getLatLon(
				aLocation.street + ", " + aLocation.city + ", " + aLocation.state + " " + aLocation.zip,
				function(obj){
					var loc = locations[tempObj[lookupCount]];

					loc.latitude = obj.coords[0];
					loc.longitude = obj.coords[1];
					lookupCount++;
					loopCount--;
					if(loopCount==0){
						console.info(locations);
						callback();
					}
				}
			);
		}
		else{
			loopCount--;
			if(loopCount==0){
				console.info(locations);
				callback();
			}
		}
	}

	// Log.error(JSON.stringify(categories));
}

function categorize(aLocation){
	if(aLocation.category){
		if(categories[aLocation.category]){
			categories[aLocation.category].push(aLocation);
		}
		else{
			categories[aLocation.category] = [aLocation];
			categoryNames.push(aLocation.category);
		}
	}
}

function locationSetup(){
	var providerGps;

	if(util.IOS){
		Ti.Geolocation.purpose = config.GPS_Purpose;
		Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
		Ti.Geolocation.distanceFilter = 10;
		Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	}
	else{
		providerGps = Ti.Geolocation.Android.createLocationProvider({
			name : Ti.Geolocation.PROVIDER_GPS,
			minUpdateDistance : 0.0,
			minUpdateTime : 0
		});

		Ti.Geolocation.Android.addLocationProvider(providerGps);
		Ti.Geolocation.Android.manualMode = false;
	}

}

function enableLocation(){
	if(config.isSimulator){
		util.CurrentLocation = {
			lat : config.lat,
			lon : config.lon
		};

		Ti.App.fireEvent( util.Event.CurrentLocation );
	}
	else{
		Log.info("Set Location Event Handler");
		if(Ti.Geolocation.locationServicesEnabled) {
			Ti.Geolocation.addEventListener("location", function(e) {

				Log.info("Location Event Handler FIRED!!");
				if(!e.success){
					Log.error(e.error);
					Ti.UI.createAlertDialog({
						title : L("appName"),
						message : L("enableLocation")
					}).show();
				}
				else if(e.coords){
					Log.info(JSON.stringify(e));
					util.CurrentLocation = {
						lat : e.coords.latitude,
						lon : e.coords.longitude
					};

					Ti.App.fireEvent( util.Event.CurrentLocation );
				}
			});
		}
		else{
			Ti.UI.createAlertDialog({
				title : L("appName"),
				message : L("enableLocation")
			}).show();
		}
	}
}

function checkLocationAuth(){
	var authorization = Ti.Geolocation.locationServicesAuthorization;

	if (authorization == Ti.Geolocation.AUTHORIZATION_DENIED) {
		Ti.UI.createAlertDialog({
			title : L("appName"),
			message : L("userDisabledLocation")
		}).show();
		return false;
	}
	else if (authorization == Ti.Geolocation.AUTHORIZATION_RESTRICTED) {
		Ti.UI.createAlertDialog({
			title : L("appName"),
			message : L("systemDisabledLocation")
		}).show();
		return false;
	}
	else{
		// Log.warn("authorization = " + authorization);
		// Log.warn("Ti.Geolocation.AUTHORIZATION_AUTHORIZED = " + Ti.Geolocation.AUTHORIZATION_AUTHORIZED);
		// Log.warn("Ti.Geolocation.AUTHORIZATION_UNKNOWN = " + Ti.Geolocation.AUTHORIZATION_UNKNOWN);
		// Log.warn("Ti.Geolocation.AUTHORIZATION_ALWAYS = " + Ti.Geolocation.AUTHORIZATION_ALWAYS);
		// Log.warn("Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE = " + Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE);
		return true;
	}
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vincenty Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2010             */
/* http://www.movable-type.co.uk/scripts/latlong-vincenty.html                                    */
/* http://creativecommons.org/licenses/by/3.0/                                                    */
/*                                                                                                */
/* from: Vincenty inverse formula - T Vincenty, "Direct and Inverse Solutions of Geodesics on the */
/*       Ellipsoid with application of nested equations", Survey Review, vol XXII no 176, 1975    */
/*       http://www.ngs.noaa.gov/PUBS_LIB/inverse.pdf                                             */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -   /
 * Calculates geodetic distance between two points specified by latitude/longitude using
 * Vincenty inverse formula for ellipsoids
 *
 * @param   {Number} lat1, lon1: first point in decimal degrees
 * @param   {Number} lat2, lon2: second point in decimal degrees
 * @returns (Number} distance in metres between points
 */
function getDistance(lat1, lon1, lat2, lon2){
	// convert degrees to radians
	function toRad(num){ return num * Math.PI / 180; }
	// convert radians to degrees
	function toDeg(num){ return num * 180 / Math.PI; }

	var a = 6378137, b = 6356752.314245, f = 1/298.257223563, // WGS-84 ellipsoid params
		L = toRad(lon2-lon1),
		U1 = Math.atan((1-f) * Math.tan(toRad(lat1))),
		U2 = Math.atan((1-f) * Math.tan(toRad(lat2))),
		sinU1 = Math.sin(U1), cosU1 = Math.cos(U1),
		sinU2 = Math.sin(U2), cosU2 = Math.cos(U2),
		lambda = L, lambdaP, iterLimit = 100;

	do{
		var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda),
			sinSigma = Math.sqrt((cosU2*sinLambda) * (cosU2*sinLambda) +
	    				(cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda));

		if (sinSigma==0){ return 0; } // co-incident points

		var cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda,
			sigma = Math.atan2(sinSigma, cosSigma),
			sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma,
			cosSqAlpha = 1 - sinAlpha*sinAlpha,
			cos2SigmaM = cosSigma - 2*sinU1*sinU2/cosSqAlpha;

		if (isNaN(cos2SigmaM)){ cos2SigmaM = 0; }  // equatorial line: cosSqAlpha=0 (§6)
		var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));

		lambdaP = lambda;
		lambda = L + (1-C) * f * sinAlpha *
					(sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
	}
	while( Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0 );

	if (iterLimit==0){ return NaN; }  // formula failed to converge

	var uSq = cosSqAlpha * (a*a - b*b) / (b*b),
		A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq))),
		B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq))),
		deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
						B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM))),
		s = b*A*(sigma-deltaSigma);

	s = s.toFixed(3); // round to 1mm precision
	return s;
}

if(Ti.Geolocation.locationServicesEnabled) {
	locationSetup();

	if(util.IOS){
		if(checkLocationAuth()){
			enableLocation();
		}
	}
	else{
		enableLocation();
	}

}
else {
	Ti.UI.createAlertDialog({
		title : L("appName"),
		message : L("enableLocation")
	}).show();
}

LocationManager = {
	load : function(callback){
		if(
			Ti.Network.online &&
			config.LocationURL &&
			XHR.isValidURL(config.LocationURL)
		){
			Log.warn("Online and fetching latest location file data");

			XHR.get(
				config.LocationURL,
				function(response){
					var json;

					try{
						json = JSON.parse(response.data);
					}
					catch(err){
						callback(err);
					}

					cache.save("offline/locations.json", response.data, 0, "File");

					processLocations(response.data, callback);
				},
				function(err){
					Log.error("Error in XHR Request for " + config.LocationURL);
					console.log(err);
					callback(err);
				}
			);
		}
		else {
			cache.init(function(){
				Log.warn("Offline or invalid location file url");

				var data = cache.read("offline/locations.json");

				Log.info(data);

				processLocations(data, callback);
			});
		}
	},
	get : function(category, indx){
		var
			locationData = (category && category!="All")
				? categories[category]
				: locations;

		if(typeof indx=="number"){
			return locationData[indx];
		}
		else{
			return locationData;
		}
	},
	getByParam : function(param, value){
		for(var x=0,l=locations.length;x<l;x++){
			if(locations[x][param] && locations[x][param]==value){
				return locations[x];
			}
		}
	},
	getCategories : function(){
		return categoryNames;
	},
	getDistance : getDistance
};

module.exports = LocationManager;
