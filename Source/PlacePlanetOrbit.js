
function PlacePlanetOrbit(world, planet)
{
	this.planet = planet;

	var entities = [];
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
			var messageToShow = "[Orbit]";

			var controlRoot = universe.controlBuilder.choice
			(
				universe,
				universe.display.sizeInPixels.clone(),
				messageToShow,
				[
					"Land", "Leave",
				],
				[
					function land(universe)
					{
						var world = universe.world;
						var placeOrbit = world.place;
						var planet = placeOrbit.planet;
						var placeNext = new PlacePlanetSurface(world, planet);
						world.placeNext = placeNext;
					},

					function leave(universe)
					{
						var world = universe.world;
						var placeOrbit = world.place;
						var planet = placeOrbit.planet;
						var size = planet.starsystem.sizeInner;
						var placeNext = new PlacePlanetVicinity(world, size, planet);
						world.placeNext = placeNext;
					}
				]
			);

			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	PlacePlanetOrbit.prototype.returnToPlace = function(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entities["Player"];
		var playerLoc = playerFromPlaceNext.locatable.loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
