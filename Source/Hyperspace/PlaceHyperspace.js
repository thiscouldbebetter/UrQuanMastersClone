"use strict";
class PlaceHyperspace extends PlaceBase {
    constructor(universe, hyperspace, starsystemDeparted, playerLoc) {
        super(PlaceHyperspace.name, PlaceHyperspace.name, null, // parentName
        hyperspace.size, null);
        this.hyperspace = hyperspace;
        // entities
        var entities = this.entitiesToSpawn;
        entities.push(new GameClock(2880).toEntity());
        var entityDimension = hyperspace.starsystemRadiusOuter;
        // camera
        this._camera = new Camera(Coords.fromXY(300, 300), // hack
        null, // focalLength
        Disposition.fromOrientation(Orientation.Instances().ForwardZDownY.clone()), null // entitiesInViewSort
        );
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
        var starSizeCount = 3; // Normal, giant, supergiant.
        for (var i = 0; i < starColors.length; i++) {
            var starColor = starColors[i];
            var starVisualsForSizes = [];
            for (var j = 0; j < starSizeCount; j++) {
                var starVisualPathForSize = starVisualPathsForSizes[j];
                var starVisual = new VisualPolygon(starVisualPathForSize, starColor, null, false // shouldUseEntityOrientation
                );
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
                Collidable.fromCollider(starCollider),
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
                var factionCollidable = Collidable.fromCollider(factionCollider);
                var factionBoundable = Boundable.fromCollidable(factionCollidable);
                if (factionCollider != null) {
                    var factionEntity = new Entity("Faction" + faction.name, [
                        factionBoundable,
                        factionCollidable,
                        faction,
                        Locatable.create()
                    ]);
                    entities.push(factionEntity);
                }
            }
        }
        // shipGroups
        var shipGroups = this.hyperspace.shipGroups;
        for (var i = 0; i < shipGroups.length; i++) {
            var shipGroup = shipGroups[i];
            var entityShipGroup = shipGroup.toEntitySpace(world, this);
            entities.push(entityShipGroup);
        }
        if (playerLoc != null) {
            // player
            var playerActor = new Actor(new Activity(Player.activityDefn().name, null));
            var playerCollider = new Sphere(Coords.create(), entityDimension / 2);
            var playerCollidable = new Collidable(false, // canCollideAgainWithoutSeparating
            null, // ticks
            playerCollider, [Collidable.name], // entityPropertyNamesToCollideWith
            this.playerCollide);
            var playerBoundable = Boundable.fromCollidable(playerCollidable);
            var playerShipGroup = world.player.shipGroup;
            var playerShip = playerShipGroup.ships[0];
            /*
            var playerColor = Color.Instances().Gray;
            var playerVisualBody = ShipDefn.visual(entityDimension, playerColor, null);
            var playerVisual = new VisualGroup
            ([
                playerVisualBody,
            ]);
            */
            var playerShipDefn = playerShip.defn(world);
            var playerVisual = playerShipDefn.visual;
            var playerDrawable = Drawable.fromVisual(playerVisual);
            var constraintFriction = new Constraint_FrictionDry(0.01);
            var constraintTrimToRange = new Constraint_TrimToPlaceSize();
            var playerConstrainable = new Constrainable([
                constraintFriction,
                constraintTrimToRange
            ]);
            var playerFuelable = new Fuelable();
            var playerItemHolder = ItemHolder.create();
            var playerLocatable = new Locatable(playerLoc);
            var playerMovable = Movable.default();
            var playerPlayable = new Playable();
            var playerEntity = new Entity(Player.name, [
                playerActor,
                playerBoundable,
                playerCollidable,
                playerConstrainable,
                playerDrawable,
                playerFuelable,
                playerItemHolder,
                playerLocatable,
                playerMovable,
                playerPlayable,
                playerShipGroup,
                playerShip
            ]);
            if (starsystemDeparted != null) {
                var entities = this.entitiesToSpawn; // hack
                var entityForStarsystemDeparted = entities.find(x => Starsystem.fromEntity(x) == starsystemDeparted);
                playerEntity.collidable().entityAlreadyCollidedWithAddIfNotPresent(entityForStarsystemDeparted);
            }
            entities.push(playerEntity);
        }
        // CollisionTracker.
        var collisionTracker = new CollisionTrackerMapped(this.hyperspace.size, Coords.fromXY(1, 1).multiplyScalar(64));
        var entityForCollisionTracker = collisionTracker.toEntity();
        entities.splice(0, 0, entityForCollisionTracker); // hack - Must come before stationary entities.
        var containerSidebar = this.toControlSidebar(universe);
        this.venueControls = VenueControls.fromControl(containerSidebar);
        // Helper variables.
        this._drawLoc = Disposition.create();
        this._polar = Polar.create();
    }
    static actionMapView() {
        return new Action("MapView", (uwpe) => {
            var world = uwpe.world;
            var place = uwpe.place;
            var placeNext = new PlaceHyperspaceMap(place);
            world.placeNextSet(placeNext);
        });
    }
    // methods
    entitiesShips() {
        return this.entitiesByPropertyName(Ship.name);
    }
    entitiesShipGroups() {
        return this.entitiesByPropertyName(ShipGroup.name);
    }
    factionShipGroupSpawnIfNeeded(universe, world, placeAsPlace, entityPlayer, entityOther) {
        var place = placeAsPlace;
        var faction = Faction.fromEntity(entityOther);
        var factionName = faction.name;
        var numberOfShipGroupsExistingForFaction = 0;
        var entitiesShipGroupsAll = place.entitiesShipGroups();
        for (var i = 0; i < entitiesShipGroupsAll.length; i++) {
            var entityShipGroup = entitiesShipGroupsAll[i];
            var shipGroup = ShipGroup.fromEntity(entityShipGroup);
            if (shipGroup.factionName == factionName) {
                numberOfShipGroupsExistingForFaction++;
            }
        }
        var shipGroupsPerFaction = 1; // todo
        if (numberOfShipGroupsExistingForFaction < shipGroupsPerFaction) {
            var factionSphereOfInfluence = faction.sphereOfInfluence;
            var shipGroupPos = factionSphereOfInfluence.pointRandom(universe.randomizer).clearZ();
            var shipDefnName = faction.shipDefnName; // todo
            var factionName = faction.name;
            var shipGroup = new ShipGroup(factionName + " Ship Group", factionName, shipGroupPos, [new Ship(shipDefnName)]);
            var entityShipGroup = shipGroup.toEntitySpace(world, place);
            place.hyperspace.shipGroups.push(shipGroup);
            place.entityToSpawnAdd(entityShipGroup);
        }
    }
    playerCollide(uwpe, collision) {
        var universe = uwpe.universe;
        var world = uwpe.world;
        var place = uwpe.place;
        if (uwpe.entity2.name == Player.name) {
            uwpe.entitiesSwap();
        }
        var entityPlayer = uwpe.entity;
        var entityOther = uwpe.entity2;
        var entityOtherStarsystem = Starsystem.fromEntity(entityOther);
        var entityOtherShipGroup = ShipGroup.fromEntity(entityOther);
        var entityOtherFaction = Faction.fromEntity(entityOther);
        if (entityOtherStarsystem != null) {
            var starsystem = entityOtherStarsystem;
            var playerLoc = entityPlayer.locatable().loc;
            var playerOrientation = playerLoc.orientation;
            var playerPosNextAsPolar = Polar.create().fromCoords(playerOrientation.forward).addToAzimuthInTurns(.5).wrap();
            playerPosNextAsPolar.radius = starsystem.sizeInner.x * .45;
            var playerPosNext = playerPosNextAsPolar.toCoords(Coords.create()).add(starsystem.sizeInner.clone().half());
            var placeNext = starsystem.toPlace(world, Disposition.fromPosAndOrientation(playerPosNext, playerOrientation.clone()), null // planet
            );
            world.placeNextSet(placeNext);
        }
        else if (entityOtherShipGroup != null) {
            var shipGroupOther = entityOtherShipGroup;
            var playerPos = entityPlayer.locatable().loc.pos;
            var starsystemClosest = place.hyperspace.starsystemClosestTo(playerPos);
            var planetClosest = starsystemClosest.planetRandom(universe);
            var encounter = new Encounter(planetClosest, shipGroupOther.factionName, entityPlayer, entityOther, place, playerPos);
            var placeEncounter = encounter.toPlace();
            world.placeNextSet(placeEncounter);
            place.entityToRemoveAdd(entityOther);
            ArrayHelper.remove(place.hyperspace.shipGroups, shipGroupOther);
        }
        else if (entityOtherFaction != null) {
            place.factionShipGroupSpawnIfNeeded(universe, world, place, entityPlayer, entityOther);
        }
    }
    // controls
    toControlSidebar(universe) {
        var world = universe.world;
        var containerSidebar = ControlContainer.from4("containerSidebar", Coords.fromXY(300, 0), Coords.fromXY(100, 300), [world.player.toControlSidebar(world)]);
        var marginWidth = 8;
        var size = Coords.fromXY(1, 1).multiplyScalar(containerSidebar.size.x - marginWidth * 2);
        var display = universe.display;
        this.displaySensors = new Display2D([size], display.fontNameAndHeight, Color.Instances().Yellow, Color.Instances().GreenDark, true // isInvisible
        );
        var imageSensors = this.displaySensors.initialize(null).toImage("Sensors");
        var controlVisualSensors = ControlVisual.from4("controlVisualSensors", Coords.fromXY(8, 152), // pos
        size, DataBinding.fromContext(new VisualImageImmediate(imageSensors, null)));
        containerSidebar.children.push(controlVisualSensors);
        return containerSidebar;
    }
    // Place overrides
    draw(universe, world) {
        var display = universe.display;
        var colors = Color.Instances();
        display.drawBackground(colors.Gray, colors.Black);
        var player = this.entityByName(Player.name);
        var playerLoc = player.locatable().loc;
        var camera = this._camera;
        camera.loc.pos.overwriteWith(playerLoc.pos).trimToRangeMinMax(camera.viewSizeHalf, this.size().clone().subtract(camera.viewSizeHalf));
        super.draw(universe, world, display);
        this.draw_Sensors();
        this.venueControls.draw(universe);
    }
    draw_Sensors() {
        this.displaySensors.clear();
        this.displaySensors.drawBackground(null, null);
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
        var shipSizeHalf = shipSize.clone().half();
        var shipColor = starColor;
        for (var i = 0; i < ships.length; i++) {
            var ship = ships[i];
            drawPos.overwriteWith(ship.pos).subtract(cameraPos).divide(sensorRange).multiply(controlSize).add(controlSizeHalf).subtract(shipSizeHalf);
            this.displaySensors.drawRectangle(drawPos, shipSize, shipColor, null);
        }
        var drawPos = controlSizeHalf;
        this.displaySensors.drawCrosshairs(drawPos, // center
        4, // numberOfLines
        starRadius * 4, // radiusOuter
        null, // radiusInner
        shipColor, null // lineThickness
        );
    }
}
