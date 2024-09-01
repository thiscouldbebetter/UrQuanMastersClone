
class PlacePlanetSurface extends PlaceBase
{
	planet: Planet;
	placePlanetOrbit: PlacePlanetOrbit;

	actionToInputsMappingsByInputName: Map<string,ActionToInputsMapping>;
	actions: Action[];
	venueControls: VenueControls;

	_actionToInputsMappings: ActionToInputsMapping[];
	_camera: Camera;
	_drawPos: Coords;

	constructor
	(
		worldAsWorld: World,
		planet: Planet,
		placePlanetOrbit: PlacePlanetOrbit
	)
	{
		super
		(
			PlacePlanetSurface.name,
			PlacePlanetSurface.name,
			null, // parentName
			Coords.fromXY(300, 300),
			null // entities
		);

		var world = worldAsWorld as WorldExtended;

		this.planet = planet;
		this.size = () => this.planet.sizeSurface;
		this.placePlanetOrbit = placePlanetOrbit;

		var actionExit = new Action
		(
			"Exit", this.exit
		);

		var actionFire = Ship.actionFire();

		this.actions =
		[
			Ship.actionShowMenu(),
			Ship.actionAccelerate(),
			Ship.actionTurnLeft(),
			Ship.actionTurnRight(),
			actionFire,
			actionExit,
		];//.addLookupsByName();

		this._actionToInputsMappings = Ship.actionToInputsMappings();
		this._actionToInputsMappings = this._actionToInputsMappings.concat
		(
			[
				new ActionToInputsMapping("Fire", ["Enter", "Gamepad0Button0"], true),
				new ActionToInputsMapping("Exit", ["_", "Gamepad0Button1"], true),
			]
		);
		this.actionToInputsMappingsByInputName = ArrayHelper.addLookupsMultiple
		(
			this._actionToInputsMappings, x => x.inputNames
		);

		// entities

		var entities = this.entitiesToSpawn;

		entities.push(new GameClock(2880).toEntity());

		var entityDimension = 10;

		// camera

		this._camera = new Camera
		(
			Coords.fromXY(300, 300), // hack
			null, // focalLength
			Disposition.fromOrientation
			(
				Orientation.Instances().ForwardZDownY.clone()
			),
			null // entitiesInViewSort
		);
		var cameraAsEntity = CameraHelper.toEntity(this._camera);
		entities.push(cameraAsEntity);

		// background

		var visualBackgroundImage: VisualImage =
			new VisualImageFromLibrary("PlanetSurface");
		var planetSizeSurface = this.planet.sizeSurface;
		visualBackgroundImage =
			new VisualImageScaled(planetSizeSurface, visualBackgroundImage);
		var visualBackground =
			new VisualWrapped(planetSizeSurface, visualBackgroundImage);

		var entityBackground = new Entity
		(
			"Background",
			[
				Locatable.fromPos(this.planet.sizeSurface.clone().half() ),
				Drawable.fromVisual(visualBackground)
			]
		);

		entities.push(entityBackground);

		// lifeforms

		var lifeforms = planet.lifeforms;

		if (lifeforms.length > 0)
		{
			var lifeformEntities = lifeforms.map
			(
				(x: Lifeform) => x.toEntity(world, planet)
			);
			entities.push(...lifeformEntities);
		}

		// resources

		var resourceRadiusBase = entityDimension / 2;
		var resources = this.planet.resources || [];
		var resourceEntities = resources.map
		(
			x => x.toEntity(world, placePlanetOrbit, resourceRadiusBase)
		);
		entities.push(...resourceEntities);

		// energySources

		var energySources = this.planet.energySources || [];
		var energySourceEntities = energySources.map
		(
			x => x.toEntity(world, this.planet)
		);
		entities.push(...energySourceEntities);

		// player

		var playerEntity = this.playerEntityBuild(entityDimension);
		entities.push(playerEntity);

		var containerSidebar = this.toControlSidebar(world, playerEntity);
		this.venueControls = VenueControls.fromControl(containerSidebar);

		//this.propertyNamesToProcess.push("ship");

		// Environmental hazards.

		var hazardLevels = [ planet.weather, planet.tectonics, planet.temperature ];
		var hazardTypeNames = [ "Weather", "Tectonics", "Temperature" ];
		var hazardVisualNames = [ "Lightning", "Earthquake", "Hotspot" ];
		var imagesPerVisual = 12;

		for (var i = 0; i < hazardTypeNames.length; i++)
		{
			var hazardLevel = hazardLevels[i];

			if (hazardLevel > 1)
			{
				var hazardVisualName = hazardVisualNames[i];

				var visualsForFrames = [];

				for (var j = 0; j < imagesPerVisual; j++)
				{
					var imageName = hazardVisualName + "-" + StringHelper.padStart(j.toString(), 3, "0");
					var visualForFrame = new VisualImageFromLibrary(imageName);
					visualsForFrames.push(visualForFrame);
				}

				var hazardVisual = VisualAnimation.fromNameAndFrames
				(
					hazardVisualName,
					visualsForFrames
				)

				var hazardTypeName = hazardTypeNames[i];

				var visual = new VisualGroup
				([
					hazardVisual,
					VisualSound.fromSoundName("Sound")
				]);
				var drawable = Drawable.fromVisual(visual);

				var ephemeral = Ephemeral.fromTicksToLive(20);

				var entityHazard = new Entity
				(
					hazardTypeName,
					[
						Animatable2.create(),
						Collidable.default(),
						drawable,
						ephemeral,
						Locatable.create()
					]
				);

				var generatorHazard = new EntityGenerator
				(
					entityHazard,
					new RangeExtent(5, 10), // ticksPerGenerationAsRange
					new RangeExtent(0, 10), // entitiesPerGenerationAsRange
					1000, // entitiesGeneratedMax
					new RangeExtent(0, 0),
				);
				entities.push(generatorHazard.toEntity());
			}
		}

		// Helper variables.

		this._drawPos = Coords.create();
	}

