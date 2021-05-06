
class Planet implements EntityProperty, Satellite
{
	name: string;
	defnName: string;
	radiusOuter: number;
	posAsPolar: Polar;
	sizeSurface: Coords;
	satellites: Satellite[];
	shipGroups: ShipGroup[];
	mass: number;
	radius: number;
	gravity: number;
	orbit: number;
	day: number;
	year: number;
	tectonics: number;
	weather: number;
	temperature: number;
	hasLife: boolean;
	energySources: EnergySource[];

	lifeforms: Lifeform[];
	resources: Resource[];

	constructor
	(
		name: string,
		defnName: string,
		radiusOuter: number,
		posAsPolar: Polar,
		sizeSurface: Coords,
		satellites: Planet[],
		shipGroups: ShipGroup[],
		mass: number,
		radius: number,
		gravity: number,
		orbit: number,
		day: number,
		year: number,
		tectonics: number,
		weather: number,
		temperature: number,
		hasLife: boolean,
		energySources: EnergySource[]
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
		this.gravity = parseFloat(gravity.toFixed(2));
		this.orbit = Math.round(orbit);
		this.day = day;
		this.year = year;
		this.tectonics = tectonics;
		this.weather = weather;
		this.temperature = temperature;

		this.hasLife = hasLife;
		this.energySources = energySources;
	}

	static from6
	(
		name: string,
		defnName: string,
		radiusOuter: number,
		posAsPolar: Polar,
		sizeSurface: Coords,
		satellites: Planet[]
	): Planet
	{
		return new Planet
		(
			name, defnName, radiusOuter, posAsPolar, sizeSurface, satellites,
			null, null, null, null, null, null, null, null, null, null,
			null, null
		);
	}

	// instance methods

	defn(): PlanetDefn
	{
		return PlanetDefn.byName(this.defnName);
	}

	lifeformsGenerate(randomizer: Randomizer): Lifeform[]
	{
		this.lifeforms = new Array<Lifeform>();

		if (this.hasLife)
		{
			var numberOfLifeforms = 8; // todo
			for (var i = 0; i < numberOfLifeforms; i++)
			{
				var lifeformPos =
					Coords.create().randomize(randomizer).multiply(this.sizeSurface);
				var lifeform = new Lifeform("BiteyMouse", lifeformPos);
				this.lifeforms.push(lifeform);
			}
		}

		return this.lifeforms;
	}

	mineralsGenerate(randomizer: Randomizer)
	{
		var planet = this;
		var resources = planet.resources;
		if (resources == null)
		{
			var resources = new Array<Resource>();

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
					var resourcePos =
						Coords.create().randomize(randomizer).multiply(planetSize);
					var resource = new Resource
					(
						resourceDefnName, quantityPerDeposit, resourcePos
					);
					resources.push(resource);
				}
			}

			planet.resources = resources;
		}
	}

	toEntity(primaryPos: Coords): Entity
	{
		var pos = primaryPos.clone().add
		(
			this.posAsPolar.toCoords(Coords.create())
		);

		var planetDefn = this.defn();
		var visual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle
				(
					this.posAsPolar.radius, null, Color.byName("Gray"), null
				),
				primaryPos,
				null // ?
			),
			VisualCircle.fromRadiusAndColorFill(this.radiusOuter, planetDefn.color)
		]);

		var collider = new Sphere(Coords.create(), this.radiusOuter);

		var returnValue = new Entity
		(
			this.name,
			[
				CollidableHelper.fromCollider(collider),
				Drawable.fromVisual(visual),
				this, // planet
				Locatable.fromPos(pos),
			]
		);

		return returnValue;
	}

	// EntityProperty.

	finalize(universe: Universe, world: World, place: Place, entity: Entity): void {}

	initialize(universe: Universe, world: World, place: Place, entity: Entity): void
	{
		var randomizer = universe.randomizer;
		this.mineralsGenerate(randomizer);
		this.lifeformsGenerate(randomizer);
	}

	updateForTimerTick(universe: Universe, world: World, place: Place, entity: Entity): void
	{
		// Do nothing.
	}
}

