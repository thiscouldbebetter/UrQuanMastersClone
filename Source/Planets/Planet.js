
class Planet
{
	constructor
	(
		name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites,
		shipGroups, mass, radius, gravity, orbit, day, year, tectonics,
		weather, temperature, resources, hasLife, energySources
	)
	{
		this.name = name;
		this.defnName = defnName;
		this.radiusOuter = radiusOuter;
		this.posAsPolar = posAsPolar;
		this.sizeSurface = sizeSurface;
		this.satellites = satellites;
		this.shipGroups = (shipGroups == null ? [] : shipGroups);

		this.mass = Math.round(mass);
		this.radius = Math.round(radius);
		this.gravity = gravity.toFixed(2);
		this.orbit = Math.round(orbit);
		this.day = day;
		this.year = year;
		this.tectonics = tectonics;
		this.weather = weather;
		this.temperature = temperature;

		this.resources = resources;
		this.hasLife = hasLife;
		this.energySources = energySources;

		this.mineralsGenerate();
		this.lifeformsGenerate();
	}

	// instance methods

	defn()
	{
		return PlanetDefn.byName(this.defnName);
	}

	lifeformsGenerate()
	{
		this.lifeforms = [];

		if (this.hasLife == true)
		{
			var numberOfLifeforms = 8; // todo
			for (var i = 0; i < numberOfLifeforms; i++)
			{
				var lifeformPos =
					new Coords().randomize().multiply(this.sizeSurface);
				var lifeform = new Lifeform("BiteyMouse", lifeformPos);
				this.lifeforms.push(lifeform);
			}
		}

		return this.lifeforms;
	}

	mineralsGenerate()
	{
		var planet = this;
		var resources = planet.resources;
		if (resources == null)
		{
			var resources = [];

			var planetDefn = planet.defn();
			var planetSize = planet.sizeSurface;
			var resourceDistributions = planetDefn.resourceDistributions;

			for (var i = 0; i < resourceDistributions.length; i++)
			{
				var resourceDistribution = resourceDistributions[i];

				var resourceDefnName = resourceDistribution.resourceDefnName;
				var numberOfDeposits = resourceDistribution.numberOfDeposits;
				var quantityPerDeposit = resourceDistribution.quantityPerDeposit;

				for (var d = 0; d < numberOfDeposits; d++)
				{
					var resourcePos = new Coords().randomize().multiply(planetSize);
					var resource = new Resource(resourceDefnName, quantityPerDeposit, resourcePos);
					resources.push(resource);
				}
			}

			planet.resources = resources;
		}
	}

	toEntity(primaryPos)
	{
		var pos = primaryPos.clone().add
		(
			this.posAsPolar.toCoords(new Coords())
		);

		var planetDefn = this.defn();
		var visual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle(this.posAsPolar.radius, null, Color.byName("Gray")),
				primaryPos
			),
			new VisualCircle(this.radiusOuter, planetDefn.color)
		]);

		var collider = new Sphere(new Coords(0, 0, 0), this.radiusOuter);

		var returnValue = new Entity
		(
			this.name,
			[
				CollidableHelper.fromCollider(collider),
				new Drawable(visual),
				this, // planet
				new Locatable( new Disposition(pos) ),
			]
		);

		return returnValue;
	}
}

