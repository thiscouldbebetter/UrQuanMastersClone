"use strict";
class WorldDefnExtended extends WorldDefn {
    constructor(activityDefns, factions, lifeformDefns, placeDefns, resourceDefns, shipDefns) {
        super([
            activityDefns,
            resourceDefns.map(x => x.toItemDefn()),
            placeDefns
        ]);
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
