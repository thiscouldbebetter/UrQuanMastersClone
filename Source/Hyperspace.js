
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

			var starsystem = new Starsystem
			(
				starName,
				starColor,
				starsystemPos,
				starsystemSizeInner,
				factionName,
				[], //planets
			);

			starsystem.contentsRandomize();

			starsystems.push(starsystem);
		}

		var starsystemFinal = starsystems[starsystems.length - 1];
		starsystemFinal.factionName = "todo"; // Spawns "enemy".
		starsystemFinal.solarSystem();

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
		fileContentsAsString,
	)
	{
		if (fileContentsAsString == null)
		{
			return Hyperspace.random
			(
				size,
				512, // numberOfStarsystems
				10, // starsystemRadiusOuter
				starsystemSizeInner
			);
		}

		var starsystems = [];
		var scaleFactor = 2;

		// Parses the file "plandata.c" from the UQM codebase.
		var linesFromFile = fileContentsAsString.split("\n");
		for (var i = 0; i < linesFromFile.length; i++)
		{
			var line = linesFromFile[i];
			line = line.trim().toLowerCase();
			line = line.replaceAll(" ", "");
			line = line.replaceAll("}", "");
			line = line.replaceAll("(", ",");
			line = line.replaceAll("_body", "");

			if (line.startsWith("{{") == true && line.indexOf("_star") >= 0)
			{
				line = line.replaceAll("{", "");

				var tokens = line.split(",");
				var starsystemPos = new Coords
				(
					parseInt(tokens[0]),
					size.y - parseInt(tokens[1])
				).multiplyScalar(scaleFactor);

				var colorName = tokens[4].toTitleCase();
				var starColor = colorName;

				var factionPresentID = tokens[6];
				factionPresentName = (factionPresentID == 0 ? null : factionPresentID);

				var orderInConstellation = tokens[7];
				var constellationIndex = tokens[8];

				var starName = "Star_" + constellationIndex + "_" + orderInConstellation;

				var starsystem = new Starsystem
				(
					starName,
					starColor,
					starsystemPos,
					starsystemSizeInner,
					factionPresentName,
					[], //planets
				);

				starsystem.contentsRandomize();

				starsystems.push(starsystem);
			} // end if

		} // end for

		var starsystemFinal = starsystems[starsystems.length - 1];
		starsystemFinal.solarSystem();

		var returnValue = new Hyperspace
		(
			size.clone().multiplyScalar(scaleFactor),
			starsystemRadiusOuter,
			starsystems
		);

		return returnValue;
	}

}
