function Player(name, shipGroup)
{
	this.name = name;
	this.shipGroup = shipGroup;

	this.credit = 0;
	this.itemHolder = new ItemHolder([]);
	this.variableLookup = {};

	// Abbreviate for scripts.
	this.vars = this.variableLookup;
}

{
	Player.prototype.toControlSidebar = function()
	{
		var containerSidebarSize = new Coords(100, 300); // hack
		var marginWidth = 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);
		var fontHeight = 16;
		var childControlWidth = containerSidebarSize.x - marginWidth * 2;
		var labelSize = new Coords(childControlWidth, fontHeight);

		var containerSidebar = new ControlContainer
		(
			"containerSidebar",
			new Coords(300, 0), // hack - pos
			containerSidebarSize,
			// children
			[
				new ControlLabel
				(
					"labelFlagship",
					new Coords(containerSidebarSize.x / 2, marginSize.y + labelSize.y / 2),
					labelSize,
					true, // isTextCentered,
					"Flagship",
					fontHeight
				),

				new ControlContainer
				(
					"containerShipImage",
					new Coords(marginSize.x, marginSize.y * 2 + labelSize.y), // pos
					new Coords(1, 2).multiplyScalar(childControlWidth),
					[
						// todo
					]// children
				),
			]
		);

		return containerSidebar;
	}
}
