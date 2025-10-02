
class Planet extends EntityPropertyBase<Planet> implements Satellite
{
	name: string;
	defnName: string;
	radiusOuter: number;
	offsetFromPrimaryAsPolar: Polar;
	factionName: string;
	characteristics: PlanetCharacteristics;

	_isStation: boolean;

	constructor
	(
		name: string,
		defnName: string,
		radiusOuter: number,
		offsetFromPrimaryAsPolar: Polar,
		factionName: string,
		characteristics: PlanetCharacteristics
	)
	{
		super();

		this.name = name;
		this.defnName = defnName;
		this.radiusOuter = radiusOuter;
		this.offsetFromPrimaryAsPolar = offsetFromPrimaryAsPolar;
		this.factionName = factionName;
		this.characteristics = characteristics;
	}

	static from6
	(
		name: string,
		defnName: string,
		radiusOuter: number,
		offsetFromPrimaryAsPolar: Polar,
		sizeSurface: Coords,
		satellites: Planet[]
	): Planet
	{
		return new Planet
		(
			name,
			defnName,
			radiusOuter,
			offsetFromPrimaryAsPolar,
			null, // factionName,
			PlanetCharacteristics.fromSizeSurfaceAndSatellites
			(
				sizeSurface,
				satellites
			)
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
		var planetPos = Locatable.of(planet).loc.pos;

		var entitiesShips = place.entitiesByPropertyName(Ship.name);

		for (var i = 0; i < entitiesShips.length; i++)
		{
			var ship = entitiesShips[i];
			var shipLoc = Locatable.of(ship).loc;
			var shipPos = shipLoc.pos;
			var displacement =
				shipPos.clone().subtractWrappedToRangeMax(planetPos, place.size() );
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

	energySources(): EnergySource[]
	{
		return this.characteristics.energySources;
	}

	faction(world: WorldExtended): Faction
	{
		return world.defnExtended().factionByName(this.factionName);
	}

	isStation(): boolean
	{
		return this._isStation;
	}

	isStationSet(value: boolean): Planet
	{
		this._isStation = value;
		return this;
	}

	lifeforms(randomizer: Randomizer): Lifeform[]
	{
		return this.characteristics.lifeforms(this, randomizer);
	}

	lifeformsGenerate(randomizer: Randomizer): Lifeform[]
	{
		return this.lifeforms(randomizer);
	}

	mineralsGenerate(randomizer: Randomizer)
	{
		this.resources(randomizer);
	}

	resources(randomizer: Randomizer): Resource[]
	{
		return this.characteristics.resources(this, randomizer);
	}

	orbitColor(): Color
	{
		var orbitColor: Color;

		var colors = Color.Instances();

		if (this.characteristics == null)
		{
			orbitColor = colors.Gray;
		}
		else
		{
			var temperature = this.characteristics.temperature;
			orbitColor =
			(
				temperature > 200
				? colors.Red
				: temperature > 100
				? colors.Brown
				: temperature > 0
				? colors.GreenDark
				: colors.BlueDark
			);
		}
		return orbitColor;
	}

	satelliteAdd(satellite: Satellite): Planet
	{
		this.characteristics.satelliteAdd(satellite);
		return this;
	}

	satelliteGetAtIndex(index: number): Satellite
	{
		return this.characteristics.satelliteGetAtIndex(index);
	}

	satelliteInsertAtIndex(satellite: Satellite, index: number): Planet
	{
		this.characteristics.satelliteInsertAtIndex(satellite, index);
		return this;
	}

	satellitesGet(): Satellite[]
	{
		return this.characteristics.satellitesGet();
	}

	shipGroupInOrbit(): ShipGroup
	{
		return (this.characteristics == null ? null : this.characteristics.shipGroupInOrbit);
	}

	shipGroupInVicinityAdd(shipGroup: ShipGroup): Planet
	{
		this.characteristics.shipGroupInVicinityAdd(shipGroup);
		return this;
	}

	shipGroupRemove(shipGroup: ShipGroup): Planet
	{
		this.characteristics.shipGroupInVicinityRemove(shipGroup);
		return this;
	}

	shipGroupsInVicinity(): ShipGroup[]
	{
		return this.characteristics.shipGroupsInVicinity();
	}

	sizeSurface(): Coords
	{
		return (this.isStation() ? Coords.zeroes() : this.characteristics.sizeSurface);
	}

	toEntityForPlanetVicinity
	(
		world: WorldExtended,
		isPrimary: boolean,
		vicinityCenterPos: Coords,
		orbitColor: Color,
		entityDimension: number
	): Entity
	{
		var globeRadius = entityDimension;
		var orbitMultiplier = 4; // hack

		var collider = Sphere.fromRadius(globeRadius);
		var collidable = Collidable.fromCollider(collider);

		var planetDefn = this.defn();

		var globeVisual: Visual;

		var posWithinVicinity = vicinityCenterPos.clone();

		var orbitRadius: number;
		var orbitCenterPos: Coords;

		if (isPrimary)
		{
			globeVisual = planetDefn.visualVicinityPrimary;

			orbitRadius =
				this.offsetFromPrimaryAsPolar.radius * orbitMultiplier;

			var offsetToOrbitCenter =
				this.offsetFromPrimaryAsPolar
					.toCoords()
					.invert()
					.multiplyScalar(orbitMultiplier);

			orbitCenterPos =
				offsetToOrbitCenter.add(vicinityCenterPos);
		}
		else
		{
			globeVisual = planetDefn.visualVicinitySatellite;

			orbitRadius =
				this.offsetFromPrimaryAsPolar.radius * orbitMultiplier;

			orbitCenterPos = vicinityCenterPos;

			var offsetFromPrimary = Polar.fromAzimuthInTurnsAndRadius
			(
				this.offsetFromPrimaryAsPolar.azimuthInTurns + .5,
				orbitRadius
			).wrap().toCoords();

			posWithinVicinity.add(offsetFromPrimary);
		}

		var orbitVisualPath =
			VisualCircle.fromRadiusAndColorBorder(orbitRadius, orbitColor);

		var orbitVisual = VisualAnchor.fromChildAndPosToAnchorAt
		(
			orbitVisualPath,
			orbitCenterPos
		);

		var visual = new VisualGroup
		([
			orbitVisual,
			globeVisual
		]);
		var drawable = Drawable.fromVisual(visual);

		var locatable = Locatable.fromPos(posWithinVicinity);

		var entityName = isPrimary ? Planet.name : this.name;
		var entity = new Entity
		(
			entityName,
			[
				collidable,
				drawable,
				locatable,
				this
			]
		);

		var faction = this.faction(world);
		if (faction != null)
		{
			var talker = faction.toTalker();
			entity.propertyAdd(talker);

			var shipGroupInOrbit = this.shipGroupInOrbit();
			if (shipGroupInOrbit != null)
			{
				entity.propertyAdd(shipGroupInOrbit);
			}
		}

		return entity;
	}

	toEntityForStarsystem(world: WorldExtended, primary: Planet, primaryPos: Coords): Entity
	{
		var pos = primaryPos.clone().add
		(
			this.offsetFromPrimaryAsPolar.toCoords()
		);

		var orbitColor = (primary == null ? this.orbitColor() : primary.orbitColor());

		var planetDefn = this.defn();
		var visual = new VisualGroup
		([
			new VisualAnchor
			(
				new VisualCircle
				(
					this.offsetFromPrimaryAsPolar.radius, null, orbitColor, null
				),
				primaryPos,
				null // ?
			),
			planetDefn.visualStarsystem
		]);

		var collider = Sphere.fromRadius(this.radiusOuter);

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

	_place: PlacePlanetVicinity;
	toPlace(world: World): PlacePlanetVicinity
	{
		if (this._place == null)
		{
			this._place = new PlacePlanetVicinity
			(
				world as WorldExtended,
				this,
				null, // playerLoc
				null // placeStarsystem
			);
		}
		return this._place;
	}

	pos(): Coords
	{
		return this.offsetFromPrimaryAsPolar.toCoords();
	}

	// Clonable.

	clone(): Planet { throw new Error("todo"); }

	overwriteWith(other: Planet): Planet { throw new Error("todo"); }

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}

	initialize(uwpe: UniverseWorldPlaceEntities): void
	{
		var universe = uwpe.universe;
		var randomizer = universe.randomizer;
		this.mineralsGenerate(randomizer);
		this.lifeformsGenerate(randomizer);
	}

	propertyName(): string { return Planet.name; }

	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void
	{
		// Do nothing.
	}

	// Equatable.

	equals(other: Planet): boolean { return false; }
}
