
class PlaceStarsystem extends PlaceBase
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
		this._size = this.starsystem.sizeInner;

		this.actions =
		[
			Ship.actionShowMenu(),
			Ship.actionAccelerate(),
			Ship.actionTurnLeft(),
			Ship.actionTurnRight(),

		];//.addLookupsByName();

		this._actionToInputsMappings = Ship.actionToInputsMappings();

		// entities

		var entities = this.entitiesToSpawn;

		entities.push(new GameClock(2880).toEntity());

		var entityDimension = 10;

		// sun

		var sunEntity = this.sunEntityBuild(entityDimension);
		var sunPos = sunEntity.locatable().loc.pos;

		entities.push(sunEntity);

		// planets

		var planets = starsystem.planets;
		for (var i = 0; i < planets.length; i++)
		{
			var planet = planets[i];
			var planetEntity = planet.toEntity(world, null, sunPos);
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

			if (planetDeparted != null)
			{
				var entityForPlanetDeparted =
					entities.find(x => Planet.fromEntity(x) == planetDeparted);
				playerCollidable.entityAlreadyCollidedWithAddIfNotPresent(entityForPlanetDeparted);
			}

			entities.push(playerEntity);
		}

		var faction = starsystem.faction(world);
		if (faction != null)
		{
			var shipDefnName = faction.shipDefnName;
			var ship = new Ship(shipDefnName);

			var shipGroup = new ShipGroup
			(
				faction.name + " " + ShipGroup.name,
				faction.name, // factionName
				Coords.create(),
				[ ship ]
			);

			this.starsystem.shipGroups.push(shipGroup);
		}

		var entitiesForShipGroups =
			this.starsystem.shipGroups.map(x => x.toEntity(world, this) );

		entities.push(...entitiesForShipGroups);

		this._camera = new Camera
		(
			new Coords(1, 1, 0).multiplyScalar(this.size().y),
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
					Disposition.fromPos(this.size().clone().half() )
				),
				Collidable.fromCollider
				(
					new ShapeInverse
					(
						new Box(Coords.create(), this.size() )
					)
				)
			]
		);
		entities.push(wallsEntity);

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

	// Constructor helpers.

	sunEntityBuild(entityDimension: number): Entity
	{
		var sizeHalf = this.size().clone().half();

		var sunPos = sizeHalf.clone();
		var sunLocatable = new Locatable(Disposition.fromPos(sunPos) );

		var sunRadius = entityDimension * 1.5;

		var sunCollider = new Sphere(Coords.create(), sunRadius);
		var sunCollidable = new Collidable
		(
			false, // canCollideAgainWithoutSeparating
			null, sunCollider, [ Collidable.name ], null
		);

		var sunColor = this.starsystem.starColor;
		var colorWhite = Color.Instances().White;
		var sunVisual =
			//VisualCircle.fromRadiusAndColorFill(sunRadius, sunColor);
			new VisualCircleGradient
			(
				sunRadius,
				new ValueBreakGroup
				(
					[
						new ValueBreak(0, colorWhite),
						new ValueBreak(.5, colorWhite),
						new ValueBreak(1, sunColor)
					],
					null // interpolationMode
				),
				null, // colorBorder
			);
		var sunDrawable = Drawable.fromVisual(sunVisual);

		var sunEntity = new Entity
		(
			"Sun",
			[
				sunLocatable,
				sunCollidable,
				sunDrawable
			]
		);

		return sunEntity;
	}


	// Instance methods.

	actionToInputsMappings(): ActionToInputsMapping[]
	{
		return this._actionToInputsMappings;
	}

	playerCollide(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlaceStarsystem;

		if (uwpe.entity2.name == Player.name)
		{
			uwpe.entitiesSwap();
		}

		var entityPlayer = uwpe.entity;
		var entityOther = uwpe.entity2;

		var entityOtherName = entityOther.name;

		if (entityOtherName.startsWith("Wall"))
		{
			var hyperspace = world.hyperspace;
			var playerLoc = entityPlayer.locatable().loc;
			var playerPosNext = place.starsystem.posInHyperspace.clone();
			var playerDisposition = new Disposition
			(
				playerPosNext,
				playerLoc.orientation.clone(),
				Hyperspace.name
			);

			var placeHyperspace = new PlaceHyperspace
			(
				universe,
				hyperspace,
				place.starsystem, // starsystemDeparted
				playerDisposition
			);
			world.placeNextSet(placeHyperspace);
		}
		else if (entityOtherName.startsWith("Sun"))
		{
			// Do nothing.
		}
		else
		{
			var entityOtherPlanet = Planet.fromEntity(entityOther);
			var entityOtherShipGroup = ShipGroup.fromEntity(entityOther);

			if (entityOtherPlanet != null)
			{
				entityPlayer.collidable().entityAlreadyCollidedWithAddIfNotPresent(entityOther);

				var planet = entityOtherPlanet;
				var sizeNext = place.size().clone();
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
				var placePlanetVicinity = new PlacePlanetVicinity
				(
					world, planet, playerLocNext, place
				);
				world.placeNextSet(placePlanetVicinity);
			}
			else if (entityOtherShipGroup != null)
			{
				entityOther.collidable().ticksUntilCanCollide = 100; // hack
				var shipGroup = entityOtherShipGroup;
				var playerPos = entityPlayer.locatable().loc.pos;
				var encounter = new Encounter
				(
					place.starsystem.planetClosestTo(playerPos),
					shipGroup.factionName,
					entityPlayer,
					entityOther,
					place,
					playerPos
				);
				var placeEncounter = encounter.toPlace();
				world.placeNextSet(placeEncounter);
			}
		}
	}

	// Place overrides

	draw(universe: Universe, world: World): void
	{
		var display = universe.display;

		var colors = Color.Instances();
		display.drawBackground(colors.Black, colors.Gray);

		var player = this.entityByName(Player.name);
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
			this.size().clone().subtract(camera.viewSizeHalf)
		);

		super.draw(universe, world, universe.display);

		this.venueControls.draw(universe);
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var soundHelper = universe.soundHelper;
		soundHelper.soundWithNamePlayAsMusic(universe, "Music_Starsystem");
	}
}
