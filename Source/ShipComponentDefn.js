
function ShipComponentDefn(name, cost, applyToPlayer)
{
	this.name = name;
	this.cost = cost;
	this.applyToPlayer = applyToPlayer;
}
{
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
		var noEffect = function applyToPlayer(player) {};

		this.CargoHold = new ShipComponentDefn("Cargo Hold", 100, noEffect);
		this.CrewHabitat = new ShipComponentDefn("Crew Habitat", 100, noEffect);
		this.FuelTank = new ShipComponentDefn
		(
			"Fuel Tank",
			100, // cost
			function applyToPlayer(player) { player._fuelMax += 100; }
		);
		this.IonCannon = new ShipComponentDefn("Ion Cannon", 100, noEffect);
		this.FusionThruster = new ShipComponentDefn("Fusion Thruster", 100, noEffect);
		this.ManeuveringJets = new ShipComponentDefn("Maneuvering Jets", 100, noEffect);
		this.PowerPlant = new ShipComponentDefn("Power Plant", 100, noEffect);

		this._All =
		[
			this.CargoHold,
			this.CrewHabitat,
			this.FuelTank,
			this.IonCannon,
			this.FusionThruster,
			this.ManeuveringJets,
			this.PowerPlant,

		].addLookups("name");
	}
}
