"use strict";
class PlaceStationDock extends PlaceBase {
    constructor(world, placeStation) {
        super(PlaceStationDock.name, PlaceStationDock.name, null, // parentName
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
    componentBackboneBuild(universe) {
        var player = universe.world.player;
        var flagship = player.flagship;
        var componentsBackboneInstalled = flagship.componentsBackbone();
        if (componentsBackboneInstalled.length < flagship.componentsBackboneMax) {
            this.componentBuild(universe, this.componentToBuild);
        }
    }
    componentBackboneScrap(universe) {
        this.componentScrap(universe, this.componentToScrap);
    }
    componentThrusterBuild(universe) {
        var player = universe.world.player;
        var flagship = player.flagship;
        var thrustersInstalled = flagship.componentsThruster();
        if (thrustersInstalled.length < flagship.thrustersMax) {
            var componentName = thrustersInstalled[0].name;
            var componentToBuild = ShipComponentDefn.byName(componentName);
            this.componentBuild(universe, componentToBuild);
        }
    }
    componentThrusterScrap(universe) {
        var player = universe.world.player;
        var thrustersInstalled = player.flagship.componentsThruster();
        var componentToScrap = thrustersInstalled[1]; // Cannot remove last.
        this.componentScrap(universe, componentToScrap);
    }
    componentTurningJetsBuild(universe) {
        var player = universe.world.player;
        var flagship = player.flagship;
        var turningJetsInstalled = flagship.componentsTurningJets();
        if (turningJetsInstalled.length < flagship.turningJetsMax) {
            var componentName = turningJetsInstalled[0].name;
            var componentToBuild = ShipComponentDefn.byName(componentName);
            this.componentBuild(universe, componentToBuild);
        }
    }
    componentTurningJetsScrap(universe) {
        var player = universe.world.player;
        var turningJetsInstalled = player.flagship.componentsTurningJets();
        var componentToScrap = turningJetsInstalled[1]; // Cannot remove last.
        this.componentScrap(universe, componentToScrap);
    }
    componentBuild(universe, componentToBuild) {
        if (componentToBuild != null) {
            var player = universe.world.player;
            if (player.resourceCredits >= componentToBuild.value) {
                player.resourceCredits -= componentToBuild.value;
                player.flagship.componentNames.push(componentToBuild.name);
                player.cachesCalculate();
            }
        }
    }
    componentScrap(universe, componentToScrap) {
        if (componentToScrap != null) {
            var player = universe.world.player;
            ArrayHelper.remove(player.flagship.componentNames, componentToScrap.name);
            player.resourceCredits += componentToScrap.value;
            player.cachesCalculate();
        }
    }
    crewAdd(universe) {
        var world = universe.world;
        var ship = this.shipInFleetSelected;
        if (ship.crew < ship.defn(world).crewMax) {
            var player = world.player;
            if (player.resourceCredits >= this.crewValuePerUnit) {
                player.resourceCredits -= this.crewValuePerUnit;
                ship.crew++;
            }
        }
    }
    crewRemove(universe) {
        var ship = this.shipInFleetSelected;
        if (ship.crew > 1) {
            var player = universe.world.player;
            player.resourceCredits += this.crewValuePerUnit;
            ship.crew--;
        }
    }
    fuelAdd(universe) {
        var player = universe.world.player;
        var flagship = player.flagship;
        var fuelMax = flagship._fuelMax;
        if (player.resourceCredits >= this.fuelValuePerUnit && flagship.fuel < fuelMax) {
            var fuelUnitsToBuy = 1;
            if (flagship.fuel + fuelUnitsToBuy > fuelMax) {
                fuelUnitsToBuy = fuelMax + flagship.fuel;
            }
            var fuelValue = Math.ceil(this.fuelValuePerUnit * fuelUnitsToBuy);
            player.resourceCredits -= fuelValue;
            flagship.fuel += fuelUnitsToBuy;
        }
    }
    fuelRemove(universe) {
        var player = universe.world.player;
        var flagship = player.flagship;
        if (flagship.fuel > 0) {
            var fuelUnitsToSell = 1;
            if (flagship.fuel < fuelUnitsToSell) {
                fuelUnitsToSell = player.flagship.fuel;
            }
            var fuelValue = Math.floor(fuelUnitsToSell * this.fuelValuePerUnit);
            player.resourceCredits += fuelValue;
            flagship.fuel -= fuelUnitsToSell;
        }
    }
    landerAdd(universe) {
        var player = universe.world.player;
        if (player.resourceCredits >= this.landerValue) {
            player.resourceCredits -= this.landerValue;
            player.flagship.numberOfLanders++;
        }
    }
    landerRemove(universe) {
        var player = universe.world.player;
        var flagship = player.flagship;
        if (flagship.numberOfLanders > 0) {
            flagship.numberOfLanders--;
            player.resourceCredits += this.landerValue;
        }
    }
    offload(universe) {
        var world = universe.world;
        var player = world.player;
        var playerItemHolder = player.flagship.itemHolderCargo;
        var items = playerItemHolder.items;
        var valueSumSoFar = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemDefnName = item.defnName;
            var resourceDefn = ResourceDefn.byName(itemDefnName);
            var resourceValue = resourceDefn.valuePerUnit * item.quantity;
            valueSumSoFar += resourceValue;
        }
        player.resourceCredits += valueSumSoFar;
        items.length = 0;
    }
    shipBuild(universe) {
        var shipDefnToBuild = this.shipDefnToBuild;
        if (shipDefnToBuild != null) {
            var world = universe.world;
            var player = world.player;
            if (player.shipGroup.ships.length < player.flagship.shipsMax) {
                var shipValue = shipDefnToBuild.value;
                if (player.resourceCredits >= shipValue) {
                    player.resourceCredits -= shipValue;
                    var ship = new Ship(shipDefnToBuild.name);
                    ship.initialize(new UniverseWorldPlaceEntities(universe, world, this, null, null));
                    player.shipGroup.ships.push(ship);
                }
            }
        }
    }
    shipScrap(universe) {
        var world = universe.world;
        var shipToScrap = this.shipInFleetSelected;
        if (shipToScrap != null) {
            var shipToScrapDefn = shipToScrap.defn(world);
            var shipValue = shipToScrapDefn.value
                + shipToScrap.crew * this.crewValuePerUnit;
            var player = world.player;
            player.resourceCredits += shipValue;
            ArrayHelper.remove(player.shipGroup.ships, shipToScrap);
        }
    }
    // Place
    draw(universe, world) {
        super.draw(universe, world, null);
        this.venueControls.draw(universe);
    }
    initialize(uwpe) {
        super.initialize(uwpe);
        /*
        var player = (world as WorldExtended).player;
        player.initialize(universe, world, this, player);
        */
    }
    updateForTimerTick(uwpe) {
        super.updateForTimerTick(uwpe);
        var universe = uwpe.universe;
        var world = uwpe.world;
        if (this.venueControls == null) {
            var controlRoot = this.toControl(universe, world);
            this.venueControls = new VenueControls(controlRoot, null);
        }
        this.venueControls.updateForTimerTick(universe);
    }
    // controls
    toControl(universe, worldAsWorld) {
        var placeStationDock = this;
        var world = worldAsWorld;
        var player = world.player;
        var playerItemHolder = player.flagship.itemHolderCargo;
        var playerShipGroup = player.shipGroup;
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
        var containerRightSize = Coords.fromXY((containerDockSize.x - marginSize.x * 3) * .3, containerDockSize.y - marginSize.y * 2 - titleSize.y);
        var buttonSizeRight = Coords.fromXY(containerRightSize.x - marginSize.x * 2, fontHeightShort * 2);
        var containerLeftSize = Coords.fromXY(containerDockSize.x - marginSize.x * 3 - containerRightSize.x, (containerRightSize.y - marginSize.y) / 2);
        var buttonSizeComponents = Coords.fromXY((containerLeftSize.x - marginSize.x * 4) / 3, fontHeightShort * 1.5);
        var buttonSizeShips = Coords.fromXY((containerLeftSize.x - marginSize.x * 3) / 2, fontHeightShort * 1.5);
        var buttonSizeShipsSmall = Coords.fromXY((buttonSizeShips.x - marginSize.x * 2) / 3, buttonSizeShips.y);
        var buttonSizeSmall = Coords.fromXY(1, 1).multiplyScalar(buttonSizeShips.y * .8);
        var listComponentsSize = Coords.fromXY(buttonSizeComponents.x, (containerLeftSize.y - labelSize.y * 2 - buttonSizeShips.y - marginSize.y * 5)); // size
        var listShipsSize = Coords.fromXY(buttonSizeShips.x, (containerLeftSize.y - labelSize.y - buttonSizeShips.y - marginSize.y * 4)); // size
        var shipComponentsInstalled = player.flagship.componentsBackbone();
        var shipComponentDefnsKnownBackbone = player.shipComponentDefnsKnownBackbone();
        var containerComponents = ControlContainer.from4("containerComponents", Coords.fromXY(marginSize.x, marginSize.y + titleSize.y), containerLeftSize, 
        // children
        [
            new ControlLabel("labelComponentsAvailable", Coords.fromXY(marginSize.x, marginSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Available:"), fontShort),
            ControlList.from8("listComponents", Coords.fromXY(marginSize.x, marginSize.y * 2 + labelSize.y), listComponentsSize, DataBinding.fromContextAndGet(placeStationDock, (c) => shipComponentDefnsKnownBackbone), DataBinding.fromGet((c) => c.name), // bindingForItemText
            fontShort, new DataBinding(placeStationDock, (c) => c.componentToBuild, (c, v) => c.componentToBuild = v), // bindingForItemSelected
            DataBinding.fromContext(null) // ?
            ),
            ControlButton.from8("buttonComponentBuild", Coords.fromXY(marginSize.x, marginSize.y * 3 + labelSize.y + listComponentsSize.y), buttonSizeComponents, "Build", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            () => this.componentBackboneBuild(universe)),
            new ControlLabel("labelComponentsInstalled", Coords.fromXY(marginSize.x * 2 + listComponentsSize.x, marginSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Installed:"), fontShort),
            new ControlLabel("infoComponentsInstalled", Coords.fromXY(marginSize.x * 8 + listComponentsSize.x, marginSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(player.flagship, (c) => c.componentsBackboneCurrentOverMax()), fontShort),
            ControlList.from8("listComponentsInstalled", Coords.fromXY(marginSize.x * 2 + listComponentsSize.x, marginSize.y * 2 + labelSize.y), listComponentsSize, DataBinding.fromContextAndGet(placeStationDock, (c) => shipComponentsInstalled), DataBinding.fromGet((c) => c.name), // bindingForItemText
            fontShort, new DataBinding(placeStationDock, (c) => c.componentToScrap, (c, v) => c.componentToScrap = v), // bindingForItemSelected
            DataBinding.fromContext(null)),
            ControlButton.from8("buttonComponentScrap", Coords.fromXY(marginSize.x * 2 + listComponentsSize.x, marginSize.y * 3 + labelSize.y + listComponentsSize.y), buttonSizeComponents, "Scrap", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            () => this.componentBackboneScrap(universe)),
            new ControlLabel("labelWeaponPositions", Coords.fromXY(marginSize.x * 3 + listComponentsSize.x * 2, marginSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Weapons:"), fontShort),
            ControlList.from8("listWeapons", Coords.fromXY(marginSize.x * 3 + listComponentsSize.x * 2, marginSize.y * 2 + labelSize.y), listComponentsSize, DataBinding.fromContextAndGet(placeStationDock, (c) => shipWeaponSlots), DataBinding.fromGet((c) => c.nameAndComponentInstalled() // bindingForItemText
            ), fontShort, new DataBinding(placeStationDock, (c) => c.weaponSlotToMove, (c, v) => c.weaponSlotToMove = v), // bindingForItemSelected
            DataBinding.fromContext(null) // ?
            ),
            ControlButton.from8("buttonWeaponUp", Coords.fromXY(marginSize.x * 3 + listComponentsSize.x * 2, marginSize.y * 3 + labelSize.y + listComponentsSize.y), buttonSizeComponents, "Up", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            () => {
                // todo
            }),
            new ControlLabel("labelThrusters", Coords.fromXY(marginSize.x, marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Thrusters:"), fontShort),
            new ControlLabel("infoThrusters", Coords.fromXY(marginSize.x * 8, marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(player.flagship, (c) => c.thrustersCurrentOverMax()), fontShort),
            ControlButton.from8("buttonThrusterAdd", Coords.fromXY(containerLeftSize.x / 2 - marginSize.x * 2 - buttonSizeSmall.x * 2, marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y), buttonSizeSmall, "+", fontShort, true, // hasBorder
            DataBinding.fromTrue(), // isEnabled
            this.componentThrusterBuild.bind(this)),
            ControlButton.from8("buttonThrusterRemove", Coords.fromXY(containerLeftSize.x / 2 - marginSize.x * 2 - buttonSizeSmall.x * 1, marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y), buttonSizeSmall, "-", fontShort, true, // hasBorder
            DataBinding.fromTrue(), // isEnabled
            this.componentThrusterScrap.bind(this)),
            new ControlLabel("labelTurningJets", Coords.fromXY(containerLeftSize.x / 2 + marginSize.x, marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Turning Jets:"), fontShort),
            new ControlLabel("infoTurningJets", Coords.fromXY(containerLeftSize.x / 2 + marginSize.x * 9, marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(player.flagship, (c) => c.turningJetsCurrentOverMax()), fontShort),
            ControlButton.from8("buttonTurningJetAdd", Coords.fromXY(containerLeftSize.x - marginSize.x - buttonSizeSmall.x * 2, marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y), buttonSizeSmall, "+", fontShort, true, // hasBorder
            DataBinding.fromTrue(), // isEnabled
            this.componentTurningJetsBuild.bind(this)),
            ControlButton.from8("buttonTurningJetRemove", Coords.fromXY(containerLeftSize.x - marginSize.x - buttonSizeSmall.x * 1, marginSize.y * 4 + labelSize.y + listComponentsSize.y + buttonSizeComponents.y), buttonSizeSmall, "-", fontShort, true, // hasBorder
            DataBinding.fromTrue(), // isEnabled
            this.componentTurningJetsScrap.bind(this)),
        ]);
        var shipsInFleet = playerShipGroup.ships;
        var shipPlansAvailable = player.shipDefnsAvailable(universe);
        var containerShips = ControlContainer.from4("containerShips", Coords.fromXY(marginSize.x, marginSize.y * 2 + titleSize.y + containerLeftSize.y), containerLeftSize, 
        // children
        [
            new ControlLabel("labelShipsAvailable", Coords.fromXY(marginSize.x, marginSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Available:"), fontShort),
            ControlList.from8("listShipPlansAvailable", Coords.fromXY(marginSize.x, marginSize.y * 2 + labelSize.y), listShipsSize, DataBinding.fromContextAndGet(placeStationDock, (c) => shipPlansAvailable), DataBinding.fromGet((c) => c.fullNameAndValue()), // bindingForItemText
            fontShort, new DataBinding(placeStationDock, (c) => c.shipDefnToBuild, (c, v) => c.shipDefnToBuild = v), DataBinding.fromContext(null)),
            ControlButton.from8("buttonShipBuild", Coords.fromXY(marginSize.x, containerLeftSize.y - marginSize.y - buttonSizeShips.y), buttonSizeShips, "Build", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            this.shipBuild.bind(this)),
            new ControlLabel("labelFleet", Coords.fromXY(marginSize.x * 2 + listShipsSize.x, marginSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Fleet:"), fontShort),
            new ControlLabel("infoFleet", Coords.fromXY(marginSize.x * 6 + listShipsSize.x, marginSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(player, (c) => c.shipsCurrentOverMax()), fontShort),
            ControlList.from8("listShipsInFleet", Coords.fromXY(marginSize.x * 2 + listShipsSize.x, marginSize.y * 2 + labelSize.y), listShipsSize, DataBinding.fromContextAndGet(placeStationDock, (c) => shipsInFleet), DataBinding.fromGet((c) => c.fullNameAndCrew(world)), // bindingForItemText
            fontShort, new DataBinding(placeStationDock, (c) => c.shipInFleetSelected, (c, v) => c.shipInFleetSelected = v), DataBinding.fromContext(null) // ?
            ),
            ControlButton.from8("buttonShipScrap", Coords.fromXY(marginSize.x * 2 + listShipsSize.x, containerLeftSize.y - marginSize.y - buttonSizeShips.y), buttonSizeShipsSmall, "Scrap", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            this.shipScrap.bind(this)),
            ControlButton.from8("buttonShipCrewAdd", Coords.fromXY(marginSize.x * 3 + listShipsSize.x + buttonSizeShipsSmall.x, containerLeftSize.y - marginSize.y - buttonSizeShips.y), buttonSizeShipsSmall, "Crew+", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            this.crewAdd.bind(this)),
            ControlButton.from8("buttonShipCrewRemove", Coords.fromXY(marginSize.x * 4 + listShipsSize.x + buttonSizeShipsSmall.x * 2, containerLeftSize.y - marginSize.y - buttonSizeShips.y), buttonSizeShipsSmall, "Crew-", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            this.crewRemove.bind(this)),
        ]);
        var containerResources = ControlContainer.from4("containerResources", Coords.fromXY(marginSize.x * 2 + containerLeftSize.x, marginSize.y + titleSize.y), containerRightSize, 
        // children
        [
            new ControlLabel("labelResources", marginSize, labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Resources:"), fontShort),
            new ControlLabel("infoResources", Coords.fromXY(marginSize.x * 7, marginSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(player, (c) => "" + c.resourceCredits), fontShort),
            new ControlLabel("labelFuel", Coords.fromXY(marginSize.x, marginSize.y * 2 + labelSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Fuel:"), fontShort),
            new ControlLabel("infoFuel", Coords.fromXY(marginSize.x * 4, marginSize.y * 2 + labelSize.y), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(player, (c) => c.flagship.fuelCurrentOverMax()), fontShort),
            ControlButton.from8("buttonFuelAdd", Coords.fromXY(containerRightSize.x - marginSize.x - buttonSizeSmall.x * 2, marginSize.y * 2 + labelSize.y), buttonSizeSmall, "+", fontShort, true, // hasBorder
            DataBinding.fromTrue(), // isEnabled
            this.fuelAdd.bind(this)),
            ControlButton.from8("buttonFuelRemove", Coords.fromXY(containerRightSize.x - marginSize.x - buttonSizeSmall.x, marginSize.y * 2 + labelSize.y), buttonSizeSmall, "-", fontShort, true, // hasBorder
            DataBinding.fromTrue(), // isEnabled
            this.fuelRemove.bind(this)),
            new ControlLabel("labelLanders", Coords.fromXY(marginSize.x, marginSize.y * 3 + labelSize.y * 2), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Landers:"), fontShort),
            new ControlLabel("infoLanders", Coords.fromXY(marginSize.x * 6, marginSize.y * 3 + labelSize.y * 2), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContextAndGet(player.flagship, (c) => "" + c.numberOfLanders), fontShort),
            ControlButton.from8("buttonLanderAdd", Coords.fromXY(containerRightSize.x - marginSize.x - buttonSizeSmall.x * 2, marginSize.y * 3 + labelSize.y * 2), buttonSizeSmall, "+", fontShort, true, // hasBorder
            DataBinding.fromTrue(), // isEnabled
            this.landerAdd.bind(this)),
            ControlButton.from8("buttonLanderRemove", Coords.fromXY(containerRightSize.x - marginSize.x - buttonSizeSmall.x, marginSize.y * 3 + labelSize.y * 2), buttonSizeSmall, "-", fontShort, true, // hasBorder
            DataBinding.fromTrue(), // isEnabled
            this.landerRemove.bind(this)),
            new ControlLabel("labelMinerals", Coords.fromXY(marginSize.x, marginSize.y * 4 + labelSize.y * 3), labelSize, false, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Minerals:"), fontShort),
            ControlList.from8("listMinerals", Coords.fromXY(marginSize.x, marginSize.y * 5 + labelSize.y * 4), Coords.fromXY(containerRightSize.x - marginSize.x * 2, containerRightSize.y - marginSize.y * 7 - labelSize.y * 4 - buttonSizeRight.y), // size
            DataBinding.fromContext(playerItemHolder.items), DataBinding.fromGet((c) => c.toString(null)), // bindingForItemText
            fontShort, DataBinding.fromContext(null), // bindingForItemSelected
            DataBinding.fromContext(null) // bindingForItemValue
            ),
            ControlButton.from8("buttonResourcesOffload", Coords.fromXY(marginSize.x, containerRightSize.y - marginSize.y - buttonSizeRight.y // todo
            ), buttonSizeRight, "Offload", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            () => // click
             {
                placeStationDock.offload(universe);
            }),
        ]);
        var controlRoot = ControlContainer.from4("containerDock", Coords.fromXY(0, 0), // pos
        containerDockSize, [
            new ControlLabel("labelDock", Coords.fromXY(containerDockSize.x / 2, titleSize.y / 2), titleSize, true, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Dock"), font),
            containerComponents,
            containerShips,
            containerResources,
            ControlButton.from8("buttonBack", marginSize, buttonBackSize, "<", fontShort, true, // hasBorder,
            DataBinding.fromTrue(), // isEnabled,
            () => {
                var world = universe.world;
                var place = world.placeCurrent;
                var placeNext = place.placeStation;
                world.placeNext = placeNext;
            }),
        ]);
        return controlRoot;
    }
    returnToPlace(world) {
        var placeNext = this.placeToReturnTo;
        var playerFromPlaceNext = placeNext.entityByName(Player.name);
        var playerLoc = playerFromPlaceNext.locatable().loc;
        playerLoc.pos.overwriteWith(this.posToReturnTo);
        playerLoc.vel.clear();
        world.placeNext = placeNext;
    }
}
