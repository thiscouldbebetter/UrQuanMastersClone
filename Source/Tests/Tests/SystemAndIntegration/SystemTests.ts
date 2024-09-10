
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

		var venue = () => universe.venueCurrent();
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

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Verify that a guard drone is present.

		var guardDroneName = "Enemy";
		var guardDrone = place().entityByName(guardDroneName);
		Assert.isNotNull(guardDrone);

		// Wait for the guard drone to approach the player
		// and initiate a conversation.

		this.playFromStart_WaitForTicks(universe, 1000);
		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueControls.name, universe);

		// Leave the conversation.

		var venueConversation = venue() as VenueControls;
		var containerConversation = venueConversation.controlRoot as ControlContainer;
		var buttonNext =
			containerConversation.childByName("buttonNextUnderPortrait") as ControlButton<unknown>;
		Assert.isNotNull(buttonNext);

		while (universe.venueCurrent() == venueConversation)
		{
			buttonNext.click();
			universe.updateForTimerTick();
		}

		// Verify that we're back in the world venue.
		this.playFromStart_AssertVenueCurrentIsOfTypeForUniverse(VenueWorld.name, universe);

		// Wait for the guard drone to clear the area,
		// and verify that it's gone.

		this.playFromStart_WaitForTicks(universe, 1000);
		guardDrone = place().entityByName(guardDroneName);
		Assert.isNull(guardDrone);

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
		var radioactivesHeld =
			playerItemHolder.itemsByDefnName(itemDefnNameRadioactives)[0];
		Assert.isNull(radioactivesHeld);

		// Land on the planet.

		var placeOrbit = place() as PlacePlanetOrbit;
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

		var placeSurface = place() as PlacePlanetSurface;
		placeSurface.exit
		(
			new UniverseWorldPlaceEntities(universe, world, placeSurface, null, null)
		);
		universe.updateForTimerTick();
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetOrbit.name, world);

		// Verify that the cargo holds now contain something.

		var radioactivesHeld =
			playerItemHolder.itemsByDefnName(itemDefnNameRadioactives)[0];
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

		var placeEncounter = place() as PlaceEncounter;
		station = placeEncounter.entityByName(stationName);
		talker = station.talker();
		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
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
			]
		);

		universe.updateForTimerTick();

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

		// Talk to the commander again.

		station = place().entityByName(stationName);
		talker = station.talker();
		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
				// "Did you handle the base?",
				"#(base_was_abandoned)"
				// "Well, I'll be darn--INCOMING HOSTILE SHIP!  They're jamming our signal!"
			]
		);

		universe.updateForTimerTick();

		// Now you're talking to the hostile ship.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		placeEncounter = place() as PlaceEncounter;
		var encounter = placeEncounter.encounter;
		Assert.areStringsEqual("Araknoid", encounter.factionName);

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
				// "We aren't reasonable, though."
			]
		);

		this.playFromStart_CheatToWinCombat(universe);

		// Verify that we've returned to the original encounter.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceEncounter.name, world);

		// placeEncounter = place as PlaceEncounter;

		talker = station.talker();
		this.playFromStart_TalkToTalker
		(
			universe, talker,
			[
				// "A human in an alien vessel!"
				"#(where_you_come_from)", // "Where did you come from?"
				// "From fighting in such-and-such star cluster."
				"#(be_reasonable)"
				// "We aren't reasonable, though."
			]
		);


		// Verify that we've returned to the world.

		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlacePlanetVicinity.name, world);

		// Leave the Sol system and go to hyperspace.

		this.playFromStart_LeavePlanetVicinityAndWait(universe);
		this.playFromStart_LeaveStarsystemAndWait(universe);
		this.playFromStart_AssertPlaceCurrentIsOfTypeForWorld(PlaceHyperspace.name, world);

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

		var creditBefore = player.resourceCredits;

		// Destroy the probe (by cheating, in this test).

		this.playFromStart_CheatToWinCombat(universe);

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

		placeOrbit = place() as PlacePlanetOrbit;
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
				"#(how_know)", // "How did you know about us before meeting us?"
				"#(get_on_with_business)", // "Shall we begin trading now?"
				"#(why_turned_purple)", // "Why did your bridge turn purple?"
				"#(sell)", // "I have some things I would like to sell."
			]
		);

		Assert.isTrue(true);

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

	playFromStart_FindEntityWithName(universe: Universe, targetEntityName: string): Entity
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

	playFromStart_LeavePlanetOrbitAndWait(universe: Universe)
	{
		var world = universe.world;
		var place = world.placeCurrent;
		var placeOrbit = place as PlacePlanetOrbit;
		placeOrbit.returnToPlaceParent(universe);
		universe.updateForTimerTick();
	}

	playFromStart_LeavePlanetVicinityAndWait(universe: Universe): void
	{
		this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);

		// hack - Is this necessary?
		// Some delay may be needed to wait for the fader to finish fading.
		// The way the test is set up, this wait requires some fine-tuning.
		this.playFromStart_WaitForTicks(universe, 250); 
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
		this.playFromStart_LeavePlanetVicinityOrStarsystem(universe);
		this.playFromStart_WaitForTicks(universe, 10); // hack - Exactly how long is necessary?
	}

	playFromStart_MoveToEntityWithNameAndWait(universe: Universe, targetEntityName: string): void
	{
		var place = universe.world.placeCurrent;

		var player = place.entityByName(Player.name);
		var playerPos = player.locatable().loc.pos;

		var target = this.playFromStart_FindEntityWithName(universe, targetEntityName);

		if (target != null)
		{
			var targetPos = target.locatable().loc.pos;

			playerPos.overwriteWith(targetPos);
		}

		// hack - How long is necessary to wait?
		this.playFromStart_WaitForTicks(universe, 30);
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
