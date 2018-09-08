
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
			new InputToActionMapping("Enter", "Fire"),
			new InputToActionMapping("_x", "Exit"),

			new InputToActionMapping("Gamepad0Button0", "Fire"),
			new InputToActionMapping("Gamepad0Button1", "Exit"),
		]
	);
	this.inputToActionMappings.addLookups("inputName");

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

	var playerVisualBody = Ship.visual(entityDimension, playerColor);

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

	var playerVisual = new VisualCamera
	(
		new VisualGroup
		([
			playerVisualBody,
		]),
		this.camera
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
