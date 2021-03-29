
class PlacePlanetSurface extends Place
{
	constructor(world, planet, placePlanetOrbit)
	{
		super(PlacePlanetSurface.name, PlacePlanetSurface.name, new Coords(300, 300), []);

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
				new ActionToInputsMapping("Exit", ["_", "Gamepad0Button1"]),
			]
		);
		this.actionToInputsMappingsByInputName = ArrayHelper.addLookupsMultiple
		(
			this._actionToInputsMappings, x => x.inputNames
		);

		// constraints

		var constraintSpeedMax = new Constraint_SpeedMaxXY(10);
		var constraintFriction = new Constraint_FrictionXY(0.1);
		var constraintWrapXTrimY = new Constraint_WrapXTrimY(this.size);

		// entities

		var entities = this.entitiesToSpawn;

		var entityDimension = 10;
		var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

		// camera

		this._camera = new Camera
		(
			new Coords(300, 300), // hack
			null, // focalLength
			new Disposition
			(
				new Coords(0, 0, 0),
				Orientation.Instances().ForwardZDownY.clone()
			)
		);
		var cameraAsEntity = CameraHelper.toEntity(this._camera);
		entities.push(cameraAsEntity);

		// background

		var visualBackground = new VisualImageFromLibrary("PlanetSurface");
		var planetSizeSurface = this.planet.sizeSurface;
		visualBackground = new VisualImageScaled(visualBackground, planetSizeSurface);
		visualBackground = new VisualWrapped(planetSizeSurface, visualBackground);

		var entityBackground = new Entity
		(
			"Background",
			[
				new Locatable(new Disposition( this.planet.sizeSurface.clone().half() )),
				new Drawable(visualBackground)
			]
		);

		entities.push(entityBackground);

		// lifeforms

		if (planet.hasLife)
		{
			var lifeforms = planet.lifeforms;
			var lifeformEntities = lifeforms.map
			(
				x => x.toEntity(world, this)
			);
			entities.push(...lifeformEntity);
		}

		// resources

		var resourceDefns = ResourceDefn.Instances();
		var resourceRadiusBase = entityDimension / 2;
		var resources = this.planet.resources || [];
		var resourceEntities = resources.map
		(
			x => x.toEntity(world, this, resourceRadiusBase)
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
		var playerActivity = new Activity(playerActivityDefnName);

		var playerPos = this.size.clone().half(); // todo
		var playerLoc = new Disposition(playerPos);
		var playerCollider = new Sphere(new Coords(0, 0, 0), entityDimension / 2);
		var playerColor = Color.byName("Gray");

		var playerVisual = ShipDefn.visual
		(
			entityDimension, playerColor, Color.byName("Black")
		);
		playerVisual = new VisualWrapped(this.size, playerVisual);

		var playerCollide = (universe, world, place, entityPlayer, entityOther) =>
		{
			var entityOtherItem = entityOther.item();
			var entityOtherEnergySource = entityOther.energySource();

			if (entityOtherItem != null)
			{
				var item = entityOtherItem;
				entityPlayer.itemHolder.itemAdd(item);
				place.entitiesToRemove.push(entityOther);
			}
			else if (entityOther.name.startsWith("Lifeform") == true)
			{
				var lifeformDefn = EntityExtensions.lifeform(entityOther).defn(world);
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
				new Drawable(playerVisual),
				new ItemHolder(),
				new Killable(1, this.playerDie.bind(this)),
				new Locatable(playerLoc),
				new Playable(),
				playerShipLander
			]
		);

		entities.push(playerEntity);

		var containerSidebar = this.toControlSidebar();
		this.venueControls = new VenueControls(containerSidebar);

		//this.propertyNamesToProcess.push("ship");

		// Helper variables.

		this._drawPos = new Coords();
	}

	// methods

	actionToInputsMappings()
	{
		return this._actionToInputsMappings;
	}

	exit(universe, world, place, actor)
	{
		var entityLander = place.entitiesByName.get(Player.name);
		var itemHolderLander = entityLander.itemHolder;
		var itemHolderPlayer = world.player.flagship.itemHolder;
		itemHolderLander.itemsTransferTo(itemHolderPlayer);

		var placePlanetOrbit = place.placePlanetOrbit;
		world.placeNext = placePlanetOrbit;
	}

	playerDie(universe, world, place, entityPlayer)
	{
		this.exit(universe, world, place, entityPlayer);
	}

	// Place overrides

	draw(universe, world)
	{
		var display = universe.display;

		var drawPos = this._drawPos;

		var player = this.entitiesByName.get(Player.name);
		var playerLoc = player.locatable().loc;

		var camera = this._camera;
		var planetSize = this.planet.sizeSurface;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			new Coords(0, camera.viewSizeHalf.y),
			new Coords(planetSize.x, planetSize.y - camera.viewSizeHalf.y)
		);

		super.draw(universe, world, display);

		this.venueControls.draw(universe, world);

		this.drawMap(universe, world);
	}

	drawMap(universe, world)
	{
		var containerSidebar = this.venueControls.controlRoot;
		var controlMap = containerSidebar.childrenByName.get("containerMap");
		var mapPos = containerSidebar.pos.clone().add(controlMap.pos);
		var mapSize = controlMap.size;
		var surfaceSize = this.planet.sizeSurface;
		var display = universe.display;

		var scanContacts = this.entities;
		var contactPosSaved = new Coords();
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

	toControlSidebar(universe)
	{
		var containerSidebarSize = new Coords(100, 300); // hack
		var marginWidth = 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 10;
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = new Coords(childControlWidth, fontHeight);
		var minimapSize = new Coords(1, .5).multiplyScalar(childControlWidth);
		var containerLanderSize = new Coords(1, 2).multiplyScalar(childControlWidth);

		var lander = new Lander(); // todo

		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			new Coords(300, 0), // hack - pos
			containerSidebarSize,
			// children
			[
				new ControlLabel
				(
					"labelMap",
					new Coords(marginSize.x, marginSize.y),
					labelSize,
					false, // isTextCentered,
					"Map:",
					fontHeight
				),

				new ControlContainer
				(
					"containerMap",
					new Coords(marginSize.x, marginSize.y * 2 + labelSize.y), // pos
					minimapSize,
					[
						new ControlVisual
						(
							"visualMap",
							new Coords(0, 0),
							minimapSize,
							DataBinding.fromContext
							(
								new VisualRectangle(minimapSize, Color.byName("Gray") )
							)
						)
					]
				),

				new ControlLabel
				(
					"labelLander",
					new Coords(marginSize.x, marginSize.y * 3 + labelSize.y + minimapSize.y),
					labelSize,
					false, // isTextCentered,
					"Lander:",
					fontHeight
				),

				new ControlContainer
				(
					"containerLander",
					new Coords
					(
						marginSize.x,
						marginSize.y * 4 + labelSize.y * 2 + minimapSize.y
					), // pos
					containerLanderSize,
					[
						new ControlLabel
						(
							"labelCrew",
							new Coords(marginSize.x, marginSize.y),
							labelSize,
							false, // isTextCentered
							"Crew:",
							fontHeight
						),

						new ControlLabel
						(
							"infoCrew",
							new Coords(marginSize.x * 5, marginSize.y),
							labelSize,
							false, // isTextCentered
							new DataBinding(lander, function get(c) { return c.crewCurrentOverMax(); } ),
							fontHeight
						),

						new ControlLabel
						(
							"labelCargo",
							new Coords(marginSize.x, marginSize.y * 2),
							labelSize,
							false, // isTextCentered
							"Cargo:",
							fontHeight
						),

						new ControlLabel
						(
							"infoCargo",
							new Coords(marginSize.x * 5, marginSize.y * 2),
							labelSize,
							false, // isTextCentered
							new DataBinding(lander, function get(c) { return c.cargoCurrentOverMax(); } ),
							fontHeight
						),

						new ControlLabel
						(
							"labelData",
							new Coords(marginSize.x, marginSize.y * 3),
							labelSize,
							false, // isTextCentered
							"Data:",
							fontHeight
						),

						new ControlLabel
						(
							"infoData",
							new Coords(marginSize.x * 5, marginSize.y * 3),
							labelSize,
							false, // isTextCentered
							new DataBinding(lander, function get(c) { return c.dataCurrentOverMax(); } ),
							fontHeight
						),

					]// children
				),

				new ControlButton
				(
					"buttonLeave",
					new Coords
					(
						marginSize.x,
						marginSize.y * 5 + labelSize.y * 2 + minimapSize.y + containerLanderSize.y
					), // pos
					new Coords(containerLanderSize.x, labelSize.y * 2),
					"Launch",
					fontHeight,
					true, // hasBorder
					true, // isEnabled
					function click(universe)
					{},
					null // contextForClick
				),

			]
		);

		return containerSidebar;
	}
}
