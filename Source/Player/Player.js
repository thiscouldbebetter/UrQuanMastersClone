"use strict";
class Player {
    constructor(name, flagship, factionsKnownNames, shipGroup) {
        this.name = name;
        this.flagship = flagship;
        this.factionsKnownNames = factionsKnownNames;
        this.shipGroup = shipGroup;
        this.variableLookup = new Map();
        // Abbreviate for scripts.
        this.vars = this.variableLookup;
        this._rainbowWorldLocations = [];
    }
    static activityDefn() {
        return new ActivityDefn("AcceptUserInput", Player.activityDefnPerform);
    }
    static activityDefnPerform(uwpe) {
        // todo - Replace this with equivalent from Framework?
        var universe = uwpe.universe;
        var world = uwpe.world;
        var place = uwpe.place;
        var inputHelper = universe.inputHelper;
        var placeDefn = place.defn(world);
        var actionsByName = placeDefn.actionsByName;
        var actionToInputsMappingsByInputName = placeDefn.actionToInputsMappingsByInputName;
        var actionsToPerform = inputHelper.actionsFromInput(actionsByName, actionToInputsMappingsByInputName);
        for (var i = 0; i < actionsToPerform.length; i++) {
            var action = actionsToPerform[i];
            if (action != null) // Can't fire in some places.
             {
                action.perform(uwpe);
            }
        }
    }
    cachesCalculate() {
        this._factionsKnown = null;
        this.flagship.cachesCalculate();
    }
    factionsAllied(world) {
        if (this._factionsAllied == null) {
            this._factionsAllied = [];
            var factionsKnown = this.factionsKnown(world);
            for (var i = 0; i < factionsKnown.length; i++) {
                var faction = factionsKnown[i];
                if (faction.relationsWithPlayer == Faction.RelationsAllied) {
                    this._factionsAllied.push(faction);
                }
            }
        }
        return this._factionsAllied;
    }
    factionsKnown(world) {
        if (this._factionsKnown == null) {
            this._factionsKnown = [];
            for (var i = 0; i < this.factionsKnownNames.length; i++) {
                var factionName = this.factionsKnownNames[i];
                var faction = world.defnExtended().factionByName(factionName);
                this._factionsKnown.push(faction);
            }
        }
        return this._factionsKnown;
    }
    hasInfoCredits() {
        return this.flagship.hasInfoCredits();
    }
    hasInfoToSell(world) {
        var returnValue = this.hasInfoToSell_RainbowWorldLocations()
            || this.flagship.hasInfoToSell(world);
        return returnValue;
    }
    hasInfoToSell_RainbowWorldLocations() {
        return (this.rainbowWorldLocationsKnownButUnsoldCount() > 0);
    }
    initialize(uwpe) {
        var ships = this.shipGroup.ships;
        for (var i = 0; i < ships.length; i++) {
            var ship = ships[i];
            ship.initialize(uwpe);
        }
    }
    rainbowWorldLocationsKnownButUnsoldCount() {
        var returnValue = this._rainbowWorldLocations.filter(x => x.sold == false).length;
        return returnValue;
    }
    rainbowWorldLocationsSell() {
        var locationsToSell = this.rainbowWorldLocationsKnownButUnsoldCount();
        const infoCreditsPerLocation = 500;
        var locationsValue = locationsToSell * infoCreditsPerLocation;
        this.flagship.infoCredits += locationsValue;
        this._rainbowWorldLocations.forEach(x => x.sold = true);
    }
    rainbowWorldKnownStarsystemAdd(starsystemContainingRainbowWorld) {
        var starsystemName = starsystemContainingRainbowWorld.name;
        var rainbowWorldIsAlreadyKnown = this._rainbowWorldLocations.some(x => x.starsystemName == starsystemName);
        if (rainbowWorldIsAlreadyKnown == false) {
            var rainbowWorldLocation = new RainbowWorldLocation(starsystemName, false);
            this._rainbowWorldLocations.push(rainbowWorldLocation);
        }
    }
    shipComponentDefnsKnown() {
        if (this._shipComponentDefnsKnown == null) {
            this._shipComponentDefnsKnown =
                ShipComponentDefn.Instances()._All; // todo
        }
        return this._shipComponentDefnsKnown;
    }
    shipComponentDefnsKnownBackbone() {
        if (this._shipComponentDefnsKnownBackbone == null) {
            this._shipComponentDefnsKnownBackbone = new Array();
            var shipComponentDefnsKnown = this.shipComponentDefnsKnown();
            for (var i = 0; i < shipComponentDefnsKnown.length; i++) {
                var componentDefn = shipComponentDefnsKnown[i];
                if (componentDefn.categoryNames.indexOf("Backbone") >= 0) // todo
                 {
                    this._shipComponentDefnsKnownBackbone.push(componentDefn);
                }
            }
        }
        return this._shipComponentDefnsKnownBackbone;
    }
    shipsCurrentOverMax() {
        return this.shipGroup.ships.length + "/" + this.flagship.shipsMax;
    }
    shipDefnsAvailable(universe) {
        if (this._shipDefnsAvailable == null) {
            this._shipDefnsAvailable = [];
            var world = universe.world;
            var factionsAllied = this.factionsAllied(world);
            for (var i = 0; i < factionsAllied.length; i++) {
                var faction = factionsAllied[i];
                var shipDefn = faction.shipDefn(world);
                this._shipDefnsAvailable.push(shipDefn);
            }
        }
        return this._shipDefnsAvailable;
    }
    varGet(variableName) {
        return this.vars.get(variableName);
    }
    varGetWithDefault(variableName, defaultValue) {
        var variableValue = this.varGet(variableName);
        if (variableValue == null) {
            variableValue = defaultValue;
            this.varSet(variableName, variableValue);
        }
        return variableValue;
    }
    varSet(variableName, value) {
        this.vars.set(variableName, value);
        return this;
    }
    // controls
    toControlSidebar(world) {
        var containerFlagship = this.flagship.toControlSidebar(world);
        /*
        var containerSidebar = new ControlContainer
        (
            "containerSidebar",
            Coords.fromXY(0, 0), // hack - pos
            containerSidebarSize,
            // children
            [ containerFlagship ]
        );
        */
        var containerSidebar = containerFlagship;
        return containerSidebar;
    }
}
class RainbowWorldLocation {
    constructor(starsystemName, sold) {
        this.starsystemName = starsystemName;
        this.sold = sold;
    }
}
