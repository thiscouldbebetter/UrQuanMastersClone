
class EnergySource implements EntityProperty<EnergySource>
{
	name: string;
	pos: Coords;
	visual: VisualBase;
	collideWithLander: any;

	constructor(name: string, pos: Coords, visual: VisualBase, collideWithLander: any)
	{
		this.name = name;
		this.pos = pos;
		this.visual = visual;
		this.collideWithLander = collideWithLander;
	}

	toEntity(world: WorldExtended, place: Place): Entity
	{
		var visual: VisualBase =
			VisualCircle.fromRadiusAndColorFill(10, Color.byName("Cyan"));
		visual = new VisualWrapped(place.size, visual);
		var energySourceCollider = new Sphere(Coords.create(), 5);
		var returnValue = new Entity
		(
			this.name,
			[
				this,
				Collidable.fromCollider(energySourceCollider),
				Drawable.fromVisual(visual),
				Locatable.fromPos(this.pos),
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
