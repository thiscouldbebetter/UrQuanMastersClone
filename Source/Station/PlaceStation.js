"use strict";
class PlaceStation extends PlaceBase {
    constructor(world, station, placePlanetVicinity) {
        super(PlaceStation.name, PlaceStation.name, null, // parentName
        null, // size
        null // entities
        );
        this.station = station;
        this.placePlanetVicinity = placePlanetVicinity;
    }
    // methods
    dock(universe) {
        var world = universe.world;
        var placeStation = world.placeCurrent;
        var placeNext = new PlaceStationDock(world, placeStation);
        world.placeNextSet(placeNext);
    }
    leave(world) {
        var place = world.place();
        var placePrev = place.placePlanetVicinity;
        var size = placePrev.size();
        var planet = placePrev.planet;
        var station = place.station;
        var playerPosNext = station.offsetFromPrimaryAsPolar.toCoords(Coords.create()).add(size.clone().half()).add(Coords.fromXY(3, 0).multiplyScalar(10));
        var playerLocNext = Disposition.fromPos(playerPosNext);
        var placeNext = new PlacePlanetVicinity(world, planet, playerLocNext, placePrev.placeStarsystem);
        world.placeNextSet(placeNext);
    }
    talk(universe) {
        var world = universe.world;
        var placeStation = world.placeCurrent;
        var factionName = this.station.factionName;
        var faction = world.defnExtended().factionByName(factionName);
        var conversationDefnName = faction.conversationDefnName;
        var conversationResourceName = conversationDefnName;
        var conversationQuit = () => {
            world.placeCurrent = placeStation.placePlanetVicinity;
            universe.venueNextSet(new VenueWorld(world));
        };
        var stationEntity = placeStation.entityByName(Planet.name);
        var talker = stationEntity.talker();
        talker.conversationDefnName = conversationResourceName;
        talker.quit = conversationQuit;
        var uwpe = new UniverseWorldPlaceEntities(universe, world, this, stationEntity, null);
        talker.talk(uwpe);
    }
    // Place
    draw(universe, world) {
        //super.draw(universe, world);
        this.venueControls.draw(universe);
    }
    updateForTimerTick(uwpe) {
        super.updateForTimerTick(uwpe.placeSet(this));
        var universe = uwpe.universe;
        var world = uwpe.world;
        if (this.venueControls == null) {
            var messageToShow = "[Station]";
            var placeStation = this;
            var controlRoot = universe.controlBuilder.choice5(universe, universe.display.sizeInPixels.clone(), DataBinding.fromContext(messageToShow), ["Talk", "Dock", "Leave",], [
                () => // talk
                 {
                    placeStation.talk(universe);
                },
                () => // dock
                 {
                    placeStation.dock(universe);
                },
                () => // leave
                 {
                    placeStation.leave(world);
                }
            ]);
            this.venueControls = new VenueControls(controlRoot, null);
        }
        this.venueControls.updateForTimerTick(universe);
    }
    returnToPlace(world) {
        var placeNext = this.placeToReturnTo;
        var playerFromPlaceNext = placeNext.entityByName(Player.name);
        var playerLoc = playerFromPlaceNext.locatable().loc;
        playerLoc.pos.overwriteWith(this.posToReturnTo);
        playerLoc.vel.clear();
        world.placeNextSet(placeNext);
    }
}
