
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
		var ship = (entity.shipGroup != null ? entity.shipGroup.ships[0] : entity.ship);
		var shipDefn = ship.defn(world);
		var shipLoc = entity.locatable.loc;
		var shipForward = shipLoc.orientation.forward;
		shipLoc.accel.overwriteWith(shipForward).multiplyScalar
		(
			shipDefn.acceleration
		);
		var shipVel = shipLoc.vel;
		var shipSpeed = shipVel.magnitude();
		if (shipSpeed > shipDefn.speedMax)
		{
			shipVel.normalize().multiplyScalar(shipDefn.speedMax);
		}
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
				var actorLoc = actor.locatable.loc;
				var actorPos = actorLoc.pos;

				var projectileColor = "Yellow";
				var projectileRadius = 2;
				var projectileVisual = new VisualCamera
				(
					new VisualCircle(projectileRadius, projectileColor),
					place.camera
				);

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

				var projectileDamagePerHit = 1;

				var projectileCollide = function(universe, world, place, entityProjectile, entityOther)
				{
					entityProjectile.killable.integrity = 0;

					if (entityOther.killable != null)
					{
						var killable = entityOther.killable;
						killable.integrity -= projectileDamagePerHit;
						if (entityOther.ship != null)
						{
							entityOther.ship.crew = killable.integrity;
						}
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
						new Drawable(projectileVisual),
						new Killable(1),
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

	Ship.manyFromDefns = function(defns)
	{
		var ships = [];

		for (var i = 0; i < defns.length; i++)
		{
			var defn = defns[i];
			var defnName = defn.name;
			var ship = new Ship(defnName);
			ships.push(ship);
		}

		return ships;
	}

	Ship.turnInDirection = function
	(
		world, entity, direction
	)
	{
		var entityLoc = entity.locatable.loc;
		var entityOrientation = entityLoc.orientation;
		var entityForward = entityOrientation.forward;
		var ship = (entity.ship == null ? entity.shipGroup.ships[0] : entity.ship);
		var shipDefn = ship.defn(world);
		var turnsPerTick = shipDefn.turnsPerTick;
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

	Ship.prototype.crewCurrentOverMax = function(world)
	{
		return this.crew + "/" + this.defn(world).crewMax;
	}

	Ship.prototype.defn = function(world)
	{
		return world.defns.shipDefns[this.defnName];
	}

	Ship.prototype.energyCurrentOverMax = function(world)
	{
		return this.energy + "/" + this.defn(world).energyMax;
	}

	Ship.prototype.fullName = function(world)
	{
		return this.defn(world).factionName + " " + this.defnName;
	}

	Ship.prototype.fullNameAndCrew = function(world)
	{
		return this.fullName(world) + "(" + this.crewCurrentOverMax(world) + ")";
	}

	Ship.prototype.initialize = function(world)
	{
		var defn = this.defn(world);

		if (this.crew == null)
		{
			this.crew = defn.crewMax;
			this.energy = defn.energyMax;
		}
	}

	Ship.prototype.toControlSidebar = function(containerSidebarSize, indexTopOrBottom, world)
	{
		var ship = this;

		var marginWidth = containerSidebarSize.x / 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);

		var containerShipSize = new Coords
		(
			containerSidebarSize.x - marginSize.x * 2,
			(containerSidebarSize.y - marginSize.y * 3) / 2
		);

		var fontHeight = 20;

		var fontHeightShort = fontHeight / 2;
		var labelSizeShort = new Coords(containerShipSize.x / 2, fontHeightShort);

		var defn = this.defn(world);

		var returnValue = new ControlContainer
		(
			"containerShip",
			new Coords
			(
				marginSize.x,
				marginSize.y + (containerShipSize.y + marginSize.y) * indexTopOrBottom
			),
			containerShipSize,
			[
				new ControlLabel
				(
					"labelName",
					new Coords
					(
						containerShipSize.x / 2,
						marginSize.y + labelSizeShort.y / 2
					), // pos
					labelSizeShort,
					true, // isTextCentered
					defn.factionName,
					fontHeightShort
				),

				new ControlLabel
				(
					"labelCrew",
					new Coords
					(
						marginSize.x,
						marginSize.y * 2 + labelSizeShort.y
					), // pos
					labelSizeShort,
					false, // isTextCentered
					"Crew:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoCrew",
					new Coords
					(
						marginSize.x / 2 + labelSizeShort.x,
						marginSize.y * 2 + labelSizeShort.y
					), // pos
					labelSizeShort,
					false, // isTextCentered
					new DataBinding(ship, "crewCurrentOverMax(world)", { "world": world }),
					fontHeightShort
				),

				new ControlLabel
				(
					"labelEnergy",
					new Coords(marginSize.x, marginSize.y * 3 + labelSizeShort.y * 2), // pos
					labelSizeShort,
					false, // isTextCentered
					"Energy:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoEnergy",
					new Coords
					(
						marginSize.x / 2 + labelSizeShort.x,
						marginSize.y * 3 + labelSizeShort.y * 2
					), // pos
					labelSizeShort,
					false, // isTextCentered
					new DataBinding(ship, "energyCurrentOverMax(world)", { "world": world }),
					fontHeightShort
				),
			]
		);

		return returnValue;

	}
}
