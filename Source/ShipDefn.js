
function ShipDefn
(
	name,
	factionName,
	acceleration,
	speedMax,
	turnsPerTick,
	integrityMax,
	visual
)
{
	this.name = name;
	this.factionName = factionName;
	this.acceleration = acceleration;
	this.speedMax = speedMax;
	this.turnsPerTick = turnsPerTick;
	this.integrityMax = integrityMax;
	this.visual = visual;
}
{
	// static methods

	ShipDefn.Instances = function()
	{
		if (ShipDefn._instances == null)
		{
			var shipDefnDefault = new ShipDefn
			(
				"Default",
				null, // factionName
				.1, // accel
				2, // speedMax
				.01, // turnsPerTick
				10, // integrityMax
				new VisualNone() // todo
			);

			var shipDefnSlaverGuardDrone = new ShipDefn
			(
				"SlaverGuardDrone",
				null, // factionName
				.1, // accel
				2, // speedMax
				.01, // turnsPerTick
				10, // integrityMax
				new VisualNone() // todo
			);

			ShipDefn._instances =
			[
				shipDefnDefault
			];
		}

		return ShipDefn._instances;
	}

	// instance methods

	ShipDefn.prototype.faction = function(world)
	{
		// todo
	}
}
