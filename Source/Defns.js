
function Defns(constraintDefns, factions, shipDefns, lifeformDefns)
{
	this.constraintDefns = constraintDefns.addLookups("name");
	this.factions = factions.addLookups("name");
	this.shipDefns = shipDefns.addLookups("name");
	this.lifeformDefns = lifeformDefns.addLookups("name");
}
