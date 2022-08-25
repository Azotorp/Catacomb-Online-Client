function run()
{
    let id = playerID;
    let func = "run";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function stopRun()
{
    let id = playerID;
    let func = "runStop";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function tipToe()
{
    let id = playerID;
    let func = "tipToe";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function stopTipToe()
{
    let id = playerID;
    let func = "tipToeStop";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function up()
{
    let id = playerID;
    let func = "up";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function down()
{
    let id = playerID;
    let func = "down";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function left()
{
    let id = playerID;
    let func = "left";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function right()
{
    let id = playerID;
    let func = "right";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function notUp()
{
    let id = playerID;
    let func = "upStop";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function notDown()
{
    let id = playerID;
    let func = "downStop";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function notLeft()
{
    let id = playerID;
    let func = "leftStop";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function notRight()
{
    let id = playerID;
    let func = "rightStop";
    socket.emit("updatePos", {
        id: id,
        func: func,
    });
    processMovementCmd(id, func);
}

function processMovementCmd(id, func)
{
    if (func === "run")
    {
        if (players[id].isTipToe)
            players[id].isTipToe = false;
        players[id].isRunning = true;
    }
    if (func === "runStop")
    {
        players[id].isRunning = false;
    }
    if (func === "tipToe")
    {
        if (players[id].isRunning)
            players[id].isRunning = false;
        players[id].isTipToe = true;
    }
    if (func === "tipToeStop")
    {
        players[id].isTipToe = false;
    }
    if (func === "upStop")
    {
        players[id].forwards = false;
        players[id].backwards = false;
    }
    if (func === "downStop")
    {
        players[id].forwards = false;
        players[id].backwards = false;
    }
    if (func === "leftStop")
    {
        players[id].strafeLeft = false;
    }
    if (func === "rightStop")
    {
        players[id].strafeRight = false;
    }
    if (func === "up")
    {
        players[id].forwards = true;
        players[id].backwards = false;
    }
    if (func === "down")
    {
        players[id].forwards = false;
        players[id].backwards = true;
    }
    if (func === "left")
    {
        players[id].strafeLeft = true;
        players[id].strafeRight = false;
    }
    if (func === "right")
    {
        players[id].strafeLeft = false;
        players[id].strafeRight = true;
    }
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

function toggleShadows()
{
    shadows = !shadows;
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
