"use strict";
class Faction {
    constructor(name, nameOriginal, color, relationsWithPlayer, talksImmediately, conversationDefnName, sphereOfInfluence, shipDefnName, shipGroupActivity) {
        this.name = name;
        this.nameOriginal = nameOriginal;
        this.color = color;
        this.relationsWithPlayer = relationsWithPlayer;
        this.talksImmediately = talksImmediately;
        this.conversationDefnName = conversationDefnName;
        this.sphereOfInfluence = sphereOfInfluence;
        this.shipDefnName = shipDefnName;
        this.shipGroupActivity = shipGroupActivity;
    }
    static fromEntity(entity) {
        return entity.propertyByName(Faction.name);
    }
    shipDefn(world) {
        var returnValue = world.shipDefnByName(this.shipDefnName);
        return returnValue;
    }
    shipGroup() {
        return this.shipGroupGenerate();
    }
    shipGroupGenerate() {
        var shipCount = 1; // todo
        var ships = new Array();
        for (var i = 0; i < shipCount; i++) {
            var ship = Ship.fromDefnName(this.shipDefnName);
            ships.push(ship);
        }
        var shipGroup = ShipGroup.fromFactionNameAndShips(this.name, ships);
        return shipGroup;
    }
    starsystems(world) {
        // Tersely-named alias method.
        return this.starsystemsInSphereOfInfluence(world);
    }
    starsystemsInSphereOfInfluence(world) {
        var hyperspace = world.hyperspace;
        var sphere = this.sphereOfInfluence;
        var starsystemsInSphereOfInfluence = hyperspace.starsystems.filter(x => sphere.containsPoint(x.posInHyperspace));
        return starsystemsInSphereOfInfluence;
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return Faction.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
Faction.RelationsAllied = "Allied";
Faction.RelationsHostile = "Hostile";
Faction.RelationsNeutral = "Neutral";
