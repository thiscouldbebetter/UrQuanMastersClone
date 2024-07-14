
class Lander implements EntityPropertyBase
{
	itemHolderCargo: ItemHolder;
	itemHolderLifeforms: ItemHolder;
	killableCrew: Killable;

	constructor
	(
		itemHolderCargo: ItemHolder,
		itemHolderLifeforms: ItemHolder,
		killableCrew: Killable
	)
	{
		this.itemHolderCargo = itemHolderCargo || ItemHolder.fromMassMax(50);
		this.itemHolderLifeforms = itemHolderLifeforms || ItemHolder.fromMassMax(50);
		this.killableCrew = killableCrew || Killable.fromIntegrityMax(12);
	}

	static fromKillableCrew(killableCrew: Killable): Lander
	{
		return new Lander(null, null, killableCrew);
	}

	static fromEntity(entity: Entity): Lander
	{
		return entity.propertyByName(Lander.name) as Lander;
	}

	cargoCurrentOverMax(world: World): string
	{
		return this.itemHolderCargo.massOfAllItemsOverMax(world);
	}

	crewCurrentOverMax(): string
	{
		return this.killableCrew.integrityCurrentOverMax();
	}

	lifeformsCurrentOverMax(world: World): string
	{
		return this.itemHolderLifeforms.massOfAllItemsOverMax(world);
	}

	// EntityProperty.

	finalize(uwpe: UniverseWorldPlaceEntities): void {}
	initialize(uwpe: UniverseWorldPlaceEntities): void {}
	propertyName(): string { return Lander.name; }
	updateForTimerTick(uwpe: UniverseWorldPlaceEntities): void {}

	// Equatable.

	equals(other: Lander) { return false; }
}
