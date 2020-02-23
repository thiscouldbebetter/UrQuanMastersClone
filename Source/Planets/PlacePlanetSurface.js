
function PlacePlanetSurface(world, planet, placePlanetOrbit)
{
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
	].addLookupsByName();

	this._actionToInputsMappings = Ship.actionToInputsMappings();
	this._actionToInputsMappings = this._actionToInputsMappings.concat
	(
		[
			new ActionToInputsMapping("Fire", ["Enter", "Gamepad0Button0"], true),
			new ActionToInputsMapping("Exit", ["_", "Gamepad0Button1"]),
		]
	);
	this._actionToInputsMappings.addLookupsMultiple( function(x) { return x.inputNames; } );

	// constraints

	var constraintSpeedMax = new Constraint_SpeedMax(10);
	var constraintFriction = new Constraint_Friction(0.1);
	var constraintWrapXTrimY = new Constraint_WrapXTrimY(this.size);

	this.camera = new Camera
	(
		new Coords(300, 300), // hack
		null, // focalLength
		new Location
		(
			new Coords(0, 0, 0),
			Orientation.Instances().ForwardZDownY.clone()
		)
	);

	// entities

	var entities = [];

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	// background

	var visualBackground = new VisualImageFromLibrary("PlanetSurface");
	var planetSizeSurface = this.planet.sizeSurface;
	visualBackground = new VisualImageScaled(visualBackground, planetSizeSurface);
	visualBackground = new VisualCamera(visualBackground, () => this.camera);
	visualBackground = new VisualWrapped(planetSizeSurface, visualBackground);

	var entityBackground = new Entity
	(
		"Background",
		[
			new Locatable(new Location( this.planet.sizeSurface.clone().half() )),
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
		entities.addMany(lifeformEntity);
	}

	// resources

	var resourceDefns = ResourceDefn.Instances();
	var resourceRadiusBase = entityDimension / 2;
	var resources = this.planet.resources || [];
	var resourceEntities = resources.map
	(
		x => x.toEntity(world, this, resourceRadiusBase)
	);
	entities.addMany(resourceEntities);

	// energySources

	var energySources = this.planet.energySources || [];
	var energySourceEntities = energySources.map
	(
		x => x.toEntity(world, this)
	);
	entities.addMany(energySourceEntities);

	// player

	var playerPos = this.size.clone().half(); // todo
	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(new Coords(0, 0, 0), entityDimension / 2);
	var playerColor = "Gray";

	var playerVisual = new VisualCamera
	(
		ShipDefn.visual(entityDimension, playerColor, "Black"),
		() => this.camera
	);
	playerVisual = new VisualWrapped(this.size, playerVisual);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		if (entityOther.item != null)
		{
			var item = entityOther.item;
			entityPlayer.itemHolder.itemAdd(item);
			place.entitiesToRemove.push(entityOther);
		}
		else if (entityOther.name.startsWith("Lifeform") == true)
		{
			var lifeformDefn = entityOther.lifeform.defn(world);
			var damage = lifeformDefn.damagePerAttack;
			if (damage > 0)
			{
				var chanceOfDamagePerTick = .05;
				if (Math.random() < chanceOfDamagePerTick)
				{
					entityPlayer.killable.integrity -= damage;
				}
			}
		}
		else if (entityOther.energySource != null)
		{
			var energySource = entityOther.energySource;
			energySource.collideWithLander(universe, world, place, entityOther, entityPlayer)
		}
	}

	var playerShipLander = new Ship("Lander");

	var playerEntity = new Entity
	(
		"Player",
		[
			playerShipLander,
			new Locatable(playerLoc),
			new Constrainable
			([
				constraintFriction, constraintSpeedMax, constraintWrapXTrimY
			]),
			new Collidable
			(
				playerCollider,
				[ Collidable.name ], // entityPropertyNamesToCollideWith
				playerCollide
			),
			new Drawable(playerVisual),
			new ItemHolder(),
			new Playable(),
			new Killable(1, this.playerDie.bind(this))
		]
	);

	entities.push(playerEntity);

	var containerSidebar = this.toControlSidebar();
	this.venueControls = new VenueControls(containerSidebar);

	var size = new Coords(300, 300); // todo
	Place.call(this, PlacePlanetSurface.name, PlacePlanetSurface.name, size, entities);
	this.propertyNamesToProcess.push("ship");

	// Helper variables.

	this._drawPos = new Coords();
}
{
	// superclass

	PlacePlanetSurface.prototype = Object.create(Place.prototype);
	PlacePlanetSurface.prototype.constructor = Place;

	// methods

	PlacePlanetSurface.prototype.actionToInputsMappings = function()
	{
		return this._actionToInputsMappings;
	};

	PlacePlanetSurface.prototype.exit = function(universe, world, place, actor)
	{
		var entityLander = place.entities["Player"];
		var itemHolderLander = entityLander.itemHolder;
		var itemHolderPlayer = world.player.flagship.itemHolder;
		itemHolderLander.itemsTransferTo(itemHolderPlayer);

		var placePlanetOrbit = place.placePlanetOrbit;
		world.placeNext = placePlanetOrbit;
	}

	PlacePlanetSurface.prototype.playerDie = function(universe, world, place, entityPlayer)
	{
		this.exit(universe, world, place, entityPlayer);
	}

	// Place overrides

	PlacePlanetSurface.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlacePlanetSurface.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		var drawPos = this._drawPos;

		var player = this.entities["Player"];
		var playerLoc = player.locatable.loc;

		var camera = this.camera;
		var planetSize = this.planet.sizeSurface;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			new Coords(0, camera.viewSizeHalf.y),
			new Coords(planetSize.x, planetSize.y - camera.viewSizeHalf.y)
		);

		this.draw_FromSuperclass(universe, world);

		this.venueControls.draw(universe, world);

		this.drawMap(universe, world);
	}

	PlacePlanetSurface.prototype.drawMap = function(universe, world)
	{
		var containerSidebar = this.venueControls.controlRoot;
		var controlMap = containerSidebar.children["containerMap"];
		var mapPos = containerSidebar.pos.clone().add(controlMap.pos);
		var mapSize = controlMap.size;
		var surfaceSize = this.planet.sizeSurface;
		var display = universe.display;

		var scanContacts = this.entities;
		var contactPosSaved = new Coords();
		for (var i = 0; i < scanContacts.length; i++)
		{
			var contact = scanContacts[i];

			var contactPos = contact.locatable.loc.pos;
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
			contact.drawable.draw(universe, world, display, contact);
			contactPos.overwriteWith(contactPosSaved);
		}
	}

	// controls

	PlacePlanetSurface.prototype.toControlSidebar = function(universe)
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
							new VisualRectangle(minimapSize, "Gray")
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
