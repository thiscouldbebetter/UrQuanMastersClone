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
        environment.universeBuild((u) => {
            u.initialize(() => this.playFromStart_UniverseInitialized(u));
        });
    }
    playFromStart_UniverseInitialized(universe) {
        Assert.isNotNull(universe);
        var world = universe.world;
        var venueWorld = world.toVenue();
        universe.venueNextSet(venueWorld);
        var place = world.placeCurrent;
        var starsystemSol = place.starsystem;
        Assert.areStringsEqual("Sol", starsystemSol.name);
        this.playFromStart_WaitForTicks(universe, 5);
        var planetEarth = place.entityByName("Earth");
        Assert.isNotNull(planetEarth);
        var playerEntity = place.entityByName(Player.name);
        Assert.isNotNull(playerEntity);
        // Move the player's ship to Earth.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Earth");
        // Make sure the place transitions to a planet vicinity.
        place = world.placeCurrent;
        var placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Wait for the guard drone to approach the player
        // and initiate a conversation.
        this.playFromStart_WaitForTicks(universe, 1000);
        var venue = universe.venueCurrent();
        var venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        // Leave the conversation.
        var venueConversation = venue;
        var containerConversation = venueConversation.controlRoot;
        var buttonNext = containerConversation.childByName("buttonNextUnderPortrait");
        Assert.isNotNull(buttonNext);
        while (universe.venueCurrent() == venueConversation) {
            buttonNext.click();
            universe.updateForTimerTick();
        }
        // Verify that we're back in the world venue.
        venue = universe.venueCurrent();
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueWorld.name, venueTypeName);
        // Move the player to the station.
        var stationName = "EarthStation";
        var station = place.entityByName(stationName);
        Assert.isNotNull(station);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, stationName);
        // hack - Should this be necessary?
        this.playFromStart_WaitForTicks(universe, 100);
        // Talk to the station.
        venue = universe.venueCurrent();
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        var talker = station.talker();
        this.playFromStart_TalkToTalker(universe, talker, [
            "#(THE_WHAT_FROM_WHERE)",
            "#(THANKS_FOR_HELPING)"
        ]);
        universe.updateForTimerTick();
        venue = universe.venueCurrent();
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueWorld.name, venueTypeName);
        // Move the player beyond the edge of the screen to exit the planet vicinity.
        this.playFromStart_LeavePlanetVicinityAndWait(universe);
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceStarsystem.name, placeTypeName);
        // Move the player to Mercury.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Mercury");
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Orbit the planet.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Planet.name);
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetOrbit.name, placeTypeName);
        // Verify that the cargo hold contains no radioactives.
        var player = world.player;
        var playerItemHolder = player.flagship.itemHolderCargo;
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
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
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
        this.playFromStart_LeavePlanetVicinityAndWait(universe);
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceStarsystem.name, placeTypeName);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Earth");
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, stationName);
        venue = universe.venueCurrent();
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        // Talk to the station commander.
        station = place.entityByName(stationName);
        talker = station.talker();
        this.playFromStart_TalkToTalker(universe, talker, [
            "Radioactives.Yes",
            "FightTheLahkemup",
            null, // I'm from the coalition.
            null, // We got shipwrecked.
            null, // We found this ship.
            null, // Help me take 'em down.
            "Goodbye"
        ]);
        // todo - Battle with a returning Araknoid.
        universe.updateForTimerTick();
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeTypeName);
        // Leave the Sol system and go to hyperspace.
        this.playFromStart_LeavePlanetVicinityAndWait(universe);
        this.playFromStart_LeaveStarsystemAndWait(universe);
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
        var placeCombat = place;
        var combat = placeCombat.combat;
        var shipGroupForPlayer = combat.shipGroups[0];
        var shipForPlayer = shipGroupForPlayer.ships[0];
        combat.shipsFighting[0] = shipForPlayer;
        combat.fight(universe);
        this.playFromStart_WaitForTicks(universe, 100);
        var shipEnemy = combat.shipsFighting[1];
        var shipEnemyAsEntity = placeCombat.entityByName(shipEnemy.name);
        shipEnemyAsEntity.killable().kill();
        this.playFromStart_WaitForTicks(universe, 100);
        // Verify that we're seeing a briefing screen.
        venue = universe.venueCurrent();
        venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(VenueControls.name, venueTypeName);
        var creditBefore = player.resourceCredits;
        var venueControls = venue;
        var containerChoice = venueControls.controlRoot;
        var buttonAcknowledge = containerChoice.childByName("buttonAcknowledge");
        buttonAcknowledge.click();
        this.playFromStart_WaitForTicks(universe, 100);
        // Verify that resources were salvaged from destroyed ship.
        var creditAfter = player.resourceCredits;
        Assert.isTrue(creditAfter > creditBefore);
        // Verify that we're back in hyperspace.
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceHyperspace.name, placeTypeName);
        // Go to the nearby Alpha Centauri starsystem.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Alpha Centauri");
        this.playFromStart_WaitForTicks(universe, 1000);
        place = world.placeCurrent;
        placeTypeName = place.constructor.name;
        Assert.areStringsEqual(PlaceStarsystem.name, placeTypeName);
        // Look for a Trader ship, in the main starsystem and in each planet vicinity.
        var placeStarsystem = place;
        var starsystem = placeStarsystem.starsystem;
        var factionNameMurch = world.factionByName("Murch").name;
        var shipGroupMurch = starsystem.shipGroups.find(x => x.factionName == factionNameMurch);
        if (shipGroupMurch == null) {
            var planets = starsystem.planets;
            for (var i = 0; i < planets.length; i++) {
                var planet = planets[i];
                shipGroupMurch = planet.shipGroups.find(x => x.factionName == factionNameMurch);
                if (shipGroupMurch != null) {
                    this.playFromStart_MoveToEntityWithNameAndWait(universe, planet.name);
                    break;
                }
            }
        }
        var place = world.placeCurrent;
        this.playFromStart_MoveToEntityWithNameAndWait(universe, shipGroupMurch.name);
        // Gather resources.
        // Gather lifeforms.
        // Return to Earth station.
    }
    playFromStart_FindEntityWithName(universe, targetEntityName) {
        var place = universe.world.placeCurrent;
        var targetFound = place.entityByName(targetEntityName);
        if (targetFound == null) {
            var placeEntities = place.entitiesAll();
            targetFound =
                placeEntities.find((x) => x.name.startsWith(targetEntityName));
        }
        return targetFound;
    }
    playFromStart_LeavePlanetVicinityAndWait(universe) {
        this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);
        // hack - Is this necessary?
        // Some delay may be needed to wait for the fader to finish fading.
        // The way the test is set up, this wait requires some fine-tuning.
        this.playFromStart_WaitForTicks(universe, 250);
    }
    playFromStart_LeavePlanetVicinityOrStarsystem(universe) {
        var place = universe.world.placeCurrent;
        var player = place.entityByName(Player.name);
        var playerPos = player.locatable().loc.pos;
        var placeSize = place.size();
        playerPos.overwriteWith(placeSize).double();
    }
    playFromStart_LeaveStarsystemAndWait(universe) {
        this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);
        this.playFromStart_WaitForTicks(universe, 10); // hack - Necessary?
    }
    playFromStart_MoveToEntityWithNameAndWait(universe, targetEntityName) {
        var place = universe.world.placeCurrent;
        var player = place.entityByName(Player.name);
        var playerPos = player.locatable().loc.pos;
        var target = this.playFromStart_FindEntityWithName(universe, targetEntityName);
        if (target != null) {
            var targetPos = target.locatable().loc.pos;
            playerPos.overwriteWith(targetPos);
        }
        // hack - How long is necessary to wait?
        this.playFromStart_WaitForTicks(universe, 50);
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
            universe.timerHelper.ticksSoFar++; // hack
        }
    }
}
