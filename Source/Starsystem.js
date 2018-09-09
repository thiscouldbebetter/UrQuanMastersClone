
function Starsystem(name, starColor, posInHyperspace, sizeInner, factionName, planets, shipGroups)
{
	this.name = name;
	this.starColor = starColor;
	this.posInHyperspace = posInHyperspace;
	this.sizeInner = sizeInner;
	this.factionName = factionName;
	this.planets = planets;
	this.shipGroups = shipGroups;
}
{
	Starsystem.StarColors =
	[
		"Red",
		"Orange",
		"Yellow",
		"Green",
		"Blue",
		"White",
	];

	Starsystem.prototype.solarSystem = function()
	{
		this.name = "Sol";

		var numberOfPlanets = 9;

		var distanceBetweenOrbits =
			this.sizeInner.clone().half().y / (numberOfPlanets + 2);

		var radiusBase = 5;

		var planetDefns = PlanetDefn.Instances();

		this.planets =
		[
			new Planet
			(
				"Mercury",
				planetDefns["Metallic"].name,
				radiusBase,
				new Polar(Math.random(), 2 * distanceBetweenOrbits),
				this.sizeInner,
				[] //satellites
			),
			new Planet
			(
				"Venus",
				planetDefns["Primordial"].name,
				radiusBase,
				new Polar(Math.random(), 3 * distanceBetweenOrbits),
				this.sizeInner,
				[] //satellites
			),

			new Planet
			(
				"Earth",
				planetDefns["Shielded"].name,
				radiusBase,
				new Polar(Math.random(), 4 * distanceBetweenOrbits),
				this.sizeInner,
				[
					new Station
					(
						"Station",
						"Gray", // color
						radiusBase,
						"EarthStation", // factionName
						new Polar(Math.random(), distanceBetweenOrbits * 2)
					),

					new Planet
					(
						"The Moon",
						"Selenic",
						radiusBase,
						new Polar(Math.random(), distanceBetweenOrbits * 3),
						this.sizeInner,
						[] // satellites
					)

				], //satellites
				// shipGroups
				[
					new ShipGroup
					(
						"SlaverGuardDrone",
						"SlaverGuardDrone", // factionName
						null // ships
					)
				]
			),

			new Planet
			(
				"Mars",
				planetDefns["Dust"].name,
				radiusBase,
				new Polar(Math.random(), 5 * distanceBetweenOrbits),
				this.sizeInner,
				[] // satellites
			),

			new Planet
			(
				"Jupiter",
				planetDefns["GasGiant"].name,
				radiusBase,
				new Polar(Math.random(), 6 * distanceBetweenOrbits),
				this.sizeInner,
				[] // satellites
			),

			new Planet
			(
				"Saturn",
				planetDefns["GasGiant"].name,
				radiusBase,
				new Polar(Math.random(), 7 * distanceBetweenOrbits),
				this.sizeInner,
				[] // satellites
			),

			new Planet
			(
				"Uranus",
				planetDefns["GasGiant"].name,
				radiusBase,
				new Polar(Math.random(), 8 * distanceBetweenOrbits),
				this.sizeInner,
				[] // satellites
			),

			new Planet
			(
				"Neptune",
				planetDefns["GasGiant"].name,
				radiusBase,
				new Polar(Math.random(), 9 * distanceBetweenOrbits),
				this.sizeInner,
				[] // satellites
			),

			new Planet
			(
				"Pluto",
				planetDefns["Pellucid"].name,
				radiusBase,
				new Polar(Math.random(), 10 * distanceBetweenOrbits),
				this.sizeInner,
				[] // satellites
			),
		];
	}

	Starsystem.prototype.contentsRandomize = function()
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

		for (var p = 0; p < numberOfPlanets; p++)
		{
			var planetName = "Planet" + p;
			var planetDefnName = planetDefns.random().name;
			var planetRadiusOuter =
				(Math.random() * 3 + 3)
				* planetRadiusBase;
			var planetDistanceFromSun = (p + 1) * distanceBetweenPlanetOrbits;
			var planetPosAsPolar = new Polar(Math.random(), planetDistanceFromSun);
			var numberOfMoons = Math.floor(Math.random() * 3);
			var satellites = [];
			for (var m = 0; m < numberOfMoons; m++)
			{
				var moonName = planetName + "Moon" + m;
				var moonDefnName = planetDefns.random().name;
				var moonRadiusOuter = planetRadiusOuter;
				var moonPosAsPolar =
					new Polar(Math.random(), distanceBetweenPlanetOrbits * (m + 1));
				var moonAsPlanet = new Planet
				(
					moonName, moonDefnName, moonRadiusOuter,
					moonPosAsPolar, this.sizeInner, [] // satellites
				);
				satellites.push(moonAsPlanet);
			}
			var planet = new Planet
			(
				planetName, planetDefnName, planetRadiusOuter,
				planetPosAsPolar, this.sizeInner, satellites
			);
			planets.push(planet);
		}

		this.planets = planets;
	}

	Starsystem.prototype.stationBuild = function(planetWithStation)
	{
		var numberOfPlanets = this.planets.length;
		var distanceBetweenPlanetOrbits =
			this.sizeInner.clone().half().y / (numberOfPlanets + 1);

		var station = new Station
		(
			"Station",
			"Gray", // color
			10, // radius
			"EarthStation", // factionName
			new Polar(Math.random(), distanceBetweenPlanetOrbits),
		);
		var satellites = planetWithStation.satellites;

		if (satellites.length > 0)
		{
			satellites.removeAt(0);
		}
		planetWithStation.satellites.push(station);
	}

}
