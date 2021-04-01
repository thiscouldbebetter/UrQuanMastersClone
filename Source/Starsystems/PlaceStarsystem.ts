
class PlaceStarsystem extends Place
{
	world: World;
	starsystem: Starsystem;
	playerLoc: Disposition;
	planetDeparted: Planet;

	actions: Action[];
	venueControls: VenueControls;

	_actionToInputsMappings: ActionToInputsMapping[];
	_camera: Camera;
	_drawLoc: Disposition

	constructor
	(
		world: WorldExtended, starsystem: Starsystem, playerLoc: Disposition,
		planetDeparted: Planet
	)
	{
		super(PlaceStarsystem.name, PlaceStarsystem.name, Coords.fromXY(300, 300), []);

		this.starsystem = starsystem;
		this.size = this.starsystem.sizeInner;

		this.actions =
		[
			Ship.actionShowMenu(),
			Ship.actionAccelerate(),
			Ship.actionTurnLeft(),
			Ship.actionTurnRight(),

		];//.addLookupsByName();

		this._actionToInputsMappings = Ship.actionToInputsMappings();

		// entities

		var entityDimension = 10;

		var entities = this.entitiesToSpawn;

		// sun

		var sizeHalf = this.size.clone().half();

		var sunRadius = entityDimension * 1.5;
		var sunPos = sizeHalf.clone();
		var sunColor = starsystem.starColor;
		var sunVisual = VisualCircle.fromRadiusAndColorFill(sunRadius, sunColor);
		var sunCollider = new Sphere(Coords.create(), sunRadius);

		var sunEntity = new Entity
		(
			"Sun",
			[
				new Locatable(Disposition.fromPos(sunPos) ),
				new Collidable(null, sunCollider, [ Collidable.name ], null),
				Drawable.fromVisual(sunVisual)
			]
		);

		entities.push(sunEntity);

		// planets

		var planets = starsystem.planets;
		for (var i = 0; i < planets.length; i++)
		{
			var planet = planets[i];
			var planetEntity = planet.toEntity(sunPos);
			entities.push(planetEntity);
		}

		// player

		var playerActivityDefnName = Player.activityDefn().name;
		var playerActivity = new Activity(playerActivityDefnName, null);
		var playerCollider = new Sphere(new Coords(0, 0, 0), entityDimension / 2);
		var playerColor = Color.byName("Gray");

		var playerVisualBody = ShipDefn.visual(entityDimension, playerColor, null);

		var playerVisual = new VisualGroup
		([
			playerVisualBody,
		]);

		var constraintSpeedMax = new Constraint_SpeedMaxXY(1);

		var playerShipGroup = world.player.shipGroup;

		var playerCollidable = new Collidable
		(
			null, // ticks
			playerCollider,
			[ Collidable.name ], // entityPropertyNamesToCollideWith
			this.playerCollide
		);
		if (planetDeparted != null)
		{
			var entityForPlanetDeparted =
				entities.filter(x => EntityExtensions.planet(x) == planetDeparted)[0];
			playerCollidable.entitiesAlreadyCollidedWith.push(entityForPlanetDeparted);
		}

		var playerEntity = new Entity
		(
			Player.name,
			[
				new Actor(playerActivity),
				new Constrainable([constraintSpeedMax]),
				playerCollidable,
				Drawable.fromVisual(playerVisual),
				ItemHolder.create(),
				new Locatable(playerLoc),
				Movable.create(),
				new Playable(),
				playerShipGroup,
				playerShipGroup.ships[0]
			]
		);

		entities.push(playerEntity);

		if (starsystem.factionName != null)
		{
			// enemy

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
				new Path(enemyColliderAsFace.vertices), enemyColor, null
			);

			var enemyShipDefnName = "Flagship"; // todo
			var enemyShip = new Ship(enemyShipDefnName);
			var enemyShipGroup = new ShipGroup
			(
				"Enemy",
				"Enemy", // factionName
				Coords.create(),
				[ enemyShip ]
			);

			var enemyKill = (universe: Universe, world: World, place: Place, entity: Entity) =>
			{
				place.entityRemove(entity);
				var starsystem = (place as PlaceStarsystem).starsystem;
				var shipGroup = EntityExtensions.shipGroup(entity);
				ArrayHelper.remove(starsystem.shipGroups, shipGroup);
			}

			var enemyActivityDefnPerform = (universe: Universe, world: World, place: Place, actor: Entity) => // activity
			{
				var entityToTargetName = "todo";
				var target = place.entitiesByName.get(entityToTargetName);
				var actorLoc = actor.locatable().loc;

				actorLoc.vel.overwriteWith
				(
					target.locatable().loc.pos
				).subtract
				(
					actorLoc.pos
				).normalize().multiplyScalar
				(
					.5 // hack - speed
				);
			};

			var enemyActivityDefn = new ActivityDefn("Enemy", enemyActivityDefnPerform);

			var enemyEntity = new Entity
			(
				"Enemy",
				[
					enemyShipGroup,
					new Constrainable([constraintSpeedMax]),
					CollidableHelper.fromCollider(enemyCollider),
					new Damager(null),
					Drawable.fromVisual(enemyVisual),
					new Killable(1, null, enemyKill),
					new Locatable(enemyLoc),
					Movable.create(),
					new Actor
					(
						new Activity(enemyActivityDefn.name, "Player")
					),
				]
			);

			entities.push(enemyEntity);
		}

