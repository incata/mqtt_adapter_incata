sap.ui.define([
	'jquery.sap.global',
	'sap/m/MessageToast',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	"mqtt_viewer/mqtt_viewer/model/models",
	"mqtt_viewer/mqtt_viewer/formatter/formatter"

], function(jQuery, MessageToast, Fragment, Controller, Filter, JSONModel, models, formatter) {
	"use strict";

	return Controller.extend("mqtt_viewer.mqtt_viewer.controller.View1", {
		socket: {},

		onInit: function() {

			// connection opened
			connection.attachOpen(function(oControlEvent) {
				sap.m.MessageToast.show("connection opened");
			});

			// server messages
			connection.attachMessage(function(oControlEvent) {
				// var oModel = sap.ui.getCore().getModel("chatModel");
				// var result = oModel.getData();
				//
				// var data = jQuery.parseJSON();
				// msg = data.user + ": " + data.text,
				// lastInfo = result.chat;
				//
				// if (lastInfo.length > 0) {
				// lastInfo += "\r\n";
				// }
				// oModel.setData({
				// chat: lastInfo + msg
				// }, true);

				try {
					var oMsg = JSON.parse(oControlEvent.getParameter("data"));

				} catch (e) {
					sap.m.MessageToast.show(oControlEvent.getParameter("data"));
				}
				if (oMsg) {
					if (oMsg.command === "console") {
						var oConsoleObject = {
							alias: oMsg.alias,
							topic: oMsg.topic,
							message: formatter.parseConsole(oMsg.msg)
						};

						this.getOwnerComponent().getModel("console").getData().push(oConsoleObject);
						this.getOwnerComponent().getModel("console").refresh(true);
					} else if (oMsg.command === "system") {
						var oDevice = this.getDevicebyAlias(oMsg.alias);
						if (oDevice) {

							oDevice.connected = oMsg.connected;

						}

					} else if (oMsg.command === "scanResults") {
						debugger;

						var aTopics = JSON.parse(oMsg.msg);

						var oTopicList = {
							alias: oMsg.alias,
							topics: aTopics
						};
						this.getOwnerComponent().getModel("topics").getData().push(oTopicList);
						this.getOwnerComponent().getModel("topics").refresh(true);

					}

					var oDevice = this.getDevicebyAlias(oMsg.alias);
					var currDevAlias = this.getOwnerComponent().getModel("global").getProperty("/selectedDeviceAlias");
					if (currDevAlias === oDevice.alias) {
						this.refreshScreenControls(oDevice);

					}

				} else {

					var itemsModel = this.getOwnerComponent().getModel("items");
					for (var i = 0; i < itemsModel.getData().length; i++) {
						if (itemsModel.getData()[0] !== oControlEvent.getParameter("data")) {
							itemsModel.getData().push({
								topic: oControlEvent.getParameter("data")
							});
							break;
						}

					}

					sap.m.MessageToast.show(oControlEvent.getParameter("data"));
				}

			}.bind(this));

			// error handling
			connection.attachError(function(oControlEvent) {
				sap.m.MessageToast.show("Websocket connection error");
			});

			// onConnectionClose
			connection.attachClose(function(oControlEvent) {
				sap.m.MessageToast.show("Websocket connection closed");
			});

			var item = {
				topic: ""
			};
			var items = [item];
			var jModel = new sap.ui.model.json.JSONModel();
			jModel.setData(items)
			this.getOwnerComponent().setModel(jModel, "items");

		},

		// send message
		sendMsg: function() {
			var oModel = sap.ui.getCore().getModel("chatModel");
			var result = oModel.getData();
			var msg = result.chat;
			if (msg.length > 0) {
				connection.send(JSON.stringify({
					user: result.user,
					text: result.message
				}));
				oModel.setData({
					message: ""
				}, true);
			}
		},

		onErrorCall: function(oError) {
			if (oError.response.statusCode === 500 || oError.response.statusCode === 400) {
				var errorRes = JSON.parse(oError.response.body);
				sap.m.MessageBox.alert(errorRes.error.message.value);
				return;
			} else {
				sap.m.MessageBox.alert(oError.response.statusText);
				return;
			}
		},

		onPressNavToDetail: function(oEvent) {
			this.getSplitAppObj().to(this.createId("detailDetail"));
		},

		onPressNavToDetail2: function(oEvent) {
			this.getSplitAppObj().to(this.createId("detail2"));
		},

		onPressDetailBack: function() {
			this.getSplitAppObj().backDetail();
		},

		onPressMasterBack: function() {
			this.getSplitAppObj().backMaster();
		},

		refreshScreenControls: function(device) {
			if (device.connected) {
				this.getView().byId("connectBtn").setEnabled(false);
				this.getView().byId("disconnectBtn").setEnabled(true);
				this.getView().byId("scanBtn").setEnabled(true);
				this.getView().byId("configBtn").setEnabled(true);
				this.getView().byId("advConf").setEnabled(true);
				

			} else {
				this.getView().byId("connectBtn").setEnabled(true);
				this.getView().byId("disconnectBtn").setEnabled(false);
				this.getView().byId("scanBtn").setEnabled(false);
				this.getView().byId("configBtn").setEnabled(false);
				this.getView().byId("advConf").setEnabled(false);

			}

		},

		onPressGoToMaster: function(oEvent) {
			this.getSplitAppObj().toMaster(this.createId("master2"));
			var index = oEvent.getSource().getBindingContextPath();
			this.getOwnerComponent().getModel("global").setProperty("/selectedDeviceIndex", index);
			var oDevice = this.getOwnerComponent().getModel("devices").getProperty(index);
			this.getOwnerComponent().getModel("global").setProperty("/selectedDeviceAlias", oDevice.alias);

			this.refreshScreenControls(oDevice);

		},

		onListItemPress: function(oEvent) {
			var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();

			this.getSplitAppObj().toDetail(this.createId(sToPageId));
		},

		onPressModeBtn: function(oEvent) {
			var sSplitAppMode = oEvent.getSource().getSelectedButton().getCustomData()[0].getValue();

			this.getSplitAppObj().setMode(sSplitAppMode);
			MessageToast.show("Split Container mode is changed to: " + sSplitAppMode, {
				duration: 5000
			});
		},

		getSelectedDevice: function() {

			var index = this.getOwnerComponent().getModel("global").getProperty("/selectedDeviceIndex");
			return this.getOwnerComponent().getModel("devices").getProperty(index);
		},

		getDevicebyAlias: function(alias) {

			var devices = this.getOwnerComponent().getModel("devices").getData();

			for (var i = 0; i < devices.length; i++) {
				if (devices[i].alias === alias) {
					return devices[i];
				}

			}
		},

		getSplitAppObj: function() {
			var result = this.byId("SplitAppDemo");
			if (!result) {
				jQuery.sap.log.info("SplitApp object can't be found");
			}
			return result;
		},

		handlePressOpenMenu: function(oEvent) {
			var oButton = oEvent.getSource();
			this.getOwnerComponent().getModel("mainOdataModel").read("/DeviceHeaders", {success: function(oData,result){debugger;},
																					   error:function(oError){debugger;}
					
			});

			// create menu only once
			if (!this._menu) {
				this._menu = sap.ui.xmlfragment(
					"mqtt_viewer.mqtt_viewer.view.fragment.connectionsMenu",
					this
				);
				this.getView().addDependent(this._menu);
			}

			var eDock = sap.ui.core.Popup.Dock;
			this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
		},

		onDisconnectPress: function() {

			var device = this.getSelectedDevice();
			if (device) {
				device.command = "MQTTdisconnect";
				connection.send(JSON.stringify(device));
			} else {
				sap.m.MessageToast.show("No device selected");
			}

		},

		onPressScanTopics: function() {

			var device = this.getOwnerComponent().getModel("devices").getProperty("/0");
			if (device) {
				device.command = "MQTTscan";
				connection.send(JSON.stringify(device));
			} else {
				sap.m.MessageToast.show("No device selected");
			}

		},

		onConnectPress: function() {

			var device = this.getOwnerComponent().getModel("devices").getProperty("/0");
			if (device) {
				device.command = "MQTTconnect";
				connection.send(JSON.stringify(device));
			} else {
				sap.m.MessageToast.show("No device selected");
			}
		},

		handleMenuItemPress: function(oEvent) {
			if (oEvent.getParameter("item").getSubmenu()) {
				return;
			}

			var msg = "";
			if (oEvent.getParameter("item").getMetadata().getName() == "sap.ui.unified.MenuTextFieldItem") {
				msg = "'" + oEvent.getParameter("item").getValue() + "' entered";
			} else {
				msg = "'" + oEvent.getParameter("item").getText() + "' pressed";
			}

			var sDialogName = "connectionDialog";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext();
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oView;
			if (!oDialog) {
				this.getOwnerComponent().runAsOwner(function() {
					oView = sap.ui.xmlview({
						viewName: "mqtt_viewer.mqtt_viewer.view.dialog." + sDialogName
					});
					this.getView().addDependent(oView);
					oView.getController().setRouter(this.oRouter);
					oDialog = oView.getContent()[0];
					this.mDialogs[sDialogName] = oDialog;
				}.bind(this));
			}

			return new Promise(function(fnResolve) {
				oDialog.attachEventOnce("afterOpen", null, fnResolve);
				oDialog.open();
				if (oView) {
					oDialog.attachAfterOpen(function() {
						oDialog.rerender();
					});
				} else {
					oView = oDialog.getParent();
				}

				var oModel = this.getView().getModel();
				if (oModel) {
					oView.setModel(oModel);
				}
				if (sPath) {
					var oParams = oView.getController().getBindingParameters();
					oView.bindObject({
						path: sPath,
						parameters: oParams
					});
				}
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
	});
});