	// Constructor helpers.

	playerEntityBuild(entityDimension: number): Entity
	{
		var playerActivityDefnName = Player.activityDefn().name;
		var playerActivity = new Activity(playerActivityDefnName, null);
		var playerActor = new Actor(playerActivity);

		var playerCollider = new Sphere(Coords.create(), entityDimension / 2);
		var playerCollidable = new Collidable
		(
			false, // canCollideAgainWithoutSeparating
			null, // ticks
			playerCollider,
			[ Collidable.name ], // entityPropertyNamesToCollideWith
			this.playerCollide
		);

		var playerBoundable = Boundable.fromCollidable(playerCollidable);

		var constraintSpeedMax = new Constraint_SpeedMaxXY(10);
		var constraintFriction = new Constraint_FrictionXY(0.1, null);
		var constraintWrapXTrimY = new Constraint_WrapToPlaceSizeXTrimY();

		var playerConstrainable = new Constrainable
		([
			constraintFriction, constraintSpeedMax, constraintWrapXTrimY
		]);

		var playerColor = Color.byName("Gray");
		var playerVisual: VisualBase = ShipDefn.visual
		(
			entityDimension, playerColor, Color.byName("Black")
		);
		playerVisual = new VisualWrapped(this.size(), playerVisual);
		var playerDrawable = Drawable.fromVisual(playerVisual);

		var crewAvailableForLander = 12; // todo
		var playerKillable = new Killable
		(
			crewAvailableForLander, null, this.playerDie
		);

		var playerLander = Lander.fromKillableCrew(playerKillable);

		var playerPos = this.size().clone().half(); // todo
		var playerLoc = Disposition.fromPos(playerPos);
		var playerLocatable = new Locatable(playerLoc);

		var playerMappable = new Mappable(playerVisual);

		var playerMovable = Movable.default();

		var playerPlayable = new Playable();

		var playerShipLander = new Ship("Lander");

		var playerEntity = new Entity
		(
			"Player",
			[
				playerActor,
				playerBoundable,
				playerCollidable,
				playerConstrainable,
				playerDrawable,
				playerKillable,
				playerLander,
				playerLocatable,
				playerMappable,
				playerMovable,
				playerPlayable,
				playerShipLander
			]
		);

		return playerEntity;
	}

