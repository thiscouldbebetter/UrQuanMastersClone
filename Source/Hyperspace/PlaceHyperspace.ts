
class PlaceHyperspace extends PlaceBase
{
	hyperspace: Hyperspace;

	actions: Action[];
	displaySensors: Display;
	venueControls: VenueControls;

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

		var world = universe.world as WorldExtended;

		this.hyperspace = hyperspace;

		// entities

		var entities = this.entitiesToSpawn;

		entities.push(new GameClock(2880).toEntity());

		var entityDimension = Starsystem.RadiusOuter;

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

		// LinkPortals.

		this.constructor_LinkPortalsBuild(entityDimension, entities);

		// Stars.

		this.constructor_StarsBuild(entityDimension, entities);

		// Factions.

		this.constructor_FactionsBuild(universe, entities);

		// ShipGroups.

		var shipGroups = this.hyperspace.shipGroups;
		for (var i = 0; i < shipGroups.length; i++)
		{
			var shipGroup = shipGroups[i];
			var entityShipGroup = shipGroup.toEntitySpace(world, this);
			entities.push(entityShipGroup);
		}

		// Player.

		if (playerLoc != null)
		{
			var playerEntity =
				this.constructor_PlayerEntityBuild(world, entityDimension, playerLoc);

			if (starsystemDeparted != null)
			{
				var entities = this.entitiesToSpawn; // hack
				var entityForStarsystemDeparted =
					entities.find(x => Starsystem.fromEntity(x) == starsystemDeparted);
				Collidable.of(playerEntity).entityAlreadyCollidedWithAddIfNotPresent
				(
					entityForStarsystemDeparted
				);
			}

			entities.push(playerEntity);
		}

		// CollisionTracker.

		var collisionTracker = new CollisionTrackerMapped
		(
			this.hyperspace.size,
			Coords.fromXY(1, 1).multiplyScalar(64)
		);
		var entityForCollisionTracker = collisionTracker.toEntity();
		entities.splice(0, 0, entityForCollisionTracker); // hack - Must come before stationary entities.

		var containerSidebar = this.toControlSidebar(universe);
		this.venueControls = VenueControls.fromControl(containerSidebar);

		// Helper variables.

