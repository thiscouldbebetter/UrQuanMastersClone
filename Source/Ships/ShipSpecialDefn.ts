
class ShipSpecialDefn
{
	name: string;
	energyToUse: number;
	effectWhenInvoked: any;

	constructor(name: string, energyToUse: number, effectWhenInvoked: any)
	{
		this.name = name;
		this.energyToUse = energyToUse;
		this.effectWhenInvoked = effectWhenInvoked;
	}

	activate(universe: Universe, world: World, place: Place, actor: Entity)
	{
		this.effectWhenInvoked(universe, world, place, actor);
	}
}
