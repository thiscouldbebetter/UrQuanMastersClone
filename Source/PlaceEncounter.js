
function PlaceEncounter(world, encounter)
{
	this.encounter = encounter;

	var entities = [];
	Place.call(this, entities);
}
{
	PlaceEncounter.prototype = Object.create(Place.prototype);
	PlaceEncounter.prototype.constructor = Place;

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
			var messageToShow = "[Encounter]";

			var size = new Coords(400, 300); // hack - size

			var choiceActionTalk = function(universe)
			{
				var world = universe.world;
				var placeEncounter = world.place;
				var encounter = placeEncounter.encounter;

				var conversationDefnAsJSON =
					universe.mediaLibrary.textStringGetByName("Conversation").value;
				var conversationDefn = ConversationDefn.deserialize(conversationDefnAsJSON);
				var conversation = new ConversationRun(conversationDefn);
				var conversationSize = universe.display.sizeDefault.clone();
				var conversationAsControl =
					conversation.toControl(conversationSize, universe);

				var venueNext = new VenueControls(conversationAsControl);

				universe.venueNext = venueNext;
			};

			var choiceActionFight = function(universe)
			{
				var world = universe.world;
				var placeEncounter = world.place;
				var encounter = placeEncounter.encounter;
				var combat = new Combat(size, encounter);
				world.placeNext = new PlaceCombat(world, combat);
			}

			var choiceNames = [ "Talk" ];
			var choiceActions = [ choiceActionTalk ];

			var factionName = this.encounter.shipGroupOther.factionName;
			var faction = universe.world.defns.factions[factionName];
			if (faction.isHostile == true)
			{
				choiceNames.push("Fight");
				choiceActions.push(choiceActionFight);
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
