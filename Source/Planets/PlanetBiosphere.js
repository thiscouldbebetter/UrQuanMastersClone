"use strict";
class PlanetBiosphere {
    constructor(speciesCountsByCode) {
        this.speciesCountsByCode =
            speciesCountsByCode || new Map();
    }
    static fromString(speciesCountsAsString) {
        var biosphere;
        if (speciesCountsAsString == "-") {
            biosphere = PlanetBiosphere.none();
        }
        else {
            var speciesCountsByCode = new Map(speciesCountsAsString
                .split("+")
                .map(x => [
                x.substr(x.length - 2), // speciesCode
                parseInt(x.substr(0, x.length - 2)) // count
            ]));
            biosphere = new PlanetBiosphere(speciesCountsByCode);
        }
        return biosphere;
    }
    static none() {
        if (this._none == null) {
            this._none = new PlanetBiosphere(null);
        }
        return this._none;
    }
    lifeformsGenerateForPlanet(planet, randomizer) {
        var lifeforms = new Array();
        for (var codeCountPair of this.speciesCountsByCode) {
            var code = codeCountPair[0];
            var count = codeCountPair[1];
            var lifeformDefnName = LifeformDefn.byCode(code).name;
            for (var i = 0; i < count; i++) {
                var lifeformPos = Coords.create().randomize(randomizer).multiply(planet.sizeSurface);
                var lifeform = new Lifeform(lifeformDefnName, lifeformPos);
                lifeforms.push(lifeform);
            }
        }
        return lifeforms;
    }
    value() {
        var totalValueOfAllSpecies = 0;
        for (var codeCountPair of this.speciesCountsByCode) {
            var speciesCode = codeCountPair[0];
            var lifeformDefn = LifeformDefn.byCode(speciesCode);
            if (lifeformDefn == null) {
                throw new Error("Unrecognized species code: " + speciesCode + ".");
            }
            else {
                var valuePerSpecimen = lifeformDefn.value;
                var specimenCount = codeCountPair[1];
                var totalValueOfSpeciesPopulation = specimenCount * valuePerSpecimen;
                totalValueOfAllSpecies += totalValueOfSpeciesPopulation;
            }
        }
        return totalValueOfAllSpecies;
    }
}
