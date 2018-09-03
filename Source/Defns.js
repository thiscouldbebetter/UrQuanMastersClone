
function Defns(constraintDefns, factions, shipDefns)
{
	this.constraintDefns = constraintDefns.addLookups("name");
	this.factions = factions.addLookups("name");
	this.shipDefns = shipDefns.addLookups("name");
}