	// methods

	actionToInputsMappings(): ActionToInputsMapping[]
	{
		return this._actionToInputsMappings;
	}

	exit(uwpe: UniverseWorldPlaceEntities): void
	{
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlacePlanetSurface;

		var entityLander = place.entityByName(Player.name);
		var lander = Lander.fromEntity(entityLander);
		var itemHoldersForLander = [ lander.itemHolderCargo, lander.itemHolderLifeforms ];

		var itemHolderPlayer = world.player.flagship.itemHolderCargo;

		for (var i = 0; i < itemHoldersForLander.length; i++)
		{
			var itemHolderLander = itemHoldersForLander[i];
			itemHolderLander.itemsAllTransferTo(itemHolderPlayer);
		}

		var placePlanetOrbit = place.placePlanetOrbit;
		world.placeNext = placePlanetOrbit;
	}

	playerCollide(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var place = uwpe.place;
		var entityPlayer = uwpe.entity;
		var entityOther = uwpe.entity2;

		var lander = Lander.fromEntity(entityPlayer);

		var entityOtherName = entityOther.name;
		var entityOtherItem = entityOther.item();
		var entityOtherEnergySource =
			EnergySource.fromEntity(entityOther);

		if (entityOtherItem != null)
		{
			var itemHolder: ItemHolder = null;

			if (entityOtherName.startsWith(Resource.name))
			{
				itemHolder = lander.itemHolderCargo;
			}
			else
			{
				throw new Error("todo");
			}

			itemHolder.itemAdd(entityOther.item());
			place.entityToRemoveAdd(entityOther);
		}
		else if (entityOtherName.startsWith(Lifeform.name))
		{
			var lifeformDamager = entityOther.damager();
			var damage = lifeformDamager.damageToApply(universe);
			var playerKillable = entityPlayer.killable();
			playerKillable.damageApply(uwpe.entitiesSwap(), damage);
			uwpe.entitiesSwap();
		}
		else if (entityOtherEnergySource != null)
		{
			var energySource = entityOtherEnergySource;
			energySource.collideWithLander(uwpe);
		}
	}

	playerDie(uwpe: UniverseWorldPlaceEntities): void
	{
		this.exit(uwpe);
	}

	starsystem(): Starsystem
	{
		return this.placePlanetOrbit.placePlanetVicinity.placeStarsystem.starsystem;
	}

	// Place overrides

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		var player = this.entityByName(Player.name);
		var playerLoc = player.locatable().loc;

