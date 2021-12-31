
class PlaceHyperspace extends Place
{
	hyperspace: Hyperspace;

	actions: Action[];
	displaySensors: Display;
	venueControls: VenueControls;

	_actionToInputsMappings: ActionToInputsMapping[];
	_actionToInputsMappingsByInputName: Map<string, ActionToInputsMapping>;
	_camera: Camera;
	_drawLoc: Disposition;
	_polar: Polar;

	constructor
	(
		universe: Universe,
		hyperspace: Hyperspace,
		starsystemDeparted: Starsystem,
		playerLoc: Disposition
	)
	{
		super
		(
			PlaceHyperspace.name,
			PlaceHyperspace.name,
			null, // parentName
			hyperspace.size,
			null
		);

		this.hyperspace = hyperspace;

		var actionMapView = new Action
		(
			"MapView",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var world = uwpe.world;
				var place = uwpe.place;

				world.placeNext = new PlaceHyperspaceMap(place as PlaceHyperspace);
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
				new ActionToInputsMapping("MapView", [ "Tab", "Gamepad0Button0" ], null),
			]
		);
		this._actionToInputsMappingsByInputName = ArrayHelper.addLookupsMultiple
		(
			this._actionToInputsMappings, x => x.inputNames
		);

		// entities

		var entities = this.entitiesToSpawn;

		var entityDimension = hyperspace.starsystemRadiusOuter;

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

