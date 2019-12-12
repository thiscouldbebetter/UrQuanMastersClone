
function ShipAttackDefn(name, energyToUse, projectileRadius, angleInTurns, speed, ticksToLive, diesOnImpact, damage, visualProjectile, visualImpact, effectWhenInvoked, activity, effectOnImpact)
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
	this.activity = activity;
	this.effectOnImpact = effectOnImpact;

	this.range = this.speed * this.ticksToLive;
}
{
	ShipAttackDefn.prototype.activate = function(universe, world, place, actor)
	{
		var attackDefn = this;
		var actorLoc = actor.Locatable.loc;
		var actorPos = actorLoc.pos;
		var actorVisual = actor.drawable.visual;

		var projectileVisual = new VisualWrapped
		(
			actorVisual.sizeToWrapTo,
			new VisualCamera
			(
				attackDefn.visualProjectile,
				() => place.camera
			)
		);

		var actorOrientation = actorLoc.orientation;
		var actorForward = actorOrientation.forward;
		var projectileDirectionAsPolar = new Polar().fromCoords(actorForward);
		projectileDirectionAsPolar.azimuthInTurns += attackDefn.angleInTurns;
		projectileDirectionAsPolar.azimuthInTurns =
			projectileDirectionAsPolar.azimuthInTurns.wrapToRangeMinMax(0, 1);
		var projectileDirection = projectileDirectionAsPolar.toCoords(new Coords());
		var actorRadius = actor.Collidable.collider.radius;
		var projectilePos = actorPos.clone().add
		(
			projectileDirection.clone().multiplyScalar(actorRadius).double()
		);
		var projectileLoc = new Location(projectilePos);
		projectileLoc.vel.overwriteWith(projectileDirection).multiplyScalar(this.speed);

		var projectileCollider =
			new Sphere(projectilePos, attackDefn.projectileRadius);

		var projectileEntityProperties =
		[
			this,
			new Locatable( projectileLoc ),
			new Collidable
			(
				projectileCollider,
				[ "killable" ],
				this.projectileCollide
			),
			new Drawable(projectileVisual),
			new Killable(1),
		];

		if (this.ticksToLive != null)
		{
			projectileEntityProperties.push(new Ephemeral(this.ticksToLive));
		}

		if (this.activity != null)
		{
			var targetEntityName = "Ship1"; // todo
			projectileEntityProperties.push
			(
				new Actor(this.activity, targetEntityName)
			);
		}

		var projectileEntity = new Entity
		(
			"Projectile" + Math.random(), projectileEntityProperties
		);

		place.entitiesToSpawn.push(projectileEntity);
	}

	ShipAttackDefn.prototype.projectileCollide = function
	(
		universe, world, place, entityProjectile, entityOther
	)
	{
		var attackDefn = entityProjectile.shipAttackDefn;

		if (attackDefn.diesOnImpact == true)
		{
			entityProjectile.killable.integrity = 0;
			entityProjectile.drawable.visual.child.child = attackDefn.visualImpact;

			var entityImpact = new Entity
			(
				"Impact",
				[
					new Ephemeral(10),
					entityProjectile.Locatable,
					entityProjectile.drawable
				]
			);

			place.entitiesToSpawn.push(entityImpact);
		}

		if (entityOther.killable != null)
		{
			var killable = entityOther.killable;
			var projectileDamagePerHit = attackDefn.damage;
			killable.integrity -= projectileDamagePerHit;
			if (entityOther.ship != null)
			{
				entityOther.Ship.crew = killable.integrity;
			}
		}
	}
}
