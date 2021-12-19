"use strict";
class PlaceStation extends Place {
    constructor(world, station, placePlanetVicinity) {
        super(PlaceStation.name, PlaceStation.name, null, []);
        this.station = station;
        this.placePlanetVicinity = placePlanetVicinity;
    }
    // methods
    dock(universe) {
        var world = universe.world;
        var placeStation = world.placeCurrent;
        var placeNext = new PlaceStationDock(world, placeStation);
        world.placeNext = placeNext;
    }
    leave(universe) {
        var world = universe.world;
        var place = world.placeCurrent;
        var placePrev = place.placePlanetVicinity;
        var size = placePrev.size;
        var planet = placePrev.planet;
        var station = place.station;
        var playerPosNext = station.posAsPolar.toCoords(Coords.create()).add(size.clone().half()).add(Coords.fromXY(3, 0).multiplyScalar(10));
        var playerLocNext = Disposition.fromPos(playerPosNext);
        var placeNext = new PlacePlanetVicinity(world, size, planet, playerLocNext, placePrev.placeStarsystem);
        world.placeNext = placeNext;
    }
    talk(universe) {
        var world = universe.world;
        var size = universe.display.sizeInPixels;
        var placeStation = world.placeCurrent;
        var factionName = this.station.factionName;
        var faction = world.defnExtended().factionByName(factionName);
        var conversationDefnName = faction.conversationDefnName;
        var conversationResourceName = "Conversation-" + conversationDefnName;
        var conversationDefnAsJSON = universe.mediaLibrary.textStringGetByName(conversationResourceName).value;
        var conversationDefn = ConversationDefn.deserialize(conversationDefnAsJSON);
        var conversation = new ConversationRun(conversationDefn, () => // quit
         {
            world.placeCurrent = placeStation.placePlanetVicinity;
            universe.venueNext = new VenueWorld(world);
        }, null, // entityPlayer
        null, // entityTalker
        null // contentsById
        );
        var conversationAsControl = conversation.toControl(size, universe);
        universe.venueNext = new VenueControls(conversationAsControl, null);
    }
    // Place
    draw(universe, world) {
        //super.draw(universe, world);
        this.venueControls.draw(universe);
    }
    updateForTimerTick(uwpe) {
        super.updateForTimerTick(uwpe.placeSet(this));
        if (this.venueControls == null) {
            var messageToShow = "[Station]";
            var placeStation = this;
            var universe = uwpe.universe;
            var controlRoot = universe.controlBuilder.choice(universe, universe.display.sizeInPixels.clone(), DataBinding.fromContext(messageToShow), ["Talk", "Dock", "Leave",], [
                (universe) => // talk
                 {
                    placeStation.talk(universe);
                },
                (universe) => // dock
                 {
                    placeStation.dock(universe);
                },
                (universe) => // leave
                 {
                    placeStation.leave(universe);
                }
            ], null //?
            );
            this.venueControls = new VenueControls(controlRoot, null);
        }
        this.venueControls.updateForTimerTick(universe);
    }
    returnToPlace(world) {
        var placeNext = this.placeToReturnTo;
        var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
        var playerLoc = playerFromPlaceNext.locatable().loc;
        playerLoc.pos.overwriteWith(this.posToReturnTo);
        playerLoc.vel.clear();
        world.placeNext = placeNext;
    }
}
