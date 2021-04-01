"use strict";
class PlaceHyperspace extends Place {
    constructor(universe, hyperspace, starsystemDeparted, playerLoc) {
        super(PlaceHyperspace.name, PlaceHyperspace.name, hyperspace.size, new Array());
        this.hyperspace = hyperspace;
        var actionMapView = new Action("MapView", (universe, world, place, actor) => {
            world.placeNext = new PlaceHyperspaceMap(place);
        });
        this.actions =
            [
                Ship.actionShowMenu(),
                Ship.actionAccelerate(),
                Ship.actionTurnLeft(),
                Ship.actionTurnRight(),
                actionMapView
            ];
        this._actionToInputsMappings = Ship.actionToInputsMappings();
        this._actionToInputsMappings = this._actionToInputsMappings.concat([
            new ActionToInputsMapping("MapView", ["Tab", "Gamepad0Button0"], null),
        ]);
        this._actionToInputsMappingsByInputName = ArrayHelper.addLookupsMultiple(this._actionToInputsMappings, x => x.inputNames);
        // entities
        var entities = this.entitiesToSpawn;
        var entityDimension = hyperspace.starsystemRadiusOuter;
        // camera
        this._camera = new Camera(Coords.fromXY(300, 300), // hack
        null, // focalLength
        new Disposition(Coords.create(), Orientation.Instances().ForwardZDownY.clone(), null));
        var cameraAsEntity = CameraHelper.toEntity(this._camera);
        entities.push(cameraAsEntity);
        // stars
        var starsystems = this.hyperspace.starsystems;
        var numberOfStars = starsystems.length;
        var starRadius = entityDimension / 2;
        var starSize = new Coords(1, 1, 1).multiplyScalar(starRadius);
        var transformRotate = new Transform_Rotate2D(.75);
        var starVisualPathsForSizes = [];
        for (var j = 0; j < 3; j++) {
            var transformScale = new Transform_Scale(new Coords(1, 1, 1).multiplyScalar(starRadius * (j / 2 + 1)));
            var starVisualPath = new PathBuilder().star(5, .5).transform(transformScale).transform(transformRotate);
            starVisualPathsForSizes.push(starVisualPath);
        }
        var starColors = Starsystem.StarColors;
        var starVisualsForSizesByColorName = new Map();
        for (var i = 0; i < starColors.length; i++) {
            var starColor = starColors[i];
            var starVisualsForSizes = [];
            for (var j = 0; j < 3; j++) {
                var starVisualPathForSize = starVisualPathsForSizes[j];
                var starVisual = new VisualPolygon(starVisualPathForSize, starColor, null);
                starVisualsForSizes.push(starVisual);
            }
            starVisualsForSizesByColorName.set(starColor.name, starVisualsForSizes);
        }
        for (var i = 0; i < numberOfStars; i++) {
            var starsystem = starsystems[i];
            var starPos = starsystem.posInHyperspace;
            var starCollider = new Sphere(Coords.create(), starRadius);
            var starColor = starsystem.starColor;
            var starSizeIndex = starsystem.starSizeIndex;
            var starVisual = starVisualsForSizesByColorName.get(starColor.name)[starSizeIndex];
            var starEntity = new Entity(starsystem.name, [
                new Boundable(Box.fromSize(starSize)),
                CollidableHelper.fromCollider(starCollider),
                Drawable.fromVisual(starVisual),
                new Locatable(Disposition.fromPos(starPos)),
                starsystem
            ]);
            entities.push(starEntity);
        }
        // factions
        var world = universe.world;
        var worldDefn = world.defnExtended();
        var factions = worldDefn.factions;
        for (var i = 0; i < factions.length; i++) {
            var faction = factions[i];
            var factionCollider = faction.sphereOfInfluence;
            if (factionCollider != null) {
                var factionEntity = new Entity("Faction" + faction.name, [
                    CollidableHelper.fromCollider(factionCollider),
                    faction,
                    Locatable.create()
                ]);
                entities.push(factionEntity);
            }
        }
        // shipGroups
        var shipGroups = this.hyperspace.shipGroups;
        for (var i = 0; i < shipGroups.length; i++) {
            var shipGroup = shipGroups[i];
            var entityShipGroup = this.shipGroupToEntity(world, this, shipGroup);
            entities.push(entityShipGroup);
        }
        // player
        var playerCollider = new Sphere(Coords.create(), entityDimension / 2);
        var playerColor = Color.byName("Gray");
        var playerVisualBody = ShipDefn.visual(entityDimension, playerColor, null);
        var playerVisual = new VisualGroup([
            playerVisualBody,
        ]);
        var playerShipGroup = world.player.shipGroup;
        var playerShip = playerShipGroup.ships[0];
        //var constraintSpeedMax = new Constraint("SpeedMax", playerShipDefn.speedMax * 5);
        var constraintFriction = new Constraint_FrictionDry(0.01);
        //var constraintStopBelowSpeedMin = new Constraint("StopBelowSpeedMin", 0.015);
        var constraintTrimToRange = new Constraint_TrimToRange(this.size);
        var playerEntity = new Entity(Player.name, [
            new Actor(new Activity(Player.activityDefn().name, null)),
            new Collidable(null, // ticks
            playerCollider, [Collidable.name], // entityPropertyNamesToCollideWith
            this.playerCollide),
            new Constrainable([
                //constraintSpeedMax,
                constraintFriction,
                //constraintStopBelowSpeedMin,
                constraintTrimToRange
            ]),
            Drawable.fromVisual(playerVisual),
            new Fuelable(),
            ItemHolder.create(),
            new Locatable(playerLoc),
            Movable.create(),
            new Playable(),
            playerShipGroup,
            playerShip
        ]);
        if (starsystemDeparted != null) {
            var starsystemName = starsystemDeparted.name;
            var entityForStarsystemDeparted = this.entitiesByName.get(starsystemName);
            playerEntity.collidable().entitiesAlreadyCollidedWith.push(entityForStarsystemDeparted);
        }
        entities.push(playerEntity);
        // CollisionTracker.
        var collisionTracker = new CollisionTracker(this.hyperspace.size, Coords.fromXY(1, 1).multiplyScalar(64));
        var entityForCollisionTracker = collisionTracker.toEntity();
        entities.push(entityForCollisionTracker);
        var containerSidebar = this.toControlSidebar(universe);
        this.venueControls = VenueControls.fromControl(containerSidebar);
        // Helper variables.
        this._drawLoc = Disposition.create();
        this._polar = Polar.create();
    }
    // methods
    actionToInputsMappings() {
        return this._actionToInputsMappings;
    }
    entitiesShips() {
        return this.entitiesByPropertyName(Ship.name);
    }
    entitiesShipGroups() {
        return this.entitiesByPropertyName(ShipGroup.name);
    }
    factionShipGroupSpawnIfNeeded(universe, world, placeAsPlace, entityPlayer, entityOther) {
        var place = placeAsPlace;
        var faction = EntityExtensions.faction(entityOther);
        var factionName = faction.name;
        var numberOfShipGroupsExistingForFaction = 0;
        var entitiesShipGroupsAll = place.entitiesShipGroups();
        for (var i = 0; i < entitiesShipGroupsAll.length; i++) {
            var entityShipGroup = entitiesShipGroupsAll[i];
            var shipGroup = EntityExtensions.shipGroup(entityShipGroup);
            if (shipGroup.factionName == factionName) {
                numberOfShipGroupsExistingForFaction++;
            }
        }
        var shipGroupsPerFaction = 1; // todo
        if (numberOfShipGroupsExistingForFaction < shipGroupsPerFaction) {
            var factionSphereOfInfluence = faction.sphereOfInfluence;
            var shipGroupPos = factionSphereOfInfluence.pointRandom().clearZ();
            var shipDefnName = faction.shipDefnName; // todo
            var factionName = faction.name;
            var shipGroup = new ShipGroup(factionName + " Ship Group", factionName, shipGroupPos, [new Ship(shipDefnName)]);
            var entityShipGroup = place.shipGroupToEntity(world, place, shipGroup);
            place.hyperspace.shipGroups.push(shipGroup);
            place.entitiesToSpawn.push(entityShipGroup);
        }
    }
    playerCollide(universe, worldAsWorld, placeAsPlace, entityPlayer, entityOther) {
        var world = worldAsWorld;
        var place = placeAsPlace;
        var entityOtherStarsystem = EntityExtensions.starsystem(entityOther);
        var entityOtherShipGroup = EntityExtensions.shipGroup(entityOther);
        var entityOtherFaction = EntityExtensions.faction(entityOther);
        if (entityOtherStarsystem != null) {
            var starsystem = entityOtherStarsystem;
            var playerLoc = entityPlayer.locatable().loc;
            var playerOrientation = playerLoc.orientation;
            var playerPosNextAsPolar = Polar.create().fromCoords(playerOrientation.forward).addToAzimuthInTurns(.5).wrap();
            playerPosNextAsPolar.radius = starsystem.sizeInner.x * .45;
            var playerPosNext = playerPosNextAsPolar.toCoords(Coords.create()).add(starsystem.sizeInner.clone().half());
            world.placeNext = new PlaceStarsystem(world, starsystem, new Disposition(playerPosNext, playerOrientation.clone(), null), null);
        }
        else if (entityOtherShipGroup != null) {
            var shipGroupOther = entityOtherShipGroup;
            var playerPos = entityPlayer.locatable().loc.pos;
            var starsystemClosest = place.hyperspace.starsystemClosestTo(playerPos);
            var planetClosest = ArrayHelper.random(starsystemClosest.planets, universe.randomizer);
            var encounter = new Encounter(planetClosest, shipGroupOther.factionName, entityOther, place, playerPos);
            var placeEncounter = new PlaceEncounter(world, encounter);
            world.placeNext = placeEncounter;
            place.entitiesToRemove.push(entityOther);
            ArrayHelper.remove(place.hyperspace.shipGroups, shipGroupOther);
        }
        else if (entityOtherFaction != null) {
            place.factionShipGroupSpawnIfNeeded(universe, world, place, entityPlayer, entityOther);
        }
    }
    shipGroupToEntity(worldAsWorld, place, shipGroup) {
        var world = worldAsWorld;
        var ship0 = shipGroup.ships[0];
        var shipGroupPos = shipGroup.pos;
        var entityShipGroup = new Entity(shipGroup.name + Math.random(), [
            new Actor(new Activity(ShipGroup.activityDefnApproachPlayer().name, null)),
            //faction,
            CollidableHelper.fromCollider(new Sphere(Coords.create(), 5)),
            Drawable.fromVisual(ship0.defn(world).visual),
            Locatable.fromPos(shipGroupPos),
            shipGroup,
            ship0
        ]);
        return entityShipGroup;
    }
    // controls
    toControlSidebar(universe) {
        var world = universe.world;
        var containerSidebar = ControlContainer.from4("containerSidebar", Coords.fromXY(300, 0), Coords.fromXY(100, 300), [world.player.toControlSidebar(world)]);
        var marginWidth = 8;
        var size = Coords.fromXY(1, 1).multiplyScalar(containerSidebar.size.x - marginWidth * 2);
        var display = universe.display;
        this.displaySensors = new Display2D([size], display.fontName, display.fontHeightInPixels, Color.byName("Yellow"), Color.byName("GreenDark"), null);
        var imageSensors = this.displaySensors.initialize(null).toImage();
        var controlVisualSensors = ControlVisual.from4("controlVisualSensors", Coords.fromXY(8, 152), // pos
        size, DataBinding.fromContext(new VisualImageImmediate(imageSensors, null)));
        containerSidebar.children.push(controlVisualSensors);
        return containerSidebar;
    }
    // Place overrides
    draw(universe, world) {
        var display = universe.display;
        display.drawBackground(Color.byName("Gray"), Color.byName("Black"));
        var player = this.entitiesByName.get(Player.name);
        var playerLoc = player.locatable().loc;
        var camera = this._camera;
        camera.loc.pos.overwriteWith(playerLoc.pos).trimToRangeMinMax(camera.viewSizeHalf, this.size.clone().subtract(camera.viewSizeHalf));
        super.draw(universe, world, display);
        this.draw_Sensors();
        this.venueControls.draw(universe);
    }
    draw_Sensors() {
        this.displaySensors.clear();
        var sensorRange = this._camera.viewSize.clone().double();
        var controlSize = this.displaySensors.sizeInPixels;
        var controlSizeHalf = controlSize.clone().half();
        var cameraPos = this._camera.loc.pos;
        var drawPos = Coords.create();
        var stars = this.hyperspace.starsystems;
        var starRadius = 2.5;
        var starColor = this.displaySensors.colorFore;
        for (var i = 0; i < stars.length; i++) {
            var star = stars[i];
            drawPos.overwriteWith(star.posInHyperspace).subtract(cameraPos).divide(sensorRange).multiply(controlSize).add(controlSizeHalf);
            this.displaySensors.drawCircle(drawPos, starRadius, starColor, null, null);
        }
        var ships = this.hyperspace.shipGroups;
        var shipSize = Coords.fromXY(1, 1).multiplyScalar(2 * starRadius);
        var shipColor = starColor;
        for (var i = 0; i < ships.length; i++) {
            var ship = ships[i];
            drawPos.overwriteWith(ship.pos).subtract(cameraPos).divide(sensorRange).multiply(controlSize).add(controlSizeHalf);
            this.displaySensors.drawRectangle(drawPos, shipSize, shipColor, null, null);
        }
        var drawPos = controlSizeHalf;
        this.displaySensors.drawCrosshairs(drawPos, starRadius * 4, shipColor);
    }
}
