
function Fuelable()
{
	// Do nothing.
}
{
	Fuelable.prototype.updateForTimerTick = function(universe, world, place, entityFuelable)
	{
		var entityLoc = entityFuelable.Locatable.loc;
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
}
