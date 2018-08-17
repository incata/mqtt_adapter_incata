sap.ui.define(["sap/ui/core/mvc/Controller",
			"sap/m/MessageBox",
			"./utilities",
			"sap/ui/core/routing/History",
			"mqtt_viewer/mqtt_viewer/model/models"
		], function(BaseController, MessageBox, Utilities, History, models) {
			"use strict";

			return BaseController.extend("mqtt_viewer.mqtt_viewer.controller.Dialog1", {
					setRouter: function(oRouter) {
						this.oRouter = oRouter;

					},
					getBindingParameters: function() {
						return {};

					},

					checkDeviceAliasDuplicates: function(oDevice) {
						var oModel = this.getOwnerComponent().getModel("devices");

						var aDevices = oModel.getData();

						for (var i = 0; i < aDevices.length; i++) {
							if (oDevice.alias === aDevices[i].alias) {
								return true;
							}

						}
						return false;

					},
					_onCreatePress: function(oEvent) {

						var oModel = this.getOwnerComponent().getModel("devices");
						var oDevice = models.createDevice(this.getView().byId("alias").getValue(),
							"MQTTcreate",
							this.getView().byId("address").getValue(),
							this.getView().byId("port").getValue(),
							this.getView().byId("clientID").getValue(),
							this.getView().byId("username").getValue(),
							this.getView().byId("password").getValue());

						if (this.checkDeviceAliasDuplicates(oDevice)) {
							MessageBox.error("Cannot create duplicate device, use different alias");
							return;
						}

						var oDataDevice = {
							username: "XSA_ADMIN",
							device_alias: oDevice.alias,
							device_url: oDevice.url,
							device_port: oDevice.port,
							device_pass: oDevice.password,
							device_user: oDevice.username,
							client_id: oDevice.clientID,
							connected: ' '
						};
						this.getOwnerComponent().getModel("mainOdataModel").create("/DeviceHeaders", oDataDevice, {
									success: function(oData, result) {
										debugger;
									},
									error: function(oError) {
										debugger;
									}});

								//			var device = models.createDevice(this.getView().byId("alias").getValue(),"MQTTcreate", "eu.thethings.network","1883",
								//					"135e425e130b4e0ab15b5273a449dd1c","02_dds_lora", "ttn-account-v2.0zs-tK06mekDtH2_a7YBZNbpM2zbP5tBZpeuhk58ILs");

								oModel.getData().push(oDevice); oModel.refresh(true);
								var oDialog = this.getView().getContent()[0];

								return new Promise(function(fnResolve) {
									oDialog.attachEventOnce("afterClose", null, fnResolve);
									oDialog.close();
								});

							},
							doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {

								var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
								var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

								var sEntityNameSet;
								if (sPath !== null && sPath !== "") {
									if (sPath.substring(0, 1) === "/") {
										sPath = sPath.substring(1);
									}
									sEntityNameSet = sPath.split("(")[0];
								}
								var sNavigationPropertyName;
								var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

								if (sEntityNameSet !== null) {
									sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
										sRouteName);
								}
								if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
									if (sNavigationPropertyName === "") {
										this.oRouter.navTo(sRouteName, {
											context: sPath,
											masterContext: sMasterContext
										}, false);
									} else {
										oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
											if (bindingContext) {
												sPath = bindingContext.getPath();
												if (sPath.substring(0, 1) === "/") {
													sPath = sPath.substring(1);
												}
											} else {
												sPath = "undefined";
											}

											// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
											if (sPath === "undefined") {
												this.oRouter.navTo(sRouteName);
											} else {
												this.oRouter.navTo(sRouteName, {
													context: sPath,
													masterContext: sMasterContext
												}, false);
											}
										}.bind(this));
									}
								} else {
									this.oRouter.navTo(sRouteName);
								}

								if (typeof fnPromiseResolve === "function") {
									fnPromiseResolve();
								}
							},
							_onCancelPress: function() {
								var oDialog = this.getView().getContent()[0];

								return new Promise(function(fnResolve) {
									oDialog.attachEventOnce("afterClose", null, fnResolve);
									oDialog.close();
								});

							},
							onInit: function() {
								this._oDialog = this.getView().getContent()[0];
								var oIconTabBar = this.byId("idIconTabBar1");
								oIconTabBar.setBackgroundDesign("Transparent");
								oIconTabBar.setHeaderBackgroundDesign("Transparent");

							},
							onExit: function() {
								this._oDialog.destroy();

							}
					});
			}, /* bExport= */ true);