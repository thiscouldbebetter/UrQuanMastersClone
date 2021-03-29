
class PlaceStarsystem extends Place
{
	constructor(world, starsystem, playerLoc, planetDeparted)
	{
		super(PlaceStarsystem.name, PlaceStarsystem.name, new Coords(300, 300), []);

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
		var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

		var entities = this.entitiesToSpawn;

		// sun

		var sizeHalf = this.size.clone().half();

		var sunRadius = entityDimension * 1.5;
		var sunPos = sizeHalf.clone();
		var sunColor = starsystem.starColor;
		var sunVisual = new VisualCircle(sunRadius, sunColor);
		var sunCollider = new Sphere(new Coords(0, 0, 0), sunRadius);

		var sunEntity = new Entity
		(
			"Sun",
			[
				new Locatable( new Disposition(sunPos) ),
				new Collidable(null, sunCollider, [ Collidable.name ], null),
				new Drawable(sunVisual)
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
		var playerActivity = new Activity(playerActivityDefnName);
		var playerCollider = new Sphere(new Coords(0, 0, 0), entityDimension / 2);
		var playerColor = Color.byName("Gray");

		var playerVisualBody = ShipDefn.visual(entityDimension, playerColor);

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
				new Drawable(playerVisual),
				new ItemHolder(),
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
			var enemyLoc = new Disposition(enemyPos);

			var enemyColliderAsFace = new Face
			([
				new Coords(0, -entityDimension).half(),
				new Coords(entityDimension, entityDimension).half(),
				new Coords(-entityDimension, entityDimension).half(),
			]);

			var enemyCollider = Mesh.fromFace
			(
				new Coords(0, 0, 0), // center
				enemyColliderAsFace,
				1 // thickness
			);

			var enemyVisual = new VisualPolygon
			(
				new Path(enemyColliderAsFace.vertices), enemyColor
			);

			var enemyShipDefnName = "Flagship"; // todo
			var enemyShip = new Ship(enemyShipDefnName);
			var enemyShipGroup = new ShipGroup
			(
				"Enemy",
				"Enemy", // factionName
				[ enemyShip ]
			);

			var enemyKill = (universe, world, place, entity) =>
			{
				place.entityRemove(entity);
				var starsystem = place.starsystem;
				var shipGroup = entity.shipGroup;
				starsystem.shipGroups.remove(shipGroup);
			}

			var enemyEntity = new Entity
			(
				"Enemy",
				[
					enemyShipGroup,
					new Constrainable([constraintSpeedMax]),
					CollidableHelper.fromCollider(enemyCollider),
					new Damager(),
					new Drawable(enemyVisual),
					new Killable(1, enemyKill),
					new Locatable(enemyLoc),
					Movable.create(),
					new Actor
					(
						(universe, world, place, actor, entityToTargetName) => // activity
						{
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
						},
						"Player"
					),
				]
			);

			entities.push(enemyEntity);
		}

		this._camera = new Camera
		(
			new Coords(1, 1).multiplyScalar(this.size.y),
			null, // focalLength
			new Disposition
			(
				new Coords(0, 0, 0),
				Orientation.Instances().ForwardZDownY.clone()
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

		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			new Coords(300, 0), // todo
			new Coords(100, 300), // size
			[ world.player.toControlSidebar(world) ]
		);
		this.venueControls = new VenueControls(containerSidebar);

		// Helper variables.

		this._drawLoc = new Disposition(new Coords());
	}

	// methods

	actionToInputsMappings()
	{
		return this._actionToInputsMappings;
	}

	playerCollide(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;

		if (entityOtherName.startsWith("Enemy"))
		{
			var shipGroupOther = EntityExtensions.shipGroup(entityOther);
			var encounter = new Encounter
			(
				ArrayHelper.random(place.starsystem.planets),
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
				new Disposition(playerPosNext, playerLoc.orientation.clone())
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
					heading + .5, .4 * sizeNext.y
				).wrap().toCoords
				(
					new Coords()
				).add
				(
					sizeNext.clone().half()
				);
				var playerLocNext = new Disposition(playerPosNext, playerOrientation);
				world.placeNext = new PlacePlanetVicinity
				(
					world, sizeNext, planet, playerLocNext, place
				);
			}
		}
	}

	// Place overrides

	draw(universe, world)
	{
		var display = universe.display;

		display.drawBackground(Color.byName("Gray"), Color.byName("Black"));

		var drawLoc = this._drawLoc;
		var drawPos = drawLoc.pos;

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

		this.venueControls.draw(universe, world);
	}
}
