"use strict";
class PlacePlanetVicinity extends PlaceBase {
    constructor(world, planet, playerLoc, placeStarsystem) {
        super(PlacePlanetVicinity.name + ":" + planet.name, PlacePlanetVicinity.name, // defnName
        null, // parentName
        Coords.fromXY(1, 1).multiplyScalar(300), null // entities
        );
        this.planet = planet;
        this.placeStarsystem = placeStarsystem;
        this.actions =
            [
                Ship.actionShowMenu(),
                Ship.actionAccelerate(),
                Ship.actionTurnLeft(),
                Ship.actionTurnRight(),
            ];
        this._actionToInputsMappings = Ship.actionToInputsMappings();
        // entities
        var entities = this.entitiesToSpawn;
        entities.push(new GameClock(2880).toEntity());
        var entityDimension = 10;
        // planet
        var sizeHalf = this.size().clone().half();
        var planetRadius = entityDimension;
        var planetPos = sizeHalf.clone();
        var orbitMultiplier = 16;
        var planetOrbitRadius = planet.posAsPolar.radius * orbitMultiplier;
        var planetOrbitColor = planet.orbitColor();
        var planetOrbitVisual = new VisualAnchor(new VisualCircle(planetOrbitRadius, null, planetOrbitColor, null), planetPos.clone().add(new Polar(planet.posAsPolar.azimuthInTurns + .5, planetOrbitRadius, null).wrap().toCoords(Coords.create())), // posToAnchorAt
        null // ?
        );
        var planetDefn = planet.defn();
        var planetGlobeVisual = planetDefn.visualVicinity;
        var planetVisual = new VisualGroup([
            planetOrbitVisual,
            planetGlobeVisual,
        ]);
        var planetCollider = new Sphere(Coords.create(), planetRadius);
        var planetEntity = new Entity("Planet", [
            Collidable.fromCollider(planetCollider),
            Drawable.fromVisual(planetVisual),
            Locatable.fromPos(planetPos),
            planet
        ]);
        entities.push(planetEntity);
        // satellites
        var satellites = planet.satellitesGet();
        for (var i = 0; i < satellites.length; i++) {
            var satellite = satellites[i];
            var satelliteEntity = satellite.toEntity(world, planet, planetPos);
            entities.push(satelliteEntity);
        }
        var constraintSpeedMax = new Constraint_SpeedMaxXY(1);
        if (playerLoc != null) {
            // player - Can this be merged with similar code in PlaceStarsystem?
            var playerActivityDefnName = Player.activityDefn().name;
            var playerActivity = new Activity(playerActivityDefnName, null);
            var playerActor = new Actor(playerActivity);
            var playerCollider = new Sphere(Coords.create(), entityDimension / 2);
            var playerCollidable = new Collidable(false, // canCollideAgainWithoutSeparating
            null, // ticks
            playerCollider, [Collidable.name], // entityPropertyNamesToCollideWith
            this.playerCollide);
            var playerConstrainable = new Constrainable([constraintSpeedMax]);
            var playerItemHolder = ItemHolder.create();
            var playerLocatable = new Locatable(playerLoc);
            var playerMovable = Movable.default();
            var playerPlayable = new Playable();
            var playerShipGroup = world.player.shipGroup;
            var playerShip = playerShipGroup.ships[0];
            var playerShipDefn = playerShip.defn(world);
            var playerVisual = playerShipDefn.visual;
            var playerDrawable = Drawable.fromVisual(playerVisual);
            var playerEntity = new Entity(Player.name, [
                playerActor,
                playerCollidable,
                playerConstrainable,
                playerDrawable,
                playerItemHolder,
                playerLocatable,
                playerMovable,
                playerPlayable,
                playerShip,
                playerShipGroup
            ]);
            //playerEntity.collidable.ticksUntilCanCollide = 100; // hack
            entities.push(playerEntity);
        }
        var entitiesForShipGroups = this.planet.shipGroups().map(x => x.toEntity(world, this));
        entities.push(...entitiesForShipGroups);
        this._camera = new Camera(Coords.fromXY(300, 300), // hack
        null, // focalLength
        Disposition.fromOrientation(Orientation.Instances().ForwardZDownY.clone()), null // entitiesInViewSort
        );
        var cameraAsEntity = CameraHelper.toEntity(this._camera);
        entities.push(cameraAsEntity);
        var wallsEntity = new Entity("Walls", [
            new Locatable(Disposition.fromPos(this.size().clone().half())),
            Collidable.fromCollider(new ShapeInverse(new Box(Coords.create(), this.size())))
        ]);
        entities.push(wallsEntity);
        var containerSidebar = ControlContainer.from4("containerSidebar", Coords.fromXY(300, 0), // todo
        Coords.fromXY(100, 300), // size
        [world.player.toControlSidebar(world)]);
        this.venueControls = VenueControls.fromControl(containerSidebar);
    }
    // methods
    actionToInputsMappings() {
        return this._actionToInputsMappings;
    }
    draw(universe, world) {
        var display = universe.display;
        var colors = Color.Instances();
        display.drawBackground(colors.Black, colors.Gray);
        var player = this.entityByName(Player.name);
        var playerLoc = player.locatable().loc;
        var camera = this._camera;
        camera.loc.pos.overwriteWith(playerLoc.pos).trimToRangeMinMax(camera.viewSizeHalf, this.size().clone().subtract(camera.viewSizeHalf));
        super.draw(universe, world, display);
        this.venueControls.draw(universe);
    }
    playerCollide(uwpe) {
        var universe = uwpe.universe;
        var world = uwpe.world;
        var place = uwpe.place;
        if (uwpe.entity2.name == Player.name) {
            uwpe.entitiesSwap();
        }
        var entityPlayer = uwpe.entity;
        var entityOther = uwpe.entity2;
        var entityOtherName = entityOther.name;
        var entityOtherPlanet = Planet.fromEntity(entityOther);
        var entityOtherShipGroup = ShipGroup.fromEntity(entityOther);
        if (entityOtherName.startsWith("Wall")) {
            place.playerCollide_Wall(world, entityPlayer);
        }
        else if (entityOtherPlanet != null) {
            place.playerCollide_Planet(universe, world, entityPlayer, entityOther);
        }
        else if (entityOtherShipGroup != null) {
            place.playerCollide_ShipGroup(uwpe, entityOther);
        }
    }
    playerCollide_Planet(universe, world, entityPlayer, entityPlanet) {
        var planet = Planet.fromEntity(entityPlanet);
        var planetFaction = planet.faction(world);
        var planetHasFaction = (planetFaction != null);
        if (planetHasFaction == false) {
            this.playerCollide_Planet_WithNoFaction(universe, world, entityPlayer, entityPlanet);
        }
        else {
            this.playerCollide_Planet_WithFaction(world, entityPlayer, entityPlanet);
        }
    }
    playerCollide_Planet_WithFaction(world, entityPlayer, entityPlanet) {
        var planet = Planet.fromEntity(entityPlanet);
        var planetFaction = planet.faction(world);
        var planetIsStation = planet.isStation();
        var planetIsAlliedWithPlayer = (planetFaction.relationsWithPlayer == Faction.RelationsAllied);
        if (planetIsStation && planetIsAlliedWithPlayer) {
            world.placeNextSet(new PlaceStation(world, planet, this));
        }
        else {
            var playerPos = entityPlayer.locatable().loc.pos;
            var encounter = new Encounter(planet, planet.factionName, entityPlayer, entityPlanet, this, playerPos);
            var placeEncounter = encounter.toPlace();
            world.placeNextSet(placeEncounter);
        }
    }
    playerCollide_Planet_WithNoFaction(universe, world, entityPlayer, entityPlanet) {
        var playerLoc = entityPlayer.locatable().loc;
        var planetPos = entityPlanet.locatable().loc.pos;
        playerLoc.pos.overwriteWith(planetPos);
        playerLoc.vel.clear();
        entityPlayer.collidable().entityAlreadyCollidedWithAddIfNotPresent(entityPlanet);
        var planet = Planet.fromEntity(entityPlanet);
        var placePlanetOrbit = new PlacePlanetOrbit(universe, world, planet, this);
        world.placeNextSet(placePlanetOrbit);
    }
    playerCollide_ShipGroup(uwpe, entityShipGroup) {
        entityShipGroup.collidable().ticksUntilCanCollide = 100; // hack
        var shipGroup = ShipGroup.fromEntity(entityShipGroup);
        var placeEncounter = shipGroup.toEncounter(uwpe).toPlace();
        uwpe.world.placeNextSet(placeEncounter);
    }
    playerCollide_Wall(world, entityPlayer) {
        var placeStarsystem = this.placeStarsystem;
        var starsystem = placeStarsystem.starsystem;
        var planet = this.planet;
        var posNext = planet
            .posAsPolar
            .toCoords(Coords.create())
            .add(starsystem.sizeInner.clone().half());
        var dispositionNext = new Disposition(posNext, entityPlayer.locatable().loc.orientation.clone(), null);
        var starsystemAsPlace = starsystem.toPlace(world, dispositionNext, planet);
        world.placeNextSet(starsystemAsPlace);
    }
    starsystem() {
        return this.placeStarsystem.starsystem;
    }
}
