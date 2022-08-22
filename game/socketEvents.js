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
    deletePlayer(id);
    players = data.players;
});

socket.on('serverUpdate', function(data) {
    mapData = data.mapData;
    players = data.players;
    for (let p in players)
    {
        physics.player.body[p].position = players[p].body.position;
        physics.player.body[p].angle = players[p].body.angle;
        physics.player.body[p].velocity = players[p].body.velocity;
    }
});

socket.on('serverDump', function(data) {
    dump("###################### DUMP -- Zombie-Server -- DUMP ######################")
    dump(JSON.parse(data));
    dump("###################### DUMP -- Zombie-Server -- DUMP ######################")
});