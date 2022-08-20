<?php
define("THISPAGE", "game");
session_start();
require("lib/init.php");
if (!verifyauthkey($auth,$authusername,$authuserid,$authkey))
{
    $auth = 0;
    $authuserid = 0;
    $authusername = "";
    $authkey = "";
    $authIP = "";
}
if ($auth < $access_levels["Member"])
{
    //$_SESSION["post_Login_redirect"] = "game.php";
    header("Location: https://".FULLWEBPATH.LOGIN_PAGE);
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Zombie SHooter Multiplayer Test</title>
    <style>
        body {
            background: #000000;
            margin:0;
            padding:0;
            overflow:hidden;
            text-align: center;
        }

        canvas {
            display:block;
        }

        #frame {
        }
        .offline {
            color: red;
            width: 100%;
            top: 100px;
            font-size: 30px;
            font-weight: bold;
            position: relative;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="manifest" href="site.webmanifest">
    <link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <title>Zombie Top Down Shooter</title>
    <link rel="stylesheet" href="css/style.css" type="text/css" />
</head>
<body>
<span class="offline" style="display: none">Sorry server is offline.</span>
<div id="frame"></div>
<script src="js/socket.io.min.js"></script>
<script src="js/jquery.min.js"></script>
<script src="js/p2.min.js"></script>
<script src="js/pixi-core-6.5.1.min.js"></script>
<script src="js/pixi-filters-4.1.6.js"></script>
<script src="js/pixi-input-1.0.1-min.js"></script>
<script src="js/pixi-layers-1.0.11.umd.js"></script>
<script src="js/pixi-sound-4.2.0.js"></script>
<script src="js/crypto-js.min.js"></script>
<script src="game/misc.js"></script>
<script src="game/drawFunc.js"></script>
<script src="game/keyBindings.js"></script>
<script>
    const playerScale = <?php echo $settings["playerScale"]; ?>;
    const realWorldScale = 0.00761461306 / playerScale; // meters per pixel
    const gridSize = <?php echo $settings["gridSize"]; ?> * playerScale;
    let mapSize = {
        x: <?php echo $settings["mapWidth"]; ?>,
        y: <?php echo $settings["mapHeight"]; ?>,
    };
    const AUTH_LEVEL = <?php echo $auth; ?>;
    const AUTH_USERNAME = "<?php echo $authusername; ?>";
    const AUTH_USERID = <?php echo $authuserid; ?>;
    const AUTH_KEY = "<?php echo $authkey; ?>";
    const AUTH_IP = "<?php echo $authIP; ?>";
    const DISCORD_AVATAR = "<?php echo $discordAvatar; ?>";
    const socketIOHost = "<?php echo SOCKET_IO_HOST; ?>";
    const socketIOPort = "<?php echo SOCKET_IO_PORT; ?>";
    let uuid;
    let debug = false;
    let socket = io("wss://" + socketIOHost + ":" + socketIOPort);
    let mapData = {};

    const discordUsernameHudTextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: 'bold',
        fill: ['#ffffff', '#cccccc'], // gradient
        stroke: '#666666',
        strokeThickness: 2,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 2,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 3,
        wordWrap: false,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    const debugHudTextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: 'bold',
        fill: ['#0bbbc6', '#0aadb7'], // gradient
        stroke: '#088d96',
        strokeThickness: 1,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 1,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 3,
        wordWrap: false,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    const debugWallHudTextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: 'bold',
        fill: ['#0761c6', '#0761c6'], // gradient
        stroke: '#0761c6',
        strokeThickness: 1,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 1,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 3,
        wordWrap: false,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    const debugFloorHudTextStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: 'bold',
        fill: ['#6ac618', '#6ac618'], // gradient
        stroke: '#6ac618',
        strokeThickness: 1,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 1,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 3,
        wordWrap: false,
        wordWrapWidth: 440,
        lineJoin: 'round',
    });

    let sha256 = function(input)
    {
        return crypto.createHash('sha256').update(input).digest('hex');
    }

    function dump(input)
    {
        console.log(input);
    }

    function now(last = 0)
    {
        return window.performance.now() - last;
    }

    function isDefined(x)
    {
        return typeof x !== "undefined";
    }

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
    let winCenterX = window.innerWidth / 2;
    let winCenterY = window.innerHeight / 2;
    let playerID = false;
    let setupLoaded = false;
    let zoomMulti = 1.5, minZoom = 0, maxZoom = 12; // < 0 = zoom in
    let zoomStep = 0;
    let zoom = pow(zoomMulti, zoomStep);
    let localMousePos, worldMousePos;

    let maxChunkRenderX = Math.ceil(((winCenterX * zoom) - (gridSize / 2)) / gridSize) + 2;
    let maxChunkRenderY = Math.ceil(((winCenterY * zoom) - (gridSize / 2)) / gridSize) + 2;

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
        floorLayer: new Container(),
        wallLayer: new Container(),
        shadowOverlayLayer: new Container(),
        playerLayer: new Container(),
        debugWorldHudLayer: new Container(),
        debugWallHudLayer: new Container(),
        debugFloorHudLayer: new Container(),
        debugPlayerHudLayer: {},
        wallGrid: {},
        floorGrid: {},
    }

    let world = new p2.World({
        gravity : [0,0],
        frictionGravity: 10,
        //islandSplit : true,
    });

    //world.sleepMode = p2.World.ISLAND_SLEEPING;
    world.solver.iterations = 20;
    world.solver.tolerance = 0.1;
    //world.setGlobalStiffness(1000000000000);

    const FLAG = {
        WALL: 1,
        PLAYER: 2,
        BULLET: 4,
        BULLET_MOVEMENT: 8,
        ZOMBIE: 16,
        AMMO_CLIP: 32,
        VISION_GOGGLES: 64,
    };

    let physics = {
        player: {
            body: {},
            shape: {},
        },
        wall: {
            body: {},
            shape: {},
        }
    };

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
    gameObject.worldLayer.addChild(gameObject.floorLayer);
    gameObject.worldLayer.addChild(gameObject.wallLayer);
    gameObject.worldLayer.addChild(gameObject.shadowOverlayLayer);
    gameObject.worldLayer.addChild(gameObject.playerLayer);
    gameObject.worldLayer.addChild(gameObject.debugWorldHudLayer);
    gameObject.debugWorldHudLayer.addChild(gameObject.debugFloorHudLayer);
    gameObject.debugWorldHudLayer.addChild(gameObject.debugWallHudLayer);


    let serverOfflineErrorView = false;

    localMousePos = App.renderer.plugins.interaction.mouse.global;
    worldMousePos = App.stage.toLocal(localMousePos);


    window.addEventListener('resize', resize);

    window.addEventListener('mousewheel', (ev) => {
        mouseWheel(ev.deltaY);
    });

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
            avatar: DISCORD_AVATAR,
            player: {
                width: gameObject.referencePlayer.width,
                height: gameObject.referencePlayer.height,
            },
            winCenterX: winCenterX,
            winCenterY: winCenterY,
            zoom: zoom,
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
    }

    //document.querySelector('#frame').appendChild(App.view);

    function play(delta) {
        gamedelta = delta;
        frameTickTime = Ticker.elapsedMS;
        FPS = 1000 / frameTickTime;
        localMousePos = App.renderer.plugins.interaction.mouse.global;
        worldMousePos = App.stage.toLocal(localMousePos);
        if (isDefined(players))
        {
            for (let id in players)
            {
                id = parseInt(id);
                if (isDefined(gameObject.player[id]))
                {
                    //physics.player.body[id].velocity = players[id].velocity;
                    let avatarDim = {x: gameObject.playerDiscordAvatar[id].width, y: gameObject.playerDiscordAvatar[id].height};
                    let playerDim = {x: gameObject.player[id].width, y: gameObject.player[id].height};
                    gameObject.player[id].x = players[id].body.position[0];
                    gameObject.player[id].y = players[id].body.position[1];
                    gameObject.player[id].rotation = players[id].body.angle;
                    gameObject.playerDiscordAvatar[id].x = players[id].body.position[0];
                    gameObject.playerDiscordAvatar[id].y = (players[id].body.angle >= 0 && toDeg(players[id].body.angle) <= 180) ? players[id].body.position[1] + 10 + (playerDim.y / 2) + (avatarDim.y / 2) + Math.abs(Math.sin(players[id].body.angle) * (playerDim.x - avatarDim.y)) : players[id].body.position[1] + 10 + (playerDim.y / 2) + (avatarDim.y / 2);
                    gameObject.playerDiscordUsername[id].x = gameObject.playerDiscordAvatar[id].x + (avatarDim.x / 2) + 10;
                    gameObject.playerDiscordUsername[id].y = gameObject.playerDiscordAvatar[id].y;
                    drawText(gameObject.debugPlayerHud[id], "FPS: "+FPS.toFixed(1)+" "+players[id].chunkPos[0]+" : "+players[id].chunkPos[1]+" ("+toDeg(players[id].body.angle).toFixed(0)+")", false, true);
                    gameObject.debugPlayerHudLayer[id].position = gameObject.player[id].position;
                    if (id === playerID)
                    {
                        gameObject.playerDiscordAvatar[id].visible = false;
                        gameObject.playerDiscordUsername[id].visible = false;
                    } else {
                        gameObject.playerDiscordAvatar[id].visible = true;
                        gameObject.playerDiscordUsername[id].visible = true;
                    }
                    if (debug)
                        gameObject.debugPlayerHudLayer[id].visible = true;
                    else
                        gameObject.debugPlayerHudLayer[id].visible = false;
                } else {
                    createPlayer(id);
                }
            }
            if (playerID !== false)
            {
                if (isDefined(gameObject.player[playerID]))
                {
                    App.stage.pivot.x = players[playerID].body.position[0];
                    App.stage.pivot.y = players[playerID].body.position[1];
                }
                if (isDefined(mapData))
                {
                    if (isDefined(players[playerID]))
                    {
                        //dump(objLength(mapData, true)+ " " + (objLength(gameObject.floor, true) + objLength(gameObject.wall, true)) + " " + objLength(gameObject.shadowOverlay, true));
                        for (let xyKey in mapData)
                        {
                            mapData[xyKey].chunkRendered = false;
                        }

                        let playerChunkPos = {x: players[playerID].chunkPos[0], y: players[playerID].chunkPos[1]};
                        let foundTile = [];
                        for (let sy = -maxChunkRenderY; sy <= maxChunkRenderY; sy++)
                        {
                            for (let sx = -maxChunkRenderX; sx <= maxChunkRenderX; sx++)
                            {
                                let x = playerChunkPos.x + sx;
                                let y = playerChunkPos.y + sy;
                                let xyKey = getXYKey({x: x, y: y});
                                if (isDefined(mapData[xyKey]))
                                {
                                    let tile = mapData[xyKey];
                                    foundTile.push(tile);
                                    if (!isDefined(gameObject.shadowOverlay[xyKey]))
                                    {
                                        addShadow({x: x, y: y});
                                    }
                                }
                            }
                        }

                        if (foundTile.length > 0)
                        {
                            for (let i in foundTile)
                            {
                                mapData[foundTile[i].xyKey].chunkRendered = true;
                                let id = foundTile[i].xyKey;
                                let tileType = foundTile[i].tile;
                                let pos = {x: foundTile[i].chunkPosX, y: foundTile[i].chunkPosY};
                                if (tileType === "floor")
                                {
                                    if (!isDefined(gameObject.floor[id]))
                                    {
                                        if (isDefined(gameObject.wall[id]))
                                        {
                                            deleteWall(id);
                                            deleteShadow(id);
                                            for (let yy = -1; yy <= 1; yy++)
                                            {
                                                for (let xx = -1; xx <= 1; xx++)
                                                {
                                                    let newPos = {x: pos.x + xx, y: pos.y + yy};
                                                    deleteShadow(getXYKey(newPos));
                                                    addShadow(newPos);
                                                }
                                            }
                                        }
                                        createFloor(id, pos);
                                    }
                                }
                                if (tileType === "wall")
                                {
                                    if (!isDefined(gameObject.wall[id]))
                                    {
                                        if (isDefined(gameObject.floor[id]))
                                        {
                                            deleteFloor(id);
                                            deleteShadow(id);
                                            for (let yy = -1; yy <= 1; yy++)
                                            {
                                                for (let xx = -1; xx <= 1; xx++)
                                                {
                                                    let newPos = {x: pos.x + xx, y: pos.y + yy};
                                                    deleteShadow(getXYKey(newPos));
                                                    addShadow(newPos);
                                                }
                                            }
                                        }
                                        createWall(id, pos);
                                    }
                                }
                            }
                        }
                        let deRenderTile = [];
                        for (let i in mapData)
                        {
                            if (!mapData[i].chunkRendered)
                            {
                                let id = i;
                                let tileType = mapData[i].tile;

                                if (tileType === "floor")
                                {
                                    if (isDefined(gameObject.floor[id]))
                                    {
                                        deleteFloor(id);
                                        deleteShadow(id);
                                        mapData[i].chunkLoaded = false;
                                        deRenderTile.push(i);
                                    }
                                }
                                if (tileType === "wall")
                                {
                                    if (isDefined(gameObject.wall[id]))
                                    {
                                        deleteWall(id);
                                        deleteShadow(id);
                                        mapData[i].chunkLoaded = false;
                                        deRenderTile.push(i);
                                    }
                                }
                            }
                        }
                        socket.emit("deRenderMap", {
                            deRenderTile: deRenderTile,
                            playerID: playerID,
                        });
                    }
                }
                socket.emit("updateServer", {
                    id: playerID,
                    mouse: worldMousePos,
                    fps: FPS,
                    frameTickTime: frameTickTime,
                    winCenterX: winCenterX,
                    winCenterY: winCenterY,
                    worldZoom: zoom,
                });
            }
        }
        if (debug)
        {
            gameObject.debugFloorHudLayer.visible = true;
            gameObject.debugWallHudLayer.visible = true;
        } else {
            gameObject.debugFloorHudLayer.visible = false;
            gameObject.debugWallHudLayer.visible = false;
        }
    }

    socket.on("connect_error", function (msg) {
        if (!socket.connected && !serverOfflineErrorView)
        {
            serverOfflineErrorView = true;
            //document.querySelector('#frame').removeChild(App.view);
            document.querySelector(".offline").style.display = "inline-block"
            //setTimeout(function() {
                //alert("Sorry server is offline.");
            //}, 500);
        }
    });

    socket.on("connect", function() {
        document.querySelector('#frame').appendChild(App.view);
        document.querySelector(".offline").style.display = "none"

        uuid = CryptoJS.SHA256(socket.id).toString();


        if (!setupLoaded)
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
            Loader.onProgress.add(loadinginfo);
            Loader.load(setup);
        } else {
            //clientReady();
        }
    });

    socket.on("disconnect", function(msg) {
        dump(msg);
        if (isDefined(gameObject.debugPlayerHud))
        {
            for (let id in gameObject.debugPlayerHud)
            {
                gameObject.debugPlayerHudLayer[id].removeChild(gameObject.debugPlayerHud[id]);
                delete gameObject.debugPlayerHud[id];
            }
        }
        if (isDefined(gameObject.debugPlayerHudLayer))
        {
            for (let id in gameObject.debugPlayerHudLayer)
            {
                gameObject.playerLayer.removeChild(gameObject.debugPlayerHudLayer[id]);
                delete gameObject.debugPlayerHudLayer[id];
            }
        }
        if (isDefined(gameObject.playerDiscordUsername))
        {
            for (let id in gameObject.playerDiscordUsername)
            {
                gameObject.playerLayer.removeChild(gameObject.playerDiscordUsername[id]);
                delete gameObject.playerDiscordUsername[id];
            }
        }
        if (isDefined(gameObject.playerDiscordAvatar))
        {
            for (let id in gameObject.playerDiscordAvatar)
            {
                gameObject.playerLayer.removeChild(gameObject.playerDiscordAvatar[id]);
                delete gameObject.playerDiscordAvatar[id];
            }
        }
        if (isDefined(gameObject.player))
        {
            for (let id in gameObject.player)
            {
                gameObject.playerLayer.removeChild(gameObject.player[id]);
                delete players[gameObject.player[id].playerID];
                delete gameObject.player[id];
            }
        }
        if (isDefined(gameObject.floor))
        {
            for (let id in gameObject.floor)
            {
                gameObject.floorLayer.removeChild(gameObject.floor[id]);
                delete gameObject.floor[id];
            }
        }
        if (isDefined(gameObject.wall))
        {
            for (let id in gameObject.wall)
            {
                gameObject.wallLayer.removeChild(gameObject.wall[id]);
                delete gameObject.wall[id];
            }
        }
        document.querySelector('#frame').removeChild(App.view);
        document.querySelector(".offline").style.display = "inline-block"

        //dump(App.stage);
        //dump(gameObject.player);
        //dump(players);
    });

    socket.on('newPlayer', function(data) {
        let playerData = data.playerData;
        let id = playerData.playerID;
        if (!isDefined(gameObject.player[id]))
        {
            players = data.players;
            createPlayer(id);
        }
    });

    socket.on('maxInstances', function(data) {
        if (data === uuid)
        {
            document.querySelector('#frame').removeChild(App.view);
            setTimeout(function() {
                alert("Sorry you have exceeded the allowable concurrent instances.");
            }, 500);
        }
    });

    socket.on('userDisconnect', function(data) {
        let id = data.playerID;
        gameObject.debugPlayerHudLayer[id].removeChild(gameObject.debugPlayerHud[id]);
        gameObject.playerLayer.removeChild(gameObject.debugPlayerHudLayer[id]);
        gameObject.playerLayer.removeChild(gameObject.player[id]);
        gameObject.playerLayer.removeChild(gameObject.playerDiscordUsername[id]);
        gameObject.playerLayer.removeChild(gameObject.playerDiscordAvatar[id]);
        delete gameObject.player[id];
        delete gameObject.playerDiscordUsername[id];
        delete gameObject.playerDiscordAvatar[id];
        delete gameObject.debugPlayerHudLayer[id];
        delete gameObject.debugPlayerHud[id];
        players = data.players;
    });

    socket.on('serverUpdate', function(data) {
        mapData = data.mapData;
        players = data.players;
    });

    socket.on('serverDump', function(data) {
        dump("###################### DUMP -- Zombie-Server -- DUMP ######################")
        dump(JSON.parse(data));
        dump("###################### DUMP -- Zombie-Server -- DUMP ######################")
    });

    function createPlayer(id)
    {
        if (!isDefined(gameObject.player[id]))
        {
            //5459
            let avatar = players[id].avatar;
            gameObject.playerDiscordAvatar[id] = new Sprite.from(avatar);
            gameObject.playerDiscordAvatar[id].anchor.x = 0.5;
            gameObject.playerDiscordAvatar[id].anchor.y = 0.5;
            gameObject.playerDiscordAvatar[id].scale.x = 0.35;
            gameObject.playerDiscordAvatar[id].scale.y = -0.35;
            gameObject.playerDiscordUsername[id] = new Text(players[id].authUsername, discordUsernameHudTextStyle);
            gameObject.playerDiscordUsername[id].anchor.x = 0;
            gameObject.playerDiscordUsername[id].anchor.y = 0.5;
            gameObject.playerDiscordUsername[id].scale.x = 1;
            gameObject.playerDiscordUsername[id].scale.y = -1;

            gameObject.player[id] = new PIXI.AnimatedSprite(gameObject.playerSheet.animations["player/rifle/idle/survivor-idle_rifle"]);
            gameObject.player[id].x = players[id].body.position[0];
            gameObject.player[id].y = players[id].body.position[1];
            gameObject.player[id].rotation = players[id].body.angle;
            gameObject.player[id].scale.x = playerScale;
            gameObject.player[id].scale.y = -playerScale;
            gameObject.player[id].uuid = players[id].uuid;
            gameObject.debugPlayerHudLayer[id] = new Container();

            gameObject.debugPlayerHud[id] = new Text("", debugHudTextStyle);
            gameObject.debugPlayerHud[id].scale.x = 1;
            gameObject.debugPlayerHud[id].scale.y = -1;
            gameObject.debugPlayerHud[id].anchor.x = 0.5;
            gameObject.debugPlayerHud[id].anchor.y = 0.5;
            gameObject.debugPlayerHud[id].x = 0;
            gameObject.debugPlayerHud[id].y = 40;
            gameObject.debugPlayerHudLayer[id].addChild(gameObject.debugPlayerHud[id]);
            gameObject.debugPlayerHudLayer[id].visible = false;

            if (players[id].uuid === uuid)
            {
                playerID = id;
            }
            gameObject.player[id].playerID = players[id].playerID;
            gameObject.playerLayer.addChild(gameObject.player[id]);
            gameObject.playerLayer.addChild(gameObject.playerDiscordAvatar[id]);
            gameObject.playerLayer.addChild(gameObject.playerDiscordUsername[id]);
            gameObject.playerLayer.addChild(gameObject.debugPlayerHudLayer[id]);


            /*
            physics.player.body[id] = new p2.Body({
                mass: 100,
                position: [players[id].body.position[0], players[id].body.position[1]],
                angle: players[id].body.angle,
            });
            let width = gameObject.player[id].width;
            let height = gameObject.player[id].height;
            physics.player.shape[id] = new p2.Box({
                width: width,
                height: height,
            });
            physics.player.shape[id].anchorRatio = {x: 0.237983, y: 0.547403};
            physics.player.shape[id].collisionGroup = FLAG.PLAYER;
            physics.player.shape[id].collisionMask = 0;
            physics.player.body[id].object = "player";
            physics.player.body[id].objectID = id;
            physics.player.body[id].damping = 0;
            physics.player.body[id].centerMass = {x: (width / 2) - (width * physics.player.shape[id].anchorRatio.x), y: (height / 2) - (height * physics.player.shape[id].anchorRatio.y)};
            physics.player.body[id].addShape(physics.player.shape[id], [physics.player.body[id].centerMass.x, physics.player.body[id].centerMass.y], toRad(0));
            world.addBody(physics.player.body[id]);
            */
        }
    }

    function createFloor(id, chunkPos)
    {
        gameObject.floor[id] = new Sprite(Resources.floor.texture);
        let globalPos = calcGlobalPos(chunkPos, gridSize);
        gameObject.floor[id].anchor.x = 0.5;
        gameObject.floor[id].anchor.y = 0.5;
        gameObject.floor[id].x = globalPos.x;
        gameObject.floor[id].y = globalPos.y;
        gameObject.floor[id].chunkPos = {x: chunkPos.x, y: chunkPos.y};
        gameObject.floor[id].scale.x = gridSize / 1024;
        gameObject.floor[id].scale.y = -gridSize / 1024;
        //let tint = rgbaToIntoColor(rng(128,255),rng(128,255),rng(128,255));
        //gameObject.floor[id].tint = tint;
        gameObject.debugFloorHud[id] = new Text(chunkPos.x + " : " + chunkPos.y, debugFloorHudTextStyle);
        gameObject.debugFloorHud[id].scale.x = 1;
        gameObject.debugFloorHud[id].scale.y = -1;
        gameObject.debugFloorHud[id].anchor.x = 0.5;
        gameObject.debugFloorHud[id].anchor.y = 0.5;
        gameObject.debugFloorHud[id].x = globalPos.x;
        gameObject.debugFloorHud[id].y = globalPos.y;
        gameObject.floorGrid[id] = new Graphics();
        drawRect(gameObject.floorGrid[id], globalPos.x - gridSize / 2, globalPos.y - gridSize / 2, gridSize, gridSize, 0x00ff00, 1, 0.5, 0x00ff00, 0.3);
        gameObject.debugFloorHudLayer.addChild(gameObject.debugFloorHud[id]);
        gameObject.debugFloorHudLayer.addChild(gameObject.floorGrid[id]);
        gameObject.floorLayer.addChild(gameObject.floor[id]);
        gameObject.debugFloorHudLayer.visible = false;
    }

    function createWall(id, chunkPos)
    {
        gameObject.wall[id] = new Sprite(Resources.wall.texture);
        let globalPos = calcGlobalPos(chunkPos, gridSize);
        gameObject.wall[id].anchor.x = 0.5;
        gameObject.wall[id].anchor.y = 0.5;
        gameObject.wall[id].x = globalPos.x;
        gameObject.wall[id].y = globalPos.y;
        gameObject.wall[id].chunkPos = {x: chunkPos.x, y: chunkPos.y};
        gameObject.wall[id].scale.x = gridSize / 1024;
        gameObject.wall[id].scale.y = -gridSize / 1024;
        //let tint = rgbaToIntoColor(rng(128,255),rng(128,255),rng(128,255));
        //gameObject.wall[id].tint = tint;
        gameObject.debugWallHud[id] = new Text(chunkPos.x + " : " + chunkPos.y, debugWallHudTextStyle);
        gameObject.debugWallHud[id].scale.x = 1;
        gameObject.debugWallHud[id].scale.y = -1;
        gameObject.debugWallHud[id].anchor.x = 0.5;
        gameObject.debugWallHud[id].anchor.y = 0.5;
        gameObject.debugWallHud[id].x = globalPos.x;
        gameObject.debugWallHud[id].y = globalPos.y;
        gameObject.wallGrid[id] = new Graphics();
        drawRect(gameObject.wallGrid[id], globalPos.x - gridSize / 2, globalPos.y - gridSize / 2, gridSize, gridSize, 0x0000ff, 1, 0.5, 0x0000ff, 0.3);
        gameObject.debugWallHudLayer.addChild(gameObject.debugWallHud[id]);
        gameObject.debugWallHudLayer.addChild(gameObject.wallGrid[id]);
        gameObject.wallLayer.addChild(gameObject.wall[id]);
        gameObject.debugWallHudLayer.visible = false;
    }

    function createShadowOverlay(id, chunkPos, type, rotation)
    {
        if (!isDefined(gameObject.shadowOverlay[id]))
        {
            //dump("create shadow: "+id);
            gameObject.shadowOverlay[id] = new Sprite(Resources[type + "Overlay"].texture);
            let globalPos = calcGlobalPos(chunkPos, gridSize);
            gameObject.shadowOverlay[id].anchor.x = 0.5;
            gameObject.shadowOverlay[id].anchor.y = 0.5;
            gameObject.shadowOverlay[id].x = globalPos.x;
            gameObject.shadowOverlay[id].y = globalPos.y;
            gameObject.shadowOverlay[id].rotation = toRad(rotation);
            gameObject.shadowOverlay[id].chunkPos = {x: chunkPos.x, y: chunkPos.y};
            gameObject.shadowOverlay[id].scale.x = (gridSize / 1024) / 4;
            gameObject.shadowOverlay[id].scale.y = -(gridSize / 1024) / 4;
            gameObject.shadowOverlayLayer.addChild(gameObject.shadowOverlay[id]);
        }
    }

    function addShadow(pos)
    {
        let shadow = false;
        let rotation = false;
        let x = pos.x;
        let y = pos.y;
        if (!isDefined(mapData[getXYKey({x: x, y: y})]))
            return;
        if (mapData[getXYKey({x: x, y: y})].tile !== "floor")
            return;
        let xyKey = getXYKey({x: x, y: y});
        let tiles = [];
        /*
        [ 0 ] [ 1 ] [ 2 ]
        [ 3 ] [ 4 ] [ 5 ]
        [ 6 ] [ 7 ] [ 8 ]
        */
        for (let yy = 1; yy >= -1; yy--)
        {
            for (let xx = -1; xx <= 1; xx++)
            {
                let tile = mapData[getXYKey({x: x + xx, y: y + yy})];
                if (!isDefined(tile))
                    return;
                tiles.push({
                    type: tile.tile,
                    is: function(check) {
                        if (check === "wall" && this.type === "wall")
                            return true;
                        if (check === "wall" && this.type === "floor")
                            return false;
                        if (check === "floor" && this.type === "floor")
                            return true;
                        if (check === "floor" && this.type === "wall")
                            return false;
                        if (check === "any")
                            return true;
                    },
                });
            }
        }
        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "hollowBox";
            rotation = 0;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "crossroad";
            rotation = 0;
        }

        if (
            tiles[0].is("any") && tiles[1].is("floor") && tiles[2].is("any") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "deadEnd";
            rotation = 0; // no change / image facing south like a U shape
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "deadEnd";
            rotation = 90; // 90 deg anti-clockwise
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("any") && tiles[7].is("floor") && tiles[8].is("any")
        )
        {
            shadow = "deadEnd";
            rotation = 180;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "deadEnd";
            rotation = 270;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "floorCorner";
            rotation = 0;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "floorCorner";
            rotation = 90;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "floorCorner";
            rotation = 180;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "floorCorner";
            rotation = 270;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "side";
            rotation = 0;
        }

        if (
            tiles[0].is("any") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "side";
            rotation = 90;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "side";
            rotation = 180;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("any")
        )
        {
            shadow = "side";
            rotation = 270;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("any")
        )
        {
            shadow = "sideCornerA";
            rotation = 0;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "sideCornerA";
            rotation = 90;
        }

        if (
            tiles[0].is("any") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "sideCornerA";
            rotation = 180;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "sideCornerA";
            rotation = 270;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "sideCornerB";
            rotation = 0;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("any")
        )
        {
            shadow = "sideCornerB";
            rotation = 90;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "sideCornerB";
            rotation = 180;
        }

        if (
            tiles[0].is("any") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "sideCornerB";
            rotation = 270;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "straight";
            rotation = 0;
        }

        if (
            tiles[0].is("any") && tiles[1].is("floor") && tiles[2].is("any") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("any") && tiles[7].is("floor") && tiles[8].is("any")
        )
        {
            shadow = "straight";
            rotation = 90;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "tJunc";
            rotation = 0;
        }

        if (
            tiles[0].is("any") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "tJunc";
            rotation = 90;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "tJunc";
            rotation = 180;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("any")
        )
        {
            shadow = "tJunc";
            rotation = 270;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "turn";
            rotation = 0;
        }

        if (
            tiles[0].is("any") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "turn";
            rotation = 90;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "turn";
            rotation = 180;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("any")
        )
        {
            shadow = "turn";
            rotation = 270;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "wallCorner";
            rotation = 0;
        }

        if (
            tiles[0].is("any") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("wall") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "wallCorner";
            rotation = 90;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("any") && tiles[7].is("wall") && tiles[8].is("any")
        )
        {
            shadow = "wallCorner";
            rotation = 180;
        }

        if (
            tiles[0].is("any") && tiles[1].is("wall") && tiles[2].is("any") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("wall") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("any")
        )
        {
            shadow = "wallCorner";
            rotation = 270;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            dump("yer");
            shadow = "floorOpeningA";
            rotation = 0;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "floorOpeningA";
            rotation = 90;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "floorOpeningA";
            rotation = 180;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "floorOpeningA";
            rotation = 270;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("floor")
        )
        {
            shadow = "floorOpeningB";
            rotation = 0;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("floor") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "floorOpeningB";
            rotation = 90;
        }

        if (
            tiles[0].is("floor") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("wall") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "floorOpeningB";
            rotation = 180;
        }

        if (
            tiles[0].is("wall") && tiles[1].is("floor") && tiles[2].is("wall") &&
            tiles[3].is("floor") && tiles[4].is("floor") && tiles[5].is("floor") &&
            tiles[6].is("floor") && tiles[7].is("floor") && tiles[8].is("wall")
        )
        {
            shadow = "floorOpeningB";
            rotation = 270;
        }


        if (shadow !== false && rotation !== false)
        {
            createShadowOverlay(xyKey, pos, shadow, rotation);
        }
    }

    function deleteFloor(id)
    {
        //dump("delete floor: "+id);
        gameObject.floorLayer.removeChild(gameObject.floor[id]);
        gameObject.debugFloorHudLayer.removeChild(gameObject.debugFloorHud[id]);
        gameObject.debugFloorHudLayer.removeChild(gameObject.floorGrid[id]);
        delete gameObject.floor[id];
        delete gameObject.debugFloorHud[id];
        delete gameObject.floorGrid[id];
    }

    function deleteWall(id)
    {
        //dump("delete wall: "+id);
        gameObject.wallLayer.removeChild(gameObject.wall[id]);
        gameObject.debugWallHudLayer.removeChild(gameObject.debugWallHud[id]);
        gameObject.debugWallHudLayer.removeChild(gameObject.wallGrid[id]);
        delete gameObject.wall[id];
        delete gameObject.debugWallHud[id];
        delete gameObject.wallGrid[id];
    }

    function deleteShadow(id)
    {
        //dump("delete shadow: "+id);
        gameObject.shadowOverlayLayer.removeChild(gameObject.shadowOverlay[id]);
        delete gameObject.shadowOverlay[id];
    }

    function deleteShadows()
    {
        if (objLength(gameObject.shadowOverlay, true) > 0)
        {
            for (let id in gameObject.shadowOverlay)
            {
                //dump("delete shadow: "+id);
                gameObject.shadowOverlayLayer.removeChild(gameObject.shadowOverlay[id]);
                delete gameObject.shadowOverlay[id];
            }
        }
    }

    function run()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "run",
            id: id,
            mouse: worldMousePos,
            fps: FPS,
            frameTickTime: frameTickTime,
            winCenterX: winCenterX,
            winCenterY: winCenterY,
            worldZoom: zoom,
        });
    }

    function stopRun()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "runStop",
            id: id,
            mouse: worldMousePos,
            fps: FPS,
            frameTickTime: frameTickTime,
            winCenterX: winCenterX,
            winCenterY: winCenterY,
            worldZoom: zoom,
        });
    }

    function up()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "up",
            id: id,
        });
    }

    function down()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "down",
            id: id,
        });
    }

    function left()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "left",
            id: id,
        });
    }

    function right()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "right",
            id: id,
        });
    }

    function notUp()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "upStop",
            id: id,
        });
    }

    function notDown()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "downStop",
            id: id,
        });
    }

    function notLeft()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "leftStop",
            id: id,
        });
    }

    function notRight()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "rightStop",
            id: id,
        });
    }

    function zoomCommon()
    {
        zoom = pow(zoomMulti, zoomStep);
        App.stage.scale.x = 1 / zoom;
        App.stage.scale.y = 1 / -zoom;
        //maxChunkRenderX = Math.ceil(((winCenterX * zoom) - (gridSize / 2)) / gridSize) + 2;
        //maxChunkRenderY = Math.ceil(((winCenterY * zoom) - (gridSize / 2)) / gridSize) + 2;
        //dump(maxChunkRenderX + " : " + maxChunkRenderY);
    }

    function zoomIn()
    {
        if (zoomStep > minZoom)
        {
            zoomStep--;
            zoomCommon();
            dump("zoom in: "+zoom+"x ("+zoomStep+")");
        }
    }

    function zoomOut()
    {
        if (zoomStep < maxZoom)
        {
            zoomStep++;
            zoomCommon();
            dump("zoom out: "+zoom+"x ("+zoomStep+")");
        }
    }

    function mouseWheel(scroll)
    {
        // +scroll = down, -scroll = up
        if (scroll < 0)
        {
            zoomIn();
        } else {
            zoomOut();
        }
    }

    function toggleDebug()
    {
        debug = !debug;
    }

    function dofunction(funcstr, param = [])
    {
        let func = window[funcstr];
        if (typeof func === "function")
            func.apply(null, param);
    }

    function loadKeyBindings()
    {
        /*
        var fnstring = "runMe";
        var fnparams = [1, 2, 3];

        var fn = window[fnstring];

        if (typeof fn === "function") fn.apply(null, fnparams);
        */
        let key = [];

        for (let k in keybindings)
        {
            let enabled = keybindings[k].enabled;
            key[k] = keyboard(keybindings[k].code, keybindings[k].key);
            let fn_down = keybindings[k].function.down;
            let fn_up = keybindings[k].function.up;
            let holdrepeat = keybindings[k].function.holdrepeat;
            let params_down = keybindings[k].function.params_down;
            let params_up = keybindings[k].function.params_up;
            key[k].autorepeat = holdrepeat;
            key[k].params_down = params_down;
            key[k].params_up = params_up;
            key[k].press = () => {
                if (enabled)
                    dofunction(fn_down, params_down);
            };
            key[k].release = () => {
                if (enabled)
                    dofunction(fn_up, params_up);
            };
        }
    }

    function keyboard(keyCode, keyVal)
    {
        var key = {};
        key.code = keyCode;
        key.autorepeat = false;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        key.val = keyVal;
        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press || key.autorepeat)
                {
                    key.press();
                    key.isDown = true;
                    key.isUp = false;
                }
            }
            if (press)
            {
                press = false;
            }
            event.preventDefault();
        };

        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release || key.autorepeat)
                {
                    key.release();
                    key.isDown = false;
                    key.isUp = true;
                }
            }
            press = true;
            event.preventDefault();
        };

        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }


</script>
</body>
</html>