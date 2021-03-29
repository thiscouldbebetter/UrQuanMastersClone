
class PlacePlanetVicinity extends Place
{
	constructor(world, size, planet, playerLoc, placeStarsystem)
	{
		super(PlacePlanetVicinity.name, PlacePlanetVicinity.name, new Coords(300, 300), []);

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
		var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

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
			new VisualCircle(planetOrbitRadius, null, Color.byName("Gray") ),
			planetPos.clone().add
			(
				new Polar
				(
					planet.posAsPolar.azimuthInTurns + .5,
					planetOrbitRadius
				).wrap().toCoords(new Coords())
			) // posToAnchorAt
		);

		var planetVisual = new VisualGroup
		([
			planetOrbitVisual,
			new VisualCircle(planetRadius, planetColor),
		]);
		var planetCollider = new Sphere(new Coords(0, 0, 0), planetRadius);

		var planetEntity = new Entity
		(
			"Planet",
			[
				CollidableHelper.fromCollider(planetCollider),
				new Drawable(planetVisual),
				new Locatable( new Disposition(planetPos) ),
				planet
			]
		);

		entities.push(planetEntity);

		// satellites

		var orbitColor = "LightGray";
		var satellites = planet.satellites;
		var numberOfMoons = satellites.length;
		for (var i = 0; i < satellites.length; i++)
		{
			var satellite = satellites[i];

			var satelliteEntity = satellite.toEntity(planetPos);

			entities.push(satelliteEntity);
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

		var playerCollide = (universe, world, place, entityPlayer, entityOther) =>
		{
			var entityOtherName = entityOther.name;

			if (entityOtherName.startsWith("Wall"))
			{
				var planet = place.planet;
				var placeStarsystem = place.placeStarsystem;
				var starsystem = placeStarsystem.starsystem;
				var posNext = planet.posAsPolar.toCoords(new Coords()).add
				(
					starsystem.sizeInner.clone().half()
				);/*.add
				(
					new Coords(3, 0).multiplyScalar(planet.radiusOuter)
				);*/
				var dispositionNext =
					new Disposition(posNext, entityPlayer.locatable().loc.orientation.clone());
				//entityPlayer.collidable().entitiesAlreadyCollidedWith.push(entityOther); // Doesn't work.
				world.placeNext = new PlaceStarsystem
				(
					world, starsystem, dispositionNext, planet
				);
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
					world.placeNext = new PlacePlanetOrbit(world, entityOtherPlanet, place);
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
				new Drawable(playerVisual),
				new ItemHolder(),
				new Locatable(playerLoc),
				Movable.create(),
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

			var enemyKill = (universe, world, place, entity) =>
			{
				place.entityRemove(entity);
				var planet = place.planet;
				var shipGroup = entity.shipGroup;
				planet.shipGroups.remove(shipGroup);
			}

			var enemyEntity = new Entity
			(
				"Enemy" + i,
				[
					new Actor(faction.shipGroupActivity),
					CollidableHelper.fromCollider(enemyCollider),
					new Constrainable([constraintSpeedMax]),
					new Damager(),
					new Drawable(enemyVisual),
					new Killable(1, enemyKill),
					new Locatable(enemyLoc),
					Movable.create(),
					new Talker("todo"),
					shipGroup,
				]
			);

			entities.push(enemyEntity);
		}

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

		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			new Coords(300, 0), // todo
			new Coords(100, 300), // size
			[ world.player.toControlSidebar(world) ]
		)
		this.venueControls = new VenueControls(containerSidebar);

		// Helper variables.

		this.drawPos = new Coords();
		this.drawLoc = new Disposition(this.drawPos);
	}

	// methods

	actionToInputsMappings()
	{
		return this._actionToInputsMappings;
	}

	draw(universe, world)
	{
		var display = universe.display;

		display.drawBackground(Color.byName("Gray"), Color.byName("Black"));

		var drawLoc = this.drawLoc;
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

		this.venueControls.draw(universe, world);
	}
}
