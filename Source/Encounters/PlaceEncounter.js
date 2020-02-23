
function PlaceEncounter(world, encounter)
{
	this.encounter = encounter;

	var entities = [];
	Place.call(this, PlaceEncounter.name, PlaceEncounter.name, null, entities);
}
{
	// superclass

	PlaceEncounter.prototype = Object.create(Place.prototype);
	PlaceEncounter.prototype.constructor = Place;

	// methods

	PlaceEncounter.prototype.fight = function(universe)
	{
		var world = universe.world;
		var placeEncounter = world.place;
		var encounter = placeEncounter.encounter;
		var displaySize = universe.display.sizeInPixels;
		var combatSize = new Coords(1, 1).multiplyScalar(displaySize.y * 2);
		var player = world.player;
		var shipGroups = [player.shipGroup, encounter.shipGroupOther];
		var combat = new Combat(combatSize, encounter, shipGroups).initialize(world);
		var shipSelect = combat.toControlShipSelect(universe, universe.display.sizeInPixels);
		universe.venueNext = new VenueControls(shipSelect);
	}

	PlaceEncounter.prototype.talk = function(universe)
	{
		var world = universe.world;
		var placeEncounter = world.place;
		var encounter = placeEncounter.encounter;
		var faction = this.encounter.faction(universe.world);
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
			function quit()
			{
				encounter.returnToPlace(world);
				universe.venueNext = venueToReturnTo;
			},
			universe
		);
		var conversationSize = universe.display.sizeDefault().clone();
		var conversationAsControl =
			conversation.toControl(conversationSize, universe);

		var venueNext = new VenueControls(conversationAsControl);

		universe.venueNext = venueNext;
	}

	// Place

	PlaceEncounter.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceEncounter.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		if (this.venueControls != null)
		{
			this.venueControls.draw(universe, world);
		}
	}

	PlaceEncounter.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceEncounter.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);

		if (this.venueControls == null)
		{
			var encounter = this.encounter;
			var shipGroupOther = encounter.shipGroupOther;
			var shipGroupOtherDescription = shipGroupOther.toStringDescription()

			var newline = "\n";
			var messageToShow =
				"Encounter" + newline
				+ "with " + shipGroupOtherDescription + newline
				+ "near " + encounter.planet.name;

			var size = new Coords(400, 300); // hack - size

			var factionName = encounter.factionName;
			var faction = universe.world.defns.factions[factionName];

			if (faction.talksImmediately == true)
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
				messageToShow,
				choiceNames,
				choiceActions
			);

			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}
}
