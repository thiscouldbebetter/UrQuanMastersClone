
class Ship implements EntityProperty
{
	defnName: string;

	crew: number;
	energy: number;

	constructor(defnName: string)
	{
		this.defnName = defnName;
	}

	// temporary variables

	static _polar = Polar.create();

	// static methods

	static actionAccelerate(): Action
	{
		return new Action
		(
			"Accelerate",
			(universe: Universe, worldAsWorld: World, place: Place, actor: Entity) =>
			{
				var world = worldAsWorld as WorldExtended;
				var ship = EntityExtensions.ship(actor);
				ship.accelerate(world, actor);
			}
		);
	}

	static actionFire(): Action
	{
		var returnValue = new Action
		(
			"Fire",
			(universe: Universe, worldAsWorld: World, place: Place, actor: Entity) =>
			{
				var world = worldAsWorld as WorldExtended;
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

	static actionSpecial(): Action
	{
		var returnValue = new Action
		(
			"Special",
			(universe: Universe, worldAsWorld: World, place: Place, actor: Entity) =>
			{
				var world = worldAsWorld as WorldExtended;
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

	static actionShowMenu(): Action
	{
		return new Action
		(
			"ShowMenu",
			(universe: Universe, world: World, place: Place, actor: Entity) =>
			{
				var venueNext: Venue = VenueControls.fromControl
				(
					universe.controlBuilder.gameAndSettings1(universe)
				);
				venueNext = VenueFader.fromVenuesToAndFrom
				(
					venueNext, universe.venueCurrent
				);
				universe.venueNext = venueNext;
			}
		);
	}

	static actionTurnLeft(): Action
	{
		return new Action
		(
			"TurnLeft",
			(universe: Universe, world: World, place: Place, actor: Entity) =>
			{
				EntityExtensions.ship(actor).turnLeft(world as WorldExtended, actor);
			}
		);
	}

	static actionTurnRight(): Action
	{
		return new Action
		(
			"TurnRight",
			(universe: Universe, world: World, place: Place, actor: Entity) =>
			{
				EntityExtensions.ship(actor).turnRight(world as WorldExtended, actor);
			}
		);
	}

	static actions(): Action[]
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

	activityApproachPlayer
	(
		universe: Universe, worldAsWorld: World, place: Place, actor: Entity
	): void
	{
		var world = worldAsWorld as WorldExtended;

		var target = place.entitiesByName.get("Player");
		var targetPos = target.locatable().loc.pos;
		var actorLoc = actor.locatable().loc;
		var actorPos = actorLoc.pos;

		var targetDisplacement = targetPos.clone().subtract(actorPos);

		var targetDistance = targetDisplacement.magnitude();
		var ship = EntityExtensions.ship(actor);

		if (targetDistance < ship.defn(world).sensorRange)
		{
			var forwardAsPolar = Polar.create().fromCoords(actorLoc.orientation.forward);
			var angleForward = forwardAsPolar.azimuthInTurns;

			var targetDisplacementAsPolar = Polar.create().fromCoords(targetDisplacement);
			var angleToTarget = targetDisplacementAsPolar.azimuthInTurns;

			var angleTargetMinusForward =
				NumberHelper.subtractWrappedToRangeMax(angleToTarget, angleForward, 1);

			if (angleTargetMinusForward != 0)
			{
				var directionToTurn = angleTargetMinusForward / Math.abs(angleTargetMinusForward);
				ship.turnInDirection(world, actor, directionToTurn);
			}

			ship.accelerate(world, actor);
		}
	}

	static actionToInputsMappings(): ActionToInputsMapping[]
	{
		var returnValues =
		[
			new ActionToInputsMapping("ShowMenu", ["Escape"], null),

			new ActionToInputsMapping("TurnLeft", ["ArrowLeft", "Gamepad0Left"], null),
			new ActionToInputsMapping("TurnRight", ["ArrowRight", "Gamepad0Right"], null),
			new ActionToInputsMapping("Accelerate", ["ArrowUp", "Gamepad0Up"], null),

		];//.addLookupsMultiple(function(x) { return x.inputNames; } );

		return returnValues;
	}

	static manyFromDefns(defns: ShipDefn[]): Ship[]
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

	crewCurrentOverMax(world: WorldExtended): string
	{
		return this.crew + "/" + this.defn(world).crewMax;
	}

	defn(world: WorldExtended): ShipDefn
	{
		return world.defnExtended().shipDefnByName(this.defnName);
	}

	energyCurrentOverMax(world: WorldExtended): string
	{
		return Math.floor(this.energy) + "/" + this.defn(world).energyMax;
	}

	fullName(world: WorldExtended): string
	{
		return this.defn(world).factionName + " " + this.defnName;
	}

	fullNameAndCrew(world: WorldExtended): string
	{
		return this.fullName(world) + "(" + this.crewCurrentOverMax(world) + ")";
	}

	// EntityProperty.

	finalize(universe: Universe, world: World, place: Place, entityShip: Entity): void
	{}

	initialize
	(
		universe: Universe, world: World, place: Place, entityShip: Entity
	): void
	{
		var defn = this.defn(world as WorldExtended);

		if (this.crew == null)
		{
			this.crew = defn.crewMax;
			this.energy = defn.energyMax;
		}
	}

	updateForTimerTick
	(
		universe: Universe, world: World, place: Place, entityShip: Entity
	): void
	{
		var ship = EntityExtensions.ship(entityShip);
		var shipDefn = ship.defn(world as WorldExtended);
		ship.energy += shipDefn.energyPerTick;
		if (ship.energy > shipDefn.energyMax)
		{
			ship.energy = shipDefn.energyMax;
		}
	}

	// movement

	accelerate(world: WorldExtended, entity: Entity): void
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

	turnInDirection
	(
		world: WorldExtended, entity: Entity, direction: number
	): void
	{
		var entityLoc = entity.locatable().loc;
		var entityOrientation = entityLoc.orientation;
		var entityForward = entityOrientation.forward;
		var entityShip = EntityExtensions.ship(entity);
		var ship =
		(
			entityShip == null
			? EntityExtensions.shipGroup(entity).ships[0]
			: entityShip
		);
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

	turnLeft(world: WorldExtended, entity: Entity): void
	{
		this.turnInDirection(world, entity, -1);
	}

	turnRight(world: WorldExtended, entity: Entity): void
	{
		this.turnInDirection(world, entity, 1);
	}

	// controls

	toControlSidebar
	(
		containerSidebarSize: Coords, indexTopOrBottom: number, world: WorldExtended
	): ControlBase
	{
		var ship = this;

		var marginWidth = containerSidebarSize.x / 10;
		var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);

		var containerShipSize = Coords.fromXY
		(
			containerSidebarSize.x - marginSize.x * 2,
			(containerSidebarSize.y - marginSize.y * 3) / 2
		);

		var fontHeight = 20;

		var fontHeightShort = fontHeight / 2;
		var labelSizeShort = Coords.fromXY(containerShipSize.x / 2, fontHeightShort);

		var defn = this.defn(world);

		var returnValue = ControlContainer.from4
		(
			"containerShip",
			Coords.fromXY
			(
				marginSize.x,
				marginSize.y + (containerShipSize.y + marginSize.y) * indexTopOrBottom
			),
			containerShipSize,
			[
				new ControlLabel
				(
					"labelName",
					Coords.fromXY
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
					Coords.fromXY
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
					Coords.fromXY
					(
						marginSize.x / 2 + labelSizeShort.x,
						marginSize.y * 2 + labelSizeShort.y
					), // pos
					labelSizeShort,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						ship, (c: Ship) => c.crewCurrentOverMax(world)
					),
					fontHeightShort
				),

				new ControlLabel
				(
					"labelEnergy",
					Coords.fromXY(marginSize.x, marginSize.y * 3 + labelSizeShort.y * 2), // pos
					labelSizeShort,
					false, // isTextCentered
					"Energy:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoEnergy",
					Coords.fromXY
					(
						marginSize.x / 2 + labelSizeShort.x,
						marginSize.y * 3 + labelSizeShort.y * 2
					), // pos
					labelSizeShort,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						ship, (c: Ship) => c.energyCurrentOverMax(world)
					),
					fontHeightShort
				),
			]
		);

		return returnValue;
	}
}
