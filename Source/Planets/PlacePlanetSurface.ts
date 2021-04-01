
class PlacePlanetSurface extends Place
{
	planet: Planet;
	placePlanetOrbit: PlacePlanetOrbit;

	actionToInputsMappingsByInputName: Map<string,ActionToInputsMapping>;
	actions: Action[];
	venueControls: VenueControls;

	_actionToInputsMappings: ActionToInputsMapping[];
	_camera: Camera;
	_drawPos: Coords;

	constructor(worldAsWorld: World, planet: Planet, placePlanetOrbit: PlacePlanetOrbit)
	{
		super(PlacePlanetSurface.name, PlacePlanetSurface.name, Coords.fromXY(300, 300), []);

		var world = worldAsWorld as WorldExtended;

		this.planet = planet;
		this.size = this.planet.sizeSurface;
		this.placePlanetOrbit = placePlanetOrbit;

		var actionExit = new Action
		(
			"Exit",
			this.exit.bind(this)
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

		// constraints

		var constraintSpeedMax = new Constraint_SpeedMaxXY(10);
		var constraintFriction = new Constraint_FrictionXY(0.1, null);
		var constraintWrapXTrimY = new Constraint_WrapXTrimY(this.size);

		// entities

		var entities = this.entitiesToSpawn;

		var entityDimension = 10;

		// camera

		this._camera = new Camera
		(
			Coords.fromXY(300, 300), // hack
			null, // focalLength
			new Disposition
			(
				Coords.create(),
				Orientation.Instances().ForwardZDownY.clone(),
				null
			)
		);
		var cameraAsEntity = CameraHelper.toEntity(this._camera);
		entities.push(cameraAsEntity);

		// background

		var visualBackgroundImage: VisualImage =
			new VisualImageFromLibrary("PlanetSurface");
		var planetSizeSurface = this.planet.sizeSurface;
		visualBackgroundImage =
			new VisualImageScaled(visualBackgroundImage, planetSizeSurface);
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

		if (planet.hasLife)
		{
			var lifeforms = planet.lifeforms;
			var lifeformEntities = lifeforms.map
			(
				(x: Lifeform) => x.toEntity(world, this)
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
			x => x.toEntity(world, this)
		);
		entities.push(...energySourceEntities);

		// player

		var playerActivityDefnName = Player.activityDefn().name;
		var playerActivity = new Activity(playerActivityDefnName, null);

		var playerPos = this.size.clone().half(); // todo
		var playerLoc = Disposition.fromPos(playerPos);
		var playerCollider = new Sphere(Coords.create(), entityDimension / 2);
		var playerColor = Color.byName("Gray");

		var playerVisual: Visual = ShipDefn.visual
		(
			entityDimension, playerColor, Color.byName("Black")
		);
		playerVisual = new VisualWrapped(this.size, playerVisual);

		var playerCollide = (universe: Universe, worldAsWorld: World, place: Place, entityPlayer: Entity, entityOther: Entity) =>
		{
			var world = worldAsWorld as WorldExtended;

			var entityOtherItem = entityOther.item();
			var entityOtherEnergySource =
				EntityExtensions.energySource(entityOther);

			if (entityOtherItem != null)
			{
				entityPlayer.itemHolder().itemEntityAdd(entityOther);
				place.entitiesToRemove.push(entityOther);
			}
			else if (entityOther.name.startsWith("Lifeform") == true)
			{
				var lifeformDefn =
					EntityExtensions.lifeform(entityOther).defn(world);
				var damage = lifeformDefn.damagePerAttack;
				if (damage > 0)
				{
					var chanceOfDamagePerTick = .05;
					if (Math.random() < chanceOfDamagePerTick)
					{
						entityPlayer.killable().integrity -= damage;
					}
				}
			}
			else if (entityOtherEnergySource != null)
			{
				var energySource = entityOtherEnergySource;
				energySource.collideWithLander(universe, world, place, entityOther, entityPlayer)
			}
		}

		var playerShipLander = new Ship("Lander");

		var playerEntity = new Entity
		(
			"Player",
			[
				new Actor(playerActivity),
				new Collidable
				(
					null, // ticks
					playerCollider,
					[ Collidable.name ], // entityPropertyNamesToCollideWith
					playerCollide
				),
				new Constrainable
				([
					constraintFriction, constraintSpeedMax, constraintWrapXTrimY
				]),
				Drawable.fromVisual(playerVisual),
				ItemHolder.create(),
				new Killable(1, this.playerDie.bind(this), null),
				new Locatable(playerLoc),
				new Playable(),
				playerShipLander
			]
		);

		entities.push(playerEntity);

		var containerSidebar = this.toControlSidebar();
		this.venueControls = VenueControls.fromControl(containerSidebar);

		//this.propertyNamesToProcess.push("ship");

		// Helper variables.

		this._drawPos = Coords.create();
	}

	// methods

	actionToInputsMappings(): ActionToInputsMapping[]
	{
		return this._actionToInputsMappings;
	}

	exit(universe: Universe, world: WorldExtended, place: PlacePlanetSurface, actor: Entity): void
	{
		var entityLander = place.entitiesByName.get(Player.name);
		var itemHolderLander = entityLander.itemHolder();
		var itemHolderPlayer = world.player.flagship.itemHolder;
		itemHolderLander.itemEntitiesAllTransferTo(itemHolderPlayer);

		var placePlanetOrbit = place.placePlanetOrbit;
		world.placeNext = placePlanetOrbit;
	}

	playerDie(universe: Universe, world: WorldExtended, place: Place, entityPlayer: Entity): void
	{
		this.exit(universe, world, place as PlacePlanetSurface, entityPlayer);
	}

	// Place overrides

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		var player = this.entitiesByName.get(Player.name);
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
		var containerSidebar =
			this.venueControls.controlRoot as ControlContainer;
		var controlMap = containerSidebar.childByName("containerMap");
		var mapPos = containerSidebar.pos.clone().add(controlMap.pos);
		var mapSize = controlMap.size;
		var surfaceSize = this.planet.sizeSurface;
		var display = universe.display;

		var scanContacts = this.entities;
		var contactPosSaved = Coords.create();
		for (var i = 0; i < scanContacts.length; i++)
		{
			var contact = scanContacts[i];

			var contactDrawable = contact.drawable();

			if (contactDrawable != null)
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
				var contactVisual = contactDrawable.visual;
				contactVisual.draw(universe, world, this, contact, display);
				contactPos.overwriteWith(contactPosSaved);
			}
		}
	}

