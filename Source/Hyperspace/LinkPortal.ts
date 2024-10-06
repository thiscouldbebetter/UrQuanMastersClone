
class LinkPortal implements EntityProperty<LinkPortal>
{
	name: string;
	posInHyperspace: Coords;

	constructor
	(
		name: string,
		posInHyperspace: Coords
	)
	{
		this.name = name;
		this.posInHyperspace = posInHyperspace;
	}

	static fromEntity(entity: Entity): LinkPortal
	{
		return entity.propertyByName(LinkPortal.name) as LinkPortal;
	}

	// Clonable.

	clone(): Starsystem
	{
		throw new Error("todo");
	}

	overwriteWith(other: Starsystem): Starsystem
	{
		throw new Error("todo");
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return Starsystem.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.
	equals(other: Starsystem): boolean { return false; }
}