		this._drawLoc = Disposition.create();
		this._polar = Polar.create();
	}

	constructor_FactionsBuild(universe: Universe, entities: Entity[]): void
	{
		var world = universe.world as WorldExtended;
		var worldDefn = world.defnExtended();
		var factions = worldDefn.factions;
		for (var i = 0; i < factions.length; i++)
		{
			var faction = factions[i];
			var factionTerritory = faction.territory;
			if (factionTerritory != null)
			{
				var factionCollider = factionTerritory.shape;

				var factionCollidable = Collidable.fromCollider(factionCollider);
				var factionBoundable = Boundable.fromCollidable(factionCollidable);

				if (factionCollider != null)
				{
					var factionEntity = new Entity
					(
						"Faction" + faction.name,
						[
							factionBoundable,
							factionCollidable,
							faction,
							Locatable.create()
						]
					);
					entities.push(factionEntity);
				}
			}
		}
	}

	constructor_PlayerEntityBuild
	(
		world: WorldExtended, entityDimension: number, loc: Disposition
	): Entity
	{
		var actor = Actor.fromActivityDefn(Player.activityDefn() );

		var collider = Sphere.fromRadius(entityDimension / 2);
		var collidable = Collidable.fromColliderPropertyNamesAndCollide
		(
			collider,
			[ Collidable.name ], // entityPropertyNamesToCollideWith
			this.playerCollide
		);

		var boundable = Boundable.fromCollidable(collidable);

		var shipGroup = world.player.shipGroup;
		var ship = shipGroup.shipFirst();

		var shipDefn = ship.defn(world);
		var visual = shipDefn.visual;
		var drawable = Drawable.fromVisual(visual);

		var constraintFriction = new Constraint_FrictionDry(0.01);
		var constraintTrimToRange = new Constraint_TrimToPlaceSize();
		var constrainable = new Constrainable
		([
			constraintFriction,
			constraintTrimToRange
		]);

		var fuelable = new Fuelable();

		var itemHolder = ItemHolder.create();

		var locatable = new Locatable(loc);

		var movable = Movable.default();

		var playable = new Playable();

		var playerEntity = Entity.fromNameAndProperties
		(
			Player.name,
			[
				actor,
				boundable,
				collidable,
				constrainable,
				drawable,
				fuelable,
				itemHolder,
				locatable,
				movable,
				playable,
				shipGroup,
				ship
			]
		);

		return playerEntity;
	}

	constructor_LinkPortalsBuild(entityDimension: number, entities: Entity[]): void
	{
		var linkPortals = this.hyperspace.linkPortalsGetAll();
		for (var i = 0; i < linkPortals.length; i++)
		{
			var linkPortal = linkPortals[i];
			var linkPortalEntity = linkPortal.toEntity(entityDimension);
			entities.push(linkPortalEntity);
		}
	}

	constructor_StarsBuild(entityDimension: number, entities: Entity[]): void
	{
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

		var starVisualsForSizesByColorName = new Map<string, VisualPolygon[]>();
		var starSizeCount = 3; // Normal, giant, supergiant.
		for (var i = 0; i < starColors.length; i++)
		{
			var starColor = starColors[i];
			var starVisualsForSizes = [];
			for (var j = 0; j < starSizeCount; j++)
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

			var starCollider = Sphere.fromRadius(starRadius);

			var starColor = starsystem.starColor;
			var starSizeIndex = starsystem.starSizeIndex;
			var starVisual =
				starVisualsForSizesByColorName.get(starColor.name)[starSizeIndex];

			var starEntity = new Entity
			(
				starsystem.name,
				[
					new Boundable(BoxAxisAligned.fromSize(starSize) ),
					Collidable.fromCollider(starCollider),
					Drawable.fromVisual(starVisual),
					new Locatable(Disposition.fromPos(starPos) ),
					starsystem
				]
			);

			entities.push(starEntity);
		}
	}

	static actionMapView(): Action
	{
		return new Action
		(
			"MapView",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var world = uwpe.world;
				var place = uwpe.place;

				var placeNext = new PlaceHyperspaceMap(place as PlaceHyperspace);
				world.placeNextSet(placeNext);
			}
		);
	}

	entitiesShips(): Entity[]
	{
		return this.entitiesByPropertyName(Ship.name);
	}

	entitiesShipGroups(): Entity[]
	{
		return this.entitiesByPropertyName(ShipGroupBase.name);
	}

	factionShipGroupSpawnIfNeeded
	(
		universe: Universe,
		world: WorldExtended,
		placeAsPlace: Place,
		entityPlayer: Entity,
		entityOther: Entity
	): void
	{
		var faction = Faction.fromEntity(entityOther);
		var factionTerritory = faction.territory;
		var factionTerritoryIsDisabled = factionTerritory.disabled();
		if (factionTerritoryIsDisabled)
		{
			return;
		}

		var factionName = faction.name;

		var place = placeAsPlace as PlaceHyperspace;

		var numberOfShipGroupsExistingForFaction = 0;
		var entitiesShipGroupsAll = place.entitiesShipGroups();
		for (var i = 0; i < entitiesShipGroupsAll.length; i++)
		{
			var entityShipGroup = entitiesShipGroupsAll[i];
			let shipGroup = ShipGroupFinite.fromEntity(entityShipGroup);
			if (shipGroup.factionName == factionName)
			{
				numberOfShipGroupsExistingForFaction++;
			}
		}

		var shipGroupsPerFaction = 1; // todo
		if (numberOfShipGroupsExistingForFaction < shipGroupsPerFaction)
		{
			var factionTerritoryShape = faction.territory.shape;
			var shipGroupPos =
				factionTerritoryShape.pointRandom(universe.randomizer).clearZ();

			var shipDefnName = faction.shipDefnName; // todo
			var factionName = faction.name;

			var shipGroup = new ShipGroupFinite
			(
				factionName + " Ship Group",
				factionName,
				shipGroupPos,
				null, // shipsMax
				[ new Ship(shipDefnName) ]
			);

			this.shipGroupAdd(shipGroup, world);
		}
	}

	linkPortalAdd(linkPortal: LinkPortal, world: WorldExtended): void
	{
		var linkPortalAsEntity =
			linkPortal.toEntity(Starsystem.RadiusOuter); // hack
		this.entityToSpawnAdd(linkPortalAsEntity);
	}


	playerCollide(uwpe: UniverseWorldPlaceEntities, collision: Collision): void
	{
		var universe = uwpe.universe;
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlaceHyperspace;

		if (uwpe.entity2.name == Player.name)
		{
			uwpe.entitiesSwap();
		}

		var entityPlayer = uwpe.entity;
		var entityOther = uwpe.entity2;

		var entityOtherStarsystem = Starsystem.fromEntity(entityOther);
		var entityOtherShipGroup = ShipGroupBase.fromEntity(entityOther);
		var entityOtherFaction = Faction.fromEntity(entityOther);
		var entityOtherLinkPortal = LinkPortal.fromEntity(entityOther);

		if (entityOtherStarsystem != null)
		{
			var starsystem = entityOtherStarsystem;
			var playerLoc = Locatable.of(entityPlayer).loc;
			var playerOrientation = playerLoc.orientation;
			var playerPosNextAsPolar = Polar.create().fromCoords
			(
				playerOrientation.forward
			).addToAzimuthInTurns(.5).wrap();
			playerPosNextAsPolar.radius = starsystem.sizeInner.x * .45;
			var playerPosNext = playerPosNextAsPolar.toCoords().add
			(
				starsystem.sizeInner.clone().half()
			);

			var placeNext = starsystem.toPlace
			(
				world,
				Disposition.fromPosAndOrientation
				(
					playerPosNext,
					playerOrientation.clone()
				),
				null // planet
			);

			world.placeNextSet(placeNext);
		}
		else if (entityOtherShipGroup != null)
		{
			var shipGroupOther = entityOtherShipGroup;
			var playerPos = Locatable.of(entityPlayer).loc.pos;
			var starsystemClosest = place.hyperspace.starsystemClosestTo(playerPos);
			var planetClosest = starsystemClosest.planetRandom(universe);
			var encounter = new Encounter
			(
				planetClosest,
				shipGroupOther.factionName,
				entityPlayer,
				entityOther,
				place,
				playerPos
			);
			var placeEncounter = encounter.toPlace();
			world.placeNextSet(placeEncounter);

			place.entityToRemoveAdd(entityOther);
			ArrayHelper.remove(place.hyperspace.shipGroups, shipGroupOther);
		}
		else if (entityOtherFaction != null)
		{
			place.factionShipGroupSpawnIfNeeded
			(
				universe, world, place, entityPlayer, entityOther
			);
		}
		else if (entityOtherLinkPortal != null)
		{
			entityOtherLinkPortal.collideWithPlayer(uwpe);
		}
	}

	shipGroupAdd(shipGroup: ShipGroup, world: WorldExtended): void
	{
		var entityShipGroup =
			shipGroup.toEntitySpace(world, this);
		this.hyperspace.shipGroupAdd(shipGroup);
		this.entityToSpawnAdd(entityShipGroup);
	}

	// controls

	toControlSidebar(universe: Universe)
	{
		var world = universe.world as WorldExtended;
		var containerSidebar = ControlContainer.fromNamePosSizeAndChildren
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
			display.fontNameAndHeight,
			Color.Instances().Yellow,
			Color.Instances().GreenDark,
			true // isInvisible
		);

		var imageSensors = this.displaySensors.initialize(null).toImage("Sensors");

		var controlVisualSensors = ControlVisual.fromNamePosSizeAndVisual
		(
			"controlVisualSensors",
			Coords.fromXY(8, 152), // pos
			size,
			DataBinding.fromContext<Visual>
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

		var colors = Color.Instances();
		display.drawBackgroundWithColorsBackAndBorder(colors.Gray, colors.Black);

		var player = this.entityByName(Player.name);
		var playerLoc = Locatable.of(player).loc;

		var camera = this._camera;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			camera.viewSizeHalf,
			this.size().clone().subtract(camera.viewSizeHalf)
		);

		super.draw(universe, world, display);

		this.draw_Sensors();

		this.venueControls.draw(universe);
	}

	draw_Sensors(): void
	{
		this.displaySensors.clear();
		this.displaySensors.drawBackground();

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
