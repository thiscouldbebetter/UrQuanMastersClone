
class Game
{
	mediaLibraryBuild(contentDirectoryPath: string): MediaLibrary
	{
		var importDirectoryPath = contentDirectoryPath + "Import/sc2/content/base/";

		var imageDirectory = contentDirectoryPath + "Images/";
		var imageDirectoryHazards = importDirectoryPath + "lander/hazard/";
		var imageDirectoryLifeforms = imageDirectory + "Lifeforms/";
		var directoryEnergySources = importDirectoryPath + "lander/energy/";
		var energySource = EnergySource.name;
		var png = ".png";

		var audioDirectory = contentDirectoryPath + "Audio/";

		var textDirectory = contentDirectoryPath + "Text/";

		var conversation = "Conversation-";
		var content = "-Content";
		var conversationDirectory = textDirectory + "Conversation/";
		var conversationPlaceholderPath =
			conversationDirectory + "Placeholder.json";
		var conversationPortrait = conversation + "Portrait-";
		var contentPathPrefixComms =
			importDirectoryPath + "comm/";

		var i2 = Image2;

		var images =
		[
			// conversation 
			new i2("Conversation", imageDirectory + "Conversation.png"),
			new i2(conversationPortrait + "Lahkemup", importDirectoryPath + "comm/urquan/urquan-000.png"),
			new i2(conversationPortrait + "Mauluska", importDirectoryPath + "comm/spathi/spathi-000.png"),
			new i2(conversationPortrait + "Murch", importDirectoryPath + "comm/melnorme/melnorme-000.png"),
			new i2(conversationPortrait + "Raknoid", importDirectoryPath + "comm/ilwrath/ilwrath-000.png"),
			new i2(conversationPortrait + "Tempestrial", importDirectoryPath + "comm/probe/probe-000.png"),
			new i2(conversationPortrait + "Terran", importDirectoryPath + "comm/commander/commander-000.png"),
			new i2(conversationPortrait + "Triunion", importDirectoryPath + "comm/zoqfotpik/zoqfotpik-000.png"),

			// opening
			new i2("Titles_Opening", imageDirectory + "Titles/Opening.png"),
			new i2("Titles_Producer", imageDirectory + "Titles/Producer.png"),
			new i2("Titles_Title", imageDirectory + "Titles/Title.png"),

			// opening - slides
			new i2("Black", imageDirectory + "Slides/Black-1x1px.png"),
			new i2("Red", imageDirectory + "Slides/Red-1x1px.png"),
			new i2("Cyan", imageDirectory + "Slides/Cyan-1x1px.png"),

			// planets
			new i2("PlanetSurface", imageDirectory + "PlanetSurface.png"),

			// planets - lifeforms
			new i2("RadarBlossom", 		imageDirectoryLifeforms + "01-RadarBlossom" 	+ png),
			new i2("LavaPool", 			imageDirectoryLifeforms + "02-LavaPool" 		+ png),
			new i2("SquirtPod", 		imageDirectoryLifeforms + "03-SquirtPod" 		+ png),
			new i2("ClapperBush", 		imageDirectoryLifeforms + "04-ClapperBush" 		+ png),
			new i2("CarouselTree", 		imageDirectoryLifeforms + "05-CarouselTree" 	+ png),
			new i2("BlueTube", 			imageDirectoryLifeforms + "06-BlueTube" 		+ png),
			new i2("BrassNeedler", 		imageDirectoryLifeforms + "07-BrassNeedler" 	+ png),
			new i2("CreepingBean", 		imageDirectoryLifeforms + "08-CreepingBean" 	+ png),
			new i2("LightningAnemone", 	imageDirectoryLifeforms + "09-LightningAnemone" + png),
			new i2("Radiooculopod", 	imageDirectoryLifeforms + "10-Radiooculopod" 	+ png),
			new i2("SwarmsOfThings", 	imageDirectoryLifeforms + "11-SwarmsOfThings" 	+ png),
			new i2("ElasticSphere", 	imageDirectoryLifeforms + "12-ElasticSphere" 	+ png),
			new i2("TriopticSquid", 	imageDirectoryLifeforms + "13-TriopticSquid" 	+ png),
			new i2("LeapingLizard", 	imageDirectoryLifeforms + "14-LeapingLizard" 	+ png),
			new i2("BloodyBathmat", 	imageDirectoryLifeforms + "15-BloodyBathmat" 	+ png),
			new i2("BiteyMouse", 		imageDirectoryLifeforms + "16-BiteyMouse" 		+ png),
			new i2("SmushedDuckling", 	imageDirectoryLifeforms + "17-SmushedDuckling" 	+ png),
			new i2("FungusAmungus", 	imageDirectoryLifeforms + "18-FungusAmungus" 	+ png),
			new i2("WaddleEye", 		imageDirectoryLifeforms + "19-WaddleEye" 		+ png),
			new i2("SpuriousEaglet", 	imageDirectoryLifeforms + "20-SpuriousEaglet" 	+ png),
			new i2("CottonCandycane", 	imageDirectoryLifeforms + "21-CottonCandycane" + png),
			new i2("BulgingEyeworm", 	imageDirectoryLifeforms + "22-BulgingEyeworm" 	+ png),
			new i2("PopperUpper", 		imageDirectoryLifeforms + "23-PopperUpper" 		+ png),

			new i2("BioDecoy", 			imageDirectoryLifeforms + "24-Biodecoy" 		+ png),
			new i2("MauluskaGourmand", 	imageDirectoryLifeforms + "25-MauluskaGourmand" + png),
			new i2("FreakyBeast", 		imageDirectoryLifeforms + "26-FreakyBeast" 		+ png),

			// planets - energy sources
			new i2(energySource + "AbandonedMoonbase", directoryEnergySources + "moonbase-000" + png),
			new i2(energySource + "MauluskaOrphan", directoryEnergySources + "fwiffo-000" + png),
			new i2(energySource + "TtorstingCaster", directoryEnergySources + "burvixcaster-000" + png),
		];

		var hazardImages = [];

		var hazardNamePairs =
		[
			[ "Lightning", "lightning" ],
			[ "Earthquake", "quake" ],
			[ "Hotspot", "lavaspot" ]
		];
		var imagesPerHazard = 12;

		for (var h = 0; h < hazardNamePairs.length; h++)
		{
			var hazardNamePair = hazardNamePairs[h];

			var hazardImageName = hazardNamePair[0];
			var hazardFileNamePrefix = hazardNamePair[1];

			for (var i = 0; i < imagesPerHazard; i++)
			{
				var imageIndexPadded = "-" + StringHelper.padStart(i.toString(), 3, "0");

				var imageFilePath =
					imageDirectoryHazards + hazardFileNamePrefix + imageIndexPadded + png;

				var hazardImage = new Image2
				(
					hazardImageName + imageIndexPadded,
					imageFilePath
				);

				hazardImages.push(hazardImage);
			}

		}

		images.push(...hazardImages);

		var sffm = (a: string, b: string) => new SoundFromFileMod(a, b);
		var ts = (a: string, b: string) => new TextString(a, b);

		var mediaLibrary = new MediaLibrary
		(
			contentDirectoryPath,

			images,

			// sounds
			[
				new SoundFromFile("Sound", audioDirectory + "Effects/Sound.wav"),

				new SoundFromFile("Music_Music", audioDirectory + "Music/Music.mp3"),
				new SoundFromFile("Music_Producer", audioDirectory + "Music/Music.mp3"),
				//new SoundFromFile("Music_Title", audioDirectory + "Music/Music.mp3"),
				sffm("Music_Title", importDirectoryPath + "cutscene/intro/introx.mod"),

				sffm("Music_Combat", importDirectoryPath + "battle/battle.mod"),
				sffm("Music_Encounter", importDirectoryPath + "ui/redalert.mod"),
				sffm("Music_Hyperspace", importDirectoryPath + "nav/hyper.mod"),
				sffm("Music_Planet", importDirectoryPath + "nav/orbit.mod"),
				sffm("Music_Starsystem", importDirectoryPath + "nav/space.mod"),

				sffm("Music_Faction_Terran", importDirectoryPath + "comm/commander/commander.mod"),
				sffm("Music_Faction_Lahkemup", importDirectoryPath + "comm/urquan/urquan.mod"),
			],

			// videos
			[
				new Video("Movie", contentDirectoryPath + "Video/Movie.webm"),
			],
			// fonts
			[
				new Font("Font", contentDirectoryPath + "Fonts/Font.ttf"),
			],
			// textStrings
			[
				ts("StarsAndPlanets", textDirectory + "PlanetDatabase.csv"),

				ts(conversation + "Placeholder-Content", conversationDirectory + "Placeholder-Content.txt"),
				ts(conversation + "Amorfus", conversationPlaceholderPath),
				ts(conversation + "Daskapital", conversationPlaceholderPath),
				ts(conversation + "Ellfyn", conversationPlaceholderPath),
				ts(conversation + "Hyphae", conversationPlaceholderPath),
				ts(conversation + "Kehlemal", conversationPlaceholderPath),
				ts(conversation + "Lahkemup", conversationPlaceholderPath),
				ts(conversation + "Lahkemup" + content, contentPathPrefixComms + "urquan/urquan.txt"),
				ts(conversation + "LahkemupGuardDrone", conversationDirectory + "LahkemupGuardDrone.txt"),
				//ts(conversation + "LahkemupGuardDrone" + content, conversationDirectory + "LahkemupGuardDrone-Content.txt"),
				ts(conversation + "Mauluska", conversationDirectory + "Mauluska.json"),
				ts(conversation + "Mauluska" + content, contentPathPrefixComms + "spathi/spathi.txt"),
				ts(conversation + "MauluskaOrphan", conversationDirectory + "Mauluska-Orphan.json"),
				ts(conversation + "MauluskaOrphan" + content, contentPathPrefixComms + "spathi/spathi.txt"),
				ts(conversation + "Moroz", conversationPlaceholderPath),
				ts(conversation + "Muuncaf", conversationPlaceholderPath),
				ts(conversation + "Mazonae", conversationPlaceholderPath),
				ts(conversation + "Murch", conversationDirectory + "Murch.txt"),
				ts(conversation + "Murch" + content, contentPathPrefixComms + "melnorme/melnorme.txt"),
				ts(conversation + "Outsider", conversationPlaceholderPath),
				ts(conversation + "Raknoid", conversationDirectory + "Raknoid.txt"),
				ts(conversation + "Raknoid" + content, contentPathPrefixComms + "ilwrath/ilwrath.txt"),
				ts(conversation + "Raptor", conversationPlaceholderPath),
				ts(conversation + "Silikonix", conversationPlaceholderPath),
				ts(conversation + "Supial", conversationPlaceholderPath),
				ts(conversation + "Tempestrial", conversationDirectory + "Tempestrial.txt"),
				ts(conversation + "Tempestrial" + content, contentPathPrefixComms + "probe/probe.txt"),
				ts(conversation + "Terran", conversationDirectory + "Terran.txt"),
				ts(conversation + "Terran" + content, contentPathPrefixComms + "commander/commander.txt"),
				ts(conversation + "Terran-Business", conversationDirectory + "Terran-Business.txt"),
				ts(conversation + "Terran-Business" + content, contentPathPrefixComms + "starbase/starbase.txt"),
				ts(conversation + "Triunion", conversationDirectory + "Triunion.json"),
				ts(conversation + "Triunion" + content, contentPathPrefixComms + "zoqfotpik/zoqfotpik.txt"),
				ts(conversation + "Twyggan", conversationPlaceholderPath),
				ts(conversation + "Ugglegruj", conversationPlaceholderPath),
				ts(conversation + "Warpig", conversationPlaceholderPath),

				// Energy sources.

				ts(energySource + "AbandonedMoonbase", directoryEnergySources + "moonbase.txt"),
				ts(energySource + "MauluskaOrphan", directoryEnergySources + "fwiffo.txt"),
				ts(energySource + "TtorstingCaster", directoryEnergySources + "burvixcaster.txt"),
			]
		);

		return mediaLibrary
	}

