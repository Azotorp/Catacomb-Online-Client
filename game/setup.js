//physics.world.sleepMode = p2.World.ISLAND_SLEEPING;
physics.world.solver.iterations = 20;
physics.world.solver.tolerance = 0.1;
//physics.world.setGlobalStiffness(1000000000000);

App.stage = new PIXI.display.Stage();
App.stage.sortableChildren = true;

App.renderer.view.style.position = "absolute";
App.renderer.view.style.display = "block";
App.renderer.autoDensity = true;
App.renderer.resize(window.innerWidth, window.innerHeight);
App.stage.scale.x = 1;
App.stage.scale.y = -1;
App.stage.position.x = winCenterX;
App.stage.position.y = winCenterY;
App.stage.pivot.x = 0;
App.stage.pivot.y = 0;

App.stage.addChild(gameObject.worldLayer);
gameObject.worldLayer.addChild(gameObject.catacombLayer);
gameObject.catacombLayer.addChild(gameObject.floorLayer);
gameObject.catacombLayer.addChild(gameObject.visionLayer);
gameObject.worldLayer.addChild(gameObject.wallLayer);
gameObject.catacombLayer.addChild(gameObject.shadowOverlayLayer);
gameObject.catacombLayer.addChild(gameObject.playerFOVScanMaskLayer);
gameObject.catacombLayer.addChild(gameObject.playerLayer);
gameObject.worldLayer.addChild(gameObject.debugWorldHudLayer);
gameObject.debugWorldHudLayer.addChild(gameObject.debugFloorHudLayer);
gameObject.debugWorldHudLayer.addChild(gameObject.debugWallHudLayer);

localMousePos = App.renderer.plugins.interaction.mouse.global;
worldMousePos = App.stage.toLocal(localMousePos);

window.addEventListener('resize', resize);
window.addEventListener('mousewheel', (ev) => {
    mouseWheel(ev.deltaY);
});


//document.querySelector('#frame').appendChild(App.view);
function setupLoader()
{
    Loader.add("wall", "images/map/wall.png");
    Loader.add("floor", "images/map/floor.png");
    Loader.add("player","images/player/player.json");
    Loader.add("crossroadOverlay", "images/map/overlay/crossroad.png");
    Loader.add("deadEndOverlay", "images/map/overlay/deadEnd.png");
    Loader.add("floorCornerOverlay", "images/map/overlay/floorCorner.png");
    Loader.add("hollowBoxOverlay", "images/map/overlay/hollowBox.png");
    Loader.add("sideOverlay", "images/map/overlay/side.png");
    Loader.add("sideCornerAOverlay", "images/map/overlay/sideCornerA.png");
    Loader.add("sideCornerBOverlay", "images/map/overlay/sideCornerB.png");
    Loader.add("straightOverlay", "images/map/overlay/straight.png");
    Loader.add("tJuncOverlay", "images/map/overlay/tJunc.png");
    Loader.add("turnOverlay", "images/map/overlay/turn.png");
    Loader.add("wallCornerOverlay", "images/map/overlay/wallCorner.png");
    Loader.add("floorOpeningAOverlay", "images/map/overlay/floorOpeningA.png");
    Loader.add("floorOpeningBOverlay", "images/map/overlay/floorOpeningB.png");
    Loader.add("floorOpeningCOverlay", "images/map/overlay/floorOpeningC.png");
    Loader.onProgress.add(loadinginfo);
    Loader.load(setup);
}

function clientReady()
{
    socket.emit("clientReady", {
        auth: {
            level: AUTH_LEVEL,
            username: AUTH_USERNAME,
            userID: AUTH_USERID,
            ip: AUTH_IP,
            key: AUTH_KEY,
        },
        mouse: {
            x: worldMousePos.x,
            y: worldMousePos.y,
        },
        playerAngle: angle(worldMousePos),
        avatar: DISCORD_AVATAR,
        player: {
            width: gameObject.referencePlayer.width,
            height: gameObject.referencePlayer.height,
        },
        winCenterX: winCenterX,
        winCenterY: winCenterY,
        worldZoom: zoom,
        fps: FPS,
        frameTickTime: frameTickTime,
    });
}

function resize()
{
    App.renderer.resize(window.innerWidth, window.innerHeight);
    winCenterX = window.innerWidth / 2, winCenterY = window.innerHeight / 2;
    App.stage.position.x = winCenterX;
    App.stage.position.y = winCenterY;
}

function gameLoop(delta){
    state(delta);
}

function loadinginfo(loader, resource)
{
    dump(loader.progress.toFixed(0));
}

async function setup()
{
    gameObject.playerSheet = Resources.player.spritesheet;
    gameObject.referencePlayer = new PIXI.AnimatedSprite(gameObject.playerSheet.animations["player/rifle/idle/survivor-idle_rifle"]);
    gameObject.referencePlayer.scale.x = playerScale;
    gameObject.referencePlayer.scale.y = -playerScale;
    loadKeyBindings();
    state = play;
    Ticker.add(delta => gameLoop(delta));
    clientReady();
    setupLoaded = true;

    physics.referencePlayer.body = new p2.Body({
        mass: 100,
        position: [0, 0],
        angle: 0,
    });
    let width = gameObject.referencePlayer.width;
    let height = gameObject.referencePlayer.height;
    physics.referencePlayer.shape = new p2.Box({
        width: width,
        height: height,
    });
    physics.referencePlayer.shape.anchorRatio = {x: 0.237983, y: 0.547403};
    physics.referencePlayer.shape.collisionGroup = 0;
    physics.referencePlayer.shape.collisionMask = 0
    physics.referencePlayer.body.object = "referencePlayer";
    physics.referencePlayer.body.objectID = 0;
    physics.referencePlayer.body.damping = 0;
    physics.referencePlayer.body.centerMass = {x: (width / 2) - (width * physics.referencePlayer.shape.anchorRatio.x), y: (height / 2) - (height * physics.referencePlayer.shape.anchorRatio.y)};
    physics.referencePlayer.body.addShape(physics.referencePlayer.shape, [physics.referencePlayer.body.centerMass.x, physics.referencePlayer.body.centerMass.y], toRad(0));
    physics.world.addBody(physics.referencePlayer.body);
}