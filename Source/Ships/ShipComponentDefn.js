
function ShipComponentDefn(name, categories, value, applyToFlagship)
{
	this.name = name;
	this.categories = categories;
	this.value = value;
	this.applyToFlagship = applyToFlagship;
}
{
	ShipComponentDefn.Categories = function()
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
	};

	ShipComponentDefn.Instances = function()
	{
		if (ShipComponentDefn._instances == null)
		{
			ShipComponentDefn._instances = new ShipComponentDefn_Instances();
		}

		return ShipComponentDefn._instances;
	}

	function ShipComponentDefn_Instances()
	{
		var categories = ShipComponentDefn.Categories();
		var categoryBackbone = categories.Backbone;
		var categoryCargo = categories.Cargo;
		var categoryCrew = categories.Crew;
		var categoryEnergy = categories.Energy
		var categoryFuel = categories.Fuel;
		var categoryThruster = categories.Thruster;
		var categoryTurningJets = categories.TurningJets;
		var categoryWeapon = categories.Weapon;

		var noEffect = function applyToFlagship(flagship) {};

		this.CargoHold = new ShipComponentDefn
		(
			"Cargo Hold",
			[ categoryBackbone, categoryCargo ],
			100,
			function applyToFlagship(flagship) { flagship._cargoMax += 100; }
		);
		this.CrewHabitat = new ShipComponentDefn
		(
			"Crew Habitat",
			[ categoryBackbone, categoryCrew ],
			100,
			function applyToFlagship(flagship) { flagship._crewMax += 50; }
		);
		this.FuelTank = new ShipComponentDefn
		(
			"Fuel Tank",
			[ categoryBackbone, categoryFuel ],
			100, // value
			function applyToFlagship(flagship) { flagship._fuelMax += 100; }
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
			function applyToFlagship(flagship) { flagship._acceleration += 1; }
		);

		this.PowerPlant = new ShipComponentDefn
		(
			"Power Plant",
			[ categoryBackbone, categoryEnergy ],
			100,
			function applyToFlagship(flagship) { flagship._energyPerTick += 1; }
		);

		this.TurningJets = new ShipComponentDefn
		(
			"Turning Jets",
			[ categoryTurningJets ],
			100,
			function applyToFlagship(flagship) { flagship._turnsPerTick += 1; }
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
		].addLookups("name");

		this._AllBackbone =
		[
			this.CargoHold,
			this.CrewHabitat,
			this.FuelTank,
			this.IonCannon,
			this.PowerPlant,
		].addLookups("name");
	}

	// instance methods

	ShipComponentDefn.prototype.nameAndValue = function()
	{
		return this.name + "(" + this.value + ")";
	}
}
