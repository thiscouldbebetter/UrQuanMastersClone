
class Game
{
	start()
	{
		//localStorage.clear();

		var contentPathPrefixComms = "../Content/Import/sc2/content/base/comm/"

		var conversationPlaceholderPath = "../Content/Text/Conversation-Placeholder.json";

		var imageDirectory = "../Content/Images/";

		var mediaLibrary = new MediaLibrary
		(
			// images
			[
				new Image2("Conversation", imageDirectory + "Conversation.png"),
				new Image2("Conversation-EarthStation", "../Content/Import/sc2/content/base/comm/commander/commander-000.png"),
				new Image2("Conversation-Lahkemup", "../Content/Import/sc2/content/base/comm/urquan/urquan-000.png"),

				new Image2("PlanetSurface", imageDirectory + "PlanetSurface.png"),

				// opening
				new Image2("Opening", imageDirectory + "Opening.png"),
				new Image2("Title", imageDirectory + "Title.png"),

				// slides
				new Image2("Black", imageDirectory + "Slides/Black-1x1px.png"),
				new Image2("Red", imageDirectory + "Slides/Red-1x1px.png"),
				new Image2("Cyan", imageDirectory + "Slides/Cyan-1x1px.png"),
			],
			// sounds
			[
				new Sound("Sound", "../Content/Audio/Effects/Sound.wav"),
				new Sound("Music_Music", "../Content/Audio/Music/Music.mp3"),
				new Sound("Music_Title", "../Content/Audio/Music/Music.mp3"),
			],
			// videos
			[
				new Video("Movie", "../Content/Video/Movie.webm"),
			],
			// fonts
			[
				new Font("Font", "../Content/Fonts/Font.ttf"),
			],
			// textStrings
			[
				//new TextString("Instructions", "../Content/Text/Instructions.txt"),
				new TextString("StarsAndPlanets", "../Content/Text/PlanetDatabase.csv"),

				new TextString("Conversation-LahkemupGuardDrone", "../Content/Text/Conversation-LahkemupGuardDrone.json"),
				new TextString("Conversation-Lahkemup-Content", contentPathPrefixComms + "urquan/urquan.txt"),
				new TextString("Conversation-EarthStation", "../Content/Text/Conversation-EarthStation.json"),

				new TextString("Conversation-Placeholder-Content", "../Content/Text/Conversation-Placeholder-Content.txt"),

				new TextString("Conversation-Amorfus", conversationPlaceholderPath),
				new TextString("Conversation-Araknoid", conversationPlaceholderPath),
				new TextString("Conversation-Daskapital", conversationPlaceholderPath),
				new TextString("Conversation-Ellfyn", conversationPlaceholderPath),
				new TextString("Conversation-Hyphae", conversationPlaceholderPath),
				new TextString("Conversation-Kehlemal", conversationPlaceholderPath),
				new TextString("Conversation-Lahkemup", conversationPlaceholderPath),
				new TextString("Conversation-Mauluska", conversationPlaceholderPath),
				new TextString("Conversation-Moroz", conversationPlaceholderPath),
				new TextString("Conversation-Muuncaf", conversationPlaceholderPath),
				new TextString("Conversation-Mazonae", conversationPlaceholderPath),
				new TextString("Conversation-Murch", conversationPlaceholderPath),
				new TextString("Conversation-Outsider", conversationPlaceholderPath),
				new TextString("Conversation-Raptor", conversationPlaceholderPath),
				new TextString("Conversation-Silikonix", conversationPlaceholderPath),
				new TextString("Conversation-Supial", conversationPlaceholderPath),
				new TextString("Conversation-Tempestrial", conversationPlaceholderPath),
				new TextString("Conversation-Triunion", conversationPlaceholderPath),
				new TextString("Conversation-Twyggan", conversationPlaceholderPath),
				new TextString("Conversation-Ugglegruj", conversationPlaceholderPath),
				new TextString("Conversation-Warpig", conversationPlaceholderPath),
			]
		);

		var displaySizeInPixelsDefault = new Coords(400, 300, 1);

		var display = new Display2D
		(
			// sizesAvailable
			[
				displaySizeInPixelsDefault,
				displaySizeInPixelsDefault.clone().half(),
				displaySizeInPixelsDefault.clone().multiplyScalar(2),
			],
			"Font", // fontName
			10, // fontHeightInPixels
			Color.byName("Gray"), Color.byName("White"), // colorFore, colorBack
			false // isInvisible
		);

		var timerHelper = new TimerHelper(24);

		var controlBuilder = ControlBuilder.default();

		var universe = Universe.create
		(
			"SpaceAdventureClone",
			"0.0.0-20210504",
			timerHelper,
			display,
			mediaLibrary,
			controlBuilder,
			WorldExtended.create
		);

		universe.initialize
		(
			() => universe.start()
		);

		var controlSlideshowIntro = universe.controlBuilder.slideshow
		(
			universe,
			displaySizeInPixelsDefault,
			[
				[ "Black", "At first, it was black." ],
				[ "Red", "Then, it turned red." ],
				[ "Cyan", "Then it turned, I want to say, cyan?" ],
				[ "Black", "Then it was black again." ],
				[ "Black", "Whew!  That was quite a ride." ],
				[ "Black", "Anyway, here's a game." ],
			],
			universe.venueNext
		);
		universe.venueNext = new VenueControls
		(
			controlSlideshowIntro, false // ignoreInputs
		);
		universe.venueNext =
			controlBuilder.venueTransitionalFromTo(null, universe.venueNext);

		if (universe.debuggingModeName != null)
		{
			this.debug(universe);
		}
	}

