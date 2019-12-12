
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
	].addLookupsByName();

	this._actionToInputsMappings = Ship.actionToInputsMappings();
	this._actionToInputsMappings = this._actionToInputsMappings.concat
	(
		[
			new ActionToInputsMapping("Fire", ["Enter", "Gamepad0Button0"], true),
			new ActionToInputsMapping("Special", ["_", "Gamepad0Button1"], true),
			new ActionToInputsMapping("Exit", ["Escape", "Gamepad0Button2"]),
		]
	);
	this._actionToInputsMappings.addLookups(function (x) { return x.inputNames; } );

	// camera

	this.camera = new Camera
	(
		new Coords(300, 300), // hack
		null, // focalLength
		new Location
		(
			new Coords(0, 0, 0),
			Orientation.Instances().ForwardZDownY.clone()
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
			() => this.camera
		)
	);
	var planetCollider = new Sphere(planetPos, planetRadius);

	var planetCollide = function(universe, world, place, entityPlanet, entityOther)
	{
		var planetPos = entityPlanet.Locatable.loc.pos;

		var otherLoc = entityOther.Locatable.loc;
		var otherPos = otherLoc.pos;
		var displacement = otherPos.clone().subtract(planetPos);
		var distance = displacement.magnitude();
		var direction = displacement.divideScalar(distance);
		var planetCollider = entityPlanet.Collidable.collider;
		var planetRadius = planetCollider.radius;
		var otherCollider = entityOther.Collidable.collider;
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
		var planetPos = planet.Locatable.loc.pos;

		var combat = place.combat;
		var combatSize = combat.size;
		var entitiesShips = place.entitiesShips();

		for (var i = 0; i < entitiesShips.length; i++)
		{
			var ship = entitiesShips[i];
			var shipLoc = ship.Locatable.loc;
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
				[ Collidable.name ], // entityPropertyNamesToCollideWith
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
				() => this.camera
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
				[ Collidable.name ], // entityPropertyNamesToCollideWith
				shipCollide
			),
			new Drawable(shipVisual),
			new ItemHolder(),
			new Killable(ship.crew, this.shipDie)
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

	Place.call(this, PlaceCombat.name, entities);
	this.propertyNamesToProcess.push("ship");

	// Helper variables.

	this.drawPos = new Coords();
	this.drawLoc = new Location(this.drawPos);
}
{
	PlaceCombat.prototype = Object.create(Place.prototype);
	PlaceCombat.prototype.constructor = Place;

	// methods

	PlaceCombat.prototype.actionToInputsMappings = function()
	{
		return this._actionToInputsMappings;
	};

	PlaceCombat.prototype.roundOver = function(universe, world, place, entity)
	{
		var combat = place.combat;
		var shipGroups = combat.shipGroups;

		if (shipGroups[0].ships.length == 0)
		{
			throw "todo"; // Game over.
		}
		else if (shipGroups[1].ships.length > 0)
		{
			var controlShipSelect =
				combat.toControlShipSelect(universe, universe.display.sizeInPixels);
			var venueNext = new VenueControls(controlShipSelect);
			universe.venueNext = venueNext;
		}
		else
		{
			var controlCombatDebriefing =
				combat.toControlDebriefing(universe, universe.display.sizeInPixels);
			var venueNext = new VenueControls(controlCombatDebriefing);
			universe.venueNext = venueNext;
		}
	}

	PlaceCombat.prototype.shipDie = function(universe, world, place, entityShipToDie)
	{
		var ship = entityShipToDie.ship;
		var combat = place.combat;
		combat.shipsFighting.remove(ship);
		var shipGroups = combat.shipGroups;

		for (var g = 0; g < shipGroups.length; g++)
		{
			var shipGroup = shipGroups[g];
			if (shipGroup.ships.contains(ship))
			{
				shipGroup.ships.remove(ship);
			}
		}

		var visualToRecycle = entityShipToDie.drawable.visual;
		visualToRecycle.child.child = new VisualCircle(32, "Red");

		entityShipToDie.Locatable.loc.vel.clear();

		var entityExplosion = new Entity
		(
			"Explosion",
			[
				new Ephemeral(64, place.roundOver),
				new Drawable(visualToRecycle),
				entityShipToDie.Locatable,
			]
		);

		place.entitiesToSpawn.push(entityExplosion);
	}

	PlaceCombat.prototype.entitiesShips = function()
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

		var ships = this.entitiesShips();

		var camera = this.camera;
		var cameraPos = camera.loc.pos;

		var midpointBetweenCombatants;

		if (ships.length == 1)
		{
			midpointBetweenCombatants = ships[0].Locatable.loc.pos;
		}
		else // if ships.length == 2
		{
			midpointBetweenCombatants =
				this.combat.midpointOfPointsWrappedToRange
				(
					cameraPos, // midpointToOverwrite
					ships[0].Locatable.loc.pos,
					ships[1].Locatable.loc.pos,
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
	}
}
