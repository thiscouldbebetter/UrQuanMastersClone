
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

			var controlRoot = universe.controlBuilder.choice
			(
				universe,
				universe.display.sizeInPixels.clone(),
				messageToShow,
				[ "Talk", "Fight" ],
				[
					function talk(universe)
					{
						var world = universe.world;
						var placeEncounter = world.place;
						var encounter = placeEncounter.encounter;
						var conversation = new Conversation(size, encounter);
						world.placeNext = new PlaceConversation(world, conversation);
					},

					function fight(universe)
					{
						var world = universe.world;
						var placeEncounter = world.place;
						var encounter = placeEncounter.encounter;
						var combat = new Combat(size, encounter);
						world.placeNext = new PlaceCombat(world, combat);
					}
				]
			);

			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}
}
