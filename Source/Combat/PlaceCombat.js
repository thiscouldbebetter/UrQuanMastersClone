"use strict";
class PlaceCombat extends Place {
    constructor(worldAsWorld, combat) {
        super(PlaceCombat.name, PlaceCombat.name, null, // parentName
        combat.size, null // entities
        );
        var world = worldAsWorld;
        this.combat = combat;
        this.size = this.combat.size;
        var actionExit = new Action("Exit", (uwpe) => {
            var world = uwpe.world;
            var place = uwpe.place;
            var encounter = place.combat.encounter;
            encounter.returnToPlace(world);
        });
        this.actions =
            [
                Ship.actionShowMenu(),
                Ship.actionAccelerate(),
                Ship.actionTurnLeft(),
                Ship.actionTurnRight(),
                Ship.actionFire(),
                Ship.actionSpecial(),
                actionExit,
            ]; //.addLookupsByName();
        this._actionToInputsMappings = Ship.actionToInputsMappings();
        this._actionToInputsMappings = this._actionToInputsMappings.concat([
            new ActionToInputsMapping("Fire", ["Enter", "Gamepad0Button0"], true),
            new ActionToInputsMapping("Special", ["_", "Gamepad0Button1"], true),
            new ActionToInputsMapping("Exit", ["Escape", "Gamepad0Button2"], true),
        ]);
        //this._actionToInputsMappings.addLookups(function (x) { return x.inputNames; } );
        // camera
        this._camera = new Camera(Coords.fromXY(300, 300), // hack
        null, // focalLength
        Disposition.fromOrientation(Orientation.Instances().ForwardZDownY.clone()), null // entitiesInViewSort
        );
        var cameraAsEntity = CameraHelper.toEntity(this._camera);
        this.entitySpawn(new UniverseWorldPlaceEntities(null, world, null, cameraAsEntity, null));
        // entities
        var entityDimension = 10;
        var entities = this.entities;
        // planet
        var sizeHalf = this.size.clone().half();
        var planetRadius = entityDimension;
        var planetPos = sizeHalf.clone();
        var planetColor = Color.byName("Cyan");
        var planetVisual = new VisualWrapped(this.size, VisualCircle.fromRadiusAndColorFill(planetRadius, planetColor));
        var planetCollider = new Sphere(Coords.create(), planetRadius);
        var planetCollide = (uwpe) => {
            var entityPlanet = uwpe.entity;
            var entityOther = uwpe.entity2;
            var planetPos = entityPlanet.locatable().loc.pos;
            var otherLoc = entityOther.locatable().loc;
            var otherPos = otherLoc.pos;
            var displacement = otherPos.clone().subtract(planetPos);
            var distance = displacement.magnitude();
            var direction = displacement.divideScalar(distance);
            var planetCollider = entityPlanet.collidable().collider;
            var planetRadius = planetCollider.radius;
            var otherCollider = entityOther.collidable().collider;
            var sumOfRadii = planetRadius + otherCollider.radius;
            if (distance < sumOfRadii) {
                var impulse = direction.multiplyScalar(sumOfRadii - distance);
                otherLoc.vel.add(impulse.double());
            }
        };
        var planetActivityGravitatePerform = (uwpe) => {
            var place = uwpe.place;
            var actor = uwpe.entity;
            var planet = actor;
            var planetPos = planet.locatable().loc.pos;
            var combat = place.combat;
            var combatSize = combat.size;
            var entitiesShips = place.entitiesShips();
            for (var i = 0; i < entitiesShips.length; i++) {
                var ship = entitiesShips[i];
                var shipLoc = ship.locatable().loc;
                var shipPos = shipLoc.pos;
                var displacement = shipPos.clone().subtractWrappedToRangeMax(planetPos, combatSize);
                var distance = displacement.magnitude();
                if (distance > 0) {
                    var direction = displacement.divideScalar(distance);
                    var graviticConstant = -100;
                    var accelerationMagnitude = graviticConstant / (distance * distance);
                    var accelToAdd = direction.multiplyScalar(accelerationMagnitude);
                    shipLoc.accel.add(accelToAdd);
                }
            }
        };
        var planetActivityDefnGravitate = new ActivityDefn("Gravitate", planetActivityGravitatePerform);
        var planetActivityGravitate = new Activity(planetActivityDefnGravitate.name, null);
        var planetEntity = new Entity("Planet", [
            Locatable.fromPos(planetPos),
            new Collidable(null, // ticks
            planetCollider, [Collidable.name], // entityPropertyNamesToCollideWith
            planetCollide),
            Drawable.fromVisual(planetVisual),
            new Actor(planetActivityGravitate),
        ]);
        entities.push(planetEntity);
        var shipsFighting = this.combat.shipsFighting;
        var shipCollide = (uwpe) => {
            // todo
        };
        var constraintWrapToRange = new Constraint_WrapToPlaceSize();
        for (var i = 0; i < shipsFighting.length; i++) {
            var ship = shipsFighting[i];
            var shipPos = Coords.fromXY(.1 * (i == 0 ? -1 : 1), 0).multiply(this.size).add(planetPos);
            var shipLoc = Disposition.fromPos(shipPos);
            var shipCollider = new Sphere(Coords.zeroes(), entityDimension / 2);
            var shipDefn = ship.defn(world);
            var shipVisualBody = shipDefn.visual;
            var shipVisual = new VisualWrapped(this.size, shipVisualBody);
            var shipEntityProperties = new Array(ship, new Locatable(shipLoc), new Constrainable([constraintWrapToRange]), new Collidable(null, // ticks
            shipCollider, [Collidable.name], // entityPropertyNamesToCollideWith
            shipCollide), Drawable.fromVisual(shipVisual), ItemHolder.create(), new Killable(ship.crew, null, this.shipDie));
            if (i == 0) {
                shipEntityProperties.push(new Playable());
            }
            else {
                var activity = new Activity(this.combat.enemyActivityDefn().name, null);
                var actor = new Actor(activity);
                shipEntityProperties.push(actor);
            }
            var shipEntity = new Entity("Ship" + i, shipEntityProperties);
            entities.push(shipEntity);
        }
        // controls
        var containerSidebarSize = Coords.fromXY(100, 300); // hack
        var containerSidebar = ControlContainer.from4("containerSidebar", Coords.fromXY(300, 0), containerSidebarSize, [
            shipsFighting[0].toControlSidebar(containerSidebarSize, 0, world),
            shipsFighting[1].toControlSidebar(containerSidebarSize, 1, world),
        ]);
        this.venueControls = VenueControls.fromControl(containerSidebar);
        //this.propertyNamesToProcess.push(Ship.name);
        this.entitiesByName = ArrayHelper.addLookupsByName(this.entities);
    }
    // methods
    actionToInputsMappings() {
        return this._actionToInputsMappings;
    }
    roundOver(uwpe) {
        var universe = uwpe.universe;
        var place = uwpe.place;
        var combat = place.combat;
        var shipGroups = combat.shipGroups;
        if (shipGroups[0].ships.length == 0) {
            throw "todo"; // Game over.
        }
        else if (shipGroups[1].ships.length > 0) {
            var controlShipSelect = combat.toControlShipSelect(universe, universe.display.sizeInPixels);
            var venueNext = VenueControls.fromControl(controlShipSelect);
            universe.venueNext = venueNext;
        }
        else {
            var controlCombatDebriefing = combat.toControlDebriefing(universe, universe.display.sizeInPixels);
            var venueNext = VenueControls.fromControl(controlCombatDebriefing);
            universe.venueNext = venueNext;
        }
    }
    shipDie(uwpe) {
        var place = uwpe.place;
        var entityShipToDie = uwpe.entity;
        var ship = EntityExtensions.ship(entityShipToDie);
        var combat = place.combat;
        ArrayHelper.remove(combat.shipsFighting, ship);
        var shipGroups = combat.shipGroups;
        for (var g = 0; g < shipGroups.length; g++) {
            var shipGroup = shipGroups[g];
            if (ArrayHelper.contains(shipGroup.ships, ship)) {
                ArrayHelper.remove(shipGroup.ships, ship);
            }
        }
        var visualToRecycle = entityShipToDie.drawable().visual;
        visualToRecycle.child =
            VisualCircle.fromRadiusAndColorFill(32, Color.byName("Red"));
        entityShipToDie.locatable().loc.vel.clear();
        var entityExplosion = new Entity("Explosion", [
            new Ephemeral(64, this.roundOver),
            Drawable.fromVisual(visualToRecycle),
            entityShipToDie.locatable(),
        ]);
        place.entitiesToSpawn.push(entityExplosion);
    }
    entitiesShips() {
        return this.entitiesByPropertyName("ship");
    }
    // Place overrides
    draw(universe, world) {
        var display = universe.display;
        display.drawBackground(Color.byName("Gray"), Color.byName("Black"));
        var ships = this.entitiesShips();
        var camera = this._camera;
        var cameraPos = camera.loc.pos;
        var midpointBetweenCombatants;
        if (ships.length == 1) {
            midpointBetweenCombatants = ships[0].locatable().loc.pos;
        }
        else // if ships.length == 2
         {
            midpointBetweenCombatants =
                this.combat.midpointOfPointsWrappedToRange(cameraPos, // midpointToOverwrite
                ships[0].locatable().loc.pos, ships[1].locatable().loc.pos, this.size);
        }
        cameraPos.overwriteWith(midpointBetweenCombatants);
        super.draw(universe, world, display);
        this.venueControls.draw(universe);
    }
    updateForTimerTick(uwpe) {
        super.updateForTimerTick(uwpe);
    }
}
