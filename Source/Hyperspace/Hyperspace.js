
class Hyperspace
{
	constructor(size, starsystemRadiusOuter, starsystems, shipGroups)
	{
		this.size = size;
		this.starsystemRadiusOuter = starsystemRadiusOuter;
		this.starsystems = starsystems;
		this.starsystemsByName = ArrayHelper.addLookupsByName(this.starsystems);
		this.shipGroups = shipGroups;
	}

	// static methods

	static random(size, numberOfStarsystems, starsystemRadiusOuter, starsystemSizeInner)
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
			while (isTooCloseToExistingStarsystem)
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
				0, // starSizeIndex
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
			starsystems,
			[] // shipGroups
		);

		return returnValue;
	}

	static fromFileContentsAsString
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

		var factionsByOldName = ArrayHelper.addLookups(
			factions, x => x.nameOriginal
		);

		var starsystems = [];
		var starsystem = null;
		var starsystemNamePrev = null;
		var starSizeNames = [ "dwarf", "giant", "super giant" ];
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
				var starColorName = planetAsValues[5];
				starColorName = StringHelper.toTitleCase(starColorName);
				var starColor = Color.byName(starColorName);
				var starSizeIndex = starSizeNames.indexOf(planetAsValues[6]);

				var starsystemPos = new Coords
				(
					parseFloat(planetAsValues[2]),
					parseFloat(planetAsValues[3])
				).multiplyScalar(10);
				starsystemPos.y = size.y - starsystemPos.y;
				var factionNameOriginal = planetAsValues[7];
				var faction = factionsByOldName.get(factionNameOriginal);
				var factionName = (faction == null ? null : faction.name);

				starsystem = new Starsystem
				(
					starsystemName,
					starSizeIndex,
					starColor, starsystemPos, starsystemSizeInner,
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

			var hasLife = (parseInt(planetAsValues[15]) > 0);
			var planet = new Planet
			(
				planetName, planetDefnName, planetRadius, posAsPolar, planetSize,
				[], // satellites
				[], // shipGroups,
				massInKg, radiusInKm, gravityAsFractionOfEarth, orbitInKm, dayInHours, year,
				tectonics, weather, temperature,
				null, // resources
				hasLife
			);

			var isMoon = (orbitOrdinalParts.length > 1);
			var planetCurrent;
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

		var starsystemsByName = ArrayHelper.addLookupsByName(starsystems);

		var starsystemSol = starsystemsByName.get("Sol");

		var pluto = starsystemSol.planets[8];
		var energySourceAbandonedScuttlerMessage = "todo";
		var energySourceAbandonedScuttler = new EnergySource
		(
			"AbandonedScuttler",
			pluto.sizeSurface.clone().half().addDimensions(30, 20, 0),
			new VisualCircle(10, "Red"), // todo
			function collide(universe, world, place, entityEnergySource, entityLander)
			{
				var controlMessage = universe.controlBuilder.message
				(
					universe,
					universe.display.sizeInPixels,
					energySourceAbandonedScuttlerMessage,
					function()
					{
						alert("todo");
					}
				);

				universe.venueNext = new VenueControls(controlMessage);
			}
		);
		var energySources = [ energySourceAbandonedScuttler ];
		pluto.energySources = energySources;

		// todo - Encounter test.
		var shipGroup = new ShipGroup
		(
			"Tempestrial Ship Group X",
			"Tempestrial",
			starsystemSol.posInHyperspace.clone().add(new Coords(100, 0)),
			[ new Ship("Tumbler") ]
		);

		var shipGroups = [ shipGroup ];

		var hyperspace = new Hyperspace
		(
			size, starsystemRadiusOuter, starsystems, shipGroups
		);

		return hyperspace;
	}

	// instance methods

	starsystemByName(starsystemName)
	{
		return this.starsystemsByName.get(starsystemName);
	}

	starsystemClosestTo(point)
	{
		var starsystemClosestSoFar = null;

		var distanceClosestSoFar = Number.POSITIVE_INFINITY;
		var displacement = new Coords();

		for (var i = 0; i < this.starsystems.length; i++)
		{
			var starsystem = this.starsystems[i];
			var distance = displacement.overwriteWith
			(
				starsystem.posInHyperspace
			).subtract
			(
				point
			).magnitude();
			if (distance < distanceClosestSoFar)
			{
				distanceClosestSoFar = distance;
				starsystemClosestSoFar = starsystem;
			}
		}

		return starsystemClosestSoFar;
	}
}