		var camera = this._camera;
		var planetSize = this.planet.sizeSurface;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			Coords.fromXY(0, camera.viewSizeHalf.y),
			Coords.fromXY(planetSize.x, planetSize.y - camera.viewSizeHalf.y)
		);

		super.draw(universe, world, display);

		this.venueControls.draw(universe);

		this.drawMap(universe, world);
	}

	drawMap(universe: Universe, world: World)
	{
		var uwpe = new UniverseWorldPlaceEntities
		(
			universe, world, this, null, null
		);

		var containerSidebar =
			this.venueControls.controlRoot as ControlContainer;
		var controlMap = containerSidebar.childByName("containerMap");
		var mapPos = containerSidebar.pos.clone().add(controlMap.pos);
		var mapSize = controlMap.size;
		var surfaceSize = this.planet.sizeSurface;
		var display = universe.display;

		var scanContacts = this.entitiesAll();
		var contactPosSaved = Coords.create();

		for (var i = 0; i < scanContacts.length; i++)
		{
			var contact = scanContacts[i];

			var contactMappable = Mappable.fromEntity(contact);

			if (contactMappable != null)
			{
				var contactPos = contact.locatable().loc.pos;
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

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		super.updateForTimerTick(uwpe);
		this.venueControls.updateForTimerTick(uwpe.universe);
	}

	// controls

	toControlSidebar(world: World, entityPlayer: Entity): ControlBase
	{
		var containerSidebarSize = Coords.fromXY(100, 300); // hack
		var marginWidth = 10;
		var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 10;
		var font = FontNameAndHeight.fromHeightInPixels(fontHeight);
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = Coords.fromXY(childControlWidth, fontHeight);
		var minimapSize = Coords.fromXY(1, .5).multiplyScalar(childControlWidth);
		var containerLanderSize = Coords.fromXY(1, 2).multiplyScalar(childControlWidth);

		var lander = Lander.fromEntity(entityPlayer); // todo

		var containerSidebar = ControlContainer.from4
		(
			"containerSidebar",
			Coords.fromXY(300, 0), // hack - pos
			containerSidebarSize,
			// children
			[
				new ControlLabel
				(
					"labelMap",
					Coords.fromXY(marginSize.x, marginSize.y),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Map:"),
					font
				),

				ControlContainer.from4
				(
					"containerMap",
					Coords.fromXY(marginSize.x, marginSize.y * 2 + labelSize.y), // pos
					minimapSize,
					[
						ControlVisual.from4
						(
							"visualMap",
							Coords.fromXY(0, 0),
							minimapSize,
							DataBinding.fromContext<VisualBase>
							(
								VisualRectangle.fromSizeAndColorFill
								(
									minimapSize, Color.byName("Gray")
								)
							)
						)
					]
				),

				new ControlLabel
				(
					"labelLander",
					Coords.fromXY(marginSize.x, marginSize.y * 3 + labelSize.y + minimapSize.y),
					labelSize,
					false, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext("Lander:"),
					font
				),

				ControlContainer.from4
				(
					"containerLander",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 4 + labelSize.y * 2 + minimapSize.y
					), // pos
					containerLanderSize,
					[
						new ControlLabel
						(
							"labelCrew",
							Coords.fromXY(marginSize.x, marginSize.y),
							labelSize,
							false, // isTextCenteredHorizontally
							false, // isTextCenteredVertically
							DataBinding.fromContext("Crew:"),
							font
						),

						new ControlLabel
						(
							"infoCrew",
							Coords.fromXY(marginSize.x * 5, marginSize.y),
							labelSize,
							false, // isTextCenteredHorizontally
							false, // isTextCenteredVertically
							DataBinding.fromContextAndGet
							(
								lander, (c: Lander) => c.crewCurrentOverMax()
							),
							font
						),

						new ControlLabel
						(
							"labelCargo",
							Coords.fromXY(marginSize.x, marginSize.y * 2),
							labelSize,
							false, // isTextCenteredHorizontally
							false, // isTextCenteredVertically
							DataBinding.fromContext("Cargo:"),
							font
						),

						new ControlLabel
						(
							"infoCargo",
							Coords.fromXY(marginSize.x * 5, marginSize.y * 2),
							labelSize,
							false, // isTextCenteredHorizontally
							false, // isTextCenteredVertically
							DataBinding.fromContextAndGet
							(
								lander, (c: Lander) => c.cargoCurrentOverMax(world)
							),
							font
						),

						new ControlLabel
						(
							"labelData",
							Coords.fromXY(marginSize.x, marginSize.y * 3),
							labelSize,
							false, // isTextCenteredHorizontally
							false, // isTextCenteredVertically
							DataBinding.fromContext("Biodata:"),
							font
						),

						new ControlLabel
						(
							"infoData",
							Coords.fromXY(marginSize.x * 5, marginSize.y * 3),
							labelSize,
							false, // isTextCenteredHorizontally
							false, // isTextCenteredVertically
							DataBinding.fromContextAndGet
							(
								lander, (c: Lander) => c.lifeformsCurrentOverMax(world)
							),
							font
						),

					]// children
				),

				ControlButton.from8
				(
					"buttonLeave",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 5 + labelSize.y * 2 + minimapSize.y + containerLanderSize.y
					), // pos
					Coords.fromXY(containerLanderSize.x, labelSize.y * 2),
					"Launch",
					font,
					true, // hasBorder
					DataBinding.fromTrue(), // isEnabled
					() => this.exit(new UniverseWorldPlaceEntities(null, world, this, null, null) )
				),

			]
		);

		return containerSidebar;
	}
}
