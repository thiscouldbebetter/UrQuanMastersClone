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
        var place = () => world.placeCurrent;
        var starsystemSol = place().starsystem;
        Assert.areStringsEqual("Sol", starsystemSol.name);
        this.waitForTicks(universe, 5);
        var planetEarthName = "Earth";
        var planetEarth = place().entityByName(planetEarthName);
        Assert.isNotNull(planetEarth);
        var playerEntity = place().entityByName(Player.name);
        Assert.isNotNull(playerEntity);
        // Move the player's ship to Earth.
        this.moveToEntityWithNameAndWait(universe, planetEarthName);
        // Make sure the place transitions to a planet vicinity.
        // todo
        // This sometimes fails the assert, perhaps because the guard drone,
        // which is perhaps randomly placed within the planet vicinity,
        // accosts the player before the player is done waiting.
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Verify that a guard drone is present.
        var guardDroneName = "LahkemupGuardDrone";
        var guardDrone = place().entityByName(guardDroneName);
        Assert.isNotNull(guardDrone);
        // Wait for the guard drone to approach the player
        // and initiate a conversation.
        // Note that sometimes this fails, for currently unknown reasons.
        this.waitForTicks(universe, 1000);
        this.assertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        // Leave the conversation.
        var talker = place().encounter.entityOther.talker();
        this.talkToTalker(universe, talker, [
            "SayNothing" // It's a recording.
        ]);
        // The "conversation" is over; verify that we're back in the world venue.
        this.assertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Wait for the guard drone to clear the area,
        // and verify that it's gone.
        this.waitForTicks(universe, 1000);
        guardDrone = place().entityByName(guardDroneName);
        Assert.isNull(guardDrone);
        // Move the player to the station.
        var stationName = "Earth Station";
        var station = place().entityByName(stationName);
        Assert.isNotNull(station);
        this.moveToEntityWithNameAndWait(universe, stationName);
        // hack - Should this be necessary?
        this.waitForTicks(universe, 100);
        // Talk to the station.
        this.assertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        talker = station.talker();
        this.talkToTalker(universe, talker, [
            // "Are you the resupply ship?" 
            "#(no_but_well_help)",
            // "We need radioactives."
            "#(well_go_get_them_now)"
            // "Thanks."
        ]);
        // The converation is over; verify that we're back in the world.
        this.assertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);
        // Move the player beyond the edge of the screen to exit the planet vicinity.
        this.leavePlanetVicinityAndWait(universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        // Instead of going to Mercury, go to Venus (an honest mistake).
        // Then go back to Earth immediately, without the needed radioactives.
        this.moveToEntityWithNameAndWait(universe, "Venus");
        this.leavePlanetVicinityAndWait(universe);
        this.moveToEntityWithNameAndWait(universe, planetEarthName);
        this.moveToEntityWithNameAndWait(universe, stationName);
        // Talk to the station, and verify that the option to transfer radioactives isn't available.
        var placeEncounter = place();
        station = placeEncounter.entityByName(stationName);
        talker = station.talker();
        var conversationRun = talker.conversationRun;
        conversationRun.nextUntilPrompt(universe);
        var optionsAvailable = conversationRun.optionsAvailable();
        var optionToTransferRadioactivesIsAvailable = optionsAvailable.some(x => x.name == "#(we_will_transfer_now)");
        Assert.isFalse(optionToTransferRadioactivesIsAvailable);
        this.talkToTalker(universe, talker, [
            "#(well_go_get_them_now2)"
        ]);
        // Exit the planet vicinity again.
        this.leavePlanetVicinityAndWait(universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        // Move the player to Mercury.
        this.moveToEntityWithNameAndWait(universe, "Mercury");
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Orbit the planet.
        this.moveToEntityWithNameAndWait(universe, Planet.name);
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        // Verify that the cargo hold contains no radioactives.
        var player = world.player;
        var flagship = player.flagship;
        var flagshipItemHolderCargo = flagship.itemHolderCargo;
        var itemDefnNameRadioactives = "Radioactives";
        var radioactivesHeld = flagshipItemHolderCargo.itemsByDefnName(itemDefnNameRadioactives)[0];
        Assert.areNumbersEqual(0, radioactivesHeld.quantity);
        // Land on the planet.
        this.landOnPlanetSurface(universe, world, place());
        // Pick up enough resources to be sure to get the radioactives.
        var resourcesToGatherCount = 6;
        for (var i = 0; i < resourcesToGatherCount; i++) {
            this.moveToEntityWithNameAndWait_CheckPartial(universe, Resource.name, true);
        }
        // Launch and return to the ship in orbit.
        this.returnToOrbit(universe, world, place());
        // Verify that the cargo holds now contains some radioactives.
        var radioactivesHeld = flagshipItemHolderCargo.itemByDefnName(itemDefnNameRadioactives);
        Assert.isTrue(radioactivesHeld.quantity > 0);
        // Exit Mercury orbit.
        this.leavePlanetOrbitAndWait(universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Leave the Mercury vicinity and return to the Earth Station.
        this.leavePlanetVicinityAndWait(universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        this.moveToEntityWithNameAndWait(universe, planetEarthName);
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        this.moveToEntityWithNameAndWait(universe, stationName);
        this.assertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        // Talk to the station commander.
        var placeEncounter = place();
        station = placeEncounter.entityByName(stationName);
        talker = station.talker();
        var radioactivesHeldBefore = flagshipItemHolderCargo.itemByDefnName(itemDefnNameRadioactives).quantity;
        this.talkToTalker(universe, talker, [
            // "Do you have the radioactives?"
            "#(we_will_transfer_now)",
            // "Our sensors are coming online... WHO ARE YOU?!"
        ]);
        // Make sure that the correct amount of radioactives was actually transferred.
        var radioactivesHeldAfter = flagshipItemHolderCargo.itemByDefnName(itemDefnNameRadioactives).quantity;
        var radioactivesTransferred = radioactivesHeldBefore - radioactivesHeldAfter;
        Assert.areNumbersEqual(1, radioactivesTransferred);
        this.talkToTalker(universe, talker, [
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
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Go to the moon.
        this.moveToEntityWithNameAndWait(universe, "Moon");
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        // Land on the moon.
        this.landOnPlanetSurface(universe, world, place());
        // Go to the enemy base.
        this.moveToEntityWithNameAndWait(universe, "AbandonedMoonbase");
        // It's empty.  The lander should display a report message, which must be acknowledged...
        this.acknowledgeMessage(universe);
        universe.updateForTimerTick();
        // ...and then return to the ship automatically.
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        // Leave lunar orbit.
        this.waitForTicks(universe, 100);
        this.leavePlanetOrbitAndWait(universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Verify that the guard drone doesn't spontaneously reappear.
        var guardDrone = place().entityByName(guardDroneName);
        Assert.isNull(guardDrone);
        // Return to the station.
        this.moveToEntityWithNameAndWait(universe, stationName);
        this.assertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        // Make sure that the station encounter's placeToReturnTo is right.
        var placeEncounterStation = place();
        var placeToReturnToAfterStation = placeEncounterStation.encounter.placeToReturnTo;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeToReturnToAfterStation.constructor.name);
        // Talk to the commander again.
        station = placeEncounter.entityByName(stationName);
        talker = station.talker();
        this.talkToTalker(universe, talker, [
            // "Did you handle the base?",
            "#(base_was_abandoned)"
            // "Well, I'll be--INCOMING HOSTILE SHIP!  They're jamming our signal!"
        ]);
        // Make sure that the hostile encounter's placeToReturnTo is right.
        var placeEncounterHostile = place();
        var placeToReturnToAfterHostileEncounter = placeEncounterHostile.encounter.placeToReturnTo;
        Assert.areStringsEqual(placeEncounterStation.name, placeToReturnToAfterHostileEncounter.name);
        // Now you're talking to the hostile ship.
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        placeEncounter = place();
        var encounter = placeEncounter.encounter;
        var factionHostileName = "Raknoid";
        Assert.areStringsEqual(factionHostileName, encounter.factionName);
        var entityHostile = encounter.entityOther;
        var talker = entityHostile.talker();
        var uwpe = UniverseWorldPlaceEntities.fromUniverseAndWorld(universe, world);
        talker.talk(uwpe);
        this.talkToTalker(universe, talker, [
            // "A human in an alien vessel!"
            "#(where_you_come_from)", // "Where did you come from?"
            // "From fighting in such-and-such star cluster."
            "#(be_reasonable)"
            // "We aren't reasonable, though." [Attacks.]
        ]);
        Assert.areNumbersEqual(0, flagship.resourceCredits);
        this.cheatToWinCombat(universe);
        // Verify that the ship had some salvage value.
        var factionHostile = world.faction(factionHostileName);
        var hostileShipSalvageValue = factionHostile.shipDefn(world).salvageValue;
        Assert.areNumbersEqual(hostileShipSalvageValue, flagship.resourceCredits);
        //universe.updateForTimerTick();
        // Verify that we've returned to the original encounter,
        // and that, when it's over, it's set to return to the planet vicinity,
        // rather than to, say, the hostile encounter.
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        encounter = place().encounter;
        var placeToReturnToTypeName = encounter.placeToReturnTo.constructor.name;
        Assert.areStringsEqual(PlacePlanetVicinity.name, placeToReturnToTypeName);
        talker = station.talker();
        this.talkToTalker(universe, talker, [
            // "You won!  We're in.  What now?"
            "#(annihilate_those_monsters)", // But actually [sensible plan].
            // "Sounds like a sensible plan.  What do we call our alliance?"
            "#(name_1)", // "The New Alliance of Free Stars!"
            // "Great.  Give us two weeks."
            null // "[Wait two weeks...]"
        ]);
        // Verify that we've switched to a different conversation mode.
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        // Now we can get down to business.
        placeEncounter = place();
        encounter = placeEncounter.encounter;
        var faction = encounter.faction(world);
        Assert.areStringsEqual("Conversation-Terran-Business", faction.conversationDefnName);
        talker = encounter.entityOther.talker();
        var resourceCreditsBefore = flagship.resourceCredits;
        this.talkToTalker(universe, talker, [
            // "Starbase is up and running."
            "#(have_minerals)", // "Commander, I have minerals to offload.",
            // [breakdown of minerals]
        ]);
        var resourceCreditsAfter = flagship.resourceCredits;
        var resourceCreditsPaid = resourceCreditsAfter - resourceCreditsBefore;
        Assert.isTrue(resourceCreditsPaid > 0);
        this.talkToTalker(universe, talker, [
            // [breakdown of minerals]
            "#(goodbye_commander)"
        ]);
        // Verify that we've returned to the world.
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        // Leave the Sol system and go to hyperspace.
        this.leavePlanetVicinityAndWait(universe);
        this.leaveStarsystemAndWait(universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
        // Verify that a probe is present.
        var entityProbe = place().entityByName("Tempestrial Ship Group X");
        Assert.isNotNull(entityProbe);
        // Wait to be accosted by a probe.
        this.waitForTicks(universe, 1000);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        var placeEncounter = place();
        placeEncounter.encounter.talk(universe);
        universe.updateForTimerTick();
        // Talk to the probe.
        var encounter = placeEncounter.encounter;
        var entityOther = encounter.entityOther;
        talker = entityOther.talker();
        this.talkToTalker(universe, talker, [null] // Doesn't matter what you say.
        );
        // The probe attacks.
        // Make a record of how much money we had before blowing up a ship and salvaging the wreckage.
        var creditBefore = flagship.resourceCredits;
        // Destroy the probe (by cheating, in this test).
        this.cheatToWinCombat(universe);
        // Verify that resources were salvaged from destroyed ship.
        var creditAfter = flagship.resourceCredits;
        Assert.isTrue(creditAfter > creditBefore);
        // Verify that we're back in hyperspace.
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
        // Go to the Alpha Centauri starsystem, the nearest supergiant to Sol.
        var starsystemWithMerchantsName = "Alpha Centauri";
        this.moveToEntityWithNameAndWait(universe, starsystemWithMerchantsName);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        // Look for a trader ship, in the main starsystem and in each planet vicinity.
        var placeStarsystem = place();
        var starsystem = placeStarsystem.starsystem;
        var factionMerchantsName = world.factionByName("Murch").name;
        this.moveToShipGroupBelongingToFactionIfAny(universe, world, starsystem, factionMerchantsName);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
        // Talk to the traders.
        this.talkToTalker2(universe, [
            // "Hello!  We knew of you before your arrival."
            "#(how_know)", // "How did you know about us before meeting us?"
            // "We have mysterious sources."
            "#(get_on_with_business)", // "Shall we begin trading now?"
            // "Sure."
            "#(why_turned_purple)", // "Why did your bridge turn purple?"
            // "A good question with an unaffordably expensive answer."
            "#(sell)", // "I have some things I would like to sell."
            // "Unfortunately, you have nothing we wish to buy."
            "#(buy)", // "Okay, then, I'd like to buy something."
            // "You don't have any credit.  We buy the following info..."
            "#(be_leaving_now)"
            // "Goodbye."
        ]);
        // Go gather some lifeforms to sell.
        this.goToSurfaceOfPlanetWithName(universe, "Delta Centauri II-a"); // 186 biodata units, hazard level 5/8.
        var placePlanetSurface = place();
        var entitiesOnPlanet = placePlanetSurface.entitiesAll();
        var entitiesLifeforms = entitiesOnPlanet.filter(x => x.name.startsWith(Lifeform.name));
        Assert.isTrue(entitiesLifeforms.length > 0);
        var flagshipItemHolderOther = flagship.itemHolderOther;
        var biodataBeforeGatheringLifeforms = flagshipItemHolderOther.encumbranceOfAllItems(world);
        Assert.areNumbersEqual(0, biodataBeforeGatheringLifeforms);
        var infoCreditsBeforeSellingLifeforms = flagship.infoCredits;
        Assert.areNumbersEqual(0, infoCreditsBeforeSellingLifeforms);
        // Make the lander unkillable (though the crew can still be killed),
        // and then record the crew count
        // and contents of the cargo hold before touching any lifeforms.
        var entityLander = entitiesOnPlanet.find(x => x.name == Player.name);
        var entityLanderKillable = entityLander.killable();
        entityLanderKillable.deathIsIgnoredSet(true); // Cheat!
        var lander = Lander.fromEntity(entityLander);
        var landerItemHolderLifeforms = lander.itemHolderLifeforms;
        var landerEncumbranceBeforeGatheringLifeforms = landerItemHolderLifeforms.encumbranceOfAllItems(world);
        var landerCrewCountBeforeTouchingLifeforms = entityLanderKillable.integrity;
        // Move to a conscious, dangerous lifeform.
        var entityLifeformDangerous = entitiesLifeforms.find(x => Lifeform.fromEntity(x).defn(world).damagePerAttack > 0);
        Assert.isNotNull(entityLifeformDangerous);
        this.moveToEntityWithNameAndWait(universe, entityLifeformDangerous.name);
        // Verify that the lifeform was not picked up, and that some crew was killed.
        var landerEncumbranceAfterMovingOntoConsciousLifeform = landerItemHolderLifeforms.encumbranceOfAllItems(world);
        Assert.areNumbersEqual(landerEncumbranceBeforeGatheringLifeforms, landerEncumbranceAfterMovingOntoConsciousLifeform);
        var landerCrewCountAfterTouchingDangerousLifeform = entityLanderKillable.integrity;
        var crewLost = landerCrewCountBeforeTouchingLifeforms
            - landerCrewCountAfterTouchingDangerousLifeform;
        console.log("crewLost = " + crewLost);
        //Assert.isTrue(crewLost > 0);// todo - This isn't dependable.
        // Make sure that, before any creatures are stunned,
        // that there are no "biodata" resources on the planet.
        var resourceDefns = ResourceDefn.Instances();
        var resourceDefnBiodata = resourceDefns.Biodata;
        var entitiesResourcesBiodata = entitiesOnPlanet
            .filter(x => Resource.fromEntity(x) != null)
            .filter(x => Resource.fromEntity(x).defnName == resourceDefnBiodata.name);
        Assert.isEmpty(entitiesResourcesBiodata);
        // Gather up all the lifeforms.
        for (var i = 0; i < entitiesLifeforms.length; i++) {
            var entity = entitiesLifeforms[i];
            // Cheat: kill (well, stun) them all!
            entity.killable().kill();
            // this.moveToEntityWithNameAndWait(universe, entity.name);
        }
        this.waitForTicks(universe, 10);
        // Verify that the conscious lifeforms have been replaced with biodata resources.
        var entitiesResourcesBiodata = entitiesOnPlanet
            .filter(x => Resource.fromEntity(x) != null)
            .filter(x => Resource.fromEntity(x).defnName == resourceDefnBiodata.name);
        Assert.isNotEmpty(entitiesResourcesBiodata);
        Assert.areNumbersEqual(entitiesLifeforms.length, entitiesResourcesBiodata.length);
        // Pick up all the biodata.
        // todo - Check for maximum capacity.
        for (var i = 0; i < entitiesResourcesBiodata.length; i++) {
            var entity = entitiesResourcesBiodata[i];
            try {
                this.moveToEntityWithNameAndWait(universe, entity.name);
            }
            catch (err) {
                // Errors may be happening because some resources overlap,
                // and are thus picked up by accident when picking up some other resource.
            }
        }
        var landerEncumbranceAfterMovingOntoStunnedLifeforms = landerItemHolderLifeforms.encumbranceOfAllItems(world);
        var biodataGathered = landerEncumbranceAfterMovingOntoStunnedLifeforms
            - landerEncumbranceBeforeGatheringLifeforms;
        Assert.isTrue(biodataGathered > 0);
        // Return to orbit, and verify that the biodata was offloaded from the lander.
        this.returnToOrbit(universe, world, place());
        var biodataAfterGatheringLifeforms = flagshipItemHolderOther.encumbranceOfAllItems(world);
        Assert.isTrue(biodataAfterGatheringLifeforms > biodataBeforeGatheringLifeforms);
        // Go to another supergiant starsystem containing the merchants,
        // then find the merchants and engage with them.
        var starsystemToGoToName = "Zeeman";
        this.goToStarsystemWithName(universe, starsystemToGoToName);
        this.moveToShipGroupBelongingToFactionIfAny(universe, world, starsystem, factionMerchantsName);
        this.talkToTalker2(universe, [
            // "Hello.  Shall we get down to business?"
            "#(sell)", // I have some items I'd like to sell.
            // "What would you like to sell?"
            "#(sell_life_data)", // "Biodata."
            // "We'll buy your biodata for this amount."
            "#(whats_my_credit)",
            // "Your credit is this."
            "#(buy)", // "I'd like to buy something."
            // "What would you like to buy?"
            "#(buy_fuel)", // "Fuel."
            // "How much fuel?"
            "#(fill_me_up)", // Fill me up.
            // "Fuel transferred." 
            // (And it's assumed you don't want any more fuel.)
            // "What else would you like to buy?"
            "#(done_buying)",
            // "Anything else?"
            "#(be_leaving_now)"
            // "Goodbye."
        ]);
        // Go to a system containing a rainbow world,
        // in order to have some more info to sell to the traders.
        var starsystemWithRainbowWorldName = "Gamma Kepler"; // Or Groombridge.
        this.goToStarsystemWithName(universe, starsystemWithRainbowWorldName);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
        var rainbowWorldLocationsKnownButUnsoldCount = player.rainbowWorldLocationsKnownButUnsoldCount();
        Assert.areNumbersEqual(0, rainbowWorldLocationsKnownButUnsoldCount);
        this.moveToEntityWithNameAndWait(universe, starsystemWithRainbowWorldName + " I");
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);
        this.moveToEntityWithNameAndWait(universe, Planet.name);
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        var placeOrbit = place();
        var planet = placeOrbit.planet;
        Assert.areStringsEqual("Rainbow", planet.defnName);
        var rainbowWorldLocationsKnownButUnsoldCount = player.rainbowWorldLocationsKnownButUnsoldCount();
        Assert.areNumbersEqual(1, rainbowWorldLocationsKnownButUnsoldCount);
        // It won't be possible to sell the location at a supergiant without going backwards,
        // so instead go forward to pick up a hyperwave caster.
        var deviceTtorstingCasterName = "TtorstingCaster";
        var planetWithTtorstingCaster = "Arcturus I-a";
        this.goToSurfaceOfPlanetWithName(universe, planetWithTtorstingCaster);
        this.assertPlaceCurrentIsOfTypeForWorld(placePlanetSurface.name, world);
        this.moveToEntityWithNameAndWait(universe, deviceTtorstingCasterName);
        this.acknowledgeMessage(universe);
        // Acknowledging the message returns the lander to orbit automatically.
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
        // Check to see that the caster is now on board the flagship.
        throw new Error("todo");
        // Call the merchants with the caster.
        this.goToHyperspace(universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
        flagship.deviceWithNameUse(deviceTtorstingCasterName);
        var infoCreditsBeforeSaleOfRainbowWorldLocation = flagship.infoCredits;
        // Sell it.
        var rainbowWorldLocationsKnownButUnsoldCount = player.rainbowWorldLocationsKnownButUnsoldCount();
        Assert.areNumbersEqual(0, rainbowWorldLocationsKnownButUnsoldCount);
        var infoCreditsAfterSaleOfRainbowWorldLocation = flagship.infoCredits;
        var infoCreditsFromSaleOfRainbowWorldLocation = infoCreditsAfterSaleOfRainbowWorldLocation
            - infoCreditsBeforeSaleOfRainbowWorldLocation;
        Assert.areNumbersEqual(500, infoCreditsFromSaleOfRainbowWorldLocation);
        // Gather resources.
        // Gather lifeforms.
        // Return to Earth station.
        callback();
    }
    acknowledgeMessage(universe) {
        this.assertVenueCurrentIsOfTypeForUniverse(VenueMessage.name, universe);
        var venueMessage = universe.venueCurrent();
        var world = universe.world;
        var place = world.place();
        var uwpe = new UniverseWorldPlaceEntities(universe, world, place, null, null);
        venueMessage.acknowledge(uwpe);
    }
    assertPlaceCurrentIsOfTypeForWorld(placeTypeNameExpected, world) {
        var place = world.placeCurrent;
        var placeTypeName = place.constructor.name;
        Assert.areStringsEqual(placeTypeNameExpected, placeTypeName);
    }
    assertVenueCurrentIsOfTypeForUniverse(venueTypeNameExpected, universe) {
        var venue = universe.venueCurrent();
        var venueTypeName = venue.constructor.name;
        Assert.areStringsEqual(venueTypeNameExpected, venueTypeName);
    }
    cheatToWinCombat(universe) {
        universe.updateForTimerTick();
        var world = universe.world;
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceCombat.name, world);
        var placeCombat = world.placeCurrent;
        var combat = placeCombat.combat;
        var shipGroupForPlayer = combat.shipGroups[0];
        var shipForPlayer = shipGroupForPlayer.ships[0];
        combat.shipsFighting[0] = shipForPlayer;
        combat.fight(universe);
        this.waitForTicks(universe, 100);
        var shipEnemy = combat.shipsFighting[1];
        var shipEnemyAsEntity = placeCombat.entityByName(shipEnemy.name);
        shipEnemyAsEntity.killable().kill();
        this.waitForTicks(universe, 100);
        // Verify that we're seeing a post-battle debriefing screen.
        this.assertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
        var venue = universe.venueCurrent();
        var venueControls = venue;
        var containerChoice = venueControls.controlRoot;
        var buttonAcknowledge = containerChoice.childByName("buttonAcknowledge");
        buttonAcknowledge.click();
        this.waitForTicks(universe, 100);
    }
    findEntityWithName(universe, targetEntityName, partialMatchAllowed) {
        var entityFound = partialMatchAllowed
            ? this.findEntityWithNamePartial(universe, targetEntityName)
            : this.findEntityWithNameExact(universe, targetEntityName);
        return entityFound;
    }
    findEntityWithNameExact(universe, targetEntityName) {
        var place = universe.world.placeCurrent;
        var targetFound = place.entityByName(targetEntityName);
        if (targetFound == null) {
            var placeEntities = place.entitiesAll();
            targetFound =
                placeEntities.find((x) => (x.name == targetEntityName));
        }
        return targetFound;
    }
    findEntityWithNamePartial(universe, targetEntityName) {
        var place = universe.world.placeCurrent;
        var targetFound = place.entityByName(targetEntityName);
        if (targetFound == null) {
            var placeEntities = place.entitiesAll();
            targetFound =
                placeEntities.find((x) => x.name.startsWith(targetEntityName));
        }
        return targetFound;
    }
    goToHyperspace(universe) {
        // todo - Leave the planet surface?
        this.leavePlanetOrbitAndWait(universe);
        this.leavePlanetVicinityAndWait(universe);
        this.leaveStarsystemAndWait(universe);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, universe.world);
    }
    goToOrbitOfPlanetWithName(universe, planetName) {
        this.goToVicinityOfPlanetWithName(universe, planetName);
        if (planetName.split("-").length == 1) {
            // Consider: "Earth", "Moon", "Alpha Centauri I", "Alpha Centauri I-a", "Arcturus I", "Arcturus I-a"
            planetName = Planet.name;
        }
        this.moveToEntityWithNameAndWait(universe, planetName);
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, universe.world);
    }
    goToStarsystemWithName(universe, starsystemName) {
        this.goToHyperspace(universe);
        this.moveToEntityWithNameAndWait(universe, starsystemName);
        this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, universe.world);
        var starsystemActual = universe.world.place().starsystem;
        Assert.areStringsEqual(starsystemName, starsystemActual.name);
    }
    goToSurfaceOfPlanetWithName(universe, planetName) {
        this.goToOrbitOfPlanetWithName(universe, planetName);
        this.landOnPlanetSurface(universe, universe.world, universe.world.placeCurrent);
    }
    goToVicinityOfPlanetWithName(universe, planetName) {
        if (planetName.indexOf("-") >= 0) {
            // It's a moon.
            planetName = planetName.split("-")[0];
        }
        var starsystemName = planetName.substr(0, planetName.lastIndexOf(" "));
        this.goToStarsystemWithName(universe, starsystemName);
        this.moveToEntityWithNameAndWait(universe, planetName);
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, universe.world);
    }
    landOnPlanetSurface(universe, world, place) {
        var placeOrbit = place;
        placeOrbit.land(universe);
        universe.updateForTimerTick();
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, world);
    }
    leavePlanetOrbitAndWait(universe) {
        var world = universe.world;
        var place = world.placeCurrent;
        if (place.constructor.name == PlacePlanetOrbit.name) {
            var placeOrbit = place;
            placeOrbit.returnToPlaceParent(universe);
            universe.updateForTimerTick();
        }
    }
    leavePlanetVicinityAndWait(universe) {
        var placeCurrent = universe.world.place();
        if (placeCurrent.constructor.name == PlacePlanetVicinity.name) {
            this.leavePlanetVicinityOrStarsystem(universe);
            // hack - Is this necessary?
            // Some delay may be needed to wait for the fader to finish fading.
            // The way the test is set up, this wait requires some fine-tuning.
            this.waitForTicks(universe, 10); // 250); 
        }
    }
    leavePlanetVicinityOrStarsystem(universe) {
        var place = universe.world.placeCurrent;
        var player = place.entityByName(Player.name);
        var playerPos = player.locatable().loc.pos;
        var placeSize = place.size();
        playerPos.overwriteWith(placeSize).double();
    }
    leaveStarsystemAndWait(universe) {
        var placeCurrent = universe.world.place();
        if (placeCurrent.constructor.name == PlaceStarsystem.name) {
            this.leavePlanetVicinityOrStarsystem(universe);
            this.waitForTicks(universe, 10); // hack - Exactly how long is necessary?
        }
    }
    moveToEntityWithNameAndWait(universe, targetEntityName) {
        return this.moveToEntityWithNameAndWait_CheckPartial(universe, targetEntityName, false);
    }
    moveToEntityWithNameAndWait_CheckPartial(universe, targetEntityName, partialMatchAllowed) {
        // This is pretty cheaty right now.  The player just teleports directly to the desired position.
        var place = universe.world.placeCurrent;
        var placeTypeName = place.constructor.name;
        var entityPlayer = place.entityByName(Player.name);
        var playerPos = entityPlayer.locatable().loc.pos;
        var target = this.findEntityWithName(universe, targetEntityName, partialMatchAllowed);
        if (target == null) {
            throw new Error("No entity was found matching the name '" + targetEntityName + "'.");
        }
        else {
            var targetPos = target.locatable().loc.pos;
            if (placeTypeName == PlaceHyperspace.name) {
                // These measurements are in pixels.
                var displacementFromPlayerToTarget = targetPos.clone().subtract(playerPos);
                var distanceFromPlayerToTarget = displacementFromPlayerToTarget.magnitude();
                // Per the Star Control Wiki:
                // "To travel the entire length of one axis [...] requires exactly 100.0 units of fuel.
                // And this game's version of hyperspace is 10,000 pixels across.
                var pixelsPerFuelUnit = 100;
                var fuelUnitsNeeded = distanceFromPlayerToTarget / pixelsPerFuelUnit;
                var world = universe.world;
                var flagship = world.player.flagship;
                var fuelUnitsHeld = flagship.fuel;
                if (fuelUnitsHeld < fuelUnitsNeeded) {
                    console.log("Not enough fuel!");
                    var directionFromPlayerToTarget = displacementFromPlayerToTarget.normalize();
                    var displacementUntilFuelRunsOut = directionFromPlayerToTarget.multiplyScalar(fuelUnitsHeld * pixelsPerFuelUnit);
                    targetPos = playerPos.add(displacementUntilFuelRunsOut);
                    fuelUnitsNeeded = fuelUnitsHeld;
                }
                flagship.fuelSubtract(fuelUnitsNeeded);
            }
            playerPos.overwriteWith(targetPos);
        }
        // hack - How long is necessary to wait?
        // 30 seems to work most of the time,
        // but sometimes results in the guard drone accosting the player too soon
        // at the game's start.
        // Maybe there is no correct answer in all cases!
        this.waitForTicks(universe, 20);
    }
    moveToShipGroupBelongingToFactionIfAny(universe, world, starsystem, factionName) {
        var shipGroupsInStarsystemAtLarge = starsystem.shipGroups(world);
        var shipGroupBelongingToFaction = shipGroupsInStarsystemAtLarge.find(x => x.factionName == factionName);
        if (shipGroupBelongingToFaction == null) {
            var planets = starsystem.planets;
            for (var i = 0; i < planets.length; i++) {
                var planet = planets[i];
                var planetShipGroups = planet.shipGroups();
                shipGroupBelongingToFaction = planetShipGroups.find(x => x.factionName == factionName);
                if (shipGroupBelongingToFaction != null) {
                    this.moveToEntityWithNameAndWait(universe, planet.name);
                    break;
                }
            }
        }
        Assert.isNotNull(shipGroupBelongingToFaction);
        // Move to the ship and start an encounter (or, if friendly, just a talk).
        this.moveToEntityWithNameAndWait(universe, shipGroupBelongingToFaction.name);
    }
    returnToOrbit(universe, world, place) {
        var placeSurface = place;
        placeSurface.exit(new UniverseWorldPlaceEntities(universe, world, placeSurface, null, null));
        universe.updateForTimerTick();
        this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
    }
    talkToTalker(universe, talker, optionsToSelect) {
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
        universe.updateForTimerTick();
    }
    talkToTalker2(universe, optionsToSelect) {
        var placeEncounter = universe.world.place();
        placeEncounter.encounter.talk(universe);
        universe.updateForTimerTick();
        var encounter = placeEncounter.encounter;
        var entityOther = encounter.entityOther;
        var talker = entityOther.talker();
        this.talkToTalker(universe, talker, optionsToSelect);
    }
    waitForTicks(universe, ticksToWait) {
        for (var i = 0; i < ticksToWait; i++) {
            universe.updateForTimerTick();
            universe.timerHelper.ticksSoFar++; // hack
        }
    }
}
