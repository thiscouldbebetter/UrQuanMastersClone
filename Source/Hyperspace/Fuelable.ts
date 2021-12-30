
class Fuelable implements EntityPropertyBase
{
	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}

	initialize(uwpe: UniverseWorldPlaceEntities): void {}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		var world = uwpe.world as WorldExtended;
		var entityFuelable = uwpe.entity;

		var entityLoc = entityFuelable.locatable().loc;
		var entityVel = entityLoc.vel;
		var entitySpeed = entityVel.magnitude();
		var fuelConsumedPerSpeed = .1;
		if (entitySpeed > 0)
		{
			var flagship = world.player.flagship;
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

	// Equatable.

	equals(other: Fuelable): boolean { return false; }
}
