
function ShipWeaponSlot(name, componentInstalledIndex)
{
	this.name = name;
	this.componentInstalledIndex = componentInstalledIndex;
}
{
	ShipWeaponSlot.Instances = function()
	{
		if (ShipWeaponSlot._instances == null)
		{
			ShipWeaponSlot._instances = new ShipWeaponSlot_Instances();
		}

		return ShipWeaponSlot._instances;
	}

	function ShipWeaponSlot_Instances()
	{
		this.Forward = new ShipWeaponSlot("Forward");
		this.Oblique = new ShipWeaponSlot("Oblique");
		this.Lateral = new ShipWeaponSlot("Lateral");
		this.Rear = new ShipWeaponSlot("Rear");

		this._All =
		[
			this.Forward,
			this.Oblique,
			this.Lateral,
			this.Rear
		].addLookups("name");
	}

	// instance methods

	ShipWeaponSlot.prototype.componentInstalled = function(ship)
	{
		return null; // todo
	}

	ShipWeaponSlot.prototype.nameAndComponentInstalled = function()
	{
		var componentInstalled = this.componentInstalled;
		var componentInstalledName =
			(componentInstalled == null ? "[none]" : componentInstalled.name);
		var returnValue = this.name + ": " + componentInstalledName;
		return returnValue;
	}
}
