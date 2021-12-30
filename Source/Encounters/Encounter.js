"use strict";
class Encounter {
    constructor(planet, factionName, entityPlayer, entityOther, placeToReturnTo, posToReturnTo) {
        this.planet = planet;
        this.factionName = factionName;
        this.entityPlayer = entityPlayer;
        this.entityOther = entityOther;
        this.placeToReturnTo = placeToReturnTo;
        this.posToReturnTo = posToReturnTo;
    }
    faction(world) {
        return world.defnExtended().factionByName(this.factionName);
    }
    returnToPlace(world) {
        var placeNext = this.placeToReturnTo;
        var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
        var playerLoc = playerFromPlaceNext.locatable().loc;
        playerLoc.pos.overwriteWith(this.posToReturnTo);
        playerLoc.vel.clear();
        world.placeNext = placeNext;
    }
}
