"use strict";
class ShipAttackDefn extends EntityPropertyBase {
    constructor(name, energyToUse, projectileRadius, angleInTurns, speed, ticksToLive, diesOnImpact, damage, visualProjectile, visualImpact, effectWhenInvoked, perform, effectOnImpact) {
        super();
        this.name = name;
        this.energyToUse = energyToUse;
        this.projectileRadius = projectileRadius;
        this.angleInTurns = angleInTurns;
        this.speed = speed;
        this.ticksToLive = ticksToLive;
        this.diesOnImpact = diesOnImpact;
        this.damage = damage;
        this.visualProjectile = visualProjectile;
        this.visualImpact = visualImpact;
        this.effectWhenInvoked = effectWhenInvoked;
        this.perform = perform;
        this.effectOnImpact = effectOnImpact;
        this.range = this.speed * this.ticksToLive;
    }
    static fromEntity(entity) {
        return entity.propertyByName(ShipAttackDefn.name);
    }
    activate2(universe, world, place, actor) {
        var attackDefn = this;
        var projectileCollider = Sphere.fromRadius(attackDefn.projectileRadius);
        var projectileCollidable = new Collidable(false, // canCollideAgainWithoutSeparating
        null, // ?
        null, // ticks
        projectileCollider, [Killable.name], this.projectileCollide);
        var actorVisual = Drawable.of(actor).visual;
        var projectileVisual = new VisualWrapped2(actorVisual.sizeToWrapTo, attackDefn.visualProjectile);
        var projectileDrawable = Drawable.fromVisual(projectileVisual);
        var projectileKillable = Killable.fromIntegrityMax(1);
        var actorLoc = Locatable.of(actor).loc;
        var actorOrientation = actorLoc.orientation;
        var actorForward = actorOrientation.forward;
        var projectileDirectionAsPolar = Polar.create().fromCoords(actorForward);
        projectileDirectionAsPolar.azimuthInTurns += attackDefn.angleInTurns;
        projectileDirectionAsPolar.azimuthInTurns =
            NumberHelper.wrapToRangeMinMax(projectileDirectionAsPolar.azimuthInTurns, 0, 1);
        var projectileDirection = projectileDirectionAsPolar.toCoords();
        var actorRadius = Collidable.of(actor).collider.radius();
        var actorPos = actorLoc.pos;
        var projectilePos = actorPos.clone().add(projectileDirection.clone().multiplyScalar(actorRadius).double());
        var projectileLoc = Disposition.fromPos(projectilePos);
        projectileLoc.vel.overwriteWith(projectileDirection).multiplyScalar(this.speed);
        var projectileLocatable = new Locatable(projectileLoc);
        var projectileMovable = Movable.default();
        var projectileEntityProperties = new Array(this, projectileCollidable, projectileLocatable, projectileDrawable, projectileKillable, projectileMovable);
        if (this.ticksToLive != null) {
            projectileEntityProperties.push(new Ephemeral(this.ticksToLive, null));
        }
        var projectileEntity = new Entity("Projectile" + Math.random(), projectileEntityProperties);
        place.entityToSpawnAdd(projectileEntity);
    }
    projectileCollide(uwpe) {
        var place = uwpe.place;
        var entityProjectile = uwpe.entity;
        var entityOther = uwpe.entity2;
        var attackDefn = ShipAttackDefn.fromEntity(entityProjectile);
        if (attackDefn.diesOnImpact) {
            var killable = Killable.of(entityProjectile);
            killable.kill();
            var drawable = Drawable.of(entityProjectile);
            var visualWrapped = drawable.visual;
            visualWrapped.child = attackDefn.visualImpact;
            var entityImpact = new Entity("Impact", [
                new Ephemeral(10, null), // hack
                Locatable.of(entityProjectile),
                Drawable.of(entityProjectile)
            ]);
            place.entityToSpawnAdd(entityImpact);
        }
        var entityOtherKillable = Killable.of(entityOther);
        if (entityOtherKillable != null) {
            var projectileDamagePerHit = attackDefn.damage;
            entityOtherKillable.integrity -= projectileDamagePerHit;
            var entityOtherShip = Ship.fromEntity(entityOther);
            if (entityOtherShip != null) {
                entityOtherShip.crew = entityOtherKillable.integrity;
            }
        }
    }
}
