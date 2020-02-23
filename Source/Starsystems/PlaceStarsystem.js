
function PlaceStarsystem(world, starsystem, playerLoc)
{
	this.starsystem = starsystem;
	this.size = this.starsystem.sizeInner;

	this.actions =
	[
		Ship.actionShowMenu(),
		Ship.actionAccelerate(),
		Ship.actionTurnLeft(),
		Ship.actionTurnRight(),

	].addLookupsByName();

	this._actionToInputsMappings = Ship.actionToInputsMappings();

	// entities

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

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
			new Locatable( new Location(sunPos) ),
			new Collidable(sunCollider),
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

	var playerCollider = new Sphere(new Coords(0, 0, 0), entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualBody = ShipDefn.visual(entityDimension, playerColor);

	var playerVisual = new VisualGroup
	([
		playerVisualBody,
	]);

	var constraintSpeedMax = new Constraint_SpeedMax(1);
	//var constraintFriction = new Constraint("Friction", 0.3);
	var constraintTrimToRange = new Constraint_TrimToRange(this.size);

	var playerShipGroup = world.player.shipGroup;

	var playerEntity = new Entity
	(
		"Player",
		[
			new Locatable(playerLoc),
			new Constrainable([constraintSpeedMax, constraintTrimToRange]),
			new Collidable
			(
				playerCollider,
				[ Collidable.name ], // entityPropertyNamesToCollideWith
				this.playerCollide
			),
			new Drawable(playerVisual),
			new ItemHolder(),
			new Playable(),
			playerShipGroup,
			playerShipGroup.ships[0]
		]
	);

	entities.push(playerEntity);

	if (starsystem.factionName != null)
	{
		// enemy

		var damagerColor = "Red";
		var enemyColor = damagerColor;
		var enemyPos = this.size.clone().subtract(playerLoc.pos);
		var enemyLoc = new Location(enemyPos);

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

		var enemyKill = function(universe, world, place, entity)
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
				new Locatable(enemyLoc),
				new Constrainable([constraintSpeedMax]),
				new Collidable(enemyCollider),
				new Damager(),
				new Killable(1, enemyKill),
				new Drawable(enemyVisual),
				new Actor
				(
					function activity(universe, world, place, actor, entityToTargetName)
					{
						var target = place.entities[entityToTargetName];
						var actorLoc = actor.locatable.loc;

						actorLoc.vel.overwriteWith
						(
							target.locatable.loc.pos
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
		new Location
		(
			new Coords(0, 0, 0),
			Orientation.Instances().ForwardZDownY.clone()
		)
	);

	//var wallColor = "DarkViolet";
	var numberOfWalls = 4;
	var wallThickness = 5;

	for (var i = 0; i < numberOfWalls; i++)
	{
		var wallSize;
		if (i % 2 == 0)
		{
			wallSize = new Coords(this.size.x, wallThickness, 1);
		}
		else
		{
			wallSize = new Coords(wallThickness, this.size.y, 1);
		}

		var wallPos = wallSize.clone().half().clearZ();
		if (i >= 2)
		{
			wallPos.invert().add(this.size);
		}

		var wallLoc = new Location(wallPos);
		var wallCollider = 
			new Box(new Coords(0, 0, 0), wallSize);

		var wallEntity = new Entity
		(
			"Wall" + i,
			[
				new Locatable(wallLoc),
				new Collidable(wallCollider),
				//new Drawable(new VisualRectangle(wallSize, null, wallColor)) // todo
			]
		);

		entities.push(wallEntity);
	}

	var containerSidebar = new ControlContainer
	(
		"containerSidebar",
		new Coords(300, 0), // todo
		new Coords(100, 300), // size
		[ world.player.toControlSidebar(world) ]
	);
	this.venueControls = new VenueControls(containerSidebar);

	var size = new Coords(300, 300); // todo
	Place.call(this, PlaceStarsystem.name, PlaceStarsystem.name, size, entities);

	// Helper variables.

	this._drawLoc = new Location(new Coords());
}
{
	// superclass

	PlaceStarsystem.prototype = Object.create(Place.prototype);
	PlaceStarsystem.prototype.constructor = Place;

	// methods

	PlaceStarsystem.prototype.actionToInputsMappings = function()
	{
		return this._actionToInputsMappings;
	};

	PlaceStarsystem.prototype.playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;

		if (entityOtherName.startsWith("Enemy"))
		{
			var shipGroupOther = entityOther.shipGroup;
			var encounter = new Encounter
			(
				place.starsystem.planets.random(),
				shipGroupOther.factionName,
				shipGroupOther,
				place,
				entityPlayer.locatable.loc.pos
			);
			var placeEncounter = new PlaceEncounter(world, encounter);
			world.placeNext = placeEncounter;
		}
		else if (entityOtherName.startsWith("Wall"))
		{
			var hyperspace = world.hyperspace;
			var playerLoc = entityPlayer.locatable.loc;
			var playerPosNext = place.starsystem.posInHyperspace.clone();
			world.placeNext = new PlaceHyperspace
			(
				universe,
				hyperspace,
				place.starsystem, // starsystemDeparted
				new Location(playerPosNext, playerLoc.orientation.clone())
			);
		}
		else if (entityOtherName.startsWith("Sun"))
		{
			// Do nothing.
		}
		else
		{
			if (entityOther.planet != null)
			{
				var planet = entityOther.planet;
				var sizeNext = place.size.clone();
				var playerOrientation = entityPlayer.locatable.loc.orientation;
				var heading = playerOrientation.headingInTurns();
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
				var playerLocNext = new Location(playerPosNext, playerOrientation);
				world.placeNext = new PlacePlanetVicinity
				(
					world, sizeNext, planet, playerLocNext, place
				);
			}
		}
	}

	// Place overrides

	PlaceStarsystem.prototype.draw_FromSuperclass = PlaceStarsystem.prototype.draw;
	PlaceStarsystem.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "Black");

		var drawLoc = this._drawLoc;
		var drawPos = drawLoc.pos;

		var player = this.entities["Player"];
		if (player == null)
		{
			return; // hack
		}
		var playerLoc = player.locatable.loc;

		var camera = this._camera;
		camera.loc.pos.overwriteWith
		(
			playerLoc.pos
		).trimToRangeMinMax
		(
			camera.viewSizeHalf,
			this.size.clone().subtract(camera.viewSizeHalf)
		);

		this.draw_FromSuperclass(universe, world);

		this.venueControls.draw(universe, world);
	}
}
