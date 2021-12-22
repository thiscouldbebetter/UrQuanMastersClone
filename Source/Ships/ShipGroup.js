"use strict";
class ShipGroup {
    constructor(name, factionName, pos, ships) {
        this.name = name;
        this.factionName = factionName;
        this.pos = pos;
        this.ships = ships;
        this._posInverted = Coords.create();
    }
    static activityDefnApproachPlayer() {
        return new ActivityDefn("ApproachPlayer", ShipGroup.activityDefnApproachPlayer_Perform);
    }
    static activityDefnApproachPlayer_Perform(uwpe) {
        var entityActor = uwpe.entity;
        var actor = entityActor.actor();
        var targetEntity = actor.activity.targetEntity();
        if (targetEntity == null) {
            var place = uwpe.place;
            var entityToTargetName = Player.name;
            targetEntity = place.entitiesByName.get(entityToTargetName);
            actor.activity.targetEntitySet(targetEntity);
        }
        var targetPos = targetEntity.locatable().loc.pos;
        var actorLoc = entityActor.locatable().loc;
        var actorPos = actorLoc.pos;
        var actorVel = actorLoc.vel;
        actorVel.overwriteWith(targetPos).subtract(actorPos);
        if (actorVel.magnitude() < 1) {
            actorPos.overwriteWith(targetPos);
        }
        else {
            actorVel.normalize();
        }
    }
    static activityDefnDie() {
        return new ActivityDefn("Die", (uwpe) => uwpe.entity.killable().integrityAdd(-10000));
    }
    static activityDefnLeave() {
        return new ActivityDefn("Leave", ShipGroup.activityDefnLeave_Perform);
    }
    static activityDefnLeave_Perform(uwpe) {
        var entityActor = uwpe.entity;
        var actor = entityActor.actor();
        var targetPos = new Coords(100000, 0, 0); // hack
        var targetLocatable = Locatable.fromPos(targetPos);
        var targetEntity = new Entity("Target", [targetLocatable]);
        actor.activity.targetEntitySet(targetEntity);
        var actorLoc = entityActor.locatable().loc;
        var actorPos = actorLoc.pos;
        var actorVel = actorLoc.vel;
        actorVel.overwriteWith(targetPos).subtract(actorPos);
        if (actorVel.magnitude() < 1) {
            actorPos.overwriteWith(targetPos);
        }
        else {
            actorVel.normalize();
        }
    }
    faction(world) {
        return world.defnExtended().factionByName(this.factionName);
    }
    toStringPosition(world) {
        var hyperspaceSize = world.hyperspace.size;
        return this._posInverted.overwriteWithDimensions(this.pos.x, hyperspaceSize.y - this.pos.y, 0).round().toStringXY();
    }
    toStringDescription() {
        var shipCountsByDefnName = new Map();
        for (var i = 0; i < this.ships.length; i++) {
            var ship = this.ships[i];
            var shipDefnName = ship.defnName;
            var shipCountForDefnName = shipCountsByDefnName.get(shipDefnName);
            if (shipCountForDefnName == null) {
                shipCountForDefnName = 0;
                shipCountsByDefnName.set(shipDefnName, shipCountForDefnName);
            }
            shipCountForDefnName++;
            shipCountsByDefnName.set(shipDefnName, shipCountForDefnName);
        }
        var shipCountsAsStrings = [];
        for (var shipDefnName of shipCountsByDefnName.keys()) {
            var shipCount = shipCountsByDefnName.get(shipDefnName);
            var shipCountAsString = shipCount + " " + shipDefnName;
            shipCountsAsStrings.push(shipCountAsString);
        }
        return shipCountsAsStrings.join("\n");
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) {
        for (var i = 0; i < this.ships.length; i++) {
            var ship = this.ships[i];
            ship.initialize(uwpe);
        }
    }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
