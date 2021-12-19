"use strict";
class WorldDefnExtended extends WorldDefn {
    constructor(activityDefns, factions, lifeformDefns, placeDefns, shipDefns) {
        super(null, // actions
        activityDefns, null, null, placeDefns, null);
        this.factions = factions;
        this.lifeformDefns = lifeformDefns;
        this.shipDefns = shipDefns;
        this.factionsByName = ArrayHelper.addLookupsByName(this.factions);
        this.lifeformDefnsByName = ArrayHelper.addLookupsByName(this.lifeformDefns);
        this.shipDefnsByName = ArrayHelper.addLookupsByName(this.shipDefns);
    }
    factionByName(factionName) {
        return this.factionsByName.get(factionName);
    }
    lifeformDefnByName(defnName) {
        return this.lifeformDefnsByName.get(defnName);
    }
    shipDefnByName(defnName) {
        return this.shipDefnsByName.get(defnName);
    }
}
