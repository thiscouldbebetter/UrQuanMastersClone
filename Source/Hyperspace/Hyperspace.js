"use strict";
class Hyperspace {
    constructor(name, size, pixelsTraversablePerFuelUnit, linkPortals, shipGroups, starsystems) {
        this.name = name || Hyperspace.name;
        this.size = size;
        // Per the Star Control Wiki:
        // "To travel the entire length of one axis [...] requires exactly 100.0 units of fuel."
        // And this game's version of hyperspace is 10,000 pixels across.
        this.pixelsTraversablePerFuelUnit =
            pixelsTraversablePerFuelUnit || 100;
        this._linkPortals = linkPortals || [];
        this.shipGroups = shipGroups || [];
        this.starsystems = starsystems || [];
        this.starsystemsByName = ArrayHelper.addLookupsByName(this.starsystems);
    }
    // static methods
    static random(universe, randomizer, size, numberOfStarsystems, starsystemSizeInner) {
        var factionName = null; // todo
        var distanceBetweenStarsystemsMin = Starsystem.RadiusOuter * 2;
        var displacement = Coords.create();
        var starsystems = new Array();
        for (var i = 0; i < numberOfStarsystems; i++) {
            var starName = "Star" + i;
            var starColor = ArrayHelper.random(Starsystem.StarColors, randomizer);
            var starsystemPos;
            var isTooCloseToExistingStarsystem = true;
            while (isTooCloseToExistingStarsystem) {
                starsystemPos = Coords.create().randomize(randomizer).multiply(size);
                isTooCloseToExistingStarsystem = false;
                for (var j = 0; j < i; j++) {
                    var starsystemExistingPos = starsystems[j].posInHyperspace;
                    var distance = displacement.overwriteWith(starsystemPos).subtract(starsystemExistingPos).magnitude();
                    if (distance < distanceBetweenStarsystemsMin) {
                        isTooCloseToExistingStarsystem = true;
                        break;
                    }
                }
            }
            var starsystem = new Starsystem(starName, 0, // starSizeIndex
            starColor, starsystemPos, starsystemSizeInner, factionName, [], //planets
            [] // shipGroups
            );
            starsystem.contentsRandomize(randomizer);
            starsystems.push(starsystem);
        }
        var returnValue = new Hyperspace(null, // name
        size, null, // pixelsTraversablePerFuelUnit
        [], // linkPortals
        [], // shipGroups
        starsystems);
        return returnValue;
    }
    static fromFileContentsAsString(size, starsystemSizeInner, factions, energySourcesAll, fileContentsAsString) {
        var starsAndPlanetsAsStringCsv = new CsvCompressor().decompress(fileContentsAsString);
        var starsAndPlanetsAsStringsCsv = starsAndPlanetsAsStringCsv.split("\n");
        var iOffset = 0;
        while (starsAndPlanetsAsStringsCsv[iOffset].startsWith("Cluster") == false) {
            iOffset++;
        }
        iOffset++;
        var factionsByOldName = ArrayHelper.addLookups(factions, x => x.nameOriginal);
        var starsystems = [];
        var starsystem = null;
        var starsystemNamePrev = null;
        var starSizeNames = ["dwarf", "giant", "super giant"];
        var orbitOrdinalSymbolToIndexLookup = new Map([
            ["I", 0],
            ["II", 1],
            ["III", 2],
            ["IV", 3],
            ["V", 4],
            ["VI", 5],
            ["VII", 6],
            ["VIII", 7],
            ["IX", 8],
            ["X", 9],
            ["a", 0],
            ["b", 1],
            ["c", 2],
            ["d", 3]
        ]);
        var planetSize = starsystemSizeInner.clone().multiply(Coords.fromXY(2, 1)).double();
        var orbitSpacing = (starsystemSizeInner.x / 12) / 2;
        var planetRadius = orbitSpacing / 3;
        var earthDensityInGramsPerCubicCm = 5.514;
        var earthRadiusInKm = 6371;
        var earthOrbitRadiusInKm = 150000000;
        var earthYearInEarthDays = 365.25;
        for (var i = iOffset; i < starsAndPlanetsAsStringsCsv.length; i++) {
            var planetAsCsv = starsAndPlanetsAsStringsCsv[i];
            var planetAsValues = planetAsCsv.split(",");
            var starsystemOrdinal = planetAsValues[1];
            var starsystemPrefix = (starsystemOrdinal == "Prime" ? "" : starsystemOrdinal + " ");
            var starsystemName = starsystemPrefix + planetAsValues[0];
            if (starsystemName != starsystemNamePrev) {
                var starColorName = planetAsValues[5];
                starColorName = StringHelper.toTitleCase(starColorName);
                var starColor = Color.byName(starColorName);
                var starSizeIndex = starSizeNames.indexOf(planetAsValues[6]);
                var starsystemPos = Coords.fromXY(parseFloat(planetAsValues[2]), parseFloat(planetAsValues[3])).multiplyScalar(10);
                starsystemPos.y = size.y - starsystemPos.y;
                var factionNameOriginal = planetAsValues[7];
                var faction = factionsByOldName.get(factionNameOriginal);
                var factionName = (faction == null ? null : faction.name);
                starsystem = new Starsystem(starsystemName, starSizeIndex, starColor, starsystemPos, starsystemSizeInner, factionName, [], // planets
                [] // shipGroups
                );
                starsystems.push(starsystem);
                starsystemNamePrev = starsystemName;
            }
            var orbitOrdinal = planetAsValues[8];
            var orbitOrdinalParts = orbitOrdinal.split("-");
            var orbitOrdinalSymbol = orbitOrdinalParts[orbitOrdinalParts.length - 1];
            var orbitIndex = orbitOrdinalSymbolToIndexLookup.get(orbitOrdinalSymbol);
            var planetName;
            if (orbitIndex == null) {
                orbitIndex = starsystem.planets.length;
                planetName = orbitOrdinal;
            }
            else {
                planetName = starsystem.name + " " + orbitOrdinal;
            }
            var planetDefnName = planetAsValues[9].split(" ").join("");
            //var distanceFromStar = parseFloat(planetAsValues[27]);
            var posAsPolar = new Polar(Math.random(), (orbitIndex + 2) * orbitSpacing, null);
            var radiusAsFractionOfEarth = parseFloat(planetAsValues[20]) / 100;
            var gravityAsFractionOfEarth = parseFloat(planetAsValues[22]) / 100;
            var orbitRelativeToEarth = parseFloat(planetAsValues[27]) / 512;
            var dayInHours = parseFloat(planetAsValues[24]) / 10;
            var radiusInKm = radiusAsFractionOfEarth * earthRadiusInKm;
            var orbitInKm = orbitRelativeToEarth * earthOrbitRadiusInKm;
            var yearInEarthDays = earthYearInEarthDays
                * orbitInKm / earthOrbitRadiusInKm;
            var densityAsFractionOfEarth = parseFloat(planetAsValues[20]) / 100;
            var densityInGramsPerCubicCm = densityAsFractionOfEarth * earthDensityInGramsPerCubicCm;
            var radiusInCm = radiusInKm * 100000;
            var volumeInCubicCm = Math.PI * 4 / 3 * Math.pow(radiusInCm, 3);
            var massInKg = densityInGramsPerCubicCm * volumeInCubicCm;
            var tectonics = parseInt(planetAsValues[11]);
            var weather = parseInt(planetAsValues[12]);
            var temperature = parseInt(planetAsValues[23]);
            var biosphereAsString = planetAsValues[28];
            var biosphere = PlanetBiosphere.fromString(biosphereAsString);
            var biosphereValueCalculated = biosphere.value();
            var biosphereValueExpected = parseInt(planetAsValues[15]);
            if (biosphereValueCalculated != biosphereValueExpected) {
                var message = "In the biosphere for planet '" + planetName
                    + "', the calculated value of lifeforms, " + biosphereValueCalculated
                    + ", did not match the expected value, " + biosphereValueExpected + ".";
                //throw new Error(message);
                console.log(message);
            }
            var energySourceAsString = planetAsValues[29];
            var energySourcesOnPlanet = new Array();
            if (energySourceAsString != "-") {
                var energySource = energySourcesAll.find(x => x.name == energySourceAsString);
                energySourcesOnPlanet.push(energySource);
            }
            var factionName = planetAsValues[30];
            if (factionName == "-") {
                factionName = null;
            }
            var shipsInOrbitAsString = planetAsValues[31];
            var shipGroupInOrbit = ShipGroupBase.fromFactionNameAndShipsAsString(factionName, shipsInOrbitAsString);
            var planetCharacteristics = new PlanetCharacteristics(planetSize, null, // satellites
            null, // shipGroupsInVicinity,
            shipGroupInOrbit, massInKg, radiusInKm, gravityAsFractionOfEarth, orbitInKm, dayInHours, yearInEarthDays, tectonics, weather, temperature, biosphere, energySourcesOnPlanet);
            var planet = new Planet(planetName, planetDefnName, planetRadius, posAsPolar, factionName, planetCharacteristics);
            var isMoon = (orbitOrdinalParts.length > 1);
            var planetCurrent;
            if (isMoon == true) {
                planetCurrent.satelliteAdd(planet);
            }
            else {
                starsystem.planetAdd(planet);
                planetCurrent = planet;
            }
        }
        var linkPortals = new Array();
        var starsystemsByName = ArrayHelper.addLookupsByName(starsystems);
        var starsystemSol = starsystemsByName.get("Sol");
        var shipGroup = new ShipGroupFinite("Tempestrial Ship Group X", "Tempestrial", starsystemSol.posInHyperspace.clone().add(Coords.fromXY(100, 0)), [new Ship("Tumbler")]);
        var shipGroups = [shipGroup];
        var hyperspace = new Hyperspace(null, // name
        size, null, // pixelsTraversablePerFuelUnit,
        linkPortals, shipGroups, starsystems);
        return hyperspace;
    }
    static fromNameSizeAndLinkPortals(name, size, linkPortals) {
        return new Hyperspace(name, size, null, // pixelsTraversablePerFuelUnit
        linkPortals, null, // shipGroups
        null // starsystems
        );
    }
    // instance methods
    distanceBetweenStarsystemsWithNames(starsystemFromName, starsystemToName) {
        var starsystemFrom = this.starsystemByName(starsystemFromName);
        var starsystemTo = this.starsystemByName(starsystemToName);
        var displacement = starsystemTo.posInHyperspace.clone().subtract(starsystemFrom.posInHyperspace);
        var distance = displacement.magnitude();
        return distance;
    }
    linkPortalAdd(linkPortal) {
        this._linkPortals.push(linkPortal);
        return this;
    }
    linkPortalsGetAll() {
        return this._linkPortals;
    }
    pixelsTraversablePerFuelUnitSet(value) {
        this.pixelsTraversablePerFuelUnit = value;
        return this;
    }
    shipGroupAdd(shipGroup) {
        this.shipGroups.push(shipGroup);
        return this;
    }
    starsystemByName(starsystemName) {
        return this.starsystemsByName.get(starsystemName);
    }
    starsystemClosestTo(point) {
        var starsystemClosestSoFar = null;
        var distanceClosestSoFar = Number.POSITIVE_INFINITY;
        var displacement = Coords.create();
        for (var i = 0; i < this.starsystems.length; i++) {
            var starsystem = this.starsystems[i];
            var distance = displacement.overwriteWith(starsystem.posInHyperspace).subtract(point).magnitude();
            if (distance < distanceClosestSoFar) {
                distanceClosestSoFar = distance;
                starsystemClosestSoFar = starsystem;
            }
        }
        return starsystemClosestSoFar;
    }
    toPlace(universe) {
        return new PlaceHyperspace(universe, this, null, // starsystemDeparted
        null //playerLoc
        );
    }
}
