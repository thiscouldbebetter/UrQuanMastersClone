
function PlaceStation(world, station, placePlanetVicinity)
{
	this.station = station;
	this.placePlanetVicinity = placePlanetVicinity;

	var entities = [];
	Place.call(this, entities);
}
{
	// superclass

	PlaceStation.prototype = Object.create(Place.prototype);
	PlaceStation.prototype.constructor = Place;

	// methods

	PlaceStation.prototype.dock = function(universe)
	{
		var world = universe.world;
		var size = universe.display.sizeInPixels;
		var placeStation = world.place;
		var placeNext = new PlaceStationDock(world, placeStation);
		world.placeNext = placeNext;
	}

	PlaceStation.prototype.leave = function(universe)
	{
		var world = universe.world;
		var place = world.place;
		var placePrev = place.placePlanetVicinity;
		var size = placePrev.size;
		var planet = placePrev.planet;
		var station = place.station;
		var playerPosNext = station.posAsPolar.toCoords
		(
			new Coords()
		).add
		(
			size.clone().half()
		).add
		(
			new Coords(3, 0).multiplyScalar(10)
		);
		var placeNext = new PlacePlanetVicinity
		(
			world, size, planet, playerPosNext, placePrev.placeStarsystem
		);
		world.placeNext = placeNext;
	}

	PlaceStation.prototype.talk = function(universe)
	{
		var world = universe.world;
		var size = universe.display.sizeInPixels;
		var placeStation = world.place;
		var factionName = this.station.factionName;
		var faction = world.defns.factions[factionName];
		var conversationDefnName = faction.conversationDefnName;
		var conversationResourceName = "Conversation-" + conversationDefnName;
		var conversationDefnAsJSON =
			universe.mediaLibrary.textStringGetByName(conversationResourceName).value;
		var conversationDefn = ConversationDefn.deserialize(conversationDefnAsJSON);
		var conversation = new ConversationRun
		(
			conversationDefn,
			function quit()
			{
				world.place = placeStation.placePlanetVicinity;
				universe.venueNext = new VenueWorld(world);
			},
			universe
		);
		var conversationAsControl = conversation.toControl(size, universe);
		universe.venueNext = new VenueControls(conversationAsControl);
	}

	// Place

	PlaceStation.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceStation.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		this.venueControls.draw(universe, world);
	}

	PlaceStation.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceStation.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);
		if (this.venueControls == null)
		{
			var messageToShow = "[Station]";
			var placeStation = this;

			var controlRoot = universe.controlBuilder.choice
			(
				universe,
				universe.display.sizeInPixels.clone(),
				messageToShow,
				[ "Talk", "Dock", "Leave", ],
				[
					function talk(universe)
					{
						placeStation.talk(universe);
					},

					function dock(universe)
					{
						placeStation.dock(universe);
					},

					function leave(universe)
					{
						placeStation.leave(universe);
					}
				]
			);

			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}

	PlaceStation.prototype.returnToPlace = function(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entities["Player"];
		var playerLoc = playerFromPlaceNext.locatable.loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
