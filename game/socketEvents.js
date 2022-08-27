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
        setupLoader();
    } else {
        clientReady();
    }
});

socket.on("disconnect", function(msg) {
    dump(msg);
    deletePlayers();
    deleteShadows();
    deleteFloors();
    deleteWalls();

    document.querySelector('#frame').removeChild(App.view);
    document.querySelector(".offline").style.display = "inline-block"

    //dump(App.stage);
    //dump(gameObject.player);
    players = {};
    mapData = {};
    playerID = false;
});

socket.on('newPlayer', function(data) {
    mapData = data.mapData;
    let newPlayerID = data.newPlayerID;
    players = data.players;
    if (players[newPlayerID].uuid === uuid)
    {
        playerID = newPlayerID;
        localPlayer = players[playerID];
    }
    if (!isDefined(gameObject.player[newPlayerID]))
    {
        createPlayer(newPlayerID);
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
    dump("Disc: " + id);
    deletePlayer(id);
    players = data.players;
    mapData = data.mapData;
});

socket.on('clientPlayerUpdate', function(data) {
    players = data.players;

    /*
    if (isDefined(playerID) && playerID !== false)
    {
        let angDist = angleDist(physics.player.body[playerID].angle, players[playerID].body.angle);
        let dist = distance(physics.player.body[playerID].position, players[playerID].body.position);
        physics.player.body[playerID].position = players[playerID].body.position;
        if (dist > 50)
        {
            //dump("Client updated position from server");
        }
        physics.player.body[playerID].angle = players[playerID].body.angle;
        if (toDeg(angDist) > 5)
        {
            //dump("Client updated angle from server");
        }
    }*/

    //if (toDeg(abs(players[p].body.angularVelocity - physics.player.body[p].angularVelocity)) > 0)
    //physics.player.body[p].angularVelocity = players[p].body.angularVelocity;
    if (playerID !== false)
        playerAngle = physics.player.body[playerID].angle;
    else
        playerAngle = 0;
    for (let id in players)
    {
        if (isDefined(physics.player.body[id]))
        {
            let lastIndex = players[id].body.movementHistory.length - 1;
            let clientTimestamp = Date.now() / 1000;
            let serverTimestamp1 = players[id].body.movementHistory[lastIndex].timestamp;
            let serverTimestamp2 = players[id].body.movementHistory[lastIndex - 1].timestamp;
            let mousePos1 = players[id].body.movementHistory[lastIndex].mouse;
            let mousePos2 = players[id].body.movementHistory[lastIndex - 1].mouse;
            let angle1 = players[id].body.movementHistory[lastIndex].angle;
            let angle2 = players[id].body.movementHistory[lastIndex - 1].angle;
            //dump((serverTimestamp - clientTimestamp) * 1000 + "ms");
            //dump((serverTimestamp1 - serverTimestamp2) * 1000 + " ms");

            let clientServerPosDifference = {
                x: physics.player.body[id].position[0] - players[id].body.position[0],
                y: physics.player.body[id].position[1] - players[id].body.position[1],
            };
            //dump(localPosFactor);
            let newPosition;
            if (physics.player.body[id].velocity[0] === 0 && physics.player.body[id].velocity[1] === 0)
            {
                newPosition = {x : players[id].body.position[0], y: players[id].body.position[1]};
            } else {
                newPosition = lerp2D(physics.player.body[id].position, players[id].body.position, frameTickTime / serverPing);
            }
            players[id].mouse = lerp2D(mousePos1, players[id].mouse, frameTickTime / serverPing);
            physics.player.body[id].position[0] = newPosition.x
            physics.player.body[id].position[1] = newPosition.y;
            physics.player.body[id].velocity = players[id].body.velocity;
            physics.player.body[id].angle = lerp1D(angle1, players[id].body.angle, frameTickTime / serverPing);//players[id].body.angle;
            physics.player.body[id].angularVelocity = players[id].body.angularVelocity;
        }
    }
});

socket.on('clientMapUpdate', function(data) {
    mapData = data.mapData;
});

socket.on('serverDump', function(data) {
    dump("###################### DUMP -- Zombie-Server -- DUMP ######################")
    dump(JSON.parse(data));
    dump("###################### DUMP -- Zombie-Server -- DUMP ######################")
});

socket.on("ping", function (data) {
    let timestamp = Date.now() / 1000;
    let pingReplyTime = (timestamp - data.clientTimestamp) * 1000;
    serverPing = pingReplyTime / 2;
    if (data.log)
    {
        dump("PING REPLY: " + pingReplyTime.toFixed(0) + " ms");
        dump("SERVER PING: " + (pingReplyTime / 2).toFixed(0) + " ms");
        dump(data);
    }
})