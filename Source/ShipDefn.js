
function ShipDefn(name, thrust, speedMax, turnsPerTick, factionName)
{
	this.name = name;
	this.thrust = thrust;
	this.speedMax = speedMax;
	this.turnsPerTick = turnsPerTick;
	this.factionName = factionName;
}
{
	ShipDefn.prototype.faction = function(world)
	{
		// todo
	}
}
