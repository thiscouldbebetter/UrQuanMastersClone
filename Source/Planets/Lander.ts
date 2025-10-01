
class Lander extends EntityPropertyBase<Lander>
{
	itemHolderCargo: ItemHolder;
	itemHolderDevices: ItemHolder;
	itemHolderLifeforms: ItemHolder;
	killableCrew: Killable;

	constructor
	(
		itemHolderCargo: ItemHolder,
		itemHolderDevices: ItemHolder,
		itemHolderLifeforms: ItemHolder,
		killableCrew: Killable
	)
	{
		super();

		this.itemHolderCargo =
			itemHolderCargo || ItemHolder.fromEncumbranceMax(50);
		this.itemHolderDevices =
			itemHolderDevices || ItemHolder.default();
		this.itemHolderLifeforms =
			itemHolderLifeforms || ItemHolder.fromEncumbranceMax(50);
		this.killableCrew =
			killableCrew || Killable.fromIntegrityMax(12);
	}

	static fromKillableCrew(killableCrew: Killable): Lander
	{
		return new Lander(null, null, null, killableCrew);
	}

	static fromEntity(entity: Entity): Lander
	{
		return entity.propertyByName(Lander.name) as Lander;
	}

	cargoCurrentOverMax(world: World): string
	{
		return this.itemHolderCargo.encumbranceOfAllItemsOverMax(world);
	}

	crewCurrentOverMax(): string
	{
		return this.killableCrew.integrityCurrentOverMax();
	}

	lifeformsCurrentOverMax(world: World): string
	{
		return this.itemHolderLifeforms.encumbranceOfAllItemsOverMax(world);
	}
}
