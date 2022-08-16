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
<script src="js/pixi-core-6.5.1.min.js"></script>
<script src="js/pixi-filters-4.1.6.js"></script>
<script src="js/pixi-input-1.0.1-min.js"></script>
<script src="js/pixi-layers-1.0.11.umd.js"></script>
<script src="js/pixi-sound-4.2.0.js"></script>
<script src="js/crypto-js.min.js"></script>
<script src="game/misc.js"></script>
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
    const socketIOHost = "<?php echo SOCKET_IO_HOST; ?>";
    const socketIOPort = "<?php echo SOCKET_IO_PORT; ?>";
    let uuid;
    let socket = io("wss://" + socketIOHost + ":" + socketIOPort);
    let mapData = [];

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
        let undefined;
        return x !== undefined;
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

    let maxChunkRenderX = Math.ceil(((winCenterX * zoom) - (gridSize / 2)) / gridSize) + 1;
    let maxChunkRenderY = Math.ceil(((winCenterY * zoom) - (gridSize / 2)) / gridSize) + 1;

    let gameObject = {
        player: {},
        playerSheet: {},
        floor: {},
        wall: {},
        referencePlayer: {},
        worldLayer: new Container(),
        floorLayer: new Container(),
        wallLayer: new Container(),
        playerLayer: new Container(),
    }


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
    gameObject.worldLayer.addChild(gameObject.playerLayer);


    let serverOfflineErrorView = false;



    window.addEventListener('resize', resize);

    window.addEventListener('mousewheel', (ev) => {
        mouseWheel(ev.deltaY);
    });


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
        socket.emit("clientReady", {
            auth: {
                level: AUTH_LEVEL,
                username: AUTH_USERNAME,
                userID: AUTH_USERID,
                ip: AUTH_IP,
                key: AUTH_KEY,
            },
            player: {
                width: gameObject.referencePlayer.width,
                height: gameObject.referencePlayer.height,
            },
            winCenterX: winCenterX,
            winCenterY: winCenterY,
            zoom: zoom,
        });
        setupLoaded = true;
    }

    //document.querySelector('#frame').appendChild(App.view);

    function play(delta) {
        gamedelta = delta;
        frameTickTime = Ticker.elapsedMS;
        FPS = 1000 / frameTickTime;
        let localMousePos = App.renderer.plugins.interaction.mouse.global;
        let worldMousePos = App.stage.toLocal(localMousePos);
        if (isDefined(players))
        {
            for (let id in players)
            {
                if (isDefined(gameObject.player[id]))
                {
                    gameObject.player[id].x = players[id].body.position[0];
                    gameObject.player[id].y = players[id].body.position[1];
                    gameObject.player[id].rotation = players[id].body.angle;
                } else {
                    createPlayer(id);
                }
            }
            if (playerID !== false)
            {
                if (isDefined(gameObject.player[playerID]))
                {
                    App.stage.pivot.x = gameObject.player[playerID].x;
                    App.stage.pivot.y = gameObject.player[playerID].y;
                }
            }
        }
        if (isDefined(players))
        {
            if (isDefined(mapData))
            {
                if (playerID !== false)
                {
                    if (isDefined(players[playerID]))
                    {
                        let playerChunkPos = {x: players[playerID].chunkPos[0], y: players[playerID].chunkPos[1]};
                        let foundTile = [];
                        let foundTileId = [];
                        for (let sy = -maxChunkRenderY; sy <= maxChunkRenderY; sy++)
                        {
                            for (let sx = -maxChunkRenderX; sx <= maxChunkRenderX; sx++)
                            {
                                let filter = [];
                                let tilesFilter = function(obj) {
                                    return obj.chunkPosX === playerChunkPos.x + sx && obj.chunkPosY === playerChunkPos.y + sy;
                                }
                                filter = mapData.filter(tilesFilter);
                                if (filter.length > 0)
                                {
                                    foundTile.push(filter[0]);
                                    foundTileId.push(filter[0].id);
                                }
                            }
                        }

                        if (foundTile.length > 0)
                        {
                            for (let i in foundTile)
                            {
                                let id = foundTile[i].id;
                                let tileType = foundTile[i].tile;
                                if (tileType === "floor")
                                {
                                    if (!isDefined(gameObject.floor[id]))
                                        createFloor(id, {x: foundTile[i].chunkPosX, y: foundTile[i].chunkPosY});
                                }
                                if (tileType === "wall")
                                {
                                    if (!isDefined(gameObject.wall[id]))
                                        createWall(id, {x: foundTile[i].chunkPosX, y: foundTile[i].chunkPosY});
                                }
                            }
                        }


                        let noTilesFilter = function(obj) {
                            return foundTileId.indexOf(obj.id) === -1;
                        }
                        let notFoundFilter = mapData.filter(noTilesFilter);
                        if (notFoundFilter.length > 0)
                        {
                            for (let i in notFoundFilter)
                            {
                                let id = notFoundFilter[i].id;
                                let tileType = notFoundFilter[i].tile;
                                if (tileType === "floor")
                                {
                                    if (isDefined(gameObject.floor[id]))
                                    {
                                        gameObject.floorLayer.removeChild(gameObject.floor[id]);
                                        delete gameObject.floor[id];
                                    }
                                }
                                if (tileType === "wall")
                                {
                                    if (isDefined(gameObject.wall[id]))
                                    {
                                        gameObject.wallLayer.removeChild(gameObject.wall[id]);
                                        delete gameObject.wall[id];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        //dump(mapData);
        socket.emit("updateServer", {
            id: playerID,
            mouse: worldMousePos,
            fps: FPS,
            frameTickTime: frameTickTime,
            winCenterX: winCenterX,
            winCenterY: winCenterY,
            zoom: zoom,
        });
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
            Loader.onProgress.add(loadinginfo);
            Loader.load(setup);
        } else {
            socket.emit("clientReady", {
                auth: {
                    level: AUTH_LEVEL,
                    username: AUTH_USERNAME,
                    userID: AUTH_USERID,
                    ip: AUTH_IP,
                    key: AUTH_KEY,
                },
                player: {
                    width: gameObject.referencePlayer.width,
                    height: gameObject.referencePlayer.height,
                },
                winCenterX: winCenterX,
                winCenterY: winCenterY,
                zoom: zoom,
            });
        }
    });

    socket.on("disconnect", function(msg) {
        dump(msg);
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
        mapData = data.mapData;
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
        gameObject.playerLayer.removeChild(gameObject.player[id]);
        delete gameObject.player[id];
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
            gameObject.player[id] = new PIXI.AnimatedSprite(gameObject.playerSheet.animations["player/rifle/idle/survivor-idle_rifle"]);
            gameObject.player[id].x = players[id].body.position[0];
            gameObject.player[id].y = players[id].body.position[1];
            gameObject.player[id].rotation = players[id].body.angle;
            gameObject.player[id].scale.x = playerScale;
            gameObject.player[id].scale.y = -playerScale;
            gameObject.player[id].uuid = players[id].uuid;
            if (players[id].uuid === uuid)
            {
                playerID = id;
            }
            gameObject.player[id].playerID = players[id].playerID;
            gameObject.playerLayer.addChild(gameObject.player[id]);
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
        gameObject.floor[id].scale.x = gridSize / 1024;
        gameObject.floor[id].scale.y = -gridSize / 1024;
        //let tint = rgbaToIntoColor(rng(128,255),rng(128,255),rng(128,255));
        //gameObject.floor[id].tint = tint;
        gameObject.floorLayer.addChild(gameObject.floor[id]);
    }

    function createWall(id, chunkPos)
    {
        gameObject.wall[id] = new Sprite(Resources.wall.texture);
        let globalPos = calcGlobalPos(chunkPos, gridSize);
        gameObject.wall[id].anchor.x = 0.5;
        gameObject.wall[id].anchor.y = 0.5;
        gameObject.wall[id].x = globalPos.x;
        gameObject.wall[id].y = globalPos.y;
        gameObject.wall[id].scale.x = gridSize / 1024;
        gameObject.wall[id].scale.y = -gridSize / 1024;
        //let tint = rgbaToIntoColor(rng(128,255),rng(128,255),rng(128,255));
        //gameObject.wall[id].tint = tint;
        gameObject.wallLayer.addChild(gameObject.wall[id]);
    }

    function run()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "run",
            id: id,
        });
    }

    function stopRun()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "runStop",
            id: id,
        });
    }

    function up()
    {
        let id = playerID;
        socket.emit("updatePos", {
            func: "up",
            id: id,
        });
        dump("Pos: "+players[playerID].chunkPos[0]+":"+players[playerID].chunkPos[1]);
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
        maxChunkRenderX = Math.ceil(((winCenterX * zoom) - (gridSize / 2)) / gridSize) + 1;
        maxChunkRenderY = Math.ceil(((winCenterY * zoom) - (gridSize / 2)) / gridSize) + 1;
        dump(maxChunkRenderX + " : " + maxChunkRenderY);
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