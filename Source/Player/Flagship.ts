
class Flagship
{
	name: string;
	thrustersMax: number;
	turningJetsMax: number;
	componentsBackboneMax: number;
	componentNames: string[];
	numberOfLanders: number;
	crew: number;
	fuel: number;
	items: any[];
	shipsMax: number;

	itemHolder: ItemHolder;

	_acceleration: number;
	_cargoMax: number;
	_crewMax: number;
	_fuelMax: number;
	_components: ShipComponentDefn[];
	_componentsBackbone: ShipComponentDefn[];
	_componentsCargo: ShipComponentDefn[];
	_componentsCrew: ShipComponentDefn[];
	_componentsFuel: ShipComponentDefn[];
	_componentsThruster: ShipComponentDefn[];
	_componentsTurningJets: ShipComponentDefn[];
	_componentsWeapon: ShipComponentDefn[];
	_energyPerTick: number;
	_turnsPerTick: number;

	constructor
	(
		name: string,
		thrustersMax: number,
		turningJetsMax: number,
		componentsBackboneMax: number,
		componentNames: string[],
		numberOfLanders: number,
		crew: number,
		fuel: number,
		items: Item[],
		shipsMax: number
	)
	{
		this.name = name;
		this.thrustersMax = thrustersMax;
		this.turningJetsMax = turningJetsMax;
		this.componentsBackboneMax = componentsBackboneMax;
		this.componentNames = componentNames;
		this.numberOfLanders = numberOfLanders;
		this.crew = crew;
		this.fuel = fuel;
		this.itemHolder = ItemHolder.fromItems(items);
		this.shipsMax = shipsMax;

		this.cachesCalculate();
	}

	cachesCalculate(): void
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

	cargoCurrent(): number
	{
		return 0; // todo
	}

	cargoCurrentOverMax(): string
	{
		return this.cargoCurrent() + "/" + this._cargoMax;
	}

	components(): ShipComponentDefn[]
	{
		if (this._components == null)
		{
			this._components =
				this.componentsByCategories(ShipComponentCategory.Instances()._All);
		}

		return this._components;
	}

	componentsBackbone(): ShipComponentDefn[]
	{
		if (this._componentsBackbone == null)
		{
			this._componentsBackbone =
				this.componentsByCategories( [ ShipComponentCategory.Instances().Backbone ] );
		}

		return this._componentsBackbone;
	}

	componentsByCategories(categoriesToInclude: ShipComponentCategory[]): ShipComponentDefn[]
	{
		var components = [];

		var componentNames = this.componentNames;
		for (var i = 0; i < componentNames.length; i++)
		{
			var componentName = componentNames[i];
			var componentDefn = ShipComponentDefn.byName(componentName);
			var categories = componentDefn.categoryNames;
			for (var c = 0; c < categories.length; c++)
			{
				var category = categories[c];
				if (ArrayHelper.contains(categoriesToInclude, category) )
				{
					components.push(componentDefn);
					break;
				}
			}
		}

		return components;
	}

	componentsBackboneCurrentOverMax(): string
	{
		return this.componentsBackbone().length + "/" + this.componentsBackboneMax;
	}

	componentsCargo(): ShipComponentDefn[]
	{
		if (this._componentsCargo == null)
		{
			this._componentsCargo =
				this.componentsByCategories( [ ShipComponentCategory.Instances().Cargo ] );
		}

		return this._componentsCargo;
	}

	componentsCrew(): ShipComponentDefn[]
	{
		if (this._componentsCrew == null)
		{
			this._componentsCrew =
				this.componentsByCategories( [ ShipComponentCategory.Instances().Crew ] );
		}

		return this._componentsCrew;
	}

	componentsFuel(): ShipComponentDefn[]
	{
		if (this._componentsFuel == null)
		{
			this._componentsFuel =
				this.componentsByCategories( [ ShipComponentCategory.Instances().Fuel ] );
		}

		return this._componentsFuel;
	}

	componentsThruster(): ShipComponentDefn[]
	{
		if (this._componentsThruster == null)
		{
			this._componentsThruster =
				this.componentsByCategories( [ ShipComponentCategory.Instances().Thruster ] );
		}
		return this._componentsThruster;
	}

	componentsTurningJets(): ShipComponentDefn[]
	{
		if (this._componentsTurningJets == null)
		{
			this._componentsTurningJets =
				this.componentsByCategories( [ ShipComponentCategory.Instances().TurningJets ] );
		}
		return this._componentsTurningJets;
	}

	componentsWeapon(): ShipComponentDefn[]
	{
		if (this._componentsWeapon == null)
		{
			this._componentsWeapon =
				this.componentsByCategories( [ ShipComponentCategory.Instances().Weapon ] );
		}

		return this._componentsWeapon;
	}

	crewCurrentOverMax(): string
	{
		return this.crew + "/" + this._crewMax;
	}

	fuelCurrentOverMax(): string
	{
		return NumberHelper.roundToDecimalPlaces(this.fuel, 1) + "/" + this._fuelMax;
	}

	hasInfoToSell(world: World): boolean
	{
		var returnValue =
		(
			this.itemHolder.hasItemWithDefnName("Biodata")
			|| this.itemHolder.hasItemWithDefnName("RainbowWorldLocations")
			|| this.itemHolder.hasItemWithCategoryName("PrecursorArtifact", world)
		);

		return returnValue;
	}

	thrustersCurrent(): number
	{
		return this.componentsThruster().length;
	}

	thrustersCurrentOverMax(): string
	{
		return this.thrustersCurrent() + "/" + this.thrustersMax;
	}

	turningJetsCurrent(): number
	{
		return this.componentsTurningJets().length;
	}

	turningJetsCurrentOverMax(): string
	{
		return this.turningJetsCurrent() + "/" + this.turningJetsMax;
	}
}
