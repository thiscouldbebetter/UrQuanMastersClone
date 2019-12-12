
function Ship(defnName)
{
	this.defnName = defnName;
}
{
	// temporary variables

	Ship._polar = new Polar();

	// static methods

	Ship.actionAccelerate = function()
	{
		return new Action
		(
			"Accelerate",
			function perform(universe, world, place, actor)
			{
				actor.Ship.accelerate(world, actor);
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
				var ship = actor.ship;
				var shipDefn = ship.defn(world);
				var attackDefn = shipDefn.attackDefn;
				if (ship.energy >= attackDefn.energyToUse)
				{
					ship.energy -= attackDefn.energyToUse;
					attackDefn.activate(universe, world, place, actor);
				}
			}
		);

		return returnValue;
	}

	Ship.actionSpecial = function()
	{
		var returnValue = new Action
		(
			"Special",
			function perform(universe, world, place, actor)
			{
				var ship = actor.ship;
				var shipDefn = ship.defn(world);
				var specialDefn = shipDefn.specialDefn;
				if (ship.energy >= specialDefn.energyToUse)
				{
					ship.energy -= specialDefn.energyToUse;
					specialDefn.activate(universe, world, place, actor);
				}
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
				actor.Ship.turnLeft(world, actor);
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
				actor.Ship.turnRight(world, actor);
			}
		);
	};

	Ship.actions = function()
	{
		var returnValues =
		[
			Ship.actionShowMenu(),
			Ship.actionAccelerate(),
			Ship.actionTurnLeft(),
			Ship.actionTurnRight(),
			//actionMapView
		].addLookupsByName();

		return returnValues;
	};

	Ship.activityApproachPlayer = function(universe, world, place, actor)
	{
		var entities = place.entities;
		var target = entities["Player"];
		var targetPos = target.Locatable.loc.pos;
		var actorLoc = actor.Locatable.loc;
		var actorPos = actorLoc.pos;
		var actorVel = actorLoc.vel;

		var targetDisplacement = targetPos.clone().subtract(actorPos);

		var targetDistance = targetDisplacement.magnitude();
		if (targetDistance < actor.Ship.defn(world).sensorRange)
		{
			var forwardAsPolar = new Polar().fromCoords(actorLoc.orientation.forward);
			var angleForward = forwardAsPolar.azimuthInTurns;

			var targetDisplacementAsPolar = new Polar().fromCoords(targetDisplacement);
			var angleToTarget = targetDisplacementAsPolar.azimuthInTurns;

			var angleTargetMinusForward =
				angleToTarget.subtractWrappedToRangeMax(angleForward, 1);

			if (angleTargetMinusForward != 0)
			{
				var directionToTurn = angleTargetMinusForward / Math.abs(angleTargetMinusForward);
				actor.Ship.turnInDirection(world, actor, directionToTurn);
			}

			actor.Ship.accelerate(world, actor);
		}
	}

	Ship.actionToInputsMappings = function()
	{
		var returnValues =
		[
			new ActionToInputsMapping("ShowMenu", ["Escape"]),

			new ActionToInputsMapping("TurnLeft", ["ArrowLeft", "Gamepad0Left"]),
			new ActionToInputsMapping("TurnRight", ["ArrowRight", "Gamepad0Right"]),
			new ActionToInputsMapping("Accelerate", ["ArrowUp", "Gamepad0Up"]),

		].addLookupsMultiple(function(x) { return x.inputNames; } );

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
		return Math.floor(this.energy) + "/" + this.defn(world).energyMax;
	}

	Ship.prototype.fullName = function(world)
	{
		return this.defn(world).factionName + " " + this.defnName;
	}

	Ship.prototype.fullNameAndCrew = function(world)
	{
		return this.fullName(world) + "(" + this.crewCurrentOverMax(world) + ")";
	}

	Ship.prototype.initialize = function(universe, world, place, entityShip)
	{
		var defn = this.defn(world);

		if (this.crew == null)
		{
			this.crew = defn.crewMax;
			this.energy = defn.energyMax;
		}
	}

	Ship.prototype.updateForTimerTick = function(universe, world, place, entityShip)
	{
		var ship = entityShip.ship;
		var shipDefn = ship.defn(world);
		ship.energy += shipDefn.energyPerTick;
		if (ship.energy > shipDefn.energyMax)
		{
			ship.energy = shipDefn.energyMax;
		}
	}

	// movement

	Ship.prototype.accelerate = function(world, entity)
	{
		var ship = (entity.ShipGroup != null ? entity.ShipGroup.ships[0] : entity.Ship);
		var shipDefn = ship.defn(world);
		var shipLoc = entity.Locatable.loc;
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

	Ship.prototype.turnInDirection = function(world, entity, direction)
	{
		var entityLoc = entity.Locatable.loc;
		var entityOrientation = entityLoc.orientation;
		var entityForward = entityOrientation.forward;
		var ship = (entity.Ship == null ? entity.ShipGroup.ships[0] : entity.Ship);
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

	Ship.prototype.turnLeft = function(world, entity)
	{
		this.turnInDirection(world, entity, -1);
	}

	Ship.prototype.turnRight = function(world, entity)
	{
		this.turnInDirection(world, entity, 1);
	}

	// controls

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
					new DataBinding(ship, function get(c) { return c.crewCurrentOverMax(world); } ),
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
					new DataBinding(ship, function get(c) { return c.energyCurrentOverMax(world); } ),
					fontHeightShort
				),
			]
		);

		return returnValue;
	}
}
