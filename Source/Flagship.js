
function Flagship(name, componentsMax, componentNames, numberOfLanders, fuel, items, shipsMax)
{
	this.name = name;
	this.componentsMax = componentsMax;
	this.componentNames = componentNames;
	this.numberOfLanders = numberOfLanders;
	this.fuel = fuel;
	this.itemHolder = new ItemHolder(items);
	this.shipsMax = shipsMax;
}
{
	Flagship.prototype.components = function()
	{
		if (this._components == null)
		{
			this._components = [];

			var componentDefns = ShipComponentDefn.Instances()._All;

			var componentNames = this.componentNames;
			for (var i = 0; i < componentNames.length; i++)
			{
				var componentName = componentNames[i];
				var component = componentDefns[componentName];
				this._components.push(component);
			}
		}

		return this._components;
	}

	Flagship.prototype.fuelCurrentOverMax = function()
	{
		return this.fuel + "/" + this.fuelMax();
	}

	Flagship.prototype.fuelMax = function()
	{
		if (this._fuelMax == null)
		{
			this._fuelMax = 0;
			var components = this.components();
			for (var i = 0; i < components.length; i++)
			{
				var component = components[i];
				component.applyToFlagship(this);
			}
		}
		return this._fuelMax;
	}
}
