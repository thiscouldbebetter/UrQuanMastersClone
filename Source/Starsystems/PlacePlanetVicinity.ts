
class PlacePlanetVicinity extends PlaceBase
{
	world: World;
	_size: Coords;
	planet: Planet;
	playerLoc: Disposition;
	placeStarsystem: PlaceStarsystem;

	actions: Action[];
	venueControls: VenueControls;

	_actionToInputsMappings: ActionToInputsMapping[];
	_camera: Camera;

	constructor
	(
		world: WorldExtended,
		planet: Planet,
		playerLoc: Disposition,
		placeStarsystem: PlaceStarsystem
	)
	{
		super
		(
			PlacePlanetVicinity.name + ":" + planet.name,
			PlacePlanetVicinity.name, // defnName
			null, // parentName
			Coords.fromXY(1, 1).multiplyScalar(300),
			null // entities
		);

		this.planet = planet;
		this.placeStarsystem = placeStarsystem;

		this.actions =
		[
			Ship.actionShowMenu(),
			Ship.actionAccelerate(),
			Ship.actionTurnLeft(),
			Ship.actionTurnRight(),
		];

		this._actionToInputsMappings = Ship.actionToInputsMappings();

		// entities

		var entities = this.entitiesToSpawn;

		entities.push(new GameClock(2880).toEntity());

		var entityDimension = 10;

		// planet

		var sizeHalf = this.size().clone().half();
		var planetPos = sizeHalf.clone();

		const isPrimaryTrue = true;
		var planetEntity =
			this.planet.toEntityForPlanetVicinity(world, isPrimaryTrue, planetPos, entityDimension);

		entities.push(planetEntity);

		// satellites

		var satellites = planet.satellitesGet();
		for (var i = 0; i < satellites.length; i++)
		{
			var satellite = satellites[i];

			const isPrimaryFalse = false;
			var satelliteEntity =
				satellite.toEntityForPlanetVicinity(world, isPrimaryFalse, planetPos, entityDimension);

			entities.push(satelliteEntity);
		}

		if (playerLoc != null)
		{
			var playerEntity = this.constructor_PlayerEntityBuild(entityDimension, world, playerLoc);

			entities.push(playerEntity);
		}

		var entitiesForShipGroups =
			this.planet.shipGroupsInVicinity().map(x => x.toEntity(world, this) );

		entities.push(...entitiesForShipGroups);

		this._camera = new Camera
		(
			Coords.fromXY(1, 1).multiplyScalar(300), // hack
			null, // focalLength
			Disposition.fromOrientation
			(
				Orientation.Instances().ForwardZDownY.clone(),
			),
			null // entitiesInViewSort
		);
		var cameraAsEntity = CameraHelper.toEntity(this._camera);
		entities.push(cameraAsEntity);

		var wallsEntity = new Entity
		(
			PlacePlanetVicinity.EntityBoundaryWallName,
			[
				Locatable.fromPos(this.size().clone().half() ),
				Collidable.fromShape
				(
					new ShapeInverse
					(
						new Box(Coords.create(), this.size() )
					)
				)
			]
		);
		entities.push(wallsEntity);

		var playerAsControlSidebar =
			world.player.toControlSidebar(world);

		var containerSidebar = ControlContainer.from4
		(
			"containerSidebar",
			Coords.fromXY(300, 0), // todo
			Coords.fromXY(100, 300), // size
			[ playerAsControlSidebar ]
		);
		this.venueControls = VenueControls.fromControl(containerSidebar);
	}

	constructor_PlayerEntityBuild(entityDimension: number, world: WorldExtended, playerLoc: Disposition): Entity
	{
		// player - Can this be merged with similar code in PlaceStarsystem?

		var activityDefnName = Player.activityDefn().name;
		var activity = new Activity(activityDefnName, null);
		var actor = new Actor(activity);

		var collider = new Sphere(Coords.create(), entityDimension / 2);
		var collidable = Collidable.from3
		(
			collider,
			[ Collidable.name ], // entityPropertyNamesToCollideWith
			this.playerCollide
		);

		var constraintSpeedMax = new Constraint_SpeedMaxXY(1); // todo

		var constrainable = new Constrainable([constraintSpeedMax]);

		var itemHolder = ItemHolder.create();

		var locatable = new Locatable(playerLoc);

		var movable = Movable.default();

		var playable = new Playable();

		var shipGroup = world.player.shipGroup;
		var ship = shipGroup.shipFirst();

		var shipDefn = ship.defn(world);
		var visual = shipDefn.visual;
		var drawable = Drawable.fromVisual(visual);

		var playerEntity = new Entity
		(
			Player.name,
			[
				actor,
				collidable,
				constrainable,
				drawable,
				itemHolder,
				locatable,
				movable,
				playable,
				ship,
				shipGroup
			]
		);

		//playerEntity.collidable.ticksUntilCanCollide = 100; // hack

		return playerEntity;
	}

