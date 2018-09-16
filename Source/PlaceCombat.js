
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
	//var planetPos = sizeHalf.clone();
	var planetPos = sizeHalf.clone();
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

	var planetCollide = function(universe, world, place, entityPlanet, entityOther)
	{
		var planetPos = entityPlanet.locatable.loc.pos;

		var otherLoc = entityOther.locatable.loc;
		var otherPos = otherLoc.pos;
		var displacement = otherPos.clone().subtract(planetPos);
		var distance = displacement.magnitude();
		var direction = displacement.divideScalar(distance);
		var planetCollider = entityPlanet.collidable.collider;
		var planetRadius = planetCollider.radius;
		var otherCollider = entityOther.collidable.collider;
		var sumOfRadii = planetRadius + otherCollider.radius;
		if (distance < sumOfRadii)
		{
			var impulse = direction.multiplyScalar(sumOfRadii - distance);
			otherLoc.vel.add(impulse.double());
		}
	}

	var planetActivityGravitate = function(universe, world, place, actor)
	{
		var planet = actor;
		var planetPos = planet.locatable.loc.pos;

		var combatSize = place.combat.size;

		var shipEntityPlayer = entities["Player"];
		var shipEntityEnemy = entities["Enemy"];
		var shipEntities = [ shipEntityPlayer, shipEntityEnemy ];
		for (var i = 0; i < shipEntities.length; i++)
		{
			var ship = shipEntities[i];
			var shipLoc = ship.locatable.loc;
			var shipPos = shipLoc.pos;
			var displacement = shipPos.clone().subtractWrappedToRangeMax(planetPos, combatSize);
			var distance = displacement.magnitude();
			if (distance > 0)
			{
				var direction = displacement.divideScalar(distance);
				var graviticConstant = -100;
				var accelerationMagnitude = graviticConstant / (distance * distance);
				var accelToAdd = direction.multiplyScalar(accelerationMagnitude);
				shipLoc.accel.add(accelToAdd);
			}
		}
	};

	var planetEntity = new Entity
	(
		"Planet",
		[
			new Locatable( new Location(planetPos) ),
			new Collidable
			(
				planetCollider,
				[ "collidable" ], // entityPropertyNamesToCollideWith
				planetCollide
			),
			new Drawable(planetVisual),
			new Actor(planetActivityGravitate),
		]
	);

	entities.push(planetEntity);
	entities[planetEntity.name] = planetEntity;

	var shipsFighting = this.combat.shipsFighting;

	// player

	var playerPos = new Coords(-.1, 0).multiply(this.size).add(planetPos);
	var playerLoc = new Location(playerPos);
	var playerCollider = new Sphere(playerLoc.pos, entityDimension / 2);
	var playerShip = shipsFighting[0];
	var playerShipDefn = playerShip.defn(world);

	var playerVisualBody = playerShipDefn.visual;
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

	//var constraintSpeedMax = new Constraint("SpeedMax", 1);
	//var constraintFriction = new Constraint("Friction", 0.3);
	var constraintWrapToRange = new Constraint("WrapToRange", this.size);

	var playerEntity = new Entity
	(
		"Player",
		[
			new Modellable(playerShip),
			new Locatable(playerLoc),
			new Constrainable([constraintWrapToRange]),
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
	entities[playerEntity.name] = playerEntity;

	// enemy

	var enemyPos = new Coords(.1, 0).multiply(this.size).add(planetPos);
	var enemyLoc = new Location(enemyPos);
	var enemyCollider = new Sphere(enemyPos, entityDimension / 2);

	var enemyShip = shipsFighting[1];
	var enemyShipDefn = enemyShip.defn(world);
	var enemyVisualBody = enemyShipDefn.visual;
	var enemyVisual = new VisualWrapped
	(
		this.size,
		new VisualCamera
		(
			enemyVisualBody,
			this.camera
		)
	);

	var enemyEntity = new Entity
	(
		"Enemy",
		[
			new Modellable(enemyShip),
			new Locatable(enemyLoc),
			new Constrainable([constraintWrapToRange]),
			new Collidable(enemyCollider),
			new Damager(),
			new Killable(),
			new Drawable(enemyVisual),
			new Actor(this.combat.enemyActivity),
		]
	);

	entities.push(enemyEntity);
	entities[enemyEntity.name] = enemyEntity;

	var containerSidebarSize = new Coords(100, 300); // hack
	var containerSidebar = new ControlContainer
	(
		"containerSidebar",
		new Coords(300, 0),
		containerSidebarSize,
		[
			shipsFighting[0].toControlSidebar(containerSidebarSize, 0, world),
			shipsFighting[1].toControlSidebar(containerSidebarSize, 1, world),
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

	// Place overrides

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
