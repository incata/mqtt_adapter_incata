sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {
		
		selectedIndex: null,
		
		
		createDevice : function(alias, command, url, port,  clientID, username,password  ) {
		
			
			var device  = {
				alias: alias,
				command : command,
				url : url,
				port: port,
				clientID : clientID,
				username : username,
				password : password,
				connected: false
			};
			return device;
		},



		createDeviceModel : function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel : function() {
			var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive : bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		initDevicesModel : function(component) {


			var oModel = new sap.ui.model.json.JSONModel([]);
			component.setModel(oModel, "devices");



		},
		
		initConsoleModel : function(component) {


			var oModel = new sap.ui.model.json.JSONModel([]);
			component.setModel(oModel, "console");



		},
		
			initTopicsModel : function(component) {


			var oModel = new sap.ui.model.json.JSONModel([]);
			component.setModel(oModel, "topics");



		},
		
		initGlobalViewModel : function(component) {


			var oModel = new sap.ui.model.json.JSONModel({});
			component.setModel(oModel, "global");



		}
	};

}
);