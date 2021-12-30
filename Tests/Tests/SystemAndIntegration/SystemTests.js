"use strict";
class SystemTests extends TestFixture {
    constructor() {
        super(SystemTests.name);
    }
    tests() {
        var returnTests = [
            this.playFromStart
        ];
        return returnTests;
    }
    // Tests.
    playFromStart() {
        // todo
        var environment = new EnvironmentMock();
        environment.universeBuild((u) => this.playFromStart_UniverseBuilt(u));
    }
    playFromStart_UniverseBuilt(universe) {
        Assert.isNotNull(universe);
        var world = universe.world;
        var venueWorld = world.toVenue();
        universe.venueNext = venueWorld;
        var place = world.placeCurrent;
        var starsystemSol = place.starsystem;
        Assert.areStringsEqual("Sol", starsystemSol.name);
        var planetEarth = place.entityByName("Earth");
        Assert.isNotNull(planetEarth);
        var player = place.entityByName(Player.name);
        Assert.isNotNull(player);
        // Move the player's ship to Earth.
        var playerPos = player.locatable().loc.pos;
        var planetEarthPos = planetEarth.locatable().loc.pos;
        playerPos.overwriteWith(planetEarthPos);
        // Make sure the place transitions to a planet vicinity.
        universe.updateForTimerTick();
        place = world.placeCurrent;
        var placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Wait for the guard drone to approach the player
        // and initiate a conversation.
        var ticksToWait = 1000;
        for (var i = 0; i < ticksToWait; i++) {
            universe.updateForTimerTick();
        }
        var venue = universe.venueCurrent;
        var venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        // Leave the conversation.
        var venueConversation = venue;
        var containerConversation = venueConversation.controlRoot;
        var containerButtons = containerConversation.childByName("containerButtons").containerInner;
        var buttonNext = containerButtons.childByName("buttonNext");
        Assert.isNotNull(buttonNext);
        while (universe.venueCurrent == venueConversation) {
            buttonNext.click();
            universe.updateForTimerTick();
        }
        // Verify that we're back in the world venue.
        venue = universe.venueCurrent;
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueWorld.name, venueTypeName);
        // Move the player to the station.
        var station = place.entityByName(Station.name);
        Assert.isNotNull(station);
        player = place.entityByName(Player.name);
        playerPos = player.locatable().loc.pos;
        var stationPos = station.locatable().loc.pos;
        playerPos.overwriteWith(stationPos);
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        // Talk to the station.
        venue = universe.venueCurrent;
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        var stationTalker = station.talker();
        var conversationRun = stationTalker.conversationRun;
        Assert.isNotNull(conversationRun);
        conversationRun.nextUntilPrompt(universe);
        conversationRun.optionSelectByNext("#(WE_NEED_RADIOACTIVES)");
        conversationRun.nextUntilPrompt(universe);
        conversationRun.optionSelectByNext("#(PLEASE_JUST_BRING_US_RADIOACTIVES)");
        conversationRun.nextUntilPrompt(universe);
        universe.updateForTimerTick();
        venue = universe.venueCurrent;
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueWorld.name, venueTypeName);
        // Move the player beyond the edge of the screen to exit the planet vicinity.
        playerPos.overwriteWith(place.size).double();
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceStarsystem.name, placeTypeName);
        // Move the player to Mercury.
        var planetMercury = place.entityByName("Mercury");
        var planetMercuryPos = planetMercury.locatable().loc.pos;
        player = place.entityByName(Player.name);
        playerPos = player.locatable().loc.pos;
        playerPos.overwriteWith(planetMercuryPos);
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Orbit the planet.
        place = world.placeCurrent;
        player = place.entityByName(Player.name);
        playerPos = player.locatable().loc.pos;
        planetMercury = place.entityByName(Planet.name);
        planetMercuryPos = planetMercury.locatable().loc.pos;
        playerPos.overwriteWith(planetMercuryPos);
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetOrbit.name, placeTypeName);
        // Verify that the cargo hold contains no radioactives.
        var playerItemHolder = world.player.flagship.itemHolder;
        var itemDefnNameRadioactives = "Radioactives";
        var radioactivesHeld = playerItemHolder.itemsByDefnName(itemDefnNameRadioactives)[0];
        Assert.isNull(radioactivesHeld);
        // Land on the planet.
        var placeOrbit = place;
        placeOrbit.land(universe);
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetSurface.name, placeTypeName);
        // Move to radioactives.
        player = place.entityByName(Player.name);
        playerPos = player.locatable().loc.pos;
        var radioactives = place.entities.find(x => x.item() != null && x.item().defnName == "Radioactives");
        var radioactivesPos = radioactives.locatable().loc.pos;
        playerPos.overwriteWith(radioactivesPos);
        universe.updateForTimerTick();
        // Launch and return to the ship in orbit.
        var placeSurface = place;
        placeSurface.exit(new UniverseWorldPlaceEntities(universe, world, placeSurface, null, null));
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetOrbit.name, placeTypeName);
        // Verify that the cargo holds now contain something.
        var radioactivesHeld = playerItemHolder.itemsByDefnName(itemDefnNameRadioactives)[0];
        Assert.isNotNull(radioactivesHeld);
        // Exit orbit.
        var placeOrbit = place;
        placeOrbit.returnToPlaceParent(universe);
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Leave the Mercury vicinity and return to the Earth Station.
        player = place.entityByName(Player.name);
        playerPos = player.locatable().loc.pos;
        playerPos.overwriteWith(place.size).double();
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceStarsystem.name, placeTypeName);
        player = place.entityByName(Player.name);
        playerPos = player.locatable().loc.pos;
        playerPos.overwriteWith(planetEarthPos);
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        player = place.entityByName(Player.name);
        playerPos = player.locatable().loc.pos;
        playerPos.overwriteWith(stationPos);
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        venue = universe.venueCurrent;
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        station = place.entityByName(Station.name);
        stationTalker = station.talker();
        conversationRun = stationTalker.conversationRun;
        conversationRun.nextUntilPrompt(universe);
        conversationRun.optionSelectByNext("Radioactives.Yes");
        conversationRun.nextUntilPrompt(universe);
        conversationRun.optionSelectByNext("FightTheLahkemup");
        conversationRun.nextUntilPrompt(universe);
        conversationRun.optionSelectByNext("Goodbye");
        conversationRun.nextUntilPrompt(universe);
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceStationDock.name, placeTypeName);
    }
}
