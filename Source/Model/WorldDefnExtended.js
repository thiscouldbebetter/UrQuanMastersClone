"use strict";
class WorldDefnExtended extends WorldDefn {
    constructor(activityDefns, factions, lifeformDefns, placeDefns, resourceDefns, shipDefns, energySources) {
        super([
            activityDefns,
            placeDefns,
            WorldDefnExtended.itemDefnsFromResourceDefnsAndEnergySources(resourceDefns, energySources)
        ]);
        this.factions = factions;
        this.lifeformDefns = lifeformDefns;
        this.shipDefns = shipDefns;
        this.energySources = energySources;
        this.factionsByName = ArrayHelper.addLookupsByName(this.factions);
        this.lifeformDefnsByName = ArrayHelper.addLookupsByName(this.lifeformDefns);
        this.shipDefnsByName = ArrayHelper.addLookupsByName(this.shipDefns);
    }
    static itemDefnsFromResourceDefnsAndEnergySources(resourceDefns, energySources) {
        var itemDefns = new Array();
        var resourceDefnsAsItemDefns = resourceDefns.map(x => x.toItemDefn());
        itemDefns.push(...resourceDefnsAsItemDefns);
        var energySourcesAsItemDefns = energySources
            .map(x => x.toItemDefn())
            .filter(x => x != null);
        itemDefns.push(...energySourcesAsItemDefns);
        return itemDefns;
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
