
class PlaceStationDock extends PlaceBase
{
	placeStation: PlaceStation;

	crewValuePerUnit: number;
	fuelValuePerUnit: number;
	landerValue: number;

	componentToBuild: ShipComponentDefn;
	componentToScrap: ShipComponentDefn;
	shipDefnToBuild: ShipDefn;
	shipInFleetSelected: Ship;
	venueControls: Venue;
	weaponSlotToMove: ShipWeaponSlot;

	constructor(world: World, placeStation: PlaceStation)
	{
		super
		(
			PlaceStationDock.name,
			PlaceStationDock.name,
			null, // parentName
			null, // size
			null // entities
		);
		this.placeStation = placeStation;

		this.crewValuePerUnit = 3;
		this.fuelValuePerUnit = 20;
		this.landerValue = 100;

		this.entityToSpawnAdd(new GameClock(60).toEntity());
	}

	// method

	componentBuild(uwpe: UniverseWorldPlaceEntities, componentToBuild: ShipComponentDefn): void
	{
		if (componentToBuild != null)
		{
			var flagship = (uwpe.world as WorldExtended).player.flagship;
			if (flagship.resourceCredits < componentToBuild.costInResourceCredits)
			{
				throw new Error("Insufficent credit!");
			}
			else
			{
				flagship.resourceCredits -= componentToBuild.costInResourceCredits;
				flagship.componentNames.push(componentToBuild.name);
				flagship.cachesReset();
			}
		}
	}

	componentBuildBackbone(uwpe: UniverseWorldPlaceEntities): void
	{
		var player = (uwpe.world as WorldExtended).player;
		var flagship = player.flagship;
		var componentsBackboneInstalled = flagship.componentsBackbone();
		if (componentsBackboneInstalled.length < flagship.componentsBackboneMax)
		{
			this.componentBuild(uwpe, this.componentToBuild);
		}
	}

	componentBuildThruster(uwpe: UniverseWorldPlaceEntities): void
	{
		var player = (uwpe.world as WorldExtended).player;
		var flagship = player.flagship;
		var thrustersInstalled = flagship.componentsThruster();
		if (thrustersInstalled.length < flagship.thrustersMax)
		{
			var componentName = thrustersInstalled[0].name;
			var componentToBuild = ShipComponentDefn.byName(componentName);
			this.componentBuild(uwpe, componentToBuild);
		}
	}

	componentBuildTurningJets(uwpe: UniverseWorldPlaceEntities): void
	{
		var player = (uwpe.world as WorldExtended).player;
		var flagship = player.flagship;
		var turningJetsInstalled = flagship.componentsTurningJets();
		if (turningJetsInstalled.length < flagship.turningJetsMax)
		{
			var componentName = turningJetsInstalled[0].name;
			var componentToBuild = ShipComponentDefn.byName(componentName);
			this.componentBuild(uwpe, componentToBuild);
		}
	}

	componentBuildWithName(uwpe: UniverseWorldPlaceEntities, componentName: string): void
	{
		var world = uwpe.world as WorldExtended;
		var player = world.player;
		var componentsKnown = player.shipComponentDefnsKnown();
		var componentToBuild = componentsKnown.find(x => x.name == componentName);
		if (componentToBuild == null)
		{
			throw new Error("No component with name '" + componentName + "' is known.");
		}
		else
		{
			this.componentBuild(uwpe, componentToBuild);
		}
	}

	componentScrap(uwpe: UniverseWorldPlaceEntities, componentToScrap: ShipComponentDefn): void
	{
		if (componentToScrap != null)
		{
			var flagship = (uwpe.world as WorldExtended).player.flagship;
			ArrayHelper.remove(flagship.componentNames, componentToScrap.name);
			flagship.resourceCredits += componentToScrap.costInResourceCredits;
			flagship.cachesReset();
		}
	}

	componentScrapBackbone(uwpe: UniverseWorldPlaceEntities): void
	{
		this.componentScrap(uwpe, this.componentToScrap);
	}

