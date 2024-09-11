
class PlacePlanetOrbit extends PlaceBase
{
	planet: Planet;
	placePlanetVicinity: PlacePlanetVicinity;

	hasEnergyBeenScanned: boolean;
	hasLifeBeenScanned: boolean;
	haveMineralsBeenScanned: boolean;
	venueControls: VenueControls;

	_camera: Camera;
	_drawPos: Coords;

	constructor
	(
		world: WorldExtended,
		planet: Planet,
		placePlanetVicinity: PlacePlanetVicinity
	)
	{
		super
		(
			PlacePlanetOrbit.name,
			PlacePlanetOrbit.name,
			null, // parentName
			planet.sizeSurface, // size
			null // entities
		);

		this.planet = planet;
		this.placePlanetVicinity = placePlanetVicinity;

		var planetDefn = this.planet.defn();

		if (planetDefn.canLand)
		{
			var entities = this.entitiesToSpawn;

			entities.push(new GameClock(2880).toEntity());

			// Resources.

			var resourceRadiusBase = 5; // todo
			var resourceEntities = this.planet.resources.map
			(
				x => x.toEntity(world, this, resourceRadiusBase)
			);
			entities.push(...resourceEntities);

			// Lifeforms.

			var lifeformEntities = this.planet.lifeforms.map
			(
				x => x.toEntity(world, this.planet)
			);
			entities.push(...lifeformEntities);

			var energySourceEntities = this.planet.energySources.map
			(
				x => x.toEntity(world, this.planet)
			);
			entities.push(...energySourceEntities);
		}

		this._camera = new Camera
		(
			Coords.fromXY(1, 1).multiplyScalar(this.planet.sizeSurface.y),
			null, // focalLength
			Disposition.fromOrientation
			(
				Orientation.Instances().ForwardZDownY.clone()
			),
			null // entitiesInViewSort
		);
		var cameraAsEntity = CameraHelper.toEntity(this._camera);
		this.entityToSpawnAdd(cameraAsEntity);

		this._drawPos = Coords.create();
	}

	// methods

	land(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var player = world.player;
		var flagship = player.flagship;

		if (flagship.numberOfLanders <= 0)
		{
			// todo - Notify player.
		}
		else
		{
			var placeOrbit = world.placeCurrent as PlacePlanetOrbit;
			var planet = placeOrbit.planet;

			var fuelRequiredToLandPerG = 2;
			var fuelRequiredToLand =
				planet.gravity * fuelRequiredToLandPerG;

			var fuelRequiredToLandMax = 3;
			if (fuelRequiredToLand > fuelRequiredToLandMax)
			{
				fuelRequiredToLand = fuelRequiredToLandMax;
			}

			var fuelHeld = flagship.fuel;
			var isFuelHeldSufficientToLand =
				(fuelHeld >= fuelRequiredToLand);

			if (isFuelHeldSufficientToLand == false)
			{
				// todo - Notify player.
			}
			else
			{
				flagship.fuel -= fuelRequiredToLand;

				var placeNext = new PlacePlanetSurface(world, planet, placeOrbit);
				world.placeNextSet(placeNext);
			}
		}


	}

	returnToPlaceParent(universe: Universe): void
	{
		var world = universe.world;
		var placeOrbit = world.placeCurrent as PlacePlanetOrbit;
		var placePlanetVicinity = placeOrbit.placePlanetVicinity;
		world.placeNextSet(placePlanetVicinity);
	}

	scanEnergy(universe: Universe): void
	{
		(universe.world as WorldExtended).gameSecondsSinceStart += 60 * 60;
		this.hasEnergyBeenScanned = true;
	}

	scanLife(universe: Universe): void
	{
		(universe.world as WorldExtended).gameSecondsSinceStart += 60 * 60;
		this.hasLifeBeenScanned = true;
	}

	scanMinerals(universe: Universe): void
	{
		(universe.world as WorldExtended).gameSecondsSinceStart += 60 * 60;
		this.haveMineralsBeenScanned = true;
	}

	starsystem(): Starsystem
	{
		return this.placePlanetVicinity.placeStarsystem.starsystem;
	}

	// overrides

