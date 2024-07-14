"use strict";
class Lifeform {
    constructor(defnName, pos) {
        this.defnName = defnName;
        this.pos = pos;
    }
    // static
    defn(world) {
        return world.defnExtended().lifeformDefnByName(this.defnName);
    }
    toEntity(world, planet) {
        var lifeformDefn = this.defn(world);
        var lifeformActivity = new Activity(lifeformDefn.activityDefnName, null);
        var lifeformActor = new Actor(lifeformActivity);
        var lifeformRadius = 5;
        var lifeformCollider = new Sphere(Coords.create(), lifeformRadius);
        var lifeformCollidable = Collidable.fromCollider(lifeformCollider);
        lifeformCollidable.canCollideAgainWithoutSeparating = true;
        var lifeformDamager = Damager.default();
        var lifeformVisual = lifeformDefn.visual;
        lifeformVisual = new VisualWrapped(planet.sizeSurface, lifeformVisual);
        var lifeformDrawable = Drawable.fromVisual(lifeformVisual);
        var lifeformKillable = new Killable(lifeformDefn.durability, null, // ?
        (uwpe) => // die
         {
            var world = uwpe.world;
            var place = uwpe.place;
            var entity = uwpe.entity;
            var resource = new Resource("Biodata", 1, entity.locatable().loc.pos);
            var radius = entity.collidable().collider.radius;
            var entityResource = resource.toEntity(world, place, radius);
            place.entityToSpawnAdd(entityResource);
        });
        var lifeformLocatable = Locatable.fromPos(this.pos);
        var colorGreen = Color.Instances().Green;
        var visualScanContact = new VisualRectangle(Coords.ones().multiplyScalar(lifeformRadius), colorGreen, null, null);
        visualScanContact = new VisualHidable((uwpe) => {
            var isVisible = false;
            var place = uwpe.place;
            var placeTypeName = place.constructor.name;
            if (placeTypeName == PlacePlanetOrbit.name) {
                var placePlanetOrbit = place;
                isVisible = placePlanetOrbit.hasLifeBeenScanned;
            }
            else if (placeTypeName == PlacePlanetSurface.name) {
                var placePlanetSurface = place;
                var placePlanetOrbit = placePlanetSurface.placePlanetOrbit;
                isVisible = placePlanetOrbit.hasLifeBeenScanned;
            }
            else {
                throw new Error("Unexpected placeTypeName: " + placeTypeName);
            }
            return isVisible;
        }, visualScanContact);
        var lifeformMappable = new Mappable(visualScanContact);
        var lifeformMovable = Movable.fromSpeedMax(lifeformDefn.speed / 4);
        var returnValue = new Entity("Lifeform" + this.defnName + Math.random(), [
            this,
            lifeformActor,
            lifeformCollidable,
            lifeformDamager,
            lifeformDrawable,
            lifeformKillable,
            lifeformLocatable,
            lifeformMappable,
            lifeformMovable
        ]);
        return returnValue;
    }
    static activityDefnApproachPlayer() {
        return new ActivityDefn("Lifeform_ApproachPlayer", (uwpe) => {
            var entityActor = uwpe.entity;
            var place = uwpe.place;
            var entityTarget = place.entityByName(Player.name);
            if (entityTarget == null) {
                Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
            }
            else {
                var targetPos = entityTarget.locatable().loc.pos;
                var actorLoc = entityActor.locatable().loc;
                var actorPos = actorLoc.pos;
                var displacementToTarget = targetPos.clone().subtract(actorPos);
                var distanceToTarget = displacementToTarget.magnitude();
                var detectionDistanceMax = 150; // todo
                if (distanceToTarget > detectionDistanceMax) {
                    Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
                }
                else {
                    var distancePerTick = entityActor.movable().speedMax(uwpe);
                    if (distanceToTarget < distancePerTick) {
                        actorPos.overwriteWith(targetPos);
                    }
                    else {
                        actorLoc.vel.overwriteWith(displacementToTarget).divideScalar(distanceToTarget).multiplyScalar(distancePerTick);
                    }
                }
            }
        });
    }
    static activityDefnAvoidPlayer() {
        return new ActivityDefn("AvoidPlayer", (uwpe) => {
            var entityActor = uwpe.entity;
            var place = uwpe.place;
            var entityTarget = place.entityByName(Player.name);
            if (entityTarget == null) {
                Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
            }
            else {
                var targetPos = entityTarget.locatable().loc.pos;
                var actorLoc = entityActor.locatable().loc;
                var actorPos = actorLoc.pos;
                var displacementToTarget = targetPos.clone().subtract(actorPos);
                var distanceToTarget = displacementToTarget.magnitude();
                var detectionDistanceMax = 150; // todo
                var distancePerTick = entityActor.movable().speedMax(uwpe);
                if (distanceToTarget > detectionDistanceMax) {
                    Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
                }
                else {
                    actorLoc.vel.overwriteWith(displacementToTarget).divideScalar(distanceToTarget).multiplyScalar(distancePerTick).invert();
                }
            }
        });
    }
    static activityDefnDoNothing() {
        return new ActivityDefn("DoNothing", (uwpe) => { });
    }
    static activityDefnMoveToRandomPosition() {
        return new ActivityDefn("MoveToRandomPosition", Lifeform.activityDefnMoveToRandomPosition_Perform);
    }
    static activityDefnMoveToRandomPosition_Perform(uwpe) {
        var entityActor = uwpe.entity;
        var actor = entityActor.actor();
        var activity = actor.activity;
        var entityTarget = activity.targetEntity();
        if (entityTarget == null) {
            var targetPos = Coords.create().randomize(uwpe.universe.randomizer).multiply(uwpe.place.size());
            entityTarget = Locatable.fromPos(targetPos).toEntity();
            activity.targetEntitySet(entityTarget);
        }
        var targetPos = entityTarget.locatable().loc.pos;
        var actorLoc = entityActor.locatable().loc;
        var actorPos = actorLoc.pos;
        var displacementToTarget = targetPos.clone().subtract(actorPos);
        var distanceToTarget = displacementToTarget.magnitude();
        var distancePerTick = entityActor.movable().speedMax(uwpe);
        if (distanceToTarget < distancePerTick) {
            activity.targetEntityClear();
        }
        else {
            actorLoc.vel.overwriteWith(displacementToTarget).divideScalar(distanceToTarget).multiplyScalar(distancePerTick);
        }
    }
    // Clonable.
    clone() { throw new Error("todo"); }
    overwriteWith(other) { throw new Error("todo"); }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return Lifeform.name; }
    updateForTimerTick(uwpe) { }
    equals(other) { return false; }
}
