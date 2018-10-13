
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
		this.Propulsion = "Propulsion";
		this.Thruster = "Thruster";
		this.TurningJets = "TurningJets";
		this.Weapon = "Weapon";

		this._All =
		[
			this.Backbone,
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
		var categoryThruster = categories.Thruster;
		var categoryTurningJets = categories.TurningJets;

		var noEffect = function applyToFlagship(player) {};

		this.CargoHold = new ShipComponentDefn("Cargo Hold", [ categoryBackbone ], 100, noEffect);
		this.CrewHabitat = new ShipComponentDefn("Crew Habitat", [ categoryBackbone ], 100, noEffect);
		this.FuelTank = new ShipComponentDefn
		(
			"Fuel Tank",
			[ categoryBackbone ],
			100, // value
			function applyToFlagship(player) { player._fuelMax += 100; }
		);
		this.IonCannon = new ShipComponentDefn("Ion Cannon", [ categoryBackbone ], 100, noEffect);
		this.FusionThruster = new ShipComponentDefn("Fusion Thruster", [ categoryThruster ], 100, noEffect);
		this.PowerPlant = new ShipComponentDefn("Power Plant", [ categoryBackbone ], 100, noEffect);
		this.TurningJets = new ShipComponentDefn("Turning Jets", [ categoryTurningJets ], 100, noEffect);

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