	start(): void
	{
		//localStorage.clear();

		var contentDirectoryPath = "../Content/";
		var mediaLibrary = this.mediaLibraryBuild(contentDirectoryPath);

		var displaySizeInPixelsDefault = new Coords(400, 300, 1);

		var display = new Display2D
		(
			// sizesAvailable
			[
				displaySizeInPixelsDefault,
				displaySizeInPixelsDefault.clone().half(),
				displaySizeInPixelsDefault.clone().multiplyScalar(2),
			],
			new FontNameAndHeight("Font", 10),
			Color.Instances().Gray,
			Color.Instances().White, // colorFore, colorBack
			false // isInvisible
		);

		var timerHelper = new TimerHelper(24);

		var controlBuilder = ControlBuilder.fromStyles( [ ControlStyle.Instances().Dark ] );

		var universe = Universe.create
		(
			"SpaceAdventureClone",
			"0.0.0-20240901",
			timerHelper,
			display,
			new SoundHelperLive(),
			mediaLibrary,
			controlBuilder,
			WorldCreator.fromWorldCreate(WorldExtended.create)
		);

		var colors = Color.Instances();
		var colorBlackName = colors.Black.name;

		var controlSlideshowIntro = universe.controlBuilder.slideshow
		(
			universe,
			displaySizeInPixelsDefault,
			[
				[ colorBlackName, "At first, it was black." ],
				[ colors.Red.name, "Then, it turned red." ],
				[ colors.Cyan.name, "Then it turned, I want to say, cyan?" ],
				[ colorBlackName, "Then it was black again." ],
				[ colorBlackName, "Whew!  That was quite a ride." ],
				[ colorBlackName, "Anyway, here's a game." ],
			],
			universe.venueNext()
		);
		universe.venueNextSet
		(
			new VenueControls
			(
				controlSlideshowIntro, false // ignoreInputs
			)
		);
		universe.venueNextSet
		(
			controlBuilder.venueTransitionalFromTo(null, universe.venueNext() )
		);

		var universeDebugOrStart;
		if (universe.debuggingModeName != null)
		{
			universeDebugOrStart = () => this.debug(universe);
		}
		else
		{
			universeDebugOrStart = () => universe.start();
		}

		universe.initialize
		(
			universeDebugOrStart
		);

	}

