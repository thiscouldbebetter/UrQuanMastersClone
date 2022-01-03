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
        this.playFromStart_MoveToEntityWithName(universe, "Earth");
        // Make sure the place transitions to a planet vicinity.
        place = world.placeCurrent;
        var placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Wait for the guard drone to approach the player
        // and initiate a conversation.
        this.playFromStart_WaitForTicks(universe, 1000);
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
        this.playFromStart_MoveToEntityWithName(universe, Station.name);
        // hack - Should these be necessary?
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        // Talk to the station.
        venue = universe.venueCurrent;
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        var talker = station.talker();
        this.playFromStart_TalkToTalker(universe, talker, [
            "#(WE_NEED_RADIOACTIVES)",
            "#(PLEASE_JUST_BRING_US_RADIOACTIVES)"
        ]);
        universe.updateForTimerTick();
        venue = universe.venueCurrent;
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueWorld.name, venueTypeName);
        // Move the player beyond the edge of the screen to exit the planet vicinity.
        this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceStarsystem.name, placeTypeName);
        // Move the player to Mercury.
        this.playFromStart_MoveToEntityWithName(universe, "Mercury");
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Orbit the planet.
        this.playFromStart_MoveToEntityWithName(universe, Planet.name);
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
        // Pick up enough resources to be sure to get the radioactives.
        this.playFromStart_MoveToEntityWithName(universe, Resource.name);
        this.playFromStart_MoveToEntityWithName(universe, Resource.name);
        this.playFromStart_MoveToEntityWithName(universe, Resource.name);
        this.playFromStart_MoveToEntityWithName(universe, Resource.name);
        this.playFromStart_MoveToEntityWithName(universe, Resource.name);
        this.playFromStart_MoveToEntityWithName(universe, Resource.name);
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
        this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceStarsystem.name, placeTypeName);
        this.playFromStart_MoveToEntityWithName(universe, "Earth");
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        this.playFromStart_MoveToEntityWithName(universe, Station.name);
        venue = universe.venueCurrent;
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        // Talk to the station commander.
        station = place.entityByName(Station.name);
        talker = station.talker();
        this.playFromStart_TalkToTalker(universe, talker, [
            "Radioactives.Yes",
            "FightTheLahkemup",
            null,
            null,
            null,
            null,
            "Goodbye"
        ]);
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Leave the Sol system and go to hyperspace.
        this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);
        this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceHyperspace.name, placeTypeName);
        // Wait to be accosted by a probe.
        this.playFromStart_WaitForTicks(universe, 1000);
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceEncounter.name, placeTypeName);
        var placeEncounter = place;
        placeEncounter.encounter.talk(universe);
        universe.updateForTimerTick();
        // Talk to the probe.
        var encounter = placeEncounter.encounter;
        var entityOther = encounter.entityOther;
        talker = entityOther.talker();
        this.playFromStart_TalkToTalker(universe, talker, [null] // Doesn't matter what you say.
        );
        universe.updateForTimerTick();
        // The probe attacks.
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceCombat.name, placeTypeName);
        // todo
        // Destroy the probe (by cheating, in this test).
        // Verify that resources were gained.
        // Go to another starsystem.
        // Gather resources.
        // Gather lifeforms.
        // Return to Earth station.
    }
    playFromStart_LeavePlanetVicinityOrStarsystem(universe) {
        var place = universe.world.placeCurrent;
        var player = place.entityByName(Player.name);
        var playerPos = player.locatable().loc.pos;
        playerPos.overwriteWith(place.size).double();
        universe.updateForTimerTick();
        universe.updateForTimerTick(); // hack - Why does this take two ticks?
    }
    playFromStart_MoveToEntityWithName(universe, targetEntityName) {
        var place = universe.world.placeCurrent;
        var player = place.entityByName(Player.name);
        var playerPos = player.locatable().loc.pos;
        var target = place.entityByName(targetEntityName);
        if (target == null) {
            target =
                place.entities.find((x) => x.name.startsWith(targetEntityName));
        }
        if (target != null) {
            var targetPos = target.locatable().loc.pos;
            playerPos.overwriteWith(targetPos);
        }
        // hack
        // Only need this many sometimes.
        // Why do we ever need more than one?
        universe.updateForTimerTick();
        universe.updateForTimerTick();
        universe.updateForTimerTick();
    }
    playFromStart_TalkToTalker(universe, talker, optionsToSelect) {
        var conversationRun = talker.conversationRun;
        conversationRun.nextUntilPrompt(universe);
        for (var i = 0; i < optionsToSelect.length; i++) {
            var optionToSelect = optionsToSelect[i];
            if (optionToSelect == null) {
                conversationRun.optionSelectNext();
            }
            else {
                conversationRun.optionSelectByNext(optionToSelect);
            }
            conversationRun.nextUntilPrompt(universe);
        }
    }
    playFromStart_WaitForTicks(universe, ticksToWait) {
        for (var i = 0; i < ticksToWait; i++) {
            universe.updateForTimerTick();
        }
    }
}
