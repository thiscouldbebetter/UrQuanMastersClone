
function Combat(size, encounter, shipGroups)
{
	this.size = size;
	this.encounter = encounter;
	this.shipGroups = shipGroups;
	this.shipsFighting = [];

	this._differenceOfWrapAndNoWrap	= new Coords();
	this._displacement = new Coords();
	this._displacementAbsolute = new Coords();
	this._displacementWrapped = new Coords();
	this._displacementWrappedAbsolute = new Coords();
	this._midpointBetweenPoints = new Coords();
}

{
	Combat.prototype.enemyActivity = function(universe, world, place, actor)
	{
		var entitiesShips = place.entitiesShips();
		var target = (entitiesShips[0] == actor ? entitiesShips[1] : entitiesShips[0]);
		var targetPos = target.locatable.loc.pos;
		var actorLoc = actor.locatable.loc;
		var actorPos = actorLoc.pos;
		var actorVel = actorLoc.vel;
		var combat = place.combat;

		var targetDisplacement = combat.displacementOfPointsWrappedToRange
		(
			actorVel, // displacementToOverwrite
			actorPos,
			targetPos,
			combat.size
		);

		var forwardAsPolar = new Polar().fromCoords(actorLoc.orientation.forward);
		var angleForward = forwardAsPolar.azimuthInTurns;

		var targetDisplacementAsPolar = new Polar().fromCoords(targetDisplacement);
		var angleToTarget = targetDisplacementAsPolar.azimuthInTurns;

		var angleTargetMinusForward =
			angleToTarget.subtractWrappedToRangeMax(angleForward, 1);

		if (angleTargetMinusForward != 0)
		{
			var directionToTurn = angleTargetMinusForward / Math.abs(angleTargetMinusForward);
			actor.ship.turnInDirection(world, actor, directionToTurn);
		}

		actor.ship.accelerate(world, actor);
	}

	Combat.prototype.exit = function(universe)
	{
		var world = universe.world;
		world.placeNext = this.encounter.placeToReturnTo;
		universe.venueNext = new VenueWorld(world);
	}

	Combat.prototype.initialize = function(world)
	{
		for (var i = 0; i < this.shipGroups.length; i++)
		{
			var shipGroup = this.shipGroups[i];
			shipGroup.initialize(null, world);
		}
		return this;
	}

	Combat.prototype.ship0HasNotBeenSelected = function()
	{
		return (this.shipsFighting[0] == null);
	}

	Combat.prototype.ship1HasNotBeenSelected = function()
	{
		return (this.shipsFighting[1] == null);
	}

	Combat.prototype.shipsHaveBeenSelected = function()
	{
		return ( this.shipsFighting[0] != null && this.shipsFighting[1] != null );
	}

	Combat.prototype.start = function(universe, ship0, ship1)
	{
		var world = universe.world;
		world.placeNext = new PlaceCombat(world, this);
		var venueNext = new VenueWorld(world);
		universe.venueNext = venueNext;
	}

	// wrapping

	Combat.prototype.displacementOfPointsWrappedToRange = function(displacementToOverwrite, pos0, pos1, size)
	{
		var displacement = pos1.clone().subtract(pos0);
		var displacementMinSoFar = displacement.clone();
		var displacementMinSoFarAbsolute = displacementMinSoFar.clone().absolute();

		for (var i = -1; i <= 1; i += 2)
		{
			var displacementWrapped = size.clone().multiplyScalar(i).add(pos1).subtract(pos0);
			var displacementWrappedAbsolute = displacementWrapped.clone().absolute();
			if (displacementWrappedAbsolute.x < displacementMinSoFarAbsolute.x)
			{
				displacementMinSoFar.x = displacementWrapped.x;
				displacementMinSoFarAbsolute.x = displacementMinSoFarAbsolute.x;
			}
			if (displacementWrappedAbsolute.y < displacementMinSoFarAbsolute.y)
			{
				displacementMinSoFar.y = displacementWrapped.y;
				displacementMinSoFarAbsolute.y = displacementMinSoFarAbsolute.y;
			}
		}

		return displacementMinSoFar;
	}

	Combat.prototype.midpointOfPointsWrappedToRange = function(midpointToOverwrite, pos0, pos1, size)
	{
		var displacement = this.displacementOfPointsWrappedToRange(midpointToOverwrite, pos0, pos1, size);
		var midpoint = displacement.half().add(pos0);
		return midpoint;
	}

	// controls


	Combat.prototype.toControlDebriefing = function(universe, size)
	{
		var returnValue = universe.controlBuilder.message
		(
			universe, size, "Combat complete.", this.exit.bind(this)
		);
		return returnValue;
	}

	Combat.prototype.toControlShipSelect = function(universe, size)
	{
		var combat = this;
		var world = universe.world;
		var shipsYours = this.shipGroups[0].ships;
		var shipsTheirs = this.shipGroups[1].ships;

		// todo - Variable sizes.

		var marginWidth = 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);
		var fontHeightTitle = size.x / 20;
		var fontHeight = fontHeightTitle / 2;
		var titleSize = new Coords(size.x - marginSize.x * 2, fontHeightTitle);
		var headingSize = new Coords((size.x - marginSize.x * 3) / 2, fontHeight);
		var buttonHeight = fontHeightTitle;
		var buttonSizeSelect = new Coords((titleSize.x - marginSize.x * 3) / 4, buttonHeight);
		var buttonSizeFight = new Coords(titleSize.x, buttonHeight);
		var listSize = new Coords
		(
			headingSize.x,
			size.y - titleSize.y - headingSize.y - buttonHeight * 2 - marginSize.y * 6
		);
		var bindingForOptionText =
			new DataBinding(null, "fullNameAndCrew(world)", { "world": world } );

		var listShipsYours = new ControlList
		(
			"listShipsYours",
			new Coords(marginSize.x, titleSize.y + headingSize.y + marginSize.y * 3),
			listSize,
			shipsYours,
			bindingForOptionText,
			fontHeight,
			null, // bindingForItemSelected
			null, // bindingForItemValue
			new DataBinding(combat, "ship0HasNotBeenSelected()") // isEnabled
		);

		var listShipsTheirs = new ControlList
		(
			"listShipsTheirs",
			new Coords
			(
				marginSize.x * 2 + listSize.x,
				titleSize.y + headingSize.y + marginSize.y * 3
			),
			listSize,
			shipsTheirs,
			bindingForOptionText,
			fontHeight,
			null, // bindingForItemSelected
			null, // bindingForItemValue
			new DataBinding(combat, "ship1HasNotBeenSelected()") // isEnabled
		);

		var returnValue = new ControlContainer
		(
			"containerShipSelect",
			Coords.Instances.Zeroes,
			size,
			[
				new ControlLabel
				(
					"labelTitle",
					new Coords(size.x / 2, marginSize.y + fontHeightTitle / 2),
					titleSize,
					true, // isTextCentered
					"Ship Select",
					fontHeightTitle
				),

				new ControlLabel
				(
					"labelYours",
					new Coords(marginSize.x, titleSize.y + marginSize.y * 2),
					titleSize,
					false, // isTextCentered
					this.shipGroups[0].name + ":",
					fontHeight
				),

				listShipsYours,

				new ControlButton
				(
					"buttonSelectYours",
					new Coords
					(
						marginSize.x,
						size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2
					),
					buttonSizeSelect,
					"Select",
					fontHeight,
					true, // hasBorder
					new DataBinding(combat, "ship0HasNotBeenSelected()"), // isEnabled,
					function click(universe)
					{
						var shipYours = listShipsYours.itemSelected();
						combat.shipsFighting[0] = shipYours;
					},
					universe, // context
					false // canBeHeldDown
				),

				new ControlButton
				(
					"buttonRandomYours",
					new Coords
					(
						marginSize.x * 2 + buttonSizeSelect.x,
						size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2
					),
					buttonSizeSelect,
					"Random",
					fontHeight,
					true, // hasBorder
					new DataBinding(combat, "ship0HasNotBeenSelected()"), // isEnabled,
					function click(universe)
					{
						var shipGroupIndex = 0;
						var ship = combat.shipGroups[shipGroupIndex].ships.random();
						combat.shipsFighting[shipGroupIndex] = ship;
						listShipsYours._itemSelected = null;
					},
					universe, // context
					false // canBeHeldDown
				),

				new ControlLabel
				(
					"labelTheirs",
					new Coords
					(
						listSize.x + marginSize.x * 2,
						titleSize.y + marginSize.y * 2
					),
					titleSize,
					false, // isTextCentered
					this.shipGroups[1].name + ":",
					fontHeight
				),

				listShipsTheirs,

				new ControlButton
				(
					"buttonSelectTheirs",
					new Coords
					(
						marginSize.x * 2 + listSize.x,
						size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2
					),
					buttonSizeSelect,
					"Select",
					fontHeight,
					true, // hasBorder
					new DataBinding(combat, "ship1HasNotBeenSelected()"), // isEnabled,
					function click(universe)
					{
						var shipTheirs = listShipsTheirs.itemSelected();
						combat.shipsFighting[1] = shipTheirs;
					},
					universe, // context
					false // canBeHeldDown
				),

				new ControlButton
				(
					"buttonRandomTheirs",
					new Coords
					(
						marginSize.x * 4 + buttonSizeSelect.x * 3,
						size.y - buttonSizeFight.y - buttonSizeSelect.y - marginSize.y * 2
					),
					buttonSizeSelect,
					"Random",
					fontHeight,
					true, // hasBorder
					new DataBinding(combat, "ship1HasNotBeenSelected()"), // isEnabled,
					function click(universe)
					{
						var shipGroupIndex = 1;
						var ship = combat.shipGroups[shipGroupIndex].ships.random();
						combat.shipsFighting[shipGroupIndex] = ship;
						listShipsTheirs._itemSelected = null;
					},
					universe, // context
					false // canBeHeldDown
				),

				new ControlButton
				(
					"buttonFight",
					new Coords(marginSize.x, size.y - marginSize.y - buttonSizeFight.y),
					buttonSizeFight,
					"Fight",
					fontHeight,
					true, // hasBorder
					new DataBinding(combat, "shipsHaveBeenSelected()"), // isEnabled,
					function click(universe)
					{
						var shipYours = combat.shipsFighting[0];
						var shipTheirs = combat.shipsFighting[1];

						if (shipYours != null && shipTheirs != null)
						{
							combat.start(universe);
						}
					},
					universe, // context
					false // canBeHeldDown
				),
			]
		);

		return returnValue;
	}

}
