
class ShipAttackDefn implements EntityProperty
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

	activate(universe: Universe, world: World, place: Place, actor: Entity): void
	{
		var attackDefn = this;
		var actorLoc = actor.locatable().loc;
		var actorPos = actorLoc.pos;
		var actorVisual = actor.drawable().visual as VisualWrapped;

		var projectileVisual = new VisualWrapped
		(
			actorVisual.sizeToWrapTo,
			attackDefn.visualProjectile,
		);

		var actorOrientation = actorLoc.orientation;
		var actorForward = actorOrientation.forward;
		var projectileDirectionAsPolar = Polar.create().fromCoords(actorForward);
		projectileDirectionAsPolar.azimuthInTurns += attackDefn.angleInTurns;
		projectileDirectionAsPolar.azimuthInTurns =
			NumberHelper.wrapToRangeMinMax(projectileDirectionAsPolar.azimuthInTurns, 0, 1);
		var projectileDirection =
			projectileDirectionAsPolar.toCoords(Coords.create());
		var actorRadius = (actor.collidable().collider as Sphere).radius;
		var projectilePos = actorPos.clone().add
		(
			projectileDirection.clone().multiplyScalar(actorRadius).double()
		);
		var projectileLoc = Disposition.fromPos(projectilePos);
		projectileLoc.vel.overwriteWith
		(
			projectileDirection
		).multiplyScalar(this.speed);

		var projectileCollider =
			new Sphere(Coords.create(), attackDefn.projectileRadius);

		var projectileEntityProperties = new Array<EntityProperty>
		(
			this,
			new Locatable(projectileLoc),
			new Collidable
			(
				null, // ticks
				projectileCollider,
				[ Killable.name ],
				this.projectileCollide
			),
			Drawable.fromVisual(projectileVisual),
			new Killable(1, null, null),
		);

		if (this.ticksToLive != null)
		{
			projectileEntityProperties.push
			(
				new Ephemeral(this.ticksToLive, null)
			);
		}

		/*
		if (this.activity != null)
		{
			//var targetEntityName = "Ship1"; // todo
			projectileEntityProperties.push
			(
				new Actor(this.activity)//, targetEntityName)
			);
		}
		*/

		var projectileEntity = new Entity
		(
			"Projectile" + Math.random(), projectileEntityProperties
		);

		place.entitiesToSpawn.push(projectileEntity);
	}

	projectileCollide
	(
		universe: Universe, worldAsWorld: World, place: Place,
		entityProjectile: Entity, entityOther: Entity
	): void
	{
		var world = worldAsWorld as WorldExtended;

		var ship = EntityExtensions.ship(entityProjectile);
		var shipDefn = ship.defn(world);
		var attackDefn = shipDefn.attackDefn;

		if (attackDefn.diesOnImpact == true)
		{
			entityProjectile.killable().integrity = 0;
			(entityProjectile.drawable().visual as VisualGroup).children.push
			(
				attackDefn.visualImpact
			);

			var entityImpact = new Entity
			(
				"Impact",
				[
					new Ephemeral(10, null),
					entityProjectile.locatable(),
					entityProjectile.drawable()
				]
			);

			place.entitiesToSpawn.push(entityImpact);
		}

		var entityOtherKillable = entityOther.killable();
		if (entityOtherKillable != null)
		{
			var projectileDamagePerHit = attackDefn.damage;
			entityOtherKillable.integrity -= projectileDamagePerHit;
			var entityOtherShip = EntityExtensions.ship(entityOther);
			if (entityOtherShip != null)
			{
				entityOtherShip.crew = entityOtherKillable.integrity;
			}
		}
	}

	// EntityProperty.

	finalize(universe: Universe, world: World, place: Place, entity: Entity): void {}

	initialize(universe: Universe, world: World, place: Place, entity: Entity): void {}

	updateForTimerTick(universe: Universe, world: World, place: Place, entity: Entity): void {}

}
