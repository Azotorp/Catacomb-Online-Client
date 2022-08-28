function physicsAddPlayer(id)
{
    if (isDefined(physics.player.body[id]))
        return;
    let sendOutline = false;
    if (objLength(physics.player.body) > 0)
        sendOutline = true;
    physics.player.body[id] = new p2.Body({
        mass: 100,
        position: [players[id].body.position[0], players[id].body.position[1]],
        angle: players[id].body.angle,
    });
    let width = gameObject.player[id].width;
    let height = gameObject.player[id].height;

    //physics.player.shape[id] = new p2.Convex({vertices: playerOutlinePath});

    /*physics.player.body[id].fromPolygon(playerOutlinePath, {skipSimpleCheck: true});
    physics.player.body[id].object = "player";
    physics.player.body[id].objectID = id;
    for (let s in physics.player.body[id].shapes)
    {
        physics.player.body[id].shapes[s].collisionGroup = FLAG.PLAYER;
        physics.player.body[id].shapes[s].collisionMask = FLAG.WALL | FLAG.BULLET | FLAG.VISION_GOGGLES | FLAG.PLAYER | FLAG.ZOMBIE | FLAG.AMMO_CLIP;;
    }

     */



    physics.player.shape[id] = new p2.Box({
        width: width,
        height: height,
    });
    physics.player.shape[id].anchorRatio = playerAnchorRatio;
    physics.player.shape[id].collisionGroup = FLAG.PLAYER;
    physics.player.shape[id].collisionMask = FLAG.WALL | FLAG.BULLET | FLAG.VISION_GOGGLES | FLAG.PLAYER | FLAG.ZOMBIE | FLAG.AMMO_CLIP;;
    physics.player.body[id].object = "player";
    physics.player.body[id].objectID = id;
    physics.player.body[id].damping = 0;
    physics.player.body[id].centerMass = {x: (width / 2) - (width * physics.player.shape[id].anchorRatio.x), y: (height / 2) - (height * physics.player.shape[id].anchorRatio.y)};
    physics.player.body[id].addShape(physics.player.shape[id], [physics.player.body[id].centerMass.x, physics.player.body[id].centerMass.y], toRad(0));
    //physics.player.body[id].addShape(physics.player.shape[id], [0, 0], toRad(0));
    physics.world.addBody(physics.player.body[id]);
}

function physicsAddWall(id, chunkPos)
{
    if (isDefined(physics.wall.body[id]))
        return;
    let globalPos = calcGlobalPos(chunkPos, gridSize);
    physics.wall.body[id] = new p2.Body({
        position: [globalPos.x, globalPos.y],
        angle: 0,
        type: p2.Body.STATIC,
    });
    physics.wall.shape[id] = new p2.Box({
        width: gridSize,
        height: gridSize,
    });
    physics.wall.shape[id].anchorRatio = {x: 0.5, y: 0.5};
    physics.wall.shape[id].collisionGroup = FLAG.WALL;
    physics.wall.shape[id].collisionMask = FLAG.PLAYER_FOV_RAY | FLAG.BULLET | FLAG.VISION_GOGGLES | FLAG.PLAYER | FLAG.ZOMBIE | FLAG.AMMO_CLIP;
    physics.wall.body[id].object = "wall";
    physics.wall.body[id].objectID = id;
    physics.wall.body[id].damping = 0;
    physics.wall.body[id].centerMass = {x: (physics.wall.shape[id].width / 2) - (physics.wall.shape[id].width * physics.wall.shape[id].anchorRatio.x), y: (physics.wall.shape[id].height / 2) - (physics.wall.shape[id].height * physics.wall.shape[id].anchorRatio.y)};
    physics.wall.body[id].addShape(physics.wall.shape[id], [physics.wall.body[id].centerMass.x, physics.wall.body[id].centerMass.y], toRad(0));
    physics.world.addBody(physics.wall.body[id]);
}

function physicsDeleteWall(id)
{
    if (!isDefined(physics.wall.body[id]))
        return;
    physics.world.removeBody(physics.wall.body[id]);
    delete physics.wall.body[id];
    delete physics.wall.shape[id];
}

