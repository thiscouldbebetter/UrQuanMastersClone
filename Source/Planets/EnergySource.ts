
class EnergySource implements EntityProperty<EnergySource>
{
	name: string;
	pos: Coords;
	visual: VisualBase;
	collideWithLander: (uwpe: UniverseWorldPlaceEntities) => void;

	constructor
	(
		name: string,
		pos: Coords,
		visual: VisualBase,
		collideWithLander: (uwpe: UniverseWorldPlaceEntities) => void
	)
	{
		this.name = name;
		this.pos = pos;
		this.visual = visual;
		this.collideWithLander = collideWithLander;
	}

	static fromEntity(entity: Entity): EnergySource
	{
		return entity.propertyByName(EnergySource.name) as EnergySource;
	}

	toEntity(world: WorldExtended, planet: Planet): Entity
	{
		var dimension = 5;

		var energySourceCollider = new Sphere(Coords.create(), dimension);
		var energySourceCollidable = Collidable.fromCollider(energySourceCollider);

		var visualDetailed = new VisualWrapped(planet.sizeSurface, this.visual);
		var energySourceDrawable = Drawable.fromVisual(visualDetailed);

		var energySourceLocatable = Locatable.fromPos(this.pos);

		var visualScanContact: VisualBase =
			VisualPolygon.fromVerticesAndColorFill
			(
				[
					Coords.fromXY(0, -dimension),
					Coords.fromXY(dimension, 0),
					Coords.fromXY(0, dimension),
					Coords.fromXY(-dimension, 0),
				],
				Color.Instances().Cyan
			);
		visualScanContact = new VisualHidable
		(
			(uwpe: UniverseWorldPlaceEntities) =>
			{
				var isVisible = false;

				var place = uwpe.place;
				var placeTypeName = place.constructor.name;
				if (placeTypeName == PlacePlanetOrbit.name)
				{
					var placePlanetOrbit = place as PlacePlanetOrbit;
					isVisible = placePlanetOrbit.hasEnergyBeenScanned;
				}
				else if (placeTypeName == PlacePlanetSurface.name)
				{
					var placePlanetSurface = place as PlacePlanetSurface;
					var placePlanetOrbit = placePlanetSurface.placePlanetOrbit;
					isVisible = placePlanetOrbit.hasEnergyBeenScanned;
				}
				else
				{
					throw new Error("Unexpected placeTypeName: " + placeTypeName);
				}

				return isVisible;
			},
			visualScanContact
		);
		var energySourceMappable = new Mappable(visualScanContact);

		var returnValue = new Entity
		(
			this.name,
			[
				energySourceCollidable,
				energySourceDrawable,
				this,
				energySourceLocatable,
				energySourceMappable
			]
		);

		return returnValue;
	}

	// Clonable.
	clone(): EnergySource { throw new Error("todo"); }
	overwriteWith(other: EnergySource): EnergySource { throw new Error("todo"); }

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return EnergySource.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: EnergySource): boolean { return false; }
}
