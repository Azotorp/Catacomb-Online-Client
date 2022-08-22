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
                players[id].body.position = physics.player.body[id].position;
                players[id].body.angle = physics.player.body[id].angle;
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
                            let pos = {x: x, y: y};
                            let xyKey = getXYKey(pos);
                            if (isDefined(mapData[xyKey]))
                            {
                                let tile = mapData[xyKey];
                                foundTile.push(tile);
                                createShadow(xyKey);
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
                                                createShadow(getXYKey(newPos));
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
                                                createShadow(getXYKey(newPos));
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
            let path = players[playerID].fovScanPath;
            //dump(path);
            let polyPath = [];
            //let xyKeyList = {};
            //gameObject.playerFOVScanMask.clear();
            if (isDefined(path))
            {
                for (let p in path)
                {
                    /*
                    if (path[p].body !== false)
                    {
                        let xyKey = path[p].body;
                        if (!isDefined(xyKeyList[xyKey]))
                        {
                            xyKeyList[xyKey] = xyKey;
                            let pos = calcGlobalPos(getXYPos(xyKey), gridSize);
                            drawCircle(gameObject.playerFOVScanMask, pos.x, -pos.y, 15, 0x00ffff, 1);
                        }
                    }
                    */
                    polyPath.push(path[p].x);
                    polyPath.push(path[p].y);
                    //drawCircle(gameObject.playerFOVScanMask, path[p].x, path[p].y, 5, 0x00ff00, 1);
                }
                drawPoly(gameObject.playerFOVScanMask, polyPath, 0xff0000, 1, 1, 0xff0000, 1, true);
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
    physics.world.step(1 / FPS, frameTickTime / 1000, 2);
}