
class PlaceStation extends PlaceBase
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
		super
		(
			PlaceStation.name,
			PlaceStation.name,
			null, // parentName
			null, // size
			null // entities
		);
		this.station = station;
		this.placePlanetVicinity = placePlanetVicinity;
	}

	// methods

	dock(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var placeStation = world.placeCurrent as PlaceStation;
		var placeNext = new PlaceStationDock(world, placeStation);
		world.placeNextSet(placeNext);
	}

	leave(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var place = (world.placeCurrent as PlaceStation);
		var placePrev = place.placePlanetVicinity;
		var size = placePrev.size();
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
			world, planet, playerLocNext, placePrev.placeStarsystem
		);
		world.placeNextSet(placeNext);
	}

	talk(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var placeStation = world.placeCurrent as PlaceStation;
		var factionName = this.station.factionName;
		var faction = world.defnExtended().factionByName(factionName);
		var conversationDefnName = faction.conversationDefnName;
		var conversationResourceName = "Conversation-" + conversationDefnName;

		var conversationQuit = () =>
		{
			world.placeCurrent = placeStation.placePlanetVicinity;
			universe.venueNextSet(new VenueWorld(world) );
		};

		var stationEntity = placeStation.entityByName(Station.name);
		var talker = stationEntity.talker();
		talker.conversationDefnName = conversationResourceName;
		talker.quit = conversationQuit;

		var uwpe = new UniverseWorldPlaceEntities(universe, world, this, stationEntity, null);
		talker.talk(uwpe);
	}

	// Place

	draw(universe: Universe, world: World): void
	{
		//super.draw(universe, world);
		this.venueControls.draw(universe);
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		super.updateForTimerTick(uwpe.placeSet(this));

		var universe = uwpe.universe;

		if (this.venueControls == null)
		{
			var messageToShow = "[Station]";
			var placeStation = this;

			var controlRoot = universe.controlBuilder.choice5
			(
				universe,
				universe.display.sizeInPixels.clone(),
				DataBinding.fromContext(messageToShow),
				[ "Talk", "Dock", "Leave", ],
				[
					() => // talk
					{
						placeStation.talk(universe);
					},

					() => // dock
					{
						placeStation.dock(universe);
					},

					() => // leave
					{
						placeStation.leave(universe);
					}
				]
			);

			this.venueControls = new VenueControls(controlRoot, null);
		}

		this.venueControls.updateForTimerTick(universe);
	}

	returnToPlace(world: World): void
	{
		var placeNext = this.placeToReturnTo;
		var playerFromPlaceNext = placeNext.entityByName(Player.name);
		var playerLoc = playerFromPlaceNext.locatable().loc;
		playerLoc.pos.overwriteWith(this.posToReturnTo);
		playerLoc.vel.clear();
		world.placeNextSet(placeNext);
	}
}
