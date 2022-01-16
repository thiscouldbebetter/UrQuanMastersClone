
class Combat
{
	size: Coords;
	encounter: Encounter;
	shipGroups: ShipGroup[];

	shipsFighting: Ship[];

	_differenceOfWrapAndNoWrap: Coords;
	_displacement: Coords
	_displacementAbsolute: Coords
	_displacementWrapped: Coords
	_displacementWrappedAbsolute: Coords
	_midpointBetweenPoints: Coords

	constructor(size: Coords, encounter: Encounter, shipGroups: ShipGroup[])
	{
		this.size = size;
		this.encounter = encounter;
		this.shipGroups = shipGroups;
		this.shipsFighting = [];

		this._differenceOfWrapAndNoWrap	= Coords.create();
		this._displacement = Coords.create();
		this._displacementAbsolute = Coords.create();
		this._displacementWrapped = Coords.create();
		this._displacementWrappedAbsolute = Coords.create();
		this._midpointBetweenPoints = Coords.create();
	}

	enemyActivityDefn()
	{
		return new ActivityDefn("Enemy", this.enemyActivityDefnPerform);
	}

	enemyActivityDefnPerform
	(
		uwpe: UniverseWorldPlaceEntities
	)
	{
		var world = uwpe.world as WorldExtended;
		var place = uwpe.place as PlaceCombat;
		var actor = uwpe.entity;

		var actorShip = Ship.fromEntity(actor);

		var entitiesShips = place.entitiesShips();
		var target = (entitiesShips[0] == actor ? entitiesShips[1] : entitiesShips[0]);
		var targetPos = target.locatable().loc.pos;
		var actorLoc = actor.locatable().loc;
		var actorPos = actorLoc.pos;
		var actorVel = actorLoc.vel;
		var combat = place.combat;

		var targetDisplacement = combat.displacementOfPointsWrappedToRange
		(
			actorVel, // displacementToOverwrite
			actorPos,
			targetPos,
			combat.size
		);

		var forwardAsPolar = Polar.create().fromCoords(actorLoc.orientation.forward);
		var angleForward = forwardAsPolar.azimuthInTurns;

		var targetDisplacementAsPolar = Polar.create().fromCoords(targetDisplacement);
		var angleToTarget = targetDisplacementAsPolar.azimuthInTurns;

		var angleTargetMinusForward =
			NumberHelper.subtractWrappedToRangeMax(angleToTarget, angleForward, 1);

		if (angleTargetMinusForward != 0)
		{
			var directionToTurn = angleTargetMinusForward / Math.abs(angleTargetMinusForward);
			actorShip.turnInDirection(world, actor, directionToTurn);
		}

		actorShip.accelerate(world, actor);
	}

	exit(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var shipsDestroyed = this.shipGroups[1].shipsLost;
		var creditsForShipsDestroyed = 0;
		shipsDestroyed.forEach
		(
			x => creditsForShipsDestroyed += x.defn(world).value
		);
		var player = world.player;
		player.resourceCredits += creditsForShipsDestroyed;

		world.placeNext = this.encounter.placeToReturnTo;
		universe.venueNext = new VenueWorld(world);
	}

	fight(universe: Universe): void
	{
		var world = universe.world;
		var placeCombat = world.placeCurrent as PlaceCombat;
		var uwpe = new UniverseWorldPlaceEntities(universe, world, placeCombat, null, null);

		for (var i = 0; i < this.shipsFighting.length; i++)
		{
			var ship = this.shipsFighting[i];
			var shipEntity = ship.toEntity(uwpe);
			if (placeCombat.entityById(shipEntity.id) == null)
			{
				placeCombat.entityToSpawnAdd(shipEntity);
			}
		}
		var venueControls = placeCombat.venueControls;
		venueControls.controlRoot = this.toControlSidebar(universe.world as WorldExtended);
	}

	initialize(universe: Universe, world: World, place: Place): Combat
	{
		var uwpe = new UniverseWorldPlaceEntities
		(
			universe, world, place, null, null
		);

		for (var i = 0; i < this.shipGroups.length; i++)
		{
			var shipGroup = this.shipGroups[i];
			shipGroup.initialize(uwpe);
		}

		return this;
	}

	shipsFightingHaveBeenSpecified(): boolean
	{
		return ( this.shipsFighting[0] != null && this.shipsFighting[1] != null );
	}

	toPlace(world: World): PlaceCombat
	{
		return new PlaceCombat(world, this);
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities)
	{
		if (this.shipsFighting[1] == null)
		{
			this.shipsFighting[1] = this.shipGroups[1].shipSelected;
		}
	}

	// wrapping

