function touchDown(event)
{
    //touchDownPos = App.stage.toLocal(App.renderer.plugins.interaction.eventData.data.global);
    //if (touchDownPos)
        //  angswap
        //mouseAim = angle(gameObject.player, touchDownPos);
    if (touchStatus.up)
    {
        touchStatus.down = true;
        touchStatus.up = false;
    }
}

function touchUp(event)
{
    if (touchStatus.down)
    {
        touchStatus.down = false;
        touchStatus.up = true;
    }
    //if (isTouchDrag)
    //{
    //}
    //isTouchDrag = false;
}

function touchDrag(event)
{
    /*
    touchDownPos = App.stage.toLocal(App.renderer.plugins.interaction.eventData.data.global);
    if (touchDownPos)
    {
        // angswap
        mouseAim = angle(gameObject.player, touchDownPos);
        touchDist = distance(touchDownPos, gameObject.player);
        if (!isTouchDrag)
        {
            oldTouchDist = touchDist;
            touchTime = now();
        }
        if (abs(touchDist - oldTouchDist) >= 10)
        {
            if (touchDist > oldTouchDist)
            {
                forwards();
            } else {
                backwards();
            }
        } else {
            if (gameObject.player.movement.forward)
            {
                gameObject.player.movement.forward = false;
            }
            if (gameObject.player.movement.backward)
            {
                gameObject.player.movement.backward = false;
            }
        }
    }
    isTouchDrag = true;
    //touchStatus.down = true;
    */
}

function leftclick(event)
{
    mouseStatus.left.click = true;
}

function rightclick(event)
{
    mouseStatus.right.click = true;
}

function leftunclick(event)
{
    mouseStatus.left.click = false;
}

function rightunclick(event)
{
    mouseStatus.right.click = false;
}

function mouseButtons()
{
    if (mouseStatus.left.click)
    {
        if (!mouseStatus.left.waitforrelease)
        {
            if (now() > mouseStatus.left.nextthink)
            {
                mouseStatus.left.nextthink = now() + 100;
                destroyWall();
            }
        }
    } else {
        mouseStatus.left.waitforrelease = false;
    }

    if (mouseStatus.right.click)
    {
        if (!mouseStatus.right.waitforrelease)
        {
            if (now() > mouseStatus.right.nextthink)
            {
                mouseStatus.right.nextthink = now() + 100;
                buildWall();
            }
        }
    } else {
        mouseStatus.right.waitforrelease = false;
    }
}
