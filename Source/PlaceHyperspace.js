
function PlaceHyperspace(hyperspace)
{
	this.hyperspace = hyperspace;
	this.size = this.hyperspace.size;

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

	this.camera = new Camera
	(
		new Coords(400, 300), // hack
		null, // focalLength
		new Location
		(
			new Coords(0, 0, 0),
			Orientation.Instances.ForwardZDownY.clone()
		)
	);

	// entities

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

	// stars

	var starsystems = this.hyperspace.starsystems;
	var numberOfStars = starsystems.length;
	var starColor = "Yellow"; // todo
	var starRadius = entityDimension / 2;
	var starVisualPath = new PathBuilder().star(5, .5).transform
	(
		new Transform_Scale
		(
			new Coords(1, 1, 1).multiplyScalar(starRadius)
		)
	);
	var starVisual = new VisualCamera
	(
		new VisualPolygon(starVisualPath, starColor),
		this.camera
	);

	for (var i = 0; i < numberOfStars; i++)
	{
		var starsystem = starsystems[i];
		var starPos = starsystem.pos;

		var starCollider = new Sphere(starPos, starRadius);

		var starEntity = new Entity
		(
			"Star" + i,
			[
				new Modellable(starsystem),
				new Locatable( new Location(starPos) ),
				new Collidable(starCollider),
				new Drawable(starVisual)
			]
		);

		entities.push(starEntity);
	}

	// player

	var playerPos = this.size.clone().half(); // todo
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

	var playerVisual = new VisualCamera
	(
		new VisualGroup
		([
			playerVisualBody,
			playerVisualMovementIndicator,
		]),
		this.camera
	);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;
		if (entityOtherName.startsWith("Star"))
		{
			world.placeNext = new PlaceStarsystem(entityOther.modellable.model);
		}
	}

	var constraintSpeedMax = new Constraint("SpeedMax", 4);
	var constraintFriction = new Constraint("Friction", 0.03); 
	var constraintTrimToRange = new Constraint("TrimToRange", this.size);

	var playerEntity = new Entity
	(
		"Player",
		[
			new Locatable(playerLoc),
			new Constrainable
			([
				constraintSpeedMax, constraintFriction, constraintTrimToRange
			]),
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

	Place.call(this, entities);

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
}
{
	PlaceHyperspace.prototype = Object.create(Place.prototype);
	PlaceHyperspace.prototype.constructor = Place;

	PlaceHyperspace.prototype.draw_FromSuperclass = PlaceHyperspace.prototype.draw;
	PlaceHyperspace.prototype.draw = function(universe, world)
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

	PlaceHyperspace.prototype.entityAccelerateInDirection = function
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
