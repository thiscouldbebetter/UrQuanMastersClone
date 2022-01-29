
import gf = ThisCouldBeBetter.GameFramework;

// hack
// These classes currently have to come first.

import RandomizerLCG = gf.RandomizerLCG;

// Extensions.

import ArrayHelper = gf.ArrayHelper;
import NumberHelper = gf.NumberHelper;
import StringHelper = gf.StringHelper;

// hack

import EntityProperty = gf.EntityProperty;
import EntityPropertyBase = gf.EntityPropertyBase;

// Controls.

import ControlActionNames = gf.ControlActionNames;
import ControlBase = gf.ControlBase;
import ControlBuilder = gf.ControlBuilder;
import ControlButton = gf.ControlButton;
import ControlContainer = gf.ControlContainer;
import ControlContainerTransparent = gf.ControlContainerTransparent;
import ControlLabel = gf.ControlLabel;
import ControlList = gf.ControlList;
import ControlNone = gf.ControlNone;
import ControlScrollbar = gf.ControlScrollbar;
import ControlSelect = gf.ControlSelect;
import ControlSelectOption = gf.ControlSelectOption;
import ControlStyle = gf.ControlStyle;
import ControlTabbed = gf.ControlTabbed;
import ControlTextBox = gf.ControlTextBox;
import ControlVisual = gf.ControlVisual;
import Controllable = gf.Controllable;
import DataBinding = gf.DataBinding;
import VenueControls = gf.VenueControls;
import VenueMessage = gf.VenueMessage;

// Display.

import Color = gf.Color;
import Drawable = gf.Drawable;
import Display = gf.Display;
import Display2D = gf.Display2D;
import DisplayRecorder = gf.DisplayRecorder;
import DisplayTest = gf.DisplayTest;
import VenueFader = gf.VenueFader;
import VenueLayered = gf.VenueLayered;

// Display - Visuals.

import Visual = gf.Visual;
import VisualAnchor = gf.VisualAnchor;
import VisualBase = gf.VisualBase;
import VisualCircle = gf.VisualCircle;
import VisualCircleGradient = gf.VisualCircleGradient;
import VisualDirectional = gf.VisualDirectional;
import VisualDynamic = gf.VisualDynamic;
import VisualGroup = gf.VisualGroup;
import VisualHidable = gf.VisualHidable;
import VisualImage = gf.VisualImage;
import VisualImageFromLibrary = gf.VisualImageFromLibrary;
import VisualImageImmediate = gf.VisualImageImmediate;
import VisualImageScaled = gf.VisualImageScaled;
import VisualLine = gf.VisualLine;
import VisualNone = gf.VisualNone;
import VisualOffset = gf.VisualOffset;
import VisualPolygon = gf.VisualPolygon;
import VisualRectangle = gf.VisualRectangle;
import VisualSelect = gf.VisualSelect;
import VisualText = gf.VisualText;

// Display - Visuals - Animation.

import VisualAnimation = gf.VisualAnimation;

// Geometry.

import Camera = gf.Camera;
import Coords = gf.Coords;
import Disposition = gf.Disposition;
import Orientation = gf.Orientation;
import Polar = gf.Polar;
import RangeExtent = gf.RangeExtent;
import Rotation = gf.Rotation;

// Geometry - Collisions.

import Collision = gf.Collision;
import CollisionHelper = gf.CollisionHelper;
import CollisionTracker = gf.CollisionTracker;

// Geometry - Constraints.

import Constraint_FrictionDry = gf.Constraint_FrictionDry;
import Constraint_FrictionXY = gf.Constraint_FrictionXY;
import Constraint_TrimToPlaceSize = gf.Constraint_TrimToPlaceSize;
import Constraint_WrapToPlaceSize = gf.Constraint_WrapToPlaceSize;
import Constraint_WrapToPlaceSizeXTrimY = gf.Constraint_WrapToPlaceSizeXTrimY;
import Constraint_SpeedMaxXY = gf.Constraint_SpeedMaxXY;

// Geometry - Shapes.

import Box = gf.Box;
import BoxRotated = gf.BoxRotated;
import Cylinder = gf.Cylinder;
import Edge = gf.Edge;
import Face = gf.Face;
import Hemispace = gf.Hemispace;
import Path = gf.Path;
import PathBuilder = gf.PathBuilder;
import Plane = gf.Plane;
import Ray = gf.Ray;
import ShapeContainer = gf.ShapeContainer;
import ShapeGroupAll = gf.ShapeGroupAll;
import ShapeGroupAny = gf.ShapeGroupAny;
import ShapeInverse = gf.ShapeInverse;
import Sphere = gf.Sphere;