	displacementOfPointsWrappedToRange(displacementToOverwrite: Coords, pos0: Coords, pos1: Coords, size: Coords): Coords
	{
		var displacement = pos1.clone().subtract(pos0);
		var displacementMinSoFar = displacement.clone();
		var displacementMinSoFarAbsolute = displacementMinSoFar.clone().absolute();

		for (var i = -1; i <= 1; i += 2)
		{
			var displacementWrapped = size.clone().multiplyScalar(i).add(pos1).subtract(pos0);
			var displacementWrappedAbsolute = displacementWrapped.clone().absolute();
			if (displacementWrappedAbsolute.x < displacementMinSoFarAbsolute.x)
			{
				displacementMinSoFar.x = displacementWrapped.x;
				displacementMinSoFarAbsolute.x = displacementMinSoFarAbsolute.x;
			}
			if (displacementWrappedAbsolute.y < displacementMinSoFarAbsolute.y)
			{
				displacementMinSoFar.y = displacementWrapped.y;
				displacementMinSoFarAbsolute.y = displacementMinSoFarAbsolute.y;
			}
		}

		return displacementMinSoFar;
	}

	midpointOfPointsWrappedToRange(midpointToOverwrite: Coords, pos0: Coords, pos1: Coords, size: Coords): Coords
	{
		var displacement = this.displacementOfPointsWrappedToRange(midpointToOverwrite, pos0, pos1, size);
		var midpoint = displacement.half().add(pos0);
		return midpoint;
	}

	// controls

	toControlDebriefing(universe: Universe, size: Coords): ControlBase
	{
		var world = universe.world as WorldExtended;

		var shipsLost = this.shipGroups[0].shipsLost;
		var shipsDestroyed = this.shipGroups[1].shipsLost;

		var numberOfShipsLost = shipsLost.length;
		var numberOfShipsDestroyed = shipsDestroyed.length;

		var creditsSalvaged = 0;
		shipsDestroyed.forEach
		(
			x => creditsSalvaged += x.defn(world).value
		);

		var message =
			"Combat complete.\n"
			+ numberOfShipsLost + " ships lost.\n"
			+ numberOfShipsDestroyed + " ships destroyed.\n"
			+ creditsSalvaged + " credits worth of resources salvaged.\n";

		var returnValue = universe.controlBuilder.message
		(
			universe,
			size,
			DataBinding.fromContext(message),
			() => this.exit(universe),
			null
		);
		return returnValue;
	}