	debug(universe: Universe)
	{
		universe.mediaLibrary.waitForItemsAllToLoad
		(
			this.debug_MediaLoaded.bind(this, universe)
		);
	}

	debug_MediaLoaded(universe: Universe)
	{
		var world = WorldExtended.create(universe);
		universe.world = world;
		universe.venueNext = new VenueWorld(world);

		var debuggingModeName = universe.debuggingModeName;

		if (debuggingModeName == "Combat")
		{
			this.debug_Combat(universe);
		}
		else if (debuggingModeName == "Docks")
		{
			this.debug_Docks(universe);
		}
		else if (debuggingModeName == "Hyperspace")
		{
			this.debug_Hyperspace(universe);
		}
		else if (debuggingModeName == "HyperspaceMap")
		{
			this.debug_HyperspaceMap(universe);
		}
		else if (debuggingModeName == "Planet")
		{
			this.debug_Planet(universe);
		}
		else if (debuggingModeName == "PlanetEnergy")
		{
			this.debug_PlanetEnergy(universe);
		}
		else if (debuggingModeName == "StarsystemSol")
		{
			this.debug_StarsystemSol(universe);
		}
	}

	debug_Combat(universe: Universe): void
	{
		var displaySize = universe.display.sizeInPixels;
		var combatSize = Coords.fromXY(1, 1).multiplyScalar(displaySize.y * 2);
		var encounter = null; // todo
		var shipDefnInstances = ShipDefn.Instances(universe);
		var shipDefnsByName = shipDefnInstances._AllByName;
		/*
		var playerShipDefns =
		[
			shipDefnsAll["Fireblossom"],
			shipDefnsAll["Efflorescence"],
			shipDefnsAll["Scuttler"],
		];
		*/
		var playerShipDefns = shipDefnInstances._All;
		var enemyShipDefns =
		[
			shipDefnsByName.get("Kickback"),
			shipDefnsByName.get("Starshard"),
			shipDefnsByName.get("Sporsac"),
		];
		var playerShips = Ship.manyFromDefns(playerShipDefns);
		var enemyShips = Ship.manyFromDefns(enemyShipDefns);

		var combat = new Combat
		(
			combatSize,
			encounter,
			// shipGroups
			[
				new ShipGroup
				(
					"Player",
					null, // factionName
					null, // pos
					playerShips
				),
				new ShipGroup
				(
					"Other",
					null, // factionName
					null, // pos
					enemyShips
				)
			]
		).initialize(universe, universe.world, null);
		var controlShipSelect = combat.toControlShipSelect
		(
			universe, displaySize
		);
		var venueNext = VenueControls.fromControl(controlShipSelect);
		universe.venueNext = venueNext;
	}

	debug_Docks(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var worldDefn = world.defn as WorldDefnExtended;
		worldDefn.factionsByName.get("Terran").relationsWithPlayer
			= Faction.RelationsAllied;
		var player = world.player;
		player.credit = 1000;
		var resourceDefns = ResourceDefn.Instances();
		var playerItemHolder = player.flagship.itemHolder;
		playerItemHolder.itemAdd(new Item(resourceDefns.Radioactives.name, 1));
		playerItemHolder.itemAdd(new Item(resourceDefns.Exotics.name, 100));

		var starsystemSol = world.hyperspace.starsystemByName("Sol");
		var station = starsystemSol.planets[2].satellites[0] as Station;
		var placePlanetVicinity = null;
		var placeStation = new PlaceStation(world, station, placePlanetVicinity);
		var placeStationDocks = new PlaceStationDock(world, placeStation);
		world.placeNext = placeStationDocks;
	}

	debug_Hyperspace(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var hyperspace = world.hyperspace
		var starsystemSol = hyperspace.starsystemByName("Sol");
		var playerPos = starsystemSol.posInHyperspace.clone();
		var playerLoc = Disposition.fromPos(playerPos);
		var placeHyperspace = new PlaceHyperspace(universe, hyperspace, starsystemSol, playerLoc);
		world.placeNext = placeHyperspace;
	}

	debug_HyperspaceMap(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var hyperspace = world.hyperspace
		var starsystemSol = hyperspace.starsystemByName("Sol");
		var playerPos = starsystemSol.posInHyperspace.clone();
		var playerLoc = Disposition.fromPos(playerPos);
		var placeHyperspace = new PlaceHyperspace(universe, hyperspace, starsystemSol, playerLoc);
		placeHyperspace.updateForTimerTick(universe, world);
		var placeMap = new PlaceHyperspaceMap(placeHyperspace);
		world.placeNext = placeMap;
	}

	debug_Planet(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var starsystem = world.hyperspace.starsystems[1]; // Eta Giclas
		var planet = starsystem.planets[4]; // E Giclas V
		var placePlanetVicinity = null;
		var placePlanetOrbit = new PlacePlanetOrbit(world, planet, placePlanetVicinity);
		world.placeNext = placePlanetOrbit;
	}

	debug_PlanetEnergy(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var starsystem = world.hyperspace.starsystemByName("Sol");
		var planet = starsystem.planets[8]; // Pluto
		var placePlanetVicinity = null;
		var placePlanetOrbit = new PlacePlanetOrbit(world, planet, placePlanetVicinity);
		world.placeNext = placePlanetOrbit;
	}

	debug_StarsystemSol(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var starsystemSol = world.hyperspace.starsystemByName("Sol");
		var starsystemSize = starsystemSol.sizeInner;
		var playerPos = Coords.fromXY(.5, .95).multiply(starsystemSize);
		var playerLoc = Disposition.fromPosAndOrientation
		(
			playerPos,
			new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1))
		);
		var place = new PlaceStarsystem(world, starsystemSol, playerLoc, null);
		world.placeNext = place;
	}
}