	componentScrapThruster(uwpe: UniverseWorldPlaceEntities): void
	{
		var player = (uwpe.world as WorldExtended).player;
		var thrustersInstalled = player.flagship.componentsThruster();
		var componentToScrap = thrustersInstalled[1]; // Cannot remove last.
		this.componentScrap(uwpe, componentToScrap);
	}

	componentScrapTurningJets(uwpe: UniverseWorldPlaceEntities): void
	{
		var player = (uwpe.world as WorldExtended).player;
		var turningJetsInstalled = player.flagship.componentsTurningJets();
		var componentToScrap = turningJetsInstalled[1]; // Cannot remove last.
		this.componentScrap(uwpe, componentToScrap);
	}

	crewAdd(uwpe: UniverseWorldPlaceEntities, crewToAdd: number): void
	{
		// todo
		// Keep track of how many crew have been lost,
		// and raise the price if it's too many.

		var world = uwpe.world as WorldExtended;
		var ship = this.shipInFleetSelected;
		var crewMax = ship.crewMax(uwpe);
		var crewBefore = ship.crew;
		var crewAfter = crewBefore + crewToAdd;
		if (crewAfter <= crewMax)
		{
			var flagship = world.player.flagship;
			var crewCost = crewToAdd * this.crewValuePerUnit;
			if (flagship.resourceCredits >= crewCost)
			{
				flagship.resourceCredits -= crewCost;
				ship.crew += crewToAdd;
			}
		}
	}

	crewAddOne(uwpe: UniverseWorldPlaceEntities): void
	{
		this.crewAdd(uwpe, 1);
	}

	crewAddToCapacity(uwpe: UniverseWorldPlaceEntities): void
	{
		var ship = this.shipInFleetSelected;
		var crewMax = ship.crewMax(uwpe);
		var crewToAdd = crewMax - ship.crew;
		this.crewAdd(uwpe, crewToAdd);
	}

	crewRemove(uwpe: UniverseWorldPlaceEntities, crewToRemove: number): void
	{
		var ship = this.shipInFleetSelected;
		if (ship.crew >= crewToRemove)
		{
			var flagship = (uwpe.world as WorldExtended).player.flagship;
			var crewValue = crewToRemove * this.crewValuePerUnit;
			flagship.resourceCredits += crewValue;
			ship.crew -= crewToRemove;
		}
	}

	crewRemoveAll(uwpe: UniverseWorldPlaceEntities): void
	{
		var ship = this.shipInFleetSelected;
		this.crewRemove(uwpe, ship.crew);
	}

	crewRemoveOne(uwpe: UniverseWorldPlaceEntities): void
	{
		this.crewRemove(uwpe, 1);
	}

	fuelBuy(uwpe: UniverseWorldPlaceEntities, fuelUnitsToBuy: number): void
	{
		var flagship = (uwpe.world as WorldExtended).player.flagship;

		var fuelMax = flagship.fuelMax();

		if (flagship.fuel + fuelUnitsToBuy > fuelMax)
		{
			fuelUnitsToBuy = fuelMax - flagship.fuel;
		}

		var fuelToBuyCost =
			fuelUnitsToBuy * this.fuelValuePerUnit;

		if (flagship.resourceCredits >= fuelToBuyCost && flagship.fuel < fuelMax)
		{
			var fuelValue = this.fuelValuePerUnit * fuelUnitsToBuy;
			flagship.resourceCredits -= fuelValue;
			flagship.fuelAdd(fuelUnitsToBuy);
		}
	}

	fuelBuyOneUnit(uwpe: UniverseWorldPlaceEntities): void
	{
		this.fuelBuy(uwpe, 1);
	}

	fuelBuyToMax(uwpe: UniverseWorldPlaceEntities): void
	{
		var flagship = (uwpe.world as WorldExtended).player.flagship;
		var fuelMax = flagship.fuelMax();
		this.fuelBuy(uwpe, fuelMax - flagship.fuel);
	}

	fuelSell(uwpe: UniverseWorldPlaceEntities, fuelUnitsToSell: number): void
	{
		var flagship = (uwpe.world as WorldExtended).player.flagship;

		if (flagship.fuel < fuelUnitsToSell)
		{
			fuelUnitsToSell = flagship.fuel;
		}

		var fuelValue = fuelUnitsToSell * this.fuelValuePerUnit;
		flagship.resourceCredits += fuelValue;
		flagship.fuelSubtract(fuelUnitsToSell);
	}

