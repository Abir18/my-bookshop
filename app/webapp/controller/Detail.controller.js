sap.ui.define(
    [
        "sap/m/MessageBox",
        "sap/ui/core/mvc/Controller",
        "sap/f/library",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/Fragment"
    ],
    function (MessageBox, Controller, fioriLibrary, JSONModel, Fragment) {
        "use strict";

        let customerModel;
        return Controller.extend("sap.test.routing.controller.Detail", {
            onInit: function () {
                var oOwnerComponent = this.getOwnerComponent();

                this.oRouter = oOwnerComponent.getRouter();
                customerModel = oOwnerComponent.getModel("customers");

                this.oRouter
                    .getRoute("master")
                    .attachPatternMatched(this._onProductMatched, this);
                this.oRouter
                    .getRoute("detail")
                    .attachPatternMatched(this._onProductMatched, this);
            },

            _onProductMatched: function (oEvent) {
                const productIndex = oEvent.getParameter("arguments").product;

                const that = this;
                if (productIndex) {
                    this.byId("detail_form").bindElement({
                        path: `customers>/Customers('${productIndex}')`,
                        parameters: { $$updateGroupId: "customerGroup" }
                    });

                    if (productIndex == "new") {
                        const randomId = parseInt(Date.now() + Math.random())
                            .toString()
                            .slice(6);

                        console.log(randomId, "rrr");

                        this.byId("detail_form").bindElement(
                            `customers>/Customers('${randomId}')`
                        );

                        this.byId("app_input_orderno").setValue(randomId);
                    } else {
                        const oModel = that.getView().getModel("customers");

                        console.log("oModel", oModel);

                        if (oModel) {
                            // const productData = oModel.getData();

                            // console.log("productData", productData);

                            // const countryName =
                            //     productData[productIndex].Country;

                            const countryName = this.byId("app_input_country");

                            const countriesData = this.getView()
                                .getModel("countries")
                                .getData();

                            const selectedCountryData = countriesData.find(
                                (country) => country.countryName === countryName
                            );

                            const cityModel = new JSONModel(
                                selectedCountryData
                            );

                            this.getView().setModel(cityModel, "cityName");
                        }
                    }
                }
            },

            onEditToggleButtonPress: function () {
                var oObjectPage = this.getView().byId("ObjectPageLayout"),
                    bCurrentShowFooterState = oObjectPage.getShowFooter();

                oObjectPage.setShowFooter(!bCurrentShowFooterState);
            },

            onExit: function () {
                this.oRouter
                    .getRoute("master")
                    .detachPatternMatched(this._onProductMatched, this);
                this.oRouter
                    .getRoute("detail")
                    .detachPatternMatched(this._onProductMatched, this);
            },

            // When User Click Close Button of Side Panel
            onCancelPressed: function (oRouter = null) {
                // var oFCL = this.oView.getParent().getParent();
                // oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);

                this.byId("app_input_country").setValue("");
                this.byId("app_input_city").setValue("");
                this.byId("app_input_date").setValue("");

                this.routeToOneColumn(oRouter);
            },

            routeToOneColumn: function (oRouter = null) {
                if (this.oRouter) {
                    oRouter = this.oRouter;
                }

                if (oRouter !== null) {
                    oRouter.navTo("master", {
                        layout: fioriLibrary.LayoutType.OneColumn
                    });
                }
            },

            handleValueHelp: function () {
                var oView = this.getView();

                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "sap.test.routing.view.ValueHelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._pValueHelpDialog.then(
                    function (oValueHelpDialog) {
                        this._configValueHelpDialog();
                        oValueHelpDialog.open();
                    }.bind(this)
                );
            },

            _configValueHelpDialog: function () {
                // var sInputValue = this.byId("productInput").getValue(),
                //     oModel = this.getView().getModel("products"),
                //     aProducts = oModel.getProperty("/ProductCollection");
                // aProducts.forEach(function (oProduct) {
                //     oProduct.selected = oProduct.Name === sInputValue;
                // });
                // oModel.setProperty("/ProductCollection", aProducts);
            },
            handleValueHelpSelect: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem"),
                    oInput = this.byId("app_input_customername");

                oSelectedItem.getCells();

                if (!oSelectedItem) {
                    oInput.resetProperty("value");

                    return;
                }
                oInput.setValue(oSelectedItem.getCells()[1].getText());
            },
            handleValueHelpClose: function (oEvent) {
                // var oSelectedItem = oEvent.getParameter("listItem"),
                //     oInput = this.byId("app_input_customername");
                // console.log("oSelectedItem", oSelectedItem);
                // oSelectedItem.getCells();
                // if (!oSelectedItem) {
                //     oInput.resetProperty("value");
                //     return;
                // }
                // oInput.setValue(oSelectedItem.getCells()[1].getText());
            },

            onCountryChange: function (oEvent) {
                // console.log(oEvent.getParameters().selectedItem.sId.slice(-1));

                const selectedCountryIndex = oEvent
                    .getParameters()
                    .selectedItem.sId.slice(-1);

                const selectedCountryId = parseInt(selectedCountryIndex) + 1;
                // console.log(selectedCountryId);

                const countriesData = this.getView()
                    .getModel("countries")
                    .getData();

                // console.log(countriesData, "countriesData");

                const selectedCountryData = countriesData.find(
                    (country) => country.countryId === selectedCountryId
                );
                // console.log(selectedCountryData);

                const cityModel = new JSONModel(selectedCountryData);

                this.getView().setModel(cityModel, "cityName");

                this.byId("app_input_city").setSelectedKey("");
            },

            _dataFormat: {
                ProductCollection: []
            },

            //For backend

            onSavePressed: function () {
                // Update Existing Customer

                const that = this;

                // const id = this.byId("app_input_orderno").getValue();
                const customername = this.byId(
                    "app_input_customername"
                ).getValue();

                if (customername) {
                    const orderId = this.byId("app_input_orderno").getValue();
                    const customerName = this.byId(
                        "app_input_customername"
                    ).getValue();
                    const countryName = this.byId("app_input_country")
                        ?.getSelectedItem()
                        ?.getText();
                    const cityName = this.byId("app_input_city")
                        ?.getSelectedItem()
                        ?.getText();

                    const date = this.byId("app_input_date").getValue();

                    if (
                        customerName == "" ||
                        countryName == "" ||
                        cityName == "" ||
                        date == ""
                    ) {
                        // console.log("nNot found");
                        return;
                    }

                    const updatedCustomerData = {
                        OrderId: orderId,
                        CustomerName: customerName,
                        City: cityName,
                        Country: countryName,

                        // Address: `${cityName || "Dhaka"}, ${
                        //     countryName || "Bangladesh"
                        // }`,
                        Date: new Date(date).toLocaleDateString("en-us", {
                            weekday: "long",
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        }),
                        // Date: date
                        Delivered: false
                    };

                    console.log("Called from up");

                    this.getView()
                        .getModel("customers")
                        .submitBatch("customerGroup")
                        .then(
                            () => console.log("Updated from oData"),
                            (e) => console.log("e", e)
                        );

                    this.oRouter.navTo("master", {
                        layout: fioriLibrary.LayoutType.OneColumn
                    });
                    this.getView().getModel("customers").refresh();
                } else {
                    // Create New Customer

                    const orderId = this.byId("app_input_orderno").getValue();
                    console.log("orderId", orderId);
                    const customerName = this.byId(
                        "app_input_customername"
                    ).getValue();

                    const countryName = this.byId("app_input_country")
                        ?.getSelectedItem()
                        ?.getText();
                    const cityName = this.byId("app_input_city")
                        ?.getSelectedItem()
                        ?.getText();

                    const date = this.byId("app_input_date").getValue();

                    if (
                        customerName == "" ||
                        countryName == "" ||
                        cityName == "" ||
                        date == ""
                    ) {
                        // console.log("Not found");
                        return;
                    }

                    const newCustomerData = {
                        OrderId: orderId,
                        CustomerName: customerName,
                        City: cityName,
                        Country: countryName,
                        // Address: `${cityName}, ${countryName}`,
                        Date: new Date(date).toLocaleDateString("en-us", {
                            weekday: "long",
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        }),
                        Delivered: false
                        // Date: date
                    };

                    const oNewCustomerContext = this.getView()
                        .getModel("customers")
                        .bindList("/Customers");

                    let oNewCustomerContextCreated = oNewCustomerContext.create(
                        newCustomerData,
                        true
                    );
                    oNewCustomerContextCreated
                        .created()
                        .then(() => (oError) => {
                            MessageBox.error(oError.message);
                        });

                    this.oRouter.navTo("master", {
                        layout: fioriLibrary.LayoutType.OneColumn
                    });
                    this.getView().getModel("customers").refresh();

                    this.byId("app_input_country").setValue("");
                    this.byId("app_input_city").setValue("");
                    this.byId("app_input_date").setValue("");

                    // sap.ui.getCore().byId("gridTable").getModel().refresh(true);

                    // this.getView().getModel("products").refresh();
                }
            }
        });
    }
);
