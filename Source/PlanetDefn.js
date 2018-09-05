
function PlanetDefn(name, color, hasLife, mineralDefnNames)
{
	this.name = name;
	this.color = color;
	this.hasLife = hasLife;
	this.mineralDefnNames = mineralDefnNames;
}
{
	PlanetDefn.Instances = function()
	{
		if (PlanetDefn._instances == null)
		{
			PlanetDefn._instances = new PlanetDefn_Instances();
		}

		return PlanetDefn._instances;
	}

	function PlanetDefn_Instances()
	{
		this.Acid = new PlanetDefn("Corrosive", "Green", false, []);
		this.Airless = new PlanetDefn("Airless", "LightGray", false, []);
		this.Gas = new PlanetDefn("Gas", "Orange", false, []);
		this.Greenhouse = new PlanetDefn("Greenhouse", "White", false, []);
		this.Ice = new PlanetDefn("Ice", "White", false, []);
		this.Rust = new PlanetDefn("Rust", "Brown", false, []);
		this.Water = new PlanetDefn("Water", "Cyan", true, []);

		this._All =
		[
			this.Acid,
			this.Airless,
			this.Gas,
			this.Greenhouse,
			this.Ice,
			this.Rust,
			this.Water,
		].addLookups("name");
	}
}
