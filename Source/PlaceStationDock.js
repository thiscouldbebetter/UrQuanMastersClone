
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

	PlaceStationDock.prototype.offload = function(universe)
	{
		var world = universe.world;
		var player = world.player;
		var playerItemHolder = player.itemHolder;
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

	// Place

	PlaceStationDock.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceStationDock.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		this.venueControls.draw(universe, world);
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

	PlaceStationDock.prototype.toControl = function(universe, world)
	{
		var placeStationDock = this;

		var player = world.player;
		var playerItemHolder = player.itemHolder;
		var playerShipGroup = player.shipGroup;
		var fuelCostPerUnit = 20;
		var crewCostPerUnit = 3;
		var landerCost = 100;

		var containerDockSize = universe.display.sizeInPixels.clone();
		var fontHeight = 20;
		var fontHeightShort = fontHeight / 2;
		var buttonBackSize = new Coords(25, 25);
		var marginWidth = 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);

		var titleSize = new Coords(containerDockSize.x, 25);
		var labelSize = new Coords(100, 10);

		var containerRightSize = new Coords
		(
			(containerDockSize.x - marginSize.x * 3) / 3,
			containerDockSize.y - marginSize.y * 3 - titleSize.y
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

		var buttonSizeLeft = new Coords
		(
			(containerLeftSize.x - marginSize.x * 3) / 2,
			fontHeightShort * 1.5
		);

		var buttonSizeLeftSmall = new Coords
		(
			(buttonSizeLeft.x - marginSize.x * 2) / 3,
			buttonSizeLeft.y
		);

		var buttonSizeSmall = new Coords(1, 1).multiplyScalar(buttonSizeLeft.y);

		var containerLeftInnerSize = new Coords
		(
			buttonSizeLeft.x,
			(containerLeftSize.y - labelSize.y - buttonSizeLeft.y - marginSize.y * 4)
		); // size

		var shipComponentsInstalled = player.flagshipComponents();

		var shipComponentDefnsAvailable = ShipComponentDefn.Instances()._All;

		var containerComponents = new ControlContainer
		(
			"containerComponents",
			new Coords
			(
				marginSize.x,
				marginSize.y * 2 + titleSize.y
			),
			containerLeftSize,
			// children
			[
				new ControlLabel
				(
					"labelComponentsInstalled",
					marginSize,
					labelSize,
					false, // isTextCentered
					"Installed:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoComponentsInstalled",
					new Coords(marginSize.x * 6, marginSize.y),
					labelSize,
					false, // isTextCentered
					new DataBinding(player, "componentsCurrentOverMax()"),
					fontHeightShort
				),

				new ControlList
				(
					"listComponentsInstalled",
					new Coords(marginSize.x, marginSize.y * 2 + labelSize.y),
					containerLeftInnerSize,
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
						marginSize.x,
						containerLeftSize.y - marginSize.y - buttonSizeLeft.y
					),
					buttonSizeLeft,
					"Scrap",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						var componentToScrap = placeStationDock.componentToScrap;
						if (componentToScrap != null)
						{
							player.flagshipComponentNames.remove(componentToScrap.name);
							player.credit += componentToScrap.cost;
							player.cachesInvalidate();
						}
					},
					universe // context
				),

				new ControlLabel
				(
					"labelComponentsAvailable",
					new Coords
					(
						marginSize.x * 2 + containerLeftInnerSize.x,
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
						marginSize.x * 2 + containerLeftInnerSize.x,
						marginSize.y * 2 + labelSize.y
					),
					containerLeftInnerSize,
					shipComponentDefnsAvailable,
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
						marginSize.x * 2 + containerLeftInnerSize.x,
						containerLeftSize.y - marginSize.y - buttonSizeLeft.y
					),
					buttonSizeLeft,
					"Build",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						var componentToBuild = placeStationDock.componentToBuild;
						if (componentToBuild != null)
						{
							if (player.credit >= componentToBuild.cost)
							{
								player.credit -= componentToBuild.cost;
								player.flagshipComponentNames.push(componentToBuild.name);
								player.cachesInvalidate();
							}
						}
					},
					universe // context
				),
			]
		);

		var shipsInFleet = playerShipGroup.ships;

		var shipPlansAvailable = ShipDefn.Instances();

		var containerShips = new ControlContainer
		(
			"containerShips",
			new Coords
			(
				marginSize.x,
				marginSize.y * 3 + titleSize.y + containerLeftSize.y
			),
			containerLeftSize,
			// children
			[
				new ControlLabel
				(
					"labelFleet",
					marginSize,
					labelSize,
					false, // isTextCentered
					"Fleet:",
					fontHeightShort
				),

				new ControlLabel
				(
					"infoFleet",
					new Coords(marginSize.x * 4, marginSize.y),
					labelSize,
					false, // isTextCentered
					new DataBinding(player, "shipsCurrentOverMax()"),
					fontHeightShort
				),

				new ControlList
				(
					"listShipsInFleet",
					new Coords(marginSize.x, marginSize.y * 2 + labelSize.y),
					containerLeftInnerSize,
					shipsInFleet,
					new DataBinding(null, "fullName(world)", { "world" : world } ), // bindingForItemText
					fontHeightShort,
					new DataBinding(placeStationDock, "shipInFleetSelected"),
					new DataBinding()
				),

				new ControlButton
				(
					"buttonShipScrap",
					new Coords
					(
						marginSize.x,
						containerLeftSize.y - marginSize.y - buttonSizeLeft.y
					),
					buttonSizeLeftSmall,
					"Scrap",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						var shipToScrap = placeStationDock.shipInFleetSelected;
						if (shipToScrap != null)
						{
							var shipToScrapDefn = shipToScrap.defn(world);
							var shipValue =
								shipToScrapDefn.cost
								+ shipToScrap.crew * crewCostPerUnit;
							player.credit += shipValue;
							player.shipGroup.ships.remove(shipToScrap);
						}
					},
					universe // context
				),

				new ControlButton
				(
					"buttonShipCrewAdd",
					new Coords
					(
						marginSize.x * 2 + buttonSizeLeftSmall.x,
						containerLeftSize.y - marginSize.y - buttonSizeLeft.y
					),
					buttonSizeLeftSmall,
					"Crew+",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						var ship = placeStationDock.shipInFleetSelected;
						if (ship.crew < ship.defn(world).crewMax)
						{
							if (player.credit >= crewCostPerUnit)
							{
								player.credit -= crewCostPerUnit;
								ship.crew++;
							}
						}
					},
					universe // context
				),

				new ControlButton
				(
					"buttonShipCrewRemove",
					new Coords
					(
						marginSize.x * 3 + buttonSizeLeftSmall.x * 2,
						containerLeftSize.y - marginSize.y - buttonSizeLeft.y
					),
					buttonSizeLeftSmall,
					"Crew-",
					fontHeightShort,
					true, // hasBorder,a
					true, // isEnabled,
					function click(universe)
					{
						var ship = placeStationDock.shipInFleetSelected;
						if (ship.crew > 1)
						{
							player.credit += crewCostPerUnit;
							ship.crew--;
						}
					},
					universe // context
				),

				new ControlLabel
				(
					"labelShipsAvailable",
					new Coords
					(
						marginSize.x * 2 + containerLeftInnerSize.x,
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
						marginSize.x * 2 + containerLeftInnerSize.x,
						marginSize.y * 2 + labelSize.y
					),
					containerLeftInnerSize,
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
						marginSize.x * 2 + containerLeftInnerSize.x,
						containerLeftSize.y - marginSize.y - buttonSizeLeft.y
					),
					buttonSizeLeft,
					"Build",
					fontHeightShort,
					true, // hasBorder,
					true, // isEnabled,
					function click(universe)
					{
						var shipDefnToBuild = placeStationDock.shipDefnToBuild;
						if (shipDefnToBuild != null)
						{
							if (player.shipGroups.ships.length < player.shipsMax)
							{
								var shipValue =
									shipDefnToBuild.cost
									+ 1 * crewCostPerUnit;
								if (player.credit >= shipValue)
								{
									player.credit -= shipValue;
									var ship = new Ship(shipDefnToBuild.name);
									player.shipGroup.ships.push(ship);
								}
							}
						}
					},
					universe // context
				),
			]
		);

		var containerResources = new ControlContainer
		(
			"containerRight",
			new Coords
			(
				marginSize.x * 2 + containerLeftSize.x,
				marginSize.y * 2 + titleSize.y
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
					new Coords(marginSize.x * 6, marginSize.y),
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
					new DataBinding(player, "fuelCurrentOverMax()"),
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
						if (player.credit >= fuelCostPerUnit)
						{
							player.credit -= fuelCostPerUnit;
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
							player.credit += fuelUnitsToSell * fuelCostPerUnit;
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
						if (player.credit >= landerCost)
						{
							player.credit -= landerCost;
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
							player.credit += landerCost;
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
					new Coords(containerDockSize.x / 2, marginSize.y + titleSize.y / 2),
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
					fontHeight,
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
