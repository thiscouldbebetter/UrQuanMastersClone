"use strict";
class Combat {
    constructor(size, encounter, shipGroups) {
        this.size = size;
        this.encounter = encounter;
        this.shipGroups = shipGroups;
        this.shipsFighting = [];
        this._differenceOfWrapAndNoWrap = Coords.create();
        this._displacement = Coords.create();
        this._displacementAbsolute = Coords.create();
        this._displacementWrapped = Coords.create();
        this._displacementWrappedAbsolute = Coords.create();
        this._midpointBetweenPoints = Coords.create();
    }
    static actions() {
        var returnValues = [
            Ship.actionShowMenu(),
            Ship.actionAccelerate(),
            Ship.actionTurnLeft(),
            Ship.actionTurnRight(),
            Ship.actionFire(),
            Ship.actionSpecial()
        ];
        return returnValues;
    }
    static activityDefnEnemy() {
        return new ActivityDefn("CombatEnemy", Combat.activityDefnEnemyPerform);
    }
    static activityDefnEnemyPerform(uwpe) {
        var place = uwpe.place;
        var actor = uwpe.entity;
        var actorShip = Ship.fromEntity(actor);
        var entitiesShips = place.entitiesShips();
        var target = (entitiesShips[0] == actor ? entitiesShips[1] : entitiesShips[0]);
        var targetPos = target.locatable().loc.pos;
        var actorLoc = actor.locatable().loc;
        var actorPos = actorLoc.pos;
        var actorVel = actorLoc.vel;
        var combat = place.combat;
        var targetDisplacement = combat.displacementOfPointsWrappedToRange(actorVel, // displacementToOverwrite
        actorPos, targetPos, combat.size);
        var forwardAsPolar = Polar.create().fromCoords(actorLoc.orientation.forward);
        var angleForward = forwardAsPolar.azimuthInTurns;
        var targetDisplacementAsPolar = Polar.create().fromCoords(targetDisplacement);
        var angleToTarget = targetDisplacementAsPolar.azimuthInTurns;
        var angleTargetMinusForward = NumberHelper.subtractWrappedToRangeMax(angleToTarget, angleForward, 1);
        if (angleTargetMinusForward != 0) {
            var directionToTurn = angleTargetMinusForward / Math.abs(angleTargetMinusForward);
            actorShip.turnInDirection(uwpe, directionToTurn);
        }
        actorShip.accelerate(uwpe);
    }
    exit(universe) {
        var world = universe.world;
        var shipsDestroyed = this.shipGroups[1].shipsLost();
        var creditsForShipsDestroyed = 0;
        shipsDestroyed.forEach(x => creditsForShipsDestroyed += x.defn(world).salvageValue);
        var player = world.player;
        player.flagship.resourceCredits += creditsForShipsDestroyed;
        world.placeNextSet(this.encounter.placeToReturnTo);
        universe.venueNextSet(new VenueWorld(world));
    }
    fight(uwpe) {
        var universe = uwpe.universe;
        var world = universe.world;
        var placeCombat = world.placeCurrent;
        var uwpe = new UniverseWorldPlaceEntities(universe, world, placeCombat, null, null);
        var shipsFighting = this.shipsFighting;
        for (var i = 0; i < shipsFighting.length; i++) {
            var ship = shipsFighting[i];
            var shipEntity = ship.toEntity(uwpe);
            if (placeCombat.entityById(shipEntity.id) == null) {
                placeCombat.entityToSpawnAdd(shipEntity);
            }
        }
        var venueWorld = world.toVenue();
        placeCombat.venueControls = new VenueControls(this.toControlSidebar(uwpe), false // ignoreInputs?
        );
        world.placeNextSet(placeCombat);
        universe.venueNextSet(venueWorld);
    }
    initialize(universe, world, place) {
        var uwpe = new UniverseWorldPlaceEntities(universe, world, place, null, null);
        for (var i = 0; i < this.shipGroups.length; i++) {
            var shipGroup = this.shipGroups[i];
            shipGroup.initialize(uwpe);
        }
        return this;
    }
    shipsFightingHaveBeenSpecified() {
        return (this.shipsFighting[0] != null && this.shipsFighting[1] != null);
    }
    toPlace(world) {
        return new PlaceCombat(world, this);
    }
    updateForTimerTick(uwpe) {
        if (this.shipsFighting[1] == null) {
            var shipGroup1 = this.shipGroups[1];
            this.shipsFighting[1] = shipGroup1.shipSelectOptimum();
        }
    }
    // wrapping
    displacementOfPointsWrappedToRange(displacementToOverwrite, pos0, pos1, size) {
        var displacement = pos1.clone().subtract(pos0);
        var displacementMinSoFar = displacement.clone();
        var displacementMinSoFarAbsolute = displacementMinSoFar.clone().absolute();
        for (var i = -1; i <= 1; i += 2) {
            var displacementWrapped = size.clone().multiplyScalar(i).add(pos1).subtract(pos0);
            var displacementWrappedAbsolute = displacementWrapped.clone().absolute();
            if (displacementWrappedAbsolute.x < displacementMinSoFarAbsolute.x) {
                displacementMinSoFar.x = displacementWrapped.x;
                displacementMinSoFarAbsolute.x = displacementMinSoFarAbsolute.x;
            }
            if (displacementWrappedAbsolute.y < displacementMinSoFarAbsolute.y) {
                displacementMinSoFar.y = displacementWrapped.y;
                displacementMinSoFarAbsolute.y = displacementMinSoFarAbsolute.y;
            }
        }
        return displacementMinSoFar;
    }
    midpointOfPointsWrappedToRange(midpointToOverwrite, pos0, pos1, size) {
        var displacement = this.displacementOfPointsWrappedToRange(midpointToOverwrite, pos0, pos1, size);
        var midpoint = displacement.half().add(pos0);
        return midpoint;
    }
    // controls
    toControlDebriefing(universe, size) {
        var world = universe.world;
        var shipsLost = this.shipGroups[0].shipsLost();
        var shipsDestroyed = this.shipGroups[1].shipsLost();
        var numberOfShipsLost = shipsLost.length;
        var numberOfShipsDestroyed = shipsDestroyed.length;
        var creditsSalvaged = 0;
        shipsDestroyed.forEach(x => creditsSalvaged += x.defn(world).salvageValue);
        var message = "Combat complete.\n"
            + numberOfShipsLost + " ships lost.\n"
            + numberOfShipsDestroyed + " ships destroyed.\n"
            + creditsSalvaged + " credits worth of resources salvaged.\n";
        var returnValue = universe.controlBuilder.message4(universe, size, DataBinding.fromContext(message), () => this.exit(universe));
        return returnValue;
    }
    toControlShipSelect(uwpe, size) {
        var universe = uwpe.universe;
        // hack
        if (this.shipsFighting[1] == null) {
            this.shipsFighting[1] = this.shipGroups[1].shipSelectOptimum();
        }
        var combat = this;
        // todo - Variable sizes.
        var marginWidth = 10;
        var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
        var fontHeightTitle = size.x / 20;
        var fontTitle = FontNameAndHeight.fromHeightInPixels(fontHeightTitle);
        var fontHeight = fontHeightTitle / 2;
        var font = FontNameAndHeight.fromHeightInPixels(fontHeight);
        var titleSize = Coords.fromXY(size.x - marginSize.x * 2, fontHeightTitle);
        var headingSize = Coords.fromXY((size.x - marginSize.x * 3) / 2, fontHeight);
        var buttonHeight = fontHeightTitle;
        var buttonSizeSelect = Coords.fromXY((titleSize.x - marginSize.x * 3) / 4, buttonHeight);
        var buttonSizeFight = Coords.fromXY(titleSize.x, buttonHeight);
        var listSize = Coords.fromXY(headingSize.x, size.y - titleSize.y - headingSize.y - buttonHeight * 2 - marginSize.y * 6);
        var bindingForOptionText = DataBinding.fromGet((c) => c.fullNameAndCrew(uwpe));
        var listShipsYours = ControlList.from9("listShipsYours", Coords.fromXY(marginSize.x, titleSize.y + headingSize.y + marginSize.y * 3), listSize, DataBinding.fromContextAndGet(combat, (c) => c.shipGroups[0].shipsGetAll()), bindingForOptionText, font, new DataBinding(combat, (c) => c.shipGroups[0].shipSelected, (c, v) => c.shipGroups[0].shipSelected = v), // bindingForItemSelected
        null, // bindingForItemValue
        DataBinding.fromContextAndGet(combat, (c) => c.shipsFighting[0] == null) // isEnabled
        );
        var listShipsTheirs = ControlList.from9("listShipsTheirs", Coords.fromXY(marginSize.x * 2 + listSize.x, titleSize.y + headingSize.y + marginSize.y * 3), listSize, DataBinding.fromContextAndGet(combat, (c) => c.shipGroups[1].shipsGetAll()), bindingForOptionText, font, new DataBinding(combat, (c) => c.shipGroups[1].shipSelected, (c, v) => c.shipGroups[1].shipSelected = v), // bindingForItemSelected
        null, // bindingForItemValue
        DataBinding.fromFalse() // isEnabled
        );
        var containerChildren = [
            new ControlLabel("labelTitle", Coords.fromXY(marginSize.x, marginSize.y), titleSize, true, // isTextCentered
            false, // isTextCenteredVertically
            DataBinding.fromContext("Ship Select"), fontTitle),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, titleSize.y + marginSize.y * 2), titleSize, DataBinding.fromContext(this.shipGroups[0].name + ":"), FontNameAndHeight.fromHeightInPixels(fontHeight)),
            listShipsYours,
            new ControlButton("buttonSelectYours", Coords.fromXY(marginSize.x, size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2), buttonSizeSelect, DataBinding.fromContextAndGet(combat, () => "Select"), font, true, // hasBorder
            DataBinding.fromContextAndGet(combat, (c) => (c.shipsFighting[0] == null)), // isEnabled,
            () => {
                var shipYours = listShipsYours.itemSelected();
                combat.shipsFighting[0] = shipYours;
            }, false // canBeHeldDown
            ),
            new ControlButton("buttonRandomYours", Coords.fromXY(marginSize.x * 2 + buttonSizeSelect.x, size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2), buttonSizeSelect, DataBinding.fromContextAndGet(combat, () => "Random"), font, true, // hasBorder
            DataBinding.fromContextAndGet(combat, (c) => (c.shipsFighting[0] == null)), // isEnabled,
            () => {
                var shipGroupIndex = 0;
                var shipGroup = combat.shipGroups[shipGroupIndex];
                var ship = ArrayHelper.random(shipGroup.shipsGetAll(), universe.randomizer);
                combat.shipsFighting[shipGroupIndex] = ship;
                shipGroup.shipSelected = ship;
            }, false // canBeHeldDown
            ),
            ControlLabel.from4Uncentered(Coords.fromXY(listSize.x + marginSize.x * 2, titleSize.y + marginSize.y * 2), titleSize, DataBinding.fromContext(this.shipGroups[1].name + ":"), font),
            listShipsTheirs,
            new ControlButton("buttonSelectTheirs", Coords.fromXY(marginSize.x * 2 + listSize.x, size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2), buttonSizeSelect, DataBinding.fromContext("Select"), font, true, // hasBorder
            DataBinding.fromFalse(), // isEnabled,
            () => {
                var shipTheirs = listShipsTheirs.itemSelected();
                combat.shipsFighting[1] = shipTheirs;
            }, false // canBeHeldDown
            ),
            new ControlButton("buttonRandomTheirs", Coords.fromXY(marginSize.x * 4 + buttonSizeSelect.x * 3, size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2), buttonSizeSelect, DataBinding.fromContext("Random"), font, true, // hasBorder
            DataBinding.fromFalse(), // isEnabled,
            () => {
                var shipGroupIndex = 1;
                var shipGroup = combat.shipGroups[shipGroupIndex];
                var ship = ArrayHelper.random(shipGroup.shipsGetAll(), universe.randomizer);
                combat.shipsFighting[shipGroupIndex] = ship;
                shipGroup.shipSelected = ship;
            }, false // canBeHeldDown
            ),
            new ControlButton("buttonFight", Coords.fromXY(marginSize.x, size.y - marginSize.y - buttonSizeFight.y), buttonSizeFight, DataBinding.fromContextAndGet(combat, () => "Fight"), font, true, // hasBorder
            DataBinding.fromContextAndGet(combat, (c) => (c.shipsFighting[0] != null && c.shipsFighting[1] != null)), // isEnabled,
            () => {
                var shipYours = combat.shipsFighting[0];
                var shipTheirs = combat.shipsFighting[1];
                if (shipYours != null && shipTheirs != null) {
                    combat.fight(uwpe);
                }
            }, false // canBeHeldDown
            ),
        ];
        var returnValue = ControlContainer.from4("containerShipSelect", Coords.Instances().Zeroes, size, containerChildren);
        return returnValue;
    }
    toControlSidebar(uwpe) {
        var containerSidebarSize = Coords.fromXY(100, 300); // hack
        var shipsFighting = this.shipsFighting;
        var childControls = [
            shipsFighting[0].toControlSidebar(containerSidebarSize, 0, uwpe),
            shipsFighting[1].toControlSidebar(containerSidebarSize, 1, uwpe),
        ];
        var containerSidebar = ControlContainer.from4("containerSidebar", Coords.fromXY(300, 0), containerSidebarSize, childControls);
        return containerSidebar;
    }
}
