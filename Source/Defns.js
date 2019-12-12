
function Defns(constraintDefns, placeDefns, factions, shipDefns, lifeformDefns)
{
	this.constraintDefns = constraintDefns.addLookupsByName();
	this.placeDefns = placeDefns.addLookupsByName();
	this.factions = factions.addLookupsByName();
	this.shipDefns = shipDefns.addLookupsByName();
	this.lifeformDefns = lifeformDefns.addLookupsByName();
}
