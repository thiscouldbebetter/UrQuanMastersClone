"use strict";
class PlaceStarsystem extends PlaceBase {
    constructor(world, starsystem, playerLoc, planetDeparted) {
        super(PlaceStarsystem.name + ":" + starsystem.name, PlaceStarsystem.name, null, // parentName
        Coords.fromXY(300, 300), // size
        null // entities
        );
        this.starsystem = starsystem;
        this._size = this.starsystem.sizeInner;
        this.actions =
            [
                Ship.actionShowMenu(),
                Ship.actionAccelerate(),
                Ship.actionTurnLeft(),
                Ship.actionTurnRight(),
            ]; //.addLookupsByName();
        this._actionToInputsMappings = Ship.actionToInputsMappings();
        // entities
        var entities = this.entitiesToSpawn;
        entities.push(new GameClock(2880).toEntity());
        var entityDimension = 10;
        // sun
        var sunEntity = this.constructor_SunEntityBuild(entityDimension);
        var sunPos = sunEntity.locatable().loc.pos;
        entities.push(sunEntity);
        // planets
        var planets = starsystem.planets;
        for (var i = 0; i < planets.length; i++) {
            var planet = planets[i];
            var planetEntity = planet.toEntityForStarsystem(world, null, sunPos);
            entities.push(planetEntity);
        }
        if (playerLoc != null) {
            var playerEntity = this.constructor_PlayerEntityBuild(playerLoc, world, entityDimension);
            if (planetDeparted != null) {
                var entityForPlanetDeparted = entities.find(x => Planet.fromEntity(x) == planetDeparted);
                var playerCollidable = playerEntity.collidable();
                playerCollidable.entityAlreadyCollidedWithAddIfNotPresent(entityForPlanetDeparted);
            }
            entities.push(playerEntity);
        }
        var entitiesForShipGroups = this.starsystem.shipGroups(world).map(x => x.toEntity(world, this));
        entities.push(...entitiesForShipGroups);
        this._camera = new Camera(new Coords(1, 1, 0).multiplyScalar(this.size().y), null, // focalLength
        Disposition.fromOrientation(Orientation.Instances().ForwardZDownY.clone()), null // entitiesInViewSort
        );
        var cameraAsEntity = CameraHelper.toEntity(this._camera);
        entities.push(cameraAsEntity);
        var wallsEntity = new Entity("Walls", [
            new Locatable(Disposition.fromPos(this.size().clone().half())),
            Collidable.fromCollider(new ShapeInverse(new Box(Coords.create(), this.size())))
        ]);
        entities.push(wallsEntity);
        // Sidebar.
        var containerSidebar = ControlContainer.from4("containerSidebar", Coords.fromXY(300, 0), // todo
        Coords.fromXY(100, 300), // size
        [world.player.toControlSidebar(world)]);
        this.venueControls = VenueControls.fromControl(containerSidebar);
        // Helper variables.
        this._drawLoc = Disposition.create();
    }
    // Constructor helpers.
    constructor_PlayerEntityBuild(playerLoc, world, entityDimension) {
        // player - Can this be merged with similar code in PlacePlanetVicinity?
        var activityDefnName = Player.activityDefn().name;
        var activity = new Activity(activityDefnName, null);
        var actor = new Actor(activity);
        var collider = Sphere.fromRadius(entityDimension / 2);
        var collidable = Collidable.from3(collider, [Collidable.name], // entityPropertyNamesToCollideWith
        this.playerCollide);
        var constraintSpeedMax = new Constraint_SpeedMaxXY(1);
        var constrainable = new Constrainable([constraintSpeedMax]);
        var itemHolder = ItemHolder.create();
        var locatable = new Locatable(playerLoc);
        var movable = Movable.default();
        var playable = new Playable();
        var shipGroup = world.player.shipGroup;
        var ship = shipGroup.shipFirst();
        var shipDefn = ship.defn(world);
        var visual = shipDefn.visual;
        var drawable = Drawable.fromVisual(visual);
        var playerEntity = new Entity(Player.name, [
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
        return playerEntity;
    }
    constructor_SunEntityBuild(entityDimension) {
        var sizeHalf = this.size().clone().half();
        var sunPos = sizeHalf.clone();
        var sunLocatable = new Locatable(Disposition.fromPos(sunPos));
        var sunRadius = entityDimension * 1.5;
        var sunCollider = new Sphere(Coords.create(), sunRadius);
        var sunCollidable = new Collidable(false, // canCollideAgainWithoutSeparating
        null, sunCollider, [Collidable.name], null);
        var sunColor = this.starsystem.starColor;
        var colorWhite = Color.Instances().White;
        var sunVisual = 
        //VisualCircle.fromRadiusAndColorFill(sunRadius, sunColor);
        new VisualCircleGradient(sunRadius, new ValueBreakGroup([
            new ValueBreak(0, colorWhite),
            new ValueBreak(.5, colorWhite),
            new ValueBreak(1, sunColor)
        ], null // interpolationMode
        ), null);
        var sunDrawable = Drawable.fromVisual(sunVisual);
        var sunEntity = new Entity("Sun", [
            sunLocatable,
            sunCollidable,
            sunDrawable
        ]);
        return sunEntity;
    }
    // Instance methods.
    actionToInputsMappings() {
        return this._actionToInputsMappings;
    }
    playerCollide(uwpe) {
        var place = uwpe.place;
        if (uwpe.entity2.name == Player.name) {
            uwpe.entitiesSwap();
        }
        var entityOther = uwpe.entity2;
        var entityOtherName = entityOther.name;
        if (entityOtherName.startsWith("Wall")) {
            place.playerCollide_Walls(uwpe);
        }
        else if (entityOtherName.startsWith("Sun")) {
            // Do nothing.
        }
        else {
            var entityOtherPlanet = Planet.fromEntity(entityOther);
            var entityOtherShipGroup = ShipGroupFinite.fromEntity(entityOther);
            if (entityOtherPlanet != null) {
                place.playerCollide_Planet(uwpe);
            }
            else if (entityOtherShipGroup != null) {
                place.playerCollide_ShipGroup(uwpe);
            }
        }
    }
    playerCollide_Planet(uwpe) {
        var world = uwpe.world;
        var place = uwpe.place;
        var entityPlayer = uwpe.entity;
        var entityOther = uwpe.entity2;
        var entityOtherPlanet = Planet.fromEntity(entityOther);
        entityPlayer.collidable().entityAlreadyCollidedWithAddIfNotPresent(entityOther);
        var planet = entityOtherPlanet;
        var sizeNext = place.size().clone();
        var playerOrientation = entityPlayer.locatable().loc.orientation;
        var heading = playerOrientation.forward.headingInTurns();
        var playerPosNext = Polar.fromAzimuthInTurnsAndRadius(heading + .5, .4 * sizeNext.y)
            .wrap()
            .toCoords(Coords.create())
            .add(sizeNext.clone().half());
        var playerLocNext = new Disposition(playerPosNext, playerOrientation, null);
        var placePlanetVicinity = new PlacePlanetVicinity(world, planet, playerLocNext, place);
        world.placeNextSet(placePlanetVicinity);
    }
    playerCollide_ShipGroup(uwpe) {
        var world = uwpe.world;
        var place = uwpe.place;
        var entityPlayer = uwpe.entity;
        var entityOther = uwpe.entity2;
        var shipGroup = ShipGroupBase.fromEntity(entityOther);
        entityOther.collidable().ticksUntilCanCollide = 100; // hack
        var playerPos = entityPlayer.locatable().loc.pos;
        var encounter = new Encounter(place.starsystem.planetClosestTo(playerPos), shipGroup.factionName, entityPlayer, entityOther, place, playerPos);
        var placeEncounter = encounter.toPlace();
        world.placeNextSet(placeEncounter);
    }
    playerCollide_Walls(uwpe) {
        var universe = uwpe.universe;
        var world = uwpe.world;
        var place = uwpe.place;
        var entityPlayer = uwpe.entity;
        var hyperspace = world.hyperspace;
        var playerLoc = entityPlayer.locatable().loc;
        var playerPosNext = place.starsystem.posInHyperspace.clone();
        var playerDisposition = new Disposition(playerPosNext, playerLoc.orientation.clone(), Hyperspace.name);
        var placeHyperspace = new PlaceHyperspace(universe, hyperspace, place.starsystem, // starsystemDeparted
        playerDisposition);
        world.placeNextSet(placeHyperspace);
    }
    // Place overrides
    draw(universe, world) {
        var display = universe.display;
        var colors = Color.Instances();
        display.drawBackground(colors.Black, colors.Gray);
        var player = this.entityByName(Player.name);
        if (player == null) {
            return; // hack
        }
        var playerLoc = player.locatable().loc;
        var camera = this._camera;
        camera.loc.pos.overwriteWith(playerLoc.pos).trimToRangeMinMax(camera.viewSizeHalf, this.size().clone().subtract(camera.viewSizeHalf));
        super.draw(universe, world, universe.display);
        this.venueControls.draw(universe);
    }
    initialize(uwpe) {
        var universe = uwpe.universe;
        var soundHelper = universe.soundHelper;
        soundHelper.soundWithNamePlayAsMusic(universe, "Music_Starsystem");
    }
}
