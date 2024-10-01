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
    conversationDefnNameSet(value) {
        this.conversationDefnName = value;
        return this;
    }
    shipDefn(world) {
        var returnValue = world.shipDefnByName(this.shipDefnName);
        return returnValue;
    }
    shipGroupGenerateAtPos(pos) {
        var shipCount = 1; // todo
        var ships = new Array();
        for (var i = 0; i < shipCount; i++) {
            var ship = Ship.fromDefnName(this.shipDefnName);
            ships.push(ship);
        }
        var shipGroup = ShipGroup.fromFactionNameAndShips(this.name, ships).posSet(pos);
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
    talkerToControl(cr, size, universe) {
        return cr.toControl_Layout_2(size, universe);
    }
    toEncounter(uwpe) {
        var shipGroup = this.shipGroupGenerateAtPos(Coords.zeroes());
        var encounter = shipGroup.toEncounter(uwpe);
        return encounter;
    }
    toTalker() {
        var talker = new Talker(this.conversationDefnName, null, this.talkerToControl);
        return talker;
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
