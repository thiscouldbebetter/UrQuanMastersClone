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
    enemyActivityDefn() {
        return new ActivityDefn("Enemy", this.enemyActivityDefnPerform);
    }
    enemyActivityDefnPerform(universe, worldAsWorld, placeAsPlace, actor) {
        var world = worldAsWorld;
        var place = placeAsPlace;
        var actorShip = EntityExtensions.ship(actor);
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
            actorShip.turnInDirection(world, actor, directionToTurn);
        }
        actorShip.accelerate(world, actor);
    }
    exit(universe) {
        var world = universe.world;
        world.placeNext = this.encounter.placeToReturnTo;
        universe.venueNext = new VenueWorld(world);
    }
    initialize(universe, world, place) {
        for (var i = 0; i < this.shipGroups.length; i++) {
            var shipGroup = this.shipGroups[i];
            shipGroup.initialize(universe, world, place, null);
        }
        return this;
    }
    ship0HasNotBeenSelected() {
        return (this.shipsFighting[0] == null);
    }
    ship1HasNotBeenSelected() {
        return (this.shipsFighting[1] == null);
    }
    shipsHaveBeenSelected() {
        return (this.shipsFighting[0] != null && this.shipsFighting[1] != null);
    }
    start(universe) {
        var world = universe.world;
        world.placeNext = new PlaceCombat(world, this);
        var venueNext = new VenueWorld(world);
        universe.venueNext = venueNext;
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
        var numberOfShipsLost = 0; // todo
        var numberOfShipsDestroyed = 1;
        var numberOfCreditsSalvaged = 550;
        var message = "Combat complete.\n"
            + numberOfShipsLost + " ships lost.\n"
            + numberOfShipsDestroyed + " ships destroyed.\n"
            + numberOfCreditsSalvaged + " credits worth of resources salvaged.\n";
        var returnValue = universe.controlBuilder.message(universe, size, DataBinding.fromContext(message), this.exit.bind(this), null);
        return returnValue;
    }
    toControlShipSelect(universe, size) {
        var combat = this;
        var world = universe.world;
        var shipsYours = this.shipGroups[0].ships;
        var shipsTheirs = this.shipGroups[1].ships;
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
        var listSize = Coords.fromXY(headingSize.x, size.y - titleSize.y - headingSize.y - buttonHeight * 2 - marginSize.y * 6);
        var bindingForOptionText = DataBinding.fromGet((c) => c.fullNameAndCrew(world));
        var listShipsYours = ControlList.from9("listShipsYours", Coords.fromXY(marginSize.x, titleSize.y + headingSize.y + marginSize.y * 3), listSize, DataBinding.fromContext(shipsYours), bindingForOptionText, fontHeight, null, // bindingForItemSelected
        null, // bindingForItemValue
        DataBinding.fromContextAndGet(combat, (c) => c.ship0HasNotBeenSelected()) // isEnabled
        );
        var listShipsTheirs = ControlList.from9("listShipsTheirs", Coords.fromXY(marginSize.x * 2 + listSize.x, titleSize.y + headingSize.y + marginSize.y * 3), listSize, DataBinding.fromContext(shipsTheirs), bindingForOptionText, fontHeight, null, // bindingForItemSelected
        null, // bindingForItemValue
        DataBinding.fromContextAndGet(combat, (c) => c.ship1HasNotBeenSelected()) // isEnabled
        );
        var returnValue = ControlContainer.from4("containerShipSelect", Coords.Instances().Zeroes, size, [
            new ControlLabel("labelTitle", Coords.fromXY(size.x / 2, marginSize.y + fontHeightTitle / 2), titleSize, true, // isTextCentered
            "Ship Select", fontHeightTitle),
            new ControlLabel("labelYours", Coords.fromXY(marginSize.x, titleSize.y + marginSize.y * 2), titleSize, false, // isTextCentered
            this.shipGroups[0].name + ":", fontHeight),
            listShipsYours,
            new ControlButton("buttonSelectYours", Coords.fromXY(marginSize.x, size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2), buttonSizeSelect, "Select", fontHeight, true, // hasBorder
            DataBinding.fromContextAndGet(combat, (c) => c.ship0HasNotBeenSelected()), // isEnabled,
            (universe) => {
                var shipYours = listShipsYours.itemSelected(null);
                combat.shipsFighting[0] = shipYours;
            }, universe, // context
            false // canBeHeldDown
            ),
            new ControlButton("buttonRandomYours", Coords.fromXY(marginSize.x * 2 + buttonSizeSelect.x, size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2), buttonSizeSelect, "Random", fontHeight, true, // hasBorder
            DataBinding.fromContextAndGet(combat, (c) => c.ship0HasNotBeenSelected()), // isEnabled,
            (universe) => {
                var shipGroupIndex = 0;
                var shipGroup = combat.shipGroups[shipGroupIndex];
                var ship = ArrayHelper.random(shipGroup.ships, universe.randomizer);
                combat.shipsFighting[shipGroupIndex] = ship;
                listShipsYours._itemSelected = null;
            }, universe, // context
            false // canBeHeldDown
            ),
            new ControlLabel("labelTheirs", Coords.fromXY(listSize.x + marginSize.x * 2, titleSize.y + marginSize.y * 2), titleSize, false, // isTextCentered
            this.shipGroups[1].name + ":", fontHeight),
            listShipsTheirs,
            new ControlButton("buttonSelectTheirs", Coords.fromXY(marginSize.x * 2 + listSize.x, size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2), buttonSizeSelect, "Select", fontHeight, true, // hasBorder
            DataBinding.fromContextAndGet(combat, (c) => c.ship1HasNotBeenSelected()), // isEnabled,
            (universe) => {
                var shipTheirs = listShipsTheirs.itemSelected(null);
                combat.shipsFighting[1] = shipTheirs;
            }, universe, // context
            false // canBeHeldDown
            ),
            new ControlButton("buttonRandomTheirs", Coords.fromXY(marginSize.x * 4 + buttonSizeSelect.x * 3, size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2), buttonSizeSelect, "Random", fontHeight, true, // hasBorder
            DataBinding.fromContextAndGet(combat, (c) => c.ship1HasNotBeenSelected()), // isEnabled,
            (universe) => {
                var shipGroupIndex = 1;
                var shipGroup = combat.shipGroups[shipGroupIndex];
                var ship = ArrayHelper.random(shipGroup.ships, universe.randomizer);
                combat.shipsFighting[shipGroupIndex] = ship;
                listShipsTheirs._itemSelected = null;
            }, universe, // context
            false // canBeHeldDown
            ),
            new ControlButton("buttonFight", Coords.fromXY(marginSize.x, size.y - marginSize.y - buttonSizeFight.y), buttonSizeFight, "Fight", fontHeight, true, // hasBorder
            DataBinding.fromContextAndGet(combat, (c) => c.shipsHaveBeenSelected()), // isEnabled,
            (universe) => {
                var shipYours = combat.shipsFighting[0];
                var shipTheirs = combat.shipsFighting[1];
                if (shipYours != null && shipTheirs != null) {
                    combat.start(universe);
                }
            }, universe, // context
            false // canBeHeldDown
            ),
        ]);
        return returnValue;
    }
}
