
class SystemTests extends TestFixture
{
	constructor()
	{
		super(SystemTests.name);
	}

	tests(): ( (callback: () => void) => void )[]
	{
		var returnTests =
		[
			this.playFromStart
		];

		return returnTests;
	}

	// Tests.

	playFromStart(callback: () => void ): void
	{
		// todo
		var environment = new EnvironmentMock();
		environment.universeBuild
		(
			(u: Universe) =>
			{
				u.initialize
				(
					() => this.playFromStart_UniverseInitialized(callback, u)
				)
			}
		);
	}

	playFromStart_UniverseInitialized(callback: () => void, universe: Universe): void
	{
		Assert.isNotNull(universe);

		var world = universe.world as WorldExtended;
		var venueWorld = world.toVenue();
		universe.venueNextSet(venueWorld);

		var place = () => world.placeCurrent;

		var starsystemSol = (place() as PlaceStarsystem).starsystem;
		Assert.areStringsEqual("Sol", starsystemSol.name);

		this.playFromStart_WaitForTicks(universe, 5);

		var planetEarth = place().entityByName("Earth");
		Assert.isNotNull(planetEarth);

		var playerEntity = place().entityByName(Player.name);
		Assert.isNotNull(playerEntity);

		// Move the player's ship to Earth.

		this.playFromStart_MoveToEntityWithNameAndWait(universe, "Earth");

		// Make sure the place transitions to a planet vicinity.

		// todo
		// This sometimes fails the assert, perhaps because the guard drone,
		// which is perhaps randomly placed within the planet vicinity,
		// accosts the player before the player is done waiting.
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Verify that a guard drone is present.

		var guardDroneName = "LahkemupGuardDrone";
		var guardDrone = place().entityByName(guardDroneName);
		Assert.isNotNull(guardDrone);

		// Wait for the guard drone to approach the player
		// and initiate a conversation.

		this.playFromStart_WaitForTicks(universe, 1000);
		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		// Leave the conversation.

		var talker = (place() as PlaceEncounter).encounter.entityOther.talker();
		this.playFromStart_TalkToTalker
		(
			universe,
			talker,
			[
				"SayNothing" // It's a recording.
			]
		);

		// The "conversation" is over; verify that we're back in the world venue.
		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Wait for the guard drone to clear the area,
		// and verify that it's gone.

		this.playFromStart_WaitForTicks(universe, 1000);
		guardDrone = place().entityByName(guardDroneName);
		Assert.isNull(guardDrone);

		// Move the player to the station.

		var stationName = "Earth Station";
		var station = place().entityByName(stationName);
		Assert.isNotNull(station);

		this.playFromStart_MoveToEntityWithNameAndWait(universe, stationName);

		// hack - Should this be necessary?
		this.playFromStart_WaitForTicks(universe, 100);

		// Talk to the station.

		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);

		talker = station.talker();
		this.playFromStart_TalkToTalker
		(
			universe,
			talker,
			[
				// "Are you the resupply ship?" 
				"#(no_but_well_help)",
				// "We need radioactives."
				"#(well_go_get_them_now)"
				// "Thanks."
			]
		);

