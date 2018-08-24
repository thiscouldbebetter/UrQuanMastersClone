
function Hyperspace(size, starsystems)
{
	this.size = size;
	this.starsystems = starsystems;
}
{
	Hyperspace.random = function(size, numberOfStarsystems, starsystemSize)
	{
		var planetsPerStarsystemMax = 6;

		var starsystems = [];
		for (var i = 0; i < numberOfStarsystems; i++)
		{
			var starName = "Star" + i;
			var starColor = "Yellow"; // todo
			var starsystemPos = new Coords().randomize().multiply(size);

			var planets = [];
			var planetSize = starsystemSize;
			var numberOfPlanets = Math.floor
			(
				Math.random() * planetsPerStarsystemMax
			) + 1;
			var distanceBetweenPlanetOrbits = 
				starsystemSize.clone().half().y / (numberOfPlanets + 1);

			for (var p = 0; p < numberOfPlanets; p++)
			{
				var planetName = starName + "Planet" + p;
				var planetColor = "Cyan"; // todo
				var planetDistanceFromSun = (p + 1) * distanceBetweenPlanetOrbits;
				var planetPosAsPolar = new Polar(Math.random(), planetDistanceFromSun);
				var moons = [];
				var planet = new Planet
				(
					planetName, planetColor, planetSize, planetPosAsPolar, moons
				);
				planets.push(planet);
			}

			var starsystem = new Starsystem
			(
				starName, starColor, starsystemSize, starsystemPos, planets
			);

			starsystems.push(starsystem);
		}

		var returnValue = new Hyperspace
		(
			size,
			starsystems
		);

		return returnValue;
	}
}
