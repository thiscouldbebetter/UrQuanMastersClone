
class PlaceEncounter extends Place
{
	encounter: Encounter;

	venueControls: VenueControls;

	constructor(world: World, encounter: Encounter)
	{
		super(PlaceEncounter.name, PlaceEncounter.name, null, new Array<Entity>());

		this.encounter = encounter;
	}

	// methods

	fight(universe: Universe)
	{
		var world = universe.world as WorldExtended;
		var placeEncounter = world.placeCurrent as PlaceEncounter;
		var encounter = placeEncounter.encounter;
		var displaySize = universe.display.sizeInPixels;
		var combatSize = Coords.fromXY(1, 1).multiplyScalar(displaySize.y * 2);
		var player = world.player;
		var shipGroupOther = EntityExtensions.shipGroup(encounter.entityOther);
		var shipGroups = [player.shipGroup, shipGroupOther];
		var combat = new Combat(combatSize, encounter, shipGroups);
		combat.initialize(universe, world, placeEncounter);
		var shipSelect =
			combat.toControlShipSelect(universe, universe.display.sizeInPixels);
		universe.venueNext = VenueControls.fromControl(shipSelect);
	}

	talk(universe: Universe)
	{
		var world = universe.world as WorldExtended;
		var placeEncounter = world.placeCurrent as PlaceEncounter;
		var encounter = placeEncounter.encounter;
		var faction = this.encounter.faction(world);
		var conversationDefnName = faction.conversationDefnName;
		var conversationResourceName = "Conversation-" + conversationDefnName;
		var mediaLibrary = universe.mediaLibrary;
		var conversationDefnAsJSON =
			mediaLibrary.textStringGetByName(conversationResourceName).value;
		var conversationDefn = ConversationDefn.deserialize(conversationDefnAsJSON);
		var contentTextStringName = conversationDefn.contentTextStringName;
		if (contentTextStringName != null)
		{
			var contentTextString = mediaLibrary.textStringGetByName(contentTextStringName);
			conversationDefn.expandFromContentTextString(contentTextString);
		}
		var venueToReturnTo = universe.venueCurrent;
		var conversation = new ConversationRun
		(
			conversationDefn,
			() => // quit
			{
				encounter.returnToPlace(world);
				universe.venueNext = venueToReturnTo;
			},
			null, // universe
			null // ?
		);
		var conversationSize = universe.display.sizeDefault().clone();
		var conversationAsControl =
			conversation.toControl(conversationSize, universe);

		var venueNext = VenueControls.fromControl(conversationAsControl);

		universe.venueNext = venueNext;
	}

	// Place

	draw(universe: Universe, world: World)
	{
		//super.draw(universe, world);
		if (this.venueControls != null)
		{
			this.venueControls.draw(universe);
		}
	}

	updateForTimerTick(universe: Universe, worldAsWorld: World)
	{
		var world = worldAsWorld as WorldExtended;

		super.updateForTimerTick(universe, world);

		if (this.venueControls == null)
		{
			var encounter = this.encounter;
			var shipGroupOther = EntityExtensions.shipGroup(encounter.entityOther);
			var shipGroupOtherDescription = shipGroupOther.toStringDescription()

			var newline = "\n";
			var messageToShow =
				"Encounter" + newline
				+ "with " + shipGroupOtherDescription + newline
				+ "near " + encounter.planet.name;

			var factionName = encounter.factionName;
			var worldDefn = world.defnExtended();
			var faction = worldDefn.factionByName(factionName);

			if (faction.talksImmediately)
			{
				this.talk(universe);
				return; // hack
			}

			var choiceNames = [ "Talk" ];
			var choiceActions = [ this.talk.bind(this) ];

			if (faction.relationsWithPlayer == Faction.RelationsHostile)
			{
				choiceNames.push("Fight");
				choiceActions.push(this.fight);
			}

			var controlRoot = universe.controlBuilder.choice
			(
				universe,
				universe.display.sizeInPixels.clone(),
				DataBinding.fromContext(messageToShow),
				choiceNames,
				choiceActions,
				null // ?
			);

			this.venueControls = VenueControls.fromControl(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe);
	}
}