		// The converation is over; verify that we're back in the world.

		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);

		// Move the player beyond the edge of the screen to exit the planet vicinity.

		this.playFromStart_LeavePlanetVicinityAndWait(universe);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);

		// Instead of going to Mercury, go to Venus (an honest mistake).
		// Then go back to Earth immediately, without the needed radioactives.

		this.playFromStart_MoveToEntityWithNameAndWait(universe, "Venus");
		this.playFromStart_LeavePlanetVicinityAndWait(universe);
		this.playFromStart_MoveToEntityWithNameAndWait(universe, "Earth");
		this.playFromStart_MoveToEntityWithNameAndWait(universe, stationName);

		// Talk to the station, and verify that the option to transfer radioactives isn't available.

		var placeEncounter = place() as PlaceEncounter;
		station = placeEncounter.entityByName(stationName);
		talker = station.talker();
		var conversationRun = talker.conversationRun;
		conversationRun.nextUntilPrompt(universe);
		var optionsAvailable = conversationRun.optionsAvailable();
		var optionToTransferRadioactivesIsAvailable =
			optionsAvailable.some(x => x.name == "#(we_will_transfer_now)");
		Assert.isFalse(optionToTransferRadioactivesIsAvailable);

		this.playFromStart_TalkToTalker
		(
			universe,
			talker,
			[
				"#(well_go_get_them_now2)"
			]
		);

		// Exit the planet vicinity again.

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
		var radioactivesHeld =
			playerItemHolder.itemsByDefnName(itemDefnNameRadioactives)[0];
		Assert.areNumbersEqual(0, radioactivesHeld.quantity);

		// Land on the planet.

		var placeOrbit = place() as PlacePlanetOrbit;
		placeOrbit.land(universe);
		universe.updateForTimerTick();

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, world);

		// Pick up enough resources to be sure to get the radioactives.

		var resourcesToGatherCount = 6;
		for (var i = 0; i < resourcesToGatherCount; i++)
		{
			this.playFromStart_MoveToEntityWithNameAndWait_CheckPartial(universe, Resource.name, true);
		}

		// Launch and return to the ship in orbit.

		var placeSurface = place() as PlacePlanetSurface;
		placeSurface.exit
		(
			new UniverseWorldPlaceEntities(universe, world, placeSurface, null, null)
		);
		universe.updateForTimerTick();
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);

		// Verify that the cargo holds now contains some radioactives.

		var radioactivesHeld =
			playerItemHolder.itemByDefnName(itemDefnNameRadioactives);
		Assert.isTrue(radioactivesHeld.quantity > 0);

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

		var placeEncounter = place() as PlaceEncounter;
		station = placeEncounter.entityByName(stationName);
		talker = station.talker();

		var radioactivesHeldBefore =
			playerItemHolder.itemByDefnName(itemDefnNameRadioactives).quantity;

		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
				// "Do you have the radioactives?"
				"#(we_will_transfer_now)",
				// "Our sensors are coming online... WHO ARE YOU?!"
			]
		);

		// Make sure that the correct amount of radioactives was actually transferred.
		var radioactivesHeldAfter =
			playerItemHolder.itemByDefnName(itemDefnNameRadioactives).quantity;
		var radioactivesTransferred = radioactivesHeldBefore - radioactivesHeldAfter;
		Assert.areNumbersEqual(1, radioactivesTransferred);

		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
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
			]
		);

		// Conversation over, back in vicinity of Earth.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Go to the moon.

		this.playFromStart_MoveToEntityWithNameAndWait(universe, "Moon");
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);

		// Land on the moon.

		var placeOrbit = place() as PlacePlanetOrbit;
		placeOrbit.land(universe);
		universe.updateForTimerTick();
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, world);

		// Go to the enemy base.

		this.playFromStart_MoveToEntityWithNameAndWait(universe, "AbandonedMoonbase");

		// It's empty.  The lander should display a report message, which must be acknowledged...

		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueMessage.name, universe);
		var venueMessage = universe.venueCurrent() as VenueMessage<any>;
		var uwpe = UniverseWorldPlaceEntities.fromUniverseAndWorld(universe, world);
		venueMessage.acknowledge(uwpe);

		universe.updateForTimerTick();

		// ...and then return to the ship automatically.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);

		// Leave lunar orbit.

		this.playFromStart_WaitForTicks(universe, 100);

		this.playFromStart_LeavePlanetOrbitAndWait(universe);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Verify that the guard drone doesn't spontaneously reappear.

		var guardDrone = place().entityByName(guardDroneName);
		Assert.isNull(guardDrone);

		// Return to the station.

		this.playFromStart_MoveToEntityWithNameAndWait(universe, stationName);
		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		// Make sure that the station encounter's placeToReturnTo is right.
		var placeEncounterStation = place() as PlaceEncounter;
		var placeToReturnToAfterStation = placeEncounterStation.encounter.placeToReturnTo;
		Assert.areStringsEqual(PlacePlanetVicinity.name, placeToReturnToAfterStation.constructor.name);

		// Talk to the commander again.

		station = placeEncounter.entityByName(stationName);
		talker = station.talker();
		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
				// "Did you handle the base?",
				"#(base_was_abandoned)"
				// "Well, I'll be--INCOMING HOSTILE SHIP!  They're jamming our signal!"
			]
		);

		// Make sure that the hostile encounter's placeToReturnTo is right.
		var placeEncounterHostile = place() as PlaceEncounter;
		var placeToReturnToAfterHostileEncounter = placeEncounterHostile.encounter.placeToReturnTo;
		Assert.areStringsEqual(placeEncounterStation.name, placeToReturnToAfterHostileEncounter.name);

		// Now you're talking to the hostile ship.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		placeEncounter = place() as PlaceEncounter;
		var encounter = placeEncounter.encounter;
		var factionHostileName = "Raknoid";
		Assert.areStringsEqual(factionHostileName, encounter.factionName);

		var entityHostile = encounter.entityOther;
		var talker = entityHostile.talker();
		talker.talk(uwpe);
		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
				// "A human in an alien vessel!"
				"#(where_you_come_from)", // "Where did you come from?"
				// "From fighting in such-and-such star cluster."
				"#(be_reasonable)"
				// "We aren't reasonable, though." [Attacks.]
			]
		);

		var flagship = player.flagship;
		Assert.areNumbersEqual(0, flagship.resourceCredits);

		this.playFromStart_CheatToWinCombat(universe);

		// Verify that the ship had some salvage value.

		var factionHostile = world.faction(factionHostileName);
		var hostileShipSalvageValue = factionHostile.shipDefn(world).salvageValue;
		Assert.areNumbersEqual(hostileShipSalvageValue, flagship.resourceCredits);
		//universe.updateForTimerTick();

		// Verify that we've returned to the original encounter,
		// and that, when it's over, it's set to return to the planet vicinity,
		// rather than to, say, the hostile encounter.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
		encounter = (place() as PlaceEncounter).encounter;
		var placeToReturnToTypeName = encounter.placeToReturnTo.constructor.name;
		Assert.areStringsEqual(PlacePlanetVicinity.name, placeToReturnToTypeName);

		talker = station.talker();
		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
				// "You won!  We're in.  What now?"
				"#(annihilate_those_monsters)", // But actually [sensible plan].
				// "Sounds like a sensible plan.  What do we call our alliance?"
				"#(name_1)", // "The New Alliance of Free Stars!"
				// "Great.  Give us two weeks."
				null // "[Wait two weeks...]"
			]
		);

		// Verify that we've switched to a different conversation mode.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		// Now we can get down to business.

		placeEncounter = place() as PlaceEncounter;
		encounter = placeEncounter.encounter;
		var faction = encounter.faction(world);
		Assert.areStringsEqual("Conversation-Terran-Business", faction.conversationDefnName);

		talker = encounter.entityOther.talker();

		var resourceCreditsBefore = flagship.resourceCredits;

		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
				// "Starbase is up and running."
				"#(have_minerals)", // "Commander, I have minerals to offload.",
				// [breakdown of minerals]
			]
		);

		var resourceCreditsAfter = flagship.resourceCredits;
		var resourceCreditsPaid = resourceCreditsAfter - resourceCreditsBefore;
		Assert.isTrue(resourceCreditsPaid > 0);

		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
				// [breakdown of minerals]
				"#(goodbye_commander)"
			]
		);

		// Verify that we've returned to the world.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Leave the Sol system and go to hyperspace.

		this.playFromStart_LeavePlanetVicinityAndWait(universe);
		this.playFromStart_LeaveStarsystemAndWait(universe);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);

		// Verify that a probe is present.

		var entityProbe = place().entityByName("Tempestrial Ship Group X");
		Assert.isNotNull(entityProbe);

		// Wait to be accosted by a probe.

		this.playFromStart_WaitForTicks(universe, 1000);

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		var placeEncounter = place() as PlaceEncounter;
		placeEncounter.encounter.talk(universe);

		universe.updateForTimerTick();

		// Talk to the probe.

		var encounter = placeEncounter.encounter;
		var entityOther = encounter.entityOther;
		talker = entityOther.talker();
		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[ null ] // Doesn't matter what you say.
		);

		// The probe attacks.

		// Make a record of how much money we had before blowing up a ship and salvaging the wreckage.

		var creditBefore = flagship.resourceCredits;

		// Destroy the probe (by cheating, in this test).

		this.playFromStart_CheatToWinCombat(universe);

		// Verify that resources were salvaged from destroyed ship.

		var creditAfter = flagship.resourceCredits;
		Assert.isTrue(creditAfter > creditBefore);

		// Verify that we're back in hyperspace.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);

		// Go to the Alpha Centauri starsystem, the nearest supergiant to Sol.

		this.playFromStart_MoveToEntityWithNameAndWait(universe, "Alpha Centauri");
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);

		// Look for a trader ship, in the main starsystem and in each planet vicinity.

		var placeStarsystem = place() as PlaceStarsystem;
		var starsystem = placeStarsystem.starsystem;
		var factionNameMurch = world.factionByName("Murch").name;
		var shipGroupMurch =
			starsystem.shipGroups.find(x => x.factionName == factionNameMurch);

		if (shipGroupMurch == null)
		{
			var planets = starsystem.planets;
			for (var i = 0; i < planets.length; i++)
			{
				var planet = planets[i];
				shipGroupMurch = planet.shipGroups.find
				(
					x => x.factionName == factionNameMurch
				);
				if (shipGroupMurch != null)
				{
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

		placeEncounter = place() as PlaceEncounter;
		placeEncounter.encounter.talk(universe);

		universe.updateForTimerTick();

		var encounter = placeEncounter.encounter;
		var entityOther = encounter.entityOther;
		talker = entityOther.talker();
		this.playFromStart_TalkToTalker
		(
			universe,
			talker,
			[
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
			]
		);

		// Go gather some lifeforms to sell.

		this.playFromStart_GoToSurfaceOfPlanetWithName(universe, "Delta Centauri II-a"); // 186 biodata units, hazard level 5/8.
		var placePlanetSurface = place() as PlacePlanetSurface;
		var entitiesOnPlanet = placePlanetSurface.entitiesAll();
		var entitiesLifeforms = entitiesOnPlanet.filter(x => x.name.startsWith(Lifeform.name) );
		Assert.isTrue(entitiesLifeforms.length > 0);

		var infoCreditsBeforeGatheringLifeforms = flagship.infoCredits;
		Assert.areNumbersEqual(0, infoCreditsBeforeGatheringLifeforms);

		// Make the lander unkillable (though the crew can still be killed),
		// and then record the crew count
		// and contents of the cargo hold before touching any lifeforms.

		var entityLander = entitiesOnPlanet.find(x => x.name == Player.name);
		var entityLanderKillable = entityLander.killable();
		entityLanderKillable.deathIsIgnoredSet(true); // Cheat!
		var lander = Lander.fromEntity(entityLander);
		var landerItemHolder = lander.itemHolderLifeforms;
		var landerCargoBeforeGatheringLifeforms = landerItemHolder.encumbranceOfAllItems(world);
		var landerCrewCountBeforeTouchingLifeforms = entityLanderKillable.integrity;

		// Move to a conscious, dangerous lifeform.

		var entityLifeformDangerous =
			entitiesLifeforms.find
			(
				x => Lifeform.fromEntity(x).defn(world).damagePerAttack > 0
			);
		Assert.isNotNull(entityLifeformDangerous);
		this.playFromStart_MoveToEntityWithNameAndWait(universe, entityLifeformDangerous.name);

		// Verify that the lifeform was not picked up, and that some crew was killed.

		var landerCargoAfterMovingOntoConsciousLifeform =
			landerItemHolder.encumbranceOfAllItems(world);
		Assert.areNumbersEqual(landerCargoBeforeGatheringLifeforms, landerCargoAfterMovingOntoConsciousLifeform);

		var landerCrewCountAfterTouchingDangerousLifeform = entityLanderKillable.integrity;
		var crewLost =
			landerCrewCountBeforeTouchingLifeforms
			- landerCrewCountAfterTouchingDangerousLifeform;
		console.log("crewLost = " + crewLost);
		//Assert.isTrue(crewLost > 0);// todo - This isn't dependable.

		// Make sure that, before any creatures are stunned,
		// that there are no "biodata" resources on the planet.

		var resourceDefns = ResourceDefn.Instances();
		var resourceDefnBiodata = resourceDefns.Biodata;

		var entitiesResourcesBiodata =
			entitiesOnPlanet
				.filter(x => Resource.fromEntity(x) != null)
				.filter(x => Resource.fromEntity(x).defnName == resourceDefnBiodata.name);

		Assert.isEmpty(entitiesResourcesBiodata);

		// Gather up all the lifeforms.

		for (var i = 0; i < entitiesLifeforms.length; i++)
		{
			var entity = entitiesLifeforms[i];
			// Cheat: kill (well, stun) them all!
			entity.killable().kill();
			// this.playFromStart_MoveToEntityWithNameAndWait(universe, entity.name);
		}

		this.playFromStart_WaitForTicks(universe, 10);

		// Verify that the conscious lifeforms have been replaced with biodata resources
		// (Or are they just datapods?  It's never been very clear.)

		var entitiesResourcesBiodata =
			entitiesOnPlanet
				.filter(x => Resource.fromEntity(x) != null)
				.filter(x => Resource.fromEntity(x).defnName == resourceDefnBiodata.name);

		Assert.isNotEmpty(entitiesResourcesBiodata);

		// Pick up all the biodata.
		// todo - Check for maximum capacity.

		for (var i = 0; i < entitiesResourcesBiodata.length; i++)
		{
			var entity = entitiesResourcesBiodata[i];
			this.playFromStart_MoveToEntityWithNameAndWait(universe, entity.name);
		}

		var landerCargoAfterMovingOntoStunnedLifeforms =
			landerItemHolder.encumbranceOfAllItems(world);
		var lifeformsGathered =
			landerCargoAfterMovingOntoStunnedLifeforms
			- landerCargoBeforeGatheringLifeforms;
		Assert.isTrue(lifeformsGathered > 0);

		// Return to orbit, and verify that the biodata was offloaded from the lander.

		var infoCreditsAfterGatheringLifeforms = flagship.infoCredits;
		Assert.isTrue(infoCreditsAfterGatheringLifeforms > infoCreditsBeforeGatheringLifeforms);

		// Cheat and jump to a system containing a rainbow world,
		// in order to have some more info to sell to the traders.

		var starsystemWithRainbowWorldName = "Gamma Kepler"; // Or Groombridge.
		this.playFromStart_MoveToEntityWithNameAndWait(universe, starsystemWithRainbowWorldName);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);

		var rainbowWorldLocationsKnownButUnsoldCount = player.rainbowWorldLocationsKnownButUnsoldCount();
		Assert.areNumbersEqual(0, rainbowWorldLocationsKnownButUnsoldCount); 

		this.playFromStart_MoveToEntityWithNameAndWait(universe, starsystemWithRainbowWorldName + " I");
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		this.playFromStart_MoveToEntityWithNameAndWait(universe, "Planet");
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);

		placeOrbit = place() as PlacePlanetOrbit;
		var planet = placeOrbit.planet;
		Assert.areStringsEqual("Rainbow", planet.defnName);

		var rainbowWorldLocationsKnownButUnsoldCount = player.rainbowWorldLocationsKnownButUnsoldCount();
		Assert.areNumbersEqual(1, rainbowWorldLocationsKnownButUnsoldCount); 

		this.playFromStart_LeavePlanetOrbitAndWait(universe);
		this.playFromStart_LeavePlanetVicinityAndWait(universe);
		this.playFromStart_LeaveStarsystemAndWait(universe);

		// Gather resources.
		// Gather lifeforms.
		// Return to Earth station.

		callback();
	}

	playFromStart_AssertPlaceCurrentIsOfTypeForWorld
	(
		placeTypeNameExpected: string, world: World
	): void
	{
		var place = world.placeCurrent;
		var placeTypeName = place.constructor.name;
		Assert.areStringsEqual(placeTypeNameExpected, placeTypeName);
	}

	playFromStart_AssertVenueCurrentIsOfTypeForUniverse
	(
		venueTypeNameExpected: string, universe: Universe
	): void
	{
		var venue = universe.venueCurrent();
		var venueTypeName = venue.constructor.name;
		Assert.areStringsEqual(venueTypeNameExpected, venueTypeName);
	}

	playFromStart_CheatToWinCombat(universe: Universe): void
	{
		universe.updateForTimerTick();
		var world = universe.world;
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceCombat.name, world);

		var placeCombat = world.placeCurrent as PlaceCombat;
		var combat = placeCombat.combat;

		var shipGroupForPlayer = combat.shipGroups[0];
		var shipForPlayer = shipGroupForPlayer.ships[0];
		combat.shipsFighting[0] = shipForPlayer;
		combat.fight(universe);
		this.playFromStart_WaitForTicks(universe, 100);

		var shipEnemy = combat.shipsFighting[1];
		var shipEnemyAsEntity =  placeCombat.entityByName(shipEnemy.name);
		shipEnemyAsEntity.killable().kill();

		this.playFromStart_WaitForTicks(universe, 100);

		// Verify that we're seeing a post-battle debriefing screen.

		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);

		var venue = universe.venueCurrent();
		var venueControls = venue as VenueControls;
		var containerChoice = venueControls.controlRoot as ControlContainer;
		var buttonAcknowledge =
			containerChoice.childByName("buttonAcknowledge") as ControlButton<any>;
		buttonAcknowledge.click();

		this.playFromStart_WaitForTicks(universe, 100);
	}

	playFromStart_FindEntityWithName(universe: Universe, targetEntityName: string, partialMatchAllowed: boolean): Entity
	{
		var entityFound =
			partialMatchAllowed
			? this.playFromStart_FindEntityWithNamePartial(universe, targetEntityName)
			: this.playFromStart_FindEntityWithNameExact(universe, targetEntityName);

		return entityFound;
	}

	playFromStart_FindEntityWithNameExact(universe: Universe, targetEntityName: string): Entity
	{
		var place = universe.world.placeCurrent;

		var targetFound = place.entityByName(targetEntityName);

		if (targetFound == null)
		{
			var placeEntities = place.entitiesAll();

			targetFound =
				placeEntities.find
				(
					(x: Entity) => (x.name == targetEntityName)
				);
		}

		return targetFound;
	}

	playFromStart_FindEntityWithNamePartial(universe: Universe, targetEntityName: string): Entity
	{
		var place = universe.world.placeCurrent;

		var targetFound = place.entityByName(targetEntityName);

		if (targetFound == null)
		{
			var placeEntities = place.entitiesAll();

			targetFound =
				placeEntities.find
				(
					(x: Entity) => x.name.startsWith(targetEntityName)
				);
		}

		return targetFound;
	}

	playFromStart_GoToHyperspace(universe: Universe): void
	{
		// todo - Leave the planet surface?
		this.playFromStart_LeavePlanetOrbitAndWait(universe);
		this.playFromStart_LeavePlanetVicinityAndWait(universe);
		this.playFromStart_LeaveStarsystemAndWait(universe);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, universe.world);
	}

	playFromStart_GoToOrbitOfPlanetWithName(universe: Universe, planetName: string): void
	{
		this.playFromStart_GoToVicinityOfPlanetWithName(universe, planetName);
		if (planetName.split(" ").length == 1)
		{
			planetName = Planet.name;
		}
		this.playFromStart_MoveToEntityWithNameAndWait(universe, planetName);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, universe.world);
	}

	playFromStart_GoToStarsystemWithName(universe: Universe, starsystemName: string): void
	{
		this.playFromStart_GoToHyperspace(universe);
		this.playFromStart_MoveToEntityWithNameAndWait(universe, starsystemName);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, universe.world);
		var starsystemActual = (universe.world.place() as PlaceStarsystem).starsystem;
		Assert.areStringsEqual(starsystemName, starsystemActual.name);
	}

	playFromStart_GoToSurfaceOfPlanetWithName(universe: Universe, planetName: string): void
	{
		this.playFromStart_GoToOrbitOfPlanetWithName(universe, planetName);
		var placeOrbit = universe.world.place() as PlacePlanetOrbit;
		placeOrbit.land(universe);
		universe.updateForTimerTick();
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, universe.world);
	}

	playFromStart_GoToVicinityOfPlanetWithName(universe: Universe, planetName: string): void
	{
		if (planetName.indexOf("-") >= 0)
		{
			// It's a moon.
			planetName = planetName.split("-")[0];
		}
		var starsystemName = planetName.substr(0, planetName.lastIndexOf(" "))
		this.playFromStart_GoToStarsystemWithName(universe, starsystemName);
		this.playFromStart_MoveToEntityWithNameAndWait(universe, planetName);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, universe.world);
	}

	playFromStart_LeavePlanetOrbitAndWait(universe: Universe): void
	{
		var world = universe.world;
		var place = world.placeCurrent;
		if (place.constructor.name == PlacePlanetOrbit.name)
		{
			var placeOrbit = place as PlacePlanetOrbit;
			placeOrbit.returnToPlaceParent(universe);
			universe.updateForTimerTick();
		}
	}

	playFromStart_LeavePlanetVicinityAndWait(universe: Universe): void
	{
		var placeCurrent = universe.world.place();
		if (placeCurrent.constructor.name == PlacePlanetVicinity.name)
		{
			this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);

			// hack - Is this necessary?
			// Some delay may be needed to wait for the fader to finish fading.
			// The way the test is set up, this wait requires some fine-tuning.
			this.playFromStart_WaitForTicks(universe, 250); 
		}
	}

	playFromStart_LeavePlanetVicinityOrStarsystem(universe: Universe): void
	{
		var place = universe.world.placeCurrent;

		var player = place.entityByName(Player.name);
		var playerPos = player.locatable().loc.pos;
		var placeSize = place.size();
		playerPos.overwriteWith(placeSize).double();
	}

	playFromStart_LeaveStarsystemAndWait(universe: Universe): void
	{
		var placeCurrent = universe.world.place();
		if (placeCurrent.constructor.name == PlaceStarsystem.name)
		{
			this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);
			this.playFromStart_WaitForTicks(universe, 10); // hack - Exactly how long is necessary?
		}
	}

	playFromStart_MoveToEntityWithNameAndWait(universe: Universe, targetEntityName: string): void
	{
		return this.playFromStart_MoveToEntityWithNameAndWait_CheckPartial(universe, targetEntityName, false);
	}

	playFromStart_MoveToEntityWithNameAndWait_CheckPartial(universe: Universe, targetEntityName: string, partialMatchAllowed: boolean): void
	{
		// This is pretty cheaty right now.  The player just teleports directly to the desired position.

		var place = universe.world.placeCurrent;
		var placeTypeName = place.constructor.name;

		var entityPlayer = place.entityByName(Player.name);
		var playerPos = entityPlayer.locatable().loc.pos;

		var target =
			this.playFromStart_FindEntityWithName(universe, targetEntityName, partialMatchAllowed);

		if (target != null)
		{
			var targetPos = target.locatable().loc.pos;

			if (placeTypeName == PlaceHyperspace.name)
			{
				// These measurements are in pixels.
				var displacementFromPlayerToTarget =
					targetPos.clone().subtract(playerPos);
				var distanceFromPlayerToTarget =
					displacementFromPlayerToTarget.magnitude();

				// Per the Star Control Wiki:
				// "To travel the entire length of one axis [...] requires exactly 100.0 units of fuel.
				// And this game's version of hyperspace is 10,000 pixels across.
				var pixelsPerFuelUnit = 100;
				var fuelUnitsNeeded = distanceFromPlayerToTarget / pixelsPerFuelUnit;
				var world = universe.world as WorldExtended;
				var flagship = world.player.flagship;
				var fuelUnitsHeld = flagship.fuel;
				if (fuelUnitsHeld < fuelUnitsNeeded)
				{
					console.log("Not enough fuel!");
					var directionFromPlayerToTarget =
						displacementFromPlayerToTarget.normalize();
					var displacementUntilFuelRunsOut =
						directionFromPlayerToTarget.multiplyScalar(fuelUnitsHeld * pixelsPerFuelUnit);
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
		this.playFromStart_WaitForTicks(universe, 20);
	}

	playFromStart_TalkToTalker(universe: Universe, talker: Talker, optionsToSelect: string[]): void
	{
		var conversationRun = talker.conversationRun;
		conversationRun.nextUntilPrompt(universe);

		for (var i = 0; i < optionsToSelect.length; i++)
		{
			var optionToSelect = optionsToSelect[i];
			if (optionToSelect == null)
			{
				conversationRun.optionSelectNext();
			}
			else
			{
				var optionFound = conversationRun.optionSelectByName(optionToSelect);
				if (optionFound == null)
				{
					throw new Error("No option found with name: " + optionToSelect);
				}
			}
			conversationRun.nextUntilPrompt(universe);
		}

		universe.updateForTimerTick();
	}

	playFromStart_WaitForTicks(universe: Universe, ticksToWait: number): void
	{
		for (var i = 0; i < ticksToWait; i++)
		{
			universe.updateForTimerTick();
			universe.timerHelper.ticksSoFar++; // hack
		}
	}


}
