
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
