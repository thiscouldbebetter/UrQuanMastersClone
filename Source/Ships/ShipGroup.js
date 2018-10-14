
function ShipGroup(name, factionName, pos, ships)
{
	this.name = name;
	this.factionName = factionName;
	this.pos = pos;
	this.ships = ships;
}
{
	ShipGroup.prototype.faction = function(world)
	{
		return world.defns.factions[this.factionName]
	}

	ShipGroup.prototype.initialize = function(universe, world)
	{
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship = this.ships[i];
			ship.initialize(universe, world);
		}
	}

	ShipGroup.prototype.toStringDescription = function()
	{
		var shipCountsByDefnName = {};
		for (var i = 0; i < this.ships.length; i++)
		{
			var ship = this.ships[i];
			var shipDefnName = ship.defnName;
			var shipCountForDefnName = shipCountsByDefnName[i];
			if (shipCountForDefnName == null)
			{
				shipCountForDefnName = 0;
				shipCountsByDefnName[shipDefnName] = shipCountForDefnName;
			}
			shipCountForDefnName++;
			shipCountsByDefnName[shipDefnName] = shipCountForDefnName;
		}

		var shipCountsAsStrings = [];

		for (var shipDefnName in shipCountsByDefnName)
		{
			var shipCount = shipCountsByDefnName[shipDefnName];
			var shipCountAsString = shipCount + " " + shipDefnName;
			shipCountsAsStrings.push(shipCountAsString);
		}

		return shipCountsAsStrings;
	}
}
