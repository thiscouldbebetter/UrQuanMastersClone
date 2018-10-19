
function ShipSpecialDefn(name, energyToUse, effectWhenInvoked)
{
	this.name = name;
	this.energyToUse = energyToUse;
	this.effectWhenInvoked = effectWhenInvoked;
}
{
	ShipSpecialDefn.prototype.activate = function(universe, world, place, actor)
	{
		this.effectWhenInvoked(universe, world, place, actor);
	}
}
