
function Ship(defnName)
{
	this.defnName = defnName;
}
{
	// temporary variables

	Ship._polar = new Polar();

	// static methods

	Ship.accelerateAtRate = function(world, entity, accelerationPerTick)
	{
		var entityLoc = entity.locatable.loc;
		var entityForward = entityLoc.orientation.forward;
		entityLoc.accel.overwriteWith(entityForward).multiplyScalar
		(
			accelerationPerTick
		);
	}

	Ship.accelerate = function(world, entity)
	{
		var model = entity.modellable.model;
		var modelTypeName = model.constructor.name;
		var ship = (modelTypeName == "ShipGroup" ? model.ships[0]: model);
		var shipDefn = ship.defn(world);
		Ship.accelerateAtRate(world, entity, shipDefn.acceleration);
	}

	Ship.actionAccelerate = function()
	{
		return new Action
		(
			"Accelerate",
			function perform(universe, world, place, actor)
			{
				Ship.accelerate(world, actor);
			}
		);
	}

	Ship.actionFire = function()
	{
		var returnValue = new Action
		(
			"Fire",
			function perform(universe, world, place, actor)
			{
				var itemWeapon = new Item("Weapon", 1);
				var actorHasWeapon = actor.itemHolder.hasItems(itemWeapon);

				var actorLoc = actor.locatable.loc;
				var actorPos = actorLoc.pos;

				var projectileColor = "Yellow";
				var projectileRadius = 2;
				var projectileVisual = new VisualGroup
				([
					new VisualCircle(projectileRadius, projectileColor),
				]);

				var actorOrientation = actorLoc.orientation;
				var actorForward = actorOrientation.forward;
				var actorRadius = actor.collidable.collider.radius;
				var projectilePos = actorPos.clone().add
				(
					actorForward.clone().multiplyScalar(actorRadius).double()
				);
				var projectileLoc = new Location(projectilePos);
				projectileLoc.vel.overwriteWith(actorForward).double().double();

				var projectileCollider =
					new Sphere(projectilePos, projectileRadius);

				var projectileCollide = function(universe, world, place, entityPlayer, entityOther)
				{
					if (entityOther.killable != null)
					{
						place.entitiesToRemove.push(entityOther);
					}
				}

				var projectileEntity = new Entity
				(
					"Projectile",
					[
						new Damager(),
						new Ephemeral(32),
						new Locatable( projectileLoc ),
						new Collidable
						(
							projectileCollider,
							[ "killable" ],
							projectileCollide
						),
						new Drawable(projectileVisual)
					]
				);

				place.entitiesToSpawn.push(projectileEntity);
			}
		);

		return returnValue;
	}

	Ship.actionShowMenu = function()
	{
		return new Action
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
		);
	}

	Ship.actionTurnLeft = function()
	{
		return new Action
		(
			"TurnLeft",
			function perform(universe, world, place, actor)
			{
				Ship.turnInDirection(world, actor, -1);
			}
		);
	}

	Ship.actionTurnRight = function()
	{
		return new Action
		(
			"TurnRight",
			function perform(universe, world, place, actor)
			{
				Ship.turnInDirection(world, actor, 1);
			}
		);
	}

	Ship.inputToActionMappings = function()
	{
		var returnValues =
		[
			new InputToActionMapping("Escape", "ShowMenu"),

			new InputToActionMapping("ArrowLeft", "TurnLeft"),
			new InputToActionMapping("ArrowRight", "TurnRight"),
			new InputToActionMapping("ArrowUp", "Accelerate"),

			new InputToActionMapping("Gamepad0Left", "TurnLeft"),
			new InputToActionMapping("Gamepad0Right", "TurnRight"),
			new InputToActionMapping("Gamepad0Up", "Accelerate"),

		].addLookups("inputName");

		return returnValues;
	}

	Ship.turnInDirection = function
	(
		world, entity, direction
	)
	{
		var entityLoc = entity.locatable.loc;
		var entityOrientation = entityLoc.orientation;
		var entityForward = entityOrientation.forward;
		var turnsPerTick = .01; // hack
		var entityForwardNew = Ship._polar.fromCoords
		(
			entityForward
		).addToAzimuthInTurns
		(
			turnsPerTick * direction
		).wrap().toCoords
		(
			entityForward
		);
		entityOrientation.forwardSet(entityForwardNew);
	}

	Ship.visual = function(dimension, colorFill, colorBorder)
	{
		var visualPath = new Path
		([
			new Coords(1.2, 0).multiplyScalar(dimension).half(),
			new Coords(-.8, .8).multiplyScalar(dimension).half(),
			new Coords(-.8, -.8).multiplyScalar(dimension).half(),
		]);

		var visualsPerTurn = 32;
		var turnsPerPlayerVisual = 1 / visualsPerTurn;
		var visualsForAngles = [];
		var transformRotate2D = new Transform_Rotate2D();

		for (var i = 0; i < visualsPerTurn; i++)
		{
			transformRotate2D.turnsToRotate = i * turnsPerPlayerVisual;

			var visualForAngle = new VisualPolygon
			(
				visualPath.clone().transform(transformRotate2D),
				colorFill, colorBorder
			);

			visualsForAngles.push(visualForAngle);
		}

		var returnValue = new VisualDirectional
		(
			new VisualPolygon(visualPath, colorFill, colorBorder),
			visualsForAngles
		);

		return returnValue;
	}

	// instance methods

	Ship.prototype.defn = function(world)
	{
		return world.defns.shipDefns[this.defnName];
	}

	Ship.prototype.initialize = function(world)
	{
		var defn = this.defn(world);

		this.integrity = defn.integrityMax;
		this.energy = defn.energyMax;
		this.fuel = defn.fuelMax;
	}
}
