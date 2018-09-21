
function ShipAttackDefn(name, energyToUse, projectileRadius, speed, ticksToLive, damage, visualProjectile, visualImpact, effectWhenInvoked, effectOnImpact)
{
	this.name = name;
	this.energyToUse = energyToUse;
	this.projectileRadius = projectileRadius;
	this.speed = speed;
	this.ticksToLive = ticksToLive;
	this.damage = damage;
	this.visualProjectile = visualProjectile;
	this.visualImpact = visualImpact;
	this.effectWhenInvoked = effectWhenInvoked;
	this.effectOnImpact = effectOnImpact;

	this.range = this.speed * this.ticksToLive;
}
{
	ShipAttackDefn.prototype.projectileSpawn = function(universe, world, place, actor)
	{
		var attackDefn = this;
		var actorLoc = actor.locatable.loc;
		var actorPos = actorLoc.pos;

		var projectileVisual = new VisualCamera
		(
			attackDefn.visualProjectile,
			place.camera
		);

		var actorOrientation = actorLoc.orientation;
		var actorForward = actorOrientation.forward;
		var actorRadius = actor.collidable.collider.radius;
		var projectilePos = actorPos.clone().add
		(
			actorForward.clone().multiplyScalar(actorRadius).double()
		);
		var projectileLoc = new Location(projectilePos);
		projectileLoc.vel.overwriteWith(actorForward).double().double();

		var projectileCollider =
			new Sphere(projectilePos, attackDefn.projectileRadius);

		var projectileDamagePerHit = 1;

		var projectileCollide = function(universe, world, place, entityProjectile, entityOther)
		{
			entityProjectile.killable.integrity = 0;

			if (entityOther.killable != null)
			{
				var killable = entityOther.killable;
				killable.integrity -= projectileDamagePerHit;
				if (entityOther.ship != null)
				{
					entityOther.ship.crew = killable.integrity;
				}
			}
		}

		var projectileEntity = new Entity
		(
			"Projectile",
			[
				new Damager(),
				new Ephemeral(32),
				new Locatable( projectileLoc ),
				new Collidable
				(
					projectileCollider,
					[ "killable" ],
					projectileCollide
				),
				new Drawable(projectileVisual),
				new Killable(1),
			]
		);

		place.entitiesToSpawn.push(projectileEntity);
	}
}
