"use strict";
class WorldExtended extends World {
    constructor(name, dateCreated, defn, gameTimeInitial, hyperspace, factions, shipDefns, player, starsystemStart) {
        super(name, dateCreated, defn, null, null // placeInitialName
        );
        this.timerTicksSoFar = 0;
        this.gameTimeInitial = gameTimeInitial;
        this.gameSecondsSinceStart = 0;
        this.hyperspace = hyperspace;
        this.factions = factions;
        this.shipDefns = shipDefns;
        this.player = player;
        this.factionsByName = ArrayHelper.addLookupsByName(this.factions);
        this.shipDefnsByName = ArrayHelper.addLookupsByName(this.shipDefns);
        this.placeCurrent = starsystemStart.toPlace(this, // world
        Disposition.fromPosAndOrientation(Coords.fromXY(.5, .95).multiply(starsystemStart.sizeInner), new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1))), null // planet?
        );
        //this.place.entitiesSpawn(null, this);
    }
    static create(universe) {
        var now = DateTime.now();
        var nowAsString = now.toStringMMDD_HHMM_SS();
        var activityDefns = [
            Player.activityDefn(),
            Lifeform.activityDefnApproachPlayer(),
            ShipGroup.activityDefnApproachPlayer(),
            ShipGroup.activityDefnApproachTarget(),
            Lifeform.activityDefnAvoidPlayer(),
            ShipGroup.activityDefnDie(),
            Lifeform.activityDefnDoNothing(),
            Combat.activityDefnEnemy(),
            Planet.activityDefnGravitate(),
            ShipGroup.activityDefnLeave(),
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
            PlaceDefn.from5(PlaceEncounter.name, "Music_Encounter", actions, actionToInputsMappings, entityPropertyNamesToProcess),
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
        null, // sphereOfInfluence
        "GuardDrone", // shipDefnName
        new Activity(ShipGroup.activityDefnApproachPlayer().name, null));
        // normal
        var f = (name, nameOriginal, color, sphereOfInfluence, relations, shipDefnName) => {
            var talksImmediately = (sphereOfInfluence == null);
            return new Faction(name, nameOriginal, color, relations, talksImmediately, textConversation + name, // conversationDefnName
            sphereOfInfluence, shipDefnName, new Activity(ShipGroup.activityDefnApproachPlayer().name, null));
        };
        var soi = (centerX, centerY, radius) => {
            return new Sphere(Coords.fromXY(centerX, 1000 - centerY).multiplyScalar(10), radius * hyperspaceSize.x);
        };
        var c = Color.Instances();
        var hostile = Faction.RelationsHostile;
        var neutral = Faction.RelationsNeutral;
        var amorfus = f("Amorfus", "Umgah", c.Violet, soi(197.8, 596.8, .1), hostile, "Pustule");
        var daskapital = f("Daskapital", "Druuge", c.Red, soi(946.9, 280.6, .1), neutral, "Kickback");
        var ellfyn = f("Ellfyn", "Arilou", c.Blue, soi(100, 500, .05), neutral, "Discus");
        var hyphae = f("Hyphae", "Mycon", c.Purple, soi(629.1, 220.8, .12), hostile, "Sporsac");
        var kehlemal = f("Kehlemal", "Kohrah", c.Gray, soi(610, 610, .25), hostile, "Silencer");
        var lahkemup = f("Lahkemup", "Urquan", c.Green, soi(590, 590, .25), hostile, "Shackler");
        var konstalyxz = f("Konstalyxz", "Chmmr", null, null, neutral, "Gravitar");
        var mauluska = f("Mauluska", "Spathi", c.Brown, soi(241.6, 368.7, .12), neutral, "Scuttler");
        var moroz = f("Moroz", "Utwig", c.Cyan, soi(863.0, 869.3, .1), neutral, "Punishpunj");
        var muuncaf = f("Muuncaf", "Pkunk", c.Cyan, soi(52.2, 52.5, .1), neutral, "Fireblossom");
        var mazonae = f("Mazonae", "Syreen", null, null, neutral, "Elysian");
        var murch = f("Murch", "Melnorme", null, null, neutral, "Indemnity");
        var outsider = f("Outsider", "Orz", c.Purple, soi(371.3, 253.7, .1), neutral, "Wingshadow");
        var raknoid = f("Raknoid", "Ilwrath", c.Purple, soi(22.9, 366.6, .15), hostile, "Infernus");
        var raptor = f("Raptor", "Yehat", c.Violet, soi(492.3, 29.4, .1), neutral, "Aegis");
        //var raptorRebel 	= f("RaptorRebel", 	"Yehat", 	c("Mauve"), soi(492.3, 29.4, .1), 	neutral, "Aegis");
        //var raptorRoyalist= f("RaptorRoyalist","Yehat", 	c("Violet"),soi(492.3, 29.4, .1), 	neutral, "Aegis");
        var supial = f("Supial", "Shofixti", null, null, hostile, "Starbright");
        var terran = f("Terran", "Earthling", null, null, neutral, "Broadsider");
        var tempestrial = f("Tempestrial", "Slylandro", null, soi(500, 500, 1000), hostile, "Tumbler");
        var triunion = f("Triunion", "Zoqfotpik", c.Red, soi(400, 543.7, .067), neutral, "Nitpiknik");
        var twyggan = f("Twyggan", "Supox", c.Brown, soi(741.4, 912.4, .1), neutral, "Efflorescence");
        var ugglegruj = f("Ugglegruj", "VUX", c.Blue, soi(433.3, 168.7, .12), hostile, "Encumbrator");
        var warpig = f("Warpig", "Thraddash", c.Cyan, soi(253.5, 835.8, .1), hostile, "Afterburner");
        var factions = [
            amorfus,
            daskapital,
            ellfyn,
            hyphae,
            kehlemal,
            konstalyxz,
            lahkemup,
            lahkemupGuardDrone,
            mauluska,
            moroz,
            muuncaf,
            mazonae,
            murch,
            outsider,
            raknoid,
            raptor,
            supial,
            tempestrial,
            terran,
            triunion,
            twyggan,
            ugglegruj,
            warpig
        ];
        var shipDefns = ShipDefn.Instances(universe)._All;
        var lifeformDefns = LifeformDefn.Instances()._All;
        var resourceDefns = ResourceDefn.Instances()._All;
        var defn = new WorldDefnExtended(activityDefns, factions, lifeformDefns, placeDefns, resourceDefns, shipDefns);
        var mediaLibrary = universe.mediaLibrary;
        var starsAndPlanetsAsStringCSVCompressed = mediaLibrary.textStringGetByName("StarsAndPlanets").value;
        var hyperspace = Hyperspace.fromFileContentsAsString(hyperspaceSize, 10, // starsystemRadiusOuter
        Coords.fromXY(300, 300), factions, starsAndPlanetsAsStringCSVCompressed);
        var starsystemStart = hyperspace.starsystemByName("Sol");
        starsystemStart.solarSystem(universe);
        var starsystems = hyperspace.starsystems;
        var starsystemsSupergiant = starsystems.filter(x => x.starSizeIndex == 2);
        starsystemsSupergiant.forEach(starsystem => {
            var shipGroup = new ShipGroup(murch.name + " " + ShipGroup.name, murch.name, Coords.random(universe.randomizer).multiply(starsystem.sizeInner), [
                new Ship(murch.shipDefnName)
            ]);
            starsystem.shipGroups.push(shipGroup);
        });
        var playerShipDefnName = "Flagship";
        var playerShip = new Ship(playerShipDefnName);
        var shipDefns = ShipDefn.Instances(universe)._All;
        var playerShips = [
            playerShip,
            new Ship("Broadsider")
        ];
        var playerShipGroup = new ShipGroup("Player", "Player", // factionName
        starsystemStart.posInHyperspace.clone(), // pos
        playerShips);
        var shipComponentDefns = ShipComponentDefn.Instances();
        var playerFlagship = new Flagship(playerShipDefnName, 12, // componentsMax
        10, // thrustersMax
        10, // turningJetsMax
        [
            shipComponentDefns.FusionThruster.name,
            shipComponentDefns.CargoHold.name,
            shipComponentDefns.CrewHabitat.name,
            shipComponentDefns.FuelTank.name,
            shipComponentDefns.TurningJets.name,
        ], // componentNames
        1, // numberOfLanders
        50, // crew
        100, // fuel
        [], // items
        30 // shipsMax
        );
        //var factionNamesAll = factions.elementProperties("name");
        var player = new Player("Player", 0, // resourceCredits
        0, // infoCredits
        playerFlagship, [
        //"Terran"
        ], // factionsKnownNames
        playerShipGroup);
        var shipDefns = ShipDefn.Instances(universe)._All;
        var returnValue = new WorldExtended("World-" + nowAsString, now, // dateCreated
        defn, new Date(Date.UTC(2155, 1, 17, 9, 27, 22)), hyperspace, factions, shipDefns, player, starsystemStart);
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
        return this.factionsByName.get(factionName);
    }
    gameTimeAsString() {
        var timeCurrentInMilliseconds = this.gameTimeInitial.getTime() + this.gameSecondsSinceStart * 1000;
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
        uwpe.worldSet(this);
        if (this.placeNext != null) {
            this.placeCurrent.finalize(uwpe);
            this.placeCurrent = this.placeNext;
            this.placeCurrent.initialize(uwpe);
            this.placeNextSet(null);
        }
        this.placeCurrent.updateForTimerTick(uwpe);
        this.timerTicksSoFar++;
    }
    toControl(universe) {
        return new ControlNone();
    }
    toVenue() {
        return new VenueWorld(this);
    }
}