	debug(universe: Universe)
	{
		var world = WorldExtended.create(universe) as WorldExtended;
		universe.world = world;
		universe.venueNextSet(new VenueWorld(world) );

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
		else if (debuggingModeName == "Planet2")
		{
			this.debug_Planet2(universe);
		}
		else if (debuggingModeName == "PlanetEnergy")
		{
			this.debug_PlanetEnergy(universe);
		}
		else if (debuggingModeName == "StarsystemSol")
		{
			this.debug_StarsystemSol(universe);
		}
		else if (debuggingModeName == "Station")
		{
			this.debug_Station(universe);
		}
		else if (debuggingModeName.startsWith("Talk"))
		{
			var factionName = debuggingModeName.split("_")[1];

			/*
			if (factionName == "MauluskaOrphan")
			{
				this.debug_Talk_MauluskaOrphan(universe);
			}
			else if (factionName == "Murch")
			{
				this.debug_Talk_Murch(universe);
			}
			else if (factionName == "Tempestrial")
			{
				this.debug_Talk_Tempestrial(universe);
			}
			else if (factionName == "Triunion")
			{
				this.debug_Talk_Triunion(universe);
			}
			else
			{
				throw new Error("Unrecognized debugging mode: " + debuggingModeName);
			}
			*/

			var faction = world.faction(factionName);
			var talker = faction.toTalker();
			var entityPlayer = new Entity("Player", []);
			var entityTalker = new Entity(factionName, [ talker] );
			var uwpe = new UniverseWorldPlaceEntities
			(
				universe, universe.world, universe.world.placeCurrent, entityTalker, entityPlayer
			);
			talker.talk(uwpe);

		}


		universe.start();
	}

