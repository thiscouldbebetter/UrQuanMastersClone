
function PlaceConversation(world, conversation)
{
	this.conversation = conversation;

	var entities = [];
	Place.call(this, entities);
}
{
	PlaceConversation.prototype = Object.create(Place.prototype);
	PlaceConversation.prototype.constructor = Place;

	PlaceConversation.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceConversation.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		if (this.venueControls != null)
		{
			this.venueControls.draw(universe, world);
		}
	}

	PlaceConversation.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceConversation.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);

		if (this.venueControls == null)
		{
			var messageToShow = "[Conversation]";

			var controlRoot = universe.controlBuilder.message
			(
				universe,
				universe.display.sizeInPixels.clone(),
				messageToShow,
				function acknowledge(universe)
				{
					var world = universe.world;
					var placeConversation = world.place;
					var conversation = placeConversation.conversation;
					var encounter = conversation.encounter;
					encounter.returnToPlace(world);
				}
			);

			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}
}
