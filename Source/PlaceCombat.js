
function PlaceCombat(size)
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

	// planet

	var sizeHalf = this.size.clone().half();

	var planetRadius = entityDimension;
	var planetPos = sizeHalf.clone();
	var planetColor = "Cyan";
	var planetVisual = new VisualCircle(planetRadius, planetColor);
	var planetCollider = new Sphere(planetPos, planetRadius);

	var planetEntity = new Entity
	(
		"Planet",
		[
			new Locatable( new Location(planetPos) ),
			new Collidable(planetCollider),
			new Drawable(planetVisual)
		]
	);

	entities.push(planetEntity);

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
			// todo
		}
		else if (entityOtherName.startsWith("Planet"))
		{
			world.placeNext = new PlacePlanetVicinity(place.size.clone());
		}
		else if (entityOtherName.startsWith("Wall"))
		{
			world.placeNext = new PlaceHyperspace(place.size.clone());
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

	Place.call(this, entities);

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
}
{
	PlaceCombat.prototype = Object.create(Place.prototype);
	PlaceCombat.prototype.constructor = Place;

	PlaceCombat.prototype.draw_FromSuperclass = PlaceCombat.prototype.draw;
	PlaceCombat.prototype.draw = function(universe, world)
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

	PlaceCombat.prototype.entityAccelerateInDirection = function
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
