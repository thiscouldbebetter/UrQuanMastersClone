function Player(name, shipGroup)
{
	this.name = name;
	this.shipGroup = shipGroup;

	this.credit = 0;
	this.itemHolder = new ItemHolder([]);
	this.variableLookup = {};

	// Abbreviate for scripts.
	this.vars = this.variableLookup;
}
