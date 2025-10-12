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
        var planetPos = sizeHalf.clone();
        const isPrimaryTrue = true;
        var orbitColor = this.planet.orbitColor();
        var planetEntity = this.planet.toEntityForPlanetVicinity(world, isPrimaryTrue, planetPos, orbitColor, entityDimension);
        entities.push(planetEntity);
        // satellites
        var satellites = planet.satellitesGet();
        for (var i = 0; i < satellites.length; i++) {
            var satellite = satellites[i];
            const isPrimaryFalse = false;
            var satelliteEntity = satellite.toEntityForPlanetVicinity(world, isPrimaryFalse, planetPos, orbitColor, entityDimension / 2);
            entities.push(satelliteEntity);
        }
        if (playerLoc != null) {
            var playerEntity = this.constructor_PlayerEntityBuild(entityDimension, world, playerLoc);
            entities.push(playerEntity);
        }
        var entitiesForShipGroups = this.planet
            .shipGroupsInVicinity()
            .map(x => x.toEntity(world, this));
        /*
        // This may not be necessary.  See comment within .shipGroupNonPlayerCollide().
        entitiesForShipGroups.forEach
        (
            x => Collidable.of(x).collideEntitiesSet(this.shipGroupNonPlayerCollide)
        );
        */
        entities.push(...entitiesForShipGroups);
        this._camera = new Camera(Coords.fromXY(1, 1).multiplyScalar(300), // hack
        null, // focalLength
        Disposition.fromOrientation(Orientation.Instances().ForwardZDownY.clone()), null // entitiesInViewSort
        );
        var cameraAsEntity = CameraHelper.toEntity(this._camera);
        entities.push(cameraAsEntity);
        var wallsCollidable = Collidable.fromShape(ShapeInverse.fromChild(BoxAxisAligned.fromSize(this.size())));
        var wallsEntity = Entity.fromNameAndProperties(PlacePlanetVicinity.EntityBoundaryWallName, [
            Locatable.fromPos(this.size().clone().half()),
            wallsCollidable
        ]);
        entities.push(wallsEntity);
    }
    constructor_PlayerEntityBuild(entityDimension, world, playerLoc) {
        // player - Can this be merged with similar code in PlaceStarsystem?
        var activityDefnName = Player.activityDefn().name;
        var activity = new Activity(activityDefnName, null);
        var actor = new Actor(activity);
        var collider = Sphere.fromRadius(entityDimension / 2);
        var collidable = Collidable.fromColliderPropertyNamesAndCollide(collider, [Collidable.name], // entityPropertyNamesToCollideWith
        this.playerCollide);
        var constrainable = Constrainable.create();
        var itemHolder = ItemHolder.create();
        var locatable = new Locatable(playerLoc);
        var movable = Movable.fromSpeedMax(1);
        var playable = new Playable();
        var shipGroup = world.player.shipGroup;
        var ship = shipGroup.shipFirst();
        var shipDefn = ship.defn(world);
        var visual = shipDefn.visual;
        var drawable = Drawable.fromVisual(visual);
        var playerEntity = Entity.fromNameAndProperties(Player.name, [
            actor,
            collidable,
            constrainable,
            drawable,
            itemHolder,
            locatable,
            movable,
            playable,
            ship,
            shipGroup
        ]);
        //playerEntity.collidable.ticksUntilCanCollide = 100; // hack
        return playerEntity;
    }
    // methods
    actionToInputsMappings() {
        return this._actionToInputsMappings;
    }
    draw(universe, world) {
        var display = universe.display;
        var colors = Color.Instances();
        display.drawBackgroundWithColorsBackAndBorder(colors.Black, colors.Gray);
        var player = this.entityByName(Player.name);
        var playerLoc = Locatable.of(player).loc;
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
        var entityOtherShipGroup = ShipGroupFinite.fromEntity(entityOther);
        if (entityOtherName == PlacePlanetVicinity.EntityBoundaryWallName) {
            place.playerCollide_Walls(world, entityPlayer);
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
        var player = world.player;
        var planetIsAlliedWithPlayer = (player.diplomaticRelationshipWithFactionIsAllied(planetFaction));
        if (planetIsStation && planetIsAlliedWithPlayer) {
            world.placeNextSet(new PlaceStation(world, planet, this));
        }
        else {
            var playerPos = Locatable.of(entityPlayer).loc.pos;
            var encounter = new Encounter(planet, planet.factionName, entityPlayer, entityPlanet, this, playerPos);
            var placeEncounter = encounter.toPlace();
            world.placeNextSet(placeEncounter);
        }
    }
    playerCollide_Planet_WithNoFaction(universe, world, entityPlayer, entityPlanet) {
        var playerLoc = Locatable.of(entityPlayer).loc;
        var planetPos = Locatable.of(entityPlanet).loc.pos;
        playerLoc.pos.overwriteWith(planetPos);
        playerLoc.vel.clear();
        Collidable.of(entityPlayer).entityAlreadyCollidedWithAddIfNotPresent(entityPlanet);
        var planet = Planet.fromEntity(entityPlanet);
        var placePlanetOrbit = new PlacePlanetOrbit(universe, world, planet, this);
        world.placeNextSet(placePlanetOrbit);
    }
    playerCollide_ShipGroup(uwpe, entityShipGroup) {
        Collidable.of(entityShipGroup).ticksUntilCanCollide = 100; // hack
        var shipGroup = ShipGroupFinite.fromEntity(entityShipGroup);
        var placeEncounter = shipGroup.toEncounter(uwpe).toPlace();
        uwpe.world.placeNextSet(placeEncounter);
    }
    playerCollide_Walls(world, entityPlayer) {
        var placeStarsystem = this.placeStarsystem;
        var starsystem = placeStarsystem.starsystem;
        var planet = this.planet;
        var posNext = planet
            .offsetFromPrimaryAsPolar
            .toCoords()
            .add(starsystem.sizeInner.clone().half());
        var dispositionNext = Disposition.fromPosAndOrientation(posNext, Locatable.of(entityPlayer).loc.orientation.clone());
        var starsystemAsPlace = starsystem.toPlace(world, dispositionNext, planet);
        world.placeNextSet(starsystemAsPlace);
    }
    shipGroupNonPlayerCollide(uwpe) {
        // This may not be necessary,
        // as it may be better handled through the ShipGroup's Actor property.
        var world = uwpe.world;
        var place = uwpe.place;
        if (uwpe.entity2.name.startsWith("ShipGroup")) {
            uwpe.entitiesSwap();
        }
        var entityPlayer = uwpe.entity;
        var entityOther = uwpe.entity2;
        var entityOtherName = entityOther.name;
        if (entityOtherName == PlacePlanetVicinity.EntityBoundaryWallName) {
            place.shipGroupNonPlayerCollide_Walls(world, entityPlayer);
        }
    }
    shipGroupNonPlayerCollide_Walls(world, shipGroupAsEntity) {
        var placeStarsystem = this.placeStarsystem;
        var starsystem = placeStarsystem.starsystem;
        var planet = this.planet;
        var posNext = planet
            .offsetFromPrimaryAsPolar
            .toCoords()
            .add(starsystem.sizeInner.clone().half());
        var disposition = Locatable.of(shipGroupAsEntity).loc;
        var dispositionNext = Disposition.fromPosAndOrientation(posNext, disposition.orientation.clone());
        disposition.overwriteWith(dispositionNext);
        this.entityToRemoveAdd(shipGroupAsEntity);
        this.placeStarsystem.entityToSpawnAdd(shipGroupAsEntity);
    }
    starsystem() {
        return this.placeStarsystem.starsystem;
    }
    initialize(uwpe) {
        var world = uwpe.world;
        var playerAsControlSidebar = world.player.toControlSidebar(world);
        var containerSidebar = ControlContainer.fromNamePosSizeAndChildren("containerSidebar", Coords.fromXY(300, 0), // todo
        Coords.fromXY(100, 300), // size
        [playerAsControlSidebar]);
        this.venueControls = VenueControls.fromControl(containerSidebar);
    }
}
PlacePlanetVicinity.EntityBoundaryWallName = "Walls";
