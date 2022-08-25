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
    dump(data);
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
    dump("Disc: " + id);
    deletePlayer(id);
    players = data.players;
    mapData = data.mapData;
    dump(players);
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
        id = parseInt(id);
        if (isDefined(physics.player.body[id]))
        {
            physics.player.body[id].position = players[id].body.position;
            physics.player.body[id].velocity = players[id].body.velocity;
            physics.player.body[id].angle = players[id].body.angle;
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
