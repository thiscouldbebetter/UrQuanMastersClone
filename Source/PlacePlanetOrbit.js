
function PlacePlanetOrbit(world, planet, placePlanetVicinity)
{
	this.planet = planet;
	this.placePlanetVicinity = placePlanetVicinity;

	var entities = [];
	Place.call(this, entities);
}
{
	// superclass

	PlacePlanetOrbit.prototype = Object.create(Place.prototype);
	PlacePlanetOrbit.prototype.constructor = Place;

	// methods

	PlacePlanetOrbit.prototype.land = function(universe)
	{
		var world = universe.world;
		var placeOrbit = world.place;
		var planet = placeOrbit.planet;
		var placeNext = new PlacePlanetSurface(world, planet, placeOrbit);
		world.placeNext = placeNext;
	}

	PlacePlanetOrbit.prototype.returnToPlaceParent = function(universe)
	{
		var world = universe.world;
		var placeOrbit = world.place;
		var placePlanetVicinity = placeOrbit.placePlanetVicinity;
		var planetDeparted = placeOrbit.planet;

		var size = placePlanetVicinity.size;
		var playerPosNext = size.clone().half();

		var planetPrimary = placePlanetVicinity.planet;
		if (planetDeparted != planetPrimary)
		{
			playerPosNext.add
			(
				planetDeparted.posAsPolar.toCoords( new Coords() )
			)
		}

		var playerOrientationNext = Orientation.Instances.ForwardXDownZ.clone()
		var playerHeading = playerOrientationNext.headingInTurns();
		playerPosNext.add
		(
			new Polar
			(
				playerHeading, planetDeparted.radiusOuter * 3
			).toCoords
			(
				new Coords()
			)
		);

		var playerLocNext = new Location(playerPosNext, playerOrientationNext);

		world.placeNext = new PlacePlanetVicinity
		(
			world, size, planetPrimary, playerLocNext, placePlanetVicinity.placeStarsystem
		);
	}


	// overrides

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
			var controlRoot = this.toControl(universe, world);
			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	// controls

	PlacePlanetOrbit.prototype.toControl = function(universe, world)
	{
		var placePlanetOrbit = this;

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

		var buttonSizeRight = new Coords
		(
			containerRightSize.x - marginSize.x * 2,
			fontHeightShort * 2
		);

		var buttonScanSize = new Coords
		(
			containerRightSize.x - marginSize.x * 4,
			fontHeightShort * 2
		);

		var containerScanSize = new Coords
		(
			containerRightSize.x - marginSize.x * 2,
			buttonScanSize.y * 3 + marginSize.y * 4
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
			"containerPlanetOrbit",
			new Coords(0, 0), // pos
			containerDockSize,
			[
				new ControlLabel
				(
					"labelOrbit",
					new Coords(containerDockSize.x / 2, marginSize.y + titleSize.y / 2),
					titleSize,
					true, // isTextCentered
					"Orbit",
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
							"labelInfo",
							marginSize,
							labelSize,
							false, // isTextCentered
							"[Info]",
							fontHeightShort
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
							"labelSurface",
							marginSize,
							labelSize,
							false, // isTextCentered
							"[Surface]",
							fontHeightShort
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
						new ControlContainer
						(
							"containerScan",
							new Coords
							(
								marginSize.x,
								containerRightSize.y
									- marginSize.y * 2
									- buttonSizeRight.y
									- containerScanSize.y
							),
							containerScanSize,
							[
								new ControlButton
								(
									"buttonScanMineral",
									new Coords
									(
										marginSize.x,
										marginSize.y
									),
									buttonScanSize,
									"Mineral",
									fontHeightShort,
									true, // hasBorder,
									true, // isEnabled,
									function click(universe)
									{
										// todo
									},
									universe
								),

								new ControlButton
								(
									"buttonScanLife",
									new Coords
									(
										marginSize.x,
										marginSize.y * 2 + buttonScanSize.y
									),
									buttonScanSize,
									"Life",
									fontHeightShort,
									true, // hasBorder,
									true, // isEnabled,
									function click(universe)
									{
										// todo
									},
									universe
								),

								new ControlButton
								(
									"buttonScanEnergy",
									new Coords
									(
										marginSize.x,
										marginSize.y * 3 + buttonScanSize.y * 2
									),
									buttonScanSize,
									"Energy",
									fontHeightShort,
									true, // hasBorder,
									true, // isEnabled,
									function click(universe)
									{
										// todo
									},
									universe
								),
							]
						),

						new ControlButton
						(
							"buttonLand",
							new Coords
							(
								marginSize.x,
								containerRightSize.y - marginSize.y - buttonSizeRight.y
							),
							buttonSizeRight,
							"Land",
							fontHeightShort,
							true, // hasBorder,
							true, // isEnabled,
							function click(universe)
							{
								placePlanetOrbit.land(universe);
							},
							universe
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
						placePlanetOrbit.returnToPlaceParent(universe);
					},
					universe // context
				),
			]
		);

		return controlRoot;
	}

}
