"use strict";
class Lifeform {
    constructor(defnName, pos) {
        this.defnName = defnName;
        this.pos = pos;
    }
    defn(world) {
        return world.defnExtended().lifeformDefnByName(this.defnName);
    }
    toEntity(worldAsWorld, planet) {
        var world = worldAsWorld;
        var lifeformDefn = this.defn(world);
        var lifeformVisual = lifeformDefn.visual;
        lifeformVisual = new VisualWrapped(planet.sizeSurface, lifeformVisual);
        var lifeformCollider = new Sphere(Coords.create(), 5);
        var lifeformActivity = new Activity(lifeformDefn.activityDefnName, null);
        var returnValue = new Entity("Lifeform" + this.defnName + Math.random(), [
            this,
            new Actor(lifeformActivity),
            Collidable.fromCollider(lifeformCollider),
            Drawable.fromVisual(lifeformVisual),
            new Killable(lifeformDefn.durability, null, // ?
            (uwpe) => // die
             {
                var world = uwpe.world;
                var place = uwpe.place;
                var entity = uwpe.entity;
                var resource = new Resource("Biodata", 1, entity.locatable().loc.pos);
                var radius = entity.collidable().collider.radius;
                var entityResource = resource.toEntity(world, place, radius);
                place.entitiesToSpawn.push(entityResource);
            }),
            Locatable.fromPos(this.pos),
            new Mappable(lifeformVisual),
            Movable.fromSpeedMax(lifeformDefn.speed)
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
                var detectionDistanceMax = 100; // todo
                if (distanceToTarget > detectionDistanceMax) {
                    Lifeform.activityDefnMoveToRandomPosition_Perform(uwpe);
                }
                else {
                    var distancePerTick = entityActor.movable().speedMax;
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
                var detectionDistanceMax = 100; // todo
                var distancePerTick = entityActor.movable().speedMax;
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
            var targetPos = Coords.create().randomize(uwpe.universe.randomizer).multiply(uwpe.place.size);
            entityTarget = Locatable.fromPos(targetPos).toEntity();
            activity.targetEntitySet(entityTarget);
        }
        var targetPos = entityTarget.locatable().loc.pos;
        var actorLoc = entityActor.locatable().loc;
        var actorPos = actorLoc.pos;
        var displacementToTarget = targetPos.clone().subtract(actorPos);
        var distanceToTarget = displacementToTarget.magnitude();
        var distancePerTick = entityActor.movable().speedMax;
        if (distanceToTarget < distancePerTick) {
            activity.targetEntityClear();
        }
        else {
            actorLoc.vel.overwriteWith(displacementToTarget).divideScalar(distanceToTarget).multiplyScalar(distancePerTick);
        }
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    updateForTimerTick(uwpe) { }
    equals(other) { return false; }
}
