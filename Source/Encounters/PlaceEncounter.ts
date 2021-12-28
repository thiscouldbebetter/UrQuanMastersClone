
class PlaceEncounter extends Place
{
	encounter: Encounter;

	venueControls: VenueControls;

	constructor(world: World, encounter: Encounter)
	{
		super
		(
			PlaceEncounter.name,
			PlaceEncounter.name,
			null, // parentName
			null, // size
			null // entities
		);

		this.encounter = encounter;
	}

	// methods

	fight(universe: Universe): void
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
		var contentTextStringName = "Conversation-Content-" + conversationDefnName;
		var contentTextString = mediaLibrary.textStringGetByName(contentTextStringName);
		if (contentTextString != null)
		{
			var contentBlocks = contentTextString.value.split("\n\n");

			var contentsById = new Map
			(
				contentBlocks.map
				(
					nodeAsBlock =>
					{
						var indexOfNewlineFirst = nodeAsBlock.indexOf("\n");
						var contentId = nodeAsBlock.substr
						(
							0, indexOfNewlineFirst
						).split("\t")[0];
						var restOfBlock = nodeAsBlock.substr(indexOfNewlineFirst + 1);
						return [ contentId, restOfBlock ];
					}
				)
			);
			conversationDefn.contentSubstitute(contentsById);
			conversationDefn.displayNodesExpandByLines();
		}

		var venueToReturnTo = universe.venueCurrent;

		var conversationQuit = () =>
		{
			encounter.returnToPlace(world);
			universe.venueNext = venueToReturnTo;
		};

		var conversation = new ConversationRun
		(
			conversationDefn,
			conversationQuit,
			encounter.entityPlayer,
			encounter.entityOther,
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

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;

		super.updateForTimerTick(uwpe);

		if (this.venueControls == null)
		{
			var encounter = this.encounter;

			var factionName = encounter.factionName;
			var world = uwpe.world as WorldExtended;
			var worldDefn = world.defnExtended();
			var faction = worldDefn.factionByName(factionName);

			if (faction.talksImmediately)
			{
				this.talk(universe);
				return; // hack
			}

			var shipGroupOther =
				EntityExtensions.shipGroup(encounter.entityOther);
			var shipGroupOtherDescription =
				shipGroupOther.toStringDescription();

			var newline = "\n";
			var messageToShow =
				"Encounter" + newline
				+ "with " + shipGroupOtherDescription + newline
				+ "near " + encounter.planet.name;

			var choiceNames = [ "Talk" ];
			var choiceActions = [ () => this.talk(universe) ];

			if (faction.relationsWithPlayer == Faction.RelationsHostile)
			{
				choiceNames.push("Fight");
				choiceActions.push( () => this.fight(universe) );
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
