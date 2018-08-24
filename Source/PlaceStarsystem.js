
function PlaceStarsystem(starsystem)
{
	this.starsystem = starsystem;
	this.size = this.starsystem.size;

	this.actions =
	[
		Action.Instances.DoNothing,
		new Action
		(
			"ShowMenu",
			function perform(universe, world, place, actor)
			{
				var venueNext = new VenueControls
				(
					universe.controlBuilder.configure(universe)
				);
				venueNext = new VenueFader(venueNext, universe.venueCurrent);
				universe.venueNext = venueNext;
			}
		),
		new Action
		(
			"MoveDown",
			function perform(universe, world, place, actor)
			{
				place.entityAccelerateInDirection
				(
					world, actor, Coords.Instances.ZeroOneZero
				);
			}
		),
		new Action
		(
			"MoveLeft",
			function perform(universe, world, place, actor)
			{
				place.entityAccelerateInDirection
				(
					world, actor, Coords.Instances.MinusOneZeroZero
				);
			}
		),
		new Action
		(
			"MoveRight",
			function perform(universe, world, place, actor)
			{
				place.entityAccelerateInDirection
				(
					world, actor, Coords.Instances.OneZeroZero
				);
			}
		),
		new Action
		(
			"MoveUp",
			function perform(universe, world, place, actor)
			{
				place.entityAccelerateInDirection
				(
					world, actor, Coords.Instances.ZeroMinusOneZero
				);
			}
		),
	].addLookups("name");

	this.inputToActionMappings =
	[
		new InputToActionMapping("Escape", "ShowMenu"),

		new InputToActionMapping("ArrowDown", "MoveDown"),
		new InputToActionMapping("ArrowLeft", "MoveLeft"),
		new InputToActionMapping("ArrowRight", "MoveRight"),
		new InputToActionMapping("ArrowUp", "MoveUp"),

		new InputToActionMapping("Gamepad0Down", "MoveDown"),
		new InputToActionMapping("Gamepad0Left", "MoveLeft"),
		new InputToActionMapping("Gamepad0Right", "MoveRight"),
		new InputToActionMapping("Gamepad0Up", "MoveUp"),

	].addLookups("inputName");

	// entities

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

	// sun

	var sizeHalf = this.size.clone().half();

	var sunRadius = entityDimension;
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
	var numberOfPlanets = planets.length;
	var orbitColor = "LightGray";
	var planetRadius = entityDimension / 2;

	for (var i = 0; i < numberOfPlanets; i++)
	{
		var planet = planets[i];
		var planetColor = planet.color;
		var planetPosAsPolar = planet.posAsPolar;

		var planetPos = sunPos.clone().add
		(
			planetPosAsPolar.toCoords(new Coords())
		);

		var planetVisual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle(planetPosAsPolar.radius, null, orbitColor),
				sunPos
			),
			new VisualCircle(planetRadius, planetColor)
		]);

		var planetCollider = new Sphere(planetPos, planetRadius);

		var planetEntity = new Entity
		(
			"Planet" + i,
			[
				new Modellable(planet),
				new Locatable( new Location(planetPos) ),
				new Collidable(planetCollider),
				new Drawable(planetVisual)
			]
		);

		entities.push(planetEntity);
	}

	// player

	var playerPos = new Coords(.5, .9).multiply(this.size);
	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualPath = new Path
	([
		new Coords(1, 0).multiplyScalar(entityDimension).half(),
		new Coords(-1, .8).multiplyScalar(entityDimension).half(),
		new Coords(-1, -.8).multiplyScalar(entityDimension).half(),
	]);

	var playerVisualBody = new VisualDirectional
	(
		new VisualPolygon(playerVisualPath, playerColor),
		[
			new VisualPolygon(playerVisualPath.clone(), playerColor),
			new VisualPolygon(playerVisualPath.clone().transform(new Transform_RotateRight(1)), playerColor),
			new VisualPolygon(playerVisualPath.clone().transform(new Transform_RotateRight(2)), playerColor),
			new VisualPolygon(playerVisualPath.clone().transform(new Transform_RotateRight(3)), playerColor),
		]
	);

	var exhaustColor = "Red";
	var visualExhaust = new VisualRectangle
	(
		entitySize.clone().divideScalar(4), exhaustColor
	);

	var playerVisualMovementIndicator = new VisualDirectional
	(
		new VisualNone(),
		[
			new VisualAnimation
			(
				5, // ticksPerFrame
				[
					new VisualOffset(visualExhaust, new Coords(-1, 0).multiplyScalar(entityDimension)),
					new VisualOffset(visualExhaust, new Coords(-1.5, 0).multiplyScalar(entityDimension)),
					new VisualOffset(visualExhaust, new Coords(-2, 0).multiplyScalar(entityDimension)),
				]
			),
			new VisualAnimation
			(
				5, // ticksPerFrame
				[
					new VisualOffset(visualExhaust, new Coords(0, -1).multiplyScalar(entityDimension)),
					new VisualOffset(visualExhaust, new Coords(0, -1.5).multiplyScalar(entityDimension)),
					new VisualOffset(visualExhaust, new Coords(0, -2).multiplyScalar(entityDimension)),
				]
			),
			new VisualAnimation
			(
				5, // ticksPerFrame
				[
					new VisualOffset(visualExhaust, new Coords(1, 0).multiplyScalar(entityDimension)),
					new VisualOffset(visualExhaust, new Coords(1.5, 0).multiplyScalar(entityDimension)),
					new VisualOffset(visualExhaust, new Coords(2, 0).multiplyScalar(entityDimension)),
				]
			),
			new VisualAnimation
			(
				5, // ticksPerFrame
				[
					new VisualOffset(visualExhaust, new Coords(0, 1).multiplyScalar(entityDimension)),
					new VisualOffset(visualExhaust, new Coords(0, 1.5).multiplyScalar(entityDimension)),
					new VisualOffset(visualExhaust, new Coords(0, 2).multiplyScalar(entityDimension)),
				]
			),
		]
	);

	var playerVisual = new VisualGroup
	([
		playerVisualBody,
		playerVisualMovementIndicator,
	]);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;
		if (entityOtherName.startsWith("Enemy"))
		{
			world.placeNext = new PlaceCombat(place.size.clone());
		}
		else if (entityOtherName.startsWith("Planet"))
		{
			var planet = entityOther.modellable.model;
			world.placeNext = new PlacePlanetVicinity(place.size.clone(), planet);
		}
		else if (entityOtherName.startsWith("Wall"))
		{
			world.placeNext = new PlaceHyperspace(world.hyperspace);
		}
	}

	var constraintSpeedMax = new Constraint("SpeedMax", 1);
	//var constraintFriction = new Constraint("Friction", 0.3); 
	var constraintWrapToRange = new Constraint("WrapToRange", this.size);

	var playerEntity = new Entity
	(
		"Player",
		[
			new Locatable(playerLoc),
			new Constrainable([constraintSpeedMax, constraintWrapToRange]),
			new Collidable
			(
				playerCollider,
				[ "collidable" ], // entityPropertyNamesToCollideWith
				playerCollide
			),
			new Drawable(playerVisual),
			new ItemHolder(),
			new Playable(),
		]
	);

	entities.push(playerEntity);

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

	var enemyEntity = new Entity
	(
		"Enemy",
		[
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
					).normalize();
				}
			),
		]
	);

	entities.push(enemyEntity);

	this.camera = new Camera
	(
		this.size.clone(),
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
		var wallVisual = new VisualRectangle(wallSize, wallColor);

		var wallEntity = new Entity
		(
			"Wall" + i,
			[
				new Locatable(wallLoc),
				new Collidable(wallCollider),
				new Drawable(wallVisual)
			]
		);

		entities.push(wallEntity);
	}

	Place.call(this, entities);

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
}
{
	PlaceStarsystem.prototype = Object.create(Place.prototype);
	PlaceStarsystem.prototype.constructor = Place;

	PlaceStarsystem.prototype.draw_FromSuperclass = PlaceStarsystem.prototype.draw;
	PlaceStarsystem.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "Black");

		var drawLoc = this.drawLoc;
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
	}

	PlaceStarsystem.prototype.entityAccelerateInDirection = function
	(
		world, entity, directionToMove
	)
	{
		var entityLoc = entity.locatable.loc;

		entityLoc.orientation.forwardSet(directionToMove);
		var vel = entityLoc.vel;
		var accelerationPerTick = .03; // hack
		if (vel.equals(directionToMove) == false)
		{
			entityLoc.timeOffsetInTicks = world.timerTicksSoFar;
		}
		entityLoc.accel.overwriteWith(directionToMove).multiplyScalar
		(
			accelerationPerTick
		);
	}
}
