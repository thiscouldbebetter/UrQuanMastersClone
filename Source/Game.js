"use strict";
class Game {
    mediaLibraryBuild(contentDirectoryPath) {
        var imageDirectory = contentDirectoryPath + "Images/";
        var imageDirectoryLifeforms = imageDirectory + "Lifeforms/";
        var png = ".png";
        var audioDirectory = contentDirectoryPath + "Audio/";
        var textDirectory = contentDirectoryPath + "Text/";
        var conversation = "Conversation-";
        var content = "-Content";
        var conversationDirectory = textDirectory + "Conversation/";
        var conversationPlaceholderPath = conversationDirectory + "Placeholder.json";
        var conversationPortrait = "Conversation-Portrait-";
        var contentPathPrefixComms = contentDirectoryPath + "Import/sc2/content/base/comm/";
        var mediaLibrary = new MediaLibrary(contentDirectoryPath, 
        // images
        [
            // conversation 
            new Image2("Conversation", imageDirectory + "Conversation.png"),
            new Image2(conversationPortrait + "EarthStation", contentDirectoryPath + "Import/sc2/content/base/comm/commander/commander-000.png"),
            new Image2(conversationPortrait + "Lahkemup", contentDirectoryPath + "Import/sc2/content/base/comm/urquan/urquan-000.png"),
            new Image2(conversationPortrait + "Mauluska", contentDirectoryPath + "Import/sc2/content/base/comm/spathi/spathi-000.png"),
            new Image2(conversationPortrait + "Murch", contentDirectoryPath + "Import/sc2/content/base/comm/melnorme/melnorme-000.png"),
            new Image2(conversationPortrait + "Tempestrial", contentDirectoryPath + "Import/sc2/content/base/comm/probe/probe-000.png"),
            new Image2(conversationPortrait + "Triunion", contentDirectoryPath + "Import/sc2/content/base/comm/zoqfotpik/zoqfotpik-000.png"),
            // opening
            new Image2("Opening", imageDirectory + "Opening.png"),
            new Image2("Producer", imageDirectory + "Producer.png"),
            new Image2("Title", imageDirectory + "Title.png"),
            // opening - slides
            new Image2("Black", imageDirectory + "Slides/Black-1x1px.png"),
            new Image2("Red", imageDirectory + "Slides/Red-1x1px.png"),
            new Image2("Cyan", imageDirectory + "Slides/Cyan-1x1px.png"),
            // planets
            new Image2("PlanetSurface", imageDirectory + "PlanetSurface.png"),
            // planets-lifeforms
            new Image2("RadarBlossom", imageDirectoryLifeforms + "01-RadarBlossom" + png),
            new Image2("LavaPool", imageDirectoryLifeforms + "02-LavaPool" + png),
            new Image2("SquirtPod", imageDirectoryLifeforms + "03-SquirtPod" + png),
            new Image2("ClapperBush", imageDirectoryLifeforms + "04-ClapperBush" + png),
            new Image2("CarouselTree", imageDirectoryLifeforms + "05-CarouselTree" + png),
            new Image2("BlueTube", imageDirectoryLifeforms + "06-BlueTube" + png),
            new Image2("BrassNeedler", imageDirectoryLifeforms + "07-BrassNeedler" + png),
            new Image2("CreepingBean", imageDirectoryLifeforms + "08-CreepingBean" + png),
            new Image2("LightningAnemone", imageDirectoryLifeforms + "09-LightningAnemone" + png),
            new Image2("Radiooculopod", imageDirectoryLifeforms + "10-Radiooculopod" + png),
            new Image2("SwarmsOfThings", imageDirectoryLifeforms + "11-SwarmsOfThings" + png),
            new Image2("ElasticSphere", imageDirectoryLifeforms + "12-ElasticSphere" + png),
            new Image2("TriopticSquid", imageDirectoryLifeforms + "13-TriopticSquid" + png),
            new Image2("LeapingLizard", imageDirectoryLifeforms + "14-LeapingLizard" + png),
            new Image2("BloodyBathmat", imageDirectoryLifeforms + "15-BloodyBathmat" + png),
            new Image2("BiteyMouse", imageDirectoryLifeforms + "16-BiteyMouse" + png),
            new Image2("SmushedDuckling", imageDirectoryLifeforms + "17-SmushedDuckling" + png),
            new Image2("FungusAmungus", imageDirectoryLifeforms + "18-FungusAmungus" + png),
            new Image2("WaddleEye", imageDirectoryLifeforms + "19-WaddleEye" + png),
            new Image2("SpuriousEaglet", imageDirectoryLifeforms + "20-SpuriousEaglet" + png),
            new Image2("CottonCandycane", imageDirectoryLifeforms + "21-CottonCandycane" + png),
            new Image2("BulgingEyeworm", imageDirectoryLifeforms + "22-BulgingEyeworm" + png),
            new Image2("PopperUpper", imageDirectoryLifeforms + "23-PopperUpper" + png),
            new Image2("BioDecoy", imageDirectoryLifeforms + "24-Biodecoy" + png),
            new Image2("MauluskaGourmand", imageDirectoryLifeforms + "25-MauluskaGourmand" + png),
            new Image2("FreakyBeast", imageDirectoryLifeforms + "26-FreakyBeast" + png),
        ], 
        // sounds
        [
            new SoundFromFile("Sound", audioDirectory + "Effects/Sound.wav"),
            new SoundFromFile("Music_Music", audioDirectory + "Music/Music.mp3"),
            new SoundFromFile("Music_Producer", audioDirectory + "Music/Music.mp3"),
            new SoundFromFile("Music_Title", audioDirectory + "Music/Music.mp3"),
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
            //new TextString("Instructions", "../Content/Text/Instructions.txt"),
            new TextString("StarsAndPlanets", textDirectory + "PlanetDatabase.csv"),
            new TextString(conversation + "EarthStation", conversationDirectory + "EarthStation.json"),
            new TextString(conversation + "EarthStation" + content, conversationDirectory + "EarthStation-Content.txt"),
            new TextString(conversation + "LahkemupGuardDrone", conversationDirectory + "LahkemupGuardDrone.json"),
            new TextString(conversation + "LahkemupGuardDrone" + content, conversationDirectory + "LahkemupGuardDrone-Content.txt"),
            new TextString(conversation + "Lahkemup" + content, contentPathPrefixComms + "urquan/urquan.txt"),
            new TextString("Conversation-Placeholder-Content", conversationDirectory + "Placeholder-Content.txt"),
            new TextString(conversation + "Amorfus", conversationPlaceholderPath),
            new TextString(conversation + "Araknoid", conversationPlaceholderPath),
            new TextString(conversation + "Daskapital", conversationPlaceholderPath),
            new TextString(conversation + "Ellfyn", conversationPlaceholderPath),
            new TextString(conversation + "Hyphae", conversationPlaceholderPath),
            new TextString(conversation + "Kehlemal", conversationPlaceholderPath),
            new TextString(conversation + "Lahkemup", conversationPlaceholderPath),
            new TextString(conversation + "Mauluska", conversationDirectory + "Mauluska.json"),
            new TextString(conversation + "Mauluska" + content, contentPathPrefixComms + "spathi/spathi.txt"),
            new TextString(conversation + "MauluskaOrphan", conversationDirectory + "MauluskaOrphan.json"),
            new TextString(conversation + "MauluskaOrphan" + content, contentPathPrefixComms + "spathi/spathi.txt"),
            new TextString(conversation + "Moroz", conversationPlaceholderPath),
            new TextString(conversation + "Muuncaf", conversationPlaceholderPath),
            new TextString(conversation + "Mazonae", conversationPlaceholderPath),
            new TextString(conversation + "Murch", conversationDirectory + "Murch.json"),
            new TextString(conversation + "Murch" + content, contentPathPrefixComms + "melnorme/melnorme.txt"),
            new TextString(conversation + "Outsider", conversationPlaceholderPath),
            new TextString(conversation + "Raptor", conversationPlaceholderPath),
            new TextString(conversation + "Silikonix", conversationPlaceholderPath),
            new TextString(conversation + "Supial", conversationPlaceholderPath),
            new TextString(conversation + "Tempestrial", conversationDirectory + "Tempestrial.json"),
            new TextString(conversation + "Tempestrial" + content, contentPathPrefixComms + "probe/probe.txt"),
            new TextString(conversation + "Triunion", conversationDirectory + "Triunion.json"),
            new TextString(conversation + "Triunion" + content, contentPathPrefixComms + "zoqfotpik/zoqfotpik.txt"),
            new TextString(conversation + "Twyggan", conversationPlaceholderPath),
            new TextString(conversation + "Ugglegruj", conversationPlaceholderPath),
            new TextString(conversation + "Warpig", conversationPlaceholderPath),
        ]);
        return mediaLibrary;
    }
    start() {
        //localStorage.clear();
        var contentDirectoryPath = "../Content/";
        var mediaLibrary = this.mediaLibraryBuild(contentDirectoryPath);
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
        var controlBuilder = ControlBuilder.fromStyles([ControlStyle.Instances().Dark]);
        var universe = Universe.create("SpaceAdventureClone", "0.0.0-20220109", timerHelper, display, mediaLibrary, controlBuilder, WorldCreator.fromWorldCreate(WorldExtended.create));
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
        else if (debuggingModeName == "Planet2") {
            this.debug_Planet2(universe);
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
        else if (debuggingModeName.startsWith("Talk")) {
            if (debuggingModeName.endsWith("MauluskaOrphan")) {
                this.debug_Talk_MauluskaOrphan(universe);
            }
            else if (debuggingModeName.endsWith("Murch")) {
                this.debug_Talk_Murch(universe);
            }
            else if (debuggingModeName.endsWith("Tempestrial")) {
                this.debug_Talk_Tempestrial(universe);
            }
            else if (debuggingModeName.endsWith("Triunion")) {
                this.debug_Talk_Triunion(universe);
            }
            else {
                throw new Error("Unrecognized debugging mode: " + debuggingModeName);
            }
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
        player.resourceCredits = 1000;
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
        var starsystem = world.hyperspace.starsystems.find(x => x.name == "Sol");
        var planet = starsystem.planets[0]; // Mercury
        var uwpe = new UniverseWorldPlaceEntities(universe, world, null, null, null);
        planet.initialize(uwpe);
        var placePlanetVicinity = null;
        var placePlanetOrbit = new PlacePlanetOrbit(world, planet, placePlanetVicinity);
        world.placeNext = placePlanetOrbit;
    }
    debug_Planet2(universe) {
        var world = universe.world;
        var starsystem = world.hyperspace.starsystems.find(x => x.name == "Eta Giclas");
        var planet = starsystem.planets[4]; // E Giclas V
        var uwpe = new UniverseWorldPlaceEntities(universe, world, null, null, null);
        planet.initialize(uwpe);
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
        player.resourceCredits = 0;
        var resourceDefns = ResourceDefn.Instances();
        var playerItemHolder = player.flagship.itemHolder;
        playerItemHolder.itemAdd(new Item(resourceDefns.Radioactives.name, 1));
        var starsystemSol = world.hyperspace.starsystemByName("Sol");
        var planetEarth = starsystemSol.planets[2];
        var station = planetEarth.satellites[0];
        var placePlanetVicinity = planetEarth.toPlace(world);
        var placeStation = new PlaceStation(world, station, placePlanetVicinity);
        world.placeNext = placeStation;
    }
    debug_Talk_MauluskaOrphan(universe) {
        var talker = new Talker("Conversation-MauluskaOrphan", null, // quit
        (cr, size, u) => cr.toControl_Layout_2(size, universe));
        var entityPlayer = new Entity("Player", []);
        var entityTalker = new Entity("Mauluska", [talker]);
        var uwpe = new UniverseWorldPlaceEntities(universe, universe.world, universe.world.placeCurrent, entityTalker, entityPlayer);
        talker.talk(uwpe);
    }
    debug_Talk_Murch(universe) {
        var talker = new Talker("Conversation-Murch", null, // quit
        (cr, size, u) => cr.toControl_Layout_2(size, universe));
        var entityPlayer = new Entity("Player", []);
        var entityTalker = new Entity("Murch", [talker]);
        var uwpe = new UniverseWorldPlaceEntities(universe, universe.world, universe.world.placeCurrent, entityTalker, entityPlayer);
        talker.talk(uwpe);
    }
    debug_Talk_Tempestrial(universe) {
        var talker = new Talker("Conversation-Tempestrial", null, // quit
        (cr, size, u) => cr.toControl_Layout_2(size, universe));
        var entityTalker = new Entity("Tempestrial", [talker]);
        var entityPlayer = new Entity("Player", [Locatable.fromPos(Coords.create()), new Playable()]);
        var world = universe.world;
        var hyperspace = world.hyperspace;
        var placeHyperspace = new PlaceHyperspace(universe, hyperspace, hyperspace.starsystems[0], // starsystemDeparted,
        Disposition.create());
        var uwpe = new UniverseWorldPlaceEntities(universe, universe.world, placeEncounter, entityPlayer, entityTalker);
        placeHyperspace.entitySpawn(uwpe);
        var encounter = new Encounter(null, // planet,
        null, // factionName,
        entityPlayer, entityTalker, placeHyperspace, // placeToReturnTo
        null // posToReturnTo
        );
        uwpe.entitiesSwap();
        var placeEncounter = new PlaceEncounter(world, encounter);
        universe.world.placeCurrent = placeEncounter;
        talker.talk(uwpe);
    }
    debug_Talk_Triunion(universe) {
        var talker = new Talker("Conversation-Triunion", null, // quit
        (cr, size, u) => cr.toControl_Layout_2(size, universe));
        var entityPlayer = new Entity("Player", []);
        var entityTalker = new Entity("Triunion", [talker]);
        var uwpe = new UniverseWorldPlaceEntities(universe, universe.world, universe.world.placeCurrent, entityTalker, entityPlayer);
        talker.talk(uwpe);
    }
}
