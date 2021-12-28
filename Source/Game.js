"use strict";
class Game {
    start() {
        //localStorage.clear();
        var contentPathPrefixComms = "../Content/Import/sc2/content/base/comm/";
        var conversationPlaceholderPath = "../Content/Text/Conversation/Placeholder.json";
        var imageDirectory = "../Content/Images/";
        var conversation = "Conversation-";
        var conversationContent = conversation + "Content-";
        var mediaLibrary = new MediaLibrary(
        // images
        [
            new Image2("Conversation", imageDirectory + "Conversation.png"),
            new Image2(conversation + "EarthStation", "../Content/Import/sc2/content/base/comm/commander/commander-000.png"),
            new Image2(conversation + "Lahkemup", "../Content/Import/sc2/content/base/comm/urquan/urquan-000.png"),
            new Image2("PlanetSurface", imageDirectory + "PlanetSurface.png"),
            // opening
            new Image2("Opening", imageDirectory + "Opening.png"),
            new Image2("Producer", imageDirectory + "Producer.png"),
            new Image2("Title", imageDirectory + "Title.png"),
            // slides
            new Image2("Black", imageDirectory + "Slides/Black-1x1px.png"),
            new Image2("Red", imageDirectory + "Slides/Red-1x1px.png"),
            new Image2("Cyan", imageDirectory + "Slides/Cyan-1x1px.png"),
        ], 
        // sounds
        [
            new SoundFromFile("Sound", "../Content/Audio/Effects/Sound.wav"),
            new SoundFromFile("Music_Music", "../Content/Audio/Music/Music.mp3"),
            new SoundFromFile("Music_Producer", "../Content/Audio/Music/Music.mp3"),
            new SoundFromFile("Music_Title", "../Content/Audio/Music/Music.mp3"),
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
            new TextString(conversation + "LahkemupGuardDrone", "../Content/Text/Conversation/LahkemupGuardDrone.json"),
            new TextString(conversationContent + "LahkemupGuardDrone", "../Content/Text/Conversation/LahkemupGuardDrone-Content.txt"),
            new TextString(conversation + "Lahkemup-Content", contentPathPrefixComms + "urquan/urquan.txt"),
            new TextString(conversation + "EarthStation", "../Content/Text/Conversation/EarthStation.json"),
            new TextString("Conversation-Placeholder-Content", "../Content/Text/Conversation/Placeholder-Content.txt"),
            new TextString(conversation + "Amorfus", conversationPlaceholderPath),
            new TextString(conversation + "Araknoid", conversationPlaceholderPath),
            new TextString(conversation + "Daskapital", conversationPlaceholderPath),
            new TextString(conversation + "Ellfyn", conversationPlaceholderPath),
            new TextString(conversation + "Hyphae", conversationPlaceholderPath),
            new TextString(conversation + "Kehlemal", conversationPlaceholderPath),
            new TextString(conversation + "Lahkemup", conversationPlaceholderPath),
            new TextString(conversation + "Mauluska", conversationPlaceholderPath),
            new TextString(conversation + "Moroz", conversationPlaceholderPath),
            new TextString(conversation + "Muuncaf", conversationPlaceholderPath),
            new TextString(conversation + "Mazonae", conversationPlaceholderPath),
            new TextString(conversation + "Murch", conversationPlaceholderPath),
            new TextString(conversation + "Outsider", conversationPlaceholderPath),
            new TextString(conversation + "Raptor", conversationPlaceholderPath),
            new TextString(conversation + "Silikonix", conversationPlaceholderPath),
            new TextString(conversation + "Supial", conversationPlaceholderPath),
            new TextString(conversation + "Tempestrial", conversationPlaceholderPath),
            new TextString(conversation + "Triunion", conversationPlaceholderPath),
            new TextString(conversation + "Twyggan", conversationPlaceholderPath),
            new TextString(conversation + "Ugglegruj", conversationPlaceholderPath),
            new TextString(conversation + "Warpig", conversationPlaceholderPath),
        ]);
        var displaySizeInPixelsDefault = new Coords(400, 300, 1);
        var display = new Display2D(
        // sizesAvailable
        [
            displaySizeInPixelsDefault,
            displaySizeInPixelsDefault.clone().half(),
            displaySizeInPixelsDefault.clone().multiplyScalar(2),
        ], "Font", // fontName
        10, // fontHeightInPixels
        Color.byName("Gray"), Color.byName("White"), // colorFore, colorBack
        false // isInvisible
        );
        var timerHelper = new TimerHelper(24);
        var controlBuilder = ControlBuilder.default();
        var universe = Universe.create("SpaceAdventureClone", "0.0.0-20211219", timerHelper, display, mediaLibrary, controlBuilder, WorldCreator.fromWorldCreate(WorldExtended.create));
        var controlSlideshowIntro = universe.controlBuilder.slideshow(universe, displaySizeInPixelsDefault, [
            ["Black", "At first, it was black."],
            ["Red", "Then, it turned red."],
            ["Cyan", "Then it turned, I want to say, cyan?"],
            ["Black", "Then it was black again."],
            ["Black", "Whew!  That was quite a ride."],
            ["Black", "Anyway, here's a game."],
        ], universe.venueNext);
        universe.venueNext = new VenueControls(controlSlideshowIntro, false // ignoreInputs
        );
        universe.venueNext =
            controlBuilder.venueTransitionalFromTo(null, universe.venueNext);
        var universeDebugOrStart;
        if (universe.debuggingModeName != null) {
            universeDebugOrStart = () => this.debug(universe);
        }
        else {
            universeDebugOrStart = () => universe.start();
        }
        universe.initialize(universeDebugOrStart);
    }
    debug(universe) {
        var world = WorldExtended.create(universe);
        universe.world = world;
        universe.venueNext = new VenueWorld(world);
        var debuggingModeName = universe.debuggingModeName;
        if (debuggingModeName == "Combat") {
            this.debug_Combat(universe);
        }
        else if (debuggingModeName == "Docks") {
            this.debug_Docks(universe);
        }
        else if (debuggingModeName == "Hyperspace") {
            this.debug_Hyperspace(universe);
        }
        else if (debuggingModeName == "HyperspaceMap") {
            this.debug_HyperspaceMap(universe);
        }
        else if (debuggingModeName == "Planet") {
            this.debug_Planet(universe);
        }
        else if (debuggingModeName == "PlanetEnergy") {
            this.debug_PlanetEnergy(universe);
        }
        else if (debuggingModeName == "StarsystemSol") {
            this.debug_StarsystemSol(universe);
        }
        else if (debuggingModeName == "Station") {
            this.debug_Station(universe);
        }
        universe.start();
    }
    debug_Combat(universe) {
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
        var enemyShipDefns = [
            shipDefnsByName.get("Kickback"),
            shipDefnsByName.get("Starshard"),
            shipDefnsByName.get("Sporsac"),
        ];
        var playerShips = Ship.manyFromDefns(playerShipDefns);
        var enemyShips = Ship.manyFromDefns(enemyShipDefns);
        var combat = new Combat(combatSize, encounter, 
        // shipGroups
        [
            new ShipGroup("Player", null, // factionName
            null, // pos
            playerShips),
            new ShipGroup("Other", null, // factionName
            null, // pos
            enemyShips)
        ]).initialize(universe, universe.world, null);
        var controlShipSelect = combat.toControlShipSelect(universe, displaySize);
        var venueNext = VenueControls.fromControl(controlShipSelect);
        universe.venueNext = venueNext;
    }
    debug_Docks(universe) {
        var world = universe.world;
        var worldDefn = world.defn;
        worldDefn.factionsByName.get("Terran").relationsWithPlayer
            = Faction.RelationsAllied;
        var player = world.player;
        player.credit = 1000;
        var resourceDefns = ResourceDefn.Instances();
        var playerItemHolder = player.flagship.itemHolder;
        playerItemHolder.itemAdd(new Item(resourceDefns.Radioactives.name, 1));
        playerItemHolder.itemAdd(new Item(resourceDefns.Exotics.name, 100));
        var starsystemSol = world.hyperspace.starsystemByName("Sol");
        var station = starsystemSol.planets[2].satellites[0];
        var placePlanetVicinity = null;
        var placeStation = new PlaceStation(world, station, placePlanetVicinity);
        var placeStationDocks = new PlaceStationDock(world, placeStation);
        world.placeNext = placeStationDocks;
    }
    debug_Hyperspace(universe) {
        var world = universe.world;
        var hyperspace = world.hyperspace;
        var starsystemSol = hyperspace.starsystemByName("Sol");
        var playerPos = starsystemSol.posInHyperspace.clone();
        var playerLoc = Disposition.fromPos(playerPos);
        var placeHyperspace = new PlaceHyperspace(universe, hyperspace, starsystemSol, playerLoc);
        world.placeNext = placeHyperspace;
    }
    debug_HyperspaceMap(universe) {
        var world = universe.world;
        var hyperspace = world.hyperspace;
        var starsystemSol = hyperspace.starsystemByName("Sol");
        var playerPos = starsystemSol.posInHyperspace.clone();
        var playerLoc = Disposition.fromPos(playerPos);
        var placeHyperspace = new PlaceHyperspace(universe, hyperspace, starsystemSol, playerLoc);
        var uwpe = new UniverseWorldPlaceEntities(universe, world, null, null, null);
        placeHyperspace.updateForTimerTick(uwpe);
        var placeMap = new PlaceHyperspaceMap(placeHyperspace);
        world.placeNext = placeMap;
    }
    debug_Planet(universe) {
        var world = universe.world;
        var starsystem = world.hyperspace.starsystems[1]; // Eta Giclas
        var planet = starsystem.planets[4]; // E Giclas V
        var placePlanetVicinity = null;
        var placePlanetOrbit = new PlacePlanetOrbit(world, planet, placePlanetVicinity);
        world.placeNext = placePlanetOrbit;
    }
    debug_PlanetEnergy(universe) {
        var world = universe.world;
        var starsystem = world.hyperspace.starsystemByName("Sol");
        var planet = starsystem.planets[8]; // Pluto
        var placePlanetVicinity = null;
        var placePlanetOrbit = new PlacePlanetOrbit(world, planet, placePlanetVicinity);
        world.placeNext = placePlanetOrbit;
    }
    debug_StarsystemSol(universe) {
        var world = universe.world;
        var starsystemSol = world.hyperspace.starsystemByName("Sol");
        var starsystemSize = starsystemSol.sizeInner;
        var playerPos = Coords.fromXY(.5, .95).multiply(starsystemSize);
        var playerLoc = Disposition.fromPosAndOrientation(playerPos, new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1)));
        var place = starsystemSol.toPlace(world, playerLoc, null);
        world.placeNext = place;
    }
    debug_Station(universe) {
        var world = universe.world;
        var player = world.player;
        player.credit = 0;
        var resourceDefns = ResourceDefn.Instances();
        var playerItemHolder = player.flagship.itemHolder;
        playerItemHolder.itemAdd(new Item(resourceDefns.Radioactives.name, 1));
        var starsystemSol = world.hyperspace.starsystemByName("Sol");
        var planetEarth = starsystemSol.planets[2];
        var station = planetEarth.satellites[0];
        var placePlanetVicinity = planetEarth.toPlace(universe.world);
        var placeStation = new PlaceStation(world, station, placePlanetVicinity);
        world.placeNext = placeStation;
    }
}
