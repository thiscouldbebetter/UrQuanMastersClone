
function Defns(placeDefns, factions, shipDefns, lifeformDefns)
{
	this.placeDefns = placeDefns.addLookupsByName();
	this.factions = factions.addLookupsByName();
	this.shipDefns = shipDefns.addLookupsByName();
	this.lifeformDefns = lifeformDefns.addLookupsByName();
}
