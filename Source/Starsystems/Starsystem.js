
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

		var planetSizeInner = this.sizeInner.clone().multiply(new Coords(2, 1)).double();

		var planetEarth = this.planets[2];

		var moon = planetEarth.satellites[0];

		var station = new Station
		(
			"Station",
			"Gray", // color
			radiusBase,
			"Terran", // factionName
			new Polar(Math.random(), moon.posAsPolar.radius / 2)
		);

		planetEarth.satellites.splice(0, 0, station);

		var enemyShipDefnName = "LahkemupGuardDrone";
		var enemyShip = new Ship(enemyShipDefnName);
		var enemyShipGroup = new ShipGroup
		(
			"Enemy",
			"LahkemupGuardDrone", // factionName
			[ enemyShip ]
		);

		planetEarth.shipGroups.push(enemyShipGroup);
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

		var planetSizeInner = this.sizeInner.clone().multiply(new Coords(2, 1)).double();

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
					moonPosAsPolar, planetSizeInner, [] // satellites
				);
				satellites.push(moonAsPlanet);
			}
			var planet = new Planet
			(
				planetName, planetDefnName, planetRadiusOuter,
				planetPosAsPolar, planetSizeInner, satellites
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
			"Terran", // factionName
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