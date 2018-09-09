
function ResourceDefn(name, color, valuePerUnit)
{
	this.name = name;
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
		this.CommonElements = new ResourceDefn("CommonElements", "White", 1);
		this.Corrosives = new ResourceDefn("Corrosives", "Red", 2);
		this.BaseMetals = new ResourceDefn("BaseMetals", "Gray", 3);
		this.NobleGases = new ResourceDefn("NobleGases", "Blue", 4);
		this.RareEarths = new ResourceDefn("NobleGases", "Blue", 5);
		this.PreciousMetals = new ResourceDefn("PreciousMetals", "Yellow", 6);
		this.Radioactives = new ResourceDefn("Radioactives", "Orange", 8);
		this.ExoticMaterials = new ResourceDefn("ExoticMaterials", "Violet", 25);

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
