
function PlacePlanetOrbit(planet)
{
	this.planet = planet;
	Place.call(this, entities);

}
{
	PlacePlanetOrbit.prototype = Object.create(Place.prototype);
	PlacePlanetOrbit.prototype.constructor = Place;

	PlacePlanetOrbit.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlacePlanetOrbit.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		this.venueControls.draw(universe, world);
	}

	PlacePlanetOrbit.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlacePlanetOrbit.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);
		if (this.venueControls == null)
		{
			var controlRoot = universe.controlBuilder.message
			(
				universe,
				this.sizeInPixels(universe),
				this.messageToShow,
				function acknowledge(universe)
				{
					// todo
				}
			);

			this.venueControls = new VenueControls(controlRoot);
		}
	}
}
