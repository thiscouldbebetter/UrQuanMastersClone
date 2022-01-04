
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
		world: WorldExtended,
		starsystem: Starsystem,
		playerLoc: Disposition,
		planetDeparted: Planet
	)
	{
		super
		(
			PlaceStarsystem.name,
			PlaceStarsystem.name,
			null, // parentName
			Coords.fromXY(300, 300), // size
			null // entities
		);

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
				new Collidable
				(
					false, // canCollideAgainWithoutSeparating
					null, sunCollider, [ Collidable.name ], null
				),
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

		var constraintSpeedMax = new Constraint_SpeedMaxXY(1);

		if (playerLoc != null)
		{
			// player - Can this be merged with similar code in PlacePlanetVicinity?

			var playerActivityDefnName = Player.activityDefn().name;
			var playerActivity = new Activity(playerActivityDefnName, null);
			var playerActor = new Actor(playerActivity);

			var playerCollider = new Sphere(new Coords(0, 0, 0), entityDimension / 2);
			var playerCollidable = new Collidable
			(
				false, // canCollideAgainWithoutSeparating
				null, // ticks
				playerCollider,
				[ Collidable.name ], // entityPropertyNamesToCollideWith
				this.playerCollide
			);

			var playerConstrainable = new Constrainable([constraintSpeedMax])

			var playerColor = Color.byName("Gray");
			var playerVisualBody = ShipDefn.visual(entityDimension, playerColor, null);
			var playerVisual = new VisualGroup
			([
				playerVisualBody
			]);
			var playerDrawable = Drawable.fromVisual(playerVisual);

			var playerItemHolder = ItemHolder.create();

			var playerLocatable = new Locatable(playerLoc);

			var playerMovable = Movable.default();

			var playerPlayable = new Playable();

			var playerShipGroup = world.player.shipGroup;
			var playerShip = playerShipGroup.ships[0];

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

			if (planetDeparted != null)
			{
				var entityForPlanetDeparted =
					entities.filter(x => Planet.fromEntity(x) == planetDeparted)[0];
				playerCollidable.entitiesAlreadyCollidedWith.push(entityForPlanetDeparted);
			}

			entities.push(playerEntity);
		}

		if (starsystem.factionName != null)
		{
			// enemy

			var damagerColor = Color.byName("Red");
			var enemyColor = damagerColor;
			var enemyPos = Coords.create().randomize(null).multiply(this.size);
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
				new Path(enemyColliderAsFace.vertices),
				enemyColor,
				null, // ?
				false // shouldUseEntityOrientation
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

			var enemyKill = (uwpe: UniverseWorldPlaceEntities) =>
			{
				var place = uwpe.place;
				var entity = uwpe.entity;

				place.entityRemove(entity);
				var starsystem = (place as PlaceStarsystem).starsystem;
				var shipGroup = ShipGroup.fromEntity(entity);
				ArrayHelper.remove(starsystem.shipGroups, shipGroup);
			}

			var enemyActivityDefnPerform = (uwpe: UniverseWorldPlaceEntities) => // activity
			{
				var place = uwpe.place;
				var actor = uwpe.entity;

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
					Collidable.fromCollider(enemyCollider),
					Drawable.fromVisual(enemyVisual),
					new Killable(1, null, enemyKill),
					new Locatable(enemyLoc),
					Movable.default(),
					new Actor
					(
						Activity.fromDefnNameAndTargetEntity
						(
							enemyActivityDefn.name, new Entity("Player", [])
						)
					),
				]
			);

			entities.push(enemyEntity);
		}

		this._camera = new Camera
		(
			new Coords(1, 1, 0).multiplyScalar(this.size.y),
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

	playerCollide(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlaceStarsystem;
		var entityPlayer = uwpe.entity;
		var entityOther = uwpe.entity2;

		var entityOtherName = entityOther.name;

		if (entityOtherName.startsWith("Enemy"))
		{
			var shipGroupOther = ShipGroup.fromEntity(entityOther);
			var encounter = new Encounter
			(
				ArrayHelper.random(place.starsystem.planets, universe.randomizer),
				shipGroupOther.factionName,
				entityPlayer,
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
				new Disposition
				(
					playerPosNext,
					playerLoc.orientation.clone(),
					Hyperspace.name
				)
			);
		}
		else if (entityOtherName.startsWith("Sun"))
		{
			// Do nothing.
		}
		else
		{
			var entityOtherPlanet = Planet.fromEntity(entityOther);
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
					world, planet, playerLocNext, place
				);
			}
		}
	}

	// Place overrides

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		display.drawBackground(Color.byName("Black"), Color.byName("Gray"));

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
