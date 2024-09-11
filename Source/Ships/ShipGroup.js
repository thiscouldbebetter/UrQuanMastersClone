"use strict";
class ShipGroup {
    constructor(name, factionName, pos, ships) {
        this.name = name || factionName + " Ship Group";
        this.factionName = factionName;
        this.pos = pos;
        this.ships = ships;
        this.shipSelected = this.ships[0];
        this.shipsLost = [];
        this._posInverted = Coords.create();
    }
    static fromFactionNameAndShips(factionName, ships) {
        return new ShipGroup(null, // name
        factionName, Coords.zeroes(), // pos
        ships);
    }
    static fromEntity(entity) {
        return entity.propertyByName(ShipGroup.name);
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
            targetEntity = place.entityByName(entityToTargetName);
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
                var shipGroup = ShipGroup.fromEntity(entityActor);
                ArrayHelper.remove(planet.shipGroups, shipGroup);
            }
        }
        else {
            actorLoc.vel.add(displacementToTarget.normalize()); // todo - * acceleration.
        }
    }
    faction(world) {
        return world.defnExtended().factionByName(this.factionName);
    }
    static kill(uwpe) {
        var place = uwpe.place;
        var entity = uwpe.entity;
        place.entityRemove(entity);
        var shipGroup = ShipGroup.fromEntity(entity);
        var shipGroupsInPlace = null;
        var placeTypeName = place.constructor.name;
        if (placeTypeName == PlacePlanetVicinity.name) {
            shipGroupsInPlace = place.planet.shipGroups;
        }
        else if (placeTypeName == PlaceStarsystem.name) {
            shipGroupsInPlace = place.starsystem.shipGroups;
        }
        else {
            throw new Error("Unexpected placeTypeName: " + placeTypeName);
        }
        ArrayHelper.remove(shipGroupsInPlace, shipGroup);
    }
    posInHyperspace(world) {
        var pos = null;
        var place = world.placeCurrent;
        var placeTypeName = place.constructor.name;
        if (placeTypeName == PlaceHyperspace.name) {
            var shipGroupEntity = place.entitiesAll().find(x => ShipGroup.fromEntity(x) == this);
            pos = shipGroupEntity.locatable().loc.pos;
        }
        else if (placeTypeName == PlaceHyperspaceMap.name) {
            var placeHyperspaceMap = place;
            var placeHyperspace = placeHyperspaceMap.placeHyperspaceToReturnTo;
            var shipGroupEntity = placeHyperspace.entitiesAll().find(x => ShipGroup.fromEntity(x) == this);
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
    shipSelectOptimum() {
        if (this.shipSelected == null) {
            var ship = this.ships[0]; // todo
            this.shipSelected = ship;
        }
        return this.shipSelected;
    }
    toEntity(world, place) {
        var placeSize = place.size();
        var returnValue = placeSize == null
            ? this.toEntityEncounter(world, place)
            : this.toEntitySpace(world, place);
        return returnValue;
    }
    toEntityEncounter(world, place) {
        var faction = this.faction(world);
        var talker = faction.toTalker();
        return new Entity(this.name, [
            this,
            talker
        ]);
    }
    toEntitySpace(world, place) {
        // See toEntitySpace2() for possible changes.
        var faction = this.faction(world);
        var actor = new Actor(faction.shipGroupActivity);
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
        var constraintSpeedMax = new Constraint_SpeedMaxXY(1);
        var constrainable = new Constrainable([constraintSpeedMax]);
        var shipDefn = faction.shipDefn(world);
        var shipVisual = shipDefn.visual;
        var drawable = Drawable.fromVisual(shipVisual);
        // Note that ships may really only be killable in combat.
        var killable = new Killable(1, null, ShipGroup.kill);
        var placeSize = place.size();
        var pos = Coords.random(null).multiply(placeSize);
        var loc = Disposition.fromPos(pos);
        var locatable = new Locatable(loc);
        var movable = Movable.default();
        var faction = this.faction(world);
        var talker = faction.toTalker();
        var returnEntity = new Entity(this.name, [
            actor,
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
    /*
    toEntitySpace2
    (
        worldAsWorld: World, place: Place
    ): Entity
    {
        // Taken from PlaceHyperspace.shipGroupToEntity().

        var world = worldAsWorld as WorldExtended;

        var actor = new Actor
        (
            new Activity
            (
                ShipGroup.activityDefnApproachPlayer().name, null
            )
        );

        var collidable = Collidable.fromCollider(new Sphere(Coords.create(), 5));

        var boundable = Boundable.fromCollidable(collidable);

        var ship0 = shipGroup.ships[0];
        var drawable = Drawable.fromVisual(ship0.defn(world).visual);

        var shipGroupPos = shipGroup.pos;
        var locatable = Locatable.fromPos(shipGroupPos);

        var movable = Movable.default();

        var talker = new Talker
        (
            shipGroup.factionName,
            null, // quit - todo
            (cr: ConversationRun, size: Coords, u: Universe) => cr.toControl_Layout_2(size, u)
        );

        var entityShipGroup = new Entity
        (
            shipGroup.name + Math.random(),
            [
                actor,
                //faction,
                boundable,
                collidable,
                drawable,
                locatable,
                movable,
                shipGroup,
                ship0,
                talker
            ]
        );

        return entityShipGroup;
    }
    */
    toEncounter(uwpe) {
        var entityPlayer = uwpe.entity;
        var playerPos = entityPlayer.locatable().loc.pos;
        var place = uwpe.place;
        var placeTypeName = place.constructor.name;
        var planet = placeTypeName == PlaceEncounter.name
            ? place.encounter.planet
            : placeTypeName == PlacePlanetOrbit.name
                ? place.planet
                : placeTypeName == PlacePlanetVicinity.name
                    ? place.planet
                    : placeTypeName == PlaceStarsystem.name
                        ? place.starsystem.planetClosestTo(playerPos)
                        : placeTypeName == PlaceHyperspace.name
                            ? place.hyperspace.starsystemClosestTo(playerPos).planetRandom(uwpe.universe)
                            : null;
        var world = uwpe.world;
        var entityShipGroup = this.toEntity(world, place);
        var encounter = new Encounter(planet, this.factionName, entityPlayer, entityShipGroup, place, playerPos.clone());
        return encounter;
    }
    // Controls.
    toControl(cr, size, universe) {
        return cr.toControl_Layout_2(size, universe);
    }
    // Strings.
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
    propertyName() { return ShipGroup.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
