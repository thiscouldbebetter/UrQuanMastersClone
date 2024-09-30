"use strict";
class Starsystem {
    constructor(name, starSizeIndex, starColor, posInHyperspace, sizeInner, factionName, planets, shipGroups) {
        this.name = name;
        this.starSizeIndex = starSizeIndex;
        this.starColor = starColor;
        this.posInHyperspace = posInHyperspace;
        this.sizeInner = sizeInner;
        this.factionName = factionName;
        this.planets = planets;
        this._shipGroups = shipGroups;
        this._displacement = Coords.create();
    }
    static fromEntity(entity) {
        return entity.propertyByName(Starsystem.name);
    }
    faction(world) {
        return world.factionByName(this.factionName);
    }
    planetClosestTo(posToCheck) {
        var planetClosestSoFar = this.planets[0];
        var planetClosestSoFarDistance = this._displacement
            .overwriteWith(planetClosestSoFar.pos())
            .subtract(posToCheck)
            .magnitude();
        for (var i = 1; i < this.planets.length; i++) {
            var planet = this.planets[i];
            var planetPos = planet.pos();
            var planetDistance = this._displacement
                .overwriteWith(planetPos)
                .subtract(posToCheck)
                .magnitude();
            if (planetDistance < planetClosestSoFarDistance) {
                planetClosestSoFarDistance = planetDistance;
                planetClosestSoFar = planet;
            }
        }
        return planetClosestSoFar;
    }
    planetRandom(universe) {
        return ArrayHelper.random(this.planets, universe.randomizer);
    }
    shipGroupAdd(shipGroup) {
        this._shipGroups.push(shipGroup);
    }
    shipGroups(world) {
        if (this._shipGroups == null) {
            var faction = this.faction(world);
            if (faction != null) {
                var shipDefnName = faction.shipDefnName;
                var ship = new Ship(shipDefnName);
                var shipGroup = new ShipGroup(faction.name + " " + ShipGroup.name, faction.name, // factionName
                Coords.create(), [ship]);
                this._shipGroups.push(shipGroup);
            }
        }
        return this._shipGroups;
    }
    solarSystem(universe) {
        this.name = "Sol";
        var radiusBase = 5;
        var planetEarth = this.planets.find(x => x.name == "Earth");
        planetEarth.defnName = PlanetDefn.Instances().Shielded.name;
        // Put a base on the moon.
        var moon = planetEarth.satellites[0];
        moon.name = "Moon";
        /*
        var moonSizeSurface = moon.sizeSurface;

        var mediaLibrary = universe.mediaLibrary;
        var textAbandonedMoonbase = "AbandonedMoonbase";
        var abandonedMoonbaseMessage =
            mediaLibrary.textStringGetByName(EnergySource.name + textAbandonedMoonbase).value;
        var visual =
            new VisualImageFromLibrary(EnergySource.name + textAbandonedMoonbase);

        var collideWithLander = (uwpe: UniverseWorldPlaceEntities) =>
        {
            var universe = uwpe.universe;

            var acknowledgeReport = () =>
            {
                var place = uwpe.place as PlacePlanetSurface;
                place.exit(uwpe);
            };

            var venueToReturnTo = universe.venueCurrent();

            var venueMessage =
                VenueMessage.fromTextAcknowledgeAndVenuePrev(abandonedMoonbaseMessage, acknowledgeReport, venueToReturnTo);

            universe.venueTransitionTo(venueMessage);
        };

        var energySourceAbandonedMoonbase = new EnergySource
        (
            textAbandonedMoonbase,
            Coords.random(universe.randomizer).multiply(moonSizeSurface),
            visual,
            collideWithLander
        );
        var energySources = [ energySourceAbandonedMoonbase ];
        moon.energySources = energySources;
        */
        // Put a station in orbit around the Earth.
        var station = new Station("Earth Station", Color.Instances().Gray, // color
        radiusBase, "Terran", // factionName
        new Polar(Math.random(), moon.posAsPolar.radius / 2, null));
        planetEarth.satellites.splice(0, 0, station);
        // Add a guard drone in the Earth system.
        var enemyShipDefnName = "GuardDrone";
        var enemyShip = new Ship(enemyShipDefnName);
        var enemyShipGroup = new ShipGroup("LahkemupGuardDrone", "LahkemupGuardDrone", // factionName
        Coords.create(), // todo
        [enemyShip]);
        planetEarth.shipGroupAdd(enemyShipGroup);
        // Put an orphaned ship on Pluto.
        var pluto = this.planets[8];
        var textMauluskaOrphan = "MauluskaOrphan";
        var mediaLibrary = universe.mediaLibrary;
        var energySourceMauluskaOrphanMessage = mediaLibrary.textStringGetByName(EnergySource.name + textMauluskaOrphan).value;
        var energySourceMauluskaOrphan = new EnergySource(textMauluskaOrphan, pluto.sizeSurface.clone().half().addDimensions(30, 20, 0), new VisualImageFromLibrary(EnergySource.name + textMauluskaOrphan), (uwpe) => {
            var universe = uwpe.universe;
            var controlMessage = universe.controlBuilder.message(universe, universe.display.sizeInPixels, DataBinding.fromContext(energySourceMauluskaOrphanMessage), () => {
                var conversationDefnSerialized = mediaLibrary.textStringGetByName("Conversation-" + textMauluskaOrphan).value;
                var conversationDefn = ConversationDefn.deserialize(conversationDefnSerialized);
                var conversationRun = new ConversationRun(conversationDefn, null, null, null, null);
                var conversationVenue = conversationRun.toVenue(universe);
                universe.venueTransitionTo(conversationVenue);
            }, null, // showMessageOnly
            FontNameAndHeight.fromHeightInPixels(5));
            universe.venueTransitionTo(VenueControls.fromControl(controlMessage));
        });
        var energySources = [energySourceMauluskaOrphan];
        pluto.energySources = energySources;
    }
    contentsRandomize(randomizer) {
        var planetsPerStarsystemMax = 6;
        var planets = [];
        var numberOfPlanets = Math.floor(Math.random() * planetsPerStarsystemMax) + 1;
        var distanceBetweenPlanetOrbits = this.sizeInner.clone().half().y / (numberOfPlanets + 1);
        var planetRadiusBase = 1;
        var planetDefns = PlanetDefn.Instances()._All;
        var planetSizeInner = this.sizeInner.clone().multiply(Coords.fromXY(2, 1)).double();
        for (var p = 0; p < numberOfPlanets; p++) {
            var planetName = "Planet" + p;
            var planetDefnName = ArrayHelper.random(planetDefns, randomizer).name;
            var planetRadiusOuter = (Math.random() * 3 + 3)
                * planetRadiusBase;
            var planetDistanceFromSun = (p + 1) * distanceBetweenPlanetOrbits;
            var planetPosAsPolar = new Polar(Math.random(), planetDistanceFromSun, null);
            var numberOfMoons = Math.floor(Math.random() * 3);
            var satellites = [];
            for (var m = 0; m < numberOfMoons; m++) {
                var moonName = planetName + "Moon" + m;
                var moonDefnName = ArrayHelper.random(planetDefns, randomizer).name;
                var moonRadiusOuter = planetRadiusOuter;
                var moonPosAsPolar = new Polar(Math.random(), distanceBetweenPlanetOrbits * (m + 1), null);
                var moonAsPlanet = Planet.from6(moonName, moonDefnName, moonRadiusOuter, moonPosAsPolar, planetSizeInner, [] // satellites
                );
                satellites.push(moonAsPlanet);
            }
            var planet = Planet.from6(planetName, planetDefnName, planetRadiusOuter, planetPosAsPolar, planetSizeInner, satellites);
            planets.push(planet);
        }
        this.planets = planets;
    }
    stationBuild(planetWithStation) {
        throw new Error("Not yet implemented!");
        var numberOfPlanets = this.planets.length;
        var distanceBetweenPlanetOrbits = this.sizeInner.clone().half().y / (numberOfPlanets + 1);
        var station = new Station("Earth Station", Color.Instances().Gray, // color
        10, // radius
        "Terran", // factionName
        new Polar(Math.random(), distanceBetweenPlanetOrbits, null));
        var satellites = planetWithStation.satellites;
        if (satellites.length > 0) {
            ArrayHelper.removeAt(satellites, 0);
        }
        planetWithStation.satellites.push(station);
    }
    toPlace(world, playerLoc, planetDeparted) {
        return new PlaceStarsystem(world, this, playerLoc, planetDeparted);
    }
    // Clonable.
    clone() {
        throw new Error("todo");
    }
    overwriteWith(other) {
        throw new Error("todo");
    }
    // EntityProperty.
    finalize(uwpe) { }
    initialize(uwpe) { }
    propertyName() { return Starsystem.name; }
    updateForTimerTick(uwpe) { }
    // Equatable.
    equals(other) { return false; }
}
Starsystem.StarColors = [
    Color.Instances().Red,
    Color.Instances().Orange,
    Color.Instances().Yellow,
    Color.Instances().Green,
    Color.Instances().Blue,
    Color.Instances().White,
];