		var starVisualsForSizesByColorName = new Map<string,VisualPolygon[]>();
		for (var i = 0; i < starColors.length; i++)
		{
			var starColor = starColors[i];
			var starVisualsForSizes = [];
			for (var j = 0; j < 3; j++)
			{
				var starVisualPathForSize = starVisualPathsForSizes[j];
				var starVisual = new VisualPolygon
				(
					starVisualPathForSize, starColor, null, false // shouldUseEntityOrientation
				);
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
			var starVisual =
				starVisualsForSizesByColorName.get(starColor.name)[starSizeIndex];

			var starEntity = new Entity
			(
				starsystem.name,
				[
					new Boundable(Box.fromSize(starSize) ),
					Collidable.fromCollider(starCollider),
					Drawable.fromVisual(starVisual),
					new Locatable(Disposition.fromPos(starPos) ),
					starsystem
				]
			);

			entities.push(starEntity);
		}

		// factions

		var world = universe.world as WorldExtended;
		var worldDefn = world.defnExtended();
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
						Collidable.fromCollider(factionCollider),
						faction,
						Locatable.create()
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

		if (playerLoc != null)
		{
			// player

			var playerCollider = new Sphere(Coords.create(), entityDimension / 2);
			var playerColor = Color.byName("Gray");

			var playerVisualBody = ShipDefn.visual(entityDimension, playerColor, null);

			var playerVisual = new VisualGroup
			([
				playerVisualBody,
			]);

			var playerShipGroup = world.player.shipGroup;
			var playerShip = playerShipGroup.ships[0];

			var constraintFriction = new Constraint_FrictionDry(0.01);
			var constraintTrimToRange = new Constraint_TrimToPlaceSize();

			var playerEntity = new Entity
			(
				Player.name,
				[
					new Actor(new Activity(Player.activityDefn().name, null) ),
					new Collidable
					(
						false, // canCollideAgainWithoutSeparating
						null, // ticks
						playerCollider,
						[ Collidable.name ], // entityPropertyNamesToCollideWith
						this.playerCollide
					),
					new Constrainable
					([
						constraintFriction,
						constraintTrimToRange
					]),
					Drawable.fromVisual(playerVisual),
					new Fuelable(),
					ItemHolder.create(),
					new Locatable(playerLoc),
					Movable.default(),
					new Playable(),
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
		}

		// CollisionTracker.

		var collisionTracker = new CollisionTracker
		(
			this.hyperspace.size, Coords.fromXY(1, 1).multiplyScalar(64)
		);
		var entityForCollisionTracker = collisionTracker.toEntity();
		entities.splice(0, 0, entityForCollisionTracker); // hack - Must come before stationary entities.

		var containerSidebar = this.toControlSidebar(universe);
		this.venueControls = VenueControls.fromControl(containerSidebar);

		// Helper variables.

		this._drawLoc = Disposition.create();
		this._polar = Polar.create();
	}

	// methods

	actionToInputsMappings(): ActionToInputsMapping[]
	{
		return this._actionToInputsMappings;
	}

	entitiesShips(): Entity[]
	{
		return this.entitiesByPropertyName(Ship.name);
	}

	entitiesShipGroups(): Entity[]
	{
		return this.entitiesByPropertyName(ShipGroup.name);
	}

	factionShipGroupSpawnIfNeeded
	(
		universe: Universe, world: World, placeAsPlace: Place, entityPlayer: Entity, entityOther: Entity
	): void
	{
		var place = placeAsPlace as PlaceHyperspace;

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
			var shipGroupPos =
				factionSphereOfInfluence.pointRandom(universe.randomizer).clearZ();

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

	playerCollide
	(
		uwpe: UniverseWorldPlaceEntities, collision: Collision
	): void
	{
		var universe = uwpe.universe;
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlaceHyperspace;
		var entityPlayer = uwpe.entity;
		var entityOther = uwpe.entity2;

		var entityOtherStarsystem = EntityExtensions.starsystem(entityOther);
		var entityOtherShipGroup = EntityExtensions.shipGroup(entityOther);
		var entityOtherFaction = EntityExtensions.faction(entityOther);

		if (entityOtherStarsystem != null)
		{
			var starsystem = entityOtherStarsystem;
			var playerLoc = entityPlayer.locatable().loc;
			var playerOrientation = playerLoc.orientation;
			var playerPosNextAsPolar = Polar.create().fromCoords
			(
				playerOrientation.forward
			).addToAzimuthInTurns(.5).wrap();
			playerPosNextAsPolar.radius = starsystem.sizeInner.x * .45;
			var playerPosNext = playerPosNextAsPolar.toCoords(Coords.create()).add
			(
				starsystem.sizeInner.clone().half()
			);

			world.placeNext = starsystem.toPlace
			(
				world,
				Disposition.fromPosAndOrientation
				(
					playerPosNext,
					playerOrientation.clone()
				),
				null // planet
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
				entityPlayer,
				entityOther,
				place,
				playerPos
			);
			var placeEncounter = new PlaceEncounter(world, encounter);
			world.placeNext = placeEncounter;

			place.entitiesToRemove.push(entityOther);
			ArrayHelper.remove(place.hyperspace.shipGroups, shipGroupOther);
		}
		else if (entityOtherFaction != null)
		{
			place.factionShipGroupSpawnIfNeeded
			(
				universe, world, place, entityPlayer, entityOther
			);
		}
	}

	shipGroupToEntity
	(
		worldAsWorld: World, place: Place, shipGroup: ShipGroup
	): Entity
	{
		var world = worldAsWorld as WorldExtended;

		var actor = new Actor
		(
			new Activity
			(
				ShipGroup.activityDefnApproachPlayer().name, null
			)
		);

		var collidable = Collidable.fromCollider(new Sphere(Coords.create(), 5));

		var ship0 = shipGroup.ships[0];
		var drawable = Drawable.fromVisual(ship0.defn(world).visual);

		var shipGroupPos = shipGroup.pos;
		var locatable = Locatable.fromPos(shipGroupPos);

		var movable = Movable.default();

		var talker = new Talker
		(
			shipGroup.factionName,
			null // quit - todo
		);

		var entityShipGroup = new Entity
		(
			shipGroup.name + Math.random(),
			[
				actor,
				//faction,
				collidable,
				drawable,
				locatable,
				movable,
				shipGroup,
				ship0,
				talker
			]
		);

		return entityShipGroup;
	}

	// controls

	toControlSidebar(universe: Universe)
	{
		var world = universe.world as WorldExtended;
		var containerSidebar = ControlContainer.from4
		(
			"containerSidebar",
			Coords.fromXY(300, 0),
			Coords.fromXY(100, 300),
			[ world.player.toControlSidebar(world) ]
		);

		var marginWidth = 8;
		var size = Coords.fromXY(1, 1).multiplyScalar
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
			Color.byName("GreenDark"),
			true // isInvisible
		);

		var imageSensors = this.displaySensors.initialize(null).toImage();

		var controlVisualSensors = ControlVisual.from4
		(
			"controlVisualSensors",
			Coords.fromXY(8, 152), // pos
			size,
			DataBinding.fromContext<VisualBase>
			(
				new VisualImageImmediate(imageSensors, null)
			)
		);

		containerSidebar.children.push(controlVisualSensors);

		return containerSidebar;
	}

	// Place overrides

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		display.drawBackground(Color.byName("Gray"), Color.byName("Black"));

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

		this.venueControls.draw(universe);
	}

	draw_Sensors(): void
	{
		this.displaySensors.clear();
		this.displaySensors.drawBackground(null, null);

		var sensorRange = this._camera.viewSize.clone().double();
		var controlSize = this.displaySensors.sizeInPixels;
		var controlSizeHalf = controlSize.clone().half();
		var cameraPos = this._camera.loc.pos;
		var drawPos = Coords.create();

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
			this.displaySensors.drawCircle(drawPos, starRadius, starColor, null, null);
		}

		var ships = this.hyperspace.shipGroups;
		var shipSize = Coords.fromXY(1, 1).multiplyScalar(2 * starRadius);
		var shipSizeHalf = shipSize.clone().half();
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
			).subtract
			(
				shipSizeHalf
			);
			this.displaySensors.drawRectangle(drawPos, shipSize, shipColor, null);
		}

		var drawPos = controlSizeHalf;
		this.displaySensors.drawCrosshairs
		(
			drawPos, // center
			4, // numberOfLines
			starRadius * 4, // radiusOuter
			null, // radiusInner
			shipColor,
			null // lineThickness
		);
	}
}
