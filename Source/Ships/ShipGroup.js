"use strict";
class ShipGroupBase {
    static fromEntity(entity) {
        return entity.propertyByName(ShipGroupBase.name);
    }
    static fromFactionNameAndShipsAsString(factionName, shipGroupAsString) {
        if (shipGroupAsString == "-") {
            return null;
        }
        var shipDefnNameAndCount = shipGroupAsString.split(":");
        var shipDefnName = shipDefnNameAndCount[0];
        var shipCount = parseInt(shipDefnNameAndCount[1]);
        var shipGroupName = shipDefnName + " " + ShipGroupBase.name;
        var shipGroup = shipCount == 0
            ? new ShipGroupInfinite(shipGroupName, factionName, shipDefnName)
            : new ShipGroupFinite(shipGroupName, factionName, Coords.create(), null, Ship.manyFromDefnNameAndCount(shipDefnName, shipCount));
        return shipGroup;
    }
    static activityDefnApproachPlayer() {
        return new ActivityDefn("Ship_ApproachPlayer", ShipGroupBase.activityDefnApproachPlayer_Perform);
    }
    static activityDefnApproachPlayer_Perform(uwpe) {
        var entityActor = uwpe.entity;
        var actor = entityActor.actor();
        var targetEntity = actor.activity.targetEntity();
        if (targetEntity == null) {
            var place = uwpe.place;
            var entityToTargetName = Player.name;
            targetEntity = place.entityByName(entityToTargetName);
            actor.activity.targetEntitySet(targetEntity);
        }
        ShipGroupBase.activityDefnApproachTarget_Perform(uwpe);
    }
    static activityDefnApproachTarget() {
        return new ActivityDefn("Ship_ApproachTarget", ShipGroupBase.activityDefnApproachTarget_Perform);
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
        return new ActivityDefn("Leave", ShipGroupBase.activityDefnLeave_Perform);
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
            var placeSize = actorPlace.size();
            targetPos = actorPos.clone().add(actorForward.clone().multiply(placeSize));
            entityTarget = Locatable.fromPos(targetPos).toEntity();
            activity.targetEntitySet(entityTarget);
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
            var placeTypeName = actorPlace.constructor.name;
            if (placeTypeName == PlacePlanetVicinity.name) {
                var placePlanetVicinity = actorPlace;
                var planet = placePlanetVicinity.planet;
                var shipGroup = ShipGroupFinite.fromEntity(entityActor);
                planet.shipGroupRemove(shipGroup);
            }
        }
        else {
            actorLoc.vel.add(displacementToTarget.normalize()); // todo - * acceleration.
        }
    }
    static kill(uwpe) {
        var world = uwpe.world;
        var place = uwpe.place;
        var entity = uwpe.entity;
        place.entityRemove(entity);
        var shipGroup = ShipGroupFinite.fromEntity(entity);
        var shipGroupsInPlace = null;
        var placeTypeName = place.constructor.name;
        if (placeTypeName == PlacePlanetVicinity.name) {
            shipGroupsInPlace = place.planet.shipGroupsInVicinity();
        }
        else if (placeTypeName == PlaceStarsystem.name) {
            shipGroupsInPlace = place.starsystem.shipGroups(world);
        }
        else {
            throw new Error("Unexpected placeTypeName: " + placeTypeName);
        }
        ArrayHelper.remove(shipGroupsInPlace, shipGroup);
    }
    static mustBeImplementedInSubclassError() {
        return new Error("Must be implemented in subclass.");
    }
    // Entity implementation.
    equals(other) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return ShipGroupBase.name; }
    updateForTimerTick(uwpe) { }
    posSet(value) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    shipAdd(ship) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    shipFirst() { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    shipLostAdd(ship) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    shipRemove(ship) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    shipSelectOptimum() { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    shipsCount() { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    shipsGetAll() { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    shipsLost() { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    toEncounter(uwpe) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    toEntity(world, place) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    toEntitySpace(world, place) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
    toStringDescription(world) { throw ShipGroupBase.mustBeImplementedInSubclassError(); }
}
class ShipGroupInfinite extends ShipGroupBase {
    constructor(name, factionName, shipDefnName) {
        super();
        this.name = name;
        this.factionName = factionName;
        this.shipDefnName = shipDefnName;
    }
    shipsCount() {
        return Number.POSITIVE_INFINITY;
    }
    toStringDescription(world) {
        var shipDefn = world.shipDefnByName(this.shipDefnName);
        return "Infinite " + shipDefn.namePlural;
    }
}
class ShipGroupFinite extends ShipGroupBase {
    constructor(name, factionName, pos, shipsMax, ships) {
        super();
        this.name = name || factionName + " Ship Group";
        this.factionName = factionName;
        this.pos = pos;
        this.shipsMax = shipsMax || Number.POSITIVE_INFINITY;
        this.ships = ships;
        this.shipSelected = this.shipFirst();
        this._shipsLost = [];
        this._posInverted = Coords.create();
    }
    static fromFactionNameAndShips(factionName, ships) {
        return new ShipGroupFinite(null, // name
        factionName, Coords.zeroes(), // pos
        null, // shipsMax
        ships);
    }
    static fromFactionNameAndShipsAsString(factionName, shipsAsString) {
        var shipCountAndDefnNamePairs = shipsAsString
            .split("+")
            .map(x => [x.substr(0, 1), x.substr(1)]);
        var ships = new Array();
        for (var p = 0; p < shipCountAndDefnNamePairs.length; p++) {
            var shipCountAndDefnNamePair = shipCountAndDefnNamePairs[p];
            var shipCount = parseInt(shipCountAndDefnNamePair[0]);
            if (shipCount == 0) {
                // Infinity.
                throw new Error("Not yet implemented!");
            }
            else {
                for (var i = 0; i < shipCount; i++) {
                    var shipDefnName = shipCountAndDefnNamePair[1];
                    var ship = Ship.fromDefnName(shipDefnName);
                    ships.push(ship);
                }
            }
        }
        var shipGroup = ShipGroupFinite.fromFactionNameAndShips(factionName, ships);
        return shipGroup;
    }
    faction(world) {
        return world.defnExtended().factionByName(this.factionName);
    }
    posInHyperspace(world) {
        var pos = null;
        var place = world.placeCurrent;
        if (place == null) {
            return Coords.create(); // hack
        }
        var placeTypeName = place.constructor.name;
        if (placeTypeName == PlaceHyperspace.name) {
            var shipGroupEntity = place.entitiesAll().find(x => ShipGroupFinite.fromEntity(x) == this);
            pos = shipGroupEntity.locatable().loc.pos;
        }
        else if (placeTypeName == PlaceHyperspaceMap.name) {
            var placeHyperspaceMap = place;
            var placeHyperspace = placeHyperspaceMap.placeHyperspaceToReturnTo;
            var shipGroupEntity = placeHyperspace.entitiesAll().find(x => ShipGroupFinite.fromEntity(x) == this);
            pos = shipGroupEntity.locatable().loc.pos;
        }
        else if (placeTypeName == PlaceStarsystem.name) {
            var placeStarsystem = place;
            var starsystem = placeStarsystem.starsystem;
            pos = starsystem.posInHyperspace;
        }
        else if (placeTypeName == PlacePlanetVicinity.name) {
            var placePlanetVicinity = place;
            var starsystem = placePlanetVicinity.starsystem();
            pos = starsystem.posInHyperspace;
        }
        else if (placeTypeName == PlacePlanetOrbit.name) {
            var placePlanetOrbit = place;
            var starsystem = placePlanetOrbit.starsystem();
            pos = starsystem.posInHyperspace;
        }
        else if (placeTypeName == PlacePlanetSurface.name) {
            var placePlanetSurface = place;
            var starsystem = placePlanetSurface.starsystem();
            pos = starsystem.posInHyperspace;
        }
        else {
            throw new Error("Unexpected placeTypeName: " + placeTypeName);
        }
        var hyperspaceSize = world.hyperspace.size;
        var posInverted = this._posInverted.overwriteWithDimensions(pos.x, hyperspaceSize.y - pos.y, 0).round();
        return posInverted;
    }
    posSet(value) {
        this.pos = value;
        return this;
    }
    shipAdd(ship) {
        var shipCountBefore = this.ships.length;
        var shipCountAfter = shipCountBefore + 1;
        if (shipCountAfter <= this.shipsMax) {
            this.ships.push(ship);
        }
        return this;
    }
    shipFirst() {
        return this.ships[0];
    }
    shipLostAdd(ship) {
        this._shipsLost.push(ship);
        return this;
    }
    shipRemove(ship) {
        var index = this.ships.indexOf(ship);
        if (index >= 0) {
            this.ships.splice(index, 1);
        }
        return this;
    }
    shipSelectOptimum() {
        if (this.shipSelected == null) {
            var ship = this.shipFirst(); // todo
            this.shipSelected = ship;
        }
        return this.shipSelected;
    }
    shipWithDefnNameIsPresent(shipDefnName) {
        return (this.shipsWithDefnName(shipDefnName).length > 0);
    }
    shipsCount() {
        return this.ships.length;
    }
    shipsGetAll() {
        return this.ships;
    }
    shipsLost() {
        return this._shipsLost;
    }
    shipsWithDefnName(shipDefnName) {
        return this.ships.filter(x => x.defnName == shipDefnName);
    }
    toEntity(world, place) {
        var returnValue = this.toEntitySpace(world, place);
        return returnValue;
    }
    toEntitySpace(world, place) {
        // See toEntitySpace2() for possible changes.
        var faction = this.faction(world);
        // hack
        // var actor = new Actor(faction.shipGroupActivity);
        var actor = Actor.fromActivityDefn(ShipGroupBase.activityDefnApproachPlayer());
        var entityDimension = 10;
        var colliderAsFace = new Face([
            Coords.fromXY(0, -1).multiplyScalar(entityDimension).half(),
            Coords.fromXY(1, 1).multiplyScalar(entityDimension).half(),
            Coords.fromXY(-1, 1).multiplyScalar(entityDimension).half(),
        ]);
        var collider = Mesh.fromFace(Coords.zeroes(), // center
        colliderAsFace, 1 // thickness
        );
        var collidable = Collidable.fromCollider(collider);
        var boundable = Boundable.fromCollidable(collidable);
        var constraintSpeedMax = new Constraint_SpeedMaxXY(1);
        var constrainable = new Constrainable([constraintSpeedMax]);
        var shipDefn = faction.shipDefn(world);
        var shipVisual = shipDefn.visual;
        var drawable = Drawable.fromVisual(shipVisual);
        // Note that ships may really only be killable in combat.
        var killable = new Killable(1, null, ShipGroupBase.kill);
        var pos = this.pos;
        var loc = Disposition.fromPos(pos);
        var locatable = new Locatable(loc);
        var movable = Movable.default();
        var faction = this.faction(world);
        var talker = faction.toTalker();
        var returnEntity = new Entity(this.name, [
            actor,
            boundable,
            collidable,
            constrainable,
            drawable,
            killable,
            locatable,
            movable,
            this,
            talker
        ]);
        return returnEntity;
    }
    toEncounter(uwpe) {
        var entityPlayer = uwpe.entity;
        var entityShipGroup = uwpe.entity2;
        if (entityShipGroup == null) {
            var world = uwpe.world;
            entityShipGroup = this.toEntity(world, world.place());
            uwpe.entity2Set(entityShipGroup);
        }
        var playerPos = entityPlayer.locatable().loc.pos;
        var place = uwpe.place;
        var placeTypeName = place.constructor.name;
        var planet;
        var placeToReturnTo = place;
        if (placeTypeName == PlaceEncounter.name) {
            var encounter = place.encounter;
            planet = encounter.planet;
        }
        else if (placeTypeName == PlacePlanetOrbit.name) {
            planet = place.planet;
        }
        else if (placeTypeName == PlacePlanetVicinity.name) {
            planet = place.planet;
        }
        else if (placeTypeName == PlaceStarsystem.name) {
            planet = place.starsystem.planetClosestTo(playerPos);
        }
        else if (placeTypeName == PlaceHyperspace.name) {
            planet = place.hyperspace.starsystemClosestTo(playerPos).planetRandom(uwpe.universe);
        }
        else {
            throw new Error("Unexpected placeTypeName '" + placeTypeName + "'.");
        }
        var encounter = new Encounter(planet, this.factionName, entityPlayer, entityShipGroup, placeToReturnTo, playerPos.clone());
        return encounter;
    }
    // Controls.
    toControl(cr, size, universe) {
        return cr.toControl_Layout_2(size, universe);
    }
    // Strings.
    toStringDescription(world) {
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
            var shipDefn = world.shipDefnByName(shipDefnName);
            var shipDefnNameSingularOrPlural = (shipCount == 1 ? shipDefn.name : shipDefn.namePlural);
            var shipCountAsString = shipCount + " " + shipDefnNameSingularOrPlural;
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
    propertyName() { return ShipGroupBase.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
