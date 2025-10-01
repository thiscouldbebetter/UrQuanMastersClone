
class Ship extends EntityPropertyBase<Ship>
{
	name: string;
	defnName: string;
	captainName: string;

	crew: number;
	energy: number;

	constructor(defnName: string)
	{
		super();

		this.defnName = defnName;

		this.name =
			"Ship " + ("" + Math.random()).split(".").join(""); // todo

		this.captainName =
			"Captain " + ("" + Math.random()).split(".").join(""); // todo
	}

	static fromDefnName(defnName: string): Ship
	{
		return new Ship(defnName);
	}

	static fromEntity(shipEntity: Entity): Ship
	{
		return shipEntity.propertyByName(Ship.name) as Ship;
	}

	static manyFromDefnNameAndCount(defnName: string, count: number): Ship[]
	{
		var ships = new Array<Ship>();
		for (var i = 0; i < count; i++)
		{
			var ship = Ship.fromDefnName(defnName);
			ships.push(ship);
		}
		return ships;
	}

	// temporary variables

	static _polar = Polar.create();

	// static methods

	static actionAccelerate(): Action
	{
		return new Action
		(
			"Accelerate",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var ship = Ship.fromEntity(uwpe.entity);
				ship.accelerate(uwpe);
			}
		);
	}

	static actionFire(): Action
	{
		var returnValue = new Action
		(
			"Fire",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var universe = uwpe.universe;
				var world = uwpe.world as WorldExtended;
				var place = uwpe.place;
				var actor = uwpe.entity;

				var ship = Ship.fromEntity(actor);
				var shipDefn = ship.defn(world);
				var attackDefn = shipDefn.attackDefn;
				if (ship.energy >= attackDefn.energyToUse)
				{
					ship.energy -= attackDefn.energyToUse;
					attackDefn.activate2(universe, world, place, actor);
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
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var universe = uwpe.universe;
				var world = uwpe.world as WorldExtended;
				var place = uwpe.place;
				var actor = uwpe.entity;

				var ship = Ship.fromEntity(actor);
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
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var universe = uwpe.universe;

				var venueNext: Venue = VenueControls.fromControl
				(
					universe.controlBuilder.gameAndSettings1(universe)
				);
				venueNext = VenueFader.fromVenuesToAndFrom
				(
					venueNext, universe.venueCurrent()
				);
				universe.venueNextSet(venueNext);
			}
		);
	}

	static actionTurnLeft(): Action
	{
		return new Action
		(
			"TurnLeft",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				Ship.fromEntity(uwpe.entity).turnLeft(uwpe);
			}
		);
	}

	static actionTurnRight(): Action
	{
		return new Action
		(
			"TurnRight",
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				Ship.fromEntity(uwpe.entity).turnRight(uwpe);
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
			PlaceHyperspace.actionMapView(),
		];

		return returnValues;
	}

	static actionToInputsMappings(): ActionToInputsMapping[]
	{
		var inactivateTrue = true;
		var inactivateFalse = false;

		var returnValues =
		[
			new ActionToInputsMapping("ShowMenu", ["Escape"], inactivateTrue),

			new ActionToInputsMapping("TurnLeft", [ "a", "ArrowLeft", "Gamepad0Left"], inactivateFalse),
			new ActionToInputsMapping("TurnRight", [ "d", "ArrowRight", "Gamepad0Right"], inactivateFalse),
			new ActionToInputsMapping("Accelerate", [ "w", "ArrowUp", "Gamepad0Up"], inactivateFalse),

			new ActionToInputsMapping("Fire", [ "f", "Enter", "Gamepad0Button0"], inactivateTrue),
			new ActionToInputsMapping("Special", [ "g", "Enter", "Gamepad0Button1"], inactivateTrue),

			new ActionToInputsMapping("MapView", [ "Tab", "Gamepad0Button2" ], inactivateTrue),
		];

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

	collide(uwpe: UniverseWorldPlaceEntities)
	{
		// todo
	}

	crewCurrentOverMax(uwpe: UniverseWorldPlaceEntities): string
	{
		return this.crew + "/" + this.crewMax(uwpe);
	}

	crewMax(uwpe: UniverseWorldPlaceEntities): number
	{
		var world = uwpe.world as WorldExtended;
		var defn = this.defn(world);
		var crewMax = defn.crewMax(uwpe);
		return crewMax;
	}

	crewSet(value: number): Ship
	{
		this.crew = value;
		return this;
	}

	crewSetToMax(uwpe: UniverseWorldPlaceEntities): Ship
	{
		var crewMax = this.crewMax(uwpe);
		return this.crewSet(crewMax);
	}

	defn(world: WorldExtended): ShipDefn
	{
		return world.defnExtended().shipDefnByName(this.defnName);
	}

	die(uwpe: UniverseWorldPlaceEntities): void
	{
		var place = uwpe.place as PlaceCombat;
		var entityShipToDie = uwpe.entity;

		var ship = Ship.fromEntity(entityShipToDie);
		var combat = place.combat;
		ArrayHelper.remove(combat.shipsFighting, ship);
		var shipGroups = combat.shipGroups;

		for (var g = 0; g < shipGroups.length; g++)
		{
			var shipGroup = shipGroups[g];
			var shipsAll = shipGroup.shipsGetAll();
			if (ArrayHelper.contains(shipsAll, ship))
			{
				ArrayHelper.remove(shipsAll, ship);
				shipGroup.shipLostAdd(ship);
			}
		}

		var visualToRecycle =
			Drawable.of(entityShipToDie).visual as VisualWrapped;
		visualToRecycle.child =
			VisualCircle.fromRadiusAndColorFill(32, Color.Instances().Red);

		Locatable.of(entityShipToDie).loc.vel.clear();

		var entityExplosion = new Entity
		(
			"Explosion",
			[
				new Ephemeral(64, place.roundOver),
				Drawable.fromVisual(visualToRecycle),
				Locatable.of(entityShipToDie),
			]
		);

		place.entityToSpawnAdd(entityExplosion);
	}

	energyCurrentOverMax(uwpe: UniverseWorldPlaceEntities): string
	{
		return Math.floor(this.energy) + "/" + this.energyMax(uwpe);
	}

	energyMax(uwpe: UniverseWorldPlaceEntities): number
	{
		var world = uwpe.world as WorldExtended;
		return this.defn(world).energyMax(uwpe);
	}

	fullName(uwpe: UniverseWorldPlaceEntities): string
	{
		var world = uwpe.world as WorldExtended;
		return this.defn(world).factionName + " " + this.defnName;
	}

	fullNameAndCrew(uwpe: UniverseWorldPlaceEntities): string
	{
		return this.fullName(uwpe) + "(" + this.crewCurrentOverMax(uwpe) + ")";
	}

	toEntity(uwpe: UniverseWorldPlaceEntities): Entity
	{
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlaceCombat;

		var actor = Actor.default();

		var entityDimension = 32; // todo
		var shipCollider = Sphere.fromRadius(entityDimension / 2);
		var collidable = new Collidable
		(
			false, // canCollideAgainWithoutSeparating
			false, // exemptFromEffectsOfOther
			null, // ticks
			shipCollider,
			[ Collidable.name ], // entityPropertyNamesToCollideWith
			this.collide
		);

		var constraintWrapToRange = new Constraint_WrapToPlaceSize();
		var constrainable = new Constrainable
		([
			constraintWrapToRange
		]);

		var defn = this.defn(world);
		var shipVisualBody = defn.visual;
		var shipVisual = new VisualWrapped
		(
			place.size(), shipVisualBody
		);
		var drawable = Drawable.fromVisual(shipVisual);

		var itemHolder = ItemHolder.create();

		var killable = Killable.fromIntegrityMaxAndDie(this.crew, this.die);

		var shipPos = Coords.create();
		var shipLoc = Disposition.fromPos(shipPos);
		var locatable = new Locatable(shipLoc);

		var movable = Movable.fromSpeedMax(5);

		var shipEntityProperties = new Array<EntityProperty>
		(
			actor,
			collidable,
			constrainable,
			drawable,
			itemHolder,
			killable,
			locatable,
			movable,
			this
		);

		var shipEntity = new Entity
		(
			this.name,
			shipEntityProperties
		);

		return shipEntity;
	}


	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		var world = uwpe.world as WorldExtended;

		var defn = this.defn(world);

		if (this.crew == null)
		{
			this.crew = defn.crewInitial;
		}
		if (this.energy == null)
		{
			this.energy = defn.energyMax(uwpe);
		}
	}

	propertyName(): string { return Ship.name; }

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		var world = uwpe.world;
		var entityShip = uwpe.entity;

		var ship = Ship.fromEntity(entityShip);
		var shipDefn = ship.defn(world as WorldExtended);
		var energyPerTick = shipDefn.energyPerTick(uwpe);
		ship.energy += energyPerTick;
		var energyMax = shipDefn.energyMax(uwpe);
		if (ship.energy > energyMax)
		{
			ship.energy = energyMax;
		}
	}

	// movement

	accelerate(uwpe: UniverseWorldPlaceEntities): void
	{
		var entity = uwpe.entity;
		var entityShipGroup = ShipGroupFinite.fromEntity(entity);
		var ship =
		(
			entityShipGroup != null
			? entityShipGroup.shipFirst()
			: Ship.fromEntity(entity)
		);
		var world = uwpe.world as WorldExtended;
		var shipDefn = ship.defn(world);
		var shipLoc = Locatable.of(entity).loc;
		var shipForward = shipLoc.orientation.forward;
		shipLoc.accel.overwriteWith(shipForward).multiplyScalar
		(
			shipDefn.acceleration(uwpe)
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
		uwpe: UniverseWorldPlaceEntities, direction: number
	): void
	{
		var entity = uwpe.entity;
		var entityLoc = Locatable.of(entity).loc;
		var entityOrientation = entityLoc.orientation;
		var entityForward = entityOrientation.forward;
		var entityShip = Ship.fromEntity(entity);
		var ship =
		(
			entityShip == null
			? ShipGroupFinite.fromEntity(entity).shipFirst()
			: entityShip
		);
		var world = uwpe.world as WorldExtended;
		var shipDefn = ship.defn(world);
		var turnsPerTick = shipDefn.turnsPerTick(uwpe);
		var entityForwardNew =
			Ship._polar
				.fromCoords(entityForward)
				.addToAzimuthInTurns(turnsPerTick * direction)
				.wrap()
				.overwriteCoords(entityForward);
		entityOrientation.forwardSet(entityForwardNew);
	}

	turnLeft(uwpe: UniverseWorldPlaceEntities): void
	{
		this.turnInDirection(uwpe, -1);
	}

	turnRight(uwpe: UniverseWorldPlaceEntities): void
	{
		this.turnInDirection(uwpe, 1);
	}

	// Clonable.

	clone(): Ship
	{
		throw new Error("todo");
	}

	overwriteWith(other: Ship): Ship
	{
		throw new Error("todo");
	}

	// controls

	toControlSidebar
	(
		containerSidebarSize: Coords,
		indexTopOrBottom: number,
		uwpe: UniverseWorldPlaceEntities
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
		//var font = FontNameAndHeight.fromHeightInPixels(fontHeight);

		var fontHeightShort = fontHeight / 2;
		var fontShort = FontNameAndHeight.fromHeightInPixels(fontHeightShort);
		var labelSizeWide = Coords.fromXY(containerShipSize.x - marginSize.x * 2, fontHeightShort);
		var labelSizeShort = Coords.fromXY(containerShipSize.x / 2, fontHeightShort);

		var world = uwpe.world as WorldExtended;
		var defn = this.defn(world);

		var childControls =
		[
			ControlLabel.fromPosSizeTextFontUncentered
			(
				Coords.fromXY
				(
					marginSize.x,
					marginSize.y
				), // pos
				labelSizeWide,
				DataBinding.fromContext(defn.factionName),
				fontShort
			),

			ControlLabel.fromPosSizeTextFontUncentered
			(
				Coords.fromXY
				(
					marginSize.x,
					marginSize.y * 2 + labelSizeShort.y
				), // pos
				labelSizeShort,
				DataBinding.fromContext("Crew:"),
				fontShort
			),

			ControlLabel.fromPosSizeTextFontUncentered
			(
				Coords.fromXY
				(
					marginSize.x / 2 + labelSizeShort.x,
					marginSize.y * 2 + labelSizeShort.y
				), // pos
				labelSizeShort,
				DataBinding.fromContextAndGet
				(
					ship, (c: Ship) => c.crewCurrentOverMax(uwpe)
				),
				fontShort
			),

			ControlLabel.fromPosSizeTextFontUncentered
			(
				Coords.fromXY(marginSize.x, marginSize.y * 3 + labelSizeShort.y * 2), // pos
				labelSizeShort,
				DataBinding.fromContext("Energy:"),
				fontShort
			),

			ControlLabel.fromPosSizeTextFontUncentered
			(
				Coords.fromXY
				(
					marginSize.x / 2 + labelSizeShort.x,
					marginSize.y * 3 + labelSizeShort.y * 2
				), // pos
				labelSizeShort,
				DataBinding.fromContextAndGet
				(
					ship,
					(c: Ship) => c.energyCurrentOverMax(uwpe)
				),
				fontShort
			),
		];

		var returnValue = ControlContainer.fromNamePosSizeAndChildren
		(
			"containerShip",
			Coords.fromXY
			(
				marginSize.x,
				marginSize.y + (containerShipSize.y + marginSize.y) * indexTopOrBottom
			),
			containerShipSize,
			childControls
		);

		return returnValue;
	}

	// Equatable.

	equals(other: Ship): boolean { return false; }
}
