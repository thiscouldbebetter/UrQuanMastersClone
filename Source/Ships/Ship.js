"use strict";
class Ship {
    constructor(defnName) {
        this.defnName = defnName;
        this.name =
            "Ship " + ("" + Math.random()).split(".").join(""); // todo
        this.captainName =
            "Captain " + ("" + Math.random()).split(".").join(""); // todo
    }
    static fromDefnName(defnName) {
        return new Ship(defnName);
    }
    static fromEntity(shipEntity) {
        return shipEntity.propertyByName(Ship.name);
    }
    static manyFromDefnNameAndCount(defnName, count) {
        var ships = new Array();
        for (var i = 0; i < count; i++) {
            var ship = Ship.fromDefnName(defnName);
            ships.push(ship);
        }
        return ships;
    }
    // static methods
    static actionAccelerate() {
        return new Action("Accelerate", (uwpe) => {
            var ship = Ship.fromEntity(uwpe.entity);
            ship.accelerate(uwpe);
        });
    }
    static actionFire() {
        var returnValue = new Action("Fire", (uwpe) => {
            var universe = uwpe.universe;
            var world = uwpe.world;
            var place = uwpe.place;
            var actor = uwpe.entity;
            var ship = Ship.fromEntity(actor);
            var shipDefn = ship.defn(world);
            var attackDefn = shipDefn.attackDefn;
            if (ship.energy >= attackDefn.energyToUse) {
                ship.energy -= attackDefn.energyToUse;
                attackDefn.activate(universe, world, place, actor);
            }
        });
        return returnValue;
    }
    static actionSpecial() {
        var returnValue = new Action("Special", (uwpe) => {
            var universe = uwpe.universe;
            var world = uwpe.world;
            var place = uwpe.place;
            var actor = uwpe.entity;
            var ship = Ship.fromEntity(actor);
            var shipDefn = ship.defn(world);
            var specialDefn = shipDefn.specialDefn;
            if (ship.energy >= specialDefn.energyToUse) {
                ship.energy -= specialDefn.energyToUse;
                specialDefn.activate(universe, world, place, actor);
            }
        });
        return returnValue;
    }
    static actionShowMenu() {
        return new Action("ShowMenu", (uwpe) => {
            var universe = uwpe.universe;
            var venueNext = VenueControls.fromControl(universe.controlBuilder.gameAndSettings1(universe));
            venueNext = VenueFader.fromVenuesToAndFrom(venueNext, universe.venueCurrent());
            universe.venueNextSet(venueNext);
        });
    }
    static actionTurnLeft() {
        return new Action("TurnLeft", (uwpe) => {
            Ship.fromEntity(uwpe.entity).turnLeft(uwpe);
        });
    }
    static actionTurnRight() {
        return new Action("TurnRight", (uwpe) => {
            Ship.fromEntity(uwpe.entity).turnRight(uwpe);
        });
    }
    static actions() {
        var returnValues = [
            Ship.actionShowMenu(),
            Ship.actionAccelerate(),
            Ship.actionTurnLeft(),
            Ship.actionTurnRight(),
            PlaceHyperspace.actionMapView(),
        ];
        return returnValues;
    }
    static actionToInputsMappings() {
        var inactivateTrue = true;
        var inactivateFalse = false;
        var returnValues = [
            new ActionToInputsMapping("ShowMenu", ["Escape"], inactivateTrue),
            new ActionToInputsMapping("TurnLeft", ["a", "ArrowLeft", "Gamepad0Left"], inactivateFalse),
            new ActionToInputsMapping("TurnRight", ["d", "ArrowRight", "Gamepad0Right"], inactivateFalse),
            new ActionToInputsMapping("Accelerate", ["w", "ArrowUp", "Gamepad0Up"], inactivateFalse),
            new ActionToInputsMapping("Fire", ["f", "Enter", "Gamepad0Button0"], inactivateTrue),
            new ActionToInputsMapping("Special", ["g", "Enter", "Gamepad0Button1"], inactivateTrue),
            new ActionToInputsMapping("MapView", ["Tab", "Gamepad0Button2"], inactivateTrue),
        ];
        return returnValues;
    }
    static manyFromDefns(defns) {
        var ships = [];
        for (var i = 0; i < defns.length; i++) {
            var defn = defns[i];
            var defnName = defn.name;
            var ship = new Ship(defnName);
            ships.push(ship);
        }
        return ships;
    }
    // instance methods
    collide(uwpe) {
        // todo
    }
    crewCurrentOverMax(uwpe) {
        return this.crew + "/" + this.crewMax(uwpe);
    }
    crewMax(uwpe) {
        var world = uwpe.world;
        var defn = this.defn(world);
        var crewMax = defn.crewMax(uwpe);
        return crewMax;
    }
    crewSet(value) {
        this.crew = value;
        return this;
    }
    crewSetToMax(uwpe) {
        var crewMax = this.crewMax(uwpe);
        return this.crewSet(crewMax);
    }
    defn(world) {
        return world.defnExtended().shipDefnByName(this.defnName);
    }
    die(uwpe) {
        var place = uwpe.place;
        var entityShipToDie = uwpe.entity;
        var ship = Ship.fromEntity(entityShipToDie);
        var combat = place.combat;
        ArrayHelper.remove(combat.shipsFighting, ship);
        var shipGroups = combat.shipGroups;
        for (var g = 0; g < shipGroups.length; g++) {
            var shipGroup = shipGroups[g];
            var shipsAll = shipGroup.shipsGetAll();
            if (ArrayHelper.contains(shipsAll, ship)) {
                ArrayHelper.remove(shipsAll, ship);
                shipGroup.shipLostAdd(ship);
            }
        }
        var visualToRecycle = entityShipToDie.drawable().visual;
        visualToRecycle.child =
            VisualCircle.fromRadiusAndColorFill(32, Color.Instances().Red);
        entityShipToDie.locatable().loc.vel.clear();
        var entityExplosion = new Entity("Explosion", [
            new Ephemeral(64, place.roundOver),
            Drawable.fromVisual(visualToRecycle),
            entityShipToDie.locatable(),
        ]);
        place.entityToSpawnAdd(entityExplosion);
    }
    energyCurrentOverMax(uwpe) {
        return Math.floor(this.energy) + "/" + this.energyMax(uwpe);
    }
    energyMax(uwpe) {
        var world = uwpe.world;
        return this.defn(world).energyMax(uwpe);
    }
    fullName(uwpe) {
        var world = uwpe.world;
        return this.defn(world).factionName + " " + this.defnName;
    }
    fullNameAndCrew(uwpe) {
        return this.fullName(uwpe) + "(" + this.crewCurrentOverMax(uwpe) + ")";
    }
    toEntity(uwpe) {
        var world = uwpe.world;
        var place = uwpe.place;
        var actor = Actor.default();
        var entityDimension = 32; // todo
        var shipCollider = new Sphere(Coords.zeroes(), entityDimension / 2);
        var collidable = new Collidable(false, // canCollideAgainWithoutSeparating
        null, // ticks
        shipCollider, [Collidable.name], // entityPropertyNamesToCollideWith
        this.collide);
        var constraintWrapToRange = new Constraint_WrapToPlaceSize();
        var constraintSpeedMax = new Constraint_SpeedMaxXY(5); // An absolute upper limit.
        var constrainable = new Constrainable([
            constraintSpeedMax,
            constraintWrapToRange
        ]);
        var defn = this.defn(world);
        var shipVisualBody = defn.visual;
        var shipVisual = new VisualWrapped(place.size(), shipVisualBody);
        var drawable = Drawable.fromVisual(shipVisual);
        var itemHolder = ItemHolder.create();
        var killable = new Killable(this.crew, null, this.die);
        var shipPos = Coords.create();
        var shipLoc = Disposition.fromPos(shipPos);
        var locatable = new Locatable(shipLoc);
        var movable = Movable.default();
        var shipEntityProperties = new Array(actor, collidable, constrainable, drawable, itemHolder, killable, locatable, movable, this);
        var shipEntity = new Entity(this.name, shipEntityProperties);
        return shipEntity;
    }
    // EntityProperty.
    finalize(uwpe) {
        // Do nothing.
    }
    initialize(uwpe) {
        var world = uwpe.world;
        var defn = this.defn(world);
        if (this.crew == null) {
            this.crew = defn.crewInitial;
        }
        if (this.energy == null) {
            this.energy = defn.energyMax(uwpe);
        }
    }
    propertyName() { return Ship.name; }
    updateForTimerTick(uwpe) {
        var world = uwpe.world;
        var entityShip = uwpe.entity;
        var ship = Ship.fromEntity(entityShip);
        var shipDefn = ship.defn(world);
        var energyPerTick = shipDefn.energyPerTick(uwpe);
        ship.energy += energyPerTick;
        var energyMax = shipDefn.energyMax(uwpe);
        if (ship.energy > energyMax) {
            ship.energy = energyMax;
        }
    }
    // movement
    accelerate(uwpe) {
        var entity = uwpe.entity;
        var entityShipGroup = ShipGroupFinite.fromEntity(entity);
        var ship = (entityShipGroup != null
            ? entityShipGroup.shipFirst()
            : Ship.fromEntity(entity));
        var world = uwpe.world;
        var shipDefn = ship.defn(world);
        var shipLoc = entity.locatable().loc;
        var shipForward = shipLoc.orientation.forward;
        shipLoc.accel.overwriteWith(shipForward).multiplyScalar(shipDefn.acceleration(uwpe));
        var shipVel = shipLoc.vel;
        var shipSpeed = shipVel.magnitude();
        if (shipSpeed > shipDefn.speedMax) {
            shipVel.normalize().multiplyScalar(shipDefn.speedMax);
        }
    }
    turnInDirection(uwpe, direction) {
        var entity = uwpe.entity;
        var entityLoc = entity.locatable().loc;
        var entityOrientation = entityLoc.orientation;
        var entityForward = entityOrientation.forward;
        var entityShip = Ship.fromEntity(entity);
        var ship = (entityShip == null
            ? ShipGroupFinite.fromEntity(entity).shipFirst()
            : entityShip);
        var world = uwpe.world;
        var shipDefn = ship.defn(world);
        var turnsPerTick = shipDefn.turnsPerTick(uwpe);
        var entityForwardNew = Ship._polar.fromCoords(entityForward).addToAzimuthInTurns(turnsPerTick * direction).wrap().toCoords(entityForward);
        entityOrientation.forwardSet(entityForwardNew);
    }
    turnLeft(uwpe) {
        this.turnInDirection(uwpe, -1);
    }
    turnRight(uwpe) {
        this.turnInDirection(uwpe, 1);
    }
    // Clonable.
    clone() {
        throw new Error("todo");
    }
    overwriteWith(other) {
        throw new Error("todo");
    }
    // controls
    toControlSidebar(containerSidebarSize, indexTopOrBottom, uwpe) {
        var ship = this;
        var marginWidth = containerSidebarSize.x / 10;
        var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
        var containerShipSize = Coords.fromXY(containerSidebarSize.x - marginSize.x * 2, (containerSidebarSize.y - marginSize.y * 3) / 2);
        var fontHeight = 20;
        //var font = FontNameAndHeight.fromHeightInPixels(fontHeight);
        var fontHeightShort = fontHeight / 2;
        var fontShort = FontNameAndHeight.fromHeightInPixels(fontHeightShort);
        var labelSizeWide = Coords.fromXY(containerShipSize.x - marginSize.x * 2, fontHeightShort);
        var labelSizeShort = Coords.fromXY(containerShipSize.x / 2, fontHeightShort);
        var world = uwpe.world;
        var defn = this.defn(world);
        var childControls = [
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, marginSize.y), // pos
            labelSizeWide, DataBinding.fromContext(defn.factionName), fontShort),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, marginSize.y * 2 + labelSizeShort.y), // pos
            labelSizeShort, DataBinding.fromContext("Crew:"), fontShort),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x / 2 + labelSizeShort.x, marginSize.y * 2 + labelSizeShort.y), // pos
            labelSizeShort, DataBinding.fromContextAndGet(ship, (c) => c.crewCurrentOverMax(uwpe)), fontShort),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x, marginSize.y * 3 + labelSizeShort.y * 2), // pos
            labelSizeShort, DataBinding.fromContext("Energy:"), fontShort),
            ControlLabel.from4Uncentered(Coords.fromXY(marginSize.x / 2 + labelSizeShort.x, marginSize.y * 3 + labelSizeShort.y * 2), // pos
            labelSizeShort, DataBinding.fromContextAndGet(ship, (c) => c.energyCurrentOverMax(uwpe)), fontShort),
        ];
        var returnValue = ControlContainer.from4("containerShip", Coords.fromXY(marginSize.x, marginSize.y + (containerShipSize.y + marginSize.y) * indexTopOrBottom), containerShipSize, childControls);
        return returnValue;
    }
    // Equatable.
    equals(other) { return false; }
}
// temporary variables
Ship._polar = Polar.create();
