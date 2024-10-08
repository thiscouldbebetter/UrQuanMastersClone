
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
	resourceCredits: number;
	infoCredits: number;
	items: any[];
	shipsMax: number;

	itemHolderCargo: ItemHolder;
	itemHolderDevices: ItemHolder;
	itemHolderLifeforms: ItemHolder;

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
		resourceCredits: number,
		infoCredits: number,
		itemsCargo: Item[],
		shipsMax: number
	)
	{
		this.name = name;
		this.thrustersMax = thrustersMax || Number.POSITIVE_INFINITY
		this.turningJetsMax = turningJetsMax || Number.POSITIVE_INFINITY
		this.componentsBackboneMax = componentsBackboneMax || Number.POSITIVE_INFINITY
		this.componentNames = componentNames || [];
		this.numberOfLanders = numberOfLanders || 0;
		this.crew = crew || 0;
		this.fuel = fuel || 0;
		this.resourceCredits = resourceCredits || 0;
		this.infoCredits = infoCredits || 0;
		this.itemHolderCargo = this.itemHolderCargoBuildOrUpdate(itemsCargo || []);
		this.itemHolderDevices = ItemHolder.default();
		this.itemHolderLifeforms = ItemHolder.default();
		this.shipsMax = shipsMax || Number.POSITIVE_INFINITY;

		this.cachesReset();
	}

	biodataSell(world: World): void
	{
		var value = this.resourcesBelongingToCategorySell
		(
			world, this.itemHolderLifeforms, ResourceDefn.CategoryBiodataName
		);
		this.infoCredits += value;
	}

	cachesReset(): Flagship
	{
		this._cargoMax = null;
		this._crewMax = null;
		this._fuelMax = null;

		var cargoMax = this.cargoMax();
		this.itemHolderCargo.encumbranceMaxSet(cargoMax);

		return this;
	}

	cargoCurrentOverMax(world: World): string
	{
		return this.itemHolderCargo.encumbranceOfAllItemsOverMax(world);
	}

	cargoMax(): number
	{
		if (this._cargoMax == null)
		{
			this._cargoMax = 0;
			var componentsCargo = this.componentsCargo();
			componentsCargo.forEach(x => x.applyToFlagship(this) );
		}
		return this._cargoMax;
	}

	cargoSell(world: World): void
	{
		var value = this.resourcesBelongingToCategorySell
		(
			world, this.itemHolderCargo, ResourceDefn.CategoryMineralName
		);
		this.resourceCredits += value;
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

	deviceWithNameUse(deviceName: string, uwpe: UniverseWorldPlaceEntities): void
	{
		var itemToUse = this.itemHolderDevices.itemByDefnName(deviceName);
		if (itemToUse == null)
		{
			throw new Error("No device found with name: '" + deviceName + "'.");
		}
		else
		{
			itemToUse.use(uwpe);
		}
	}

	fuelAdd(increment: number): Flagship
	{
		var fuelAfterAdd = this.fuel + increment;
		if (fuelAfterAdd > this._fuelMax)
		{
			fuelAfterAdd = this._fuelMax;
		}
		this.fuel = fuelAfterAdd;
		return this;
	}

	fuelCurrentOverMax(): string
	{
		var fuelMax = this.fuelMax();
		return NumberHelper.roundToDecimalPlaces(this.fuel, 1) + "/" + fuelMax;
	}

	fuelMax(): number
	{
		if (this._fuelMax == null)
		{
			this._fuelMax = 0;
			var componentsFuel = this.componentsFuel();
			componentsFuel.forEach(x => x.applyToFlagship(this) );
		}
		return this._fuelMax;
	}

	fuelNeededToFillToCapacity(): number
	{
		var fuelMax = this.fuelMax();
		var fuelNeeded = Math.floor(fuelMax - this.fuel);
		return fuelNeeded;
	}

	fuelSubtract(decrement: number): Flagship
	{
		var fuelAfterSubtract = this.fuel - decrement;
		if (fuelAfterSubtract < 0)
		{
			fuelAfterSubtract = 0;
		}
		this.fuel = fuelAfterSubtract;
		return this;
	}

	hasDeviceWithName(deviceName: string): boolean
	{
		return this.itemHolderDevices.hasItemWithDefnName(deviceName);
	}

	hasInfoCredits(): boolean
	{
		return this.hasInfoCreditsAtLeast(1);
	}

	hasInfoCreditsAtLeast(minimumAmount: number): boolean
	{
		return (this.infoCredits > minimumAmount);
	}

	hasInfoToSell(world: World): boolean
	{
		var returnValue =
			this.hasInfoToSell_Biodata()
			|| this.hasInfoToSell_PrecursorArtifacts(world);

		return returnValue;
	}

	hasInfoToSell_Biodata(): boolean
	{
		return this.itemHolderLifeforms.hasItemWithDefnName("Biodata");
	}

	hasInfoToSell_PrecursorArtifacts(world: World): boolean
	{
		return this.itemHolderDevices.hasItemWithCategoryName("PrecursorArtifact", world);
	}

	infoCreditsTradeForFuel(fuelToBuy: number): void
	{
		var infoCreditsPerFuelUnit = 1;
		var infoCreditsToSpend = fuelToBuy * infoCreditsPerFuelUnit;
		this.infoCredits -= infoCreditsToSpend;
		this.fuel += fuelToBuy;
	}

	itemHolderCargoBuildOrUpdate(itemsInitial: Item[]): ItemHolder
	{
		if (this.itemHolderCargo == null)
		{
			this.itemHolderCargo =
				ItemHolder
					.create()
					.retainsItemsWithZeroQuantitiesSet(true)
					.itemsAdd(ResourceDefn.Instances()._All.map(x => Resource.fromDefnName(x.name).toItem() ) )
					.itemsAdd(itemsInitial);
		}

		// todo - Set max.

		return this.itemHolderCargo;
	}

	resourcesBelongingToCategorySell
	(
		world: World, itemHolder: ItemHolder, resourceCategoryName: string
	): number
	{
		var itemsForResources =
			itemHolder.itemsBelongingToCategoryWithName(resourceCategoryName, world);
		var itemValues = itemsForResources.map(x => x.tradeValue(world) );
		var itemValueTotal = 0;
		itemValues.forEach(x => itemValueTotal += x);
		itemsForResources.forEach(x => itemHolder.itemSubtract(x) );
		return itemValueTotal;
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

	// Controls.

	toControlSidebar(world: WorldExtended): ControlBase
	{
		var flagship = this;
		var containerSidebarSize = Coords.fromXY(100, 300); // hack
		var marginWidth = 8;
		var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 10;
		var font = FontNameAndHeight.fromHeightInPixels(fontHeight);
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = Coords.fromXY(childControlWidth, fontHeight);
		var containerFlagshipSize = Coords.fromXY
		(
			containerSidebarSize.x - marginSize.x * 2,
			(containerSidebarSize.y - marginSize.x * 3) * 0.4
		);

		var containerFlagship = ControlContainer.from4
		(
			"containerFlagship",
			Coords.fromXY(marginSize.x, marginSize.y), // hack - pos
			containerFlagshipSize,
			// children
			[
				new ControlLabel
				(
					"labelFlagship",
					Coords.fromXY(0, labelSize.y), // pos
					labelSize,
					true, // isTextCenteredHorizontally
					false, // isTextCenteredVertically
					DataBinding.fromContext(flagship.name),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x, labelSize.y * 2),
					labelSize,
					DataBinding.fromContext("Crew:"),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 4, labelSize.y * 2),
					labelSize,
					DataBinding.fromContextAndGet
					(
						flagship, (c: Flagship) => c.crewCurrentOverMax()
					),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x, labelSize.y * 3),
					labelSize,
					DataBinding.fromContext("Fuel:"),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 4, labelSize.y * 3),
					labelSize,
					DataBinding.fromContextAndGet
					(
						flagship, (c: Flagship) => c.fuelCurrentOverMax()
					),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x, labelSize.y * 4),
					labelSize,
					DataBinding.fromContext("Landers:"),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 6, labelSize.y * 4),
					labelSize,
					DataBinding.fromContextAndGet
					(
						flagship, (c: Flagship) => "" + c.numberOfLanders
					),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x, labelSize.y * 5),
					labelSize,
					DataBinding.fromContext("Cargo:"),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 5, labelSize.y * 5),
					labelSize,
					DataBinding.fromContextAndGet
					(
						flagship,
						(c: Flagship) => c.cargoCurrentOverMax(world)
					),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x, labelSize.y * 6),
					labelSize,
					DataBinding.fromContext("Loc:"),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 4, labelSize.y * 6),
					labelSize,
					DataBinding.fromContextAndGet
					(
						world.player.shipGroup,
						(c: ShipGroupFinite) => c.posInHyperspace(world).toStringXY()
					),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x, labelSize.y * 7),
					labelSize,
					DataBinding.fromContext("Date:"),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 4, labelSize.y * 7),
					labelSize,
					DataBinding.fromContextAndGet
					(
						world.player.shipGroup,
						(c: ShipGroup) => world.gameTimeAsString().split("T")[0]
					),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x, labelSize.y * 8),
					labelSize,
					DataBinding.fromContext("Time:"),
					font
				),

				ControlLabel.from4Uncentered
				(
					Coords.fromXY(marginSize.x * 4, labelSize.y * 8),
					labelSize,
					DataBinding.fromContextAndGet
					(
						world.player.shipGroup,
						(c: ShipGroup) => world.gameTimeAsString().split("T")[1].split(":").slice(0, 2).join(":")
					),
					font
				),

			]
		);

		return containerFlagship;
	}
}
