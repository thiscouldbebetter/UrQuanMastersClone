
class PlaceStationDock extends Place
{
	placeStation: PlaceStation;

	crewValuePerUnit: number;
	fuelValuePerUnit: number;
	landerValue: number;
	placeToReturnTo: Place;
	posToReturnTo: Coords;

	componentToBuild: ShipComponentDefn;
	componentToScrap: ShipComponentDefn;
	shipDefnToBuild: ShipDefn;
	shipInFleetSelected: Ship;
	venueControls: Venue;
	weaponSlotToMove: ShipWeaponSlot;

	constructor(world: World, placeStation: PlaceStation)
	{
		super(PlaceStationDock.name, PlaceStationDock.name, null, []);
		this.placeStation = placeStation;

		this.crewValuePerUnit = 3;
		this.fuelValuePerUnit = 20;
		this.landerValue = 100;
	}

	// method

	componentBackboneBuild(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		var flagship = player.flagship;
		var componentsBackboneInstalled = flagship.componentsBackbone();
		if (componentsBackboneInstalled.length < flagship.componentsBackboneMax)
		{
			this.componentBuild(universe, this.componentToBuild);
		}
	}

	componentBackboneScrap(universe: Universe): void
	{
		this.componentScrap(universe, this.componentToScrap);
	}

	componentThrusterBuild(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		var flagship = player.flagship;
		var thrustersInstalled = flagship.componentsThruster();
		if (thrustersInstalled.length < flagship.thrustersMax)
		{
			var componentName = thrustersInstalled[0].name;
			var componentToBuild = ShipComponentDefn.byName(componentName);
			this.componentBuild(universe, componentToBuild);
		}
	}

	componentThrusterScrap(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		var thrustersInstalled = player.flagship.componentsThruster();
		var componentToScrap = thrustersInstalled[1]; // Cannot remove last.
		this.componentScrap(universe, componentToScrap);
	}

	componentTurningJetsBuild(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		var flagship = player.flagship;
		var turningJetsInstalled = flagship.componentsTurningJets();
		if (turningJetsInstalled.length < flagship.turningJetsMax)
		{
			var componentName = turningJetsInstalled[0].name;
			var componentToBuild = ShipComponentDefn.byName(componentName);
			this.componentBuild(universe, componentToBuild);
		}
	}

	componentTurningJetsScrap(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		var turningJetsInstalled = player.flagship.componentsTurningJets();
		var componentToScrap = turningJetsInstalled[1]; // Cannot remove last.
		this.componentScrap(universe, componentToScrap);
	}

	componentBuild(universe: Universe, componentToBuild: ShipComponentDefn): void
	{
		if (componentToBuild != null)
		{
			var player = (universe.world as WorldExtended).player;
			if (player.credit >= componentToBuild.value)
			{
				player.credit -= componentToBuild.value;
				player.flagship.componentNames.push(componentToBuild.name);
				player.cachesCalculate();
			}
		}
	}

	componentScrap(universe: Universe, componentToScrap: ShipComponentDefn): void
	{
		if (componentToScrap != null)
		{
			var player = (universe.world as WorldExtended).player;
			ArrayHelper.remove(player.flagship.componentNames, componentToScrap.name);
			player.credit += componentToScrap.value;
			player.cachesCalculate();
		}
	}

	crewAdd(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var ship = this.shipInFleetSelected;
		if (ship.crew < ship.defn(world).crewMax)
		{
			var player = world.player;
			if (player.credit >= this.crewValuePerUnit)
			{
				player.credit -= this.crewValuePerUnit;
				ship.crew++;
			}
		}
	}

	crewRemove(universe: Universe): void
	{
		var ship = this.shipInFleetSelected;
		if (ship.crew > 1)
		{
			var player = (universe.world as WorldExtended).player;
			player.credit += this.crewValuePerUnit;
			ship.crew--;
		}
	}

