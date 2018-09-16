
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

	ShipGroup.prototype.initialize = function(world)
	{
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship = this.ships[i];
			ship.initialize(world);
		}
	}
}
