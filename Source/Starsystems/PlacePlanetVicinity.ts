
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
		worldAsWorld: World,
		size: Coords,
		planet: Planet,
		playerLoc: Disposition,
		placeStarsystem: PlaceStarsystem
	)
	{
		super(PlacePlanetVicinity.name, PlacePlanetVicinity.name, Coords.fromXY(300, 300), []);

		var world = worldAsWorld as WorldExtended;

		this.size = size;
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

		var entityDimension = 10;

		var entities = this.entitiesToSpawn;

		// planet

		var sizeHalf = this.size.clone().half();

		var planetRadius = entityDimension;
		var planetPos = sizeHalf.clone();
		var planetColor = planet.defn().color;
		var orbitMultiplier = 16;
		var planetOrbitRadius = planet.posAsPolar.radius * orbitMultiplier;
		var planetOrbitVisual = new VisualAnchor
		(
			new VisualCircle(planetOrbitRadius, null, Color.byName("Gray"), null),
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

		var planetVisual = new VisualGroup
		([
			planetOrbitVisual,
			VisualCircle.fromRadiusAndColorFill(planetRadius, planetColor),
		]);
		var planetCollider = new Sphere(Coords.create(), planetRadius);

		var planetEntity = new Entity
		(
			"Planet",
			[
				CollidableHelper.fromCollider(planetCollider),
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

			var satelliteEntity = satellite.toEntity(planetPos);

			entities.push(satelliteEntity);
		}

		// player

		var playerActivityDefnName = Player.activityDefn().name;
		var playerActivity = new Activity(playerActivityDefnName, null);

		var playerCollider = new Sphere(Coords.create(), entityDimension / 2);
		var playerColor = Color.byName("Gray");

		var playerVisualBody = ShipDefn.visual(entityDimension, playerColor, null);

		var playerVisual = new VisualGroup
		([
			playerVisualBody,
		]);

		var playerCollide = (uwpe: UniverseWorldPlaceEntities) =>
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
				world.placeNext = new PlaceStarsystem
				(
					world, starsystem, dispositionNext, planet
				);

				todo
				/*
				var entityPlanet = placeStarsystem.entityByName(planet.name);
				var playerCollidable = entityPlayer.collidable();
				playerCollidable.entitiesAlreadyCollidedWith.push(entityPlanet);
				playerCollidable.colliderLocateForEntity(entityPlayer); // hack
				*/
			}
			else
			{
				var entityOtherPlanet = EntityExtensions.planet(entityOther);
				var entityOtherShipGroup = EntityExtensions.shipGroup(entityOther);
				var entityOtherStation = EntityExtensions.station(entityOther);
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
					entityOther.collidable().ticksUntilCanCollide = 50; // hack
					var shipGroup = entityOtherShipGroup;
					var encounter = new Encounter
					(
						place.planet,
						shipGroup.factionName,
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

		var constraintSpeedMax = new Constraint_SpeedMaxXY(1);

		var playerEntity = new Entity
		(
			Player.name,
			[
				new Actor(playerActivity),
				new Collidable
				(
					null, // ticks
					playerCollider,
					[ Collidable.name ], // entityPropertyNamesToCollideWith
					playerCollide
				),
				new Constrainable([constraintSpeedMax]),
				Drawable.fromVisual(playerVisual),
				ItemHolder.create(),
				new Locatable(playerLoc),
				Movable.default(),
				new Playable(),
				world.player.shipGroup.ships[0],
				world.player.shipGroup
			]
		);

		//playerEntity.collidable.ticksUntilCanCollide = 100; // hack

		entities.push(playerEntity);

		var shipGroups = this.planet.shipGroups;
		for (var i = 0; i < shipGroups.length; i++)
		{
			var shipGroup = shipGroups[i];
			var faction = shipGroup.faction(world);

			var damagerColor = Color.byName("Red");
			var enemyColor = damagerColor;
			var enemyPos = this.size.clone().subtract(playerLoc.pos);
			var enemyLoc = Disposition.fromPos(enemyPos);

			var enemyColliderAsFace = new Face
			([
				Coords.fromXY(0, -entityDimension).half(),
				Coords.fromXY(entityDimension, entityDimension).half(),
				Coords.fromXY(-entityDimension, entityDimension).half(),
			]);

			var enemyCollider = Mesh.fromFace
			(
				new Coords(0, 0, 0), // center
				enemyColliderAsFace,
				1 // thickness
			);

			var enemyVisual = new VisualPolygon
			(
				new Path(enemyColliderAsFace.vertices), enemyColor,
				null, // ?
				false // shouldUseEntityOrientation
			);

			var enemyKill = (uwpe: UniverseWorldPlaceEntities) =>
			{
				var place = uwpe.place;
				var entity = uwpe.entity;

				place.entityRemove(entity);
				var planet = (place as PlacePlanetVicinity).planet;
				var shipGroup = EntityExtensions.shipGroup(entity);
				ArrayHelper.remove(planet.shipGroups, shipGroup);
			}

			var enemyEntity = new Entity
			(
				"Enemy" + i,
				[
					new Actor(faction.shipGroupActivity),
					CollidableHelper.fromCollider(enemyCollider),
					new Constrainable([constraintSpeedMax]),
					new Damager(null),
					Drawable.fromVisual(enemyVisual),
					new Killable(1, null, enemyKill),
					new Locatable(enemyLoc),
					Movable.default(),
					new Talker("todo"),
					shipGroup,
				]
			);

			entities.push(enemyEntity);
		}

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
				CollidableHelper.fromCollider
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
}