	fuelAdd(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		var flagship = player.flagship;
		var fuelMax = flagship._fuelMax;
		if (player.credit >= this.fuelValuePerUnit && flagship.fuel < fuelMax)
		{
			var fuelUnitsToBuy = 1;
			if (flagship.fuel + fuelUnitsToBuy > fuelMax)
			{
				fuelUnitsToBuy = fuelMax + flagship.fuel;
			}
			var fuelValue = Math.ceil(this.fuelValuePerUnit * fuelUnitsToBuy);
			player.credit -= fuelValue;
			flagship.fuel += fuelUnitsToBuy;
		}
	}

	fuelRemove(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		var flagship = player.flagship;
		if (flagship.fuel > 0)
		{
			var fuelUnitsToSell = 1;
			if (flagship.fuel < fuelUnitsToSell)
			{
				fuelUnitsToSell = player.flagship.fuel;
			}
			var fuelValue = Math.floor(fuelUnitsToSell * this.fuelValuePerUnit);
			player.credit += fuelValue;
			flagship.fuel -= fuelUnitsToSell;
		}
	}

	landerAdd(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		if (player.credit >= this.landerValue)
		{
			player.credit -= this.landerValue;
			player.flagship.numberOfLanders++;
		}
	}

	landerRemove(universe: Universe): void
	{
		var player = (universe.world as WorldExtended).player;
		var flagship = player.flagship;
		if (flagship.numberOfLanders > 0)
		{
			flagship.numberOfLanders--;
			player.credit += this.landerValue;
		}
	}

	offload(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var player = world.player;
		var playerItemHolder = player.flagship.itemHolder;
		var items = playerItemHolder.items;
		var valueSumSoFar = 0;
		for (var i = 0; i < items.length; i++)
		{
			var item = items[i];
			var itemDefnName = item.defnName;
			var resourceDefn = ResourceDefn.byName(itemDefnName);
			var resourceValue = resourceDefn.valuePerUnit * item.quantity;
			valueSumSoFar += resourceValue;
		}
		player.credit += valueSumSoFar;
		items.length = 0;
	}

	shipBuild(universe: Universe): void
	{
		var shipDefnToBuild = this.shipDefnToBuild;
		if (shipDefnToBuild != null)
		{
			var world = universe.world as WorldExtended;
			var player = world.player;
			if (player.shipGroup.ships.length < player.flagship.shipsMax)
			{
				var shipValue = shipDefnToBuild.value;
				if (player.credit >= shipValue)
				{
					player.credit -= shipValue;
					var ship = new Ship(shipDefnToBuild.name);
					ship.initialize(universe, world, this, null);
					player.shipGroup.ships.push(ship);
				}
			}
		}
	}

	shipScrap(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var shipToScrap = this.shipInFleetSelected;
		if (shipToScrap != null)
		{
			var shipToScrapDefn = shipToScrap.defn(world);
			var shipValue =
				shipToScrapDefn.value
				+ shipToScrap.crew * this.crewValuePerUnit;
			var player = world.player;
			player.credit += shipValue;
			ArrayHelper.remove(player.shipGroup.ships, shipToScrap);
		}
	}

	// Place

	draw(universe: Universe, world: World): void
	{
		super.draw(universe, world, null);
		this.venueControls.draw(universe);
	}

	initialize(universe: Universe, world: World): void
	{
		super.initialize(universe, world);
		/*
		var player = (world as WorldExtended).player;
		player.initialize(universe, world, this, player);
		*/
	}

