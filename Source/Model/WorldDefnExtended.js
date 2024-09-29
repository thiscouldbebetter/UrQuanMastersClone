"use strict";
class WorldDefnExtended extends WorldDefn {
    constructor(activityDefns, factions, lifeformDefns, placeDefns, resourceDefns, shipDefns, energySources) {
        super([
            activityDefns,
            resourceDefns.map(x => x.toItemDefn()),
            placeDefns
        ]);
        this.factions = factions;
        this.lifeformDefns = lifeformDefns;
        this.shipDefns = shipDefns;
        this.energySources = energySources;
        this.factionsByName = ArrayHelper.addLookupsByName(this.factions);
        this.lifeformDefnsByName = ArrayHelper.addLookupsByName(this.lifeformDefns);
        this.shipDefnsByName = ArrayHelper.addLookupsByName(this.shipDefns);
    }
    energySourceByName(name) {
        return this.energySources.find(x => x.name == name);
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