	draw(universe: Universe, world: World): void
	{
		var uwpe = new UniverseWorldPlaceEntities
		(
			universe, world, this, null, null
		);

		var display = universe.display;

		super.draw(universe, world, display);
		this.venueControls.draw(universe);

		var controlContainer =
			this.venueControls.controlRoot as ControlContainer;
		var controlMap = controlContainer.childByName("containerMap");
		var mapPos = controlMap.pos;
		var mapSize = controlMap.size;
		var surfaceSize = this.planet.sizeSurface;

		var scanContacts = this.entitiesAll();
		var contactPosSaved = Coords.create();
		for (var i = 0; i < scanContacts.length; i++)
		{
			var contact = scanContacts[i];
			var contactMappable = Mappable.fromEntity(contact);
			if (contactMappable != null)
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

				var contactVisual = contactMappable.visual;
				contactVisual.draw(uwpe.entitySet(contact), display);

				contactPos.overwriteWith(contactPosSaved);
			}
		}
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		var planet = this.planet;
		var planetDefn = planet.defn();
		if (planetDefn.name == "Rainbow")
		{
			var universe = uwpe.universe;
			var world = universe.world as WorldExtended;
			var player = world.player;
			var starsystem = this.placePlanetVicinity.placeStarsystem.starsystem;
			player.rainbowWorldKnownStarsystemAdd(starsystem);
		}
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var world = uwpe.world;

		super.updateForTimerTick(uwpe);
		if (this.venueControls == null)
		{
			var controlRoot = this.toControl(universe, world);
			this.venueControls = VenueControls.fromControl(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe);
	}

	// controls

	toControl(universe: Universe, worldAsWorld: World): ControlBase
	{
		var world = worldAsWorld as WorldExtended;

		var placePlanetOrbit = this;
		var planet = this.planet;

		var containerMainSize = universe.display.sizeInPixels.clone();
		var fontHeight = 20;
		var font = FontNameAndHeight.fromHeightInPixels(fontHeight);
		var fontHeightShort = fontHeight / 2;
		var fontShort = FontNameAndHeight.fromHeightInPixels(fontHeightShort);
		var buttonBackSize = Coords.fromXY(1, 1).multiplyScalar(1.6 * fontHeightShort);
		var marginWidth = 8;
		var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);

		var titleSize = Coords.fromXY(containerMainSize.x, 25);
		var labelSize = Coords.fromXY(200, 10);

		var containerRightSize = Coords.fromXY
		(
			(containerMainSize.x - marginSize.x * 3) / 4,
			containerMainSize.y - marginSize.y * 3 - titleSize.y
		);

		var buttonSizeRight = Coords.fromXY
		(
			containerRightSize.x - marginSize.x * 2,
			fontHeightShort * 1.5
		);

		var buttonScanSize = Coords.fromXY
		(
			containerRightSize.x - marginSize.x * 4,
			buttonSizeRight.y
		);

		var containerScanSize = Coords.fromXY
		(
			containerRightSize.x - marginSize.x * 2,
			buttonScanSize.y * 3 + marginSize.y * 2
		);

		var containerMapSize = Coords.fromXY
		(
			containerMainSize.x - marginSize.x * 3 - containerRightSize.x,
			(containerRightSize.y - marginSize.y) / 2
		);

		var containerInfoSize = Coords.fromXY
		(
			(containerMapSize.x - marginSize.x) / 2,
			containerMapSize.y
		);

		var containerInfo = ControlContainer.from4
		(
			"containerInfo",
			Coords.fromXY
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
					Coords.fromXY(marginSize.x, labelSize.y),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Name: " + planet.name),
					fontShort
				),

				new ControlLabel
				(
					"labelMass",
					Coords.fromXY(marginSize.x, labelSize.y * 2),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext
					(
						"Mass: "
						+ planet.mass.toExponential(3).replace("e", " x 10^").replace("+", "")
						+ " kg"
					),
					fontShort
				),

				new ControlLabel
				(
					"labelRadius",
					Coords.fromXY(marginSize.x, labelSize.y * 3),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Radius: " + planet.radius + " km"),
					fontShort
				),

				new ControlLabel
				(
					"labelGravity",
					Coords.fromXY(marginSize.x, labelSize.y * 4),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Surface Gravity: " + planet.gravity + "g"),
					fontShort
				),

				new ControlLabel
				(
					"labelOrbitDistance",
					Coords.fromXY(marginSize.x, labelSize.y * 5),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext
					(
						"Orbit: "
						+ planet.orbit.toExponential(3).replace("e", " x 10^").replace("+", "")
						+ " km"
					),
					fontShort
				),

				new ControlLabel
				(
					"labelRotationPeriod",
					Coords.fromXY(marginSize.x, labelSize.y * 6),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Day: " + planet.dayInHours + " hours"),
					fontShort
				),

				new ControlLabel
				(
					"labelOrbitPeriod",
					Coords.fromXY(marginSize.x, labelSize.y * 7),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Year: " + planet.yearInEarthDays + " Earth days"),
					fontShort
				),

				new ControlLabel
				(
					"labelTemperature",
					Coords.fromXY(marginSize.x, labelSize.y * 8),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Temperature: " + planet.temperature + " C"),
					fontShort
				),

