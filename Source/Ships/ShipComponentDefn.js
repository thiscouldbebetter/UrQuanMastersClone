"use strict";
class ShipComponentDefn {
    constructor(name, categoryNames, value, applyToFlagship) {
        this.name = name;
        this.categoryNames = categoryNames;
        this.value = value;
        this.applyToFlagship = applyToFlagship;
    }
    static Instances() {
        if (ShipComponentDefn._instances == null) {
            ShipComponentDefn._instances = new ShipComponentDefn_Instances();
        }
        return ShipComponentDefn._instances;
    }
    static byName(shipComponentDefnName) {
        return ShipComponentDefn.Instances()._AllByName.get(shipComponentDefnName);
    }
    // instance methods
    nameAndValue() {
        return this.name + "(" + this.value + ")";
    }
}
class ShipComponentCategory {
    static Instances() {
        if (ShipComponentCategory._instances == null) {
            ShipComponentCategory._instances = new ShipComponentCategory_Instances();
        }
        return ShipComponentCategory._instances;
    }
}
class ShipComponentCategory_Instances {
    constructor() {
        this.Backbone = "Backbone";
        this.Cargo = "Cargo";
        this.Crew = "Crew";
        this.Energy = "Energy";
        this.Fuel = "Fuel";
        this.Propulsion = "Propulsion";
        this.Thruster = "Thruster";
        this.TurningJets = "TurningJets";
        this.Weapon = "Weapon";
        this._All =
            [
                this.Backbone,
                this.Cargo,
                this.Crew,
                this.Energy,
                this.Fuel,
                this.Propulsion,
                this.Thruster,
                this.TurningJets,
                this.Weapon,
            ];
        return this;
    }
}
class ShipComponentDefn_Instances {
    constructor() {
        var categories = ShipComponentCategory.Instances();
        var categoryBackbone = categories.Backbone;
        var categoryCargo = categories.Cargo;
        var categoryCrew = categories.Crew;
        var categoryEnergy = categories.Energy;
        var categoryFuel = categories.Fuel;
        var categoryThruster = categories.Thruster;
        var categoryTurningJets = categories.TurningJets;
        var categoryWeapon = categories.Weapon;
        var noEffect = (flagship) => { };
        this.CargoHold = new ShipComponentDefn("Cargo Hold", [categoryBackbone, categoryCargo], 100, (flagship) => flagship._cargoMax += 100);
        this.CrewHabitat = new ShipComponentDefn("Crew Habitat", [categoryBackbone, categoryCrew], 100, (flagship) => flagship._crewMax += 50);
        this.FuelTank = new ShipComponentDefn("Fuel Tank", [categoryBackbone, categoryFuel], 100, // value
        (flagship) => flagship._fuelMax += 100);
        this.IonCannon = new ShipComponentDefn("Ion Cannon", [categoryBackbone, categoryWeapon], 100, noEffect);
        this.FusionThruster = new ShipComponentDefn("Fusion Thruster", [categoryThruster], 100, (flagship) => flagship._acceleration++);
        this.PowerPlant = new ShipComponentDefn("Power Plant", [categoryBackbone, categoryEnergy], 100, (flagship) => flagship._energyPerTick++);
        this.TurningJets = new ShipComponentDefn("Turning Jets", [categoryTurningJets], 100, (flagship) => flagship._turnsPerTick++);
        this._All =
            [
                this.TurningJets,
                this.CargoHold,
                this.CrewHabitat,
                this.FuelTank,
                this.IonCannon,
                this.FusionThruster,
                this.PowerPlant,
            ];
        this._AllByName = ArrayHelper.addLookupsByName(this._All);
        this._AllBackbone =
            [
                this.CargoHold,
                this.CrewHabitat,
                this.FuelTank,
                this.IonCannon,
                this.PowerPlant,
            ];
    }
}
