sap.ui.define([ "mqtt_viewer/mqtt_viewer/model/models", "mqtt_viewer/mqtt_viewer/controller/utilities" ], function(models) {
	"use strict";
	var oModels = models;
	var Formatter = {

		detailsDevice : function(value) {
			var deviceAlias = this.getModel("global").getProperty("/selectedDeviceAlias");

			if (deviceAlias) {
				if (deviceAlias.length > 0) {
					return "of: " + '"' + deviceAlias + '"';
				}
			}

		},
		parseConsole : function(value) {
		
			var str = "Timestamp: ";
			var date = new Date();
			str = str + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds() + ":  Readings:     ";
			for(var i = 0;i < value.data.length; i++){
			str = str  + i + ": " + value.data[i] + "   ";
				
			}
			//this.oParent.oParent.scrollToElement(value.oParent);
			return str;
		}
	}

	return Formatter;

}, /* bExport= */true);