				new ControlLabel
				(
					"labelWeather",
					Coords.fromXY(marginSize.x, labelSize.y * 9),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Weather: Class " + planet.weather),
					fontShort
				),

				new ControlLabel
				(
					"labelTectonics",
					Coords.fromXY(marginSize.x, labelSize.y * 10),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Tectonics: Class " + planet.tectonics),
					fontShort
				),
			]
		);

		var visualPlanetFromOrbit =  this.planet.defn().visualOrbit;
		var visualGlobe = new VisualGroup
		([
			VisualRectangle.fromSizeAndColorFill
			(
				containerInfoSize, Color.Instances().Black
			),
			visualPlanetFromOrbit
		]);

		var containerGlobe = ControlContainer.from4
		(
			"containerGlobe",
			Coords.fromXY
			(
				marginSize.x * 2 + containerInfoSize.x,
				marginSize.y * 2 + titleSize.y
			),
			containerInfoSize,
			// children
			[
				ControlVisual.from4
				(
					"visualGlobe",
					Coords.fromXY(0, 0),
					containerInfoSize,
					DataBinding.fromContext<VisualBase>
					(
						visualGlobe
					)
				)
			]
		);

		var containerPlayer = world.player.toControlSidebar(world);

		var canLandAsBinding =
			DataBinding.fromBooleanWithContext(this.planet.defn().canLand, null);

		var containerRight = ControlContainer.from4
		(
			"containerRight",
			Coords.fromXY
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
					Coords.fromXY
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
					false, // isTextCenteredVertically
					DataBinding.fromContext("Scan:"),
					fontShort
				),

				ControlContainer.from4
				(
					"containerScan",
					Coords.fromXY
					(
						marginSize.x,
						containerRightSize.y
							- marginSize.y * 2
							- buttonSizeRight.y
							- containerScanSize.y
					),
					containerScanSize,
					[
						ControlButton.from8
						(
							"buttonScanMineral",
							Coords.fromXY
							(
								marginSize.x,
								marginSize.y
							),
							buttonScanSize,
							"Mineral",
							fontShort,
							true, // hasBorder,
							canLandAsBinding, // isEnabled,
							() => placePlanetOrbit.scanMinerals(universe)
						),

						ControlButton.from8
						(
							"buttonScanLife",
							Coords.fromXY
							(
								marginSize.x,
								marginSize.y + buttonScanSize.y
							),
							buttonScanSize,
							"Life",
							fontShort,
							true, // hasBorder,
							canLandAsBinding, // isEnabled,
							() => placePlanetOrbit.scanLife(universe)
						),

						ControlButton.from8
						(
							"buttonScanEnergy",
							Coords.fromXY
							(
								marginSize.x,
								marginSize.y + buttonScanSize.y * 2
							),
							buttonScanSize,
							"Energy",
							fontShort,
							true, // hasBorder,
							canLandAsBinding, // isEnabled,
							() => placePlanetOrbit.scanEnergy(universe)
						),
					]
				),

				ControlButton.from8
				(
					"buttonLand",
					Coords.fromXY
					(
						marginSize.x,
						containerRightSize.y - marginSize.y - buttonSizeRight.y
					),
					buttonSizeRight,
					"Land",
					fontShort,
					true, // hasBorder,
					canLandAsBinding, // isEnabled,
					() => placePlanetOrbit.land(universe)
				),
			]
		);

		var controlRoot = ControlContainer.from4
		(
			"containerPlanetOrbit",
			Coords.fromXY(0, 0), // pos
			containerMainSize,
			[
				new ControlLabel
				(
					"labelOrbit",
					Coords.fromXY(0, marginSize.y),
					titleSize,
					true, // isTextCentered
					false, // isTextCenteredVertically
					DataBinding.fromContext("Orbit"),
					font
				),

				containerInfo,

				containerGlobe,

				ControlContainer.from4
				(
					"containerMap",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 3 + titleSize.y + containerMapSize.y
					),
					containerMapSize,
					// children
					[
						ControlVisual.from4
						(
							"visualSurface",
							Coords.Instances().Zeroes,
							containerMapSize,
							DataBinding.fromContext<VisualBase>
							(
								new VisualImageScaled
								(
									containerMapSize,
									new VisualImageFromLibrary("PlanetSurface")
								)
							)
						),
					]
				),

				containerRight,

				ControlButton.from8
				(
					"buttonBack",
					marginSize,
					buttonBackSize,
					"<",
					fontShort,
					true, // hasBorder,
					DataBinding.fromTrue(), // isEnabled,
					() => placePlanetOrbit.returnToPlaceParent(universe)
				),
			]
		);

		return controlRoot;
	}

}
