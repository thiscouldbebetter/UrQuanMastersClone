
function PlaceStation(world, station, placePlanetVicinity)
{
	this.station = station;
	this.placePlanetVicinity = placePlanetVicinity;

	var entities = [];
	Place.call(this, entities);
}
{
	PlaceStation.prototype = Object.create(Place.prototype);
	PlaceStation.prototype.constructor = Place;

	PlaceStation.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceStation.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		this.venueControls.draw(universe, world);
	}

	PlaceStation.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceStation.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);
		if (this.venueControls == null)
		{
			var messageToShow = "[Station]";

			var controlRoot = universe.controlBuilder.choice
			(
				universe,
				universe.display.sizeInPixels.clone(),
				messageToShow,
				[ "Talk", "Dock", "Leave", ],
				[
					function talk(universe)
					{
						var world = universe.world;
						var size = new Coords(400, 300); // todo
						var conversation = new Conversation(size);
						var placeNext = new PlaceConversation(world, conversation, world.place);
						world.placeNext = placeNext;
					},

					function dock(universe)
					{
						var world = universe.world;
						var size = new Coords(400, 300); // todo
						var placeStation = world.place;
						var placeNext = new PlaceStationDock(world, placeStation);
						world.placeNext = placeNext;
					},

					function leave(universe)
					{
						var world = universe.world;
						var place = world.place;
						var placePrev = place.placePlanetVicinity;
						var size = placePrev.size;
						var planet = placePrev.planet;
						var station = place.station;
						var playerPosNext = station.posAsPolar.toCoords
						(
							new Coords()
						).add
						(
							size.clone().half()
						).add
						(
							new Coords(3, 0).multiplyScalar(10)
						);
						var placeNext = new PlacePlanetVicinity
						(
							world, size, planet, playerPosNext, placePrev.placeStarsystem
						);
						world.placeNext = placeNext;
					}
				]
			);

			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	PlaceStation.prototype.returnToPlace = function(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entities["Player"];
		var playerLoc = playerFromPlaceNext.locatable.loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
