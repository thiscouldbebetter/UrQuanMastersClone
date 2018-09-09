
function PlaceCombat(world, combat)
{
	this.combat = combat;
	this.size = this.combat.size;

	var actionExit = new Action
	(
		"Exit",
		function perform(universe, world, place, actor)
		{
			var encounter = place.combat.encounter;
			encounter.returnToPlace(world);
		}
	);

	var actionFire = Ship.actionFire();

	this.actions =
	[
		Ship.actionShowMenu(),
		Ship.actionAccelerate(),
		Ship.actionTurnLeft(),
		Ship.actionTurnRight(),
		actionFire,
		actionExit,
	].addLookups("name");

	this.inputToActionMappings = Ship.inputToActionMappings();
	this.inputToActionMappings = this.inputToActionMappings.concat
	(
		[
			new InputToActionMapping("Enter", "Fire", true),
			new InputToActionMapping("_x", "Exit"),

			new InputToActionMapping("Gamepad0Button0", "Fire", true),
			new InputToActionMapping("Gamepad0Button1", "Exit"),
		]
	);
	this.inputToActionMappings.addLookups("inputName");

	// camera

	this.camera = new Camera
	(
		new Coords(300, 300), // hack
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

	// planet

	var sizeHalf = this.size.clone().half();

	var planetRadius = entityDimension;
	var planetPos = new Coords(0, 0);//sizeHalf.clone();
	var planetColor = "Cyan";
	var planetVisual = new VisualWrapped
	(
		this.size,
		new VisualCamera
		(
			new VisualCircle(planetRadius, planetColor),
			this.camera
		)
	);
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

	var playerPos = new Coords(-.1, 0).multiply(this.size);
	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerColor = "Gray";

	var playerVisualBody = Ship.visual(entityDimension, playerColor);

	var playerVisual = new VisualWrapped
	(
		this.size,
		new VisualCamera
		(
			playerVisualBody,
			this.camera
		)
	);

	var playerCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		var entityOtherName = entityOther.name;
		if (entityOtherName.startsWith("Enemy"))
		{
			// todo
		}
		else if (entityOtherName.startsWith("Planet"))
		{
			// todo
		}
		else if (entityOtherName.startsWith("Projectile"))
		{
			// todo
		}
	}

	var constraintSpeedMax = new Constraint("SpeedMax", 1);
	//var constraintFriction = new Constraint("Friction", 0.3);
	var constraintWrapToRange = new Constraint("WrapToRange", this.size);

	var playerShip = world.player.shipGroup.ships[0]; // todo

	var playerEntity = new Entity
	(
		"Player",
		[
			new Modellable(playerShip),
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

	var enemyVisual = new VisualWrapped
	(
		this.size,
		new VisualCamera
		(
			new VisualPolygon
			(
				new Path(enemyColliderAsFace.vertices), enemyColor
			),
			this.camera
		)
	);

	var enemyActivity = function activity(universe, world, place, actor)
	{
		var entityToTargetName = "Player";
		var target = place.entities[entityToTargetName];
		var targetPos = target.locatable.loc.pos;
		var actorLoc = actor.locatable.loc;
		var actorPos = actorLoc.pos;
		var actorVel = actorLoc.vel;
		var combat = place.combat;

		var targetDisplacement = combat.displacementOfPointsWrappedToRange
		(
			actorVel, // displacementToOverwrite
			actorPos,
			targetPos,
			combat.size
		);

		actorLoc.vel.overwriteWith
		(
			targetDisplacement
		).normalize();
	}

	var enemyEntity = new Entity
	(
		"Enemy",
		[
			new Locatable(enemyLoc),
			new Constrainable([constraintSpeedMax, constraintWrapToRange]),
			new Collidable(enemyCollider),
			new Damager(),
			new Killable(),
			new Drawable(enemyVisual),
			new Actor(enemyActivity),
		]
	);

	entities.push(enemyEntity);

	var containerSidebarSize = new Coords(100, 300); // hack
	var containerSidebar = new ControlContainer
	(
		"containerSidebar",
		new Coords(300, 0),
		containerSidebarSize,
		[
			// todo
		]
	);

	this.venueControls = new VenueControls(containerSidebar);

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
		var playerPos = playerLoc.pos;

		var enemy = this.entities["Enemy"];
		var enemyPos = enemy.locatable.loc.pos;

		var camera = this.camera;
		var cameraPos = camera.loc.pos;

		var midpointBetweenCombatants =
			this.combat.midpointOfPointsWrappedToRange
			(
				cameraPos, // midpointToOverwrite
				playerPos,
				enemyPos,
				this.size
			);

		cameraPos.overwriteWith
		(
			midpointBetweenCombatants
		);

		this.draw_FromSuperclass(universe, world);

		this.venueControls.draw(universe, world);
	}

	PlaceCombat.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceCombat.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);
		var enemyName = "Enemy"; // todo
		var entityEnemy = this.entities[enemyName];
		if (entityEnemy == null)
		{
			var encounter = this.combat.encounter;
			var placeNext = encounter.placeToReturnTo;
			var enemyFromPlaceNext = placeNext.entities[enemyName];
			placeNext.entitiesToRemove.push(enemyFromPlaceNext);
			encounter.returnToPlace(world);
		}
	}
}
