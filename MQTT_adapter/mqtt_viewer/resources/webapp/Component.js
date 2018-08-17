sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
"mqtt_viewer/mqtt_viewer/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	var navigationWithContext = {

	};

	return UIComponent.extend("mqtt_viewer.mqtt_viewer.Component", {
		metadata : {
			manifest : "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init : function() {


			
			models.initDevicesModel(this);
			models.initGlobalViewModel(this);
			models.initConsoleModel(this);
			// set the device model
			var oDataModel = new sap.ui.model.odata.v2.ODataModel("/xsodata/devices.xsodata");
			this.setModel(oDataModel, "mainOdataModel");
			 
			this.setModel(models.createDeviceModel(), "device");
			// set the FLP model
			this.setModel(models.createFLPModel(), "FLP");

			// set the dataSource model
			this.setModel(new sap.ui.model.json.JSONModel({
				"uri" : "/here/goes/your/serviceUrl/local/"
			}), "dataSource");

			// set application model
			var oApplicationModel = new sap.ui.model.json.JSONModel({});
			this.setModel(oApplicationModel, "applicationModel");

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		createContent : function() {
			var app = new sap.m.App({
				id : "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},

		getNavigationPropertyForNavigationWithContext : function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}
	});

});