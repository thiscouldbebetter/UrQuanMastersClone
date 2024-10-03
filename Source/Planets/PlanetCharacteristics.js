"use strict";
class PlanetCharacteristics {
    constructor(sizeSurface, satellites, shipGroups, mass, radius, gravity, orbit, dayInHours, yearInEarthDays, tectonics, weather, temperature, biosphere, energySources) {
        this.sizeSurface = sizeSurface;
        this.satellites = satellites || [];
        this._shipGroups = shipGroups || [];
        this.mass = Math.round(mass);
        this.radius = Math.round(radius);
        this.gravity = parseFloat(gravity.toFixed(2));
        this.orbit = Math.round(orbit);
        this.dayInHours = dayInHours;
        this.yearInEarthDays = Math.round(yearInEarthDays * 100) / 100;
        this.tectonics = tectonics;
        this.weather = weather;
        this.temperature = temperature;
        this.biosphere = biosphere;
        this.energySources = energySources || [];
    }
    static fromSizeSurfaceAndSatellites(sizeSurface, satellites // todo
    ) {
        return new PlanetCharacteristics(sizeSurface, satellites, null, null, null, null, null, null, null, null, null, null, null, null);
    }
    lifeforms(planet, randomizer) {
        if (this._lifeforms == null) {
            this._lifeforms = this.biosphere.lifeformsGenerateForPlanet(planet, randomizer);
        }
        return this._lifeforms;
    }
    resources(planet, randomizer) {
        if (this._resources == null) {
            var resources = new Array();
            var planetDefn = planet.defn();
            var planetSize = this.sizeSurface;
            var resourceDistributions = planetDefn.resourceDistributions;
            for (var i = 0; i < resourceDistributions.length; i++) {
                var resourceDistribution = resourceDistributions[i];
                var resourceDefnName = resourceDistribution.resourceDefnName;
                var numberOfDeposits = resourceDistribution.numberOfDeposits;
                var quantityPerDeposit = resourceDistribution.quantityPerDeposit;
                for (var d = 0; d < numberOfDeposits; d++) {
                    var resourcePos = Coords.create().randomize(randomizer).multiply(planetSize);
                    var resource = new Resource(resourceDefnName, quantityPerDeposit, resourcePos);
                    resources.push(resource);
                }
            }
            this._resources = resources;
        }
        return this._resources;
    }
    satelliteAdd(satellite) {
        this.satellites.push(satellite);
    }
    satelliteGetAtIndex(index) {
        return this.satellites[index];
    }
    satelliteInsertAtIndex(satellite, index) {
        this.satellites.splice(index, 0, satellite);
        return this;
    }
    satellitesGet() {
        return this.satellites;
    }
    shipGroupAdd(shipGroup) {
        this._shipGroups.push(shipGroup);
    }
    shipGroupRemove(shipGroup) {
        this._shipGroups.splice(this._shipGroups.indexOf(shipGroup), 1);
    }
    shipGroups() {
        return this._shipGroups;
    }
}
