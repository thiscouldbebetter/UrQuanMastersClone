
class Starsystem implements EntityProperty<Starsystem>
{
	name: string;
	starSizeIndex: number;
	starColor: Color;
	posInHyperspace: Coords;
	sizeInner: Coords;
	factionName: string;
	planets: Planet[];
	_shipGroups: ShipGroup[];

	private _displacement: Coords;

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
		this._shipGroups = shipGroups;

		this._displacement = Coords.create();
	}

	static StarColors =
	[
		Color.Instances().Red,
		Color.Instances().Orange,
		Color.Instances().Yellow,
		Color.Instances().Green,
		Color.Instances().Blue,
		Color.Instances().White,
	];

	static fromEntity(entity: Entity): Starsystem
	{
		return entity.propertyByName(Starsystem.name) as Starsystem;
	}

	faction(world: WorldExtended): Faction
	{
		return world.factionByName(this.factionName);
	}

	planetAdd(planet: Planet): Starsystem
	{
		this.planets.push(planet);
		return this;
	}

	planetClosestTo(posToCheck: Coords): Planet
	{
		var planetClosestSoFar = this.planets[0];
		var planetClosestSoFarDistance =
			this._displacement
				.overwriteWith(planetClosestSoFar.pos() )
				.subtract(posToCheck)
				.magnitude();

		for (var i = 1; i < this.planets.length; i++)
		{
			var planet = this.planets[i];
			var planetPos = planet.pos();
			var planetDistance =
				this._displacement
					.overwriteWith(planetPos)
					.subtract(posToCheck)
					.magnitude();
			if (planetDistance < planetClosestSoFarDistance)
			{
				planetClosestSoFarDistance = planetDistance;
				planetClosestSoFar = planet;
			}
		}

		return planetClosestSoFar;
	}

	planetRandom(universe: Universe): Planet
	{
		return ArrayHelper.random(this.planets, universe.randomizer);
	}

	shipGroupAdd(shipGroup: ShipGroup): void
	{
		this._shipGroups.push(shipGroup);
	}

	shipGroups(world: WorldExtended): ShipGroup[]
	{
		if (this._shipGroups == null)
		{
			var faction = this.faction(world);
			if (faction != null)
			{
				var shipDefnName = faction.shipDefnName;
				var ship = new Ship(shipDefnName);

				var shipGroup = new ShipGroup
				(
					faction.name + " " + ShipGroup.name,
					faction.name, // factionName
					Coords.create(),
					[ ship ]
				);

				this._shipGroups.push(shipGroup);
			}
		}

		return this._shipGroups;
	}


	solarSystem(universe: Universe): void
	{
		this.name = "Sol";

		var radiusBase = 5;

		var planetEarth = this.planets.find(x => x.name == "Earth");
		planetEarth.defnName = PlanetDefn.Instances().Shielded.name;

		// Put a base on the moon.

		var moon = planetEarth.satelliteGetAtIndex(0) as Planet;
		moon.name = "Moon";

		// Put a station in orbit around the Earth.

		var stationPosAsPolar =
			Polar.fromAzimuthInTurnsAndRadius(.5, moon.posAsPolar.radius / 2);

		var station = new Planet
		(
			"Earth Station",
			"Station", // defnName
			radiusBase,
			stationPosAsPolar,
			"Terran", // factionName
			null // characteristics
		).isStationSet(true);

		planetEarth.satelliteInsertAtIndex(station, 0);

		// Add a guard drone in the Earth system.

		var enemyShipDefnName = "GuardDrone";
		var enemyShip = new Ship(enemyShipDefnName);
		var enemyShipGroup = new ShipGroup
		(
			"LahkemupGuardDrone",
			"LahkemupGuardDrone", // factionName
			Coords.create(), // todo
			[ enemyShip ]
		);

		planetEarth.shipGroupAdd(enemyShipGroup);
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

	toPlace
	(
		world: WorldExtended,
		playerLoc: Disposition,
		planetDeparted: Planet
	): PlaceStarsystem
	{
		return new PlaceStarsystem(world, this, playerLoc, planetDeparted);
	}

	// Clonable.

	clone(): Starsystem
	{
		throw new Error("todo");
	}

	overwriteWith(other: Starsystem): Starsystem
	{
		throw new Error("todo");
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return Starsystem.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.
	equals(other: Starsystem): boolean { return false; }
}
