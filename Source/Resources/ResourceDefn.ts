
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
		var colors = Color.Instances();

		this.Commons = new ResourceDefn("Commons", "Common Elements", colors.White, 1);
		this.Corrosives = new ResourceDefn("Corrosives", "Corrosives", colors.Red, 2);
		this.BaseMetals = new ResourceDefn("BaseMetals", "Base Metals", colors.Gray, 3);
		this.NobleGases = new ResourceDefn("NobleGases", "Noble Gases", colors.Blue, 4);
		this.RareEarths = new ResourceDefn("RareEarths", "Rare Earths", colors.Green, 5);
		this.PreciousMetals = new ResourceDefn("PreciousMetals", "Precious Metals", colors.Yellow, 6);
		this.Radioactives = new ResourceDefn("Radioactives", "Radioactives", colors.Orange, 8);
		this.Exotics = new ResourceDefn("Exotics", "Exotics", colors.Violet, 25);

		this.Biodata = new ResourceDefn("Biodata", "Biodata", colors.Green, null);

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
