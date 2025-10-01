
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
		var methodsToRun =
		[
			this.playFromStart_1_GoToEarthVicinityAndTalkToGuardDrone,
			this.playFromStart_2_GoToEarthStationAndAcceptSupplyMission,
			this.playFromStart_3_RetrieveRadioactives,
			this.playFromStart_4_InvestigateMoonbase,
			this.playFromStart_5_DestroyRaknoidStraggler,
			this.playFromStart_6_GetDownToBusinessWithStation,
			this.playFromStart_7_GoToHyperspaceThenTalkToAndFightProbe,
			this.playFromStart_8_MeetMerchants,
			this.playFromStart_9_GatherLifeformDataAndSellIt,
			this.playFromStart_10_SellGatheredLifeformData,
			this.playFromStart_11_VisitRainbowWorldsAndPickUpHyperwaveCaster,
			this.playFromStart_12_TalkToTwygganAndGetExtramatic,
			this.playFromStart_13_PickUpFreakyBeast,
			this.playFromStart_14_TalkToTempestrialsAndGetProbeDestructCode,
			this.playFromStart_15_PickUpWarpPodFromCrashedShackler,
			this.playFromStart_16_EnterParaspaceTalkToEllfynAndGetProjector,
			this.playFromStart_17_BuyFuelFromMurchSellAtStationAndBuyModules,
			this.playFromStart_18_MeetMuunfazAndGetShipsThenSellThemAtStation,
			this.playFromStart_19_FindMauluskaOrphanAndHireThem,
			// todo - More steps.
			this.playFromStart_20_MeetWithTriunionEnvoys,
			this.playFromStart_21_GoToMauluskaHeadquartersAndMeetHindership,
			this.playFromStart_22_RemovePredatorsFromMauluskaHomeworld,
			this.playFromStart_23_EstablishAllianceWithMauluska,
			this.playFromStart_24_MeetTheFamorfexAndDontMentionMindomini,
			this.playFromStart_25_MeetWithTriunionAtHomeworldAndEstablishAlliance,
			this.playFromStart_26_MeetTheVaarphigAndSendToFightKehlemal,
			this.playFromStart_27_MeetTheOutzAndEstablishAlliance,
			this.playFromStart_28_PickUpTelepathicShieldFromOutzTerritory,
			this.playFromStart_29_MeetTheMazonaeAtStationAndLearnHomeworldLocation,
			this.playFromStart_30_MeetTheUgglegrujAndLearnLocationOfPervertLeader,
			this.playFromStart_31_MeetTheRaptodactylsAndRetreat,
			this.playFromStart_32_MeetTheSupialSurvivorAndAvoidKillingHim,
			this.playFromStart_33_TradeFreakyBeastForSupialFemales,
			this.playFromStart_34_TakeSupialFemalesBackToSurvivor,
			this.playFromStart_35_MeetTheHyphaeAndLearnFormerHomeworldLocation,
			this.playFromStart_36_GoToMazonaeFormerHomeworldAndFindVulcogenicSpores,
			this.playFromStart_37_TakeVulcogenicSporesBackToMazonaeAsEvidence,
			this.playFromStart_38_LocateMazonaeFleetInColdStorage,
			this.playFromStart_39_LureHyphaeIntoTrapSetByMazonae,
			this.playFromStart_40_StealSolaratorFromVacatedHyphaeTerritory,
			this.playFromStart_41_ManipulateRaknoidIntoAttackingVaarphig,
			this.playFromStart_42_UseSolaratorToUnshieldXtalixHomeworld,
			this.playFromStart_43_InvestigateMauluskaDisappearanceAndGetFamorfexCaster,
			this.playFromStart_44_ReturnToEarthStationCheckUpdatesAndHireSupial,
			this.playFromStart_45_ShowSupialToRaptodactylAndSparkCivilWar,
			this.playFromStart_46_MeetTheDaaskappAndTradeTtorstingCasterForOrb,
			this.playFromStart_47_StealSpiralFromVaarphig,
			this.playFromStart_48_RepairExtramaticWithSpareParts,
			this.playFromStart_49_MeetGrimmotzAndGiveThemRepairedExtramatic,
			this.playFromStart_50_ClaimBombFromGrimmotzTerritory,
			this.playFromStart_51_ReturnToFamorfexThenDefeatAndAbductMindomini,
			this.playFromStart_52_ReturnToEarthAndConvertFlagshipToCarryBomb,
			this.playFromStart_53_GoToLocationOfForerunnerBattlesystem,
			this.playFromStart_54_DestroyTheFleetsAroundForerunnerBattlesystem,
			this.playFromStart_55_DestroyTheShieldAroundForerunnerBattlesystem,
			this.playFromStart_56_DestroyTheForerunnerBattlesystem
		];

		methodsToRun.forEach
		(
			x =>
			{
				console.log(x.name);
				x.call(this, universe);
			}
		);

		callback();
	}

	playFromStart_1_GoToEarthVicinityAndTalkToGuardDrone(universe: Universe): void
	{
		Assert.isNotNull(universe);

		var world = universe.world as WorldExtended;
		var venueWorld = world.toVenue();
		universe.venueNextSet(venueWorld);

		var place = () => world.placeCurrent;

		var starsystemSol = (place() as PlaceStarsystem).starsystem;
		Assert.areStringsEqual("Sol", starsystemSol.name);

		this.waitForTicks(universe, 5);

		const planetEarthName = "Earth";
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

		const guardDroneName = "LahkemupGuardDrone";
		var guardDrone = place().entityByName(guardDroneName);
		Assert.isNotNull(guardDrone);

		// Wait for the guard drone to approach the player
		// and initiate a conversation.
		// Note that sometimes this fails, for currently unknown reasons.

		this.waitForTicks(universe, 1000);
		this.assertVenueCurrentIsOfTypeForUniverse(VenueConversationRun.name, universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		// Leave the conversation.

		var talkerEntity = (place() as PlaceEncounter).encounter.entityOther;
		var talker = Talker.of(talkerEntity);
		this.talkToTalker
		(
			universe,
			talker,
			[
				"SayNothing" // It's a recording.
			]
		);

		// The "conversation" is over; verify that we're back in the world venue.
		this.assertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Wait for the guard drone to clear the area,
		// and verify that it's gone.

		this.waitForTicks(universe, 1000);
		guardDrone = place().entityByName(guardDroneName);
		Assert.isNull(guardDrone);
	}

	playFromStart_2_GoToEarthStationAndAcceptSupplyMission(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Move the player to the station.

		const stationName = "Earth Station";
		var station = world.place().entityByName(stationName);
		Assert.isNotNull(station);

		this.moveToEntityWithNameAndWait(universe, stationName);

		// Talk to the station.

		this.assertVenueCurrentIsOfTypeForUniverse(VenueConversationRun.name, universe);

		talker = Talker.of(station);
		this.talkToTalker
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

		this.assertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);

		// Move the player beyond the edge of the screen to exit the planet vicinity.

		this.leavePlanetVicinityAndWait(universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);

		// Instead of going to Mercury, go to Venus (an honest mistake).
		// Then go back to Earth immediately, without the needed radioactives.

		this.moveToEntityWithNameAndWait(universe, "Venus");
		this.leavePlanetVicinityAndWait(universe);
		const planetEarthName = "Earth";
		this.moveToEntityWithNameAndWait(universe, planetEarthName);
		this.moveToEntityWithNameAndWait(universe, stationName);

		// Talk to the station, and verify that the option to transfer radioactives isn't available.

		var placeEncounter = world.place() as PlaceEncounter;
		var station = placeEncounter.entityByName(stationName);
		var talker = Talker.of(station);
		var conversationRun = talker.conversationRun;
		conversationRun.nextUntilPrompt(universe);
		var optionsAvailable = conversationRun.optionsAvailable();
		var optionToTransferRadioactivesIsAvailable =
			optionsAvailable.some(x => x.name == "#(we_will_transfer_now)");
		Assert.isFalse(optionToTransferRadioactivesIsAvailable);

		this.talkToTalker
		(
			universe,
			talker,
			[
				"#(well_go_get_them_now2)"
			]
		);
	}

	playFromStart_3_RetrieveRadioactives(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

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
		var radioactivesHeld =
			flagshipItemHolderCargo.itemsByDefnName(itemDefnNameRadioactives)[0];
		Assert.areNumbersEqual(0, radioactivesHeld.quantity);

		// Land on the planet.

		this.landOnPlanetSurface(universe, world, world.place() );

		// Pick up enough resources to be sure to get the radioactives.

		var resourcesToGatherCount = 6;
		for (var i = 0; i < resourcesToGatherCount; i++)
		{
			this.moveToEntityWithNameAndWait_CheckPartial(universe, Resource.name, true);
		}

		// Launch and return to the ship in orbit.

		this.returnToOrbit(universe, world, world.place() );

		// Verify that the cargo holds now contains some radioactives.

		var radioactivesHeld =
			flagshipItemHolderCargo.itemByDefnName(itemDefnNameRadioactives);
		Assert.isTrue(radioactivesHeld.quantity > 0);

		// Exit Mercury orbit.

		this.leavePlanetOrbitAndWait(universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Leave the Mercury vicinity and return to the Earth Station.

		this.leavePlanetVicinityAndWait(universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);

		const planetEarthName = "Earth";
		this.moveToEntityWithNameAndWait(universe, planetEarthName);
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		const stationName = "Earth Station";
		this.moveToEntityWithNameAndWait(universe, stationName);
		this.assertVenueCurrentIsOfTypeForUniverse(VenueConversationRun.name, universe);

		// Talk to the station commander.

		var placeEncounter = world.place() as PlaceEncounter;
		var station = placeEncounter.entityByName(stationName);
		var talker = Talker.of(station);

		var radioactivesHeldBefore =
			flagshipItemHolderCargo.itemByDefnName(itemDefnNameRadioactives).quantity;

		this.talkToTalker
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
			flagshipItemHolderCargo.itemByDefnName(itemDefnNameRadioactives).quantity;
		var radioactivesTransferred = radioactivesHeldBefore - radioactivesHeldAfter;
		Assert.areNumbersEqual(1, radioactivesTransferred);
	}

	playFromStart_4_InvestigateMoonbase(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		var placeEncounter = world.place() as PlaceEncounter;
		const stationName = "Earth Station";
		var station = placeEncounter.entityByName(stationName);
		var talker = Talker.of(station);

		this.talkToTalker
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

		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Go to the moon.

		this.moveToEntityWithNameAndWait(universe, "Moon");
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);

		// Land on the moon.

		this.landOnPlanetSurface(universe, world, world.place() );
		this.moveToEnergySourceOnPlanetSurfaceAcknowledgeMessageAndLeave(universe, "AbandonedMoonbase");

		// Leave lunar orbit.

		this.waitForTicks(universe, 100);

		this.leavePlanetOrbitAndWait(universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Verify that the guard drone doesn't spontaneously reappear.

		const guardDroneName = "LahkemupGuardDrone";
		var guardDrone = world.place().entityByName(guardDroneName);
		Assert.isNull(guardDrone);

		// Return to the station.

		this.moveToEntityWithNameAndWait(universe, stationName);
		this.assertVenueCurrentIsOfTypeForUniverse(VenueConversationRun.name, universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		// Make sure that the station encounter's placeToReturnTo is right.
		var placeEncounterStation = world.place() as PlaceEncounter;
		var placeToReturnToAfterStation = placeEncounterStation.encounter.placeToReturnTo;
		Assert.areStringsEqual(PlacePlanetVicinity.name, placeToReturnToAfterStation.constructor.name);

		// Talk to the commander again.

		var station = placeEncounter.entityByName(stationName);
		var talker = Talker.of(station);
		this.talkToTalker
		(
			universe, talker,
			[
				// "Did you handle the base?",
				"#(base_was_abandoned)"
				// "Well, I'll be--INCOMING HOSTILE SHIP!  They're jamming our signal!"
			]
		);
	}

	playFromStart_5_DestroyRaknoidStraggler(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Make sure that the hostile encounter's placeToReturnTo is right.
		var placeEncounterHostile = world.place() as PlaceEncounter;
		var placeToReturnToAfterHostileEncounter =
			placeEncounterHostile.encounter.placeToReturnTo;
		Assert.areStringsEqual
		(
			"PlaceEncounterTerran", // placeEncounterStation.name,
			placeToReturnToAfterHostileEncounter.name
		);

		// Now you're talking to the hostile ship.

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		var placeEncounter = world.place() as PlaceEncounter;
		var encounter = placeEncounter.encounter;
		var factionHostileName = "Raknoid";
		Assert.areStringsEqual(factionHostileName, encounter.factionName);

		var entityHostile = encounter.entityOther;
		var talker = Talker.of(entityHostile);
		var uwpe = UniverseWorldPlaceEntities.fromUniverseAndWorld(universe, world);
		talker.talk(uwpe);
		this.talkToTalker
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

		var flagship = world.player.flagship;
		Assert.areNumbersEqual(0, flagship.resourceCredits);

		this.cheatToWinCombat(universe);

		// Verify that the ship had some salvage value.

		var factionHostile = world.faction(factionHostileName);
		var hostileShipSalvageValue = factionHostile.shipDefn(world).salvageValue;
		Assert.areNumbersEqual(hostileShipSalvageValue, flagship.resourceCredits);
		//universe.updateForTimerTick();
	}

	playFromStart_6_GetDownToBusinessWithStation(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Verify that we've returned to the original encounter,
		// and that, when it's over, it's set to return to the planet vicinity,
		// rather than to, say, the hostile encounter.

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
		var encounter = (world.place() as PlaceEncounter).encounter;
		var placeToReturnToTypeName = encounter.placeToReturnTo.constructor.name;
		Assert.areStringsEqual(PlacePlanetVicinity.name, placeToReturnToTypeName);

		var stationName = "Earth Station";
		var station = world.place().entityByName(stationName);
		var talker = Talker.of(station);
		this.talkToTalker
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

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		// Now we can get down to business.

		var placeEncounter = world.place() as PlaceEncounter;
		var encounter = placeEncounter.encounter;
		var faction = encounter.faction(world);
		Assert.areStringsEqual("Conversation-Terran-Business", faction.conversationDefnName);

		var talker = Talker.of(encounter.entityOther);

		var flagship = world.player.flagship;
		var resourceCreditsBefore = flagship.resourceCredits;

		this.talkToTalker
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

		this.talkToTalker
		(
			universe, talker,
			[
				// [breakdown of minerals]
				"#(goodbye_commander)"
			]
		);
	}

	playFromStart_7_GoToHyperspaceThenTalkToAndFightProbe(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Verify that we've returned to the world.

		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// For now, before entering hyperspace,
		// cheat and turn off the generation of probe encounters.
		// (One has already been generated.)

		var factionForProbes = world.factionByName("Tempestrial");
		factionForProbes.territory.disable();

		// Leave the Sol system and go to hyperspace.

		this.leavePlanetVicinityAndWait(universe);
		this.leaveStarsystemAndWait(universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);

		// Verify that a probe is present.

		const shipGroupNameProbe = "Tempestrial Ship Group X"
		var entityProbe = world.place().entityByName(shipGroupNameProbe);
		Assert.isNotNull(entityProbe);

		var hyperspace = world.hyperspace;
		Assert.isNotEmpty(hyperspace.shipGroups);

		// Wait to be accosted by a probe.

		this.waitForTicks(universe, 1000);

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		var placeEncounter = world.place() as PlaceEncounter;
		placeEncounter.encounter.talk(universe);

		universe.updateForTimerTick();

		// Talk to the probe.

		var encounter = placeEncounter.encounter;
		var entityOther = encounter.entityOther;
		var talker = Talker.of(entityOther);
		this.talkToTalker
		(
			universe, talker,
			[ null ] // Doesn't matter what you say.
		);

		// The probe attacks.

		// Make a record of how much money we had before blowing up a ship and salvaging the wreckage.

		var flagship = world.player.flagship;

		var creditBefore = flagship.resourceCredits;

		// Destroy the probe (by cheating, in this test).

		this.cheatToWinCombat(universe);

		// Verify that resources were salvaged from destroyed ship.

		var creditAfter = flagship.resourceCredits;
		Assert.isTrue(creditAfter > creditBefore);

		// Verify that we're back in hyperspace, and the probe is no longer present.

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
		var entityProbe = world.place().entityByName(shipGroupNameProbe);
		Assert.isNull(entityProbe);
		Assert.isEmpty(hyperspace.shipGroups);
	}

	playFromStart_8_MeetMerchants(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Go to the Alpha Centauri starsystem, the nearest supergiant to Sol.

		var starsystemWithMerchantsName = "Alpha Centauri";
		this.moveToEntityWithNameAndWait(universe, starsystemWithMerchantsName);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);

		// Look for a trader ship, in the main starsystem and in each planet vicinity.

		var placeStarsystem = world.place() as PlaceStarsystem;
		var starsystem = placeStarsystem.starsystem;
		var factionMerchantsName = world.factionByName("Murch").name;

		this.moveToShipGroupBelongingToFactionIfAny(universe, world, starsystem, factionMerchantsName);

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		// Talk to the traders.

		this.talkToTalker2
		(
			universe,
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
	}
	
	playFromStart_9_GatherLifeformDataAndSellIt(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Go gather some lifeforms to sell.

		this.goToSurfaceOfPlanetWithName(universe, "Delta Centauri II-a"); // 186 biodata units, hazard level 5/8.
		var placePlanetSurface = world.place() as PlacePlanetSurface;
		var entitiesOnPlanet = placePlanetSurface.entitiesAll();
		var entitiesLifeforms = entitiesOnPlanet.filter(x => x.name.startsWith(Lifeform.name) );
		Assert.isTrue(entitiesLifeforms.length > 0);

		var flagship = world.player.flagship;
		var flagshipItemHolderLifeforms = flagship.itemHolderLifeforms;
		var biodataBeforeGatheringLifeforms =
			flagshipItemHolderLifeforms.encumbranceOfAllItems(world);
		Assert.areNumbersEqual(0, biodataBeforeGatheringLifeforms);

		var infoCreditsBeforeSellingLifeforms = flagship.infoCredits;
		Assert.areNumbersEqual(0, infoCreditsBeforeSellingLifeforms);

		// Make the lander unkillable (though the crew can still be killed),
		// and then record the crew count
		// and contents of the cargo hold before touching any lifeforms.

		var entityLander = entitiesOnPlanet.find(x => x.name == Player.name);
		var entityLanderKillable = Killable.of(entityLander);
		entityLanderKillable.deathIsIgnoredSet(true); // Cheat!
		var lander = Lander.fromEntity(entityLander);
		var landerItemHolderLifeforms = lander.itemHolderLifeforms;
		var landerEncumbranceBeforeGatheringLifeforms =
			landerItemHolderLifeforms.encumbranceOfAllItems(world);
		var landerCrewCountBeforeTouchingLifeforms = entityLanderKillable.integrity;

		// Move to a conscious, dangerous lifeform.

		var entityLifeformDangerous =
			entitiesLifeforms.find
			(
				x => Lifeform.fromEntity(x).defn(world).damagePerAttack > 0
			);
		Assert.isNotNull(entityLifeformDangerous);
		this.moveToEntityWithNameAndWait(universe, entityLifeformDangerous.name);

		// Verify that the lifeform was not picked up, and that some crew was killed.

		var landerEncumbranceAfterMovingOntoConsciousLifeform =
			landerItemHolderLifeforms.encumbranceOfAllItems(world);
		Assert.areNumbersEqual
		(
			landerEncumbranceBeforeGatheringLifeforms,
			landerEncumbranceAfterMovingOntoConsciousLifeform
		);

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

		// Cheat: kill (well, stun) them all!
		for (var i = 0; i < entitiesLifeforms.length; i++)
		{
			var entity = entitiesLifeforms[i];
			Killable.of(entity).kill();
		}

		this.waitForTicks(universe, 10);

		// Verify that the conscious lifeforms have been replaced with biodata resources.

		var entitiesResourcesBiodata =
			entitiesOnPlanet
				.filter(x => Resource.fromEntity(x) != null)
				.filter(x => Resource.fromEntity(x).defnName == resourceDefnBiodata.name);

		Assert.isNotEmpty(entitiesResourcesBiodata);
		Assert.areNumbersEqual(entitiesLifeforms.length, entitiesResourcesBiodata.length);

		// Pick up all the biodata.
		// todo - Check for maximum capacity.

		for (var i = 0; i < entitiesResourcesBiodata.length; i++)
		{
			var entity = entitiesResourcesBiodata[i];
			try
			{
				this.moveToEntityWithNameAndWait(universe, entity.name);
			}
			catch (err)
			{
				// Errors may be happening because some resources overlap,
				// and are thus picked up by accident when picking up some other resource.
			}
		}

		var landerEncumbranceAfterMovingOntoStunnedLifeforms =
			landerItemHolderLifeforms.encumbranceOfAllItems(world);
		var biodataGathered =
			landerEncumbranceAfterMovingOntoStunnedLifeforms
			- landerEncumbranceBeforeGatheringLifeforms;
		Assert.isTrue(biodataGathered > 0);

		// Return to orbit, and verify that the biodata was offloaded from the lander.
		this.returnToOrbit(universe, world, world.place() );

		var biodataAfterGatheringLifeforms =
			flagshipItemHolderLifeforms.encumbranceOfAllItems(world);
		Assert.isTrue(biodataAfterGatheringLifeforms > biodataBeforeGatheringLifeforms);
	}

	playFromStart_10_SellGatheredLifeformData(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Go to another supergiant starsystem containing the merchants,
		// then find the merchants and engage with them.

		var starsystemToGoToName = "Zeeman";
		this.goToStarsystemWithName(universe, starsystemToGoToName);
		var starsystem = world.hyperspace.starsystemByName(starsystemToGoToName);
		var factionMerchantsName = world.factionByName("Murch").name;
		this.moveToShipGroupBelongingToFactionIfAny(universe, world, starsystem, factionMerchantsName);
		this.talkToTalker2
		(
			universe,
			[
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
				"#(fill_me_up)", // "Fill me up."
				// "Fuel transferred." 
				// (And it's assumed you don't want any more fuel.)
				// "What else would you like to buy?"
				"#(done_buying)",
				// "Anything else?"
				"#(be_leaving_now)"
				// "Goodbye."
			]
		);
	}

	playFromStart_11_VisitRainbowWorldsAndPickUpHyperwaveCaster(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Go to a system containing a rainbow world,
		// in order to have some more info to sell to the traders.

		var starsystemWithRainbowWorldName = "Gamma Kepler";
		this.goToRainbowWorldInStarsystemWithName(starsystemWithRainbowWorldName, universe);

		// It won't be possible to sell the location at a supergiant without going backwards,
		// so instead go forward to pick up a hyperwave caster.

		var deviceTtorstingCasterName = "TtorstingCaster";
		var planetWithTtorstingCaster = "Arcturus I-a";
		this.goToSurfaceOfPlanetWithName(universe, planetWithTtorstingCaster);
		var placePlanetSurface = world.place() as PlacePlanetSurface;
		this.assertPlaceCurrentIsOfTypeForWorld(placePlanetSurface.name, world);
		this.moveToEntityWithNameAndWait(universe, deviceTtorstingCasterName);
		this.acknowledgeMessage(universe);
		// Acknowledging the message returns the lander to orbit automatically.
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);

		// Check to see that the caster is now on board the flagship.
		var flagship = world.player.flagship;
		var itemHolderDevices = flagship.itemHolderDevices;
		Assert.isNotEmpty(itemHolderDevices.items);

		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);

		// Now go to Alpha Andromadae, where there's another rainbow world.
		starsystemWithRainbowWorldName = "Alpha Andromedae";
		this.goToRainbowWorldInStarsystemWithName(starsystemWithRainbowWorldName, universe);
		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);

		// And now Groombridge, where there's yet another rainbow world.
		starsystemWithRainbowWorldName = "Groombridge";
		this.goToRainbowWorldInStarsystemWithName(starsystemWithRainbowWorldName, universe);
		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);

		// And now Gamma Aquarii, where there's still another rainbow world.
		starsystemWithRainbowWorldName = "Gamma Aquarii";
		this.goToRainbowWorldInStarsystemWithName(starsystemWithRainbowWorldName, universe);
		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);
	}

	playFromStart_12_TalkToTwygganAndGetExtramatic(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Go to Beta Librae I and talk to the Twyggan.
		this.goToOrbitOfPlanetWithName(universe, "Beta Librae I");

		// Verify that an encounter is initiated, rather than a normal orbit.
		Assert.isTrue(world.place().constructor.name != PlacePlanetOrbit.name);

		this.talkToTalker2
		(
			universe,
			[
				// "Hello, traveller."
				"#(i_am)", // "Hello.  My name is..."
				// "Our name is the Twyggan."
				"#(my_ship)", // "My ship is the..."
				// "Our ship is the...
				"#(from_alliance)", // "We're from Earth."
				// "We're also from Earth."
				"#(are_you_copying)", // "Hey?  Are you just copying me?"
				// "Well, yes.  But our planet's name also happens to means 'Dirt'."
				"#(why_copy)", // "Why were you copying me?"
				// "It's our nature."
				"#(tell_us_of_your_species)",
				// "We're symbotic plants."
				"#(plants_arent_intelligent)", // "Plants can't evolve intelligence!"
				// "We agree.  We suspect divine intervention."
				"#(anyone_around_here)", // "What's this neighborhood like?"
				// "Our neighbors are the Grimmotz."
				"#(what_relation_to_utwig)",
				// "They're our allies, usually, though they're not really up to it right now."
				"#(whats_wrong_with_utwig)",
				// "They broke their Extramatic."
				"#(whats_ultron)", // "What's that?"
				// "Some kind of ancient gewgaw.  They gave it to us.  Here, take it."
				"#(what_do_i_do_now)",
				// "Fix it, of course."
				"#(where_get_repairs)", // "Where can I find the parts.
				// "There's an ancient rhyme that says where..."
				"#(bye_neutral)" // Oh, okay, I'll try.  Bye, I guess."
				// "Goodbye."
			]
		);

		// Verify that, after the talk is over, we return to the planet vicinity.

		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// todo - Check that the Extramatic is now on board.
	}

	playFromStart_13_PickUpFreakyBeast(universe: Universe): void
	{
		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);

		// Go to Delta Lyncis I and capture the Freaky Beast.
		this.goToSurfaceOfPlanetWithName(universe, "Delta Lyncis I");

		this.stunAllLifeformsOnPlanetSurfaceCollectBiodataAndLeave(universe);

		// todo - Verify that the Freaky Beast is now on board.
	}

	playFromStart_14_TalkToTempestrialsAndGetProbeDestructCode(universe: Universe): void
	{
		// Go to Epsilon Draconis I and log a rainbow world.
		this.goToOrbitOfPlanetWithName(universe, "Epsilon Draconis I");

		// Go to Beta Corvi ? and talk to the Tempestrials.
		this.goToOrbitOfPlanetWithName(universe, "Beta Corvi IV");

		// todo - Talk to the Tempestrials.
		// todo - Verify that the probe destruct code is now known.
	}

	playFromStart_15_PickUpWarpPodFromCrashedShackler(universe: Universe): void
	{
		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);

		// Go to Beta Pegasi and log another rainbow world.
		this.goToOrbitOfPlanetWithName(universe, "Beta Pegasi I");

		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);

		// Go to Alpha Pavonis VII and grab the warp pod from a shackler wreck.
		this.goToSurfaceOfPlanetWithName(universe, "Alpha Pavonis VII");

		this.moveToEnergySourceOnPlanetSurfaceAcknowledgeMessageAndLeave(universe, "CrashedShackler");

		// todo - Verify that the crashed shackler is on board.
	}

	playFromStart_16_EnterParaspaceTalkToEllfynAndGetProjector(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		// Proceed to the paraspace portal.
		// todo - Advance time to the 17th of the month.

		this.goToHyperspace(universe);
		this.moveToEntityWithNameAndWait(universe, "UNKNOWN");
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
		var placeHyperspace = world.place() as PlaceHyperspace;
		var spaceOccupied = placeHyperspace.hyperspace;
		Assert.areStringsEqual("Paraspace", spaceOccupied.name);

		// Go to the Ellfyn homeworld, talk to them,
		// and trade the warp outrigger for a portal projector.

		this.moveToEntityAtPosAndWait(universe, Coords.fromXY(6134, 5900) );

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		var talkerEntity = (world.place() as PlaceEncounter).encounter.entityOther;
		var talker = Talker.of(talkerEntity);
		this.talkToTalker
		(
			universe,
			talker,
			[
				// "Hello, and welcome back."
				"#(confused_by_hello)", // "Have we met?"
				// "Oh, not personally, but our species have a history.
				"#(what_give_me)", // "You said you could offer us someting?"
				// "Yes, we can convert a warp outrigger into a portal projector."
				"#(got_it)", // "It just so happens I have one of those."
				// "Aren't you clever.  Here, we'll build it... done."
				"#(bye_friendly_homeworld)", // Great.  See ya."
				// "See ya."
			]
		);

		// Check to see that we're back in paraspace.

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
		var placeHyperspace = world.place() as PlaceHyperspace;
		var spaceOccupied = placeHyperspace.hyperspace;
		Assert.areStringsEqual("Paraspace", spaceOccupied.name);

		// Check to see that the portal projector is now on board the flagship.
		var flagship = world.player.flagship;
		var itemHolderDevices = flagship.itemHolderDevices;
		var devicePortalProjectorName = "ParaspacePortalProjector";
		Assert.isTrue(itemHolderDevices.hasItemWithDefnName(devicePortalProjectorName) );

		// Leave paraspace by the portal that lets out nearest to Earth.
		this.moveToEntityAtPosAndWait(universe, Coords.fromXY(5060, 4740) );
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
		var placeHyperspace = world.place() as PlaceHyperspace;
		var spaceOccupied = placeHyperspace.hyperspace;
		Assert.areStringsEqual("Hyperspace", spaceOccupied.name);
		var player = Playable.entityFromPlace(placeHyperspace);
		var playerPos = Locatable.of(player).pos();
		var posExpected = Coords.fromXY(1910,  962);
		Assert.isTrue(playerPos.equals(posExpected) );
	}

	playFromStart_17_BuyFuelFromMurchSellAtStationAndBuyModules(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		this.callMerchantsAndWaitForContact(universe);
		var placeEncounter = world.place() as PlaceEncounter;
		var encounter = placeEncounter.encounter;
		var talker = Talker.of(encounter.entityOther);

		this.talkToTalker
		(
			universe,
			talker,
			[
				// "Hello.  Buying or selling?"
				"#(buy)", // "Buying."
				// "Buying what?"
				"#(buy_technology)", // "Technology."
				// "Okay, we're currently offering this tech."
				"#(buy_new_tech)",
				// "Sold.  Our next tech is this."
				"#(no_buy_new_tech)", // "I don't want to buy that one.
				// "What else would you like to buy?"
				"#(done_buying)", // "Nothing."
				// "Anything else?"
				"#(be_leaving_now)",
				// "Bye."
			]
		);

		this.buyFuelFromMurchAndSellToEarthStation(universe);
		this.buyFuelFromMurchAndSellToEarthStation(universe);
		this.buyFuelFromMurchAndSellToEarthStation(universe);

		this.goToEarthStationDocks(universe);
		var placeStationDock = world.place() as PlaceStationDock;

		var uwpe = UniverseWorldPlaceEntities.fromUniverseAndWorld(universe, world);

		placeStationDock.componentBuildThruster(uwpe);
		placeStationDock.componentBuildTurningJets(uwpe);
		placeStationDock.componentBuildWithName(uwpe, "Crew Habitat");
		placeStationDock.componentBuildWithName(uwpe, "Cargo Bay");
		placeStationDock.componentBuildWithName(uwpe, "Fuel Tank");
		placeStationDock.crewAddToCapacity(uwpe);

		// todo - Verify speed, turn rate, crew, cargo, and fuel capacity has increased.

		this.leaveStation(universe);
	}

	playFromStart_18_MeetMuunfazAndGetShipsThenSellThemAtStation(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);

		this.goToOrbitOfPlanetWithName(universe, "Gamma Krueger I");
		Assert.isFalse(world.place().constructor.name == PlacePlanetOrbit.name);

		this.talkToTalker2
		(
			universe,
			[
				// "Hello.  We're giving you this oblong."
				"#(we_are_vindicator)",
				// "What do you want?"
				"#(we_need_help)",
				// "Well, no alliance, but here's four ships.  Bye."
			]
		);

		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		var player = world.player;
		var flagship = player.flagship;
		var playerHasTranslucentOblong =
			flagship.itemHolderDevices.hasItemWithDefnName("TranslucentOblong");
		Assert.isTrue(playerHasTranslucentOblong);

		const shipDefnNameFireblossom = "Fireblossom";
		var muunfazShipCount =
			player.shipGroup.ships.filter(x => x.defnName == shipDefnNameFireblossom).length;
		Assert.areNumbersEqual(4, muunfazShipCount);

		// Go back to Earth Station and sell the ships.

		this.goToEarthStationDocks(universe);
		var placeStationDock = world.place() as PlaceStationDock;
		for (var i = 0; i < muunfazShipCount; i++)
		{
			placeStationDock
				.shipSelectByDefnName(universe, shipDefnNameFireblossom)
				.shipScrap(universe);
		}

		this.leaveStation(universe);
	}

	playFromStart_19_FindMauluskaOrphanAndHireThem(universe: Universe): void
	{
		var world = universe.world;

		// Go to Pluto and locate the Mauluska orphan hiding there.
		this.leavePlanetVicinityAndWait(universe);
		this.moveToEntityWithNameAndWait(universe, "Pluto");
		this.moveToEntityWithNameAndWait(universe, Planet.name);
		this.landOnPlanetSurface(universe, world, world.place() );
		this.moveToEnergySourceOnPlanetSurfaceAndAcknowledgeMessage(universe, "MauluskaOrphan");

		this.talkToTalker2
		(
			universe,
			[
				// "Sorry about killing some of your lander crew!"
				"#(identify)", // "Identify yourself!"
				// "I'm Captain Such-and-Such."
				"#(youre_forgiven)",
				// "Thanks!"
				"#(what_doing_on_pluto_1)",
				// [Long story...]
				"#(what_doing_on_pluto_2)",
				// [Longer story...]
				"#(what_doing_on_pluto_3)",
				// [...story concludes.]
				"#(what_about_ilwrath)",
				// "They left us."
				"#(when_ilwrath)", // "When will they be back."
				// "Probably never."
				"#(what_about_moonbase)",
				// "It's a fake."
				"#(what_about_other_spathi)",
				// "They left too, a few at a time."
				"#(how_many_crew)", // "How many on your ship?"
				// "Lots!"
				"#(really_thousands)", // "Really?",
				// "Well, no, it's just me."
				"#(full_of_monsters)", // "Sounds scary."
				// "It is."
				"#(join_us)", // "You should join our fleet."
				// "Yes, please."
			]
		);
	}

	playFromStart_20_MeetWithTriunionEnvoys(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		var starsystemForRendezvous = world.hyperspace.starsystemByName("Rigel");
		this.goToStarsystemWithName(universe, starsystemForRendezvous.name);
		var factionTriunionName =
			world.factionByName("Triunion").name;
		this.moveToShipGroupBelongingToFactionIfAny
		(
			universe, world, starsystemForRendezvous, factionTriunionName
		);

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		this.talkToTalker2
		(
			universe,
			[
				// "Hello!"
				"#(we_are_vindicator)",
				// "We need your help."
				"#(what_emergency)",
				// "We're under attack."
				"#(what_look_like)", // "What do they look like?"
				// "They look like this."
				"#(how_can_i_help)"
				// "Talk to our homeworld."
			]
		);
	}

	playFromStart_21_GoToMauluskaHeadquartersAndMeetHindership(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		this.goToOrbitOfPlanetWithName(universe, "Epsilon Gruis I-a");

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		this.talkToTalker2
		(
			universe,
			[
				// "What's the password?"
				"#(what_do_i_get)", // "What do I get if I tell you?"
				// "You get to live a little longer."
				"#(good_password)", // "Password is this."
				// "Right.  How do you know this?"
				"#(spathi_on_pluto)", // "We met one of you on Pluto."
				// "Where is he now?"
				"#(hostage)", // "He's right here.  He'll vouch for us."
				// "Doubtless under duress."
				"#(we_come_in_peace)",
				// "No doubt."
				"#(share_info)", // "Share some info with us?"
				// "No."
				"#(give_us_resources)", // "Give us resources?"
				// "No."
				"#(hand_in_friendship)", // "Join us!"
				// "We're too afraid of our masters."
				"#(stronger)", // "We're stronger than they are."
				// "No you're not!"
				"#(yes_we_are)", // "Are too.  Check out this ship!"
				// "It's nice, but it's just one.  They've got thousands."
				"#(how_prove)", // "How can I prove myself?"
				// "Maybe some sort of test."
				"#(what_test)", // "What kind of test?"
				// "Remove the creatures from the surface of our world."
				"#(why_dont_you_do_it)",
				// "They'd eat us if we tried."
				"#(tell_evil)", // "Tell us more about them."
				// "Here's the history."
				"#(i_accept)" // "I'll do it!"
			]
		);

		// Verify that you aren't allowed to orbit the planet, at least not yet.
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// todo - Go back immediately and admit you haven't been to their homeworld.
		// todo - Then go back again and claim that you've eliminated the threat.
		// todo - Then go back once again and get yelled at for lying.
	}

	playFromStart_22_RemovePredatorsFromMauluskaHomeworld(universe: Universe): void
	{
		this.goToSurfaceOfPlanetWithName(universe, "Epsilon Gruis I");
		this.stunAllLifeformsOnPlanetSurfaceCollectBiodataAndLeave(universe);
		this.leavePlanetOrbitAndWait(universe);
	}

	playFromStart_23_EstablishAllianceWithMauluska(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		this.goToOrbitOfPlanetWithName(universe, "Epsilon Gruis I-a");
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		this.talkToTalker2
		(
			universe,
			[
				"todo"
			]
		);
	}

	playFromStart_24_MeetTheFamorfexAndDontMentionMindomini(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_25_MeetWithTriunionAtHomeworldAndEstablishAlliance(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_26_MeetTheVaarphigAndSendToFightKehlemal(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_27_MeetTheOutzAndEstablishAlliance(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_28_PickUpTelepathicShieldFromOutzTerritory(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_29_MeetTheMazonaeAtStationAndLearnHomeworldLocation(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_30_MeetTheUgglegrujAndLearnLocationOfPervertLeader(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_31_MeetTheRaptodactylsAndRetreat(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_32_MeetTheSupialSurvivorAndAvoidKillingHim(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_33_TradeFreakyBeastForSupialFemales(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_34_TakeSupialFemalesBackToSurvivor(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_35_MeetTheHyphaeAndLearnFormerHomeworldLocation(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_36_GoToMazonaeFormerHomeworldAndFindVulcogenicSpores(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_37_TakeVulcogenicSporesBackToMazonaeAsEvidence(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_38_LocateMazonaeFleetInColdStorage(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_39_LureHyphaeIntoTrapSetByMazonae(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_40_StealSolaratorFromVacatedHyphaeTerritory(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_41_ManipulateRaknoidIntoAttackingVaarphig(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_42_UseSolaratorToUnshieldXtalixHomeworld(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_43_InvestigateMauluskaDisappearanceAndGetFamorfexCaster(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_44_ReturnToEarthStationCheckUpdatesAndHireSupial(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_45_ShowSupialToRaptodactylAndSparkCivilWar(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_46_MeetTheDaaskappAndTradeTtorstingCasterForOrb(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_47_StealSpiralFromVaarphig(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_48_RepairExtramaticWithSpareParts(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_49_MeetGrimmotzAndGiveThemRepairedExtramatic(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_50_ClaimBombFromGrimmotzTerritory(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_51_ReturnToFamorfexThenDefeatAndAbductMindomini(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_52_ReturnToEarthAndConvertFlagshipToCarryBomb(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_53_GoToLocationOfForerunnerBattlesystem(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_54_DestroyTheFleetsAroundForerunnerBattlesystem(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_55_DestroyTheShieldAroundForerunnerBattlesystem(universe: Universe): void
	{
		throw new Error("todo");
	}

	playFromStart_56_DestroyTheForerunnerBattlesystem(universe: Universe): void
	{
		throw new Error("todo");
	}

	// Helper methods.

	acknowledgeMessage(universe: Universe): void
	{
		this.assertVenueCurrentIsOfTypeForUniverse(VenueMessage.name, universe);
		var venueMessage = universe.venueCurrent() as VenueMessage<any>;
		var world = universe.world;
		var place = world.place();
		var uwpe = new UniverseWorldPlaceEntities(universe, world, place, null, null);
		venueMessage.acknowledge(uwpe);
		this.waitForTicks(universe, 5);
	}

	assertPlaceCurrentIsOfTypeForWorld
	(
		placeTypeNameExpected: string, world: World
	): void
	{
		return this.assertPlaceCurrentIsOfTypesForWorld
		(
			[ placeTypeNameExpected ], world
		);
	}

	assertPlaceCurrentIsOfTypesForWorld
	(
		placeTypeNamesExpected: string[], world: World
	): void
	{
		var place = world.placeCurrent;
		var placeTypeName = place.constructor.name;
		Assert.isTrue(placeTypeNamesExpected.indexOf(placeTypeName) >= 0);
	}

	assertVenueCurrentIsOfTypeForUniverse
	(
		venueTypeNameExpected: string, universe: Universe
	): void
	{
		var venue = universe.venueCurrent();
		var venueTypeName = venue.constructor.name;
		Assert.areStringsEqual(venueTypeNameExpected, venueTypeName);
	}

	buyFuelFromMurchAndSellToEarthStation(universe: Universe): void
	{
		// Fill up on fuel to sell back at the Earth station.
		var world = universe.world as WorldExtended;
		var player = world.player;
		var flagship = player.flagship;

		var fuelBeforeBuyingFromMurch = flagship.fuel;
		this.goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe);
		var fuelAfterBuyingFromMurch = flagship.fuel;
		var fuelBoughtFromMurch =
			fuelAfterBuyingFromMurch - fuelBeforeBuyingFromMurch;
		Assert.isTrue(fuelBoughtFromMurch > 0);

		// hack - In case we're on top of Sol, move over and then back.
		var placeHyperspace = world.place() as PlaceHyperspace;
		var playerEntity = Playable.entityFromPlace(placeHyperspace);
		Locatable.of(playerEntity).pos().add(Coords.fromXY(50, 0));
		this.waitForTicks(universe, 1);

		this.goToEarthStationDocks(universe);
		var placeStationDock = world.place() as PlaceStationDock;

		// Sell all the fuel obtained from the Murch.

		var fuelBeforeSellingToEarthStation = flagship.fuel;
		var resourceCreditsBefore = flagship.resourceCredits;

		var uwpe = UniverseWorldPlaceEntities.fromUniverse(universe);
		placeStationDock.fuelSellAll(uwpe);

		var fuelAfterSellingToStation = flagship.fuel;
		Assert.areNumbersEqual(0, fuelAfterSellingToStation);

		var resourceCreditsAfter = flagship.resourceCredits;

		var fuelSold =
			fuelBeforeSellingToEarthStation - fuelAfterSellingToStation;
		var resourceCreditsFromSale =
			resourceCreditsAfter - resourceCreditsBefore;

		var fuelPriceExpected = fuelSold * placeStationDock.fuelValuePerUnit;
		Assert.areNumbersEqual(Math.round(fuelPriceExpected), Math.round(resourceCreditsFromSale));

		placeStationDock.leave(world);
		this.waitForTicks(universe, 1);
		var placeStation = world.place() as PlaceStation;
		placeStation.leave(world);
		this.waitForTicks(universe, 1);
	}

	callMerchantsAndWaitForContact(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		const deviceTtorstingCasterName = "TtorstingCaster";
		var uwpe = UniverseWorldPlaceEntities.fromUniverseAndWorld(universe, world);
		var flagship = world.player.flagship;
		flagship.deviceWithNameUse(deviceTtorstingCasterName, uwpe);

		// Wait for the merchants to approach and start an encounter.
		this.waitForTicks(universe, 100);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);
	}

	cheatToWinCombat(universe: Universe): void
	{
		universe.updateForTimerTick();
		var world = universe.world;
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceCombat.name, world);

		var placeCombat = world.placeCurrent as PlaceCombat;
		var combat = placeCombat.combat;

		var shipGroupForPlayer = combat.shipGroups[0];
		var shipForPlayer = shipGroupForPlayer.shipFirst();
		combat.shipsFighting[0] = shipForPlayer;
		var uwpe = UniverseWorldPlaceEntities.fromUniverse(universe);
		combat.fight(uwpe);
		this.waitForTicks(universe, 100);

		var shipEnemy = combat.shipsFighting[1];
		var shipEnemyAsEntity =  placeCombat.entityByName(shipEnemy.name);
		Killable.of(shipEnemyAsEntity).kill();

		this.waitForTicks(universe, 100);

		// Verify that we're seeing a post-battle debriefing screen.

		this.assertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);

		var venue = universe.venueCurrent();
		var venueControls = venue as VenueControls;
		var containerChoice = venueControls.controlRoot as ControlContainer;
		var buttonAcknowledge =
			containerChoice.childByName("buttonAcknowledge") as ControlButton<any>;
		buttonAcknowledge.click();

		this.waitForTicks(universe, 100);
	}

	findEntityWithName(universe: Universe, targetEntityName: string, partialMatchAllowed: boolean): Entity
	{
		var entityFound =
			partialMatchAllowed
			? this.findEntityWithNamePartial(universe, targetEntityName)
			: this.findEntityWithNameExact(universe, targetEntityName);

		return entityFound;
	}

	findEntityWithNameExact(universe: Universe, targetEntityName: string): Entity
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

	findEntityWithNamePartial(universe: Universe, targetEntityName: string): Entity
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

	goToEarthStation(universe: Universe): void
	{
		this.goToVicinityOfPlanetWithName(universe, "Earth");
		this.moveToEntityWithNameAndWait(universe, "Earth Station");
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceStation.name, universe.world);
	}

	goToEarthStationDocks(universe: Universe): void
	{
		this.goToEarthStation(universe);
		var world = universe.world;
		var placeStation = world.place() as PlaceStation;
		placeStation.dock(universe);
		this.waitForTicks(universe, 1);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceStationDock.name, world);
	}

	goToHyperspace(universe: Universe): void
	{
		// todo - Leave the planet surface?
		this.leavePlanetOrbitAndWait(universe);
		this.leavePlanetVicinityAndWait(universe);
		this.leaveStarsystemAndWait(universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, universe.world);
	}

	goToHyperspaceCallMerchantsSellAnythingOfValueAndBuyFuel(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var player = world.player;
		var flagship = player.flagship;

		// Go to hyperspace and call the merchants with the caster.
		this.goToHyperspace(universe);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);

		this.callMerchantsAndWaitForContact(universe);

		var placeEncounter = world.place() as PlaceEncounter;
		var encounter = placeEncounter.encounter;
		var talker = Talker.of(encounter.entityOther);

		var rainbowWorldLocationsKnownButUnsoldCount =
			player.rainbowWorldLocationsKnownButUnsoldCount();

		if (rainbowWorldLocationsKnownButUnsoldCount > 0)
		{
			// Record how many infoCredits the player had before the sale.
			var infoCreditsBeforeSaleOfRainbowWorldLocation = flagship.infoCredits;

			// Sell it.
			this.talkToTalker
			(
				universe,
				talker,
				[
					// "Hello.  Buying or selling."
					"#(sell)", // "Selling."
					// "Selling what?"
					"#(sell_rainbow_locations)", // "Rainbow world locations."
					// "You know where 1 is, worth 500."
				]
			);

			var rainbowWorldLocationsKnownButUnsoldCount =
				player.rainbowWorldLocationsKnownButUnsoldCount();
			Assert.areNumbersEqual(0, rainbowWorldLocationsKnownButUnsoldCount); 

			var infoCreditsAfterSaleOfRainbowWorldLocation = flagship.infoCredits;
			var infoCreditsFromSaleOfRainbowWorldLocation =
				infoCreditsAfterSaleOfRainbowWorldLocation
				- infoCreditsBeforeSaleOfRainbowWorldLocation;
			const infoCreditsPerRainbowWorldLocation = 500;
			Assert.areNumbersEqual(
				infoCreditsPerRainbowWorldLocation,
				infoCreditsFromSaleOfRainbowWorldLocation
			);
		}

		// todo - Sell any lifeform data as well.

		// Now buy more fuel and then end the conversation.

		this.talkToTalker
		(
			universe,
			talker,
			[
				"#(buy)", // "I'd like to buy something."
				// "What would you like to buy?"
				"#(buy_fuel)", // "Fuel."
				// "How much?"
				"#(fill_me_up)", // "Fill me up."
				// "What else would you like to buy?"
				"#(done_buying)",
				// "Anything else?"
				"#(be_leaving_now)"
			]
		);

		this.assertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);
	}

	goToOrbitOfPlanetWithName(universe: Universe, planetName: string): void
	{
		this.goToVicinityOfPlanetWithName(universe, planetName);
		if (planetName.split("-").length == 1)
		{
			// Consider: "Earth", "Moon", "Alpha Centauri I", "Alpha Centauri I-a", "Arcturus I", "Arcturus I-a"
			planetName = Planet.name;
		}
		this.moveToEntityWithNameAndWait(universe, planetName);

		var placeTypesExpectedNames =
		[
			PlacePlanetOrbit.name, // Colliding with most planets will take you to orbit,
			PlaceEncounter.name, // but some special planets will instead initiate an encounter.
		];

		var world = universe.world;
		var place = world.place();
		var placeTypeName = place.constructor.name;
		Assert.isTrue(placeTypesExpectedNames.indexOf(placeTypeName) >= 0);
	}

	goToRainbowWorldInStarsystemWithName(starsystemName: string, universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		this.goToStarsystemWithName(universe, starsystemName);
		this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);

		var player = world.player;

		this.moveToEntityWithNameAndWait(universe, starsystemName + " I");
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		var rainbowWorldLocationsKnownButUnsoldCountBefore =
			player.rainbowWorldLocationsKnownButUnsoldCount();

		this.moveToEntityWithNameAndWait(universe, Planet.name);
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);

		var placeOrbit = world.place() as PlacePlanetOrbit;
		var planet = placeOrbit.planet;
		Assert.areStringsEqual("Rainbow", planet.defnName);

		var rainbowWorldLocationsKnownButUnsoldCountAfter =
			player.rainbowWorldLocationsKnownButUnsoldCount();

		var rainbowWorldsDiscoveredCount =
			rainbowWorldLocationsKnownButUnsoldCountAfter
			- rainbowWorldLocationsKnownButUnsoldCountBefore;

		Assert.areNumbersEqual(1, rainbowWorldsDiscoveredCount); 
	}

	goToStarsystemWithName(universe: Universe, starsystemName: string): void
	{
		var world = universe.world;
		var placeStart = world.place();
		var placeStartTypeName = placeStart.constructor.name;
		var starsystemStart =
			placeStartTypeName == PlacePlanetSurface.name
			? (placeStart as PlacePlanetSurface).starsystem()
			: placeStartTypeName == PlacePlanetOrbit.name
			? (placeStart as PlacePlanetOrbit).starsystem()
			: placeStartTypeName == PlacePlanetVicinity.name
			? (placeStart as PlacePlanetVicinity).starsystem()
			: placeStartTypeName == PlaceStarsystem.name
			? (placeStart as PlaceStarsystem).starsystem
			: null;

		//if (placeStart.name == placeDestinationName)
		if (starsystemStart != null && starsystemStart.name == starsystemName)
		{
			starsystemActual = starsystemStart;
		}
		else
		{
			this.goToHyperspace(universe);
			this.moveToEntityWithNameAndWait(universe, starsystemName);
			this.assertPlaceCurrentIsOfTypeForWorld(PlaceStarsystem.name, world);
			var starsystemActual = (world.place() as PlaceStarsystem).starsystem;
		}
		Assert.areStringsEqual(starsystemName, starsystemActual.name);
	}

	goToSurfaceOfPlanetWithName(universe: Universe, planetName: string): void
	{
		this.goToOrbitOfPlanetWithName(universe, planetName);
		this.landOnPlanetSurface(universe, universe.world, universe.world.placeCurrent);
	}

	goToVicinityOfPlanetWithName(universe: Universe, planetName: string): void
	{
		var world = universe.world;
		var place = world.place();
		var placeTypeName = place.constructor.name;

		if (placeTypeName == PlacePlanetVicinity.name)
		{
			var placePlanetVicinity = place as PlacePlanetVicinity;
			var planet = placePlanetVicinity.planet;
			if (planet.name == planetName)
			{
				// Do nothing.
			}
			else if (planetName.startsWith(planet.name) )
			{
				// The destination is a moon in the same system.
				this.moveToEntityWithNameAndWait(universe, planetName);
			}
			else
			{
				this.leavePlanetVicinityAndWait(universe);
				this.goToStarsystemWithName(universe, placePlanetVicinity.starsystem().name);
				this.goToVicinityOfPlanetWithName(universe, planetName);
			}
		}
		else
		{
			if (planetName.indexOf("-") >= 0)
			{
				// It's a moon.
				planetName = planetName.split("-")[0];
			}

			var starsystemName =
				(
					planetName == "Mercury"
					|| planetName == "Earth"
					|| planetName == "Pluto"
				)
				? "Sol"
				: planetName.substr(0, planetName.lastIndexOf(" "));

			this.goToStarsystemWithName(universe, starsystemName);
			this.moveToEntityWithNameAndWait(universe, planetName);
		}

		this.assertPlaceCurrentIsOfTypesForWorld
		(
			[ PlacePlanetVicinity.name, PlaceEncounter.name ], world
		);
	}

	landOnPlanetSurface(universe: Universe, world: World, place: Place): void
	{
		var placeOrbit = place as PlacePlanetOrbit;
		placeOrbit.land(universe);
		universe.updateForTimerTick();
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, world);
	}

	leavePlanetOrbitAndWait(universe: Universe): void
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

	leavePlanetVicinityAndWait(universe: Universe): void
	{
		var placeCurrent = universe.world.place();
		if (placeCurrent.constructor.name == PlacePlanetVicinity.name)
		{
			this.leavePlanetVicinityOrStarsystem(universe);

			// hack - Is this necessary?
			// Some delay may be needed to wait for the fader to finish fading.
			// The way the test is set up, this wait requires some fine-tuning.
			this.waitForTicks(universe, 10); // 250); 
		}
	}

	leavePlanetVicinityOrStarsystem(universe: Universe): void
	{
		var place = universe.world.placeCurrent;

		var player = place.entityByName(Player.name);
		var playerPos = Locatable.of(player).loc.pos;
		var placeSize = place.size();
		playerPos.overwriteWith(placeSize).double();
	}

	leaveStarsystemAndWait(universe: Universe): void
	{
		var placeCurrent = universe.world.place();
		if (placeCurrent.constructor.name == PlaceStarsystem.name)
		{
			this.leavePlanetVicinityOrStarsystem(universe);
			this.waitForTicks(universe, 10); // hack - Exactly how long is necessary?
		}
	}

	leaveStation(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var place = world.place();
		if (place.constructor.name == PlaceStationDock.name)
		{
			var placeStationDock = place as PlaceStationDock;
			placeStationDock.leave(world);
			this.waitForTicks(universe, 1);
		}
		place = world.place();
		if (place.constructor.name == PlaceStation.name)
		{
			var placeStation = place as PlaceStation;
			placeStation.leave(world);
			this.waitForTicks(universe, 1);
		}
	}

	moveToEntityAndWait(universe: Universe, targetEntity: Entity): void
	{
		var place = universe.world.place();

		var targetPos = Locatable.of(targetEntity).loc.pos;

		var entityPlayer = place.entityByName(Player.name);
		let playerPos = Locatable.of(entityPlayer).loc.pos;

		var placeTypeName = place.constructor.name;

		if (placeTypeName == PlaceHyperspace.name)
		{
			// These measurements are in pixels.
			var displacementFromPlayerToTarget =
				targetPos.clone().subtract(playerPos);
			var distanceFromPlayerToTarget =
				displacementFromPlayerToTarget.magnitude();

			var placeHyperspace = place as PlaceHyperspace;
			var spaceBeingTraversed = placeHyperspace.hyperspace;
			var pixelsPerFuelUnit = spaceBeingTraversed.pixelsTraversablePerFuelUnit;
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

		// hack - How long is necessary to wait?
		// 20 seems to work most of the time,
		// but sometimes results in the guard drone accosting the player too soon
		// at the game's start.
		// Maybe there is no correct answer in all cases!
		this.waitForTicks(universe, 20);
	}

	moveToEntityAtPosAndWait(universe: Universe, targetEntityPos: Coords): void
	{
		var place = universe.world.place();
		var placeEntities = place.entitiesAll();
		var placeEntitiesLocatable =
			placeEntities.filter(x => Locatable.of(x) != null);
		var targetEntity =
			placeEntitiesLocatable.find(x => Locatable.of(x).pos().equals(targetEntityPos) );
		this.moveToEntityAndWait(universe, targetEntity);
	}

	moveToEntityWithNameAndWait(universe: Universe, targetEntityName: string): void
	{
		return this.moveToEntityWithNameAndWait_CheckPartial(universe, targetEntityName, false);
	}

	moveToEntityWithNameAndWait_CheckPartial(universe: Universe, targetEntityName: string, partialMatchAllowed: boolean): void
	{
		// This is pretty cheaty right now.  The player just teleports directly to the desired position.

		var targetEntity =
			this.findEntityWithName(universe, targetEntityName, partialMatchAllowed);

		if (targetEntity == null)
		{
			throw new Error("No entity was found matching the name '" + targetEntityName + "'.");
		}
		else
		{
			this.moveToEntityAndWait(universe, targetEntity);
		}
	}

	moveToShipGroupBelongingToFactionIfAny
	(
		universe: Universe, world: WorldExtended, starsystem: Starsystem, factionName: string
	): void
	{
		var shipGroupsInStarsystemAtLarge = starsystem.shipGroups(world);
		var shipGroupBelongingToFaction =
			shipGroupsInStarsystemAtLarge.find(x => x.factionName == factionName);

		if (shipGroupBelongingToFaction == null)
		{
			var planets = starsystem.planets;
			for (var i = 0; i < planets.length; i++)
			{
				var planet = planets[i];
				var shipGroupsInPlanetVicinity = planet.shipGroupsInVicinity();
				shipGroupBelongingToFaction = shipGroupsInPlanetVicinity.find
				(
					x => x.factionName == factionName
				);
				if (shipGroupBelongingToFaction != null)
				{
					this.moveToEntityWithNameAndWait(universe, planet.name);
					break;
				}
			}
		}

		Assert.isNotNull(shipGroupBelongingToFaction);

		// Move to the ship and start an encounter (or, if friendly, just a talk).

		this.moveToEntityWithNameAndWait(universe, shipGroupBelongingToFaction.name);
	}

	moveToEnergySourceOnPlanetSurfaceAcknowledgeMessageAndLeave
	(
		universe: Universe, energySourceName: string
	): void
	{
		this.moveToEnergySourceOnPlanetSurfaceAndAcknowledgeMessage(universe, energySourceName);
		// ...and then return to the ship automatically.
		var world = universe.world;
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
	}

	moveToEnergySourceOnPlanetSurfaceAndAcknowledgeMessage
	(
		universe: Universe, energySourceName: string
	): void
	{
		var world = universe.world;

		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, world);

		// Go to the energy source.
		this.moveToEntityWithNameAndWait(universe, energySourceName);

		// The lander should display a report message, which must be acknowledged...
		this.acknowledgeMessage(universe);

		universe.updateForTimerTick();
	}

	returnToOrbit(universe: Universe, world: World, place: Place)
	{
		var placeSurface = place as PlacePlanetSurface;
		placeSurface.exit
		(
			new UniverseWorldPlaceEntities(universe, world, placeSurface, null, null)
		);
		universe.updateForTimerTick();
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
	}

	stunAllLifeformsOnPlanetSurfaceCollectBiodataAndLeave(universe: Universe): void
	{
		var world = universe.world;

		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetSurface.name, world);

		var place = world.place();
		var placePlanetSurface = place as PlacePlanetSurface;
		var entitiesOnPlanet = placePlanetSurface.entitiesAll();
		var entitiesLifeforms =
			entitiesOnPlanet.filter(x => x.name.startsWith(Lifeform.name) );
		for (var i = 0; i < entitiesLifeforms.length; i++)
		{
			var entity = entitiesLifeforms[i];
			Killable.of(entity).kill();
		}

		var resourceDefns = ResourceDefn.Instances();
		var resourceDefnBiodata = resourceDefns.Biodata;

		var entitiesResourcesBiodata =
			entitiesOnPlanet
				.filter(x => Resource.fromEntity(x) != null)
				.filter(x => Resource.fromEntity(x).defnName == resourceDefnBiodata.name);

		// Pick up all the biodata.
		// todo - Check for maximum capacity.

		for (var i = 0; i < entitiesResourcesBiodata.length; i++)
		{
			var entity = entitiesResourcesBiodata[i];
			try
			{
				this.moveToEntityWithNameAndWait(universe, entity.name);
			}
			catch (err)
			{
				// Errors may be happening because some resources overlap,
				// and are thus picked up by accident when picking up some other resource.
			}
		}

		var uwpe = new UniverseWorldPlaceEntities(universe, world, placePlanetSurface, null, null);
		placePlanetSurface.exit(uwpe);
		this.waitForTicks(universe, 1);
		this.assertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);
	}

	talkToTalker(universe: Universe, talker: Talker, optionsToSelect: string[] ): void
	{
		this.waitUntilVenueCurrentIsConversation(universe);

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

	talkToTalker2(universe: Universe, optionsToSelect: string[] ): void
	{
		var placeEncounter = universe.world.place() as PlaceEncounter;
		placeEncounter.encounter.talk(universe);

		universe.updateForTimerTick();

		var encounter = placeEncounter.encounter;
		var entityOther = encounter.entityOther;
		var talker = Talker.of(entityOther);
		this.talkToTalker(universe, talker, optionsToSelect);
	}

	waitForTicks(universe: Universe, ticksToWait: number): void
	{
		for (var i = 0; i < ticksToWait; i++)
		{
			universe.updateForTimerTick();
			universe.timerHelper.ticksSoFar++; // hack
		}
	}

	waitUntilVenueCurrentIsConversation(universe: Universe): void
	{
		while (universe.venue().constructor.name != VenueConversationRun.name)
		{
			this.waitForTicks(universe, 1);
		}
	}
}
