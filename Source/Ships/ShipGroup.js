"use strict";
class ShipGroup extends EntityProperty {
    constructor(name, factionName, pos, ships) {
        super();
        this.name = name;
        this.factionName = factionName;
        this.pos = pos;
        this.ships = ships;
        this._posInverted = Coords.create();
    }
    static activityDefnApproachPlayer() {
        return new ActivityDefn("ApproachPlayer", ShipGroup.activityDefnApproachPlayer_Perform);
    }
    static activityDefnApproachPlayer_Perform(universe, world, place, entityActor) {
        var actor = entityActor.actor();
        var targetPos = actor.activity.target;
        if (targetPos == null) {
            var entityToTargetName = Player.name;
            var target = place.entitiesByName.get(entityToTargetName);
            targetPos = target.locatable().loc.pos;
            actor.activity.target = targetPos;
        }
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
        return new ActivityDefn("Die", (u, w, p, e) => e.killable().integrityAdd(-10000));
    }
    static activityDefnLeave() {
        return new ActivityDefn("Leave", ShipGroup.activityDefnLeave_Perform);
    }
    static activityDefnLeave_Perform(universe, world, place, entityActor) {
        var actor = entityActor.actor();
        actor.activity.target = new Coords(100000, 0, 0);
        var targetPos = actor.activity.target;
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
    initialize(universe, world, place, entity) {
        for (var i = 0; i < this.ships.length; i++) {
            var ship = this.ships[i];
            ship.initialize(universe, world, place, entity);
        }
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
        for (var shipDefnName in shipCountsByDefnName) {
            var shipCount = shipCountsByDefnName.get(shipDefnName);
            var shipCountAsString = shipCount + " " + shipDefnName;
            shipCountsAsStrings.push(shipCountAsString);
        }
        return shipCountsAsStrings.join("\n");
    }
}
