function play(delta) {
    gamedelta = delta;
    frameTickTime = Ticker.elapsedMS;
    FPS = 1000 / frameTickTime;
    localMousePos = App.renderer.plugins.interaction.mouse.global;
    worldMousePos = App.stage.toLocal(localMousePos);
    let mouseAngle;
    if (isDefined(players))
    {
        if (playerID !== false)
        {
            if (isDefined(gameObject.player[playerID]))
            {
                App.stage.pivot.x = players[playerID].body.position[0];
                App.stage.pivot.y = players[playerID].body.position[1];
            }
            mouseAngle = angle({x: physics.player.body[playerID].position[0], y: physics.player.body[playerID].position[1]}, worldMousePos);
        }

        for (let id in players)
        {
            id = parseInt(id);
            if (isDefined(gameObject.player[id]))
            {
                let avatarDim = {x: gameObject.playerDiscordAvatar[id].width, y: gameObject.playerDiscordAvatar[id].height};
                let playerDim = {x: gameObject.player[id].width, y: gameObject.player[id].height};

                if (id === playerID)
                {
                    gameObject.player[id].x = physics.player.body[id].position[0];//players[id].body.position[0];
                    gameObject.player[id].y = physics.player.body[id].position[1];//players[id].body.position[1];
                    gameObject.player[id].rotation = physics.referencePlayer.body.angle;//mouseAngle;
                    //players[id].body.angle = physics.player.body[id].angle;
                } else {
                    //gameObject.player[id].x = players[id].body.position[0];
                    //gameObject.player[id].y = players[id].body.position[1];
                    //gameObject.player[id].rotation = players[id].body.angle;
                    gameObject.player[id].x = physics.player.body[id].position[0];
                    gameObject.player[id].y = physics.player.body[id].position[1];
                    gameObject.player[id].rotation = physics.player.body[id].angle;
                }
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
                if (shadows)
                    gameObject.shadowOverlayLayer.visible = true;
                else
                    gameObject.shadowOverlayLayer.visible = false;
            } else {
                createPlayer(id);
            }
            updatePlayerPos(id);
        }

        if (playerID !== false)
        {
            mouseAngle = angle({x: physics.player.body[playerID].position[0], y: physics.player.body[playerID].position[1]}, worldMousePos);

            let angleDistance = angleDist(mouseAngle, physics.player.body[playerID].angle);
            let turnDir = angleMoveDir(mouseAngle, physics.player.body[playerID].angle);
            if (toDeg(angleDistance) > players[playerID].turnSpeed / FPS)
            {
                physics.player.body[playerID].angularVelocity = toRad(players[playerID].turnSpeed) * turnDir;
            } else {
                physics.player.body[playerID].angularVelocity = 0;
                physics.player.body[playerID].angle = mouseAngle;
            }

            angleDistance = angleDist(mouseAngle, physics.referencePlayer.body.angle);
            turnDir = angleMoveDir(mouseAngle, physics.referencePlayer.body.angle);
            if (toDeg(angleDistance) > players[playerID].turnSpeed / FPS)
            {
                physics.referencePlayer.body.angularVelocity = toRad(players[playerID].turnSpeed) * turnDir;
            } else {
                physics.referencePlayer.body.angularVelocity = 0;
                physics.referencePlayer.body.angle = mouseAngle;
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
                    let foundTile = {};
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
                                foundTile[xyKey] = tile;
                                createShadow(xyKey);
                            }
                        }
                    }
                    if (objLength(foundTile, true) > 0)
                    {
                        for (let id in foundTile)
                        {
                            mapData[id].chunkRendered = true;
                            let tileType = foundTile[id].tile;
                            let pos = {x: foundTile[id].chunkPosX, y: foundTile[id].chunkPosY};
                            if (tileType === "floor")
                            {
                                if (!isDefined(gameObject.floor[id]))
                                {
                                    if (isDefined(gameObject.wall[id]))
                                    {
                                        deleteWall(id);
                                        physicsDeleteWall(id);
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
                                    physicsAddWall(id, pos);
                                }
                            }
                        }
                    }
                    let deRenderTile = [];
                    for (let id in mapData)
                    {
                        if (!mapData[id].chunkRendered)
                        {
                            let tileType = mapData[id].tile;

                            if (tileType === "floor")
                            {
                                deleteFloor(id);
                                deleteShadow(id);
                                mapData[id].chunkLoaded = false;
                                deRenderTile.push(id);
                            }
                            if (tileType === "wall")
                            {
                                deleteWall(id);
                                physicsDeleteWall(id);
                                deleteShadow(id);
                                mapData[id].chunkLoaded = false;
                                deRenderTile.push(id);
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
            let polyPath = [];
            if (isDefined(path))
            {
                for (let p in path)
                {
                    polyPath.push(path[p].x);
                    polyPath.push(path[p].y);
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
                playerAngle: physics.player.body[playerID].angle,
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
    frames++;
    physics.world.step(1 / FPS, frameTickTime / 1000, 2);
}

function updatePlayerPos(id)
{
    if (!isDefined(players))
        return;
    if (players[id].forwards)
    {
        players[id].backwardsSpeed -= players[id].backwardsAcceleration / FPS;
        if (players[id].backwardsSpeed < 0)
            players[id].backwardsSpeed = 0;
        players[id].forwardsSpeed += players[id].forwardsAcceleration / FPS;
        if (players[id].forwardsSpeed > players[id].forwardsMaxSpeed)
            players[id].forwardsSpeed = players[id].forwardsMaxSpeed;
    } else {
        players[id].forwardsSpeed -= players[id].forwardsDeAcceleration / FPS;
        if (players[id].forwardsSpeed < 0)
            players[id].forwardsSpeed = 0;
    }

    if (players[id].backwards)
    {
        players[id].forwardsSpeed -= players[id].forwardsAcceleration / FPS;
        if (players[id].forwardsSpeed < 0)
            players[id].forwardsSpeed = 0;
        players[id].backwardsSpeed += players[id].backwardsAcceleration / FPS;
        if (players[id].backwardsSpeed > players[id].backwardsMaxSpeed)
            players[id].backwardsSpeed = players[id].backwardsMaxSpeed;
    } else {
        players[id].backwardsSpeed -= players[id].backwardsDeAcceleration / FPS;
        if (players[id].backwardsSpeed < 0)
            players[id].backwardsSpeed = 0;
    }

    if (players[id].strafeLeft)
    {
        players[id].strafeRightSpeed -= players[id].strafeAcceleration / FPS;
        if (players[id].strafeRightSpeed < 0)
            players[id].strafeRightSpeed = 0;
        players[id].strafeLeftSpeed += players[id].strafeAcceleration / FPS;
        if (players[id].strafeLeftSpeed > players[id].strafeMaxSpeed)
            players[id].strafeLeftSpeed = players[id].strafeMaxSpeed;
    } else {
        players[id].strafeLeftSpeed -= players[id].strafeDeAcceleration / FPS;
        if (players[id].strafeLeftSpeed < 0)
            players[id].strafeLeftSpeed = 0;
    }

    if (players[id].strafeRight)
    {
        players[id].strafeLeftSpeed -= players[id].strafeAcceleration / FPS;
        if (players[id].strafeLeftSpeed < 0)
            players[id].strafeLeftSpeed = 0;
        players[id].strafeRightSpeed += players[id].strafeAcceleration / FPS;
        if (players[id].strafeRightSpeed > players[id].strafeMaxSpeed)
            players[id].strafeRightSpeed = players[id].strafeMaxSpeed;
    } else {
        players[id].strafeRightSpeed -= players[id].strafeDeAcceleration / FPS;
        if (players[id].strafeRightSpeed < 0)
            players[id].strafeRightSpeed = 0;
    }

    let speedVector;
    let theta;
    let vectorSpeed;
    if (players[id].forwardsSpeed > 0)
    {
        if (players[id].strafeLeftSpeed > 0)
        {
            // forwards and left
            speedVector = {x: players[id].forwardsSpeed, y: players[id].strafeLeftSpeed};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        } else if (players[id].strafeRightSpeed > 0)
        {
            // forwards and right
            speedVector = {x: players[id].forwardsSpeed, y: -players[id].strafeRightSpeed};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        } else {
            // forwards only
            speedVector = {x: players[id].forwardsSpeed, y: 0};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        }
    } else if (players[id].backwardsSpeed > 0)
    {
        if (players[id].strafeLeftSpeed > 0)
        {
            // backwards and left
            speedVector = {x: -players[id].backwardsSpeed, y: players[id].strafeLeftSpeed};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        } else if (players[id].strafeRightSpeed > 0)
        {
            // backwards and right
            speedVector = {x: -players[id].backwardsSpeed, y: -players[id].strafeRightSpeed};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        } else {
            // backwards only
            speedVector = {x: -players[id].backwardsSpeed, y: 0};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        }
    } else if (players[id].strafeLeftSpeed > 0)
    {
        speedVector = {x: 0, y: players[id].strafeLeftSpeed};
        vectorSpeed = distance(speedVector);
        theta = angle(speedVector);
    } else if (players[id].strafeRightSpeed > 0)
    {
        speedVector = {x: 0, y: -players[id].strafeRightSpeed};
        vectorSpeed = distance(speedVector);
        theta = angle(speedVector);
    } else {
        // standing still
        vectorSpeed = 0;
        theta = 0;
    }

    players[id].momentumDir = convRad(physics.player.body[id].angle + theta);

    let runBonus = 1;
    if (players[id].isRunning)
    {
        if (players[id].forwards)
        {
            runBonus = players[id].runBonusSpeed;
            players[id].runBonusSpeed *= players[id].runBonusSpeedIncMulti;
            if (players[id].runBonusSpeed >= players[id].runMaxBonusSpeed)
                players[id].runBonusSpeed = players[id].runMaxBonusSpeed;
            if (players[id].strafeLeft || players[id].strafeRight)
            {
                runBonus = players[id].runBonusSpeed;
                players[id].runBonusSpeed *= players[id].runBonusSpeedIncMulti;
                if (players[id].runBonusSpeed >= players[id].runMaxBonusSpeed)
                    players[id].runBonusSpeed = players[id].runMaxBonusSpeed;
            }
        } else if (players[id].strafeLeft || players[id].strafeRight)
        {
            runBonus = players[id].runBonusSpeed;
            players[id].runBonusSpeed *= players[id].runBonusSpeedIncMulti;
            if (players[id].runBonusSpeed > players[id].runMaxBonusSpeed)
                players[id].runBonusSpeed = players[id].runMaxBonusSpeed;
        }
    } else if (players[id].isTipToe)
    {
        runBonus = players[id].runBonusSpeed;
        players[id].runBonusSpeed /= players[id].runBonusSpeedIncMulti;
        if (players[id].runBonusSpeed < players[id].runMinBonusSpeed / 2)
            players[id].runBonusSpeed = players[id].runMinBonusSpeed / 2;
    } else {
        runBonus = players[id].runBonusSpeed;
        if (players[id].runBonusSpeed < 1)
        {
            players[id].runBonusSpeed *= players[id].runBonusSpeedIncMulti * 2;
            if (players[id].runBonusSpeed > players[id].runMinBonusSpeed)
                players[id].runBonusSpeed = players[id].runMinBonusSpeed;
        } else if (players[id].runBonusSpeed > 1)
        {
            players[id].runBonusSpeed /= players[id].runBonusSpeedIncMulti * 2;
            if (players[id].runBonusSpeed < players[id].runMinBonusSpeed)
                players[id].runBonusSpeed = players[id].runMinBonusSpeed;
        }
    }

    players[id].currentSpeed = vectorSpeed * runBonus;
    players[id].body.position = [physics.player.body[id].position[0], physics.player.body[id].position[1]];
    players[id].body.angle = physics.player.body[id].angle;
    players[id].chunkPos = calcChunkPos(players[id].body.position, gridSize);
    physics.player.body[id].velocity = [Math.cos(players[id].momentumDir) * players[id].currentSpeed, Math.sin(players[id].momentumDir) * players[id].currentSpeed];
    players[id].body.velocity = physics.player.body[id].velocity;
    players[id].body.angularVelocity = physics.player.body[id].angularVelocity;
}