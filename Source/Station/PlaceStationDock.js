
class PlaceStationDock extends Place
{
	constructor(world, placeStation)
	{
		super(PlaceStationDock.name, PlaceStationDock.name, null, []);
		this.placeStation = placeStation;

		this.crewValuePerUnit = 3;
		this.fuelValuePerUnit = 20;
		this.landerValue = 100;
	}

	// method

	componentBackboneBuild(universe)
	{
		var player = universe.world.player;
		var flagship = player.flagship;
		var componentsBackboneInstalled = flagship.componentsBackbone();
		if (componentsBackboneInstalled.length < flagship.componentsBackboneMax)
		{
			this.componentBuild(universe, this.componentToBuild);
		}
	}

	componentBackboneScrap(universe)
	{
		this.componentScrap(universe, this.componentToScrap);
	}

	componentThrusterBuild(universe)
	{
		var player = universe.world.player;
		var flagship = player.flagship;
		var thrustersInstalled = flagship.componentsThruster();
		if (thrustersInstalled.length < flagship.thrustersMax)
		{
			var componentDefns = player.shipComponentDefnsKnown(universe.world);
			var componentName = thrustersInstalled[0].name;
			var componentToBuild = ShipComponentDefn.byName(componentName);
			this.componentBuild(universe, componentToBuild);
		}
	}

	componentThrusterScrap(universe)
	{
		var player = universe.world.player;
		var thrustersInstalled = player.flagship.componentsThruster();
		var componentToScrap = thrustersInstalled[1]; // Cannot remove last.
		this.componentScrap(universe, componentToScrap);
	}

	componentTurningJetsBuild(universe)
	{
		var player = universe.world.player;
		var flagship = player.flagship;
		var turningJetsInstalled = flagship.componentsTurningJets();
		if (turningJetsInstalled.length < flagship.turningJetsMax)
		{
			var componentDefns = player.shipComponentDefnsKnown(universe.world);
			var componentName = turningJetsInstalled[0].name;
			var componentToBuild = ShipComponentDefn.byName(componentName);
			this.componentBuild(universe, componentToBuild);
		}
	}

	componentTurningJetsScrap(universe)
	{
		var player = universe.world.player;
		var turningJetsInstalled = player.flagship.componentsTurningJets();
		var componentToScrap = turningJetsInstalled[1]; // Cannot remove last.
		this.componentScrap(universe, componentToScrap);
	}

	componentBuild(universe, componentToBuild)
	{
		if (componentToBuild != null)
		{
			var player = universe.world.player;
			if (player.credit >= componentToBuild.value)
			{
				player.credit -= componentToBuild.value;
				player.flagship.componentNames.push(componentToBuild.name);
				player.cachesCalculate();
			}
		}
	}

	componentScrap(universe, componentToScrap)
	{
		if (componentToScrap != null)
		{
			var player = universe.world.player;
			player.flagship.componentNames.remove(componentToScrap.name);
			player.credit += componentToScrap.value;
			player.cachesCalculate();
		}
	}

	crewAdd(universe)
	{
		var ship = this.shipInFleetSelected;
		if (ship.crew < ship.defn(universe.world).crewMax)
		{
			var player = universe.world.player;
			if (player.credit >= this.crewValuePerUnit)
			{
				player.credit -= crewValuePerUnit;
				ship.crew++;
			}
		}
	}

	crewRemove(universe)
	{
		var ship = this.shipInFleetSelected;
		if (ship.crew > 1)
		{
			var player = universe.world.player;
			player.credit += this.crewValuePerUnit;
			ship.crew--;
		}
	}

