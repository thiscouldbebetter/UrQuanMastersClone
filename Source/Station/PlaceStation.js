
class PlaceStation extends Place
{
	constructor(world, station, placePlanetVicinity)
	{
		super(PlaceStation.name, PlaceStation.name, null, []);
		this.station = station;
		this.placePlanetVicinity = placePlanetVicinity;
	}

	// methods

	dock(universe)
	{
		var world = universe.world;
		var size = universe.display.sizeInPixels;
		var placeStation = world.placeCurrent;
		var placeNext = new PlaceStationDock(world, placeStation);
		world.placeNext = placeNext;
	}

	leave(universe)
	{
		var world = universe.world;
		var place = world.placeCurrent;
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
		var playerLocNext = new Disposition(playerPosNext);
		var placeNext = new PlacePlanetVicinity
		(
			world, size, planet, playerLocNext, placePrev.placeStarsystem
		);
		world.placeNext = placeNext;
	}

	talk(universe)
	{
		var world = universe.world;
		var size = universe.display.sizeInPixels;
		var placeStation = world.placeCurrent;
		var factionName = this.station.factionName;
		var faction = world.defn.factionByName(factionName);
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

	draw(universe, world)
	{
		//super.draw(universe, world);
		this.venueControls.draw(universe, world);
	}

	updateForTimerTick(universe, world)
	{
		super.updateForTimerTick(universe, world);
		if (this.venueControls == null)
		{
			var messageToShow = "[Station]";
			var placeStation = this;

			var controlRoot = universe.controlBuilder.choice
			(
				universe,
				universe.display.sizeInPixels.clone(),
				DataBinding.fromContext(messageToShow),
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

	returnToPlace(world)
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
		var playerLoc = playerFromPlaceNext.locatable().loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
