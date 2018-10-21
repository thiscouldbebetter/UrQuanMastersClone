// partial class

	// methods

	ConversationRun.prototype.transcript = function(universe)
	{
		var venueCurrent = universe.venueCurrent;
		var transcriptAsControl = this.toControlTranscript
		(
			universe.display.sizeDefault.clone(), universe, venueCurrent
		);
		var venueNext = new VenueControls(transcriptAsControl);
		venueNext = new VenueFader(venueNext, universe.venueCurrent);
		universe.venueNext = venueNext;
	}

	// overrides

	ConversationRun.prototype.toControl = function(containerSize, universe)
	{
		var conversationRun = this;
		var conversationDefn = conversationRun.defn;

		var venueToReturnTo = universe.venueCurrent;

		var marginWidth = 10;
		var marginSize = new Coords(1, 1).multiplyScalar(marginWidth);
		var paneSizeTopAndBottom = new Coords
		(
			containerSize.y - marginSize.x * 2,
			(containerSize.y - marginSize.y * 3) / 2
		);
		var paneSizeTopAndBottomHalf = paneSizeTopAndBottom.clone().half();

		var fontHeight = 12;
		var buttonHeight = fontHeight * 2;
		var buttonSize = new Coords
		(
			(paneSizeTopAndBottom.x - marginSize.x * 4) / 3,
			buttonHeight
		);

		var listThingsToSaySize = new Coords
		(
			paneSizeTopAndBottom.x - marginSize.x * 2,
			(paneSizeTopAndBottom.y - buttonHeight - marginSize.y * 3)
		);

		var imageNonplayerName = this.defn.imageName;
		var image = universe.mediaLibrary.imageGetByName(imageNonplayerName);
		if (image == null || image.isLoaded == false)
		{
			imageNonplayerName = "Conversation";
		}
		var visualNonplayer = new VisualImageFromLibrary(imageNonplayerName, paneSizeTopAndBottom);

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
							new DataBinding
							(
								conversationRun,
								"scopeCurrent.displayTextCurrent"
							),
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
							// items
							new DataBinding
							(
								conversationRun,
								"scopeCurrent.talkNodesForOptionsActive()"
							),
							// bindingForItemText
							new DataBinding
							(
								null, // context
								"text" // bindingExpression
							),
							fontHeight,
							new DataBinding
							(
								conversationRun,
								"scopeCurrent.talkNodeForOptionSelected"
							), // bindingForItemSelected
							new DataBinding() // bindingForItemValue
						),

						new ControlButton
						(
							"buttonNext",
							// pos
							new Coords
							(
								marginSize.x,
								paneSizeTopAndBottom.y - marginSize.y - buttonHeight
							),
							buttonSize,
							"Next",
							fontHeight,
							true, // hasBorder,
							true, // isEnabled
							function click(universe)
							{
								conversationRun.next();
							},
							universe, // context
							false // canBeHeldDown
						),

						new ControlButton
						(
							"buttonTranscript",
							// pos
							new Coords
							(
								marginSize.x * 2 + buttonSize.x,
								paneSizeTopAndBottom.y - marginSize.y - buttonHeight
							),
							buttonSize,
							"Transcript",
							fontHeight,
							true, // hasBorder,
							true, // isEnabled
							function click(universe)
							{
								conversationRun.transcript(universe);
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
								marginSize.x * 3 + buttonSize.x * 2,
								paneSizeTopAndBottom.y - marginSize.y - buttonHeight
							),
							buttonSize,
							"Leave",
							fontHeight,
							true, // hasBorder,
							true, // isEnabled
							function click()
							{
								conversationRun.quit();
							},
							universe, // context
							false // canBeHeldDown
						)
					]
				),

				new ControlContainer
				(
					"containerSidebar",
					new Coords(300, 0), // todo
					new Coords(100, 300), // size
					[ universe.world.player.toControlSidebar() ]
				)
			]
		);

		return controlRoot;

	} // end function toControl()
