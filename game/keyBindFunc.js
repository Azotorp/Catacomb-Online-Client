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
