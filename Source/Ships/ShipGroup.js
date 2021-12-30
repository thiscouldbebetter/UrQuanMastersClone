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
        return new ActivityDefn("Ship_ApproachPlayer", ShipGroup.activityDefnApproachPlayer_Perform);
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
        ShipGroup.activityDefnApproachTarget_Perform(uwpe);
    }
    static activityDefnApproachTarget() {
        return new ActivityDefn("Ship_ApproachTarget", ShipGroup.activityDefnApproachTarget_Perform);
    }
    static activityDefnApproachTarget_Perform(uwpe) {
        var entityActor = uwpe.entity;
        var actor = entityActor.actor();
        var targetEntity = actor.activity.targetEntity();
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
        return new ActivityDefn("Die", (uwpe) => uwpe.entity.killable().kill());
    }
    static activityDefnLeave() {
        return new ActivityDefn("Leave", ShipGroup.activityDefnLeave_Perform);
    }
    static activityDefnLeave_Perform(uwpe) {
        var entityActor = uwpe.entity;
        var actor = entityActor.actor();
        var actorLoc = entityActor.locatable().loc;
        var actorPlace = actorLoc.place(uwpe.world);
        var actorPos = actorLoc.pos;
        var activity = actor.activity;
        var entityTarget = activity.targetEntity();
        var targetPos;
        if (entityTarget == null) {
            var actorForward = actorLoc.orientation.forward;
            var placeSize = actorPlace.size;
            targetPos = actorPos.clone().add(actorForward.clone().multiply(placeSize));
            entityTarget = Locatable.fromPos(targetPos).toEntity();
        }
        else {
            targetPos = entityTarget.locatable().loc.pos;
        }
        var displacementToTarget = targetPos.clone().subtract(actorPos);
        var distanceToTarget = displacementToTarget.magnitude();
        var distanceMin = 4;
        if (distanceToTarget < distanceMin) {
            actorPos.overwriteWith(targetPos);
            actorPlace.entityToRemoveAdd(entityActor);
        }
        else {
            actorLoc.vel.add(displacementToTarget.normalize()); // todo - * acceleration.
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
