
class Planet implements EntityProperty<Planet>, Satellite
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
	lifeformDefnNames: string[];
	lifeformCount: number;
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
		lifeformCount: number,
		lifeformDefnNames: string[],
		energySources: EnergySource[]
	)
	{
		this.name = name;
		this.defnName = defnName;
		this.radiusOuter = radiusOuter;
		this.posAsPolar = posAsPolar;
		this.sizeSurface = sizeSurface;
		this.satellites = satellites || [];
		this.shipGroups = shipGroups || [];

		this.mass = Math.round(mass);
		this.radius = Math.round(radius);
		this.gravity = parseFloat(gravity.toFixed(2));
		this.orbit = Math.round(orbit);
		this.day = day;
		this.year = year;
		this.tectonics = tectonics;
		this.weather = weather;
		this.temperature = temperature;

		this.lifeformCount = lifeformCount || 0;
		this.lifeformDefnNames = lifeformDefnNames || [];
		this.energySources = energySources || [];
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
			name,
			defnName,
			radiusOuter,
			posAsPolar,
			sizeSurface,
			satellites,
			null, null, null,
			null, null, null,
			null, null, null,
			null, null, null, null
		);
	}

	static activityDefnGravitate()
	{
		return new ActivityDefn
		(
			"Gravitate",
			Planet.activityGravitatePerform
		);
	}

	static activityGravitatePerform(uwpe: UniverseWorldPlaceEntities): void
	{
		var place = uwpe.place;
		var actor = uwpe.entity;

		var planet = actor;
		var planetPos = planet.locatable().loc.pos;

		var entitiesShips = place.entitiesByPropertyName(Ship.name);

		for (var i = 0; i < entitiesShips.length; i++)
		{
			var ship = entitiesShips[i];
			var shipLoc = ship.locatable().loc;
			var shipPos = shipLoc.pos;
			var displacement =
				shipPos.clone().subtractWrappedToRangeMax(planetPos, place.size);
			var distance = displacement.magnitude();
			if (distance > 0)
			{
				var direction = displacement.divideScalar(distance);
				var graviticConstant = -100;
				var accelerationMagnitude = graviticConstant / (distance * distance);
				var accelToAdd = direction.multiplyScalar(accelerationMagnitude);
				shipLoc.accel.add(accelToAdd);
			}
		}
	}

	static fromEntity(entity: Entity): Planet
	{
		return entity.propertyByName(Planet.name) as Planet;
	}

	// instance methods

	defn(): PlanetDefn
	{
		return PlanetDefn.byName(this.defnName);
	}

	lifeformsGenerate(randomizer: Randomizer): Lifeform[]
	{
		this.lifeforms = new Array<Lifeform>();

		for (var i = 0; i < this.lifeformCount; i++)
		{
			var lifeformDefnName = ArrayHelper.random(this.lifeformDefnNames, randomizer);
			var lifeformPos =
				Coords.create().randomize(randomizer).multiply(this.sizeSurface);
			var lifeform = new Lifeform(lifeformDefnName, lifeformPos);
			this.lifeforms.push(lifeform);
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
			//VisualCircle.fromRadiusAndColorFill(this.radiusOuter, planetDefn.color)
			planetDefn.visualStarsystem
		]);

		var collider = new Sphere(Coords.create(), this.radiusOuter);

		var returnValue = new Entity
		(
			this.name,
			[
				Collidable.fromCollider(collider),
				Drawable.fromVisual(visual),
				this, // planet
				Locatable.fromPos(pos),
			]
		);

		return returnValue;
	}

	toPlace(world: World): PlacePlanetVicinity
	{
		return new PlacePlanetVicinity
		(
			world as WorldExtended,
			this,
			null, // playerLoc
			null // placeStarsystem
		);
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var randomizer = universe.randomizer;
		this.mineralsGenerate(randomizer);
		this.lifeformsGenerate(randomizer);
	}

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

	// Equatable.

	equals(other: Planet): boolean { return false; }
}

