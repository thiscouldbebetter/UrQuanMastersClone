
function Starsystem(name, starColor, size, pos, planets)
{
	this.name = name;
	this.starColor = starColor;
	this.size = size;
	this.pos = pos;
	this.planets = planets;

	for (var p = 0; p < this.planets.length; p++)
	{
		var planet = this.planets[p];
		planet.starsystem = this;
	}
}
