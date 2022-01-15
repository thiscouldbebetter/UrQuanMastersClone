
class Starsystem implements EntityProperty<Starsystem>
{
	name: string;
	starSizeIndex: number;
	starColor: Color;
	posInHyperspace: Coords;
	sizeInner: Coords;
	factionName: string;
	planets: Planet[];
	shipGroups: ShipGroup[];

	constructor
	(
		name: string,
		starSizeIndex: number,
		starColor: Color,
		posInHyperspace: Coords,
		sizeInner: Coords,
		factionName: string,
		planets: Planet[],
		shipGroups: ShipGroup[]
	)
	{
		this.name = name;
		this.starSizeIndex = starSizeIndex;
		this.starColor = starColor;
		this.posInHyperspace = posInHyperspace;
		this.sizeInner = sizeInner;
		this.factionName = factionName;
		this.planets = planets;
		this.shipGroups = shipGroups;
	}

	static StarColors =
	[
		"Red",
		"Orange",
		"Yellow",
		"Green",
		"Blue",
		"White",
	].map(x => Color.byName(x));

	static fromEntity(entity: Entity): Starsystem
	{
		return entity.propertyByName(Starsystem.name) as Starsystem;
	}

	faction(world: WorldExtended): Faction
	{
		return world.factionByName(this.factionName);
	}

	solarSystem(): void
	{
		this.name = "Sol";

		var radiusBase = 5;

		var planetEarth = this.planets[2];
		planetEarth.defnName = PlanetDefn.Instances().Shielded.name;

		var moon = planetEarth.satellites[0];

		var station = new Station
		(
			"EarthStation",
			Color.byName("Gray"), // color
			radiusBase,
			"Terran", // factionName
			new Polar(Math.random(), moon.posAsPolar.radius / 2, null)
		);

		planetEarth.satellites.splice(0, 0, station);

		var enemyShipDefnName = "GuardDrone";
		var enemyShip = new Ship(enemyShipDefnName);
		var enemyShipGroup = new ShipGroup
		(
			"Enemy",
			"LahkemupGuardDrone", // factionName
			Coords.create(), // todo
			[ enemyShip ]
		);

		planetEarth.shipGroups.push(enemyShipGroup);
	}

	contentsRandomize(randomizer: Randomizer): void
	{
		var planetsPerStarsystemMax = 6;

		var planets = [];

		var numberOfPlanets = Math.floor
		(
			Math.random() * planetsPerStarsystemMax
		) + 1;
		var distanceBetweenPlanetOrbits =
			this.sizeInner.clone().half().y / (numberOfPlanets + 1);

		var planetRadiusBase = 1;

		var planetDefns = PlanetDefn.Instances()._All;

		var planetSizeInner =
			this.sizeInner.clone().multiply(Coords.fromXY(2, 1)).double();

		for (var p = 0; p < numberOfPlanets; p++)
		{
			var planetName = "Planet" + p;
			var planetDefnName =
				ArrayHelper.random(planetDefns, randomizer).name;
			var planetRadiusOuter =
				(Math.random() * 3 + 3)
				* planetRadiusBase;
			var planetDistanceFromSun = (p + 1) * distanceBetweenPlanetOrbits;
			var planetPosAsPolar = new Polar
			(
				Math.random(), planetDistanceFromSun, null
			);
			var numberOfMoons = Math.floor(Math.random() * 3);
			var satellites = [];
			for (var m = 0; m < numberOfMoons; m++)
			{
				var moonName = planetName + "Moon" + m;
				var moonDefnName = ArrayHelper.random
				(
					planetDefns, randomizer
				).name;
				var moonRadiusOuter = planetRadiusOuter;
				var moonPosAsPolar = new Polar
				(
					Math.random(), distanceBetweenPlanetOrbits * (m + 1), null
				);
				var moonAsPlanet = Planet.from6
				(
					moonName, moonDefnName, moonRadiusOuter,
					moonPosAsPolar, planetSizeInner, [] // satellites
				);
				satellites.push(moonAsPlanet);
			}
			var planet = Planet.from6
			(
				planetName, planetDefnName, planetRadiusOuter,
				planetPosAsPolar, planetSizeInner, satellites
			);
			planets.push(planet);
		}

		this.planets = planets;
	}

	stationBuild(planetWithStation: Planet): void
	{
		var numberOfPlanets = this.planets.length;
		var distanceBetweenPlanetOrbits =
			this.sizeInner.clone().half().y / (numberOfPlanets + 1);

		var station = new Station
		(
			"EarthStation",
			Color.byName("Gray"), // color
			10, // radius
			"Terran", // factionName
			new Polar(Math.random(), distanceBetweenPlanetOrbits, null),
		);
		var satellites = planetWithStation.satellites;

		if (satellites.length > 0)
		{
			ArrayHelper.removeAt(satellites, 0);
		}
		planetWithStation.satellites.push(station);
	}

	toPlace
	(
		world: WorldExtended,
		playerLoc: Disposition,
		planetDeparted: Planet
	): PlaceStarsystem
	{
		return new PlaceStarsystem(world, this, playerLoc, planetDeparted);
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.
	equals(other: Starsystem): boolean { return false; }
}
