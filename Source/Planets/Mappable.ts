
class Mappable implements EntityPropertyBase
{
	visual: VisualBase;

	constructor(visual: VisualBase)
	{
		this.visual = visual;
	}

	static fromEntity(entity: Entity): Mappable
	{
		return entity.propertyByName(Mappable.name) as Mappable;
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return Mappable.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: Mappable): boolean
	{
		return false; // todo
	}

}