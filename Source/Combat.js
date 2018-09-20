
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
		var shipEntities = place.shipEntities();
		var target = (shipEntities[0] == actor ? shipEntities[1] : shipEntities[0]);
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
			Ship.turnInDirection(world, actor, directionToTurn);
		}

		Ship.accelerate(world, actor);
	}

	Combat.prototype.initialize = function(world)
	{
		for (var i = 0; i < this.shipGroups.length; i++)
		{
			var shipGroup = this.shipGroups[i];
			shipGroup.initialize(world);
		}
		return this;
	}

	Combat.prototype.shipSelect = function(universe, ship0, ship1)
	{
		this.shipsFighting.length = 0;
		this.shipsFighting.push(ship0)
		this.shipsFighting.push(ship1);

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
		var buttonSize = new Coords(titleSize.x, fontHeightTitle * 2);
		var listSize = new Coords
		(
			headingSize.x,
			size.y - titleSize.y - headingSize.y - buttonSize.y - marginSize.y * 5
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
			null // bindingForItemValue
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
			null // bindingForItemValue
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
					"Yours:",
					fontHeight
				),

				listShipsYours,

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
					"Theirs:",
					fontHeight
				),

				listShipsTheirs,

				new ControlButton
				(
					"buttonFight",
					new Coords(marginSize.x, size.y - marginSize.y - buttonSize.y),
					buttonSize,
					"Fight",
					fontHeight,
					true, // hasBorder
					true, // isEnabled,
					function click(universe)
					{
						var shipYours = listShipsYours.itemSelected();
						var shipTheirs = listShipsTheirs.itemSelected();

						if (shipYours != null && shipTheirs != null)
						{
							combat.shipSelect(universe, shipYours, shipTheirs);
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
