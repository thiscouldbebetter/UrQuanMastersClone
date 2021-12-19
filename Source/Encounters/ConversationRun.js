"use strict";
class ConversationRunExtended extends ConversationRun {
    constructor(defn, quit, entityPlayer, entityTalker) {
        super(defn, quit, entityPlayer, entityTalker, null);
    }
    transcript(universe) {
        var venueCurrent = universe.venueCurrent;
        var transcriptAsControl = this.toControlTranscript(universe.display.sizeDefault().clone(), universe, venueCurrent);
        var venueNext = VenueControls.fromControl(transcriptAsControl);
        venueNext = VenueFader.fromVenuesToAndFrom(venueNext, universe.venueCurrent);
        universe.venueNext = venueNext;
    }
    // overrides
    toControl_Todo(containerSize, universe) {
        // todo
        var conversationRun = this;
        var world = universe.world;
        var marginWidth = 10;
        var marginSize = Coords.fromXY(1, 1).multiplyScalar(marginWidth);
        var paneSizeTopAndBottom = Coords.fromXY(containerSize.y - marginSize.x * 2, (containerSize.y - marginSize.y * 3) / 2);
        var paneSizeTopAndBottomHalf = paneSizeTopAndBottom.clone().half();
        var fontHeight = 12;
        var buttonHeight = fontHeight * 2;
        var buttonSize = Coords.fromXY((paneSizeTopAndBottom.x - marginSize.x * 4) / 3, buttonHeight);
        var listThingsToSaySize = Coords.fromXY(paneSizeTopAndBottom.x - marginSize.x * 2, (paneSizeTopAndBottom.y - buttonHeight - marginSize.y * 3));
        var imageNonplayerName = "todo"; // this.defn.imageName;
        var image = universe.mediaLibrary.imageGetByName(imageNonplayerName);
        if (image == null || image.isLoaded == false) {
            imageNonplayerName = "Conversation";
        }
        var visualNonplayer = new VisualImageFromLibrary(imageNonplayerName //, paneSizeTopAndBottom
        );
        var controlRoot = ControlContainer.from4("containerConversation", Coords.fromXY(0, 0), // pos
        containerSize, [
            ControlContainer.from4("containerSpeaker", marginSize, // pos
            paneSizeTopAndBottom, // size
            [
                ControlVisual.from4("visualNonplayer", Coords.Instances().Zeroes, paneSizeTopAndBottom, DataBinding.fromContext(visualNonplayer)),
                new ControlLabel("labelNonplayerStatement", Coords.fromXY(paneSizeTopAndBottomHalf.x, fontHeight), // pos
                paneSizeTopAndBottom, true, // isTextCentered
                false, // isTextCenteredVertically
                DataBinding.fromContextAndGet(conversationRun, (c) => c.scopeCurrent.displayTextCurrent), fontHeight),
            ]),
            ControlContainer.from4("containerPlayer", 
            // pos
            Coords.fromXY(marginSize.x, marginSize.y * 2 + paneSizeTopAndBottom.y), paneSizeTopAndBottom, [
                ControlList.from8("listThingsToSay", marginSize, // pos
                listThingsToSaySize, 
                // items
                DataBinding.fromContextAndGet(conversationRun, (c) => c.scopeCurrent.talkNodesForOptionsActive()), 
                // bindingForItemText
                DataBinding.fromGet((c) => c.content // bindingExpression
                ), fontHeight, new DataBinding(conversationRun, (c) => c.scopeCurrent.talkNodeForOptionSelected, (c, v) => c.scopeCurrent.talkNodeForOptionSelected = v), // bindingForItemSelected
                DataBinding.fromContext(null) // bindingForItemValue
                ),
                new ControlButton("buttonNext", 
                // pos
                Coords.fromXY(marginSize.x, paneSizeTopAndBottom.y - marginSize.y - buttonHeight), buttonSize, "Next", fontHeight, true, // hasBorder,
                DataBinding.fromTrue(), // isEnabled
                () => // click
                 {
                    conversationRun.next(universe);
                }, false // canBeHeldDown
                ),
                new ControlButton("buttonTranscript", 
                // pos
                Coords.fromXY(marginSize.x * 2 + buttonSize.x, paneSizeTopAndBottom.y - marginSize.y - buttonHeight), buttonSize, "Transcript", fontHeight, true, // hasBorder,
                DataBinding.fromTrue(), // isEnabled
                () => // click
                 {
                    conversationRun.transcript(universe);
                }, false // canBeHeldDown
                ),
                new ControlButton("buttonLeave", 
                // pos
                Coords.fromXY(marginSize.x * 3 + buttonSize.x * 2, paneSizeTopAndBottom.y - marginSize.y - buttonHeight), buttonSize, "Leave", fontHeight, true, // hasBorder,
                DataBinding.fromTrue(), // isEnabled
                () => {
                    conversationRun.quit();
                }, false // canBeHeldDown
                )
            ]),
            ControlContainer.from4("containerSidebar", Coords.fromXY(300, 0), // todo
            Coords.fromXY(100, 300), // size
            [universe.world.player.toControlSidebar(world)])
        ]);
        return controlRoot;
    }
}
