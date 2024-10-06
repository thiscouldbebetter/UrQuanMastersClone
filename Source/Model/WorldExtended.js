"use strict";
class WorldExtended extends World {
    constructor(name, dateCreated, defn, gameTimeInitial, hyperspace, paraspace, factions, shipDefns, player, starsystemStart) {
        super(name, dateCreated, defn, null, null // placeInitialName
        );
        this.timerTicksSoFar = 0;
        this.gameTimeInitial = gameTimeInitial;
        this.gameSecondsSinceStart = 0;
        this.hyperspace = hyperspace;
        this.paraspace = paraspace;
        this.factions = factions;
        this.shipDefns = shipDefns;
        this.player = player;
        this.factionsByName = ArrayHelper.addLookupsByName(this.factions);
        this.shipDefnsByName = ArrayHelper.addLookupsByName(this.shipDefns);
        var placeStart = starsystemStart.toPlace(this, // world
        Disposition.fromPosAndOrientation(Coords.fromXY(.5, .95).multiply(starsystemStart.sizeInner), new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1))), null // planet?
        );
        this.placeCurrentSet(placeStart);
    }
    static create(universe) {
        var now = DateTime.now();
        var nowAsString = now.toStringMMDD_HHMM_SS();
        var activityDefns = [
            Player.activityDefn(),
            Lifeform.activityDefnApproachPlayer(),
            ShipGroupBase.activityDefnApproachPlayer(),
            ShipGroupBase.activityDefnApproachTarget(),
            Lifeform.activityDefnAvoidPlayer(),
            ShipGroupBase.activityDefnDie(),
            Lifeform.activityDefnDoNothing(),
            Combat.activityDefnEnemy(),
            Planet.activityDefnGravitate(),
            ShipGroupBase.activityDefnLeave(),
            Lifeform.activityDefnMoveToRandomPosition()
        ];
        var actions = Ship.actions();
        var actionsCombat = Combat.actions();
        var actionToInputsMappings = Ship.actionToInputsMappings();
        var entityPropertyNamesToProcess = [
            Actor.name,
            Damager.name,
            Ephemeral.name,
            Killable.name,
            Playable.name,
            CollisionTrackerBase.name,
            Locatable.name,
            Constrainable.name,
            Collidable.name,
            Boundable.name,
            GameClock.name,
            //Drawable.name,
            //Camera.name
        ];
        var placeDefns = [
            PlaceDefn.from5(PlaceCombat.name, "Music_Combat", actionsCombat, actionToInputsMappings, entityPropertyNamesToProcess.slice(0).concat([Ship.name])),
            PlaceDefn.from5(PlaceEncounter.name, "Music_Encounter", actions, actionToInputsMappings, [] // propertyNamesToProcess
            ),
            PlaceDefn.from5(PlaceHyperspace.name, "Music_Hyperspace", actions, actionToInputsMappings, entityPropertyNamesToProcess.slice(0).concat([Fuelable.name])),
            PlaceDefn.from5(PlaceHyperspaceMap.name, "Music_Hyperspace", actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from5(PlacePlanetOrbit.name, "Music_Planet", actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from5(PlacePlanetSurface.name, "Music_Planet", actionsCombat, actionToInputsMappings, entityPropertyNamesToProcess.slice(0).concat([EntityGenerator.name])),
            PlaceDefn.from5(PlacePlanetVicinity.name, "Music_Starsystem", actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from5(PlaceStarsystem.name, "Music_Starsystem", actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from5(PlaceStation.name, "Music_Music", actions, actionToInputsMappings, entityPropertyNamesToProcess),
        ];
        var hyperspaceSize = Coords.fromXY(1, 1).multiplyScalar(10000);
        // special
        var textConversation = "Conversation-";
        var textLahkemupGuardDrone = "LahkemupGuardDrone";
        var lahkemupGuardDrone = new Faction(textLahkemupGuardDrone, null, // nameOriginal
        null, // color
        Faction.RelationsHostile, true, // talksImmediately
        textConversation + textLahkemupGuardDrone, // conversationDefnName
        null, // territory
        "GuardDrone", // shipDefnName
        new Activity(ShipGroupBase.activityDefnApproachPlayer().name, null));
        // normal
        var f = (name, nameOriginal, color, territory, relations, shipDefnName) => {
            var talksImmediately = (territory == null); // hack
            return new Faction(name, nameOriginal, color, relations, talksImmediately, textConversation + name, // conversationDefnName
            territory, shipDefnName, new Activity(ShipGroupBase.activityDefnApproachPlayer().name, null));
        };
        var soi = (centerX, centerY, radius) => {
            var sphere = new Sphere(Coords.fromXY(centerX, 1000 - centerY).multiplyScalar(10), radius * hyperspaceSize.x);
            var territory = new FactionTerritory(sphere);
            return territory;
        };
        var c = Color.Instances();
        var hostile = Faction.RelationsHostile;
        var neutral = Faction.RelationsNeutral;
        var daaskap = f("Daaskap", "Druuge", c.Red, soi(946.9, 280.6, .1), neutral, "Kickback");
        var ellfyn = f("Ellfyn", "Arilou", c.Blue, soi(100, 500, .05), neutral, "Discus");
        var famorfex = f("Famorfex", "Umgah", c.Violet, soi(197.8, 596.8, .1), hostile, "Pustule");
        var grimmotz = f("Grimmotz", "Utwig", c.Cyan, soi(863.0, 869.3, .1), neutral, "Punishpunj");
        var hyphae = f("Hyphae", "Mycon", c.Purple, soi(629.1, 220.8, .12), hostile, "Sporsac");
        var kehlemal = f("Kehlemal", "Kohrah", c.Gray, soi(610, 610, .25), hostile, "Silencer");
        var lahkemup = f("Lahkemup", "Urquan", c.Green, soi(590, 590, .25), hostile, "Shackler");
        var konstalyxz = f("Konstalyxz", "Chmmr", null, null, neutral, "Gravitar");
        var mauluska = f("Mauluska", "Spathi", c.Brown, soi(241.6, 368.7, .12), neutral, "Scuttler");
        var muunfaz = f("Muunfaz", "Pkunk", c.Cyan, soi(52.2, 52.5, .1), neutral, "Fireblossom");
        var mazonae = f("Mazonae", "Syreen", null, null, neutral, "Elysian");
        var murch = f("Murch", "Melnorme", null, null, neutral, "Indemnity");
        var outz = f("Outz", "Orz", c.Purple, soi(371.3, 253.7, .1), neutral, "Wingshadow");
        var raknoid = f("Raknoid", "Ilwrath", c.Purple, soi(22.9, 366.6, .15), hostile, "Infernus");
        var raptodact = f("Raptodact", "Yehat", c.Violet, soi(492.3, 29.4, .1), neutral, "Aegis");
        //var raptorRebel 	= f("RaptorRebel", 	"Yehat", 	c("Mauve"), soi(492.3, 29.4, .1), 	neutral, "Aegis");
        //var raptorRoyalist= f("RaptorRoyalist","Yehat", 	c("Violet"),soi(492.3, 29.4, .1), 	neutral, "Aegis");
        var supian = f("Supian", "Shofixti", null, null, hostile, "Starbright");
        var terran = f("Terran", "Earthling", null, null, neutral, "Broadsider");
        var tempestrial = f("Tempestrial", "Slylandro", null, soi(500, 500, 1000), hostile, "Tumbler");
        var triunion = f("Triunion", "Zoqfotpik", c.Red, soi(400, 543.7, .067), neutral, "Nitpiknik");
        var twyggan = f("Twyggan", "Supox", c.Brown, soi(741.4, 912.4, .1), neutral, "Efflorescence");
        var ugglegruj = f("Ugglegruj", "VUX", c.Blue, soi(433.3, 168.7, .12), hostile, "Encumbrator");
        var vaarphig = f("Vaarphig", "Thraddash", c.Cyan, soi(253.5, 835.8, .1), hostile, "Afterburner");
        var factions = [
            daaskap,
            ellfyn,
            famorfex,
            grimmotz,
            hyphae,
            kehlemal,
            konstalyxz,
            lahkemup,
            lahkemupGuardDrone,
            mauluska,
            muunfaz,
            mazonae,
            murch,
            outz,
            raknoid,
            raptodact,
            supian,
            tempestrial,
            terran,
            triunion,
            twyggan,
            ugglegruj,
            vaarphig
        ];
        var shipDefns = ShipDefn.Instances(universe)._All;
        var energySources = EnergySource.Instances()._All;
        var lifeformDefns = LifeformDefn.Instances()._All;
        var resourceDefns = ResourceDefn.Instances()._All;
        var defn = new WorldDefnExtended(activityDefns, factions, lifeformDefns, placeDefns, resourceDefns, shipDefns, energySources);
        var mediaLibrary = universe.mediaLibrary;
        var starsAndPlanetsAsStringCsvCompressed = mediaLibrary.textStringGetByName("StarsAndPlanets").value;
        var starsystemSizeInner = Coords.fromXY(1, 1).multiplyScalar(300);
        var hyperspace = Hyperspace.fromFileContentsAsString(hyperspaceSize, starsystemSizeInner, factions, energySources, starsAndPlanetsAsStringCsvCompressed);
        // Create paraspace.
        const hyperspaceName = "Hyperspace";
        const paraspaceName = "Paraspace";
        const paraspaceLinkPortalName = "UNKNOWN";
        let lp = (fromPos, toPos) => {
            return new LinkPortal(paraspaceLinkPortalName, fromPos, hyperspaceName, toPos);
        };
        var paraspaceSize = hyperspaceSize.clone();
        var paraspaceLinkPortals = [
            new LinkPortal(paraspaceLinkPortalName, Coords.fromXY(6134, 5900), // pos
            Encounter.name + "-EllfynHomeworld", null // destinationPos
            ),
            lp(Coords.fromXY(4480, 5040), Coords.fromXY(5658, 9712)), // Lyncis (Freaky Beast)
            lp(Coords.fromXY(4580, 4920), Coords.fromXY(8607, 151)), // Trianguli (SE)
            lp(Coords.fromXY(4660, 5140), Coords.fromXY(2302, 3988)), // Gruis (Mauluska) 
            lp(Coords.fromXY(4680, 4640), Coords.fromXY(9211, 6104)), // Arcturus (Ttosting)
            lp(Coords.fromXY(4760, 4580), Coords.fromXY(4091, 7748)), // Monocerotis (Lahk-Emup NW)
            lp(Coords.fromXY(4760, 4960), Coords.fromXY(6117, 4131)), // Camelopardalis (Lahk-Emup S)
            lp(Coords.fromXY(4880, 5380), Coords.fromXY(9735, 3153)), // Persei (Daaskap) 
            lp(Coords.fromXY(4920, 4920), Coords.fromXY(50, 1647)), // Mizar (Raknoid)
            lp(Coords.fromXY(5020, 4600), Coords.fromXY(3184, 4906)), // Capricorni (Triunion)
            lp(Coords.fromXY(5060, 4740), Coords.fromXY(1910, 962)), // Lyrae (Sol)
            lp(Coords.fromXY(5160, 4660), Coords.fromXY(5673, 1207)), // Sculptoris (Hyphae)
            lp(Coords.fromXY(5200, 5140), Coords.fromXY(103, 9404)), // Corvi (Tempestrials)
            lp(Coords.fromXY(5200, 5400), Coords.fromXY(5850, 6213)), // Crateris (Lahk-Emup Center)
            lp(Coords.fromXY(5300, 5280), Coords.fromXY(7752, 8906)), // Librae (Twyggan)
            lp(Coords.fromXY(5440, 5320), Coords.fromXY(368, 6332)), // Circini (Elfynn)
        ];
        var paraspace = Hyperspace.fromNameSizeAndLinkPortals(paraspaceName, paraspaceSize, paraspaceLinkPortals);
        // Add a portal to paraspace in hyperspace,
        // and multiple portals to hyperspace in paraspace.
        var paraspacePortalPos = Coords.fromXY(438, 6372);
        var linkPortal = new LinkPortal(paraspaceLinkPortalName, paraspacePortalPos, paraspaceName, Coords.fromXY(5000, 5000) // destinationPos
        );
        hyperspace.linkPortalAdd(linkPortal);
        var starsystemStart = hyperspace.starsystemByName("Sol");
        starsystemStart.solarSystem(universe);
        var starsystems = hyperspace.starsystems;
        var starsystemsSupergiant = starsystems.filter(x => x.starSizeIndex == 2);
        starsystemsSupergiant.forEach(starsystem => {
            var shipGroup = new ShipGroupFinite(murch.name + " " + "Ship Group", murch.name, Coords.random(universe.randomizer).multiply(starsystem.sizeInner), [
                new Ship(murch.shipDefnName)
            ]);
            starsystem.shipGroupAdd(shipGroup);
        });
        var playerShipDefnName = "Flagship";
        var playerShip = new Ship(playerShipDefnName);
        var shipDefns = ShipDefn.Instances(universe)._All;
        var playerShips = [
            playerShip,
            new Ship("Broadsider")
        ];
        var playerShipGroup = new ShipGroupFinite("Player", "Player", // factionName
        starsystemStart.posInHyperspace.clone(), // pos
        playerShips);
        var shipComponentDefns = ShipComponentDefn.Instances();
        var playerFlagship = new Flagship(playerShipDefnName, 12, // componentsMax
        10, // thrustersMax
        10, // turningJetsMax
        [
            shipComponentDefns.FusionThruster.name,
            shipComponentDefns.CargoBay.name,
            shipComponentDefns.CrewHabitat.name,
            shipComponentDefns.FuelTank.name,
            shipComponentDefns.TurningJets.name,
        ], // componentNames
        1, // numberOfLanders
        50, // crew
        100, // fuel
        0, // resourceCredits
        0, // infoCredits
        [], // items
        30 // shipsMax
        );
        //var factionNamesAll = factions.elementProperties("name");
        var player = new Player("Player", playerFlagship, [
        //"Terran"
        ], // factionsKnownNames
        playerShipGroup);
        var shipDefns = ShipDefn.Instances(universe)._All;
        var returnValue = new WorldExtended("World-" + nowAsString, now, // dateCreated
        defn, new Date(Date.UTC(2155, 1, 17, 9, 27, 22)), hyperspace, paraspace, factions, shipDefns, player, starsystemStart);
        return returnValue;
    }
    // instance methods
    defnExtended() {
        return this.defn;
    }
    draw(universe) {
        this.placeCurrent.draw(universe, universe.world, universe.display);
    }
    faction(factionName) {
        return this.factionByName(factionName);
    }
    factionByName(factionName) {
        var faction = this.factionsByName.get(factionName);
        if (faction == null) {
            throw new Error("No faction found with name '" + factionName + "'.");
        }
        return faction;
    }
    gameTimeAsString() {
        var millisecondsPerSecond = 1000;
        var timeCurrentInMilliseconds = this.gameTimeInitial.getTime()
            + this.gameSecondsSinceStart * millisecondsPerSecond;
        var timeCurrentAsDate = new Date(timeCurrentInMilliseconds);
        var timeCurrentAsString = timeCurrentAsDate.toISOString();
        return timeCurrentAsString;
    }
    initialize(uwpe) {
        this.placeCurrent.initialize(uwpe.worldSet(this));
    }
    placeByName(placeName) {
        var returnPlace;
        var placeNameParts = placeName.split(":");
        var placeTypeName = placeNameParts[0];
        var placeNameActual = placeNameParts[1];
        if (placeTypeName == PlaceHyperspace.name) {
            throw new Error("Not yet implemented!");
        }
        else if (placeTypeName == PlacePlanetVicinity.name) {
            var planetName = placeNameActual;
            var starsystem = this.hyperspace.starsystems.find(x => x.planets.some(y => y.name == planetName));
            var planet = starsystem.planets.find(x => x.name == planetName);
            returnPlace = planet.toPlace(this);
        }
        else if (placeTypeName == PlaceStarsystem.name) {
            throw new Error("Not yet implemented!");
        }
        else {
            throw new Error("Unrecognized place type: " + placeTypeName);
        }
        return returnPlace;
    }
    shipDefnByName(shipDefnName) {
        return this.shipDefnsByName.get(shipDefnName);
    }
    // World overrides.
    placeGetByName(name) {
        return this.placeCurrent; // hack
    }
    updateForTimerTick(uwpe) {
        super.updateForTimerTick(uwpe);
    }
    toControl(universe) {
        return new ControlNone();
    }
    toVenue() {
        return new VenueWorld(this);
    }
}
