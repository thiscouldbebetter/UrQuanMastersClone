
function Hyperspace(size, starsystemRadiusOuter, starsystems)
{
	this.size = size;
	this.starsystemRadiusOuter = starsystemRadiusOuter;
	this.starsystems = starsystems.addLookups("name");
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

			var starsystem = new Starsystem
			(
				starName,
				starColor,
				starsystemPos,
				starsystemSizeInner,
				factionName,
				[], //planets
				[] // shipGroups
			);

			starsystem.contentsRandomize();

			starsystems.push(starsystem);
		}

		var starsystemSol = starsystems[starsystems.length - 1];
		starsystemSol.factionName = "todo"; // Spawns "enemy".
		starsystemSol.solarSystem();

		var returnValue = new Hyperspace
		(
			size,
			starsystemRadiusOuter,
			starsystems
		);

		return returnValue;
	}


	Hyperspace.fromFileContentsAsString = function
	(
		size,
		starsystemRadiusOuter,
		starsystemSizeInner,
		factions,
		fileContentsAsString
	)
	{
		var starsAndPlanetsAsStringCSV = new CsvCompressor().decompress
		(
			fileContentsAsString
		);
		var starsAndPlanetsAsStringsCSV = starsAndPlanetsAsStringCSV.split("\n");

		var iOffset = 0;
		while (starsAndPlanetsAsStringsCSV[iOffset].startsWith("Cluster") == false)
		{
			iOffset++;
		}
		iOffset++;

		var factionOriginalToNewLookup = factions.slice(0).addLookups("nameOriginal");

		var starsystems = [];
		var starsystem = null;
		var starsystemNamePrev = null;
		var orbitOrdinalSymbolToIndexLookup =
		{
			"I": 0, "II": 1, "III": 2, "IV": 3, "V": 4,
			"VI": 5, "VII": 6, "VIII": 7, "IX": 8, "X": 9,
			"a": 0, "b": 1, "c": 2, "d": 3
		};
		var planetSize = starsystemSizeInner.clone().multiply(new Coords(2, 1)).double();
		var orbitSpacing = (starsystemSizeInner.x / 12) / 2;
		var planetRadius = orbitSpacing / 3;

		var earthDensityInGramsPerCubicCm = 5.514;
		var earthRadiusInKm = 6371;
		var earthOrbitRadiusInKm = 150000000;

		for (var i = iOffset; i < starsAndPlanetsAsStringsCSV.length; i++)
		{
			var planetAsCSV = starsAndPlanetsAsStringsCSV[i];
			var planetAsValues = planetAsCSV.split(",");
			var starsystemOrdinal = planetAsValues[1];
			var starsystemPrefix = (starsystemOrdinal == "Prime" ? "" : starsystemOrdinal + " ");
			var starsystemName =  starsystemPrefix + planetAsValues[0];
			if (starsystemName != starsystemNamePrev)
			{
				var starColor = planetAsValues[5].toTitleCase();
				var starsystemPos = new Coords
				(
					parseFloat(planetAsValues[2]),
					parseFloat(planetAsValues[3])
				).multiplyScalar(10);
				starsystemPos.y = size.y - starsystemPos.y;
				var factionNameOriginal = planetAsValues[7];
				var faction = factionOriginalToNewLookup[factionNameOriginal];
				var factionName = (faction == null ? null : faction.name);

				starsystem = new Starsystem
				(
					starsystemName, starColor, starsystemPos, starsystemSizeInner,
					factionName,
					[], // planets
					[] // shipGroups
				);

				starsystems.push(starsystem);

				starsystemNamePrev = starsystemName;
			}
			var orbitOrdinal = planetAsValues[8];
			var orbitOrdinalParts = orbitOrdinal.split("-");
			var orbitOrdinalSymbol = orbitOrdinalParts[orbitOrdinalParts.length - 1];
			var orbitIndex = orbitOrdinalSymbolToIndexLookup[orbitOrdinalSymbol];
			var planetName;
			if (orbitIndex == null)
			{
				orbitIndex = starsystem.planets.length;
				planetName = orbitOrdinal;
			}
			else
			{
				planetName = starsystem.name + " " + orbitOrdinal;
			}

			var planetDefnName = planetAsValues[9].replaceAll(" ", "");

			var distanceFromStar = parseFloat(planetAsValues[27]);
			var posAsPolar = new Polar(Math.random(), (orbitIndex + 2) * orbitSpacing);

			var radiusAsFractionOfEarth = parseFloat(planetAsValues[20]) / 100;
			var gravityAsFractionOfEarth = parseFloat(planetAsValues[22]) / 100;
			var orbitRelativeToEarth = planetAsValues[27] / 512;
			var dayInHours = parseFloat(planetAsValues[24]) / 10;
			var year = 365; // todo

			var radiusInKm = radiusAsFractionOfEarth * earthRadiusInKm;
			var orbitInKm = orbitRelativeToEarth * earthOrbitRadiusInKm;

			var densityAsFractionOfEarth = parseFloat(planetAsValues[20]) / 100;
			var densityInGramsPerCubicCm =
				densityAsFractionOfEarth * earthDensityInGramsPerCubicCm;
			var radiusInCm = radiusInKm * 100000;
			var volumeInCubicCm = Math.PI * 4 / 3 * Math.pow(radiusInCm, 3);
			var massInKg =
				densityInGramsPerCubicCm * volumeInCubicCm;

			var tectonics = parseInt(planetAsValues[11]);
			var weather = parseInt(planetAsValues[12]);
			var temperature = parseInt(planetAsValues[23]);

			var hasLife = (parseInt(planetAsValues[14]) > 1);
			var planet = new Planet
			(
				planetName, planetDefnName, planetRadius, posAsPolar, planetSize,
				[], // satellites
				[], // shipGroups,
				massInKg, radiusInKm, gravityAsFractionOfEarth, orbitInKm, dayInHours, year,
				tectonics, weather, temperature,
				[], // resources
				hasLife
			);

			var isMoon = (orbitOrdinalParts.length > 1);
			var bodyListToAddTo;
			if (isMoon == true)
			{
				bodyListToAddTo = planetCurrent.satellites;
			}
			else
			{
				bodyListToAddTo = starsystem.planets;
				planetCurrent = planet;
			}

			bodyListToAddTo.push(planet);
		}

		var hyperspace = new Hyperspace(size, starsystemRadiusOuter, starsystems);

		return hyperspace;
	}
}
