function physicsAddPlayer(id)
{
    if (isDefined(physics.player.body[id]))
        return;
    physics.player.body[id] = new p2.Body({
        mass: 100,
        position: [players[id].body.position[0], players[id].body.position[1]],
        angle: players[id].body.angle,
    });
    let width = gameObject.player[id].width;
    let height = gameObject.player[id].height;
    physics.player.shape[id] = new p2.Box({
        width: width,
        height: height,
    });
    physics.player.shape[id].anchorRatio = {x: 0.237983, y: 0.547403};
    physics.player.shape[id].collisionGroup = FLAG.PLAYER;
    physics.player.shape[id].collisionMask = FLAG.WALL | FLAG.BULLET | FLAG.VISION_GOGGLES | FLAG.PLAYER | FLAG.ZOMBIE | FLAG.AMMO_CLIP;;
    physics.player.body[id].object = "player";
    physics.player.body[id].objectID = id;
    physics.player.body[id].damping = 0;
    physics.player.body[id].centerMass = {x: (width / 2) - (width * physics.player.shape[id].anchorRatio.x), y: (height / 2) - (height * physics.player.shape[id].anchorRatio.y)};
    physics.player.body[id].addShape(physics.player.shape[id], [physics.player.body[id].centerMass.x, physics.player.body[id].centerMass.y], toRad(0));
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