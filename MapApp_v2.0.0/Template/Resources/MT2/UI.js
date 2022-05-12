/**
 * UI wrapper
 */

var
	// Log manager
	Log = new ( require("/MT2/Log") )("UI"),

	// UI object
	UI = {},

	// Object property sets
	props = {},

	// Store UI widgets
	widgetRegistry = {};

/**
 * Register new props - currently all props are global (like CSS)
 *
 * @param (object) propertySets
 */
UI.registerProps = function(propertySets) {
	util.extend(true, props, propertySets);
};

/**
 * get the props by the given key
 *
 * @param (string) key
 */
UI.getProps = function(key) {
	return util.extend(true, {}, props[key] || {}); //return clone
};

/**
 * apply a props to a selected target
 *
 * @param (object) target
 * @param (string) names
 */
UI.applyProps = function(target) {
	var j;

	for (j = 1; j < arguments.length; j++) {
		if(props[arguments[j]]){
			util.extend(true, target, props[arguments[j]]);
		}
	}
	return target;
};

/**
 * Register a custom UI builder, which
 * will be passed merged props arguments
 *
 * @param (string) widgetName
 * @param (function) builder
 * @param (boolean) force
 */
UI.register = function(widgetName, builder, force) {
	if(widgetRegistry[widgetName] && !force){
		return;
	}
	var widget = {};
	widget[widgetName] = builder;
	util.extend(true, widgetRegistry,widget);
};

/**
 * Create a Titanium or custom UI component, styled with props
 *
 * @param (string) viewType
 * @param (string || object) props or plain objects
 */
UI.create = function(viewType, createFunc) {
	var
		args = {},
		viewTypeArr,
		j = (
			util.type(createFunc)=="object" ||
			widgetRegistry.hasOwnProperty(viewType)
		) ? 1 : 2;

	//First, grab widget defaults if we have them
	UI.applyProps(args,viewType);

	for ( ; j < arguments.length; j++) {
		if (typeof(arguments[j]) == "string") {
			UI.applyProps(args,arguments[j]);
		}
		else {
			util.extend(true, args,arguments[j]);
		}
	}

	// Use a custom builder if we have it, otherwise
	// assume it's a Ti.UI namespaced object
	if (widgetRegistry.hasOwnProperty(viewType)) {
		return widgetRegistry[viewType](args);
	}
	else {
		try {
			return createFunc(args);
		}
		catch(e) {
			Log.error(
				"[UI.create] No constructor found for type: " + viewType
			);
			Log.error(e);
			return null;
		}
	}
};

module.exports = UI;
