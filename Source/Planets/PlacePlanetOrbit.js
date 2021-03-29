
class PlacePlanetOrbit extends Place
{
	constructor(world, planet, placePlanetVicinity)
	{
		super(PlacePlanetOrbit.name, PlacePlanetOrbit.name, null, []);

		this.planet = planet;
		this.placePlanetVicinity = placePlanetVicinity;

		var entities = this.entitiesToSpawn;
		var resourceRadiusBase = 5; // todo
		var resourceEntities = this.planet.resources.map
		(
			x => x.toEntity(world, this, resourceRadiusBase)
		);
		entities.push(...resourceEntities);

		// todo - Lifeforms and energy sources.

		this._camera = new Camera
		(
			new Coords(1, 1).multiplyScalar(this.planet.sizeSurface.y),
			null, // focalLength
			new Disposition
			(
				new Coords(0, 0, 0),
				Orientation.Instances().ForwardZDownY.clone()
			)
		);
		var cameraAsEntity = CameraHelper.toEntity(this._camera);
		entities.push(cameraAsEntity);

		this._drawPos = new Coords();
	}

	// methods

	land(universe)
	{
		var world = universe.world;
		var placeOrbit = world.placeCurrent;
		var planet = placeOrbit.planet;
		var placeNext = new PlacePlanetSurface(world, planet, placeOrbit);
		world.placeNext = placeNext;
	}

	returnToPlaceParent(universe)
	{
		var world = universe.world;
		var placeOrbit = world.placeCurrent;
		var placePlanetVicinity = placeOrbit.placePlanetVicinity;
		world.placeNext = placePlanetVicinity;
	}

	scanEnergy(universe)
	{
		this.hasEnergyBeenScanned = true;
	}

	scanLife(universe)
	{
		this.hasLifeBeenScanned = true;
	}

	scanMinerals(universe)
	{
		this.haveMineralsBeenScanned = true;
	}

	// overrides

	draw(universe, world)
	{
		var display = universe.display;

		super.draw(universe, world, display);
		this.venueControls.draw(universe, world);

		var controlMap = this.venueControls.controlRoot.childrenByName.get("containerMap");
		var mapPos = controlMap.pos;
		var mapSize = controlMap.size;
		var surfaceSize = this.planet.sizeSurface;

		var scanContacts = this.entities;
		var contactPosSaved = new Coords();
		for (var i = 0; i < scanContacts.length; i++)
		{
			var contact = scanContacts[i];
			var contactDrawable = contact.drawable();
			if (contactDrawable != null)
			{
				var contactLocatable = contact.locatable();
				var contactLoc = contactLocatable.loc;
				var contactPos = contactLoc.pos;
				contactPosSaved.overwriteWith(contactPos);

				var drawPos = this._drawPos.overwriteWith
				(
					contactPos
				).divide
				(
					surfaceSize
				).multiply
				(
					mapSize
				).add
				(
					mapPos
				);

				contactPos.overwriteWith(drawPos);

				var contactVisual = contactDrawable.visual;
				contactVisual.draw(universe, world, this, contact, display);

				contactPos.overwriteWith(contactPosSaved);
			}
		}
	}

