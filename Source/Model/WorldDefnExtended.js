"use strict";
class WorldDefnExtended extends WorldDefn {
    constructor(activityDefns, energySources, factions, itemDefns, lifeformDefns, placeDefns, resourceDefns, shipDefns) {
        super([
            activityDefns,
            placeDefns,
            WorldDefnExtended.itemDefnsFromResourceDefnsAndEnergySources(resourceDefns, energySources)
        ]);
        this.energySources = energySources;
        this.factions = factions;
        this.lifeformDefns = lifeformDefns;
        this.shipDefns = shipDefns;
        itemDefns.forEach(x => this.itemDefnAdd(x));
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
        var faction = this.factionsByName.get(factionName);
        if (factionName != null && faction == null) {
            throw new Error("No faction found with name '" + factionName + "'.");
        }
        return faction;
    }
    lifeformDefnByName(defnName) {
        return this.lifeformDefnsByName.get(defnName);
    }
    shipDefnByName(defnName) {
        return this.shipDefnsByName.get(defnName);
    }
    // ItemDefns.
    static itemDefn_HummingSpiral_Use(uwpe) {
        throw new Error("todo");
    }
    static itemDefn_ParaspacePortalProjector_Use(uwpe) {
        var world = uwpe.world;
        var place = world.place();
        var placeTypeName = place.constructor.name;
        if (placeTypeName == PlaceHyperspace.name) {
            var placeHyperspace = place;
            var spaceOccupied = placeHyperspace.hyperspace;
            if (spaceOccupied.name != "Hyperspace") {
                // Do nothing.
            }
            else {
                var player = placeHyperspace.player();
                var playerPos = player.locatable().pos();
                var portalPos = playerPos.clone();
                var linkPortalToParaspace = new LinkPortal("ParaspacePortal", portalPos, "Paraspace", Coords.fromXY(5000, 5000));
                placeHyperspace.linkPortalAdd(linkPortalToParaspace, world);
            }
        }
        return null;
    }
    static itemDefn_ShimmeringHemitrope_Use(uwpe) {
        throw new Error("todo");
    }
    static itemDefn_TranslucentOblong_Use(uwpe) {
        throw new Error("todo");
    }
}
