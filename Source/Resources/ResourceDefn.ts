
class ResourceDefn
{
	name: string;
	nameFriendly: string;
	categoryName: string;
	color: Color;
	valuePerUnit: number;

	_itemDefn: ItemDefn;

	constructor
	(
		name: string,
		nameFriendly: string,
		categoryName: string,
		color: Color,
		valuePerUnit: number
	)
	{
		this.name = name;
		this.nameFriendly = nameFriendly;
		this.categoryName = categoryName;
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

	static CategoryBiodataName = "Biodata";
	static CategoryMineralName = "Mineral";

	toItemDefn(): ItemDefn
	{
		if (this._itemDefn == null)
		{
			this._itemDefn = ItemDefn.fromNameEncumbranceValueAndVisual
			(
				this.name,
				1,
				this.valuePerUnit,
				VisualCircle.fromRadiusAndColorFill(3, this.color)
			).categoryNameAdd
			(
				this.categoryName
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

		var rd = ResourceDefn;
		var categoryMinerals = ResourceDefn.CategoryMineralName;
		var categoryBiodata = ResourceDefn.CategoryBiodataName;

		this.Commons 		= new rd("Commons", 		"Common Elements", 	categoryMinerals, colors.White, 1);
		this.Corrosives 	= new rd("Corrosives", 		"Corrosives", 		categoryMinerals, colors.Red, 2);
		this.BaseMetals 	= new rd("BaseMetals", 		"Base Metals", 		categoryMinerals, colors.Gray, 3);
		this.NobleGases 	= new rd("NobleGases", 		"Noble Gases", 		categoryMinerals, colors.Blue, 4);
		this.RareEarths 	= new rd("RareEarths", 		"Rare Earths", 		categoryMinerals, colors.Green, 5);
		this.PreciousMetals = new rd("PreciousMetals", 	"Precious Metals", 	categoryMinerals, colors.Yellow, 6);
		this.Radioactives 	= new rd("Radioactives", 	"Radioactives", 	categoryMinerals, colors.Orange, 8);
		this.Exotics 		= new rd("Exotics", 		"Exotics", 			categoryMinerals, colors.Violet, 25);

		this.Biodata 		= new rd("Biodata", 		"Biodata", 			categoryBiodata, colors.Green, 2);

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

			this.Biodata
		];
		this._AllByName = ArrayHelper.addLookupsByName(this._All);
	}
}