// Geometry - Shapes - Map.

import MapLocated = gf.MapLocated;

// Geometry - Shapes - Meshes.

import Mesh = gf.Mesh;;

// Geometry - Transforms.

import Transform = gf.Transform;
import TransformBase = gf.TransformBase;
import Transform_Locate = gf.Transform_Locate;
import Transform_Orient = gf.Transform_Orient;
import Transform_Rotate2D = gf.Transform_Rotate2D;
import Transform_Scale = gf.Transform_Scale;
import Transform_Translate = gf.Transform_Translate;
import Transformable = gf.Transformable;
import Transforms = gf.Transforms;

// Input.

import ActionToInputsMapping = gf.ActionToInputsMapping;
import Input = gf.Input;
import InputHelper = gf.InputHelper;

// Media.

import Font = gf.Font;
import Image2 = gf.Image2;
import MediaLibrary = gf.MediaLibrary;
import PlaceDefn = gf.PlaceDefn;
import TextString = gf.TextString;
import VenueVideo = gf.VenueVideo;
import Video = gf.Video;
import VideoHelper = gf.VideoHelper;

// Media - Audio.

import Sound = gf.Sound;
import SoundFromFile = gf.SoundFromFile;
import SoundFromFileMod = gf.SoundFromFileMod;
import SoundHelper = gf.SoundHelper;
import SoundHelperLive = gf.SoundHelperLive;
import VisualSound = gf.VisualSound;

// Model.

import Entity = gf.Entity;
import EntityBuilder = gf.EntityBuilder;
import EntityGenerator = gf.EntityGenerator;
import Ephemeral = gf.Ephemeral;
import Namable = gf.Namable;
import Place = gf.Place;
import Playable = gf.Playable;
import Universe = gf.Universe;
import UniverseWorldPlaceEntities = gf.UniverseWorldPlaceEntities;
import Venue = gf.Venue;
import VenueWorld = gf.VenueWorld;
import World = gf.World;
import WorldCreator = gf.WorldCreator;
import WorldDefn = gf.WorldDefn;

// Model - Actors.

import Action = gf.Action;
import Activity = gf.Activity;
import ActivityDefn = gf.ActivityDefn;
import Actor = gf.Actor;

// Model - Combat.

import Damage = gf.Damage;
import Damager = gf.Damager;
import Killable = gf.Killable;

// Model - Items.

import Item = gf.Item;
import ItemDefn = gf.ItemDefn;
import ItemCategory = gf.ItemCategory;
import ItemHolder = gf.ItemHolder;

// Model - Physics.

import Boundable = gf.Boundable;
import Collidable = gf.Collidable;
import Constrainable = gf.Constrainable;
import Constraint = gf.Constraint;
import Locatable = gf.Locatable;
import Movable = gf.Movable;

// Model - Talk.

import ConversationDefn = gf.ConversationDefn;
import ConversationRun = gf.ConversationRun;
import ConversationScope = gf.ConversationScope;
import TalkNode = gf.TalkNode;
import TalkNodeDefn = gf.TalkNodeDefn;
import Talker = gf.Talker;

// Profiles.

import Profile = gf.Profile;

// Storage.

import FileHelper = gf.FileHelper;
import Serializer = gf.Serializer;
import StorageHelper = gf.StorageHelper;
import VenueFileUpload = gf.VenueFileUpload;

// Storage - Compressor.

import BitStream = gf.BitStream;
import ByteStreamFromString = gf.ByteStreamFromString;
import CompressorLZW = gf.CompressorLZW;

// Tests.

import Assert = gf.Assert;
import TestFixture = gf.TestFixture;
import TestSuite = gf.TestSuite;

// Utility.

import DateTime = gf.DateTime;
import IDHelper = gf.IDHelper;
import PlatformHelper = gf.PlatformHelper;
import Randomizer = gf.Randomizer;
import RandomizerSystem = gf.RandomizerSystem;
import Reference = gf.Reference;
import TimerHelper = gf.TimerHelper;
import URLParser = gf.URLParser;
import ValueBreak = gf.ValueBreak;
import ValueBreakGroup = gf.ValueBreakGroup;
import VenueTask = gf.VenueTask;