	fuelAdd(universe)
	{
		var player = universe.world.player;
		var flagship = player.flagship;
		var fuelMax = flagship.fuelMax();
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

	fuelRemove(universe)
	{
		var player = universe.world.player;
		var flagship = player.flagship;
		if (flagship.fuel > 0)
		{
			var fuelUnitsToSell = 1;
			if (flagship.fuel < fuelUnitsToSell)
			{
				fuelUnitsToSell = player.fuel;
			}
			var fuelValue = Math.floor(fuelUnitsToSell * this.fuelValuePerUnit);
			player.credit += fuelValue;
			flagship.fuel -= fuelUnitsToSell;
		}
	}

	landerAdd(universe)
	{
		var player = universe.world.player;
		if (player.credit >= this.landerValue)
		{
			player.credit -= this.landerValue;
			player.flagship.numberOfLanders++;
		}
	}

	landerRemove(universe)
	{
		var player = universe.world.player;
		var flagship = player.flagship;
		if (flagship.numberOfLanders > 0)
		{
			flagship.numberOfLanders--;
			player.credit += this.landerValue;
		}
	}

	offload(universe)
	{
		var world = universe.world;
		var player = world.player;
		var playerItemHolder = player.flagship.itemHolder;
		var items = playerItemHolder.items;
		var resourceDefns = ResourceDefn.Instances();
		var valueSumSoFar = 0;
		for (var i = 0; i < items.length; i++)
		{
			var item = items[i];
			var itemDefnName = item.defnName;
			var resourceDefn = resourceDefns[itemDefnName];
			var resourceValue = resourceDefn.valuePerUnit * item.quantity;
			valueSumSoFar += resourceValue;
		}
		player.credit += valueSumSoFar;
		items.length = 0;
	}

	shipBuild(universe)
	{
		var shipDefnToBuild = this.shipDefnToBuild;
		if (shipDefnToBuild != null)
		{
			var player = universe.world.player;
			if (player.shipGroup.ships.length < player.flagship.shipsMax)
			{
				var shipValue = shipDefnToBuild.value;
				if (player.credit >= shipValue)
				{
					player.credit -= shipValue;
					var ship = new Ship(shipDefnToBuild.name);
					ship.initialize(universe, universe.world);
					player.shipGroup.ships.push(ship);
				}
			}
		}
	}

	shipScrap(universe)
	{
		var shipToScrap = this.shipInFleetSelected;
		if (shipToScrap != null)
		{
			var shipToScrapDefn = shipToScrap.defn(world);
			var shipValue =
				shipToScrapDefn.value
				+ shipToScrap.crew * crewValuePerUnit;
			var player = universe.world.player;
			player.credit += shipValue;
			player.shipGroup.ships.remove(shipToScrap);
		}
	}

	// Place

	draw(universe, world)
	{
		super.draw(universe, world);
		this.venueControls.draw(universe, world);
	}

	initialize(universe, world)
	{
		super.initialize(universe, world);
		universe.world.player.initialize(universe, world);
	}

	updateForTimerTick(universe, world)
	{
		super.updateForTimerTick(universe, world);
		if (this.venueControls == null)
		{
			var controlRoot = this.toControl(universe, world);
			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	// controls

	toControl(universe, world)
	{
		var placeStationDock = this;

		var player = world.player;
		var playerItemHolder = player.flagship.itemHolder;
		var playerShipGroup = player.shipGroup;
		var shipWeaponSlots = ShipWeaponSlot.Instances()._All;

		var containerDockSize = universe.display.sizeInPixels.clone();
		var fontHeight = 20;
		var fontHeightShort = fontHeight / 2;
		var buttonBackSize = new Coords(1, 1).multiplyScalar(fontHeightShort * 1.6);
		var marginWidth = 8;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);

		var titleSize = new Coords(containerDockSize.x, 25);
		var labelSize = new Coords(100, 10);

		var containerRightSize = new Coords
		(
			(containerDockSize.x - marginSize.x * 3) * .3,
			containerDockSize.y - marginSize.y * 2 - titleSize.y
		);

		var buttonSizeRight = new Coords
		(
			containerRightSize.x - marginSize.x * 2,
			fontHeightShort * 2
		);

		var containerLeftSize = new Coords
		(
			containerDockSize.x - marginSize.x * 3 - containerRightSize.x,
			(containerRightSize.y - marginSize.y) / 2
		);

		var buttonSizeComponents = new Coords
		(
			(containerLeftSize.x - marginSize.x * 4) / 3,
			fontHeightShort * 1.5
		);

		var buttonSizeShips = new Coords
		(
			(containerLeftSize.x - marginSize.x * 3) / 2,
			fontHeightShort * 1.5
		);

		var buttonSizeShipsSmall = new Coords
		(
			(buttonSizeShips.x - marginSize.x * 2) / 3,
			buttonSizeShips.y
		);

		var buttonSizeSmall = new Coords(1, 1).multiplyScalar(buttonSizeShips.y * .8);

		var listComponentsSize = new Coords
		(
			buttonSizeComponents.x,
			(containerLeftSize.y - labelSize.y * 2 - buttonSizeShips.y - marginSize.y * 5)
		); // size

		var listShipsSize = new Coords
		(
			buttonSizeShips.x,
			(containerLeftSize.y - labelSize.y - buttonSizeShips.y - marginSize.y * 4)
		); // size

		var shipComponentsInstalled = player.flagship.componentsBackbone();

		var shipComponentDefnsKnownBackbone = player.shipComponentDefnsKnownBackbone();

		var containerComponents = new ControlContainer
		(
			"containerComponents",
			new Coords
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
					new Coords
					(
						marginSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					"Available:",
					fontHeightShort
				),

				new ControlList
				(
					"listComponents",
					new Coords
					(
						marginSize.x,
						marginSize.y * 2 + labelSize.y
					),
					listComponentsSize,
					shipComponentDefnsKnownBackbone,
					DataBinding.fromGet(c => c.name), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						(c) => c.componentToBuild,
						(c, v) => c.componentToBuild = v
					), // bindingForItemSelected
					new DataBinding(), // ?
				),

				new ControlButton
				(
					"buttonComponentBuild",
					new Coords
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
					new Coords
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
					new Coords
					(
						marginSize.x * 8 + listComponentsSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					new DataBinding
					(
						player.flagship, (c) => c.componentsBackboneCurrentOverMax()
					),
					fontHeightShort
				),

				new ControlList
				(
					"listComponentsInstalled",
					new Coords
					(
						marginSize.x * 2 + listComponentsSize.x,
						marginSize.y * 2 + labelSize.y
					),
					listComponentsSize,
					shipComponentsInstalled,
					new DataBinding(null, function get(c) { return c.name; } ), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						function get(c) { return c.componentToScrap; },
						function set(c) { c.componentToScrap = v; }
					), // bindingForItemSelected
					new DataBinding(), // ?
				),

				new ControlButton
				(
					"buttonComponentScrap",
					new Coords
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
					new Coords
					(
						marginSize.x * 3 + listComponentsSize.x * 2,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					"Weapons:",
					fontHeightShort
				),

				new ControlList
				(
					"listWeapons",
					new Coords
					(
						marginSize.x * 3 + listComponentsSize.x * 2,
						marginSize.y * 2 + labelSize.y
					),
					listComponentsSize,
					shipWeaponSlots,
					new DataBinding(null, function(c) { return c.nameAndComponentInstalled(); } ), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						function get(c) { return c.weaponSlotToMove; },
						function set(c, v) { c.weaponSlotToMove = v; }
					), // bindingForItemSelected
					new DataBinding() // ?
				),

				new ControlButton
				(
					"buttonWeaponUp",
					new Coords
					(
						marginSize.x * 3 + listComponentsSize.x * 2,
						marginSize.y * 3 + labelSize.y + listComponentsSize.y
					),
					buttonSizeComponents,
					"Up",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						// todo
					},
					universe // context
				),

				new ControlLabel
				(
					"labelThrusters",
					new Coords
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
					new Coords
					(
						marginSize.x * 8,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					false, // isTextCentered
					new DataBinding
					(
						player.flagship,
						function get(c) { return c.thrustersCurrentOverMax(); }
					),
					fontHeightShort
				),

				new ControlButton
				(
					"buttonThrusterAdd",
					new Coords
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

				new ControlButton
				(
					"buttonThrusterRemove",
					new Coords
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
					new Coords
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
					new Coords
					(
						containerLeftSize.x / 2 + marginSize.x * 9,
						marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y
					),
					labelSize,
					false, // isTextCentered
					new DataBinding(player.flagship, function get(c) { return c.turningJetsCurrentOverMax(); } ),
					fontHeightShort
				),

				new ControlButton
				(
					"buttonTurningJetAdd",
					new Coords
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

				new ControlButton
				(
					"buttonTurningJetRemove",
					new Coords
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

		var containerShips = new ControlContainer
		(
			"containerShips",
			new Coords
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
					new Coords
					(
						marginSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					"Available:",
					fontHeightShort
				),

				new ControlList
				(
					"listShipPlansAvailable",
					new Coords
					(
						marginSize.x,
						marginSize.y * 2 + labelSize.y
					),
					listShipsSize,
					shipPlansAvailable,
					new DataBinding(null, function get(c) { return c.fullNameAndValue(); } ), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						function get(c) { return c.shipDefnToBuild; },
						function set(c, v) { c.shipDefnToBuild = v; }
					),
					new DataBinding()
				),

				new ControlButton
				(
					"buttonShipBuild",
					new Coords
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
					new Coords
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
					new Coords
					(
						marginSize.x * 6 + listShipsSize.x,
						marginSize.y
					),
					labelSize,
					false, // isTextCentered
					new DataBinding(player, function get(c) { return c.shipsCurrentOverMax(); } ),
					fontHeightShort
				),

				new ControlList
				(
					"listShipsInFleet",
					new Coords
					(
						marginSize.x * 2 + listShipsSize.x,
						marginSize.y * 2 + labelSize.y
					),
					listShipsSize,
					shipsInFleet,
					new DataBinding
					(
						null,
						function get(c) { return c.fullNameAndCrew(world); }
					), // bindingForItemText
					fontHeightShort,
					new DataBinding
					(
						placeStationDock,
						function get(c) { return c.shipInFleetSelected; },
						function set(c, v) { c.shipInFleetSelected = v; }
					),
					new DataBinding() // ?
				),

				new ControlButton
				(
					"buttonShipScrap",
					new Coords
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

				new ControlButton
				(
					"buttonShipCrewAdd",
					new Coords
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

				new ControlButton
				(
					"buttonShipCrewRemove",
					new Coords
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

		var containerResources = new ControlContainer
		(
			"containerResources",
			new Coords
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
					new Coords(marginSize.x * 7, marginSize.y),
					labelSize,
					false, // isTextCentered
					new DataBinding(player, function get(c) { return c.credit; } ),
					fontHeightShort
				),

				new ControlLabel
				(
					"labelFuel",
					new Coords(marginSize.x, marginSize.y * 2 + labelSize.y),
					labelSize,
					false, // isTextCentered
					"Fuel:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoFuel",
					new Coords(marginSize.x * 4, marginSize.y * 2 + labelSize.y),
					labelSize,
					false, // isTextCentered
					new DataBinding(player, function get(c) { return c.flagship.fuelCurrentOverMax(); } ),
					fontHeightShort
				),

				new ControlButton
				(
					"buttonFuelAdd",
					new Coords
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

				new ControlButton
				(
					"buttonFuelRemove",
					new Coords
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
					new Coords
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
					new Coords
					(
						marginSize.x * 6,
						marginSize.y * 3 + labelSize.y * 2
					),
					labelSize,
					false, // isTextCentered
					new DataBinding(player.flagship, function get(c) { return c.numberOfLanders; } ),
					fontHeightShort
				),

				new ControlButton
				(
					"buttonLanderAdd",
					new Coords
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

				new ControlButton
				(
					"buttonLanderRemove",
					new Coords
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
					new Coords
					(
						marginSize.x, marginSize.y * 4 + labelSize.y * 3
					),
					labelSize,
					false, // isTextCentered
					"Minerals:",
					fontHeightShort
				),

				new ControlList
				(
					"listMinerals",
					new Coords
					(
						marginSize.x,
						marginSize.y * 5 + labelSize.y * 4
					),
					new Coords
					(
						containerRightSize.x - marginSize.x * 2,
						containerRightSize.y - marginSize.y * 7 - labelSize.y * 4 - buttonSizeRight.y
					), // size
					playerItemHolder.items,
					new DataBinding(null, function get(c) { return c.toString(); } ), // bindingForItemText
					fontHeightShort,
					new DataBinding(), // bindingForItemSelected
					new DataBinding() // bindingForItemValue
				),

				new ControlButton
				(
					"buttonResourcesOffload",
					new Coords
					(
						marginSize.x,
						containerRightSize.y - marginSize.y - buttonSizeRight.y // todo
					),
					buttonSizeRight,
					"Offload",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						placeStationDock.offload(universe);
					},
					universe // context
				),

			]
		);

		var controlRoot = new ControlContainer
		(
			"containerDock",
			new Coords(0, 0), // pos
			containerDockSize,
			[
				new ControlLabel
				(
					"labelDock",
					new Coords(containerDockSize.x / 2, titleSize.y / 2),
					titleSize,
					true, // isTextCentered
					"Dock",
					fontHeight
				),

				containerComponents,

				containerShips,

				containerResources,

				new ControlButton
				(
					"buttonBack",
					marginSize,
					buttonBackSize,
					"<",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						var world = universe.world;
						var place = world.placeCurrent;
						var placeNext = place.placeStation;
						world.placeNext = placeNext;
					},
					universe // context
				),
			]
		);

		return controlRoot;
	}

	returnToPlace(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
		var playerLoc = playerFromPlaceNext.locatable().loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