	// methods

	actionToInputsMappings(): ActionToInputsMapping[]
	{
		return this._actionToInputsMappings;
	}

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		var colors = Color.Instances();
		display.drawBackground(colors.Black, colors.Gray);

		var player = this.entityByName(Player.name);
		var playerLoc = player.locatable().loc;

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

		this.venueControls.draw(universe);
	}

	static EntityBoundaryWallName = "Walls";

	playerCollide(uwpe: UniverseWorldPlaceEntities)
	{
		var universe = uwpe.universe;
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlacePlanetVicinity;

		if (uwpe.entity2.name == Player.name)
		{
			uwpe.entitiesSwap();
		}

		var entityPlayer = uwpe.entity;
		var entityOther = uwpe.entity2;

		var entityOtherName = entityOther.name;
		var entityOtherPlanet = Planet.fromEntity(entityOther);
		var entityOtherShipGroup = ShipGroupFinite.fromEntity(entityOther);

		if (entityOtherName == PlacePlanetVicinity.EntityBoundaryWallName)
		{
			place.playerCollide_Walls(world, entityPlayer);
		}
		else if (entityOtherPlanet != null)
		{
			place.playerCollide_Planet(universe, world, entityPlayer, entityOther);
		}
		else if (entityOtherShipGroup != null)
		{
			place.playerCollide_ShipGroup(uwpe, entityOther);
		}
	}

	playerCollide_Planet
	(
		universe: Universe,
		world: WorldExtended,
		entityPlayer: Entity,
		entityPlanet: Entity
	): void
	{
		var planet = Planet.fromEntity(entityPlanet);
		var planetFaction = planet.faction(world);
		var planetHasFaction = (planetFaction != null);

		if (planetHasFaction == false)
		{
			this.playerCollide_Planet_WithNoFaction(universe, world, entityPlayer, entityPlanet);
		}
		else
		{
			this.playerCollide_Planet_WithFaction(world, entityPlayer, entityPlanet);
		}
	}

	playerCollide_Planet_WithFaction
	(
		world: WorldExtended, entityPlayer: Entity, entityPlanet: Entity
	): void
	{
		var planet = Planet.fromEntity(entityPlanet);
		var planetFaction = planet.faction(world);
		var planetIsStation = planet.isStation();
		var player = world.player;
		var planetIsAlliedWithPlayer =
			(player.diplomaticRelationshipWithFactionIsAllied(planetFaction) );
		if (planetIsStation && planetIsAlliedWithPlayer)
		{
			world.placeNextSet(new PlaceStation(world, planet, this) );
		}
		else
		{
			var playerPos = entityPlayer.locatable().loc.pos;
			var encounter = new Encounter
			(
				planet,
				planet.factionName,
				entityPlayer,
				entityPlanet,
				this,
				playerPos
			);
			var placeEncounter = encounter.toPlace();
			world.placeNextSet(placeEncounter);
		}
	}

	playerCollide_Planet_WithNoFaction
	(
		universe: Universe, world: WorldExtended, entityPlayer: Entity, entityPlanet: Entity
	): void
	{
		var playerLoc = entityPlayer.locatable().loc;
		var planetPos = entityPlanet.locatable().loc.pos;
		playerLoc.pos.overwriteWith(planetPos);
		playerLoc.vel.clear();
		entityPlayer.collidable().entityAlreadyCollidedWithAddIfNotPresent(entityPlanet);
		var planet = Planet.fromEntity(entityPlanet);
		var placePlanetOrbit = new PlacePlanetOrbit
		(
			universe, world, planet, this
		);
		world.placeNextSet(placePlanetOrbit);
	}

	playerCollide_ShipGroup(uwpe: UniverseWorldPlaceEntities, entityShipGroup: Entity): void
	{
		entityShipGroup.collidable().ticksUntilCanCollide = 100; // hack
		var shipGroup = ShipGroupFinite.fromEntity(entityShipGroup);
		var placeEncounter = shipGroup.toEncounter(uwpe).toPlace();
		uwpe.world.placeNextSet(placeEncounter);
	}

	playerCollide_Walls(world: WorldExtended, entityPlayer: Entity): void
	{
		var placeStarsystem = this.placeStarsystem;
		var starsystem = placeStarsystem.starsystem;
		var planet = this.planet;
		var posNext =
			planet
				.posAsPolar
				.toCoords(Coords.create())
				.add
				(
					starsystem.sizeInner.clone().half()
				);
		var dispositionNext = new Disposition
		(
			posNext,
			entityPlayer.locatable().loc.orientation.clone(),
			null
		);
		var starsystemAsPlace = starsystem.toPlace
		(
			world, dispositionNext, planet
		);
		world.placeNextSet(starsystemAsPlace);
	}

	starsystem(): Starsystem
	{
		return this.placeStarsystem.starsystem;
	}
}