	toControlShipSelect(universe: Universe, size: Coords): ControlBase
	{
		var combat = this;
		var world = universe.world as WorldExtended;

		// todo - Variable sizes.

		var marginWidth = 10;
		var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
		var fontHeightTitle = size.x / 20;
		var fontHeight = fontHeightTitle / 2;
		var titleSize = Coords.fromXY(size.x - marginSize.x * 2, fontHeightTitle);
		var headingSize = Coords.fromXY((size.x - marginSize.x * 3) / 2, fontHeight);
		var buttonHeight = fontHeightTitle;
		var buttonSizeSelect = Coords.fromXY((titleSize.x - marginSize.x * 3) / 4, buttonHeight);
		var buttonSizeFight = Coords.fromXY(titleSize.x, buttonHeight);
		var listSize = Coords.fromXY
		(
			headingSize.x,
			size.y - titleSize.y - headingSize.y - buttonHeight * 2 - marginSize.y * 6
		);
		var bindingForOptionText = DataBinding.fromGet
		(
			(c: Ship) => c.fullNameAndCrew(world)
		);

		var listShipsYours = ControlList.from9
		(
			"listShipsYours",
			Coords.fromXY
			(
				marginSize.x,
				titleSize.y + headingSize.y + marginSize.y * 3
			),
			listSize,
			DataBinding.fromContextAndGet
			(
				combat, (c: Combat) => c.shipGroups[0].ships
			),
			bindingForOptionText,
			fontHeight,
			new DataBinding
			(
				combat,
				(c: Combat) => c.shipGroups[0].shipSelected,
				(c: Combat, v: Ship) => c.shipGroups[0].shipSelected = v
			), // bindingForItemSelected
			null, // bindingForItemValue
			DataBinding.fromContextAndGet
			(
				combat, (c: Combat) => c.shipsFighting[0] == null
			) // isEnabled
		);

		var listShipsTheirs = ControlList.from9
		(
			"listShipsTheirs",
			Coords.fromXY
			(
				marginSize.x * 2 + listSize.x,
				titleSize.y + headingSize.y + marginSize.y * 3
			),
			listSize,
			DataBinding.fromContextAndGet
			(
				combat, (c: Combat) => c.shipGroups[1].ships
			),
			bindingForOptionText,
			fontHeight,
			new DataBinding
			(
				combat,
				(c: Combat) => c.shipGroups[1].shipSelected,
				(c: Combat, v: Ship) => c.shipGroups[1].shipSelected = v
			), // bindingForItemSelected
			null, // bindingForItemValue
			DataBinding.fromFalse() // isEnabled
		);

		var returnValue = ControlContainer.from4
		(
			"containerShipSelect",
			Coords.Instances().Zeroes,
			size,
			[
				new ControlLabel
				(
					"labelTitle",
					Coords.fromXY(marginSize.x, marginSize.y),
					titleSize,
					true, // isTextCentered
					false, // isTextCenteredVertically
					DataBinding.fromContext("Ship Select"),
					fontHeightTitle
				),

				new ControlLabel
				(
					"labelYours",
					Coords.fromXY(marginSize.x, titleSize.y + marginSize.y * 2),
					titleSize,
					false, // isTextCentered
					false, // isTextCenteredVertically
					DataBinding.fromContext(this.shipGroups[0].name + ":"),
					fontHeight
				),

				listShipsYours,

				new ControlButton
				(
					"buttonSelectYours",
					Coords.fromXY
					(
						marginSize.x,
						size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2
					),
					buttonSizeSelect,
					"Select",
					fontHeight,
					true, // hasBorder
					DataBinding.fromContextAndGet
					(
						combat, (c: Combat) => (c.shipsFighting[0] == null)
					), // isEnabled,
					() =>
					{
						var shipYours = listShipsYours.itemSelected();
						combat.shipsFighting[0] = shipYours;
					},
					false // canBeHeldDown
				),

				new ControlButton
				(
					"buttonRandomYours",
					Coords.fromXY
					(
						marginSize.x * 2 + buttonSizeSelect.x,
						size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2
					),
					buttonSizeSelect,
					"Random",
					fontHeight,
					true, // hasBorder
					DataBinding.fromContextAndGet
					(
						combat, (c: Combat) => (c.shipsFighting[0] == null)
					), // isEnabled,
					() =>
					{
						var shipGroupIndex = 0;
						var shipGroup = combat.shipGroups[shipGroupIndex];
						var ship = ArrayHelper.random(shipGroup.ships, universe.randomizer);
						combat.shipsFighting[shipGroupIndex] = ship;
						shipGroup.shipSelected = ship;
					},
					false // canBeHeldDown
				),

				new ControlLabel
				(
					"labelTheirs",
					Coords.fromXY
					(
						listSize.x + marginSize.x * 2,
						titleSize.y + marginSize.y * 2
					),
					titleSize,
					false, // isTextCentered
					false, // isTextCenteredVertically
					DataBinding.fromContext(this.shipGroups[1].name + ":"),
					fontHeight
				),

				listShipsTheirs,

				new ControlButton
				(
					"buttonSelectTheirs",
					Coords.fromXY
					(
						marginSize.x * 2 + listSize.x,
						size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2
					),
					buttonSizeSelect,
					"Select",
					fontHeight,
					true, // hasBorder
					DataBinding.fromFalse(), // isEnabled,
					() =>
					{
						var shipTheirs = listShipsTheirs.itemSelected();
						combat.shipsFighting[1] = shipTheirs;
					},
					false // canBeHeldDown
				),

				new ControlButton
				(
					"buttonRandomTheirs",
					Coords.fromXY
					(
						marginSize.x * 4 + buttonSizeSelect.x * 3,
						size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2
					),
					buttonSizeSelect,
					"Random",
					fontHeight,
					true, // hasBorder
					DataBinding.fromFalse(), // isEnabled,
					() =>
					{
						var shipGroupIndex = 1;
						var shipGroup = combat.shipGroups[shipGroupIndex];
						var ship = ArrayHelper.random(shipGroup.ships, universe.randomizer);
						combat.shipsFighting[shipGroupIndex] = ship;
						shipGroup.shipSelected = ship;
					},
					false // canBeHeldDown
				),

				new ControlButton
				(
					"buttonFight",
					Coords.fromXY(marginSize.x, size.y - marginSize.y - buttonSizeFight.y),
					buttonSizeFight,
					"Fight",
					fontHeight,
					true, // hasBorder
					DataBinding.fromContextAndGet
					(
						combat,
						(c: Combat) => (c.shipsFighting[0] != null && c.shipsFighting[1] != null)
					), // isEnabled,
					() =>
					{
						var shipYours = combat.shipsFighting[0];
						var shipTheirs = combat.shipsFighting[1];

						if (shipYours != null && shipTheirs != null)
						{
							combat.fight(universe);
						}
					},
					false // canBeHeldDown
				),
			]
		);

		return returnValue;
	}

	toControlSidebar(world: WorldExtended): ControlBase
	{
		var containerSidebarSize = Coords.fromXY(100, 300); // hack

		var shipsFighting = this.shipsFighting;

		var childControls =
		[
			shipsFighting[0].toControlSidebar(containerSidebarSize, 0, world),
			shipsFighting[1].toControlSidebar(containerSidebarSize, 1, world),
		];

		var containerSidebar = ControlContainer.from4
		(
			"containerSidebar",
			Coords.fromXY(300, 0),
			containerSidebarSize,
			childControls
		);

		return containerSidebar;
	}

}