	debug_Combat(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		var displaySize = universe.display.sizeInPixels;
		var combatSize = Coords.fromXY(1, 1).multiplyScalar(displaySize.y * 2);
		var starsystem = world.hyperspace.starsystems[0];
		var planet = starsystem.planets[0];
		var encounter = new Encounter
		(
			planet,
			"Terran", // factionName
			null, // entityPlayer
			null, // entityOther
			null, // placeToReturnTo
			null // posToReturnTo
		);
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
				new ShipGroupFinite
				(
					"Player",
					null, // factionName
					null, // pos
					playerShips
				),
				new ShipGroupFinite
				(
					"Other",
					null, // factionName
					null, // pos
					enemyShips
				)
			]
		).initialize
		(
			universe, world, null
		);

		var placeCombat = combat.toPlace(world);
		world.placeCurrentSet(placeCombat);

		var controlShipSelect = combat.toControlShipSelect
		(
			universe, displaySize
		);
		var venueNext = VenueControls.fromControl(controlShipSelect);
		universe.venueNextSet(venueNext);
	}

	debug_Docks(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var worldDefn = world.defn as WorldDefnExtended;
		worldDefn.factionsByName.get("Terran").relationsWithPlayer
			= Faction.RelationsAllied;
		var player = world.player;
		player.flagship.resourceCredits = 1000;
		var resourceDefns = ResourceDefn.Instances();
		var playerItemHolder = player.flagship.itemHolderCargo;
		playerItemHolder.itemAdd(new Item(resourceDefns.Radioactives.name, 1));
		playerItemHolder.itemAdd(new Item(resourceDefns.Exotics.name, 100));

		var starsystemSol = world.hyperspace.starsystemByName("Sol");
		var station = starsystemSol.planets[2].satelliteGetAtIndex(0) as Planet;
		var placePlanetVicinity = null;
		var placeStation = new PlaceStation(world, station, placePlanetVicinity);
		var placeStationDocks = new PlaceStationDock(world, placeStation);
		world.placeNextSet(placeStationDocks);
	}

	debug_Hyperspace(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var hyperspace = world.hyperspace
		var starsystemSol = hyperspace.starsystemByName("Sol");
		var playerPos = starsystemSol.posInHyperspace.clone();
		var playerLoc = Disposition.fromPos(playerPos);
		var placeHyperspace = new PlaceHyperspace(universe, hyperspace, starsystemSol, playerLoc);
		world.placeNextSet(placeHyperspace);
	}

	debug_HyperspaceMap(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var hyperspace = world.hyperspace
		var starsystemSol = hyperspace.starsystemByName("Sol");
		var playerPos = starsystemSol.posInHyperspace.clone();
		var playerLoc = Disposition.fromPos(playerPos);
		var placeHyperspace = new PlaceHyperspace(universe, hyperspace, starsystemSol, playerLoc);
		var uwpe = new UniverseWorldPlaceEntities
		(
			universe, world, null, null, null
		);
		placeHyperspace.updateForTimerTick(uwpe);
		var placeMap = new PlaceHyperspaceMap(placeHyperspace);
		world.placeNextSet(placeMap);
	}

	debug_Planet(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var starsystem = world.hyperspace.starsystems.find(x => x.name == "Sol");
		var planet = starsystem.planets[0]; // Mercury
		var uwpe = new UniverseWorldPlaceEntities
		(
			universe, world, null, null, null
		);
		planet.initialize(uwpe);
		var placePlanetVicinity = null;
		var placePlanetOrbit = new PlacePlanetOrbit(universe, world, planet, placePlanetVicinity);
		world.placeNextSet(placePlanetOrbit);
	}

	debug_Planet2(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var starsystem = world.hyperspace.starsystems.find(x => x.name == "Eta Giclas");
		var planet = starsystem.planets[4]; // E Giclas V
		var uwpe = UniverseWorldPlaceEntities.fromUniverseAndWorld
		(
			universe, world
		);
		planet.initialize(uwpe);
		var placePlanetVicinity = null;
		var placePlanetOrbit = new PlacePlanetOrbit(universe, world, planet, placePlanetVicinity);
		world.placeNextSet(placePlanetOrbit);
	}

	debug_PlanetEnergy(universe: Universe): void
	{
		var world = universe.world as WorldExtended;
		var starsystem = world.hyperspace.starsystemByName("Sol");
		var planet = starsystem.planets[8]; // Pluto
		var placePlanetVicinity = null;
		var placePlanetOrbit = new PlacePlanetOrbit(universe, world, planet, placePlanetVicinity);
		world.placeNextSet(placePlanetOrbit);
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
		var place = starsystemSol.toPlace(world, playerLoc, null);
		world.placeNextSet(place);
	}

	debug_Station(universe: Universe): void
	{
		var world = universe.world as WorldExtended;

		var player = world.player;
		player.flagship.resourceCredits = 0;
		var resourceDefns = ResourceDefn.Instances();
		var playerItemHolder = player.flagship.itemHolderCargo;
		playerItemHolder.itemAdd(new Item(resourceDefns.Radioactives.name, 1));

		var starsystemSol = world.hyperspace.starsystemByName("Sol");
		var planetEarth = starsystemSol.planets[2];
		var station = planetEarth.satelliteGetAtIndex(0) as Planet;
		var placePlanetVicinity = planetEarth.toPlace(world);
		var placeStation = new PlaceStation(world, station, placePlanetVicinity);
		world.placeNextSet(placeStation);
	}

	debug_Talk(universe: Universe, factionName: string): void
	{
		var world = universe.world as WorldExtended;
		var faction = world.faction(factionName);
		var talker = faction.toTalker();
		var entityPlayer = new Entity("Player", []);
		var entityTalker = new Entity(factionName, [ talker] );
		var uwpe = new UniverseWorldPlaceEntities
		(
			universe, universe.world, universe.world.placeCurrent, entityTalker, entityPlayer
		);
		talker.talk(uwpe);
	}

	debug_Talk_MauluskaOrphan(universe: Universe): void
	{
		this.debug_Talk(universe, "MauluskaOrphan");
	}

	debug_Talk_Murch(universe: Universe): void
	{
		this.debug_Talk(universe, "Murch");
	}

	debug_Talk_Tempestrial(universe: Universe): void
	{
		var talker = new Talker
		(
			"Conversation-Tempestrial",
			null, // quit
			(cr: ConversationRun, size: Coords, u: Universe) => cr.toControl_Layout_2(size, universe)
		);
		var entityTalker = new Entity("Tempestrial", [ talker] );
		var entityPlayer = new Entity("Player", [ Locatable.fromPos(Coords.create()), new Playable() ]);

		var world = universe.world as WorldExtended;

		var hyperspace = world.hyperspace;
		var placeHyperspace = new PlaceHyperspace
		(
			universe,
			hyperspace,
			hyperspace.starsystems[0], // starsystemDeparted,
			Disposition.create(), // playerLoc
		);

		var uwpe = new UniverseWorldPlaceEntities
		(
			universe, universe.world, placeEncounter, entityPlayer, entityTalker
		);
		placeHyperspace.entitySpawn(uwpe);

		var encounter = new Encounter
		(
			null, // planet,
			null, // factionName,
			entityPlayer,
			entityTalker,
			placeHyperspace, // placeToReturnTo
			null // posToReturnTo
		);

		uwpe.entitiesSwap();
		var placeEncounter = encounter.toPlace();
		universe.world.placeCurrentSet(placeEncounter);

		talker.talk(uwpe);
	}

	debug_Talk_Triunion(universe: Universe): void
	{
		this.debug_Talk(universe, "Triunion");
	}

}

