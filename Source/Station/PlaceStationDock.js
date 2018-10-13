
function PlaceStationDock(world, placeStation)
{
	this.placeStation = placeStation;

	var entities = [];
	Place.call(this, entities);
}
{
	// superclass

	PlaceStationDock.prototype = Object.create(Place.prototype);
	PlaceStationDock.prototype.constructor = Place;

	// method

	PlaceStationDock.prototype.componentBackboneBuild = function(universe)
	{
		this.componentBuild(universe, this.componentToBuild);
	}

	PlaceStationDock.prototype.componentBackboneScrap = function(universe)
	{
		this.componentScrap(universe, this.componentToScrap);
	}

	PlaceStationDock.prototype.componentThrusterBuild = function(universe)
	{
		var player = universe.world.player;
		var componentDefns = player.shipComponentDefnsKnown(universe.world);
		var componentName = "Fusion Thruster"; // todo
		var componentToBuild = componentDefns[componentName];
		this.componentBuild(universe, componentToBuild);
	}

	PlaceStationDock.prototype.componentThrusterScrap = function(universe)
	{
		var player = universe.world.player;
		var componentToScrap = player.flagship.componentsThruster()[0];
		this.componentScrap(universe, componentToScrap);
	}

	PlaceStationDock.prototype.componentTurningJetsBuild = function(universe)
	{
		var player = universe.world.player;
		var componentDefns = player.shipComponentDefnsKnown(universe.world);
		var componentName = "Turning Jets"; // todo
		var componentToBuild = componentDefns[componentName];
		this.componentBuild(universe, componentToBuild);
	}

	PlaceStationDock.prototype.componentTurningJetsScrap = function(universe)
	{
		var player = universe.world.player;
		var componentToScrap = player.flagship.componentsTurningJets()[0];
		this.componentScrap(universe, componentToScrap);
	}

	PlaceStationDock.prototype.componentBuild = function(universe, componentToBuild)
	{
		if (componentToBuild != null)
		{
			var player = universe.world.player;
			if (player.credit >= componentToBuild.value)
			{
				player.credit -= componentToBuild.value;
				player.flagship.componentNames.push(componentToBuild.name);
				player.cachesInvalidate();
			}
		}
	}

	PlaceStationDock.prototype.componentScrap = function(universe, componentToScrap)
	{
		if (componentToScrap != null)
		{
			var player = universe.world.player;
			player.flagship.componentNames.remove(componentToScrap.name);
			player.credit += componentToScrap.value;
			player.cachesInvalidate();
		}
	}

	PlaceStationDock.prototype.crewAdd = function(universe)
	{
		var ship = placeStationDock.shipInFleetSelected;
		if (ship.crew < ship.defn(world).crewMax)
		{
			var player = universe.world.player;
			if (player.credit >= crewValuePerUnit)
			{
				player.credit -= crewValuePerUnit;
				ship.crew++;
			}
		}
	}

	PlaceStationDock.prototype.crewRemove = function(universe)
	{
		var ship = this.shipInFleetSelected;
		if (ship.crew > 1)
		{
			var player = universe.world.player;
			player.credit += crewValuePerUnit;
			ship.crew--;
		}
	}

	PlaceStationDock.prototype.offload = function(universe)
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

	PlaceStationDock.shipBuild = function(universe)
	{
		var shipDefnToBuild = this.shipDefnToBuild;
		if (shipDefnToBuild != null)
		{
			var player = universe.world.player;
			if (player.shipGroups.ships.length < player.shipsMax)
			{
				var shipValue = shipDefnToBuild.value + 1 * crewValuePerUnit;
				if (player.credit >= shipValue)
				{
					player.credit -= shipValue;
					var ship = new Ship(shipDefnToBuild.name);
					player.shipGroup.ships.push(ship);
				}
			}
		}
	}

	PlaceStationDock.prototype.shipScrap = function(universe)
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

	PlaceStationDock.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceStationDock.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		this.venueControls.draw(universe, world);
	}

	PlaceStationDock.prototype.initialize_FromSuperclass = Place.prototype.initialize;
	PlaceStationDock.prototype.initialize = function(universe, world)
	{
		this.initialize_FromSuperclass(universe, world);
		universe.world.player.initialize(universe, world);
	}

	PlaceStationDock.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceStationDock.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);
		if (this.venueControls == null)
		{
			var controlRoot = this.toControl(universe, world);
			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	// controls

	PlaceStationDock.prototype.toControl = function(universe, world)
	{
		var placeStationDock = this;

		var player = world.player;
		var playerItemHolder = player.flagship.itemHolder;
		var playerShipGroup = player.shipGroup;
		var fuelValuePerUnit = 20;
		var crewValuePerUnit = 3;
		var landerValue = 100;
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
					new DataBinding(null, "name"), // bindingForItemText
					fontHeightShort,
					new DataBinding(placeStationDock, "componentToBuild"), // bindingForItemSelected
					new DataBinding(),
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
					new DataBinding(player.flagship, "componentsCurrentOverMax()"),
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
					new DataBinding(null, "name"), // bindingForItemText
					fontHeightShort,
					new DataBinding(placeStationDock, "componentToScrap"), // bindingForItemSelected
					new DataBinding(),
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
					new DataBinding(null, "nameAndComponentInstalled()"), // bindingForItemText
					fontHeightShort,
					new DataBinding(placeStationDock, "weaponSlotToMove"), // bindingForItemSelected
					new DataBinding(),
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
					new DataBinding(player.flagship, "thrustersCurrentOverMax()"),
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
					new DataBinding(player.flagship, "turningJetsCurrentOverMax()"),
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
					new DataBinding(null, "fullName()"), // bindingForItemText
					fontHeightShort,
					new DataBinding(placeStationDock, "shipDefnToBuild"),
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
					this.shipBuild,
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
					new DataBinding(player, "shipsCurrentOverMax()"),
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
					new DataBinding(null, "fullNameAndCrew(world)", { "world" : world } ), // bindingForItemText
					fontHeightShort,
					new DataBinding(placeStationDock, "shipInFleetSelected"),
					new DataBinding()
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
					this.shipScrap,
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
					this.crewAdd,
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
					this.crewRemove,
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
					new DataBinding(player, "credit"),
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
					new DataBinding(player, "flagship.fuelCurrentOverMax()"),
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
					function click()
					{
						if (player.credit >= fuelValuePerUnit)
						{
							player.credit -= fuelValuePerUnit;
							player.fuel += 1;
						}
					},
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
					function click()
					{
						if (player.fuel > 0)
						{
							var fuelUnitsToSell = 1;
							if (player.fuel < 1)
							{
								fuelUnitsToSell = player.fuel;
							}
							player.credit += fuelUnitsToSell * fuelValuePerUnit;
							player.fuel -= fuelUnitsToSell;
						}
					},
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
						marginSize.x * 5,
						marginSize.y * 3 + labelSize.y * 2
					),
					labelSize,
					false, // isTextCentered
					new DataBinding(player, "numberOfLanders"),
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
					function click()
					{
						if (player.credit >= landerValue)
						{
							player.credit -= landerValue;
							player.numberOfLanders++;
						}
					},
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
					function click()
					{
						if (player.numberOfLanders > 0)
						{
							player.numberOfLanders--;
							player.credit += landerValue;
						}
					},
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
					new DataBinding(null, "toString()"), // bindingForItemText
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
						var place = world.place;
						var placeNext = place.placeStation;
						world.placeNext = placeNext;
					},
					universe // context
				),
			]
		);

		return controlRoot;
	}

	PlaceStation.prototype.returnToPlace = function(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entities["Player"];
		var playerLoc = playerFromPlaceNext.locatable.loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