function rayCast(origin, endPos, collisionMask, reverse = false, skipBackTraces = true)
{
    let rayCast = {
        result: new p2.RaycastResult(),
        hitPoint: p2.vec2.create(),
        rayClosest: new p2.Ray({
            mode: p2.Ray.CLOSEST,
            collisionMask: collisionMask,
            skipBackfaces: skipBackTraces,
        }),
    };

    p2.vec2.copy(rayCast.rayClosest.from, [origin.x, origin.y]);
    p2.vec2.copy(rayCast.rayClosest.to, [endPos.x, endPos.y]);
    rayCast.rayClosest.update();
    physics.world.raycast(rayCast.result, rayCast.rayClosest);
    rayCast.result.getHitPoint(rayCast.hitPoint, rayCast.rayClosest);
    //rayCast.result.reset();
    let dir = 1;
    if (reverse)
        dir = -1;
    if (rayCast.result.body !== null)
    {
        return {
            x: rayCast.hitPoint[0],
            y: rayCast.hitPoint[1] * dir,
            body: rayCast.result.body,
        };
    } else {
        return {
            x: endPos.x,
            y: endPos.y * dir,
            body: false,
        };
    }
}

function lightRayCast(id, fov)
{
    let aim = physics.player.body[id].angle;
    let origin = {
        x: physics.player.body[id].position[0],
        y: physics.player.body[id].position[1],
    };

    let muzzleOffset = {
        length: (muzzlePosOffset.x - 20) * playerScale,
        width: muzzlePosOffset.y * playerScale,
    };

    let flashLightPos = {
        x: physics.player.body[id].position[0] + Math.cos(aim) * muzzleOffset.length - Math.cos(aim + toRad(90)) * muzzleOffset.width,
        y: physics.player.body[id].position[1] + Math.sin(aim) * muzzleOffset.length - Math.sin(aim + toRad(90)) * muzzleOffset.width,
    };
    
    let halfFov = fov / 2;
    lightRayCastPath[id] = [];
    let angle = [];
    let rays = 60;
    let angleStep = fov / rays;
    for (let f = 0; f < fov; f += angleStep)
    {
        let angle3 = aim + toRad(f) - (toRad(fov) / 2);
        angle.push(angle3);
    }
    let angle3 = aim + toRad(fov) - (toRad(fov) / 2);
    angle.push(angle3);
    angle.sort((a, b) => {
        return a - b;
    });
    let range = 850;
    for (let a in angle)
    {
        let ad = toDeg(angleDist(angle[a], aim));
        let rangeMod = 1;
        if (ad > fov * 0.95)
            rangeMod = 0.1;
        let endPos = {
            x: flashLightPos.x + Math.cos(angle[a]) * range * rangeMod,
            y: flashLightPos.y + Math.sin(angle[a]) * range * rangeMod,
        };
        lightRayCastPath[id].push(rayCast(flashLightPos, endPos, FLAG.WALL, true));
    }
    lightRayCastPath[id].push({
        x: flashLightPos.x,
        y: -flashLightPos.y,
    });
}

function getOutlinePath(obj, anchorRatio = {x: 0, y: 0})
{
    let playerPixels = getPixels(obj, anchorRatio, true);
    let outlineData = {};
    let origin = {x: 0, y: 0};
    for (let a = 0; a < 360; a += 1)
    {
        let dist = distance({x: obj.width, y: obj.height}) * 2;
        for (let d = dist; d > 0; d--)
        {
            let pos = {x: parseInt(origin.x + cos(toRad(a)) * d), y: parseInt(origin.y - sin(toRad(a)) * d)};
            let xyKey = getXYKey(pos);
            if (isDefined(playerPixels.pixels[xyKey]))
            {
                outlineData[xyKey] = {x: playerPixels.pixels[xyKey].x, y: playerPixels.pixels[xyKey].y, ang: a};
                break;
            }
        }
    }
    outlineData = Object.values(outlineData);
    outlineData.sort(function (a,b) {
        return a.ang - b.ang;
    });
    let outlinePath = [];
    for (let xyKey in outlineData)
    {
        outlinePath.push([outlineData[xyKey].x, outlineData[xyKey].y]);
    }
    outlinePath.reverse();
    return outlinePath;
}