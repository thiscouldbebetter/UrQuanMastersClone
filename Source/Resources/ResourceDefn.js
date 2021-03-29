
class ResourceDefn
{
	constructor(name, nameFriendly, color, valuePerUnit)
	{
		this.name = name;
		this.nameFriendly = nameFriendly;
		this.color = color;
		this.valuePerUnit = valuePerUnit;
	}

	static _instances;
	static Instances()
	{
		if (ResourceDefn._instances == null)
		{
			ResourceDefn._instances = new ResourceDefn_Instances();
		}

		return ResourceDefn._instances;
	}
}

class ResourceDefn_Instances
{
	constructor()
	{
		this.Commons = new ResourceDefn("Commons", "Common Elements", Color.byName("White"), 1);
		this.Corrosives = new ResourceDefn("Corrosives", "Corrosives", Color.byName("Red"), 2);
		this.BaseMetals = new ResourceDefn("BaseMetals", "Base Metals", Color.byName("Gray"), 3);
		this.NobleGases = new ResourceDefn("NobleGases", "Noble Gases", Color.byName("Blue"), 4);
		this.RareEarths = new ResourceDefn("RareEarths", "Rare Earths", Color.byName("Green"), 5);
		this.PreciousMetals = new ResourceDefn("PreciousMetals", "Precious Metals", Color.byName("Yellow"), 6);
		this.Radioactives = new ResourceDefn("Radioactives", "Radioactives", Color.byName("Orange"), 8);
		this.Exotics = new ResourceDefn("Exotics", "Exotics", Color.byName("Violet"), 25);

		this.Biodata = new ResourceDefn("Biodata", "Biodata", Color.byName("Green"), null);

		this._All =
		[
			this.Commons,
			this.Corrosives,
			this.BaseMetals,
			this.NobleGases,
			this.RareEarths,
			this.PreciousMetals,
			this.Radioactives,
			this.Exotics,

			this.Biodata,

		];
		this._AllByName = ArrayHelper.addLookupsByName(this._All);
	}
}
