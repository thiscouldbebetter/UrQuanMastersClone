"use strict";
class Flagship {
    constructor(name, thrustersMax, turningJetsMax, componentsBackboneMax, componentNames, numberOfLanders, crew, fuel, resourceCredits, infoCredits, itemsCargo, shipsMax) {
        this.name = name;
        this.thrustersMax = thrustersMax;
        this.turningJetsMax = turningJetsMax;
        this.componentsBackboneMax = componentsBackboneMax;
        this.componentNames = componentNames;
        this.numberOfLanders = numberOfLanders;
        this.crew = crew;
        this.fuel = fuel;
        this.resourceCredits = resourceCredits;
        this.infoCredits = infoCredits;
        this.itemHolderCargo = this.itemHolderCargoBuildOrUpdate(itemsCargo);
        this.itemHolderDevices = ItemHolder.default();
        this.itemHolderLifeforms = ItemHolder.default();
        this.shipsMax = shipsMax;
        this.cachesCalculate();
    }
    biodataSell(world) {
        var value = this.resourcesBelongingToCategorySell(world, this.itemHolderLifeforms, ResourceDefn.CategoryBiodataName);
        this.infoCredits += value;
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
        return this.itemHolderCargo.encumbranceOfAllItemsOverMax(world);
    }
    cargoSell(world) {
        var value = this.resourcesBelongingToCategorySell(world, this.itemHolderCargo, ResourceDefn.CategoryMineralName);
        this.resourceCredits += value;
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
    deviceWithNameUse(deviceName, uwpe) {
        var itemToUse = this.itemHolderDevices.itemByDefnName(deviceName);
        if (itemToUse == null) {
            throw new Error("No device found with name: '" + deviceName + "'.");
        }
        else {
            itemToUse.use(uwpe);
        }
    }
    fuelAdd(increment) {
        var fuelAfterAdd = this.fuel + increment;
        if (fuelAfterAdd > this._fuelMax) {
            fuelAfterAdd = this._fuelMax;
        }
        this.fuel = fuelAfterAdd;
        return this;
    }
    fuelCurrentOverMax() {
        var fuelMax = this.fuelMax();
        return NumberHelper.roundToDecimalPlaces(this.fuel, 1) + "/" + fuelMax;
    }
    fuelMax() {
        return this._fuelMax;
    }
    fuelNeededToFillToCapacity() {
        var fuelMax = this.fuelMax();
        var fuelNeeded = Math.floor(fuelMax - this.fuel);
        return fuelNeeded;
    }
    fuelSubtract(decrement) {
        var fuelAfterSubtract = this.fuel - decrement;
        if (fuelAfterSubtract < 0) {
            fuelAfterSubtract = 0;
        }
        this.fuel = fuelAfterSubtract;
        return this;
    }
    hasDeviceWithName(deviceName) {
        return this.itemHolderDevices.hasItemWithDefnName(deviceName);
    }
    hasInfoCredits() {
        return this.hasInfoCreditsAtLeast(1);
    }
    hasInfoCreditsAtLeast(minimumAmount) {
        return (this.infoCredits > minimumAmount);
    }
    hasInfoToSell(world) {
        var returnValue = this.hasInfoToSell_Biodata()
            || this.hasInfoToSell_PrecursorArtifacts(world);
        return returnValue;
    }
    hasInfoToSell_Biodata() {
        return this.itemHolderLifeforms.hasItemWithDefnName("Biodata");
    }
    hasInfoToSell_PrecursorArtifacts(world) {
        return this.itemHolderDevices.hasItemWithCategoryName("PrecursorArtifact", world);
    }
    infoCreditsTradeForFuel(fuelToBuy) {
        var infoCreditsPerFuelUnit = 1;
        var infoCreditsToSpend = fuelToBuy * infoCreditsPerFuelUnit;
        this.infoCredits -= infoCreditsToSpend;
        this.fuel += fuelToBuy;
    }
    itemHolderCargoBuildOrUpdate(itemsInitial) {
        if (this.itemHolderCargo == null) {
            this.itemHolderCargo =
                ItemHolder
                    .create()
                    .retainsItemsWithZeroQuantitiesSet(true)
                    .itemsAdd(ResourceDefn.Instances()._All.map(x => Resource.fromDefnName(x.name).toItem()))
                    .itemsAdd(itemsInitial);
        }
        // todo - Set max.
        return this.itemHolderCargo;
    }
    resourcesBelongingToCategorySell(world, itemHolder, resourceCategoryName) {
        var itemsForResources = itemHolder.itemsBelongingToCategoryWithName(resourceCategoryName, world);
        var itemValues = itemsForResources.map(x => x.tradeValue(world));
        var itemValueTotal = 0;
        itemValues.forEach(x => itemValueTotal += x);
        itemsForResources.forEach(x => itemHolder.itemSubtract(x));
        return itemValueTotal;
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
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, labelSize.y * 2), labelSize, DataBinding.fromContext("Crew:"), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x * 4, labelSize.y * 2), labelSize, DataBinding.fromContextAndGet(flagship, (c) => c.crewCurrentOverMax()), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, labelSize.y * 3), labelSize, DataBinding.fromContext("Fuel:"), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x * 4, labelSize.y * 3), labelSize, DataBinding.fromContextAndGet(flagship, (c) => c.fuelCurrentOverMax()), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, labelSize.y * 4), labelSize, DataBinding.fromContext("Landers:"), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x * 6, labelSize.y * 4), labelSize, DataBinding.fromContextAndGet(flagship, (c) => "" + c.numberOfLanders), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, labelSize.y * 5), labelSize, DataBinding.fromContext("Cargo:"), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x * 5, labelSize.y * 5), labelSize, DataBinding.fromContextAndGet(flagship, (c) => c.cargoCurrentOverMax(world)), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, labelSize.y * 6), labelSize, DataBinding.fromContext("Loc:"), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x * 4, labelSize.y * 6), labelSize, DataBinding.fromContextAndGet(world.player.shipGroup, (c) => c.posInHyperspace(world).toStringXY()), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, labelSize.y * 7), labelSize, DataBinding.fromContext("Date:"), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x * 4, labelSize.y * 7), labelSize, DataBinding.fromContextAndGet(world.player.shipGroup, (c) => world.gameTimeAsString().split("T")[0]), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, labelSize.y * 8), labelSize, DataBinding.fromContext("Time:"), font),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x * 4, labelSize.y * 8), labelSize, DataBinding.fromContextAndGet(world.player.shipGroup, (c) => world.gameTimeAsString().split("T")[1].split(":").slice(0, 2).join(":")), font),
        ]);
        return containerFlagship;
    }
}
