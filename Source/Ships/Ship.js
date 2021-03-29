
class Ship
{
	constructor(defnName)
	{
		this.defnName = defnName;
	}

	// temporary variables

	static _polar = new Polar();

	// static methods

	static actionAccelerate()
	{
		return new Action
		(
			"Accelerate",
			function perform(universe, world, place, actor)
			{
				var ship = EntityExtensions.ship(actor);
				ship.accelerate(world, actor);
			}
		);
	}

	static actionFire()
	{
		var returnValue = new Action
		(
			"Fire",
			function perform(universe, world, place, actor)
			{
				var ship = EntityExtensions.ship(actor);
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

	static actionSpecial()
	{
		var returnValue = new Action
		(
			"Special",
			function perform(universe, world, place, actor)
			{
				var ship = EntityExtensions.ship(actor);
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

	static actionShowMenu()
	{
		return new Action
		(
			"ShowMenu",
			function perform(universe, world, place, actor)
			{
				var venueNext = new VenueControls
				(
					universe.controlBuilder.gameAndSettings(universe)
				);
				venueNext = new VenueFader(venueNext, universe.venueCurrent);
				universe.venueNext = venueNext;
			}
		);
	}

	static actionTurnLeft()
	{
		return new Action
		(
			"TurnLeft",
			function perform(universe, world, place, actor)
			{
				EntityExtensions.ship(actor).turnLeft(world, actor);
			}
		);
	}

	static actionTurnRight()
	{
		return new Action
		(
			"TurnRight",
			function perform(universe, world, place, actor)
			{
				EntityExtensions.ship(actor).turnRight(world, actor);
			}
		);
	}

	static actions()
	{
		var returnValues =
		[
			Ship.actionShowMenu(),
			Ship.actionAccelerate(),
			Ship.actionTurnLeft(),
			Ship.actionTurnRight(),
			//actionMapView
		];//.addLookupsByName();

		return returnValues;
	}

	activityApproachPlayer(universe, world, place, actor)
	{
		var entities = place.entities;
		var target = place.entitiesByName.get("Player");
		var targetPos = target.locatable().loc.pos;
		var actorLoc = actor.locatable().loc;
		var actorPos = actorLoc.pos;
		var actorVel = actorLoc.vel;

		var targetDisplacement = targetPos.clone().subtract(actorPos);

		var targetDistance = targetDisplacement.magnitude();
		if (targetDistance < actor.ship.defn(world).sensorRange)
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
				actor.ship.turnInDirection(world, actor, directionToTurn);
			}

			actor.ship.accelerate(world, actor);
		}
	}

	static actionToInputsMappings()
	{
		var returnValues =
		[
			new ActionToInputsMapping("ShowMenu", ["Escape"]),

			new ActionToInputsMapping("TurnLeft", ["ArrowLeft", "Gamepad0Left"]),
			new ActionToInputsMapping("TurnRight", ["ArrowRight", "Gamepad0Right"]),
			new ActionToInputsMapping("Accelerate", ["ArrowUp", "Gamepad0Up"]),

		];//.addLookupsMultiple(function(x) { return x.inputNames; } );

		return returnValues;
	}

	static manyFromDefns(defns)
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

	crewCurrentOverMax(world)
	{
		return this.crew + "/" + this.defn(world).crewMax;
	}

	defn(world)
	{
		return world.defn.shipDefnByName(this.defnName);
	}

	energyCurrentOverMax(world)
	{
		return Math.floor(this.energy) + "/" + this.defn(world).energyMax;
	}

	fullName(world)
	{
		return this.defn(world).factionName + " " + this.defnName;
	}

	fullNameAndCrew(world)
	{
		return this.fullName(world) + "(" + this.crewCurrentOverMax(world) + ")";
	}

	initialize(universe, world, place, entityShip)
	{
		var defn = this.defn(world);

		if (this.crew == null)
		{
			this.crew = defn.crewMax;
			this.energy = defn.energyMax;
		}
	}

	updateForTimerTick(universe, world, place, entityShip)
	{
		var ship = entityship;
		var shipDefn = ship.defn(world);
		ship.energy += shipDefn.energyPerTick;
		if (ship.energy > shipDefn.energyMax)
		{
			ship.energy = shipDefn.energyMax;
		}
	}

	// movement

	accelerate(world, entity)
	{
		var entityShipGroup = EntityExtensions.shipGroup(entity);
		var ship =
		(
			entityShipGroup != null
			? entityShipGroup.ships[0]
			: EntityExtensions.ship(entity)
		);
		var shipDefn = ship.defn(world);
		var shipLoc = entity.locatable().loc;
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

	turnInDirection(world, entity, direction)
	{
		var entityLoc = entity.locatable().loc;
		var entityOrientation = entityLoc.orientation;
		var entityForward = entityOrientation.forward;
		var entityShip = EntityExtensions.ship(entity);
		var ship = (entityShip == null ? EntityExtensions.shipGroup(entity).ships[0] : entityShip);
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

	turnLeft(world, entity)
	{
		this.turnInDirection(world, entity, -1);
	}

	turnRight(world, entity)
	{
		this.turnInDirection(world, entity, 1);
	}

	// controls

	toControlSidebar(containerSidebarSize, indexTopOrBottom, world)
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
