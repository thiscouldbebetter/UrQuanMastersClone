
function Ship(defnName)
{
	this.defnName = defnName;
}
{
	// temporary variables

	Ship._polar = new Polar();

	// static methods

	Ship.accelerate = function(world, entity)
	{
		var entityLoc = entity.locatable.loc;

		var entityForward = entityLoc.orientation.forward;
		var accelerationPerTick = .03; // hack
		entityLoc.accel.overwriteWith(entityForward).multiplyScalar
		(
			accelerationPerTick
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

				var projectileColor = "Cyan";
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
					actorForward.clone().multiplyScalar(actorRadius).double().double()
				); 
				var projectileLoc = new Location(projectilePos);
				projectileLoc.vel.overwriteWith(actorForward).double();

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

	Ship.actions = function()
	{
		var returnValues = 
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
				"Accelerate",
				function perform(universe, world, place, actor)
				{
					Ship.accelerate
					(
						world, actor
					);
				}
			),
			new Action
			(
				"TurnLeft",
				function perform(universe, world, place, actor)
				{
					Ship.turnInDirection
					(
						world, actor, -1
					);
				}
			),
			new Action
			(
				"TurnRight",
				function perform(universe, world, place, actor)
				{
					Ship.turnInDirection
					(
						world, actor, 1
					);
				}
			),
		].addLookups("name");

		return returnValues;
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

	Ship.visual = function(dimension, color)
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
				color
			);

			visualsForAngles.push(visualForAngle);
		}

		var returnValue = new VisualDirectional
		(
			new VisualPolygon(visualPath, color),
			visualsForAngles
		);

		return returnValue;
	}
}
