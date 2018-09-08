
function PlacePlanetOrbit(world, planet, placePlanetVicinity)
{
	this.planet = planet;
	this.placePlanetVicinity = placePlanetVicinity;

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
									var world = universe.world;
									var placeOrbit = world.place;
									var planet = placeOrbit.planet;
									var placeNext = new PlacePlanetSurface(world, planet, placeOrbit);
									world.placeNext = placeNext;
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
							var world = universe.world;
							var placeOrbit = world.place;
							var placePlanetVicinity = placeOrbit.placePlanetVicinity;
							var planet = placeOrbit.planet;
							var size = placePlanetVicinity.size;
							var playerHeading = 0; // todo
							var playerPos = new Polar
							(
								playerHeading + .5, .4 * size.y
							).wrap().toCoords
							(
								new Coords()
							).add
							(
								size.clone().half()
							);
							world.placeNext = new PlacePlanetVicinity
							(
								world, size, planet, playerPos, placePlanetVicinity.placeStarsystem
							);
						},
						universe // context
					),
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
