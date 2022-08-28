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

            gameObject.playerMousePointer = new Graphics();
            gameObject.playerMousePointer.scale.x = 1;
            gameObject.playerMousePointer.scale.y = -1;
            gameObject.playerCrosshair = new Graphics();
            gameObject.playerCrosshair.scale.x = 1;
            gameObject.playerCrosshair.scale.y = -1;

            let thisOuterCrossHairSize = 75;
            let thisMiddleCrossHairSize = 40;
            let thisInnerCrossHairSize = 25;
            drawLine(gameObject.playerCrosshair, -thisOuterCrossHairSize, 0, -thisMiddleCrossHairSize, 0, defaultLaserDotColor, 1, 1, true);
            drawLine(gameObject.playerCrosshair, thisOuterCrossHairSize, 0, thisMiddleCrossHairSize, 0, defaultLaserDotColor, 1, 1);
            drawLine(gameObject.playerCrosshair, 0, -thisOuterCrossHairSize, 0, -thisMiddleCrossHairSize, defaultLaserDotColor, 1, 1);
            drawLine(gameObject.playerCrosshair, 0, thisOuterCrossHairSize, 0, thisMiddleCrossHairSize, defaultLaserDotColor, 1, 1);
            drawLine(gameObject.playerCrosshair, -thisMiddleCrossHairSize, 0, -thisInnerCrossHairSize, 0, defaultLaserDotColor, 1, 0.5);
            drawLine(gameObject.playerCrosshair, thisMiddleCrossHairSize, 0, thisInnerCrossHairSize, 0, defaultLaserDotColor, 1, 0.5);
            drawLine(gameObject.playerCrosshair, 0, -thisMiddleCrossHairSize, 0, -thisInnerCrossHairSize, defaultLaserDotColor, 1, 0.5);
            drawLine(gameObject.playerCrosshair, 0, thisMiddleCrossHairSize, 0, thisInnerCrossHairSize, defaultLaserDotColor, 1, 0.5);
            drawCircle(gameObject.playerMousePointer, 0, 0, 15, 0x000000, 5, 1, 0xffffff, 0.5, true);

            gameObject.worldLayer.addChild(gameObject.playerCrosshair);
            gameObject.mousePointerLayer.addChild(gameObject.playerMousePointer);
            gameObject.player[playerID].parentLayer = gameObject.yourPlayerLayer;
            gameObject.mousePointerLayer.parentLayer = gameObject.aboveLOSLayer;
            gameObject.playerLOSMask = new Graphics();
            gameObject.playerLOSMask.scale.x = 1;
            gameObject.playerLOSMask.scale.y = -1;
            gameObject.playerLOSMaskLayer.addChild(gameObject.playerLOSMask);
            gameObject.worldLayer.mask = gameObject.playerLOSMask;

        }
        gameObject.playerLightMask[id] = new Graphics();
        gameObject.playerLightMask[id].scale.x = 1;
        gameObject.playerLightMask[id].scale.y = -1;
        gameObject.playerLightMaskLayer.addChild(gameObject.playerLightMask[id]);
        //gameObject.playerLightMask.filters = [applyBlurFilter(10)];
        gameObject.catacombLayer.mask = gameObject.playerLightMaskLayer;

        gameObject.playerPosCheck[id] = new Graphics();
        gameObject.playerPosCheck[id].scale.x = 1;
        gameObject.playerPosCheck[id].scale.y = 1;
        gameObject.worldLayer.addChild(gameObject.playerPosCheck[id]);

        gameObject.player[id].playerID = players[id].playerID;
        gameObject.player[id].animationSpeed = 0.25;
        gameObject.player[id].play();

        gameObject.playerLayer.addChild(gameObject.player[id]);
        gameObject.playerLayer.addChild(gameObject.playerDiscordAvatar[id]);
        gameObject.playerLayer.addChild(gameObject.playerDiscordUsername[id]);
        gameObject.playerLayer.addChild(gameObject.debugPlayerHudLayer[id]);

        gameObject.playerLaser[id] = {
            dot: new Sprite(Resources.laserDot.texture),
            beam: new Sprite(Resources.laserBeam.texture),
            glow: new Sprite(Resources.laserGlow.texture),
        };

        gameObject.playerLaserLayer[id] = new Container();

        gameObject.laserLayer.addChild(gameObject.playerLaserLayer[id]);
        gameObject.laserLayer.addChild(gameObject.playerLaser[id].dot);
        gameObject.playerLaserLayer[id].addChild(gameObject.playerLaser[id].beam);
        gameObject.playerLaserLayer[id].addChild(gameObject.playerLaser[id].glow);

        gameObject.playerLaser[id].dot.parentLayer = gameObject.globalLaserLayer;
        gameObject.playerLaser[id].beam.parentLayer = gameObject.globalLaserLayer;
        gameObject.playerLaser[id].glow.parentLayer = gameObject.globalLaserLayer;

        gameObject.playerLaser[id].dot.tint = defaultLaserDotColor;
        gameObject.playerLaser[id].dot.scale.x = 0.25;
        gameObject.playerLaser[id].dot.scale.y = -0.25;
        gameObject.playerLaser[id].dot.anchor.x = 0.5;
        gameObject.playerLaser[id].dot.anchor.y = 0.5;
        gameObject.playerLaser[id].beam.tint = defaultLaserDotColor;
        gameObject.playerLaser[id].beam.scale.x = 10;
        gameObject.playerLaser[id].beam.scale.y = -0.5;
        gameObject.playerLaser[id].beam.x = muzzlePosOffset.x * playerScale;
        gameObject.playerLaser[id].beam.y = -muzzlePosOffset.y * playerScale;
        gameObject.playerLaser[id].beam.anchor.x = 0;
        gameObject.playerLaser[id].beam.anchor.y = 0.5;
        gameObject.playerLaser[id].glow.tint = defaultLaserDotColor;
        gameObject.playerLaser[id].glow.scale.x = 0.25;
        gameObject.playerLaser[id].glow.scale.y = -0.25;
        gameObject.playerLaser[id].glow.x = muzzlePosOffset.x * playerScale;
        gameObject.playerLaser[id].glow.y = -muzzlePosOffset.y * playerScale;
        gameObject.playerLaser[id].glow.anchor.x = 0.5;
        gameObject.playerLaser[id].glow.anchor.y = 0.5;
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
        if (isDefined(mapData[id]))
        {
            let type = isDefined(mapData[id].shadow) ? mapData[id].shadow : false;
            let rotation = isDefined(mapData[id].shadowRotation) ? mapData[id].shadowRotation : false;
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
    gameObject.worldLayer.removeChild(gameObject.playerPosCheck[id]);
    gameObject.playerLayer.removeChild(gameObject.debugPlayerHudLayer[id]);
    gameObject.playerLayer.removeChild(gameObject.player[id]);
    gameObject.playerLayer.removeChild(gameObject.playerDiscordUsername[id]);
    gameObject.playerLayer.removeChild(gameObject.playerDiscordAvatar[id]);


    //gameObject.playerLaserLayer[id].removeChild(gameObject.playerLaser[id].beam);
    //gameObject.playerLaserLayer[id].removeChild(gameObject.playerLaser[id].glow);
    gameObject.laserLayer.removeChild(gameObject.playerLaserLayer[id]);
    gameObject.laserLayer.removeChild(gameObject.playerLaser[id].dot);
    gameObject.playerLightMaskLayer.removeChild(gameObject.playerLightMask[id]);

    physics.world.removeBody(physics.player.body[id]);
    delete gameObject.player[id];
    delete gameObject.playerLaser[id];
    delete gameObject.playerLaserLayer[id];
    delete gameObject.playerDiscordUsername[id];
    delete gameObject.playerDiscordAvatar[id];
    delete gameObject.debugPlayerHudLayer[id];
    delete gameObject.debugPlayerHud[id];
    delete gameObject.playerPosCheck[id];
    delete gameObject.playerLightMask[id];
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

function destroyWall()
{
    let xyKey = getXYKey(worldMouseChunkPos[playerID]);
    dump(mapData[xyKey]);
    if (isDefined(mapData[xyKey]))
    {
        let tile = mapData[xyKey].tile;
        if (tile === "wall")
        {
            socket.emit("changeMap", {
                xyKey: xyKey,
                changeTo: "floor",
                playerID: playerID,
            });
        }
    }
}

function buildWall()
{
    let xyKey = getXYKey(worldMouseChunkPos[playerID]);
    if (isDefined(mapData[xyKey]))
    {
        let tile = mapData[xyKey].tile;
        if (tile === "floor")
        {
            socket.emit("changeMap", {
                xyKey: xyKey,
                changeTo: "wall",
                playerID: playerID,
            });
        }
    }
}
