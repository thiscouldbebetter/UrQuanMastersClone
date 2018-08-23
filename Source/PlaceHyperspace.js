
function PlaceHyperspace(size)
{
	this.size = size;

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
		new Action
		(
			"Fire",
			function perform(universe, world, place, actor)
			{
				var itemWeapon = new Item("Weapon", 1);
				var actorHasWeapon = actor.itemHolder.hasItems(itemWeapon);

				if (actorHasWeapon == false) { return; }

				var actorLoc = actor.locatable.loc;
				var actorPos = actorLoc.pos;
				var actorVel = actorLoc.vel;
				var actorSpeed = actorVel.magnitude();
				if (actorSpeed == 0) { return; }

				var itemProjectileColor = "Cyan";
				var itemProjectileRadius = 3;
				var itemProjectileVisual = new VisualGroup
				([
					new VisualCircle(itemProjectileRadius, itemProjectileColor),
					new VisualOffset
					(
						new VisualText("Projectile", itemProjectileColor),
						new Coords(0, itemProjectileRadius)
					)
				]);

				var actorDirection = actorVel.clone().normalize();
				var actorRadius = actor.collidable.collider.radius;
				var itemProjectilePos = actorPos.clone().add
				(
					actorDirection.clone().multiplyScalar(actorRadius).double().double()
				); 
				var itemProjectileLoc = new Location(itemProjectilePos);
				itemProjectileLoc.vel.overwriteWith(actorVel).double();

				var itemProjectileCollider = 
					new Sphere(itemProjectilePos, itemProjectileRadius);

				var itemProjectileCollide = function(universe, world, place, entityPlayer, entityOther)
				{
					if (entityOther.killable != null)
					{
						place.entitiesToRemove.push(entityOther);
					}
				}

				var itemProjectileEntity = new Entity
				(
					"Projectile",
					[
						new Damager(),
						new Ephemeral(32),
						new Locatable( itemProjectileLoc ),
						new Collidable
						(
							itemProjectileCollider, 
							[ "killable" ],
							itemProjectileCollide
						),
						new Drawable(itemProjectileVisual)
					]
				);

				place.entitiesToSpawn.push(itemProjectileEntity);
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
		new InputToActionMapping("Enter", "Fire"),

		new InputToActionMapping("Gamepad0Down", "MoveDown"),
		new InputToActionMapping("Gamepad0Left", "MoveLeft"),
		new InputToActionMapping("Gamepad0Right", "MoveRight"),
		new InputToActionMapping("Gamepad0Up", "MoveUp"),
		new InputToActionMapping("Gamepad0Button0", "Fire"),

	].addLookups("inputName");

	// entities

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

	// stars

	var numberOfStars = 8;
	var starColor = "Yellow";
	var starRadius = entityDimension / 2;
	var starVisualPath = new PathBuilder().star(5, .5).transform
	(
		new Transform_Scale
		(
			new Coords(1, 1, 1).multiplyScalar(starRadius)
		)
	);
	var starVisual = new VisualPolygon(starVisualPath, starColor);

	for (var i = 0; i < numberOfStars; i++)
	{
		var starPos = new Coords().randomize().multiply(this.size);

		var starCollider = new Sphere(starPos, starRadius);

		var starEntity = new Entity
		(
			"Star" + i,
			[
				new Locatable( new Location(starPos) ),
				new Collidable(starCollider),
				new Drawable(starVisual)
			]
		);

		entities.push(starEntity);
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
		if (entityOtherName.startsWith("Star"))
		{
			world.placeNext = new PlaceStarsystem(place.size.clone());
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
