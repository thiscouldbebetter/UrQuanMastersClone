
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

	this.actions =
	[
		Ship.actionShowMenu(),
		Ship.actionAccelerate(),
		Ship.actionTurnLeft(),
		Ship.actionTurnRight(),
		Ship.actionFire(),
		Ship.actionSpecial(),
		actionExit,
	].addLookups("name");

	this.inputToActionMappings = Ship.inputToActionMappings();
	this.inputToActionMappings = this.inputToActionMappings.concat
	(
		[
			new InputToActionMapping("Enter", "Fire", true),
			new InputToActionMapping("_", "Special", true),
			new InputToActionMapping("Escape", "Exit"),

			new InputToActionMapping("Gamepad0Button0", "Fire", true),
			new InputToActionMapping("Gamepad0Button1", "Special", true),
			new InputToActionMapping("Gamepad0Button2", "Exit"),
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

		var combat = place.combat;
		var combatSize = combat.size;
		var shipEntities = place.shipEntities();

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

	var shipCollide = function(universe, world, place, entityPlayer, entityOther)
	{
		// todo
	}

	var constraintWrapToRange = new Constraint("WrapToRange", this.size);

	for (var i = 0; i < shipsFighting.length; i++)
	{
		var ship = shipsFighting[i];

		var shipPos = new Coords(.1 * (i == 0 ? -1 : 1), 0).multiply(this.size).add(planetPos);
		var shipLoc = new Location(shipPos);
		var shipCollider = new Sphere(shipLoc.pos, entityDimension / 2);

		var shipDefn = ship.defn(world);
		var shipVisualBody = shipDefn.visual;
		var shipVisual = new VisualWrapped
		(
			this.size,
			new VisualCamera
			(
				shipVisualBody,
				this.camera
			)
		);

		var shipEntityProperties =
		[
			ship,
			new Locatable(shipLoc),
			new Constrainable([constraintWrapToRange]),
			new Collidable
			(
				shipCollider,
				[ "collidable" ], // entityPropertyNamesToCollideWith
				shipCollide
			),
			new Drawable(shipVisual),
			new ItemHolder(),
			new Killable
			(
				ship.crew,
				function kill() { /* todo */ }
			)
		];

		if (i == 0)
		{
			shipEntityProperties.push(new Playable());
		}
		else
		{
			shipEntityProperties.push(new Actor(this.combat.enemyActivity));
		}

		var shipEntity = new Entity
		(
			"Ship" + i,
			shipEntityProperties
		);

		entities.push(shipEntity);
		entities[shipEntity.name] = shipEntity;
	}

	// controls

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
	this.propertyNamesToProcess.push("ship");

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
}
{
	PlaceCombat.prototype = Object.create(Place.prototype);
	PlaceCombat.prototype.constructor = Place;

	// methods

	PlaceCombat.prototype.shipEntities = function()
	{
		return this.entitiesByPropertyName("ship");
	}

	// Place overrides

	PlaceCombat.prototype.draw_FromSuperclass = PlaceCombat.prototype.draw;
	PlaceCombat.prototype.draw = function(universe, world)
	{
		var display = universe.display;

		display.drawBackground("Gray", "Black");

		var drawLoc = this.drawLoc;
		var drawPos = drawLoc.pos;

		var ships = this.shipEntities();

		var camera = this.camera;
		var cameraPos = camera.loc.pos;

		var midpointBetweenCombatants;

		if (ships.length == 1)
		{
			midpointBetweenCombatants = ships[0].locatable.loc.pos;
		}
		else // if ships.length == 2
		{
			midpointBetweenCombatants =
				this.combat.midpointOfPointsWrappedToRange
				(
					cameraPos, // midpointToOverwrite
					ships[0].locatable.loc.pos,
					ships[1].locatable.loc.pos,
					this.size
				);
		}

		cameraPos.overwriteWith(midpointBetweenCombatants);

		this.draw_FromSuperclass(universe, world);

		this.venueControls.draw(universe, world);
	}

	PlaceCombat.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceCombat.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);

		var shipEntities = this.shipEntities();

		if (shipEntities.length < 2)
		{
			var combat = this.combat;
			var shipGroups = combat.shipGroups;

			if (shipGroups[0].ships.length == 0)
			{
				throw "todo"; // Game over?
			}
			else if (shipGroups[1].ships.length == 0)
			{
				var encounter = combat.encounter;
				var placeNext = encounter.placeToReturnTo;
				var enemyFromPlaceNext = placeNext.entities[enemyName];
				placeNext.entitiesToRemove.push(enemyFromPlaceNext);
				encounter.returnToPlace(world);
			}
			else
			{
				var controlShipSelect =
					combat.toControlShipSelect(universe, universe.display.sizeInPixels);
				var venueNext = new VenueControls(controlShipSelect);
				universe.venueNext = venueNext;
			}
		}
	}
}
