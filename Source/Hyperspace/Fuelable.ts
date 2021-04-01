
class Fuelable extends EntityProperty
{
	constructor()
	{
		super();
	}

	updateForTimerTick
	(
		universe: Universe, world: World, place: Place, entityFuelable: Entity
	)
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
