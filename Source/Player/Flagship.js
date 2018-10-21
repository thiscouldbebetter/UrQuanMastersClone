
function Flagship(name, thrustersMax, turningJetsMax, componentsBackboneMax, componentNames, numberOfLanders, crew, fuel, items, shipsMax)
{
	this.name = name;
	this.thrustersMax = thrustersMax;
	this.turningJetsMax = turningJetsMax;
	this.componentsBackboneMax = componentsBackboneMax;
	this.componentNames = componentNames;
	this.numberOfLanders = numberOfLanders;
	this.crew = crew;
	this.fuel = fuel;
	this.itemHolder = new ItemHolder(items);
	this.shipsMax = shipsMax;

	this.cachesCalculate();
}
{
	Flagship.prototype.cachesCalculate = function()
	{
		this._cargoMax = 0;
		this._crewMax = 0;
		this._fuelMax = 0;
		this._components = null;
		this._componentsThruster = null;
		this._componentsTurningJets = null;

		var components = this.components();
		for (var i = 0; i < components.length; i++)
		{
			var component = components[i];
			component.applyToFlagship(this);
		}
	}

	Flagship.prototype.cargoCurrent = function()
	{
		return 0;
	}

	Flagship.prototype.cargoCurrentOverMax = function()
	{
		return this.cargoCurrent() + "/" + this._cargoMax;
	}

	Flagship.prototype.components = function()
	{
		if (this._components == null)
		{
			this._components =
				this.componentsByCategories(ShipComponentDefn.Categories()._All);
		}

		return this._components;
	}

	Flagship.prototype.componentsBackbone = function()
	{
		if (this._componentsBackbone == null)
		{
			this._componentsBackbone =
				this.componentsByCategories( [ ShipComponentDefn.Categories().Backbone ] );
		}

		return this._componentsBackbone;
	}

	Flagship.prototype.componentsByCategories = function(categoriesToInclude)
	{
		var components = [];

		var componentDefns = ShipComponentDefn.Instances()._All;

		var componentNames = this.componentNames;
		for (var i = 0; i < componentNames.length; i++)
		{
			var componentName = componentNames[i];
			var componentDefn = componentDefns[componentName];
			var categories = componentDefn.categories;
			for (var c = 0; c < categories.length; c++)
			{
				var category = categories[c];
				if (categoriesToInclude.contains(category))
				{
					components.push(componentDefn);
					break;
				}
			}
		}

		return components;
	}

	Flagship.prototype.componentsBackboneCurrentOverMax = function()
	{
		return this.componentsBackbone().length + "/" + this.componentsBackboneMax;
	}

	Flagship.prototype.componentsCargo = function()
	{
		if (this._componentsCargo == null)
		{
			this._componentsCargo =
				this.componentsByCategories( [ ShipComponentDefn.Categories().Cargo ] );
		}

		return this._componentsCargo;
	}

	Flagship.prototype.componentsCrew = function()
	{
		if (this._componentsCrew == null)
		{
			this._componentsCrew =
				this.componentsByCategories( [ ShipComponentDefn.Categories().Crew ] );
		}

		return this._componentsCrew;
	}

	Flagship.prototype.componentsFuel = function()
	{
		if (this._componentsFuel == null)
		{
			this._componentsFuel =
				this.componentsByCategories( [ ShipComponentDefn.Categories().Fuel ] );
		}

		return this._componentsFuel;
	}

	Flagship.prototype.componentsThruster = function()
	{
		if (this._componentsThruster == null)
		{
			this._componentsThruster =
				this.componentsByCategories( [ ShipComponentDefn.Categories().Thruster ] );
		}
		return this._componentsThruster;
	}

	Flagship.prototype.componentsTurningJets = function()
	{
		if (this._componentsTurningJets == null)
		{
			this._componentsTurningJets =
				this.componentsByCategories( [ ShipComponentDefn.Categories().TurningJets ] );
		}
		return this._componentsTurningJets;
	}

	Flagship.prototype.componentsWeapon = function()
	{
		if (this._componentsWeapon == null)
		{
			this._componentsWeapon =
				this.componentsByCategories( [ ShipComponentDefn.Categories().Weapon ] );
		}

		return this._componentsWeapon;
	}

	Flagship.prototype.crewCurrentOverMax = function()
	{
		return this.crew + "/" + this._crewMax;
	}

	Flagship.prototype.fuelCurrentOverMax = function()
	{
		return this.fuel.roundToDecimalPlaces(1) + "/" + this._fuelMax;
	}

	Flagship.prototype.thrustersCurrent = function()
	{
		return this.componentsThruster().length;
	}

	Flagship.prototype.thrustersCurrentOverMax = function()
	{
		return this.thrustersCurrent() + "/" + this.thrustersMax;
	}

	Flagship.prototype.turningJetsCurrent = function()
	{
		return this.componentsTurningJets().length;
	}

	Flagship.prototype.turningJetsCurrentOverMax = function()
	{
		return this.turningJetsCurrent() + "/" + this.turningJetsMax;
	}
}
