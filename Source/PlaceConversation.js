
function PlaceConversation(world, conversation, placeToReturnTo)
{
	this.conversation = conversation;
	this.placeToReturnTo = placeToReturnTo;

	var entities = [];
	Place.call(this, entities);
}
{
	PlaceConversation.prototype = Object.create(Place.prototype);
	PlaceConversation.prototype.constructor = Place;

	PlaceConversation.prototype.draw_FromSuperclass = Place.prototype.draw;
	PlaceConversation.prototype.draw = function(universe, world)
	{
		this.draw_FromSuperclass(universe, world);
		if (this.venueControls != null)
		{
			this.venueControls.draw(universe, world);
		}
	}

	PlaceConversation.prototype.updateForTimerTick_FromSuperclass = Place.prototype.updateForTimerTick;
	PlaceConversation.prototype.updateForTimerTick = function(universe, world)
	{
		this.updateForTimerTick_FromSuperclass(universe, world);

		if (this.venueControls == null)
		{
			var displaySize = universe.display.sizeInPixels;
			var containerSize = displaySize.clone();
			var marginWidth = 10;
			var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);
			var paneSizeTopAndBottom = new Coords
			(
				containerSize.y - marginSize.x * 2,
				(containerSize.y - marginSize.y * 3) / 2
			);
			var paneSizeTopAndBottomHalf = paneSizeTopAndBottom.clone().half();

			var fontHeight = 10;
			var buttonHeight = fontHeight * 2;
			var buttonSize = new Coords
			(
				(paneSizeTopAndBottom.x - marginSize.x * 3) / 2,
				buttonHeight
			);

			var listThingsToSaySize = new Coords
			(
				paneSizeTopAndBottom.x - marginSize.x * 2,
				(paneSizeTopAndBottom.y - buttonHeight - marginSize.y * 3)
			);

			var visualFaceRadius = paneSizeTopAndBottom.y * .3;
			var visualFaceEyeRadius = visualFaceRadius / 4;
			var visualFacePupilRadius = visualFaceEyeRadius / 3;
			var visualFaceColor = "Gray";
			var visualFaceEyeColor = "White";
			var visualFacePupilColor = "Black";
			var visualFace = new VisualGroup
			([
				new VisualCircle(visualFaceRadius, visualFaceColor),
				new VisualOffset
				(
					new VisualGroup
					([
						new VisualCircle(visualFaceEyeRadius, visualFaceEyeColor),
						new VisualCircle(visualFacePupilRadius, visualFacePupilColor),
					]),
					new Coords(-1, -1).multiplyScalar(1.5 * visualFaceEyeRadius)
				),
				new VisualOffset
				(
					new VisualGroup
					([
						new VisualCircle(visualFaceEyeRadius, visualFaceEyeColor),
						new VisualCircle(visualFacePupilRadius, visualFacePupilColor),
					]),
					new Coords(1, -1).multiplyScalar(1.5 * visualFaceEyeRadius)
				),
				new VisualOffset
				(
					new VisualRay(visualFaceRadius, visualFaceEyeColor),
					new Coords(-2, 2).multiplyScalar(visualFaceEyeRadius)
				),
			]);

			var visualNonplayer = new VisualGroup
			([
				new VisualRectangle(paneSizeTopAndBottom, "Cyan"),
				new VisualOffset
				(
					new VisualRectangle
					(
						new Coords
						(
							paneSizeTopAndBottom.x,
							paneSizeTopAndBottom.y / 2
						),
						"Green"
					),
					new Coords(0, paneSizeTopAndBottom.y / 4)
				),
				visualFace
			])

			var controlRoot = new ControlContainer
			(
				"containerConversation",
				new Coords(0, 0), // pos
				containerSize,
				[
					new ControlContainer
					(
						"containerSpeaker",
						marginSize, // pos
						paneSizeTopAndBottom, // size
						[
							new ControlVisual
							(
								"visualNonplayer",
								Coords.Instances.Zeroes,
								paneSizeTopAndBottom,
								visualNonplayer
							),

							new ControlLabel
							(
								"labelNonplayerStatement",
								new Coords
								(
									paneSizeTopAndBottomHalf.x,
									fontHeight
								), // pos
								paneSizeTopAndBottom,
								true, // isTextCentered
								"How does that make you feel?",
								fontHeight
							),
						]
					),

					new ControlContainer
					(
						"containerPlayer",
						// pos
						new Coords
						(
							marginSize.x,
							marginSize.y * 2 + paneSizeTopAndBottom.y
						),
						paneSizeTopAndBottom,
						[
							new ControlList
							(
								"listThingsToSay",
								marginSize, // pos
								listThingsToSaySize,
								[
									"I like it.",
									"I hate it.",
									"I don't care."
								], // items
								null, // bindingExpressionForItemText,
								fontHeight,
								null, // bindingForItemSelected
								null // bindingExpressionForItemValue
							),

							new ControlButton
							(
								"buttonSay",
								// pos
								new Coords
								(
									marginSize.x,
									paneSizeTopAndBottom.y - marginSize.y - buttonHeight
								),
								buttonSize,
								"Say",
								fontHeight,
								true, // hasBorder,
								true, // isEnabled
								function click()
								{
									alert("todo");
								},
								universe, // context
								false // canBeHeldDown
							),

							new ControlButton
							(
								"buttonLeave",
								// pos
								new Coords
								(
									marginSize.x * 2 + buttonSize.x,
									paneSizeTopAndBottom.y - marginSize.y - buttonHeight
								),
								buttonSize,
								"Leave",
								fontHeight,
								true, // hasBorder,
								true, // isEnabled
								function click()
								{
									var world = universe.world;
									var placeConversation = world.place;
									var placeNext = placeConversation.placeToReturnTo;
									world.placeNext = placeNext;
								},
								universe, // context
								false // canBeHeldDown
							)
						]
					),

					new ControlContainer
					(
						"containerSidebar",
						new Coords(displaySize.y, 0),
						new Coords(displaySize.x - displaySize.y, displaySize.y),
						[
							// todo
						]
					),
				]
			);


			this.venueControls = new VenueControls(controlRoot);
		}

		this.venueControls.updateForTimerTick(universe, world);
	}
}
