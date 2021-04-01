
class PlaceStation extends Place
{
	station: Station;
	placePlanetVicinity: PlacePlanetVicinity;

	placeToReturnTo: Place;
	posToReturnTo: Coords;
	venueControls: VenueControls;

	constructor
	(
		world: World,
		station: Station,
		placePlanetVicinity: PlacePlanetVicinity
	)
	{
		super(PlaceStation.name, PlaceStation.name, null, []);
		this.station = station;
		this.placePlanetVicinity = placePlanetVicinity;
	}

	// methods

	dock(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var placeStation = world.placeCurrent as PlaceStation;
		var placeNext = new PlaceStationDock(world, placeStation);
		world.placeNext = placeNext;
	}

	leave(universe: Universe): void
	{
		var world = universe.world;
		var place = (world.placeCurrent as PlaceStation);
		var placePrev = place.placePlanetVicinity;
		var size = placePrev.size;
		var planet = placePrev.planet;
		var station = place.station;
		var playerPosNext = station.posAsPolar.toCoords
		(
			Coords.create()
		).add
		(
			size.clone().half()
		).add
		(
			Coords.fromXY(3, 0).multiplyScalar(10)
		);
		var playerLocNext = Disposition.fromPos(playerPosNext);
		var placeNext = new PlacePlanetVicinity
		(
			world, size, planet, playerLocNext, placePrev.placeStarsystem
		);
		world.placeNext = placeNext;
	}

	talk(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var size = universe.display.sizeInPixels;
		var placeStation = world.placeCurrent as PlaceStation;
		var factionName = this.station.factionName;
		var faction = world.defnExtended().factionByName(factionName);
		var conversationDefnName = faction.conversationDefnName;
		var conversationResourceName = "Conversation-" + conversationDefnName;
		var conversationDefnAsJSON =
			universe.mediaLibrary.textStringGetByName(conversationResourceName).value;
		var conversationDefn = ConversationDefn.deserialize(conversationDefnAsJSON);
		var conversation = new ConversationRun
		(
			conversationDefn,
			() => // quit
			{
				world.placeCurrent = placeStation.placePlanetVicinity;
				universe.venueNext = new VenueWorld(world);
			},
			null, // ?
			null // ?
		);
		var conversationAsControl = conversation.toControl(size, universe);
		universe.venueNext = new VenueControls(conversationAsControl, null);
	}

	// Place

	draw(universe: Universe, world: World): void
	{
		//super.draw(universe, world);
		this.venueControls.draw(universe);
	}

	updateForTimerTick(universe: Universe, world: World): void
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
					(universe: Universe) => // talk
					{
						placeStation.talk(universe);
					},

					(universe: Universe) => // dock
					{
						placeStation.dock(universe);
					},

					(universe: Universe) => // leave
					{
						placeStation.leave(universe);
					}
				],
				null //?
			);

			this.venueControls = new VenueControls(controlRoot, null);
		}

		this.venueControls.updateForTimerTick(universe);
	}

	returnToPlace(world: World): void
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entitiesByName.get(Player.name);
		var playerLoc = playerFromPlaceNext.locatable().loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNext = placeNext;
	}
}
