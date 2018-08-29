
function PlaceStationDock(world, placeStation)
{
	this.placeStation = placeStation;

	var entities = [];
	Place.call(this, entities);
}
{
	PlaceStationDock.prototype = Object.create(Place.prototype);
	PlaceStationDock.prototype.constructor = Place;

	PlaceStationDock.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceStationDock.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		this.venueControls.draw(universe, world);
	}

	PlaceStationDock.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceStationDock.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);
		if (this.venueControls == null)
		{
			var containerSize = universe.display.sizeInPixels;
			var fontHeight = 10;

			var controlRoot = new ControlContainer
			(
				"controlStationDock",
				new Coords(0, 0), // pos
				containerSize,
				[
					new ControlLabel
					(
						"labelDock",
						new Coords(200, 50), 
						new Coords(200, 50),
						true, // isTextCentered
						"[Dock]",
						fontHeight
					),

					new ControlLabel
					(
						"labelResources",
						new Coords(100, 100), 
						new Coords(100, 50),
						true, // isTextCentered
						"[Resources]",
						fontHeight
					),

					new ControlLabel
					(
						"labelShips",
						new Coords(200, 100), 
						new Coords(100, 50),
						true, // isTextCentered
						"[Ships]",
						fontHeight
					),

					new ControlButton
					(
						"buttonFuelAdd",
						new Coords(100, 125), // pos
						new Coords(45, 50), // size
						"Fuel+",
						fontHeight,
						true, // hasBorder,
						true, // isEnabled,
						function click(universe)
						{
							// todo
						},
						universe // context
					),

					new ControlButton
					(
						"buttonFuelSubtract",
						new Coords(150, 125), // pos
						new Coords(45, 50), // size
						"Fuel-",
						fontHeight,
						true, // hasBorder,
						true, // isEnabled,
						function click(universe)
						{
							// todo
						},
						universe // context
					),

					new ControlButton
					(
						"buttonCrewAdd",
						new Coords(200, 125), // pos
						new Coords(45, 50), // size
						"Crew+",
						10, // fontHeight
						true, // hasBorder,
						true, // isEnabled,
						function click(universe)
						{
							// todo
						},
						universe // context
					),

					new ControlButton
					(
						"buttonCrewSubtract",
						new Coords(250, 125), // pos
						new Coords(45, 50), // size
						"Crew-",
						fontHeight,
						true, // hasBorder,
						true, // isEnabled,
						function click(universe)
						{
							// todo
						},
						universe // context
					),

					new ControlButton
					(
						"buttonLeave",
						new Coords(100, 200), // pos
						new Coords(200, 50), // size
						"Leave",
						fontHeight,
						true, // hasBorder,
						true, // isEnabled,
						function click(universe)
						{
							var world = universe.world;
							var place = world.place;
							var placeNext = place.placeStation;
							world.placeNext = placeNext;
						},
						universe // context
					),
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
