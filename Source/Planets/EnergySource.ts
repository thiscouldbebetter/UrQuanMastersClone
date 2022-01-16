
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

		var visual: VisualBase =
			VisualPolygon.fromVerticesAndColorFill
			(
				[
					Coords.fromXY(0, -dimension),
					Coords.fromXY(dimension, 0),
					Coords.fromXY(0, dimension),
					Coords.fromXY(-dimension, 0),
				],
				Color.byName("Cyan")
			);
		visual = new VisualWrapped(planet.sizeSurface, visual);
		var energySourceDrawable = Drawable.fromVisual(visual);

		var energySourceLocatable = Locatable.fromPos(this.pos);

		var energySourceVisualOnMinimap = new VisualImageFromLibrary
		(
			EnergySource.name + "MauluskaOrphan"
		);
		var energySourceMappable = new Mappable(energySourceVisualOnMinimap);

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

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: EnergySource): boolean { return false; }
}
