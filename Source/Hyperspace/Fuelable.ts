
class Fuelable implements EntityProperty
{
	// EntityProperty.

	finalize(u: Universe, w: World, p: Place, e: Entity): void {}

	initialize(u: Universe, w: World, p: Place, e: Entity): void {}

	updateForTimerTick
	(
		universe: Universe, world: World, place: Place, entityFuelable: Entity
	): void
	{
		var entityLoc = entityFuelable.locatable().loc;
		var entityVel = entityLoc.vel;
		var entitySpeed = entityVel.magnitude();
		var fuelConsumedPerSpeed = .1;
		if (entitySpeed > 0)
		{
			var flagship = (world as WorldExtended).player.flagship;
			var fuelToConsume = entitySpeed * fuelConsumedPerSpeed;
			if (flagship.fuel >= fuelToConsume)
			{
				flagship.fuel -= fuelToConsume;
			}
			else
			{
				flagship.fuel = 0;
			}
		}
	}
}
