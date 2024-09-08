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
    playFromStart(callback) {
        // todo
        var environment = new EnvironmentMock();
        environment.universeBuild((u) => {
            u.initialize(() => this.playFromStart_UniverseInitialized(callback, u));
        });
    }
    playFromStart_UniverseInitialized(callback, universe) {
        Assert.isNotNull(universe);
        var world = universe.world;
        var venueWorld = world.toVenue();
        universe.venueNextSet(venueWorld);
        var venue = () => universe.venueCurrent();
        var place = () => world.placeCurrent;
        var starsystemSol = place().starsystem;
        Assert.areStringsEqual("Sol", starsystemSol.name);
        this.playFromStart_WaitForTicks(universe, 5);
        var planetEarth = place().entityByName("Earth");
        Assert.isNotNull(planetEarth);
        var playerEntity = place().entityByName(Player.name);
        Assert.isNotNull(playerEntity);
        // Move the player's ship to Earth.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Earth");
        // Make sure the place transitions to a planet vicinity.
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Wait for the guard drone to approach the player
        // and initiate a conversation.
        this.playFromStart_WaitForTicks(universe, 1000);
        this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        // Leave the conversation.
        var venueConversation = venue();
        var containerConversation = venueConversation.controlRoot;
        var buttonNext = containerConversation.childByName("buttonNextUnderPortrait");
        Assert.isNotNull(buttonNext);
        while (universe.venueCurrent() == venueConversation) {
            buttonNext.click();
            universe.updateForTimerTick();
        }
        // Verify that we're back in the world venue.
        this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);
        // Move the player to the station.
        var stationName = "EarthStation";
        var station = place().entityByName(stationName);
        Assert.isNotNull(station);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, stationName);
        // hack - Should this be necessary?
        this.playFromStart_WaitForTicks(universe, 100);
        // Talk to the station.
        this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        var talker = station.talker();
        this.playFromStart_TalkToTalker(universe, talker, [
            // "Are you the resupply ship?" 
            "#(no_but_well_help)",
            // "We need radioactives."
            "#(well_go_get_them_now)"
            // "Thanks."
        ]);
        // The converation is over; verify that we're back in the world.
        universe.updateForTimerTick();
        this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);
        // Move the player beyond the edge of the screen to exit the planet vicinity.
        this.playFromStart_LeavePlanetVicinityAndWait(universe);
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        // Move the player to Mercury.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Mercury");
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Orbit the planet.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Planet.name);
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        // Verify that the cargo hold contains no radioactives.
        var player = world.player;
        var playerItemHolder = player.flagship.itemHolderCargo;
        var itemDefnNameRadioactives = "Radioactives";
        var radioactivesHeld = playerItemHolder.itemsByDefnName(itemDefnNameRadioactives)[0];
        Assert.isNull(radioactivesHeld);
        // Land on the planet.
        var placeOrbit = place();
        placeOrbit.land(universe);
        universe.updateForTimerTick();
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, world);
        // Pick up enough resources to be sure to get the radioactives.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, Resource.name);
        // Launch and return to the ship in orbit.
        var placeSurface = place();
        placeSurface.exit(new UniverseWorldPlaceEntities(universe, world, placeSurface, null, null));
        universe.updateForTimerTick();
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        // Verify that the cargo holds now contain something.
        var radioactivesHeld = playerItemHolder.itemsByDefnName(itemDefnNameRadioactives)[0];
        Assert.isNotNull(radioactivesHeld);
        // Exit Mercury orbit.
        this.playFromStart_LeavePlanetOrbitAndWait(universe);
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Leave the Mercury vicinity and return to the Earth Station.
        this.playFromStart_LeavePlanetVicinityAndWait(universe);
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Earth");
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, stationName);
        this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        // Talk to the station commander.
        var placeEncounter = place();
        station = placeEncounter.entityByName(stationName);
        talker = station.talker();
        this.playFromStart_TalkToTalker(universe, talker, [
            // "Do you have the radioactives?"
            "#(we_will_transfer_now)",
            // "Our sensors are coming online... WHO ARE YOU?!"
            "#(we_are_vindicator)",
            // "I would have known about any such mission."
            "#(our_mission_was_secret)",
            // "Maybe so.  What do you want of us?"
            "#(first_give_info)",
            // "What do you want to know?"
            "#(whats_this_starbase)",
            // "It's an Hierarchy resupply station."
            "#(what_about_earth)",
            // "It's slave-shielded."
            "#(where_are_urquan)",
            // "They left."
            "#(what_was_red_thing)",
            // "Their guard drone.  What happened to it?"
            "#(it_went_away)",
            // "We're in deep trouble, then.  It'll report us."
            "#(we_are_here_to_help2)",
            // "Nice dream, but first the Hierarchy base on the moon."
            "#(we_will_take_care_of_base)",
            // "Good luck with that!"
        ]);
        // Conversation over, back in vicinity of Earth.
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Go to the moon.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Moon");
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        // Land on the moon.
        var placeOrbit = place();
        placeOrbit.land(universe);
        universe.updateForTimerTick();
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, world);
        // Go to the enemy base.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Base");
        // It's empty.  The lander should report and return to the ship automatically.
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        // Leave lunar orbit.
        this.playFromStart_LeavePlanetOrbitAndWait(universe);
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Return to the station.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, stationName);
        this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        // Talk to the commander again.
        station = place().entityByName(stationName);
        talker = station.talker();
        this.playFromStart_TalkToTalker(universe, talker, [
            // "Did you handle the base?",
            "#(base_was_abandoned)"
            // "Well, I'll be darn--INCOMING HOSTILE SHIP!  They're jamming our signal!"
        ]);
        // todo - Now you're talking to the hostile ship.  Somehow
        // todo - Talk with them.
        // todo - Battle with them.
        universe.updateForTimerTick();
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Leave the Sol system and go to hyperspace.
        this.playFromStart_LeavePlanetVicinityAndWait(universe);
        this.playFromStart_LeaveStarsystemAndWait(universe);
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
        // Wait to be accosted by a probe.
        this.playFromStart_WaitForTicks(universe, 1000);
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        var placeEncounter = place();
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
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceCombat.name, world);
        // Destroy the probe (by cheating, in this test).
        var placeCombat = place();
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
        // Verify that we're seeing a post-battle debriefing screen.
        this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        var creditBefore = player.resourceCredits;
        var venueControls = venue();
        var containerChoice = venueControls.controlRoot;
        var buttonAcknowledge = containerChoice.childByName("buttonAcknowledge");
        buttonAcknowledge.click();
        this.playFromStart_WaitForTicks(universe, 100);
        // Verify that resources were salvaged from destroyed ship.
        var creditAfter = player.resourceCredits;
        Assert.isTrue(creditAfter > creditBefore);
        // Verify that we're back in hyperspace.
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
        // Cheat and jump to the Groombridge system,
        // in order to find a rainbow world,
        // in order to have some info to sell to the traders.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Groombridge");
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        var rainbowWorldLocationsKnownButUnsoldCount = player.rainbowWorldLocationsKnownButUnsoldCount();
        Assert.areNumbersEqual(0, rainbowWorldLocationsKnownButUnsoldCount);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Groombridge I");
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Planet");
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        placeOrbit = place();
        var planet = placeOrbit.planet;
        Assert.areStringsEqual("Rainbow", planet.defnName);
        var rainbowWorldLocationsKnownButUnsoldCount = player.rainbowWorldLocationsKnownButUnsoldCount();
        Assert.areNumbersEqual(1, rainbowWorldLocationsKnownButUnsoldCount);
        placeOrbit.returnToPlaceParent(universe);
        universe.updateForTimerTick();
        this.playFromStart_LeavePlanetVicinityAndWait(universe);
        this.playFromStart_LeaveStarsystemAndWait(universe);
        // Go to the Alpha Centauri starsystem, the nearest supergiant to Sol.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, "Alpha Centauri");
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        // Look for a trader ship, in the main starsystem and in each planet vicinity.
        var placeStarsystem = place();
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
        Assert.isNotNull(shipGroupMurch);
        // Move to the trader's ship and start an encouter.
        this.playFromStart_MoveToEntityWithNameAndWait(universe, shipGroupMurch.name);
        this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        // Talk to the traders.
        placeEncounter = place();
        placeEncounter.encounter.talk(universe);
        universe.updateForTimerTick();
        var encounter = placeEncounter.encounter;
        var entityOther = encounter.entityOther;
        talker = entityOther.talker();
        this.playFromStart_TalkToTalker(universe, talker, [
            "#(how_know)", // "How did you know about us before meeting us?"
            "#(get_on_with_business)", // "Shall we begin trading now?"
            "#(why_turned_purple)", // "Why did your bridge turn purple?"
            "#(sell)", // "I have some things I would like to sell."
        ]);
        Assert.isTrue(true);
        // Gather resources.
        // Gather lifeforms.
        // Return to Earth station.
        callback();
    }
    playFromStart_AssertPlaceCurrentIsOfTypeForWorld(placeTypeNameExpected, world) {
        var place = world.placeCurrent;
        var placeTypeName = place.constructor.name;
        Assert.areStringsEqual(placeTypeNameExpected, placeTypeName);
    }
    playFromStart_AssertVenueCurrentIsOfTypeForUniverse(venueTypeNameExpected, universe) {
        var venue = universe.venueCurrent();
        var venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(venueTypeNameExpected, venueTypeName);
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
    playFromStart_LeavePlanetOrbitAndWait(universe) {
        var world = universe.world;
        var place = world.placeCurrent;
        var placeOrbit = place;
        placeOrbit.returnToPlaceParent(universe);
        universe.updateForTimerTick();
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
        this.playFromStart_WaitForTicks(universe, 10); // hack - Exactly how long is necessary?
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
        this.playFromStart_WaitForTicks(universe, 30);
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
                var optionFound = conversationRun.optionSelectByName(optionToSelect);
                if (optionFound == null) {
                    throw new Error("No option found with name: " + optionToSelect);
                }
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