	fuelSellOneUnit(uwpe: UniverseWorldPlaceEntities): void
	{
		return this.fuelSell(uwpe, 1);
	}

	fuelSellAll(uwpe: UniverseWorldPlaceEntities): void
	{
		var flagship = (uwpe.world as WorldExtended).player.flagship;

		return this.fuelSell(uwpe, flagship.fuel);
	}

	landerAdd(uwpe: UniverseWorldPlaceEntities): void
	{
		var flagship = (uwpe.world as WorldExtended).player.flagship;
		if (flagship.resourceCredits >= this.landerValue)
		{
			flagship.resourceCredits -= this.landerValue;
			flagship.numberOfLanders++;
		}
	}

	landerRemove(uwpe: UniverseWorldPlaceEntities): void
	{
		var player = (uwpe.world as WorldExtended).player;
		var flagship = player.flagship;
		if (flagship.numberOfLanders > 0)
		{
			flagship.numberOfLanders--;
			flagship.resourceCredits += this.landerValue;
		}
	}

	leave(world: World): void
	{
		world.placeNextSet(this.placeStation);
	}

	offload(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var player = world.player;
		var flagship = player.flagship;
		flagship.cargoSell(world);
	}

	shipBuild(universe: Universe): void
	{
		var shipDefnToBuild = this.shipDefnToBuild;
		if (shipDefnToBuild != null)
		{
			var world = universe.world as WorldExtended;
			var player = world.player;
			var flagship = player.flagship;
			var shipGroup = player.shipGroup;
			if (shipGroup.ships.length < flagship.shipsMax)
			{
				var shipValue = shipDefnToBuild.costToBuild;
				if (flagship.resourceCredits >= shipValue)
				{
					flagship.resourceCredits -= shipValue;
					var ship = new Ship(shipDefnToBuild.name);
					ship.initialize
					(
						new UniverseWorldPlaceEntities
						(
							universe, world, this, null, null
						)
					);
					shipGroup.ships.push(ship);
				}
			}
		}
	}

	shipSelectByDefnName(universe: Universe,shipDefnName: string): PlaceStationDock
	{
		var player = (universe.world as WorldExtended).player;
		var ships = player.ships();

		if (this.shipInFleetSelected == null)
		{
			this.shipInFleetSelected = ships[0];
		}
		else
		{
			var shipToSelectIndex = ships.indexOf(this.shipInFleetSelected);
			shipToSelectIndex++;
			if (shipToSelectIndex >= ships.length)
			{
				shipToSelectIndex = 0;
			}
			var shipToSelect = ships[shipToSelectIndex];
			this.shipInFleetSelected = shipToSelect;
		}

		return this;
	}

	shipSelectNext(universe: Universe): PlaceStationDock
	{
		var world = universe.world as WorldExtended;
		var player = world.player;
		var ships = player.ships();

		if (this.shipInFleetSelected == null)
		{
			this.shipInFleetSelected = ships[0];
		}
		else
		{
			var shipToSelectIndex = ships.indexOf(this.shipInFleetSelected);
			shipToSelectIndex++;
			if (shipToSelectIndex >= ships.length)
			{
				shipToSelectIndex = 0;
			}
			var shipToSelect = ships[shipToSelectIndex];
			this.shipInFleetSelected = shipToSelect;
		}

		return this;
	}

	shipScrap(universe: Universe): PlaceStationDock
	{
		var world = universe.world as WorldExtended;
		var shipToScrap = this.shipInFleetSelected;
		if (shipToScrap != null)
		{
			var player = world.player;
			if (true) // shipToScrap != player.flagship)
			{
				var shipToScrapDefn = shipToScrap.defn(world);
				var crewTransferredBackToStation = shipToScrap.crew; // todo
				var shipValue =
					shipToScrapDefn.costToBuild
					+ crewTransferredBackToStation * this.crewValuePerUnit;
				var flagship = world.player.flagship;
				flagship.resourceCredits += shipValue;
				player.shipRemove(shipToScrap);
			}
		}

		return this;
	}

