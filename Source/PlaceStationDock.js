
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
			var containerDockSize = universe.display.sizeInPixels.clone();
			var fontHeight = 20;
			var fontHeightShort = fontHeight / 2;
			var buttonSize = new Coords(25, 25);
			var marginWidth = 10;
			var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);

			var titleSize = new Coords(containerDockSize.x, 25);
			var labelSize = new Coords(100, 10);

			var containerRightSize = new Coords
			(
				(containerDockSize.x - marginSize.x * 3) / 3,
				containerDockSize.y - marginSize.y * 3 - titleSize.y
			);

			var containerLeftSize = new Coords
			(
				containerDockSize.x - marginSize.x * 3 - containerRightSize.x,
				(containerRightSize.y - marginSize.y) / 2
			);

			var containerLeftInnerSize = new Coords
			(
				(containerLeftSize.x - marginSize.x * 3) / 2,
				(containerLeftSize.y - labelSize.y - marginSize.y * 3)
			); // size

			var controlRoot = new ControlContainer
			(
				"containerDock",
				new Coords(0, 0), // pos
				containerDockSize,
				[
					new ControlLabel
					(
						"labelDock",
						new Coords(containerDockSize.x / 2, marginSize.y + titleSize.y / 2),
						titleSize,
						true, // isTextCentered
						"Dock",
						fontHeight
					),

					new ControlContainer
					(
						"containerTop",
						new Coords
						(
							marginSize.x,
							marginSize.y * 2 + titleSize.y
						),
						containerLeftSize,
						// children
						[
							new ControlLabel
							(
								"labelFlagship",
								marginSize,
								labelSize,
								false, // isTextCentered
								"Flagship:",
								fontHeightShort
							),

							new ControlContainer
							(
								"listComponents",
								new Coords(marginSize.x, marginSize.y * 2 + labelSize.y),
								containerLeftInnerSize,
								[] // todo
							),
						]
					),

					new ControlContainer
					(
						"containerBottom",
						new Coords
						(
							marginSize.x,
							marginSize.y * 3 + titleSize.y + containerLeftSize.y
						),
						containerLeftSize,
						// children
						[
							new ControlLabel
							(
								"labelFleet",
								marginSize,
								labelSize,
								false, // isTextCentered
								"Fleet:",
								fontHeightShort
							),

							new ControlContainer
							(
								"listShips",
								new Coords(marginSize.x, marginSize.y * 2 + labelSize.y),
								containerLeftInnerSize,
								[] // todo
							),
						]
					),

					new ControlContainer
					(
						"containerRight",
						new Coords
						(
							marginSize.x * 2 + containerLeftSize.x,
							marginSize.y * 2 + titleSize.y
						),
						containerRightSize,
						// children
						[
							new ControlLabel
							(
								"labelResources",
								marginSize,
								labelSize,
								false, // isTextCentered
								"Resources:",
								fontHeightShort
							),

							new ControlContainer
							(
								"containerMinerals",
								new Coords
								(
									marginSize.x,
									marginSize.y * 2 + labelSize.y
								),
								new Coords
								(
									containerRightSize.x - marginSize.x * 2,
									containerRightSize.y - marginSize.y * 3 - labelSize.y
								), // size
								[] // todo
							),
						]
					),

					new ControlButton
					(
						"buttonBack",
						marginSize,
						buttonSize,
						"<",
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
