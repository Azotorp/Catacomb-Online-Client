const realWorldScale = 0.00761461306 / playerScale; // meters per pixel
let uuid;
let debug = false;
let shadows = true;
let socket = io("wss://" + socketIOHost + ":" + socketIOPort);
let mapData = {};
let gamedelta;
let players = {};

const Application = PIXI.Application,
    Container = PIXI.Container,
    //Loader = PIXI.loader,
    Loader = PIXI.Loader.shared,
    Graphics = PIXI.Graphics,
    //Resources = PIXI.loader.resources,
    Resources = PIXI.Loader.shared.resources,
    TextureCache = PIXI.utils.TextureCache,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Sprite = PIXI.Sprite,
    TilingSprite = PIXI.TilingSprite,
    Sound = PIXI.sound,
    Ticker = PIXI.Ticker.shared;

let App = new Application({
        backgroundColor: 0x000000,
        autoResize: true,
        antialiasing: true,
        transparent: true,
        sharedTicker: true,
        resolution: devicePixelRatio,
    },
);

let frameTickTime;
let FPS;
let frames = 0;
let playerAngle;
let winCenterX = window.innerWidth / 2;
let winCenterY = window.innerHeight / 2;
let playerID = false;
let setupLoaded = false;
let zoomMulti = 1.5, minZoom = 0, maxZoom = 12; // < 0 = zoom in
let zoomStep = 0;
let zoom = pow(zoomMulti, zoomStep);
let localMousePos, worldMousePos;

let maxChunkRenderX = Math.ceil(((winCenterX * zoom) - (gridSize / 2)) / gridSize) + 1;
let maxChunkRenderY = Math.ceil(((winCenterY * zoom) - (gridSize / 2)) / gridSize) + 1;

let gameObject = {
    player: {},
    playerDiscordAvatar: {},
    playerDiscordUsername: {},
    playerSheet: {},
    floor: {},
    wall: {},
    shadowOverlay: {},
    debugPlayerHud: {},
    debugWallHud: {},
    debugFloorHud: {},
    referencePlayer: {},
    worldLayer: new Container(),
    visionLayer: new Container(),
    catacombLayer: new Container(),
    floorLayer: new Container(),
    wallLayer: new Container(),
    shadowOverlayLayer: new Container(),
    playerLayer: new Container(),
    debugWorldHudLayer: new Container(),
    debugWallHudLayer: new Container(),
    debugFloorHudLayer: new Container(),
    playerFOVScanMaskLayer: new Container(),
    debugPlayerHudLayer: {},
    wallGrid: {},
    floorGrid: {},
    playerFOVScanMask: {},
}

const FLAG = {
    WALL: 1,
    PLAYER: 2,
    BULLET: 4,
    BULLET_MOVEMENT: 8,
    ZOMBIE: 16,
    AMMO_CLIP: 32,
    VISION_GOGGLES: 64,
    PLAYER_FOV_RAY: 128,
};

let physics = {
    player: {
        body: {},
        shape: {},
    },
    referencePlayer: {
        body: {},
        shape: {},
    },
    wall: {
        body: {},
        shape: {},
    },
    world: new p2.World({
        gravity : [0,0],
        frictionGravity: 10,
        //islandSplit : true,
    }),
};

let serverOfflineErrorView = false;
