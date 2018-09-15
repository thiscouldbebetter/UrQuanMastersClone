
function ResourceDefn(name, shortName, color, valuePerUnit)
{
	this.name = name;
	this.shortName = shortName
	this.color = color;
	this.valuePerUnit = valuePerUnit;
}
{
	ResourceDefn.Instances = function()
	{
		if (ResourceDefn._instances == null)
		{
			ResourceDefn._instances = new ResourceDefn_Instances();
		}

		return ResourceDefn._instances;
	}

	function ResourceDefn_Instances()
	{
		this.CommonElements = new ResourceDefn("CommonElements", "Common", "White", 1);
		this.Corrosives = new ResourceDefn("Corrosives", "Corrosives", "Red", 2);
		this.BaseMetals = new ResourceDefn("BaseMetals", "Base Metals", "Gray", 3);
		this.NobleGases = new ResourceDefn("NobleGases", "Noble Gases", "Blue", 4);
		this.RareEarths = new ResourceDefn("RareEarths", "Rare Earths", "Green", 5);
		this.PreciousMetals = new ResourceDefn("PreciousMetals", "Precious Metals", "Yellow", 6);
		this.Radioactives = new ResourceDefn("Radioactives", "Radioactives", "Orange", 8);
		this.ExoticMaterials = new ResourceDefn("ExoticMaterials", "Exotics", "Violet", 25);

		this._All =
		[
			this.CommonElements,
			this.Corrosives,
			this.BaseMetals,
			this.NobleGases,
			this.RareEarths,
			this.PreciousMetals,
			this.Radioactives,
			this.ExoticMaterials,

		].addLookups("name");
	}
}
