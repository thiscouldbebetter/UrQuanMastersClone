
class ShipAttackDefn implements EntityProperty<ShipAttackDefn>
{
	name: string;
	energyToUse: number;
	projectileRadius: number;
	angleInTurns: number;
	speed: number;
	ticksToLive: number;
	diesOnImpact: boolean;
	damage: number;
	visualProjectile: VisualBase;
	visualImpact: VisualBase;
	effectWhenInvoked: any;
	perform: (u: Universe, w: World, p: Place, e: Entity) => void;
	effectOnImpact: (u: Universe, w: World, p: Place, e: Entity) => void;

	range: number;

	constructor
	(
		name: string,
		energyToUse: number,
		projectileRadius: number,
		angleInTurns: number,
		speed: number,
		ticksToLive: number,
		diesOnImpact: boolean,
		damage: number,
		visualProjectile: VisualBase,
		visualImpact: VisualBase,
		effectWhenInvoked: any,
		perform: (u: Universe, w: World, p: Place, e: Entity) => void,
		effectOnImpact: (u: Universe, w: World, p: Place, e: Entity) => void
	)
	{
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

	static fromEntity(entity: Entity): ShipAttackDefn
	{
		return entity.propertyByName(ShipAttackDefn.name) as ShipAttackDefn;
	}

	activate(universe: Universe, world: World, place: Place, actor: Entity): void
	{
		var attackDefn = this;

		var projectileCollider =
			new Sphere(Coords.create(), attackDefn.projectileRadius);
		var projectileCollidable = new Collidable
		(
			false, // canCollideAgainWithoutSeparating
			null, // ticks
			projectileCollider,
			[ Killable.name ],
			this.projectileCollide
		);

		var actorVisual = actor.drawable().visual as VisualWrapped;
		var projectileVisual = new VisualWrapped
		(
			actorVisual.sizeToWrapTo,
			attackDefn.visualProjectile,
		);
		var projectileDrawable = Drawable.fromVisual(projectileVisual);

		var projectileKillable = new Killable(1, null, null);

		var actorLoc = actor.locatable().loc;
		var actorOrientation = actorLoc.orientation;
		var actorForward = actorOrientation.forward;
		var projectileDirectionAsPolar = Polar.create().fromCoords(actorForward);
		projectileDirectionAsPolar.azimuthInTurns += attackDefn.angleInTurns;
		projectileDirectionAsPolar.azimuthInTurns =
			NumberHelper.wrapToRangeMinMax(projectileDirectionAsPolar.azimuthInTurns, 0, 1);
		var projectileDirection =
			projectileDirectionAsPolar.toCoords(Coords.create());
		var actorRadius = (actor.collidable().collider as Sphere).radius;
		var actorPos = actorLoc.pos;
		var projectilePos = actorPos.clone().add
		(
			projectileDirection.clone().multiplyScalar(actorRadius).double()
		);
		var projectileLoc = Disposition.fromPos(projectilePos);
		projectileLoc.vel.overwriteWith
		(
			projectileDirection
		).multiplyScalar(this.speed);
		var projectileLocatable = new Locatable(projectileLoc);

		var projectileMovable = Movable.default();

		var projectileEntityProperties = new Array<EntityPropertyBase>
		(
			this,
			projectileCollidable,
			projectileLocatable,
			projectileDrawable,
			projectileKillable,
			projectileMovable
		);

		if (this.ticksToLive != null)
		{
			projectileEntityProperties.push
			(
				new Ephemeral(this.ticksToLive, null)
			);
		}

		var projectileEntity = new Entity
		(
			"Projectile" + Math.random(), projectileEntityProperties
		);

		place.entityToSpawnAdd(projectileEntity);
	}

	projectileCollide(uwpe: UniverseWorldPlaceEntities): void
	{
		var place = uwpe.place;
		var entityProjectile = uwpe.entity;
		var entityOther = uwpe.entity2;

		var attackDefn = ShipAttackDefn.fromEntity(entityProjectile);

		if (attackDefn.diesOnImpact == true)
		{
			var killable = entityProjectile.killable();
			killable.integrity = 0;

			var drawable = entityProjectile.drawable();
			var visualWrapped = drawable.visual as VisualWrapped;
			visualWrapped.child = attackDefn.visualImpact;

			var entityImpact = new Entity
			(
				"Impact",
				[
					new Ephemeral(10, null), // hack
					entityProjectile.locatable(),
					entityProjectile.drawable()
				]
			);

			place.entityToSpawnAdd(entityImpact);
		}

		var entityOtherKillable = entityOther.killable();
		if (entityOtherKillable != null)
		{
			var projectileDamagePerHit = attackDefn.damage;
			entityOtherKillable.integrity -= projectileDamagePerHit;
			var entityOtherShip = Ship.fromEntity(entityOther);
			if (entityOtherShip != null)
			{
				entityOtherShip.crew = entityOtherKillable.integrity;
			}
		}
	}

	// Clonable.

	clone(): ShipAttackDefn { throw new Error("todo"); }
	overwriteWith(other: ShipAttackDefn): ShipAttackDefn { throw new Error("todo"); }

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return ShipAttackDefn.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: ShipAttackDefn): boolean { return false; } 
}
