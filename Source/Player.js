function Player(name, shipGroup)
{
	this.name = name;
	this.shipGroup = shipGroup;
	this.variableLookup = {};

	// Abbreviate for scripts.
	this.vars = this.variableLookup;
}
