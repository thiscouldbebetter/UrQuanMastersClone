
class PlacePlanetVicinity extends Place
{
	world: World;
	size: Coords;
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
			Coords.fromXY(300, 300),
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

		var sizeHalf = this.size.clone().half();

		var planetRadius = entityDimension;
		var planetPos = sizeHalf.clone();
		var orbitMultiplier = 16;
		var planetOrbitRadius = planet.posAsPolar.radius * orbitMultiplier;
		var planetOrbitColor = planet.orbitColor();
		var planetOrbitVisual = new VisualAnchor
		(
			new VisualCircle(planetOrbitRadius, null, planetOrbitColor, null),
			planetPos.clone().add
			(
				new Polar
				(
					planet.posAsPolar.azimuthInTurns + .5,
					planetOrbitRadius,
					null
				).wrap().toCoords(Coords.create())
			), // posToAnchorAt
			null // ?
		);

		var planetDefn = planet.defn();
		var planetGlobeVisual = planetDefn.visualVicinity;

		var planetVisual = new VisualGroup
		([
			planetOrbitVisual,
			planetGlobeVisual,
		]);
		var planetCollider = new Sphere(Coords.create(), planetRadius);

		var planetEntity = new Entity
		(
			"Planet",
			[
				Collidable.fromCollider(planetCollider),
				Drawable.fromVisual(planetVisual),
				Locatable.fromPos(planetPos),
				planet
			]
		);

		entities.push(planetEntity);

		// satellites

		var satellites = planet.satellites;
		for (var i = 0; i < satellites.length; i++)
		{
			var satellite = satellites[i];

			var satelliteEntity = satellite.toEntity(planet, planetPos);

			entities.push(satelliteEntity);
		}

		var constraintSpeedMax = new Constraint_SpeedMaxXY(1);

		if (playerLoc != null)
		{
			// player - Can this be merged with similar code in PlaceStarsystem?

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

			var playerConstrainable = new Constrainable([constraintSpeedMax]);

			var playerItemHolder = ItemHolder.create();

			var playerLocatable = new Locatable(playerLoc);

			var playerMovable = Movable.default();

			var playerPlayable = new Playable();

			var playerShipGroup = world.player.shipGroup;
			var playerShip = playerShipGroup.ships[0];

			var playerShipDefn = playerShip.defn(world);
			var playerVisual = playerShipDefn.visual;
			var playerDrawable = Drawable.fromVisual(playerVisual);

			var playerEntity = new Entity
			(
				Player.name,
				[
					playerActor,
					playerCollidable,
					playerConstrainable,
					playerDrawable,
					playerItemHolder,
					playerLocatable,
					playerMovable,
					playerPlayable,
					playerShip,
					playerShipGroup
				]
			);

			//playerEntity.collidable.ticksUntilCanCollide = 100; // hack

			entities.push(playerEntity);
		}

		var entitiesForShipGroups =
			this.planet.shipGroups.map(x => x.toEntity(world, this) );

		entities.push(...entitiesForShipGroups);

		this._camera = new Camera
		(
			Coords.fromXY(300, 300), // hack
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
			"Walls",
			[
				new Locatable
				(
					Disposition.fromPos(this.size.clone().half() )
				),
				Collidable.fromCollider
				(
					new ShapeInverse
					(
						new Box(Coords.create(), this.size)
					)
				)
			]
		);
		entities.push(wallsEntity);

		var containerSidebar = ControlContainer.from4
		(
			"containerSidebar",
			Coords.fromXY(300, 0), // todo
			Coords.fromXY(100, 300), // size
			[ (world as WorldExtended).player.toControlSidebar(world) ]
		);
		this.venueControls = VenueControls.fromControl(containerSidebar);
	}

	// methods

	actionToInputsMappings(): ActionToInputsMapping[]
	{
		return this._actionToInputsMappings;
	}

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		display.drawBackground(Color.byName("Black"), Color.byName("Gray"));

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

		this.venueControls.draw(universe);
	}

	playerCollide(uwpe: UniverseWorldPlaceEntities)
	{
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlacePlanetVicinity;
		var entityPlayer = uwpe.entity;
		var entityOther = uwpe.entity2;

		var entityOtherName = entityOther.name;

		if (entityOtherName.startsWith("Wall"))
		{
			var planet = place.planet;
			var placeStarsystem = place.placeStarsystem;
			var starsystem = placeStarsystem.starsystem;
			var posNext = planet.posAsPolar.toCoords(Coords.create()).add
			(
				starsystem.sizeInner.clone().half()
			);
			var dispositionNext = new Disposition
			(
				posNext,
				entityPlayer.locatable().loc.orientation.clone(),
				null
			);
			world.placeNext = starsystem.toPlace
			(
				world, dispositionNext, planet
			);
		}
		else
		{
			var entityOtherPlanet = Planet.fromEntity(entityOther);
			var entityOtherShipGroup = ShipGroup.fromEntity(entityOther);
			var entityOtherStation = Station.fromEntity(entityOther);
			if (entityOtherPlanet != null)
			{
				var playerLoc = entityPlayer.locatable().loc;
				var planetPos = entityOther.locatable().loc.pos;
				playerLoc.pos.overwriteWith(planetPos);
				playerLoc.vel.clear();
				entityPlayer.collidable().entitiesAlreadyCollidedWith.push(entityOther);
				world.placeNext = new PlacePlanetOrbit
				(
					world, entityOtherPlanet, place
				);
			}
			else if (entityOtherShipGroup != null)
			{
				entityOther.collidable().ticksUntilCanCollide = 100; // hack
				var shipGroup = entityOtherShipGroup;
				var encounter = new Encounter
				(
					place.planet,
					shipGroup.factionName,
					entityPlayer,
					entityOther,
					place,
					entityPlayer.locatable().loc.pos
				);
				var placeEncounter = new PlaceEncounter(world, encounter);
				world.placeNext = placeEncounter;
			}
			else if (entityOtherStation != null)
			{
				var station = entityOtherStation;
				var faction = station.faction(world);
				if (faction.relationsWithPlayer == Faction.RelationsAllied)
				{
					world.placeNext = new PlaceStation(world, station, place);
				}
				else
				{
					entityOther.collidable().ticksUntilCanCollide = 50; // hack
					var encounter = new Encounter
					(
						this.planet,
						station.factionName,
						entityPlayer,
						entityOther,
						place,
						entityPlayer.locatable().loc.pos
					);
					var placeEncounter = new PlaceEncounter(world, encounter);
					world.placeNext = placeEncounter;
				}
			}
		}
	}

	starsystem(): Starsystem
	{
		return this.placeStarsystem.starsystem;
	}
}
