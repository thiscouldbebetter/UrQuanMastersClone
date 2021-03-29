
class PlaceHyperspace extends Place
{
	constructor(universe, hyperspace, starsystemDeparted, playerLoc)
	{
		super(PlaceHyperspace.name, PlaceHyperspace.name, hyperspace.size, []);

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
		];

		this._actionToInputsMappings = Ship.actionToInputsMappings();
		this._actionToInputsMappings = this._actionToInputsMappings.concat
		(
			[
				new ActionToInputsMapping("MapView", [ "Tab", "Gamepad0Button0" ]),
			]
		);
		this._actionToInputsMappingsByInputName = ArrayHelper.addLookupsMultiple
		(
			this._actionToInputsMappings, x => x.inputNames
		);

		// entities

		var entities = this.entitiesToSpawn;

		var entityDimension = hyperspace.starsystemRadiusOuter;
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

		// stars

		var starsystems = this.hyperspace.starsystems;
		var numberOfStars = starsystems.length;
		var starRadius = entityDimension / 2;
		var starSize = new Coords(1, 1, 1).multiplyScalar(starRadius);
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

		var starVisualsForSizesByColorName = new Map();
		for (var i = 0; i < starColors.length; i++)
		{
			var starColor = starColors[i];
			var starVisualsForSizes = [];
			for (var j = 0; j < 3; j++)
			{
				var starVisualPathForSize = starVisualPathsForSizes[j];
				var starVisual = new VisualPolygon(starVisualPathForSize, starColor);
				starVisualsForSizes.push(starVisual);
			}
			starVisualsForSizesByColorName.set(starColor.name, starVisualsForSizes);
		}

		for (var i = 0; i < numberOfStars; i++)
		{
			var starsystem = starsystems[i];
			var starPos = starsystem.posInHyperspace;

			var starCollider = new Sphere(Coords.create(), starRadius);

			var starColor = starsystem.starColor;
			var starSizeIndex = starsystem.starSizeIndex;
			var starVisual = starVisualsForSizesByColorName.get(starColor.name)[starSizeIndex];

			var starEntity = new Entity
			(
				starsystem.name,
				[
					new Boundable( Box.fromSize(starSize) ),
					CollidableHelper.fromCollider(starCollider),
					new Drawable(starVisual),
					new Locatable( new Disposition(starPos) ),
					starsystem
				]
			);

			entities.push(starEntity);
		}

		// factions

		var world = universe.world;
		var worldDefn = world.defn;
		var factions = worldDefn.factions;
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
						CollidableHelper.fromCollider(factionCollider),
						faction,
						new Locatable
						(
							new Disposition( new Coords(0, 0) )
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

		var playerCollider = new Sphere(new Coords(0, 0, 0), entityDimension / 2);
		var playerColor = Color.byName("Gray");

		var playerVisualBody = ShipDefn.visual(entityDimension, playerColor);

		var playerVisual = new VisualGroup
		([
			playerVisualBody,
		]);

		var playerShipGroup = world.player.shipGroup;
		var playerShip = playerShipGroup.ships[0];
		var playerShipDefn = playerShip.defn(world);

		//var constraintSpeedMax = new Constraint("SpeedMax", playerShipDefn.speedMax * 5);
		var constraintFriction = new Constraint_FrictionDry(0.01);
		//var constraintStopBelowSpeedMin = new Constraint("StopBelowSpeedMin", 0.015);
		var constraintTrimToRange = new Constraint_TrimToRange(this.size);

		var playerEntity = new Entity
		(
			Player.name,
			[
				new Actor(new Activity(Player.activityDefn().name)),
				new Collidable
				(
					null, // ticks
					playerCollider,
					[ Collidable.name ], // entityPropertyNamesToCollideWith
					this.playerCollide
				),
				new Constrainable
				([
					//constraintSpeedMax,
					constraintFriction,
					//constraintStopBelowSpeedMin,
					constraintTrimToRange
				]),
				new Drawable(playerVisual),
				new Fuelable(),
				new ItemHolder(),
				new Locatable(playerLoc),
				Movable.create(),
				new Playable(world.player),
				playerShipGroup,
				playerShip
			]
		);

		if (starsystemDeparted != null)
		{
			var starsystemName = starsystemDeparted.name;
			var entityForStarsystemDeparted = this.entitiesByName.get(starsystemName);
			playerEntity.collidable().entitiesAlreadyCollidedWith.push
			(
				entityForStarsystemDeparted
			);
		}

		entities.push(playerEntity);

		// CollisionTracker.

		var collisionTracker = new CollisionTracker
		(
			this.hyperspace.size, Coords.fromXY(1, 1).multiplyScalar(64)
		);
		var entityForCollisionTracker = collisionTracker.toEntity();
		entities.push(entityForCollisionTracker);

		var containerSidebar = this.toControlSidebar(universe);
		this.venueControls = new VenueControls(containerSidebar);

		// Helper variables.

		this._drawLoc = new Disposition(new Coords());
		this._polar = new Polar();
	}