	updateForTimerTick(universe, world)
	{
		super.updateForTimerTick(universe, world);
		if (this.venueControls == null)
		{
			var controlRoot = this.toControl(universe, world);
			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	// controls

	toControl(universe, world)
	{
		var placePlanetOrbit = this;
		var planet = this.planet;

		var containerMainSize = universe.display.sizeInPixels.clone();
		var fontHeight = 20;
		var fontHeightShort = fontHeight / 2;
		var buttonBackSize = new Coords(1, 1).multiplyScalar(1.6 * fontHeightShort);
		var marginWidth = 8;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);

		var titleSize = new Coords(containerMainSize.x, 25);
		var labelSize = new Coords(200, 10);

		var containerRightSize = new Coords
		(
			(containerMainSize.x - marginSize.x * 3) / 4,
			containerMainSize.y - marginSize.y * 3 - titleSize.y
		);

		var buttonSizeRight = new Coords
		(
			containerRightSize.x - marginSize.x * 2,
			fontHeightShort * 1.5
		);

		var buttonScanSize = new Coords
		(
			containerRightSize.x - marginSize.x * 4,
			buttonSizeRight.y
		);

		var containerScanSize = new Coords
		(
			containerRightSize.x - marginSize.x * 2,
			buttonScanSize.y * 3 + marginSize.y * 2
		);

		var containerMapSize = new Coords
		(
			containerMainSize.x - marginSize.x * 3 - containerRightSize.x,
			(containerRightSize.y - marginSize.y) / 2
		);

		var containerInfoSize = new Coords
		(
			(containerMapSize.x - marginSize.x) / 2,
			containerMapSize.y
		);

		var containerInfo = new ControlContainer
		(
			"containerInfo",
			new Coords
			(
				marginSize.x,
				marginSize.y * 2 + titleSize.y
			),
			containerInfoSize,
			// children
			[
				new ControlLabel
				(
					"labelName",
					new Coords(marginSize.x, labelSize.y),
					labelSize,
					false, // isTextCentered
					"Name: " + planet.name,
					fontHeightShort
				),

				new ControlLabel
				(
					"labelMass",
					new Coords(marginSize.x, labelSize.y * 2),
					labelSize,
					false, // isTextCentered
					"Mass: " + planet.mass.toExponential(3).replace("e", " x 10^").replace("+", "") + " kg",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelRadius",
					new Coords(marginSize.x, labelSize.y * 3),
					labelSize,
					false, // isTextCentered
					"Radius: " + planet.radius + " km",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelGravity",
					new Coords(marginSize.x, labelSize.y * 4),
					labelSize,
					false, // isTextCentered
					"Surface Gravity: " + planet.gravity + "g",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelOrbitDistance",
					new Coords(marginSize.x, labelSize.y * 5),
					labelSize,
					false, // isTextCentered
					"Orbit: " + planet.orbit.toExponential(3).replace("e", " x 10^").replace("+", "") + " km",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelRotationPeriod",
					new Coords(marginSize.x, labelSize.y * 6),
					labelSize,
					false, // isTextCentered
					"Day: " + planet.day + " hours",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelOrbitPeriod",
					new Coords(marginSize.x, labelSize.y * 7),
					labelSize,
					false,
					"Year: " + planet.year + " Earth days",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelTemperature",
					new Coords(marginSize.x, labelSize.y * 8),
					labelSize,
					false,
					"Temperature: " + planet.temperature + " C",
					fontHeightShort
				),

				new ControlLabel
				(
					"labelWeather",
					new Coords(marginSize.x, labelSize.y * 9),
					labelSize,
					false,
					"Weather: Class " + planet.weather,
					fontHeightShort
				),

				new ControlLabel
				(
					"labelTectonics",
					new Coords(marginSize.x, labelSize.y * 10),
					labelSize,
					false,
					"Tectonics: Class " + planet.tectonics,
					fontHeightShort
				),
			]
		);

		var containerGlobe = new ControlContainer
		(
			"containerGlobe",
			new Coords
			(
				marginSize.x * 2 + containerInfoSize.x,
				marginSize.y * 2 + titleSize.y
			),
			containerInfoSize,
			// children
			[
				new ControlVisual
				(
					"visualGlobe",
					new Coords(0, 0),
					containerInfoSize,
					DataBinding.fromContext
					(
						new VisualGroup
						([
							new VisualRectangle(containerInfoSize, Color.byName("Black") ),
							new VisualCircle(containerInfoSize.y * .4, Color.byName("Gray") ),
							new VisualCircleGradient
							(
								containerInfoSize.y * .4,
								new ValueBreakGroup
								([
									new ValueBreak(0, planet.defn().color),
									new ValueBreak(1, Color.byName("Black"))
								]),
								planet.defn().color
							)
						])
					)
				)
			]
		);

		var containerPlayer = world.player.toControlSidebar(world);

		var containerRight = new ControlContainer
		(
			"containerRight",
			new Coords
			(
				marginSize.x * 2 + containerMapSize.x,
				marginSize.y * 2 + titleSize.y
			),
			containerRightSize,
			// children
			[
				containerPlayer,

				new ControlLabel
				(
					"labelScan",
					new Coords
					(
						marginSize.x,
						containerRightSize.y
							- marginSize.y * 3
							- buttonSizeRight.y
							- containerScanSize.y
							- labelSize.y
					),
					labelSize,
					false, // isTextCentered
					"Scan:",
					fontHeightShort
				),

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
								placePlanetOrbit.scanMinerals(universe);
							},
							universe
						),

						new ControlButton
						(
							"buttonScanLife",
							new Coords
							(
								marginSize.x,
								marginSize.y + buttonScanSize.y
							),
							buttonScanSize,
							"Life",
							fontHeightShort,
							true, // hasBorder,
							true, // isEnabled,
							function click(universe)
							{
								placePlanetOrbit.scanLife(universe);
							},
							universe
						),

						new ControlButton
						(
							"buttonScanEnergy",
							new Coords
							(
								marginSize.x,
								marginSize.y + buttonScanSize.y * 2
							),
							buttonScanSize,
							"Energy",
							fontHeightShort,
							true, // hasBorder,
							true, // isEnabled,
							function click(universe)
							{
								placePlanetOrbit.scanEnergy(universe);
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
		);

		var controlRoot = new ControlContainer
		(
			"containerPlanetOrbit",
			new Coords(0, 0), // pos
			containerMainSize,
			[
				new ControlLabel
				(
					"labelOrbit",
					new Coords(containerMainSize.x / 2, marginSize.y + titleSize.y / 2),
					titleSize,
					true, // isTextCentered
					"Orbit",
					fontHeight
				),

				containerInfo,

				containerGlobe,

				new ControlContainer
				(
					"containerMap",
					new Coords
					(
						marginSize.x,
						marginSize.y * 3 + titleSize.y + containerMapSize.y
					),
					containerMapSize,
					// children
					[
						new ControlVisual
						(
							"visualSurface",
							Coords.Instances().Zeroes,
							containerMapSize,
							DataBinding.fromContext
							(
								new VisualImageScaled
								(
									new VisualImageFromLibrary("PlanetSurface", containerMapSize),
									containerMapSize
								)
							)
						),
					]
				),

				containerRight,

				new ControlButton
				(
					"buttonBack",
					marginSize,
					buttonBackSize,
					"<",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					this.returnToPlaceParent.bind(this),
					universe // context
				),
			]
		);

		return controlRoot;
	}

}
