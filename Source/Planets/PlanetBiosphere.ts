
class PlanetBiosphere
{
	speciesCountsByCode: Map<string, number>;

	constructor(speciesCountsByCode: Map<string, number>)
	{
		this.speciesCountsByCode =
			speciesCountsByCode || new Map<string, number>();
	}

	static fromString(speciesCountsAsString: string): PlanetBiosphere
	{
		var biosphere: PlanetBiosphere;

		if (speciesCountsAsString == "-")
		{
			biosphere = PlanetBiosphere.none();
		}
		else
		{
			var speciesCountsByCode = new Map<string, number>
			(
				speciesCountsAsString
					.split("+")
					.map
					(
						x =>
							[
								x.substr(x.length - 2), // speciesCode
								parseInt(x.substr(0, x.length - 2) ) // count
							]
					)
			);

			biosphere = new PlanetBiosphere(speciesCountsByCode);
		}

		return biosphere;
	}

	private static _none: PlanetBiosphere;
	static none(): PlanetBiosphere
	{
		if (this._none == null)
		{
			this._none = new PlanetBiosphere(null);
		}
		return this._none;
	}

	lifeformsGenerateForPlanet(planet: Planet, randomizer: Randomizer): Lifeform[]
	{
		var lifeforms = new Array<Lifeform>();

		for (var codeCountPair of this.speciesCountsByCode)
		{
			var code = codeCountPair[0];
			var count = codeCountPair[1];

			var lifeformDefnName = LifeformDefn.byCode(code).name;

			for (var i = 0; i < count; i++)
			{
				var lifeformPos =
					Coords.create().randomize(randomizer).multiply(planet.sizeSurface() );

				var lifeform = new Lifeform(lifeformDefnName, lifeformPos);

				lifeforms.push(lifeform);
			}
		}

		return lifeforms;
	}

	value(): number
	{
		var totalValueOfAllSpecies = 0;

		for (var codeCountPair of this.speciesCountsByCode)
		{
			var speciesCode = codeCountPair[0]

			var lifeformDefn = LifeformDefn.byCode(speciesCode);
			if (lifeformDefn == null)
			{
				throw new Error("Unrecognized species code: " + speciesCode + ".");
			}
			else
			{
				var valuePerSpecimen = lifeformDefn.value;
				var specimenCount = codeCountPair[1];
				var totalValueOfSpeciesPopulation = specimenCount * valuePerSpecimen;
				totalValueOfAllSpecies += totalValueOfSpeciesPopulation;
			}
		}

		return totalValueOfAllSpecies;
	}
}