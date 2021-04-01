"use strict";
class WorldExtended extends World {
    constructor(name, dateCreated, defn, player, hyperspace, starsystemStart) {
        super(name, dateCreated, defn, []);
        this.timerTicksSoFar = 0;
        this.player = player;
        this.hyperspace = hyperspace;
        this.placeCurrent = new PlaceStarsystem(this, starsystemStart, new Disposition(Coords.fromXY(.5, .95).multiply(starsystemStart.sizeInner), new Orientation(new Coords(0, -1, 0), new Coords(0, 0, 1)), null), null);
        //this.place.entitiesSpawn(null, this);
    }
    static create(universe) {
        var now = DateTime.now();
        var nowAsString = now.toStringMMDD_HHMM_SS();
        // todo
        var activityDefns = [
            Player.activityDefn(),
            ShipGroup.activityDefnApproachPlayer(),
            ShipGroup.activityDefnDie(),
            ShipGroup.activityDefnLeave()
        ];
        var actions = Ship.actions();
        var actionToInputsMappings = Ship.actionToInputsMappings();
        var entityPropertyNamesToProcess = [
            Actor.name,
            Playable.name,
            Locatable.name,
            Constrainable.name,
            Collidable.name,
            Boundable.name,
        ];
        var placeDefns = [
            PlaceDefn.from4(PlaceCombat.name, actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from4(PlaceEncounter.name, actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from4(PlaceHyperspace.name, actions, actionToInputsMappings, entityPropertyNamesToProcess.slice(0).concat([Fuelable.name])),
            PlaceDefn.from4(PlacePlanetOrbit.name, actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from4(PlacePlanetSurface.name, actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from4(PlacePlanetVicinity.name, actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from4(PlaceStarsystem.name, actions, actionToInputsMappings, entityPropertyNamesToProcess),
            PlaceDefn.from4(PlaceStation.name, actions, actionToInputsMappings, entityPropertyNamesToProcess),
        ];
        var hyperspaceSize = Coords.fromXY(1, 1).multiplyScalar(10000);
        // special
        var factionTerran = new Faction("Terran", null, // nameOriginal
        null, // color
        Faction.RelationsAllied, // todo
        true, // talksImmediately
        "EarthStation", // conversationDefnName
        null, // sphereOfInfluence
        "Broadsider", // shipDefnName
        null // shipGroupActivity
        );
        var factionLahkemupGuardDrone = new Faction("LahkemupGuardDrone", null, // nameOriginal
        null, // color
        Faction.RelationsHostile, true, // talksImmediately
        "LahkemupGuardDrone", // conversationDefnName
        null, // sphereOfInfluence
        null, // shipDefnName
        new Activity(ShipGroup.activityDefnApproachPlayer().name, null));
        // normal
        var f = (name, nameOriginal, color, sphereOfInfluence, relations, shipDefnName) => {
            var talksImmediately = (sphereOfInfluence == null);
            return new Faction(name, nameOriginal, color, relations, talksImmediately, name, // conversationDefnName
            sphereOfInfluence, shipDefnName, new Activity(ShipGroup.activityDefnApproachPlayer().name, null));
        };
        var soi = (centerX, centerY, radius) => {
            return new Sphere(Coords.fromXY(centerX, 1000 - centerY).multiplyScalar(10), radius * hyperspaceSize.x);
        };
        var c = (colorName) => Color.byName(colorName);
        var hostile = Faction.RelationsHostile;
        var neutral = Faction.RelationsNeutral;
        var factionAmorfus = f("Amorfus", "Umgah", c("Violet"), soi(197.8, 596.8, .1), hostile, "Pustule");
        var factionAraknoid = f("Araknoid", "Ilwrath", c("Purple"), soi(22.9, 366.6, .15), hostile, "Infernus");
        var factionDaskapital = f("Daskapital", "Druuge", c("Red"), soi(946.9, 280.6, .1), neutral, "Kickback");
        var factionEllfyn = f("Ellfyn", "Arilou", c("Blue"), soi(100, 500, .05), neutral, "Discus");
        var factionHyphae = f("Hyphae", "Mycon", c("Purple"), soi(629.1, 220.8, .12), hostile, "Sporsac");
        var factionKehlemal = f("Kehlemal", "Kohrah", c("Gray"), soi(610, 610, .25), hostile, "Silencer");
        var factionLahkemup = f("Lahkemup", "Urquan", c("Green"), soi(590, 590, .25), hostile, "Shackler");
        var factionSilikonix = f("Konstalyxz", "Chmmr", null, null, neutral, "Gravitar");
        var factionMauluska = f("Mauluska", "Spathi", c("Brown"), soi(241.6, 368.7, .12), neutral, "Scuttler");
        var factionMoroz = f("Moroz", "Utwig", c("Cyan"), soi(863.0, 869.3, .1), neutral, "Punishpunj");
        var factionMuuncaf = f("Muuncaf", "Pkunk", c("Cyan"), soi(52.2, 52.5, .1), neutral, "Fireblossom");
        var factionMazonae = f("Mazonae", "Syreen", null, null, neutral, "Elysian");
        var factionMurch = f("Murch", "Melnorme", null, null, neutral, "Indemnity");
        var factionOutsider = f("Outsider", "Orz", c("Purple"), soi(371.3, 253.7, .1), neutral, "Wingshadow");
        var factionRaptor = f("Raptor", "Yehat", c("Violet"), soi(492.3, 29.4, .1), neutral, "Aegis");
        //var factionRaptorRebel 	= f("RaptorRebel", 	"Yehat", 	c("Mauve"), soi(492.3, 29.4, .1), 	neutral, "Aegis");
        //var factionRaptorRoyalist= f("RaptorRoyalist","Yehat", 	c("Violet"),soi(492.3, 29.4, .1), 	neutral, "Aegis");
        var factionSupial = f("Supial", "Shofixti", null, null, hostile, "Starbright");
        var factionTempestrial = f("Tempestrial", "Slylandro", null, soi(500, 500, 1000), hostile, "Tumbler");
        var factionTriunion = f("Triunion", "Zoqfotpik", c("Red"), soi(400, 543.7, .067), neutral, "Nitpiknik");
        var factionTwyggan = f("Twyggan", "Supox", c("Brown"), soi(741.4, 912.4, .1), neutral, "Efflorescence");
        var factionUgglegruj = f("Ugglegruj", "VUX", c("Blue"), soi(433.3, 168.7, .12), hostile, "Encumbrator");
        var factionWarpig = f("Warpig", "Thraddash", c("Cyan"), soi(253.5, 835.8, .1), hostile, "Afterburner");
        var factions = [
            factionAmorfus,
            factionAraknoid,
            factionDaskapital,
            factionEllfyn,
            factionHyphae,
            factionKehlemal,
            factionLahkemup,
            factionLahkemupGuardDrone,
            factionMauluska,
            factionMoroz,
            factionMuuncaf,
            factionMazonae,
            factionMurch,
            factionOutsider,
            factionRaptor,
            factionSilikonix,
            factionSupial,
            factionTempestrial,
            factionTerran,
            factionTriunion,
            factionTwyggan,
            factionUgglegruj,
            factionWarpig,
        ];
        var shipDefns = ShipDefn.Instances(universe)._All;
        var lifeformDefns = LifeformDefn.Instances()._All;
        var defn = new WorldDefnExtended(activityDefns, factions, lifeformDefns, placeDefns, shipDefns);
        var mediaLibrary = universe.mediaLibrary;
        var starsAndPlanetsAsStringCSVCompressed = mediaLibrary.textStringGetByName("StarsAndPlanets").value;
        var hyperspace = Hyperspace.fromFileContentsAsString(hyperspaceSize, 10, // starsystemRadiusOuter
        Coords.fromXY(300, 300), factions, starsAndPlanetsAsStringCSVCompressed);
        var starsystemStart = hyperspace.starsystemByName("Sol");
        starsystemStart.solarSystem(); // todo
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
        var player = new Player("Player", 0, // credit
        playerFlagship, [
            "Terran"
        ], // factionsKnownNames
        playerShipGroup);
        var returnValue = new WorldExtended("World-" + nowAsString, now, // dateCreated
        defn, player, hyperspace, starsystemStart);
        return returnValue;
    }
    // instance methods
    defnExtended() {
        return this.defn;
    }
    draw(universe) {
        this.placeCurrent.draw(universe, universe.world, universe.display);
    }
    initialize(universe) {
        this.placeCurrent.initialize(universe, this);
    }
    updateForTimerTick(universe) {
        if (this.placeNext != null) {
            this.placeCurrent.finalize(universe, this);
            this.placeCurrent = this.placeNext;
            this.placeCurrent.initialize(universe, this);
            this.placeNext = null;
        }
        this.placeCurrent.updateForTimerTick(universe, this);
        this.timerTicksSoFar++;
    }
    toControl(universe) {
        return new ControlNone();
    }
    toVenue() {
        return new VenueWorld(this);
    }
}
