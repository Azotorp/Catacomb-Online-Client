function play(delta) {
    gamedelta = delta;
    frameTickTime = Ticker.elapsedMS;
    FPS = 1000 / frameTickTime;
    localMousePos = App.renderer.plugins.interaction.mouse.global;
    worldMousePos = App.stage.toLocal(localMousePos);
    mouseButtons();
    let mouseAngle;
    if (frames % 60 === 0)
        ping();
    let muzzleOffset = {
        length: muzzlePosOffset.x * playerScale,
        width: muzzlePosOffset.y * playerScale,
    };
    if (isDefined(players))
    {
        if (playerID !== false)
        {
            App.stage.pivot.x = physics.player.body[playerID].position[0];
            App.stage.pivot.y = physics.player.body[playerID].position[1];

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
            updateLocalPlayerPos();
        }
        for (let id in players)
        {
            if (isDefined(gameObject.player[id]))
            {
                worldMouseChunkPos[id] = calcChunkPos(players[id].mouse, gridSize);
                let avatarDim = {x: gameObject.playerDiscordAvatar[id].width, y: gameObject.playerDiscordAvatar[id].height};
                let playerDim = {x: gameObject.player[id].width, y: gameObject.player[id].height};

                gameObject.player[id].x = physics.player.body[id].position[0];
                gameObject.player[id].y = physics.player.body[id].position[1];



                drawLine(gameObject.playerPosCheck[id], players[id].body.position[0], players[id].body.position[1] - 50, players[id].body.position[0], players[id].body.position[1] + 50, 0x00ff00, 1, 1,true);
                drawLine(gameObject.playerPosCheck[id], players[id].body.position[0] - 50, players[id].body.position[1], players[id].body.position[0] + 50, players[id].body.position[1], 0x00ff00, 1, 1);
                if (id === playerID)
                {
                    gameObject.player[id].rotation = physics.referencePlayer.body.angle; // use a local angle to not get crazy jitters
                } else {
                    gameObject.player[id].rotation = physics.player.body[id].angle;
                }
                gameObject.player[id].muzzleOrigin = {
                    x: gameObject.player[id].x + (cos(gameObject.player[id].rotation) * muzzleOffset.length - cos(gameObject.player[id].rotation + toRad(90)) * muzzleOffset.width),
                    y: gameObject.player[id].y + (sin(gameObject.player[id].rotation) * muzzleOffset.length - sin(gameObject.player[id].rotation + toRad(90)) * muzzleOffset.width)
                };
                let mousePos;
                if (id === playerID)
                    mousePos = worldMousePos;
                else
                    mousePos = players[id].mouse;
                let crossHairMousePos = {
                    x: mousePos.x - cos(gameObject.player[id].rotation + toRad(90)) * muzzleOffset.width,
                    y: mousePos.y - sin(gameObject.player[id].rotation + toRad(90)) * muzzleOffset.width,
                };
                let laserDistance = distance(gameObject.player[id].muzzleOrigin, crossHairMousePos);
                //gameObject.playerLaser[id].beam.scale.x = laserDistance / 256;
                let laserRayCastEndPos = {
                    x: gameObject.player[id].muzzleOrigin.x + cos(gameObject.player[id].rotation) * laserDistance,
                    y: gameObject.player[id].muzzleOrigin.y + sin(gameObject.player[id].rotation) * laserDistance,
                };
                laserDistance = distance(gameObject.player[id].muzzleOrigin, laserRayCastEndPos);

                laserRayCast[id] = rayCast(gameObject.player[id].muzzleOrigin, laserRayCastEndPos);
                laserDistance = distance(gameObject.player[id].muzzleOrigin, laserRayCast[id]);
                gameObject.playerLaser[id].beam.scale.x = laserDistance / 256;

                gameObject.playerLaser[id].dot.position = laserRayCast[id];

                if (id === playerID)
                {
                    gameObject.playerCrosshair.position = laserRayCast[id];
                    gameObject.playerMousePointer.position = crossHairMousePos;
                    if (laserRayCast[id].body)
                    {
                        gameObject.playerMousePointer.visible = true;
                    } else {
                        gameObject.playerMousePointer.visible = false;
                    }
                }
                gameObject.playerLaserLayer[id].x = gameObject.player[id].x;
                gameObject.playerLaserLayer[id].y = gameObject.player[id].y;
                gameObject.playerLaserLayer[id].rotation = gameObject.player[id].rotation;
                gameObject.playerDiscordAvatar[id].x = gameObject.player[id].x;
                gameObject.playerDiscordAvatar[id].y = (physics.player.body[id].angle >= 0 && toDeg(gameObject.player[id].rotation) <= 180) ? gameObject.player[id].y + 10 + (playerDim.y / 2) + (avatarDim.y / 2) + Math.abs(Math.sin(gameObject.player[id].rotation) * (playerDim.x - avatarDim.y)) : gameObject.player[id].y + 10 + (playerDim.y / 2) + (avatarDim.y / 2);
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
                {
                    gameObject.playerPosCheck[id].visible = true;
                    gameObject.debugPlayerHudLayer[id].visible = true;
                } else {
                    gameObject.playerPosCheck[id].visible = false;
                    gameObject.debugPlayerHudLayer[id].visible = false;
                }
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
            if (isDefined(mapData))
            {
                if (isDefined(players[playerID]))
                {
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
                    if (objLength(foundTile) > 0)
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
    if (id === playerID)
        return;
    physics.player.body[id].velocity = [Math.cos(players[id].momentumDir) * players[id].currentSpeed, Math.sin(players[id].momentumDir) * players[id].currentSpeed];
}

function updateLocalPlayerPos()
{
    let id = playerID;
    if (!isDefined(localPlayer))
        return;
    if (localPlayer.forwards)
    {
        localPlayer.backwardsSpeed -= localPlayer.backwardsAcceleration / FPS;
        if (localPlayer.backwardsSpeed < 0)
            localPlayer.backwardsSpeed = 0;
        localPlayer.forwardsSpeed += localPlayer.forwardsAcceleration / FPS;
        if (localPlayer.forwardsSpeed > localPlayer.forwardsMaxSpeed)
            localPlayer.forwardsSpeed = localPlayer.forwardsMaxSpeed;
    } else {
        localPlayer.forwardsSpeed -= localPlayer.forwardsDeAcceleration / FPS;
        if (localPlayer.forwardsSpeed < 0)
            localPlayer.forwardsSpeed = 0;
    }

    if (localPlayer.backwards)
    {
        localPlayer.forwardsSpeed -= localPlayer.forwardsAcceleration / FPS;
        if (localPlayer.forwardsSpeed < 0)
            localPlayer.forwardsSpeed = 0;
        localPlayer.backwardsSpeed += localPlayer.backwardsAcceleration / FPS;
        if (localPlayer.backwardsSpeed > localPlayer.backwardsMaxSpeed)
            localPlayer.backwardsSpeed = localPlayer.backwardsMaxSpeed;
    } else {
        localPlayer.backwardsSpeed -= localPlayer.backwardsDeAcceleration / FPS;
        if (localPlayer.backwardsSpeed < 0)
            localPlayer.backwardsSpeed = 0;
    }

    if (localPlayer.strafeLeft)
    {
        localPlayer.strafeRightSpeed -= localPlayer.strafeAcceleration / FPS;
        if (localPlayer.strafeRightSpeed < 0)
            localPlayer.strafeRightSpeed = 0;
        localPlayer.strafeLeftSpeed += localPlayer.strafeAcceleration / FPS;
        if (localPlayer.strafeLeftSpeed > localPlayer.strafeMaxSpeed)
            localPlayer.strafeLeftSpeed = localPlayer.strafeMaxSpeed;
    } else {
        localPlayer.strafeLeftSpeed -= localPlayer.strafeDeAcceleration / FPS;
        if (localPlayer.strafeLeftSpeed < 0)
            localPlayer.strafeLeftSpeed = 0;
    }

    if (localPlayer.strafeRight)
    {
        localPlayer.strafeLeftSpeed -= localPlayer.strafeAcceleration / FPS;
        if (localPlayer.strafeLeftSpeed < 0)
            localPlayer.strafeLeftSpeed = 0;
        localPlayer.strafeRightSpeed += localPlayer.strafeAcceleration / FPS;
        if (localPlayer.strafeRightSpeed > localPlayer.strafeMaxSpeed)
            localPlayer.strafeRightSpeed = localPlayer.strafeMaxSpeed;
    } else {
        localPlayer.strafeRightSpeed -= localPlayer.strafeDeAcceleration / FPS;
        if (localPlayer.strafeRightSpeed < 0)
            localPlayer.strafeRightSpeed = 0;
    }

    let speedVector;
    let theta;
    let vectorSpeed;
    if (localPlayer.forwardsSpeed > 0)
    {
        if (localPlayer.strafeLeftSpeed > 0)
        {
            // forwards and left
            speedVector = {x: localPlayer.forwardsSpeed, y: localPlayer.strafeLeftSpeed};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        } else if (localPlayer.strafeRightSpeed > 0)
        {
            // forwards and right
            speedVector = {x: localPlayer.forwardsSpeed, y: -localPlayer.strafeRightSpeed};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        } else {
            // forwards only
            speedVector = {x: localPlayer.forwardsSpeed, y: 0};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        }
    } else if (localPlayer.backwardsSpeed > 0)
    {
        if (localPlayer.strafeLeftSpeed > 0)
        {
            // backwards and left
            speedVector = {x: -localPlayer.backwardsSpeed, y: localPlayer.strafeLeftSpeed};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        } else if (localPlayer.strafeRightSpeed > 0)
        {
            // backwards and right
            speedVector = {x: -localPlayer.backwardsSpeed, y: -localPlayer.strafeRightSpeed};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        } else {
            // backwards only
            speedVector = {x: -localPlayer.backwardsSpeed, y: 0};
            vectorSpeed = distance(speedVector);
            theta = angle(speedVector);
        }
    } else if (localPlayer.strafeLeftSpeed > 0)
    {
        speedVector = {x: 0, y: localPlayer.strafeLeftSpeed};
        vectorSpeed = distance(speedVector);
        theta = angle(speedVector);
    } else if (localPlayer.strafeRightSpeed > 0)
    {
        speedVector = {x: 0, y: -localPlayer.strafeRightSpeed};
        vectorSpeed = distance(speedVector);
        theta = angle(speedVector);
    } else {
        // standing still
        vectorSpeed = 0;
        theta = 0;
    }

    localPlayer.momentumDir = convRad(physics.player.body[playerID].angle + theta);

    let runBonus = 1;
    if (localPlayer.isRunning)
    {
        if (localPlayer.forwards)
        {
            runBonus = localPlayer.runBonusSpeed;
            localPlayer.runBonusSpeed *= localPlayer.runBonusSpeedIncMulti;
            if (localPlayer.runBonusSpeed >= localPlayer.runMaxBonusSpeed)
                localPlayer.runBonusSpeed = localPlayer.runMaxBonusSpeed;
            if (localPlayer.strafeLeft || localPlayer.strafeRight)
            {
                runBonus = localPlayer.runBonusSpeed;
                localPlayer.runBonusSpeed *= localPlayer.runBonusSpeedIncMulti;
                if (localPlayer.runBonusSpeed >= localPlayer.runMaxBonusSpeed)
                    localPlayer.runBonusSpeed = localPlayer.runMaxBonusSpeed;
            }
        } else if (localPlayer.strafeLeft || localPlayer.strafeRight)
        {
            runBonus = localPlayer.runBonusSpeed;
            localPlayer.runBonusSpeed *= localPlayer.runBonusSpeedIncMulti;
            if (localPlayer.runBonusSpeed > localPlayer.runMaxBonusSpeed)
                localPlayer.runBonusSpeed = localPlayer.runMaxBonusSpeed;
        }
    } else if (localPlayer.isTipToe)
    {
        runBonus = localPlayer.runBonusSpeed;
        localPlayer.runBonusSpeed /= localPlayer.runBonusSpeedIncMulti;
        if (localPlayer.runBonusSpeed < localPlayer.runMinBonusSpeed / 2)
            localPlayer.runBonusSpeed = localPlayer.runMinBonusSpeed / 2;
    } else {
        runBonus = localPlayer.runBonusSpeed;
        if (localPlayer.runBonusSpeed < 1)
        {
            localPlayer.runBonusSpeed *= localPlayer.runBonusSpeedIncMulti * 2;
            if (localPlayer.runBonusSpeed > localPlayer.runMinBonusSpeed)
                localPlayer.runBonusSpeed = localPlayer.runMinBonusSpeed;
        } else if (localPlayer.runBonusSpeed > 1)
        {
            localPlayer.runBonusSpeed /= localPlayer.runBonusSpeedIncMulti * 2;
            if (localPlayer.runBonusSpeed < localPlayer.runMinBonusSpeed)
                localPlayer.runBonusSpeed = localPlayer.runMinBonusSpeed;
        }
    }

    localPlayer.currentSpeed = vectorSpeed * runBonus;
    physics.player.body[id].velocity = [Math.cos(localPlayer.momentumDir) * localPlayer.currentSpeed, Math.sin(localPlayer.momentumDir) * localPlayer.currentSpeed];
}