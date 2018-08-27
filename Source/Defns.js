
function Defns(constraintDefns, shipDefns)
{
	this.constraintDefns = constraintDefns.addLookups("name");
	this.shipDefns = shipDefns.addLookups("name");
}