	// controls

	toControlSidebar(): ControlBase
	{
		var containerSidebarSize = Coords.fromXY(100, 300); // hack
		var marginWidth = 10;
		var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 10;
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = Coords.fromXY(childControlWidth, fontHeight);
		var minimapSize = Coords.fromXY(1, .5).multiplyScalar(childControlWidth);
		var containerLanderSize = Coords.fromXY(1, 2).multiplyScalar(childControlWidth);

		var lander = new Lander(); // todo

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
					false, // isTextCentered,
					"Map:",
					fontHeight
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
							DataBinding.fromContext<Visual>
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
					false, // isTextCentered,
					"Lander:",
					fontHeight
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
							false, // isTextCentered
							"Crew:",
							fontHeight
						),

						new ControlLabel
						(
							"infoCrew",
							Coords.fromXY(marginSize.x * 5, marginSize.y),
							labelSize,
							false, // isTextCentered
							DataBinding.fromContextAndGet
							(
								lander, (c: Lander) => c.crewCurrentOverMax()
							),
							fontHeight
						),

						new ControlLabel
						(
							"labelCargo",
							Coords.fromXY(marginSize.x, marginSize.y * 2),
							labelSize,
							false, // isTextCentered
							"Cargo:",
							fontHeight
						),

						new ControlLabel
						(
							"infoCargo",
							Coords.fromXY(marginSize.x * 5, marginSize.y * 2),
							labelSize,
							false, // isTextCentered
							DataBinding.fromContextAndGet
							(
								lander, (c: Lander) => c.cargoCurrentOverMax()
							),
							fontHeight
						),

						new ControlLabel
						(
							"labelData",
							Coords.fromXY(marginSize.x, marginSize.y * 3),
							labelSize,
							false, // isTextCentered
							"Data:",
							fontHeight
						),

						new ControlLabel
						(
							"infoData",
							Coords.fromXY(marginSize.x * 5, marginSize.y * 3),
							labelSize,
							false, // isTextCentered
							DataBinding.fromContextAndGet
							(
								lander, (c: Lander) => c.dataCurrentOverMax()
							),
							fontHeight
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
					fontHeight,
					true, // hasBorder
					true, // isEnabled
					(universe: Universe) => {}
				),

			]
		);

		return containerSidebar;
	}
}
