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
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
Faction.RelationsAllied = "Allied";
Faction.RelationsHostile = "Hostile";
Faction.RelationsNeutral = "Neutral";