	updateForTimerTick(universe: Universe, world: World): void
	{
		super.updateForTimerTick(universe, world);
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

		var player = world.player;
		var playerItemHolder = player.flagship.itemHolder;
		var playerShipGroup = player.shipGroup;
		var shipWeaponSlots = ShipWeaponSlot.Instances()._All;

		var containerDockSize = universe.display.sizeInPixels.clone();
		var fontHeight = 20;
		var fontHeightShort = fontHeight / 2;
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

		var buttonSizeSmall = Coords.fromXY(1, 1).multiplyScalar(buttonSizeShips.y * .8);

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

		var shipComponentDefnsKnownBackbone = player.shipComponentDefnsKnownBackbone();

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
				new ControlLabel
				(
					"labelComponentsAvailable",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					"Available:",
					fontHeightShort
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
					DataBinding.fromContext(shipComponentDefnsKnownBackbone),
					DataBinding.fromGet
					(
						(c: ShipComponentDefn) => c.name
					), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.componentToBuild,
						(c: PlaceStationDock, v: ShipComponentDefn) => c.componentToBuild = v
					), // bindingForItemSelected
					DataBinding.fromContext(null) // ?
				),

				ControlButton.from9
				(
					"buttonComponentBuild",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 3 + labelSize.y + listComponentsSize.y
					),
					buttonSizeComponents,
					"Build",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					this.componentBackboneBuild,
					universe // context
				),

				new ControlLabel
				(
					"labelComponentsInstalled",
					Coords.fromXY
					(
						marginSize.x * 2 + listComponentsSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					"Installed:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoComponentsInstalled",
					Coords.fromXY
					(
						marginSize.x * 8 + listComponentsSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						player.flagship,
						(c: Flagship) => c.componentsBackboneCurrentOverMax()
					),
					fontHeightShort
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
					DataBinding.fromContext(shipComponentsInstalled),
					DataBinding.fromGet
					(
						(c: ShipComponentDefn) => c.name
					), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.componentToScrap,
						(c: PlaceStationDock, v: ShipComponentDefn) => c.componentToScrap = v
					), // bindingForItemSelected
					DataBinding.fromContext(null), // ?
				),

				ControlButton.from9
				(
					"buttonComponentScrap",
					Coords.fromXY
					(
						marginSize.x * 2 + listComponentsSize.x,
						marginSize.y * 3 + labelSize.y + listComponentsSize.y
					),
					buttonSizeComponents,
					"Scrap",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					this.componentBackboneScrap,
					universe // context
				),

				new ControlLabel
				(
					"labelWeaponPositions",
					Coords.fromXY
					(
						marginSize.x * 3 + listComponentsSize.x * 2,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					"Weapons:",
					fontHeightShort
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
					DataBinding.fromContext(shipWeaponSlots),
					DataBinding.fromGet
					(
						(c: ShipWeaponSlot) => c.nameAndComponentInstalled() // bindingForItemText
					),
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.weaponSlotToMove,
						(c: PlaceStationDock, v: any) => c.weaponSlotToMove = v
					), // bindingForItemSelected
					DataBinding.fromContext(null) // ?
				),

				ControlButton.from9
				(
					"buttonWeaponUp",
					Coords.fromXY
					(
						marginSize.x * 3 + listComponentsSize.x * 2,
						marginSize.y * 3 + labelSize.y + listComponentsSize.y
					),
					buttonSizeComponents,
					"Up",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					(universe: Universe) =>
					{
						// todo
					},
					universe // context
				),

				new ControlLabel
				(
					"labelThrusters",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					false, // isTextCentered
					"Thrusters:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoThrusters",
					Coords.fromXY
					(
						marginSize.x * 8,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						player.flagship,
						(c: Flagship) => c.thrustersCurrentOverMax()
					),
					fontHeightShort
				),

				ControlButton.from9
				(
					"buttonThrusterAdd",
					Coords.fromXY
					(
						containerLeftSize.x / 2 - marginSize.x * 2 - buttonSizeSmall.x * 2,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					buttonSizeSmall,
					"+",
					fontHeightShort,
					true, // hasBorder
					true, // isEnabled
					this.componentThrusterBuild.bind(this),
					universe
				),

				ControlButton.from9
				(
					"buttonThrusterRemove",
					Coords.fromXY
					(
						containerLeftSize.x / 2 - marginSize.x * 2 - buttonSizeSmall.x * 1,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					buttonSizeSmall,
					"-",
					fontHeightShort,
					true, // hasBorder
					true, // isEnabled
					this.componentThrusterScrap.bind(this),
					universe
				),

				new ControlLabel
				(
					"labelTurningJets",
					Coords.fromXY
					(
						containerLeftSize.x / 2 + marginSize.x,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					false, // isTextCentered
					"Turning Jets:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoTurningJets",
					Coords.fromXY
					(
						containerLeftSize.x / 2 + marginSize.x * 9,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						player.flagship,
						(c: Flagship) => c.turningJetsCurrentOverMax()
					),
					fontHeightShort
				),

				ControlButton.from9
				(
					"buttonTurningJetAdd",
					Coords.fromXY
					(
						containerLeftSize.x - marginSize.x - buttonSizeSmall.x * 2,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					buttonSizeSmall,
					"+",
					fontHeightShort,
					true, // hasBorder
					true, // isEnabled
					this.componentTurningJetsBuild.bind(this),
					universe
				),

				ControlButton.from9
				(
					"buttonTurningJetRemove",
					Coords.fromXY
					(
						containerLeftSize.x - marginSize.x - buttonSizeSmall.x * 1,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					buttonSizeSmall,
					"-",
					fontHeightShort,
					true, // hasBorder
					true, // isEnabled
					this.componentTurningJetsScrap.bind(this),
					universe
				),

			]
		);

		var shipsInFleet = playerShipGroup.ships;

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
				new ControlLabel
				(
					"labelShipsAvailable",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					"Available:",
					fontHeightShort
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
					DataBinding.fromContext(shipPlansAvailable),
					DataBinding.fromGet
					(
						(c: ShipDefn) => c.fullNameAndValue()
					), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.shipDefnToBuild,
						(c: PlaceStationDock, v: ShipDefn) => c.shipDefnToBuild = v
					),
					DataBinding.fromContext(null)
				),

				ControlButton.from9
				(
					"buttonShipBuild",
					Coords.fromXY
					(
						marginSize.x,
						containerLeftSize.y - marginSize.y - buttonSizeShips.y
					),
					buttonSizeShips,
					"Build",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					this.shipBuild.bind(this),
					universe // context
				),

				new ControlLabel
				(
					"labelFleet",
					Coords.fromXY
					(
						marginSize.x * 2 + listShipsSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					"Fleet:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoFleet",
					Coords.fromXY
					(
						marginSize.x * 6 + listShipsSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						player,
						(c: Player) => c.shipsCurrentOverMax()
					),
					fontHeightShort
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
					DataBinding.fromContext(shipsInFleet),
					DataBinding.fromGet
					(
						(c: Ship) => { return c.fullNameAndCrew(world); }
					), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						(c: PlaceStationDock) => c.shipInFleetSelected,
						(c: PlaceStationDock, v: Ship) => c.shipInFleetSelected = v
					),
					DataBinding.fromContext(null) // ?
				),

				ControlButton.from9
				(
					"buttonShipScrap",
					Coords.fromXY
					(
						marginSize.x * 2 + listShipsSize.x,
						containerLeftSize.y - marginSize.y - buttonSizeShips.y
					),
					buttonSizeShipsSmall,
					"Scrap",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					this.shipScrap.bind(this),
					universe // context
				),

				ControlButton.from9
				(
					"buttonShipCrewAdd",
					Coords.fromXY
					(
						marginSize.x * 3 + listShipsSize.x + buttonSizeShipsSmall.x,
						containerLeftSize.y - marginSize.y - buttonSizeShips.y
					),
					buttonSizeShipsSmall,
					"Crew+",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					this.crewAdd.bind(this),
					universe // context
				),

				ControlButton.from9
				(
					"buttonShipCrewRemove",
					Coords.fromXY
					(
						marginSize.x * 4 + listShipsSize.x + buttonSizeShipsSmall.x * 2,
						containerLeftSize.y - marginSize.y - buttonSizeShips.y
					),
					buttonSizeShipsSmall,
					"Crew-",
					fontHeightShort,
					true, // hasBorder,a
					true, // isEnabled,
					this.crewRemove.bind(this),
					universe // context
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
				new ControlLabel
				(
					"labelResources",
					marginSize,
					labelSize,
					false, // isTextCentered
					"Resources:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoResources",
					Coords.fromXY(marginSize.x * 7, marginSize.y),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						player, (c: Player) => c.credit
					),
					fontHeightShort
				),

				new ControlLabel
				(
					"labelFuel",
					Coords.fromXY(marginSize.x, marginSize.y * 2 + labelSize.y),
					labelSize,
					false, // isTextCentered
					"Fuel:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoFuel",
					Coords.fromXY(marginSize.x * 4, marginSize.y * 2 + labelSize.y),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						player, (c: Player) => c.flagship.fuelCurrentOverMax()
					),
					fontHeightShort
				),

				ControlButton.from9
				(
					"buttonFuelAdd",
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x - buttonSizeSmall.x * 2,
						marginSize.y * 2 + labelSize.y
					),
					buttonSizeSmall,
					"+",
					fontHeightShort,
					true, // hasBorder
					true, // isEnabled
					this.fuelAdd.bind(this),
					universe
				),

				ControlButton.from9
				(
					"buttonFuelRemove",
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x - buttonSizeSmall.x,
						marginSize.y * 2 + labelSize.y
					),
					buttonSizeSmall,
					"-",
					fontHeightShort,
					true, // hasBorder
					true, // isEnabled
					this.fuelRemove.bind(this),
					universe
				),

				new ControlLabel
				(
					"labelLanders",
					Coords.fromXY
					(
						marginSize.x,
						marginSize.y * 3 + labelSize.y * 2
					),
					labelSize,
					false, // isTextCentered
					"Landers:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoLanders",
					Coords.fromXY
					(
						marginSize.x * 6,
						marginSize.y * 3 + labelSize.y * 2
					),
					labelSize,
					false, // isTextCentered
					DataBinding.fromContextAndGet
					(
						player.flagship, (c: Flagship) => c.numberOfLanders
					),
					fontHeightShort
				),

				ControlButton.from9
				(
					"buttonLanderAdd",
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x - buttonSizeSmall.x * 2,
						marginSize.y * 3 + labelSize.y * 2
					),
					buttonSizeSmall,
					"+",
					fontHeightShort,
					true, // hasBorder
					true, // isEnabled
					this.landerAdd.bind(this),
					universe
				),

				ControlButton.from9
				(
					"buttonLanderRemove",
					Coords.fromXY
					(
						containerRightSize.x - marginSize.x - buttonSizeSmall.x,
						marginSize.y * 3 + labelSize.y * 2
					),
					buttonSizeSmall,
					"-",
					fontHeightShort,
					true, // hasBorder
					true, // isEnabled
					this.landerRemove.bind(this),
					universe
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
					"Minerals:",
					fontHeightShort
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
					fontHeightShort,
					DataBinding.fromContext(null), // bindingForItemSelected
					DataBinding.fromContext(null) // bindingForItemValue
				),

				ControlButton.from9
				(
					"buttonResourcesOffload",
					Coords.fromXY
					(
						marginSize.x,
						containerRightSize.y - marginSize.y - buttonSizeRight.y // todo
					),
					buttonSizeRight,
					"Offload",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					(universe: Universe) => // click
					{
						placeStationDock.offload(universe);
					},
					universe // context
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
					"Dock",
					fontHeight
				),

				containerComponents,

				containerShips,

				containerResources,

				ControlButton.from9
				(
					"buttonBack",
					marginSize,
					buttonBackSize,
					"<",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					(universe: Universe) =>
					{
						var world = universe.world;
						var place = world.placeCurrent as PlaceStationDock;
						var placeNext = place.placeStation;
						world.placeNext = placeNext;
					},
					universe // context
				),
			]
		);

		return controlRoot;
	}

	returnToPlace(world: World): void
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
		var playerLoc = playerFromPlaceNext.locatable().loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