	// Place

	draw(universe: Universe, world: World): void
	{
		// super.draw(universe, world, null);
		this.venueControls.draw(universe);
	}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		super.initialize(uwpe);
		/*
		var player = (world as WorldExtended).player;
		player.initialize(universe, world, this, player);
		*/
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		super.updateForTimerTick(uwpe);

		var universe = uwpe.universe;
		var world = uwpe.world as WorldExtended;

		if (this.venueControls == null)
		{
			var controlRoot = this.toControl(universe, world);
			this.venueControls = new VenueControls(controlRoot, null);
		}

		this.venueControls.updateForTimerTick(universe);
	}

	// controls

	toControl(universe: Universe, worldAsWorld: World): ControlBase
	{
		var placeStationDock = this;
		var world = worldAsWorld as WorldExtended;
		var uwpe = UniverseWorldPlaceEntities.fromUniverseAndWorld(universe, world);

		var player = world.player;
		var playerItemHolder = player.flagship.itemHolderCargo;
		var playerShipGroup = player.shipGroup;
		var shipsInFleet = playerShipGroup.ships;
		this.shipInFleetSelected = shipsInFleet[0];
		var shipWeaponSlots = ShipWeaponSlot.Instances()._All;

		var containerDockSize = universe.display.sizeInPixels.clone();
		var fontHeight = 20;
		var font = FontNameAndHeight.fromHeightInPixels(fontHeight);
		var fontHeightShort = fontHeight / 2;
		var fontShort = FontNameAndHeight.fromHeightInPixels(fontHeightShort);
		var buttonBackSize = Coords.fromXY(1, 1).multiplyScalar(fontHeightShort * 1.6);
		var marginWidth = 8;
		var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);

		var titleSize = Coords.fromXY(containerDockSize.x, 25);
		var labelSize = Coords.fromXY(100, 10);

		var containerRightSize = Coords.fromXY
		(
			(containerDockSize.x - marginSize.x * 3) * .3,
			containerDockSize.y - marginSize.y * 2 - titleSize.y
		);

		var buttonSizeRight = Coords.fromXY
		(
			containerRightSize.x - marginSize.x * 2,
			fontHeightShort * 2
		);

		var containerLeftSize = Coords.fromXY
		(
			containerDockSize.x - marginSize.x * 3 - containerRightSize.x,
			(containerRightSize.y - marginSize.y) / 2
		);

		var buttonSizeComponents = Coords.fromXY
		(
			(containerLeftSize.x - marginSize.x * 4) / 3,
			fontHeightShort * 1.5
		);

		var buttonSizeShips = Coords.fromXY
		(
			(containerLeftSize.x - marginSize.x * 3) / 2,
			fontHeightShort * 1.5
		);

		var buttonSizeShipsSmall = Coords.fromXY
		(
			(buttonSizeShips.x - marginSize.x * 2) / 3,
			buttonSizeShips.y
		);

		var buttonSizeSmall =
			Coords.fromXY(1, 1).multiplyScalar(buttonSizeShips.y * .8);

		var listComponentsSize = Coords.fromXY
		(
			buttonSizeComponents.x,
			(containerLeftSize.y - labelSize.y * 2 - buttonSizeShips.y - marginSize.y * 5)
		); // size

		var listShipsSize = Coords.fromXY
		(
			buttonSizeShips.x,
			(containerLeftSize.y - labelSize.y - buttonSizeShips.y - marginSize.y * 4)
		); // size

		var shipComponentsInstalled = player.flagship.componentsBackbone();

		var shipComponentDefnsKnownBackbone =
			player.shipComponentDefnsKnownBackbone();

		var containerComponents = ControlContainer.from4
		(
			"containerComponents",
			Coords.fromXY
			(
				marginSize.x,
				marginSize.y + titleSize.y
			),
			containerLeftSize,
			// children
			[
				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y
					),
					labelSize,
					DataBinding.fromContext("Available:"),
					fontShort
				),

				ControlList.from8
				(
					"listComponents",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 2 + labelSize.y
					),
					listComponentsSize,
					DataBinding.fromContextAndGet
					(
						placeStationDock,
						(c: PlaceStationDock) => shipComponentDefnsKnownBackbone
					),
					DataBinding.fromGet
					(
						(c: ShipComponentDefn) => c.name
					), // bindingForItemText
					fontShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.componentToBuild,
						(c: PlaceStationDock, v: ShipComponentDefn) => c.componentToBuild = v
					), // bindingForItemSelected
					DataBinding.fromContext(null) // ?
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 3 + labelSize.y + listComponentsSize.y
					),
					buttonSizeComponents,
					"Build",
					fontShort,
					() => this.componentBuildBackbone(uwpe)
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x * 2 + listComponentsSize.x,
						marginSize.y
					),
					labelSize,
					DataBinding.fromContext("Installed:"),
					fontShort
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x * 8 + listComponentsSize.x,
						marginSize.y
					),
					labelSize,
					DataBinding.fromContextAndGet
					(
						player.flagship,
						(c: Flagship) => c.componentsBackboneCurrentOverMax()
					),
					fontShort
				),

				ControlList.from8
				(
					"listComponentsInstalled",
					Coords.fromXY
					(
						marginSize.x * 2 + listComponentsSize.x,
						marginSize.y * 2 + labelSize.y
					),
					listComponentsSize,
					DataBinding.fromContextAndGet
					(
						placeStationDock,
						(c: PlaceStationDock) => shipComponentsInstalled
					),
					DataBinding.fromGet
					(
						(c: ShipComponentDefn) => c.name
					), // bindingForItemText
					fontShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.componentToScrap,
						(c: PlaceStationDock, v: ShipComponentDefn) => c.componentToScrap = v
					), // bindingForItemSelected
					DataBinding.fromContext(null), // ?
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						marginSize.x * 2 + listComponentsSize.x,
						marginSize.y * 3 + labelSize.y + listComponentsSize.y
					),
					buttonSizeComponents,
					"Scrap",
					fontShort,
					() => this.componentScrapBackbone(uwpe)
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x * 3 + listComponentsSize.x * 2,
						marginSize.y
					),
					labelSize,
					DataBinding.fromContext("Weapons:"),
					fontShort
				),

				ControlList.from8
				(
					"listWeapons",
					Coords.fromXY
					(
						marginSize.x * 3 + listComponentsSize.x * 2,
						marginSize.y * 2 + labelSize.y
					),
					listComponentsSize,
					DataBinding.fromContextAndGet
					(
						placeStationDock,
						(c: PlaceStationDock) => shipWeaponSlots
					),
					DataBinding.fromGet
					(
						(c: ShipWeaponSlot) => c.nameAndComponentInstalled() // bindingForItemText
					),
					fontShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.weaponSlotToMove,
						(c: PlaceStationDock, v: any) => c.weaponSlotToMove = v
					), // bindingForItemSelected
					DataBinding.fromContext(null) // ?
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						marginSize.x * 3 + listComponentsSize.x * 2,
						marginSize.y * 3 + labelSize.y + listComponentsSize.y
					),
					buttonSizeComponents,
					"Up",
					fontShort,
					() =>
					{
						// todo
					},
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					DataBinding.fromContext("Thrusters:"),
					fontShort
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x * 8,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					DataBinding.fromContextAndGet
					(
						player.flagship,
						(c: Flagship) => c.thrustersCurrentOverMax()
					),
					fontShort
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						containerLeftSize.x / 2 - marginSize.x * 2 - buttonSizeSmall.x * 2,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					buttonSizeSmall,
					"+",
					fontShort,
					this.componentBuildThruster.bind(this)
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						containerLeftSize.x / 2 - marginSize.x * 2 - buttonSizeSmall.x * 1,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					buttonSizeSmall,
					"-",
					fontShort,
					this.componentScrapThruster.bind(this)
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						containerLeftSize.x / 2 + marginSize.x,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					DataBinding.fromContext("Turning Jets:"),
					fontShort
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						containerLeftSize.x / 2 + marginSize.x * 9,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					DataBinding.fromContextAndGet
					(
						player.flagship,
						(c: Flagship) => c.turningJetsCurrentOverMax()
					),
					fontShort
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						containerLeftSize.x - marginSize.x - buttonSizeSmall.x * 2,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					buttonSizeSmall,
					"+",
					fontShort,
					this.componentBuildTurningJets.bind(this)
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						containerLeftSize.x - marginSize.x - buttonSizeSmall.x * 1,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					buttonSizeSmall,
					"-",
					fontShort,
					this.componentScrapTurningJets.bind(this)
				),

			]
		);

		var shipPlansAvailable = player.shipDefnsAvailable(universe);

		var containerShips = ControlContainer.from4
		(
			"containerShips",
			Coords.fromXY
			(
				marginSize.x,
				marginSize.y * 2 + titleSize.y + containerLeftSize.y
			),
			containerLeftSize,
			// children
			[
				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x, marginSize.y
					),
					labelSize,
					DataBinding.fromContext("Available:"),
					fontShort
				),

				ControlList.from8
				(
					"listShipPlansAvailable",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 2 + labelSize.y
					),
					listShipsSize,
					DataBinding.fromContextAndGet
					(
						placeStationDock,
						(c: PlaceStationDock) => shipPlansAvailable
					),
					DataBinding.fromGet
					(
						(c: ShipDefn) => c.fullNameAndValue()
					), // bindingForItemText
					fontShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.shipDefnToBuild,
						(c: PlaceStationDock, v: ShipDefn) => c.shipDefnToBuild = v
					),
					DataBinding.fromContext(null)
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						marginSize.x,
						containerLeftSize.y - marginSize.y - buttonSizeShips.y
					),
					buttonSizeShips,
					"Build",
					fontShort,
					this.shipBuild.bind(this)
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x * 2 + listShipsSize.x,
						marginSize.y
					),
					labelSize,
					DataBinding.fromContext("Fleet:"),
					fontShort
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x * 6 + listShipsSize.x,
						marginSize.y
					),
					labelSize,
					DataBinding.fromContextAndGet
					(
						player,
						(c: Player) => c.shipsCurrentOverMax()
					),
					fontShort
				),

				ControlList.from8
				(
					"listShipsInFleet",
					Coords.fromXY
					(
						marginSize.x * 2 + listShipsSize.x,
						marginSize.y * 2 + labelSize.y
					),
					listShipsSize,
					DataBinding.fromContextAndGet
					(
						placeStationDock,
						(c: PlaceStationDock) => shipsInFleet
					),
					DataBinding.fromGet
					(
						(c: Ship) => c.fullNameAndCrew(uwpe)
					), // bindingForItemText
					fontShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.shipInFleetSelected,
						(c: PlaceStationDock, v: Ship) => c.shipInFleetSelected = v
					),
					DataBinding.fromContext(null) // ?
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						marginSize.x * 2 + listShipsSize.x,
						containerLeftSize.y - marginSize.y - buttonSizeShips.y
					),
					buttonSizeShipsSmall,
					"Scrap",
					fontShort,
					this.shipScrap.bind(this)
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						marginSize.x * 3 + listShipsSize.x + buttonSizeShipsSmall.x,
						containerLeftSize.y - marginSize.y - buttonSizeShips.y
					),
					buttonSizeShipsSmall,
					"Crew+",
					fontShort,
					this.crewAdd.bind(this)
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						marginSize.x * 4 + listShipsSize.x + buttonSizeShipsSmall.x * 2,
						containerLeftSize.y - marginSize.y - buttonSizeShips.y
					),
					buttonSizeShipsSmall,
					"Crew-",
					fontShort,
					this.crewRemove.bind(this)
				),
			]
		);

		var containerResources = ControlContainer.from4
		(
			"containerResources",
			Coords.fromXY
			(
				marginSize.x * 2 + containerLeftSize.x,
				marginSize.y + titleSize.y
			),
			containerRightSize,
			// children
			[
				ControlLabel.from4Uncentered
				(
					marginSize,
					labelSize,
					DataBinding.fromContext("Resources:"),
					fontShort
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 7, marginSize.y),
					labelSize,
					DataBinding.fromContextAndGet
					(
						player, (c: Player) => "" + c.flagship.resourceCredits
					),
					fontShort
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x, marginSize.y * 2 + labelSize.y),
					labelSize,
					DataBinding.fromContext("Fuel:"),
					fontShort
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 4, marginSize.y * 2 + labelSize.y),
					labelSize,
					DataBinding.fromContextAndGet
					(
						player, (c: Player) => c.flagship.fuelCurrentOverMax()
					),
					fontShort
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x - buttonSizeSmall.x * 2,
						marginSize.y * 2 + labelSize.y
					),
					buttonSizeSmall,
					"+",
					fontShort,
					this.fuelBuyOneUnit.bind(this)
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x - buttonSizeSmall.x,
						marginSize.y * 2 + labelSize.y
					),
					buttonSizeSmall,
					"-",
					fontShort,
					this.fuelSellOneUnit.bind(this)
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 3 + labelSize.y * 2
					),
					labelSize,
					DataBinding.fromContext("Landers:"),
					fontShort
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY
					(
						marginSize.x * 6,
						marginSize.y * 3 + labelSize.y * 2
					),
					labelSize,
					DataBinding.fromContextAndGet
					(
						player.flagship,
						(c: Flagship) => "" + c.numberOfLanders
					),
					fontShort
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x - buttonSizeSmall.x * 2,
						marginSize.y * 3 + labelSize.y * 2
					),
					buttonSizeSmall,
					"+",
					fontShort,
					this.landerAdd.bind(this)
				),

				ControlButton.from5
				(
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x - buttonSizeSmall.x,
						marginSize.y * 3 + labelSize.y * 2
					),
					buttonSizeSmall,
					"-",
					fontShort,
					this.landerRemove.bind(this)
				),

				new ControlLabel
				(
					"labelMinerals",
					Coords.fromXY
					(
						marginSize.x, marginSize.y * 4 + labelSize.y * 3
					),
					labelSize,
					false, // isTextCentered
					false, // isTextCenteredVertically
					DataBinding.fromContext("Minerals:"),
					fontShort
				),

				ControlList.from8
				(
					"listMinerals",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 5 + labelSize.y * 4
					),
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x * 2,
						containerRightSize.y - marginSize.y * 7 - labelSize.y * 4 - buttonSizeRight.y
					), // size
					DataBinding.fromContext(playerItemHolder.items),
					DataBinding.fromGet
					(
						(c: Item) => c.toString(null)
					), // bindingForItemText
					fontShort,
					DataBinding.fromContext(null), // bindingForItemSelected
					DataBinding.fromContext(null) // bindingForItemValue
				),

				ControlButton.from8
				(
					"buttonResourcesOffload",
					Coords.fromXY
					(
						marginSize.x,
						containerRightSize.y - marginSize.y - buttonSizeRight.y // todo
					),
					buttonSizeRight,
					"Offload",
					fontShort,
					true, // hasBorder,
					DataBinding.fromTrue(), // isEnabled,
					() => // click
					{
						placeStationDock.offload(universe);
					}
				),

			]
		);

		var controlRoot = ControlContainer.from4
		(
			"containerDock",
			Coords.fromXY(0, 0), // pos
			containerDockSize,
			[
				new ControlLabel
				(
					"labelDock",
					Coords.fromXY(containerDockSize.x / 2, titleSize.y / 2),
					titleSize,
					true, // isTextCentered
					false, // isTextCenteredVertically
					DataBinding.fromContext("Dock"),
					font
				),

				containerComponents,

				containerShips,

				containerResources,

				ControlButton.from5
				(
					marginSize,
					buttonBackSize,
					"<",
					fontShort,
					() =>
					{
						var world = universe.world;
						var place = world.placeCurrent as PlaceStationDock;
						var placeNext = place.placeStation;
						world.placeNextSet(placeNext);
					}
				),
			]
		);

		return controlRoot;
	}
}
