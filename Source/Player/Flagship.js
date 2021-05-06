"use strict";
class Flagship {
    constructor(name, thrustersMax, turningJetsMax, componentsBackboneMax, componentNames, numberOfLanders, crew, fuel, items, shipsMax) {
        this.name = name;
        this.thrustersMax = thrustersMax;
        this.turningJetsMax = turningJetsMax;
        this.componentsBackboneMax = componentsBackboneMax;
        this.componentNames = componentNames;
        this.numberOfLanders = numberOfLanders;
        this.crew = crew;
        this.fuel = fuel;
        this.itemHolder = ItemHolder.fromItems(items);
        this.shipsMax = shipsMax;
        this.cachesCalculate();
    }
    cachesCalculate() {
        this._cargoMax = 0;
        this._crewMax = 0;
        this._fuelMax = 0;
        this._components = null;
        this._componentsThruster = null;
        this._componentsTurningJets = null;
        var components = this.components();
        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            component.applyToFlagship(this);
        }
    }
    cargoCurrent() {
        return 0; // todo
    }
    cargoCurrentOverMax() {
        return this.cargoCurrent() + "/" + this._cargoMax;
    }
    components() {
        if (this._components == null) {
            this._components =
                this.componentsByCategories(ShipComponentCategory.Instances()._All);
        }
        return this._components;
    }
    componentsBackbone() {
        if (this._componentsBackbone == null) {
            this._componentsBackbone =
                this.componentsByCategories([ShipComponentCategory.Instances().Backbone]);
        }
        return this._componentsBackbone;
    }
    componentsByCategories(categoriesToInclude) {
        var components = [];
        var componentNames = this.componentNames;
        for (var i = 0; i < componentNames.length; i++) {
            var componentName = componentNames[i];
            var componentDefn = ShipComponentDefn.byName(componentName);
            var categories = componentDefn.categoryNames;
            for (var c = 0; c < categories.length; c++) {
                var category = categories[c];
                if (ArrayHelper.contains(categoriesToInclude, category)) {
                    components.push(componentDefn);
                    break;
                }
            }
        }
        return components;
    }
    componentsBackboneCurrentOverMax() {
        return this.componentsBackbone().length + "/" + this.componentsBackboneMax;
    }
    componentsCargo() {
        if (this._componentsCargo == null) {
            this._componentsCargo =
                this.componentsByCategories([ShipComponentCategory.Instances().Cargo]);
        }
        return this._componentsCargo;
    }
    componentsCrew() {
        if (this._componentsCrew == null) {
            this._componentsCrew =
                this.componentsByCategories([ShipComponentCategory.Instances().Crew]);
        }
        return this._componentsCrew;
    }
    componentsFuel() {
        if (this._componentsFuel == null) {
            this._componentsFuel =
                this.componentsByCategories([ShipComponentCategory.Instances().Fuel]);
        }
        return this._componentsFuel;
    }
    componentsThruster() {
        if (this._componentsThruster == null) {
            this._componentsThruster =
                this.componentsByCategories([ShipComponentCategory.Instances().Thruster]);
        }
        return this._componentsThruster;
    }
    componentsTurningJets() {
        if (this._componentsTurningJets == null) {
            this._componentsTurningJets =
                this.componentsByCategories([ShipComponentCategory.Instances().TurningJets]);
        }
        return this._componentsTurningJets;
    }
    componentsWeapon() {
        if (this._componentsWeapon == null) {
            this._componentsWeapon =
                this.componentsByCategories([ShipComponentCategory.Instances().Weapon]);
        }
        return this._componentsWeapon;
    }
    crewCurrentOverMax() {
        return this.crew + "/" + this._crewMax;
    }
    fuelCurrentOverMax() {
        return NumberHelper.roundToDecimalPlaces(this.fuel, 1) + "/" + this._fuelMax;
    }
    thrustersCurrent() {
        return this.componentsThruster().length;
    }
    thrustersCurrentOverMax() {
        return this.thrustersCurrent() + "/" + this.thrustersMax;
    }
    turningJetsCurrent() {
        return this.componentsTurningJets().length;
    }
    turningJetsCurrentOverMax() {
        return this.turningJetsCurrent() + "/" + this.turningJetsMax;
    }
}
