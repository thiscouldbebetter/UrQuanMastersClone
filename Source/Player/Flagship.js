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
        this.itemHolderCargo = this.itemHolderCargoBuildOrUpdate(items);
        this.itemHolderOther = ItemHolder.create();
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
    cargoCurrentOverMax(world) {
        return this.itemHolderCargo.massOfAllItemsOverMax(world);
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
    hasInfoToSell(world) {
        var returnValue = (this.itemHolderOther.hasItemWithDefnName("Biodata")
            || this.itemHolderOther.hasItemWithDefnName("RainbowWorldLocations")
            || this.itemHolderOther.hasItemWithCategoryName("PrecursorArtifact", world));
        return returnValue;
    }
    itemHolderCargoBuildOrUpdate(items) {
        if (this.itemHolderCargo == null) {
            this.itemHolderCargo = ItemHolder.fromItems(items);
        }
        // todo - Set max.
        return this.itemHolderCargo;
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
    // Controls.
    toControlSidebar(world) {
        var flagship = this;
        var containerSidebarSize = Coords.fromXY(100, 300); // hack
        var marginWidth = 8;
        var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
        var fontHeight = 10;
        var font = FontNameAndHeight.fromHeightInPixels(fontHeight);
        var childControlWidth = containerSidebarSize.x - marginWidth * 2;
        var labelSize = Coords.fromXY(childControlWidth, fontHeight);
        var containerFlagshipSize = Coords.fromXY(containerSidebarSize.x - marginSize.x * 2, (containerSidebarSize.y - marginSize.x * 3) * 0.4);
        var containerFlagship = ControlContainer.from4("containerFlagship", Coords.fromXY(marginSize.x, marginSize.y), // hack - pos
        containerFlagshipSize, 
        // children
        [
            new ControlLabel("labelFlagship", Coords.fromXY(0, labelSize.y), // pos
            labelSize, true, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext(flagship.name), font),
            new ControlLabel("labelCrew", Coords.fromXY(marginSize.x, labelSize.y * 2), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Crew:"), font),
            new ControlLabel("infoCrew", Coords.fromXY(marginSize.x * 4, labelSize.y * 2), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(flagship, (c) => c.crewCurrentOverMax()), font),
            new ControlLabel("labelFuel", Coords.fromXY(marginSize.x, labelSize.y * 3), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Fuel:"), font),
            new ControlLabel("infoFuel", Coords.fromXY(marginSize.x * 4, labelSize.y * 3), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(flagship, (c) => c.fuelCurrentOverMax()), font),
            new ControlLabel("labelLanders", Coords.fromXY(marginSize.x, labelSize.y * 4), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Landers:"), font),
            new ControlLabel("infoLanders", Coords.fromXY(marginSize.x * 6, labelSize.y * 4), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(flagship, (c) => "" + c.numberOfLanders), font),
            new ControlLabel("labelCargo", Coords.fromXY(marginSize.x, labelSize.y * 5), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Cargo:"), font),
            new ControlLabel("infoCargo", Coords.fromXY(marginSize.x * 5, labelSize.y * 5), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(flagship, (c) => c.cargoCurrentOverMax(world)), font),
            new ControlLabel("labelPosition", Coords.fromXY(marginSize.x, labelSize.y * 6), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Loc:"), font),
            new ControlLabel("infoPosition", Coords.fromXY(marginSize.x * 4, labelSize.y * 6), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(world.player.shipGroup, (c) => c.posInHyperspace(world).toStringXY()), font),
            new ControlLabel("labelDate", Coords.fromXY(marginSize.x, labelSize.y * 7), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Date:"), font),
            new ControlLabel("infoDate", Coords.fromXY(marginSize.x * 4, labelSize.y * 7), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(world.player.shipGroup, (c) => world.gameTimeAsString().split("T")[0]), font),
            new ControlLabel("labelTime", Coords.fromXY(marginSize.x, labelSize.y * 8), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContext("Time:"), font),
            new ControlLabel("infoTime", Coords.fromXY(marginSize.x * 4, labelSize.y * 8), labelSize, false, // isTextCenteredHorizontally
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(world.player.shipGroup, (c) => world.gameTimeAsString().split("T")[1].split(":").slice(0, 2).join(":")), font),
        ]);
        return containerFlagship;
    }
}