	// methods

	actionToInputsMappings()
	{
		return this._actionToInputsMappings;
	}

	entitiesShips()
	{
		return this.entitiesByPropertyName(Ship.name);
	}

	entitiesShipGroups()
	{
		return this.entitiesByPropertyName(ShipGroup.name);
	}

	factionShipGroupSpawnIfNeeded
	(
		universe, world, place, entityPlayer, entityOther
	)
	{
		var faction = EntityExtensions.faction(entityOther);
		var factionName = faction.name;

		var numberOfShipGroupsExistingForFaction = 0;
		var entitiesShipGroupsAll = place.entitiesShipGroups();
		for (var i = 0; i < entitiesShipGroupsAll.length; i++)
		{
			var entityShipGroup = entitiesShipGroupsAll[i];
			var shipGroup = EntityExtensions.shipGroup(entityShipGroup);
			if (shipGroup.factionName == factionName)
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

	playerCollide(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherStarsystem = EntityExtensions.starsystem(entityOther);
		var entityOtherShipGroup = EntityExtensions.shipGroup(entityOther);
		var entityOtherFaction = EntityExtensions.faction(entityOther);

		if (entityOtherStarsystem != null)
		{
return; // debug

			var starsystem = entityOtherStarsystem;
			var playerLoc = entityPlayer.locatable().loc;
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
				new Disposition
				(
					playerPosNext,
					playerOrientation.clone()
				)
			);
		}
		else if (entityOtherShipGroup != null)
		{
			var shipGroupOther = entityOtherShipGroup;
			var playerPos = entityPlayer.locatable().loc.pos;
			var starsystemClosest = place.hyperspace.starsystemClosestTo(playerPos);
			var planetClosest = ArrayHelper.random(starsystemClosest.planets, universe.randomizer);
			var encounter = new Encounter
			(
				planetClosest,
				shipGroupOther.factionName,
				entityOther,
				place,
				playerPos
			);
			var placeEncounter = new PlaceEncounter(world, encounter);
			world.placeNext = placeEncounter;

			place.entitiesToRemove.push(entityOther);
			place.hyperspace.shipGroups.remove(shipGroupOther);
		}
		else if (entityOtherFaction != null)
		{
			place.factionShipGroupSpawnIfNeeded(universe, world, place, entityPlayer, entityOther);
		}
	}

	shipGroupToEntity(world, place, shipGroup)
	{
		var ship0 = shipGroup.ships[0];
		var shipGroupPos = shipGroup.pos;

		var entityShipGroup = new Entity
		(
			shipGroup.name + Math.random(),
			[
				new Actor(new Activity(ShipGroup.activityDefnApproachPlayer().name) ),
				//faction,
				CollidableHelper.fromCollider(new Sphere(new Coords(0, 0, 0), 5)),
				new Drawable(ship0.defn(world).visual),
				new Locatable(new Disposition(shipGroupPos)),
				shipGroup,
				ship0
			]
		);

		return entityShipGroup;
	}

	// controls

	toControlSidebar(universe)
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
		this.displaySensors = new Display2D
		(
			[ size ],
			display.fontName,
			display.fontHeightInPixels,
			Color.byName("Yellow"),
			Color.byName("GreenDark")
		);

		var imageSensors = this.displaySensors.initialize().toImage();

		var controlVisualSensors = new ControlVisual
		(
			"controlVisualSensors",
			new Coords(8, 152), // pos
			size,
			DataBinding.fromContext
			(
				new VisualImageImmediate(imageSensors, size)
			)
		);

		containerSidebar.children.push(controlVisualSensors);

		return containerSidebar;
	}

	// Place overrides

	draw(universe, world)
	{
		var display = universe.display;

		display.drawBackground(Color.byName("Gray"), Color.byName("Black"));

		var drawLoc = this._drawLoc;
		var drawPos = drawLoc.pos;

		var player = this.entitiesByName.get(Player.name);
		var playerLoc = player.locatable().loc;

		var camera = this._camera;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			camera.viewSizeHalf,
			this.size.clone().subtract(camera.viewSizeHalf)
		);

		super.draw(universe, world, display);

		this.draw_Sensors();

		this.venueControls.draw(universe, world);
	}

	draw_Sensors()
	{
		this.displaySensors.clear();

		var hyperspaceSize = this.hyperspace.size;
		var sensorRange = this._camera.viewSize.clone().double();
		var controlSize = this.displaySensors.sizeInPixels;
		var controlSizeHalf = controlSize.clone().half();
		var cameraPos = this._camera.loc.pos;
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
