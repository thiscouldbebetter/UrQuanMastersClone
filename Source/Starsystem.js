
function Starsystem(name, starColor, posInHyperspace, sizeInner, factionName, planets)
{
	this.name = name;
	this.starColor = starColor;
	this.posInHyperspace = posInHyperspace;
	this.sizeInner = sizeInner;
	this.factionName = factionName;
	this.planets = planets;

	for (var p = 0; p < this.planets.length; p++)
	{
		var planet = this.planets[p];
		planet.starsystem = this;
	}
}
{
	Starsystem.StarColors = 
	[ 
		"Red",
		"Orange",
		"Yellow",
		"Green",
		"Blue",
		"White",
	];
}
