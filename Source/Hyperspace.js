
function Hyperspace(size, starsystemRadiusOuter, starsystems)
{
	this.size = size;
	this.starsystemRadiusOuter = starsystemRadiusOuter;
	this.starsystems = starsystems;
}
{
	Hyperspace.random = function(size, numberOfStarsystems, starsystemRadiusOuter, starsystemSizeInner)
	{
		var planetsPerStarsystemMax = 6;
		var factionName = null; // todo
		var distanceBetweenStarsystemsMin = starsystemRadiusOuter * 2;
		var displacement = new Coords();

		var starsystems = [];
		for (var i = 0; i < numberOfStarsystems; i++)
		{
			var starName = "Star" + i;
			var starColor = Starsystem.StarColors.random();

			var starsystemPos;
			var isTooCloseToExistingStarsystem = true;
			while (isTooCloseToExistingStarsystem == true)
			{
				starsystemPos = new Coords().randomize().multiply(size);

				isTooCloseToExistingStarsystem = false;
				for (var j = 0; j < i; j++)
				{
					var starsystemExistingPos = starsystems[j].posInHyperspace;
					var distance = displacement.overwriteWith
					(
						starsystemPos
					).subtract
					(
						starsystemExistingPos
					).magnitude();

					if (distance < distanceBetweenStarsystemsMin)
					{
						isTooCloseToExistingStarsystem = true;
						break;
					}
				}
			}

			var planets = [];
			var planetSizeInner = starsystemSizeInner;
			var numberOfPlanets = Math.floor
			(
				Math.random() * planetsPerStarsystemMax
			) + 1;
			var distanceBetweenPlanetOrbits =
				starsystemSizeInner.clone().half().y / (numberOfPlanets + 1);

			var planetRadiusBase = 1;

			for (var p = 0; p < numberOfPlanets; p++)
			{
				var planetName = "Planet" + p;
				var planetColor = Planet.Colors.random();
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
					var moonColor = planetColor;
					var moonRadiusOuter = planetRadiusOuter;
					var moonPosAsPolar = new Polar(Math.random(), distanceBetweenPlanetOrbits * (m + 1));
					var moonAsPlanet = new Planet
					(
						moonName, moonColor, moonRadiusOuter,
						moonPosAsPolar, planetSizeInner, [] // satellites
					);
					satellites.push(moonAsPlanet);
				}
				var planet = new Planet
				(
					planetName, planetColor, planetRadiusOuter,
					planetPosAsPolar, planetSizeInner, satellites
				);
				planets.push(planet);
			}

			var starsystem = new Starsystem
			(
				starName,
				starColor,
				starsystemPos,
				starsystemSizeInner,
				factionName,
				planets
			);

			starsystems.push(starsystem);
		}

		var starsystem0 = starsystems[0];
		starsystem0.factionName = "todo"; // Spawns "enemy".
		var planet = starsystem0.planets.random();
		var station = new Station
		(
			"Station",
			"Gray", // color
			10, // radius
			new Polar(Math.random(), distanceBetweenPlanetOrbits),
		);
		var satellites = planet.satellites;

		if (satellites.length > 0)
		{
			satellites.removeAt(0);
		}
		planet.satellites.push(station);

		var returnValue = new Hyperspace
		(
			size,
			starsystemRadiusOuter,
			starsystems
		);

		return returnValue;
	}
}