		this._camera = new Camera
		(
			new Coords(1, 1, 0).multiplyScalar(this.size.y),
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

		// CollisionTracker.

		/*
		var collisionTracker = new CollisionTracker(this.starsystem.sizeInner);
		var entityForCollisionTracker = collisionTracker.toEntity();
		entities.push(entityForCollisionTracker);
		*/

		// Sidebar.

		var containerSidebar = ControlContainer.from4
		(
			"containerSidebar",
			Coords.fromXY(300, 0), // todo
			Coords.fromXY(100, 300), // size
			[ world.player.toControlSidebar(world) ]
		);
		this.venueControls = VenueControls.fromControl(containerSidebar);

		// Helper variables.

		this._drawLoc = Disposition.create();
	}

	// methods

	actionToInputsMappings(): ActionToInputsMapping[]
	{
		return this._actionToInputsMappings;
	}

	playerCollide
	(
		universe: Universe, worldAsWorld: World, placeAsPlace: Place,
		entityPlayer: Entity, entityOther: Entity
	): void
	{
		var world = worldAsWorld as WorldExtended;
		var place = placeAsPlace as PlaceStarsystem;

		var entityOtherName = entityOther.name;

		if (entityOtherName.startsWith("Enemy"))
		{
			var shipGroupOther = EntityExtensions.shipGroup(entityOther);
			var encounter = new Encounter
			(
				ArrayHelper.random(place.starsystem.planets, universe.randomizer),
				shipGroupOther.factionName,
				entityOther,
				place,
				entityPlayer.locatable().loc.pos
			);
			var placeEncounter = new PlaceEncounter(world, encounter);
			world.placeNext = placeEncounter;
		}
		else if (entityOtherName.startsWith("Wall"))
		{
			var hyperspace = world.hyperspace;
			var playerLoc = entityPlayer.locatable().loc;
			var playerPosNext = place.starsystem.posInHyperspace.clone();
			world.placeNext = new PlaceHyperspace
			(
				universe,
				hyperspace,
				place.starsystem, // starsystemDeparted
				new Disposition(playerPosNext, playerLoc.orientation.clone(), null)
			);
		}
		else if (entityOtherName.startsWith("Sun"))
		{
			// Do nothing.
		}
		else
		{
			var entityOtherPlanet = EntityExtensions.planet(entityOther);
			if (entityOtherPlanet != null)
			{
				entityPlayer.collidable().entitiesAlreadyCollidedWith.push(entityOther);

				var planet = entityOtherPlanet;
				var sizeNext = place.size.clone();
				var playerOrientation = entityPlayer.locatable().loc.orientation;
				var heading = playerOrientation.forward.headingInTurns();
				var playerPosNext = new Polar
				(
					heading + .5, .4 * sizeNext.y, null
				).wrap().toCoords
				(
					Coords.create()
				).add
				(
					sizeNext.clone().half()
				);
				var playerLocNext = new Disposition(playerPosNext, playerOrientation, null);
				world.placeNext = new PlacePlanetVicinity
				(
					world, sizeNext, planet, playerLocNext, place
				);
			}
		}
	}

	// Place overrides

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		display.drawBackground(Color.byName("Gray"), Color.byName("Black"));

		var player = this.entitiesByName.get(Player.name);
		if (player == null)
		{
			return; // hack
		}
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

		super.draw(universe, world, universe.display);

		this.venueControls.draw(universe);
	}
}
