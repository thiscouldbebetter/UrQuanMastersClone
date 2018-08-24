
function PlacePlanetSurface(planet)
{
	this.planet = planet;
	this.size = this.planet.size;

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
			"Exit",
			function perform(universe, world, place, actor)
			{
				world.placeNext = new PlacePlanetVicinity(place.size.clone(), place.planet);
			}
		),
		new Action
		(
			"Fire",
			function perform(universe, world, place, actor)
			{
				var itemWeapon = new Item("Weapon", 1);
				var actorHasWeapon = actor.itemHolder.hasItems(itemWeapon);

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
		new InputToActionMapping("_x", "Exit"),

		new InputToActionMapping("Gamepad0Down", "MoveDown"),
		new InputToActionMapping("Gamepad0Left", "MoveLeft"),
		new InputToActionMapping("Gamepad0Right", "MoveRight"),
		new InputToActionMapping("Gamepad0Up", "MoveUp"),
		new InputToActionMapping("Gamepad0Button0", "Fire"),
		new InputToActionMapping("Gamepad0Button1", "Exit"),

	].addLookups("inputName");

	// entities

	var entityDimension = 10;
	var entitySize = new Coords(1, 1, 1).multiplyScalar(entityDimension);

	var entities = [];

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

	var playerVisual = new VisualGroup
	([
		playerVisualBody,
		playerVisualMovementIndicator,
	]);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		// todo
	}

	var constraintSpeedMax = new Constraint("SpeedMax", 3);
	var constraintFriction = new Constraint("Friction", 0.3); 
	var constraintWrapToRange = new Constraint("WrapToRange", this.size);

	var playerEntity = new Entity
	(
		"Player",
		[
			new Locatable(playerLoc),
			new Constrainable([constraintFriction, constraintSpeedMax, constraintWrapToRange]),
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

	var lifeformActivity = function(universe, world, place, actor)
	{
		var actorLoc = actor.locatable.loc;
		actorLoc.vel.randomize().double().subtract(Coords.Instances.Ones);
	}

	var lifeformColor = "Green";
	var numberOfLifeforms = 8;

	for (var i = 0; i < numberOfLifeforms; i++)
	{
		var lifeformPos = new Coords().randomize().multiply(this.size);
		var lifeformLoc = new Location(lifeformPos);

		var lifeformColliderAsFace = new Face
		([
			new Coords(-entityDimension / 2, -entityDimension).half(),
			new Coords(entityDimension / 2, -entityDimension).half(),
			new Coords(entityDimension, entityDimension).half(),
			new Coords(-entityDimension, entityDimension).half(),
		]);

		var lifeformCollider = Mesh.fromFace
		(
			lifeformPos, // center
			lifeformColliderAsFace,
			1 // thickness
		);

		var lifeformVisual = new VisualPolygon
		(
			new Path(lifeformColliderAsFace.vertices), lifeformColor
		);

		var lifeformEntity = new Entity
		(
			"Lifeform",
			[
				new Locatable(lifeformLoc),
				new Constrainable([constraintSpeedMax]),
				new Collidable(lifeformCollider),
				new Damager(),
				new Killable(),
				new Drawable(lifeformVisual),
				new Actor(lifeformActivity),
			]
		);

		entities.push(lifeformEntity);
	}

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
	PlacePlanetSurface.prototype = Object.create(Place.prototype);
	PlacePlanetSurface.prototype.constructor = Place;

	PlacePlanetSurface.prototype.draw_FromSuperclass = PlacePlanetSurface.prototype.draw;
	PlacePlanetSurface.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "DarkGray");

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

	PlacePlanetSurface.prototype.entityAccelerateInDirection = function
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
