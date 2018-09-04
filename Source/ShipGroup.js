
function ShipGroup(name, factionName, ships)
{
	this.name = name;
	this.factionName = factionName;
	this.ships = ships;
}
{
	ShipGroup.prototype.faction = function(world)
	{
		return world.defns.factions[this.factionName]
	}
}
