
function ResourceDefn(name, nameLong, color, valuePerUnit)
{
	this.name = name;
	this.nameLong = nameLong;
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
		this.CommonElements = new ResourceDefn("Commons", "CommonElements", "White", 1);
		this.Corrosives = new ResourceDefn("Corrosives", "Corrosives", "Red", 2);
		this.BaseMetals = new ResourceDefn("Base Metals", "Base Metals", "Gray", 3);
		this.NobleGases = new ResourceDefn("Noble Gases", "Noble Gases", "Blue", 4);
		this.RareEarths = new ResourceDefn("Rare Earths", "Rare Earths", "Green", 5);
		this.PreciousMetals = new ResourceDefn("Precious Metals", "Precious Metals", "Yellow", 6);
		this.Radioactives = new ResourceDefn("Radioactives", "Radioactives", "Orange", 8);
		this.Exotics = new ResourceDefn("Exotics", "Exotic Materials", "Violet", 25);

		this._All =
		[
			this.CommonElements,
			this.Corrosives,
			this.BaseMetals,
			this.NobleGases,
			this.RareEarths,
			this.PreciousMetals,
			this.Radioactives,
			this.Exotics,

		].addLookups("name");
	}
}
