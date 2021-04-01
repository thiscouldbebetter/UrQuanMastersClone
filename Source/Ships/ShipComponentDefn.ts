
class ShipComponentDefn
{
	name: string;
	categoryNames: string[];
	value: number;
	applyToFlagship: (f: Flagship) => void;

	constructor
	(
		name: string, categoryNames: string[], value: number,
		applyToFlagship: (f: Flagship) => void
	)
	{
		this.name = name;
		this.categoryNames = categoryNames;
		this.value = value;
		this.applyToFlagship = applyToFlagship;
	}

	static _instances: ShipComponentDefn_Instances;
	static Instances(): ShipComponentDefn_Instances
	{
		if (ShipComponentDefn._instances == null)
		{
			ShipComponentDefn._instances = new ShipComponentDefn_Instances();
		}

		return ShipComponentDefn._instances;
	}

	static byName(shipComponentDefnName: string)
	{
		return ShipComponentDefn.Instances()._AllByName.get(shipComponentDefnName);
	}

	// instance methods

	nameAndValue()
	{
		return this.name + "(" + this.value + ")";
	}
}

class ShipComponentCategory
{
	static _instances: ShipComponentCategory_Instances
	static Instances(): ShipComponentCategory_Instances
	{
		if (ShipComponentCategory._instances == null)
		{
			ShipComponentCategory._instances = new ShipComponentCategory_Instances();
		}
		return ShipComponentCategory._instances;
	}
}

class ShipComponentCategory_Instances
{
	Backbone: string;
	Cargo: string;
	Crew: string;
	Energy: string;
	Fuel: string;
	Propulsion: string;
	Thruster: string;
	TurningJets: string;
	Weapon: string;

	_All: string[];

	constructor()
	{
		this.Backbone = "Backbone";
		this.Cargo = "Cargo";
		this.Crew = "Crew";
		this.Energy = "Energy";
		this.Fuel = "Fuel";
		this.Propulsion = "Propulsion";
		this.Thruster = "Thruster";
		this.TurningJets = "TurningJets";
		this.Weapon = "Weapon";

		this._All =
		[
			this.Backbone,
			this.Cargo,
			this.Crew,
			this.Energy,
			this.Fuel,
			this.Propulsion,
			this.Thruster,
			this.TurningJets,
			this.Weapon,
		];

		return this;
	}
}

class ShipComponentDefn_Instances
{
	CargoHold: ShipComponentDefn;
	CrewHabitat: ShipComponentDefn;
	FuelTank: ShipComponentDefn;
	FusionThruster: ShipComponentDefn;
	IonCannon: ShipComponentDefn;
	PowerPlant: ShipComponentDefn;
	TurningJets: ShipComponentDefn;

	_All: ShipComponentDefn[];
	_AllBackbone: ShipComponentDefn[];
	_AllByName: Map<string, ShipComponentDefn>;

	constructor()
	{
		var categories = ShipComponentCategory.Instances();
		var categoryBackbone = categories.Backbone;
		var categoryCargo = categories.Cargo;
		var categoryCrew = categories.Crew;
		var categoryEnergy = categories.Energy
		var categoryFuel = categories.Fuel;
		var categoryThruster = categories.Thruster;
		var categoryTurningJets = categories.TurningJets;
		var categoryWeapon = categories.Weapon;

		var noEffect = (flagship: Flagship) => {};

		this.CargoHold = new ShipComponentDefn
		(
			"Cargo Hold",
			[ categoryBackbone, categoryCargo ],
			100,
			(flagship: Flagship) => flagship._cargoMax += 100
		);
		this.CrewHabitat = new ShipComponentDefn
		(
			"Crew Habitat",
			[ categoryBackbone, categoryCrew ],
			100,
			(flagship: Flagship) => flagship._crewMax += 50
		);
		this.FuelTank = new ShipComponentDefn
		(
			"Fuel Tank",
			[ categoryBackbone, categoryFuel ],
			100, // value
			(flagship: Flagship) => flagship._fuelMax += 100
		);

		this.IonCannon = new ShipComponentDefn
		(
			"Ion Cannon",
			[ categoryBackbone, categoryWeapon ],
			100,
			noEffect
		);

		this.FusionThruster = new ShipComponentDefn
		(
			"Fusion Thruster",
			[ categoryThruster ],
			100,
			(flagship: Flagship) => flagship._acceleration++
		);

		this.PowerPlant = new ShipComponentDefn
		(
			"Power Plant",
			[ categoryBackbone, categoryEnergy ],
			100,
			(flagship: Flagship) => flagship._energyPerTick++
		);

		this.TurningJets = new ShipComponentDefn
		(
			"Turning Jets",
			[ categoryTurningJets ],
			100,
			(flagship: Flagship) => flagship._turnsPerTick++
		);

		this._All =
		[
			this.TurningJets,
			this.CargoHold,
			this.CrewHabitat,
			this.FuelTank,
			this.IonCannon,
			this.FusionThruster,
			this.PowerPlant,
		];

		this._AllByName = ArrayHelper.addLookupsByName(this._All);

		this._AllBackbone =
		[
			this.CargoHold,
			this.CrewHabitat,
			this.FuelTank,
			this.IonCannon,
			this.PowerPlant,
		];
	}
}
