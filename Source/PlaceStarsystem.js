
function PlaceStarsystem(world, starsystem, playerPos)
{
	this.starsystem = starsystem;
	this.size = this.starsystem.sizeInner;

	this.actions =
	[
		Ship.actionShowMenu(),
		Ship.actionAccelerate(),
		Ship.actionTurnLeft(),
		Ship.actionTurnRight(),

	].addLookups("name");

	this.inputToActionMappings = Ship.inputToActionMappings();

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
	var sunCollider = new Sphere(sunPos, sunRadius);

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

	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualBody = Ship.visual(entityDimension, playerColor);

	var playerVisual = new VisualGroup
	([
		playerVisualBody,
	]);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;

		if (entityOtherName.startsWith("Enemy"))
		{
			var shipGroupOther = entityOther.modellable.model;
			var encounter = new Encounter(shipGroupOther, place, entityPlayer.locatable.loc.pos);
			var placeEncounter = new PlaceEncounter(world, encounter);
			world.placeNext = placeEncounter;
		}
		else if (entityOtherName.startsWith("Wall"))
		{
			var hyperspace = world.hyperspace;
			world.placeNext = new PlaceHyperspace
			(
				world,
				hyperspace,
				place.starsystem.posInHyperspace.clone().add
				(
					new Coords(2, 0).multiplyScalar(hyperspace.starsystemRadiusOuter)
				)
			);
		}
		else if (entityOtherName.startsWith("Sun"))
		{
			// Do nothing.
		}
		else
		{
			var entityOtherModel = entityOther.modellable.model;
			var entityOtherModelTypeName = entityOtherModel.constructor.name;

			if (entityOtherModelTypeName == "Planet")
			{
				var planet = entityOther.modellable.model;
				var sizeNext = place.size.clone();
				var heading = entityPlayer.locatable.loc.orientation.headingInTurns();
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
				world.placeNext = new PlacePlanetVicinity
				(
					world, sizeNext, planet, playerPosNext, place
				);
			}
		}
	}

	var constraintSpeedMax = new Constraint("SpeedMax", 1);
	//var constraintFriction = new Constraint("Friction", 0.3);
	var constraintTrimToRange = new Constraint("TrimToRange", this.size);

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
				[ "collidable" ], // entityPropertyNamesToCollideWith
				playerCollide
			),
			new Drawable(playerVisual),
			new ItemHolder(),
			new Playable(),
			new Modellable(playerShipGroup),
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
			enemyPos, // center
			enemyColliderAsFace,
			1 // thickness
		);

		var enemyVisual = new VisualPolygon
		(
			new Path(enemyColliderAsFace.vertices), enemyColor
		);

		var enemyShipDefnName = "Default";
		var enemyShip = new Ship(enemyShipDefnName);
		var enemyShipGroup = new ShipGroup
		(
			"Enemy",
			"Enemy", // factionName
			[ enemyShip ]
		);

		var enemyEntity = new Entity
		(
			"Enemy",
			[
				new Modellable(enemyShipGroup),
				new Locatable(enemyLoc),
				new Constrainable([constraintSpeedMax]),
				new Collidable(enemyCollider),
				new Damager(),
				new Killable(),
				new Drawable(enemyVisual),
				new Actor
				(
					function activity(universe, world, place, actor)
					{
						var entityToTargetName = "Player";
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
					}
				),
			]
		);

		entities.push(enemyEntity);
	}

	this.camera = new Camera
	(
		new Coords(1, 1).multiplyScalar(this.size.y),
		null, // focalLength
		new Location
		(
			new Coords(0, 0, 0),
			Orientation.Instances.ForwardZDownY.clone()
		)
	);

	var wallColor = "DarkViolet";
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
		var wallCollider = new Bounds(wallPos, wallSize);

		var wallEntity = new Entity
		(
			"Wall" + i,
			[
				new Locatable(wallLoc),
				new Collidable(wallCollider),
			]
		);

		entities.push(wallEntity);
	}

	var containerSidebarSize = new Coords(100, 300); // hack

	var containerSidebar = new ControlContainer
	(
		"containerSidebar",
		new Coords(this.starsystem.sizeInner.x, 0), // pos
		containerSidebarSize,
		// children
		[
			// todo
		]
	);

	this.venueControls = new VenueControls(containerSidebar);

	Place.call(this, entities);

	// Helper variables.

	this._drawLoc = new Location(new Coords());
}
{
	PlaceStarsystem.prototype = Object.create(Place.prototype);
	PlaceStarsystem.prototype.constructor = Place;

	PlaceStarsystem.prototype.draw_FromSuperclass = PlaceStarsystem.prototype.draw;
	PlaceStarsystem.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "Black");

		var drawLoc = this._drawLoc;
		var drawPos = drawLoc.pos;

		var player = this.entities["Player"];
		var playerLoc = player.locatable.loc;

		var camera = this.camera;
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
