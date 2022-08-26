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

        if (id === playerID)
        {
            gameObject.playerFOVScanMask = new Graphics();
            gameObject.playerFOVScanMask.scale.x = 1;
            gameObject.playerFOVScanMask.scale.y = -1;
            gameObject.playerFOVScanMaskLayer.addChild(gameObject.playerFOVScanMask);
            //gameObject.playerFOVScanMask.filters = [applyBlurFilter(50)];
            //gameObject.worldLayer.addChild(gameObject.playerFOVScanMask);
            gameObject.catacombLayer.mask = gameObject.playerFOVScanMaskLayer;
        }

        gameObject.player[id].playerID = players[id].playerID;
        gameObject.player[id].play();
        gameObject.playerLayer.addChild(gameObject.player[id]);
        gameObject.playerLayer.addChild(gameObject.playerDiscordAvatar[id]);
        gameObject.playerLayer.addChild(gameObject.playerDiscordUsername[id]);
        gameObject.playerLayer.addChild(gameObject.debugPlayerHudLayer[id]);
        physicsAddPlayer(id);
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

function createShadow(id)
{
    if (!isDefined(gameObject.shadowOverlay[id]))
    {
        let chunkPos = getXYPos(id);
        let type = mapData[id].shadow;
        let rotation = mapData[id].shadowRotation;
        if (type !== false && rotation !== false)
        {
            gameObject.shadowOverlay[id] = new Sprite(Resources[type + "Overlay"].texture);
            let globalPos = calcGlobalPos(chunkPos, gridSize);
            gameObject.shadowOverlay[id].anchor.x = 0.5;
            gameObject.shadowOverlay[id].anchor.y = 0.5;
            gameObject.shadowOverlay[id].x = globalPos.x;
            gameObject.shadowOverlay[id].y = globalPos.y;
            gameObject.shadowOverlay[id].rotation = toRad(rotation);
            gameObject.shadowOverlay[id].chunkPos = {x: chunkPos.x, y: chunkPos.y};
            gameObject.shadowOverlay[id].scale.x = gridSize / 1024;
            gameObject.shadowOverlay[id].scale.y = -gridSize / 1024;
            gameObject.shadowOverlayLayer.addChild(gameObject.shadowOverlay[id]);
        }
    }
}

function deleteFloor(id)
{
    if (isDefined(gameObject.floor[id]))
    {
        gameObject.floorLayer.removeChild(gameObject.floor[id]);
        delete gameObject.floor[id];
    }
    if (isDefined(gameObject.debugFloorHud[id]))
    {
        gameObject.debugFloorHudLayer.removeChild(gameObject.debugFloorHud[id]);
        delete gameObject.debugFloorHud[id];
    }
    if (isDefined(gameObject.floorGrid[id]))
    {
        gameObject.debugFloorHudLayer.removeChild(gameObject.floorGrid[id]);
        delete gameObject.floorGrid[id];
    }
}

function deleteWall(id)
{
    if (isDefined(gameObject.wall[id]))
    {
        gameObject.wallLayer.removeChild(gameObject.wall[id]);
        delete gameObject.wall[id];
    }
    if (isDefined(gameObject.debugWallHud[id]))
    {
        gameObject.debugWallHudLayer.removeChild(gameObject.debugWallHud[id]);
        delete gameObject.debugWallHud[id];
    }
    if (isDefined(gameObject.wallGrid[id]))
    {
        gameObject.debugWallHudLayer.removeChild(gameObject.wallGrid[id]);
        delete gameObject.wallGrid[id];
    }
}

function deleteShadow(id)
{
    if (!isDefined(gameObject.shadowOverlay[id]))
        return;
    gameObject.shadowOverlayLayer.removeChild(gameObject.shadowOverlay[id]);
    delete gameObject.shadowOverlay[id];
}

function deletePlayer(id)
{
    //gameObject.debugPlayerHudLayer[id].removeChild(gameObject.debugPlayerHud[id]);
    gameObject.playerLayer.removeChild(gameObject.debugPlayerHudLayer[id]);
    gameObject.playerLayer.removeChild(gameObject.player[id]);
    gameObject.playerLayer.removeChild(gameObject.playerDiscordUsername[id]);
    gameObject.playerLayer.removeChild(gameObject.playerDiscordAvatar[id]);
    physics.world.removeBody(physics.player.body[id]);
    delete gameObject.player[id];
    delete gameObject.playerDiscordUsername[id];
    delete gameObject.playerDiscordAvatar[id];
    delete gameObject.debugPlayerHudLayer[id];
    delete gameObject.debugPlayerHud[id];
    delete physics.player.body[id];
    delete physics.player.shape[id];
}

function deleteShadows()
{
    if (objLength(gameObject.shadowOverlay) > 0)
    {
        for (let id in gameObject.shadowOverlay)
        {
            deleteShadow(id);
        }
    }
}

function deleteWalls()
{
    if (objLength(gameObject.wall) > 0)
    {
        for (let id in gameObject.wall)
        {
            deleteWall(id);
        }
    }
}

function deleteFloors()
{
    if (objLength(gameObject.floor) > 0)
    {
        for (let id in gameObject.floor)
        {
            deleteFloor(id);
        }
    }
}

function deletePlayers()
{
    if (objLength(gameObject.player) > 0)
    {
        for (let id in gameObject.player)
        {
            deletePlayer(id);
        }
    }
}