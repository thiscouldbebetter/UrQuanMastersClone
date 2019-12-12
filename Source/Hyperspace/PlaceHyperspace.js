
function PlaceHyperspace(universe, hyperspace, starsystemDeparted, playerLoc)
{
	this.hyperspace = hyperspace;
	this.size = this.hyperspace.size;

	var actionMapView = new Action
	(
		"MapView",
		function perform(universe, world, place, actor)
		{
			world.placeNext = new PlaceHyperspaceMap(place);
		}
	);

	this.actions =
	[
		Ship.actionShowMenu(),
		Ship.actionAccelerate(),
		Ship.actionTurnLeft(),
		Ship.actionTurnRight(),
		actionMapView
	].addLookupsByName();

	this._actionToInputsMappings = Ship.actionToInputsMappings();
	this._actionToInputsMappings = this._actionToInputsMappings.concat
	(
		[
			new ActionToInputsMapping("MapView", [ "Tab", "Gamepad0Button0" ]),
		]
	);
	this._actionToInputsMappings.addLookupsMultiple(function (x) { return x.inputNames; });

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

	var entityDimension = hyperspace.starsystemRadiusOuter;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

	// stars

	var starsystems = this.hyperspace.starsystems;
	var numberOfStars = starsystems.length;
	var starRadius = entityDimension / 2;
	var transformRotate = new Transform_Rotate2D(.75);

	var starVisualPathsForSizes = [];
	for (var j = 0; j < 3; j++)
	{
		var transformScale = new Transform_Scale
		(
			new Coords(1, 1, 1).multiplyScalar(starRadius * (j / 2 + 1))
		);

		var starVisualPath = new PathBuilder().star(5, .5).transform
		(
			transformScale
		).transform
		(
			transformRotate
		);
		starVisualPathsForSizes.push(starVisualPath);
	}

	var starColors = Starsystem.StarColors;

	var starVisualsForColorsAndSizes = [];
	for (var i = 0; i < starColors.length; i++)
	{
		var starColor = starColors[i];
		var starVisualsForColor = [];
		for (var j = 0; j < 3; j++)
		{
			var starVisualPathForSize = starVisualPathsForSizes[j];
			var starVisual = new VisualCamera
			(
				new VisualPolygon(starVisualPathForSize, starColor),
				() => this.camera
			);
			starVisualsForColor.push(starVisual);
		}
		starVisualsForColorsAndSizes[starColor] = starVisualsForColor;
	}

	for (var i = 0; i < numberOfStars; i++)
	{
		var starsystem = starsystems[i];
		var starPos = starsystem.posInHyperspace;

		var starCollider = new Sphere(starPos, starRadius);

		var starColor = starsystem.starColor;
		var starSizeIndex = starsystem.starSizeIndex;
		var starVisual = starVisualsForColorsAndSizes[starColor][starSizeIndex];

		var starEntity = new Entity
		(
			starsystem.name,
			[
				starsystem,
				new Locatable( new Location(starPos) ),
				new Collidable(starCollider),
				new Drawable(starVisual)
			]
		);

		entities.push(starEntity);
	}

	entities.addLookupsByName();

	// factions

	var world = universe.world;
	var factions = world.defns.factions;
	for (var i = 0; i < factions.length; i++)
	{
		var faction = factions[i];
		var factionCollider = faction.sphereOfInfluence;
		if (factionCollider != null)
		{
			var factionEntity = new Entity
			(
				"Faction" + faction.name,
				[
					new Collidable(factionCollider),
					faction,
					new Locatable
					(
						new Location( new Coords(0, 0) )
					)
				]
			);
			entities.push(factionEntity);
		}
	}

	// shipGroups

	var shipGroups = this.hyperspace.shipGroups;
	for (var i = 0; i < shipGroups.length; i++)
	{
		var shipGroup = shipGroups[i];
		var entityShipGroup = this.shipGroupToEntity(world, this, shipGroup);
		entities.push(entityShipGroup);
	}

	// player

	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualBody = ShipDefn.visual(entityDimension, playerColor);

	var playerVisual = new VisualCamera
	(
		new VisualGroup
		([
			playerVisualBody,
		]),
		() => this.camera
	);

	var playerShipGroup = world.player.shipGroup;
	var playerShip = playerShipGroup.ships[0];
	var playerShipDefn = playerShip.defn(world);

	//var constraintSpeedMax = new Constraint("SpeedMax", playerShipDefn.speedMax * 5);
	var constraintFriction = new Constraint("FrictionDry", 0.01);
	//var constraintStopBelowSpeedMin = new Constraint("StopBelowSpeedMin", 0.015);
	var constraintTrimToRange = new Constraint("TrimToRange", this.size);

	var playerEntity = new Entity
	(
		"Player",
		[
			new Locatable(playerLoc),
			new Constrainable
			([
				//constraintSpeedMax,
				constraintFriction,
				//constraintStopBelowSpeedMin,
				constraintTrimToRange
			]),
			new Collidable
			(
				playerCollider,
				[ Collidable.name ], // entityPropertyNamesToCollideWith
				this.playerCollide
			),
			new Drawable(playerVisual),
			new ItemHolder(),
			new Playable(world.player),
			playerShipGroup,
			playerShip,
			new Fuelable()
		]
	);

	if (starsystemDeparted != null)
	{
		var starsystemName = starsystemDeparted.name;
		var entityForStarsystemDeparted = entities[starsystemName];
		playerEntity.Collidable.entityAlreadyCollidedWith = entityForStarsystemDeparted;
	}

	entities.push(playerEntity);

	var containerSidebar = this.toControlSidebar(universe);
	this.venueControls = new VenueControls(containerSidebar);

	Place.call(this, PlaceHyperspace.name, entities);
	this.propertyNamesToProcess.push(Fuelable.name);

	// Helper variables.

	this._drawLoc = new Location(new Coords());
	this._polar = new Polar();
}
{
	// superclass

	PlaceHyperspace.prototype = Object.create(Place.prototype);
	PlaceHyperspace.prototype.constructor = Place;

	// methods

	PlaceHyperspace.prototype.actionToInputsMappings = function()
	{
		return this._actionToInputsMappings;
	};

	PlaceHyperspace.prototype.entitiesShips = function()
	{
		return this.entitiesByPropertyName("ship");
	}

	PlaceHyperspace.prototype.entitiesShipGroups = function()
	{
		return this.entitiesByPropertyName("shipGroup");
	}

	PlaceHyperspace.prototype.factionShipGroupSpawnIfNeeded = function
	(
		universe, world, place, entityPlayer, entityOther
	)
	{
		var faction = entityOther.Faction;
		var factionName = faction.name;

		var numberOfShipGroupsExistingForFaction = 0;
		var entitiesShipGroupsAll = place.entitiesShipGroups();
		for (var i = 0; i < entitiesShipGroupsAll.length; i++)
		{
			var entityShipGroup = entitiesShipGroupsAll[i];
			if (entityShipGroup.ShipGroup.factionName == factionName)
			{
				numberOfShipGroupsExistingForFaction++;
			}
		}

		var shipGroupsPerFaction = 1; // todo
		if (numberOfShipGroupsExistingForFaction < shipGroupsPerFaction)
		{
			var factionSphereOfInfluence = faction.sphereOfInfluence;
			var shipGroupPos = factionSphereOfInfluence.pointRandom().clearZ();

			var shipDefnName = faction.shipDefnName; // todo
			var factionName = faction.name;

			var shipGroup = new ShipGroup
			(
				factionName + " Ship Group",
				factionName,
				shipGroupPos,
				[ new Ship(shipDefnName) ]
			);

			var entityShipGroup = place.shipGroupToEntity(world, place, shipGroup);
			place.hyperspace.shipGroups.push(shipGroup);
			place.entitiesToSpawn.push(entityShipGroup);
		}
	}

	PlaceHyperspace.prototype.playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		if (entityOther.Starsystem != null)
		{
			var starsystem = entityOther.Starsystem;
			var playerLoc = entityPlayer.Locatable.loc;
			var playerOrientation = playerLoc.orientation;
			var playerPosNextAsPolar = new Polar().fromCoords
			(
				playerOrientation.forward
			).addToAzimuthInTurns(.5).wrap();
			playerPosNextAsPolar.radius = starsystem.sizeInner.x * .45;
			var playerPosNext = playerPosNextAsPolar.toCoords(new Coords()).add
			(
				starsystem.sizeInner.clone().half()
			);

			world.placeNext = new PlaceStarsystem
			(
				world,
				starsystem,
				new Location
				(
					playerPosNext,
					playerOrientation.clone()
				)
			);
		}
		else if (entityOther.Ship != null)
		{
			var shipGroupOther = entityOther.ShipGroup;
			var playerPos = entityPlayer.Locatable.loc.pos;
			var starsystemClosest = place.hyperspace.starsystemClosestTo(playerPos);
			var planetClosest = starsystemClosest.planets.random();
			var encounter = new Encounter
			(
				planetClosest,
				shipGroupOther.factionName,
				shipGroupOther,
				place,
				playerPos
			);
			var placeEncounter = new PlaceEncounter(world, encounter);
			world.placeNext = placeEncounter;

			place.entitiesToRemove.push(entityOther);
			place.hyperspace.shipGroups.remove(shipGroupOther);
		}
		else if (entityOther.faction != null)
		{
			place.factionShipGroupSpawnIfNeeded(universe, world, place, entityPlayer, entityOther);
		}
	}

	PlaceHyperspace.prototype.shipGroupToEntity = function(world, place, shipGroup)
	{
		var ship0 = shipGroup.ships[0];
		var shipGroupPos = shipGroup.pos;

		var entityShipGroup = new Entity
		(
			shipGroup.name + Math.random(),
			[
				new Actor(Ship.activityApproachPlayer), // hack
				//faction,
				shipGroup,
				ship0,
				new Locatable(new Location(shipGroupPos)),
				new Collidable(new Sphere(shipGroupPos, 5)),
				new Drawable
				(
					new VisualCamera
					(
						ship0.defn(world).visual,
						() => place.camera
					)
				),
			]
		);

		return entityShipGroup;
	}

	// controls

	PlaceHyperspace.prototype.toControlSidebar = function(universe)
	{
		var world = universe.world;
		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			new Coords(300, 0),
			new Coords(100, 300),
			[ world.player.toControlSidebar(world) ]
		);

		var marginWidth = 8;
		var size = new Coords(1, 1).multiplyScalar
		(
			containerSidebar.size.x - marginWidth * 2
		);

		var display = universe.display;
		this.displaySensors = new Display
		(
			[ size ],
			display.fontName,
			display.fontHeightInPixels,
			"LightGreen",
			"DarkGreen"
		);

		var imageSensors = this.displaySensors.initialize().toImage();

		var controlVisualSensors = new ControlVisual
		(
			"controlVisualSensors",
			new Coords(8, 152), // pos
			size,
			new VisualImageImmediate(imageSensors, size)
		);

		containerSidebar.children.add(controlVisualSensors);

		return containerSidebar;
	}

	// Place overrides

	PlaceHyperspace.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceHyperspace.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "Black");

		var drawLoc = this._drawLoc;
		var drawPos = drawLoc.pos;

		var player = this.entities["Player"];
		var playerLoc = player.Locatable.loc;

		var camera = this.camera;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			camera.viewSizeHalf,
			this.size.clone().subtract(camera.viewSizeHalf)
		);

		this.draw_FromSuperclass(universe, world);

		this.draw_Sensors();

		this.venueControls.draw(universe, world);
	}

	PlaceHyperspace.prototype.draw_Sensors = function()
	{
		this.displaySensors.clear();

		var hyperspaceSize = this.hyperspace.size;
		var sensorRange = this.camera.viewSize.clone().double();
		var controlSize = this.displaySensors.sizeInPixels;
		var controlSizeHalf = controlSize.clone().half();
		var cameraPos = this.camera.loc.pos;
		var drawPos = new Coords();

		var stars = this.hyperspace.starsystems;
		var starRadius = 2.5;
		var starColor = this.displaySensors.colorFore;

		for (var i = 0; i < stars.length; i++)
		{
			var star = stars[i];
			drawPos.overwriteWith
			(
				star.posInHyperspace
			).subtract
			(
				cameraPos
			).divide
			(
				sensorRange
			).multiply
			(
				controlSize
			).add
			(
				controlSizeHalf
			);
			this.displaySensors.drawCircle(drawPos, starRadius, starColor);
		}

		var ships = this.hyperspace.shipGroups;
		var shipSize = new Coords(1, 1).multiplyScalar(2 * starRadius);
		var shipColor = starColor;
		for (var i = 0; i < ships.length; i++)
		{
			var ship = ships[i];
			drawPos.overwriteWith
			(
				ship.pos
			).subtract
			(
				cameraPos
			).divide
			(
				sensorRange
			).multiply
			(
				controlSize
			).add
			(
				controlSizeHalf
			);
			this.displaySensors.drawRectangle(drawPos, shipSize, shipColor);
		}

		var drawPos = controlSizeHalf;
		this.displaySensors.drawCrosshairs(drawPos, starRadius * 4, shipColor)
	}
}
