
class ResourceDefn
{
	name: string;
	nameFriendly: string;
	color: Color;
	valuePerUnit: number;

	_itemDefn: ItemDefn;

	constructor
	(
		name: string,
		nameFriendly: string,
		color: Color,
		valuePerUnit: number
	)
	{
		this.name = name;
		this.nameFriendly = nameFriendly;
		this.color = color;
		this.valuePerUnit = valuePerUnit;
	}

	static _instances: ResourceDefn_Instances;
	static Instances(): ResourceDefn_Instances
	{
		if (ResourceDefn._instances == null)
		{
			ResourceDefn._instances = new ResourceDefn_Instances();
		}

		return ResourceDefn._instances;
	}

	static byName(name: string)
	{
		return ResourceDefn.Instances()._AllByName.get(name);
	}

	toItemDefn(): ItemDefn
	{
		if (this._itemDefn == null)
		{
			this._itemDefn = ItemDefn.fromNameMassValueAndVisual
			(
				this.name, 1, this.valuePerUnit, VisualCircle.fromRadiusAndColorFill(3, this.color)
			)
		}
		return this._itemDefn;
	}
}

class ResourceDefn_Instances
{
	Commons: ResourceDefn;
	Corrosives: ResourceDefn;
	BaseMetals: ResourceDefn;
	NobleGases: ResourceDefn;
	RareEarths: ResourceDefn;
	PreciousMetals: ResourceDefn;
	Radioactives: ResourceDefn;
	Exotics: ResourceDefn;

	Biodata: ResourceDefn;

	_All: ResourceDefn[];
	_AllByName: Map<string,ResourceDefn>;

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
