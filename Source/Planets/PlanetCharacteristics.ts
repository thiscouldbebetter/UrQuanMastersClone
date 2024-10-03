
class PlanetCharacteristics
{
	sizeSurface: Coords;
	satellites: Satellite[];
	_shipGroups: ShipGroup[];
	mass: number;
	radius: number;
	gravity: number;
	orbit: number;
	dayInHours: number;
	yearInEarthDays: number;
	tectonics: number;
	weather: number;
	temperature: number;
	biosphere: PlanetBiosphere;
	energySources: EnergySource[];

	_lifeforms: Lifeform[];
	_resources: Resource[];

	constructor
	(
		sizeSurface: Coords,
		satellites: Planet[],
		shipGroups: ShipGroup[],
		mass: number,
		radius: number,
		gravity: number,
		orbit: number,
		dayInHours: number,
		yearInEarthDays: number,
		tectonics: number,
		weather: number,
		temperature: number,
		biosphere: PlanetBiosphere,
		energySources: EnergySource[]
	)
	{
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

	static fromSizeSurfaceAndSatellites
	(
		sizeSurface: Coords,
		satellites: Planet[] // todo
	): PlanetCharacteristics
	{
		return new PlanetCharacteristics
		(
			sizeSurface,
			satellites,
			null, null, null,
			null, null, null,
			null, null, null,
			null, null, null
		);
	}

	lifeforms(planet: Planet, randomizer: Randomizer): Lifeform[]
	{
		if (this._lifeforms == null)
		{
			this._lifeforms = this.biosphere.lifeformsGenerateForPlanet(planet, randomizer);
		}

		return this._lifeforms;
	}

	resources(planet: Planet, randomizer: Randomizer): Resource[]
	{
		if (this._resources == null)
		{
			var resources = new Array<Resource>();

			var planetDefn = planet.defn();
			var planetSize = this.sizeSurface;
			var resourceDistributions = planetDefn.resourceDistributions;

			for (var i = 0; i < resourceDistributions.length; i++)
			{
				var resourceDistribution = resourceDistributions[i];

				var resourceDefnName = resourceDistribution.resourceDefnName;
				var numberOfDeposits = resourceDistribution.numberOfDeposits;
				var quantityPerDeposit = resourceDistribution.quantityPerDeposit;

				for (var d = 0; d < numberOfDeposits; d++)
				{
					var resourcePos =
						Coords.create().randomize(randomizer).multiply(planetSize);
					var resource = new Resource
					(
						resourceDefnName, quantityPerDeposit, resourcePos
					);
					resources.push(resource);
				}
			}

			this._resources = resources;
		}

		return this._resources;
	}

	satelliteAdd(satellite: Satellite): void
	{
		this.satellites.push(satellite);
	}

	satelliteGetAtIndex(index: number): Satellite
	{
		return this.satellites[index];
	}

	satelliteInsertAtIndex(satellite: Satellite, index: number): PlanetCharacteristics
	{
		this.satellites.splice(index, 0, satellite);
		return this;
	}

	satellitesGet(): Satellite[]
	{
		return this.satellites;
	}

	shipGroupAdd(shipGroup: ShipGroup): void
	{
		this._shipGroups.push(shipGroup);
	}

	shipGroupRemove(shipGroup: ShipGroup): void
	{
		this._shipGroups.splice(this._shipGroups.indexOf(shipGroup), 1);
	}

	shipGroups(): ShipGroup[]
	{
		return this._shipGroups;
	}
}