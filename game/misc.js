function pow(num, exp)
{
    return Math.pow(num, exp);
}

function sqrt(num)
{
    return Math.sqrt(num);
}

function cos(angle)
{
    return Math.cos(angle);
}

function sin(angle)
{
    return Math.sin(angle);
}

function cosDeg(angle)
{
    return Math.cos(toRad(angle));
}

function sinDeg(angle)
{
    return Math.sin(toRad(angle));
}

function nthRoot(num, root)
{
    return pow(num, 1 / root);
}

function distance(obj1, obj2 = false)
{
    if (obj2 !== false)
    {
        return sqrt(pow(obj1.x - obj2.x,2) + pow(obj1.y - obj2.y,2));
    } else {
        return sqrt(pow(obj1.x,2) + pow(obj1.y,2));
    }
}

function UCWord(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function LCWord(string)
{
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function sortArrayByKey(array, key)
{
    return array.sort((a, b) => a[key] - b[key]);
}

function angle(lookingFrom, lookingAt = false)
{
    let at;
    if (lookingAt !== false)
    {
        at = Math.atan2(lookingAt.y - lookingFrom.y, lookingAt.x - lookingFrom.x);
    } else {
        at = Math.atan2(lookingFrom.y, lookingFrom.x);
    }
    return convRad(at);
}

function mod(a, b)
{
    let c = a % b;
    return (c < 0) ? c + b : c;
}

function convDeg(ang)
{
    ang = ang % (360);
    if (ang < 0)
    {
        ang += (2 * 360);
    }
    return ang;
}

function normalize(val, min, max)
{
    return (val - min) / (max - min);
}

function convRad(ang)
{
    ang = ang % (2 * Math.PI);
    if (ang < 0)
    {
        ang += (2 * Math.PI);
    }
    return ang;
}

function toDeg(r)
{
    return r * (180 / Math.PI);
}

function toRad(d)
{
    return d / (180 / Math.PI);
}

function abs(v)
{
    return Math.abs(v);
}

function filterObj(array, cvar, cval)
{
    if (typeof array === 'object' && !Array.isArray(array) && array !== null)
        array = Object.values(array);
    let result = array.filter(obj => {
        return obj[cvar] === cval;
    })
    return result;
}

function filterObj2(array, cvar, cval)
{
    if (typeof array === 'object' && !Array.isArray(array) && array !== null)
        array = Object.values(array);
    let result = array.filter(obj => {
        return obj[cvar] === cval;
    })
    if (result.length === 1)
    {
        return result[0];
    } else {
        return result;
    }
}

function renderCull(object, interval = 1, method = 0)
{
    if (frames % interval === 0)
    {
        renderCullLoop(object, method);
    }
}

function renderCullLoop(object, method)
{
    for (let k in object)
    {
        let obj = object[k];
        let pos = obj.toGlobal(new PIXI.Point(0, 0));
        let onScreen = (pos.x > -500 && pos.y > -500 && pos.x < window.innerWidth + 500 && pos.y < window.innerHeight + 500);
        //dump(pos.x+" : "+pos.y+" [-50;-50]-["+(window.innerWidth + 50)+";"+(window.innerHeight + 50)+"] "+onScreen);
        if (method === 0)
            obj.visible = onScreen;
        else
            obj.renderable = onScreen;
        if (obj.children.length > 0)
            renderCullLoop(obj.children);
    }
}

function objLength(obj, keyLength = false)
{
    if (!Array.isArray(obj))
    {
        if (keyLength)
            return Object.keys(obj).length;
        else
            return 0;
    } else {
        return obj.length;
    }
}

function objInFov(selfObj, selfFov, thatObj)
{
    let selfRotation = selfObj.rotation;
    let thatObjDirection = angle(selfObj, thatObj);
    let fovDistance = angleDist(selfRotation, thatObjDirection);
    if (fovDistance <= selfFov / 2)
        return true;
    else
        return false;
}

function floor(num)
{
    return Math.floor(num);
}

function round(num)
{
    return Math.round(num);
}

function rng(min = 0, max = 1, precision = 0, variance = 1)
{
    let v = [];
    if (max < min)
        max = min + 1;
    if (min === max)
        return min;
    for (let vi = 0; vi < variance; vi++)
    {
        if (precision === 0)
        {
            v[vi] = floor(Math.random() * (max - min + 1) + min);
        } else {
            let pf = pow(10,precision);
            v[vi] = ((round((Math.random() * (max - min) + min) * pf) / pf)).toFixed(precision);
        }
    }
    if (variance > 1)
        return parseFloat(v[parseInt(rng(0, variance - 1))]);
    else
        return parseFloat(v[0]);
}

function angleDist(angle1, angle2, absolute = false)
{
    let ang_dist1;
    let ang_dist2;
    let dist;
    if (!absolute)
    {
        ang_dist1 = abs(angle1 - angle2);
        ang_dist2 = toRad(360) - ang_dist1;
        dist = ang_dist1;
        if (ang_dist1 > ang_dist2)
        {
            dist = ang_dist2;
        }
    } else {
        if (angle1 <= angle2)
        {
            dist = angle2 - angle1;
        } else {
            dist = angle1 - angle2;
        }
    }
    return dist;
}

function angleMoveTo(angleGoal, curAngle)
{
    let turndir = 1;
    let ang_dist1;
    let ang_dist2;
    let least_dist;
    if (curAngle > angleGoal && curAngle - angleGoal <= toRad(180))
    {
        turndir = -1;
    } else if (curAngle > angleGoal && curAngle - angleGoal > toRad(180))
    {
        turndir = 1;
    } else if (angleGoal > curAngle && angleGoal - curAngle <= toRad(180))
    {
        turndir = 1;
    } else if (angleGoal > curAngle && angleGoal - curAngle > toRad(180))
    {
        turndir = -1;
    }
    ang_dist1 = abs(angleGoal - curAngle);
    ang_dist2 = toRad(360) - ang_dist1;
    least_dist = ang_dist1;
    if (ang_dist1 > ang_dist2)
    {
        least_dist = ang_dist2;
    }
    return least_dist * turndir;
}

function angleMoveDir(angleGoal, curAngle)
{
    let turndir = 1;
    if (curAngle > angleGoal && curAngle - angleGoal <= toRad(180))
    {
        turndir = -1;
    } else if (curAngle > angleGoal && curAngle - angleGoal > toRad(180))
    {
        turndir = 1;
    } else if (angleGoal > curAngle && angleGoal - curAngle <= toRad(180))
    {
        turndir = 1;
    } else if (angleGoal > curAngle && angleGoal - curAngle > toRad(180))
    {
        turndir = -1;
    }
    return turndir;
}


function shuffleArray(array)
{
    return array.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
}

function xyArrayConvTo1D(array) // [[x1, y1], [x2, y2], ..]
{
    let ar = [];
    for (let n in array)
    {
        ar.push(array[n][0]);
        ar.push(array[n][1]);
    }
    return ar;
}

function isObj(obj)
{
    if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null)
        return true;
    else
        return false;
}

function calcChunkPos(globalPos, gridSize = 1024)
{
    if (!isObj(globalPos))
    {
        return [Math.floor((globalPos[0] - (gridSize / 2)) / gridSize) + 1, Math.floor((globalPos[1] - (gridSize / 2)) / gridSize) + 1];
    } else {
        return {x: Math.floor((globalPos.x - (gridSize / 2)) / gridSize) + 1, y: Math.floor((globalPos.y - (gridSize / 2)) / gridSize) + 1};
    }
}

function calcGlobalPos(chunkPos, gridSize = 1024)
{
    if (!isObj(chunkPos))
    {
        return [chunkPos[0] * gridSize, chunkPos[1] * gridSize];
    } else {
        return {x: chunkPos.x * gridSize, y: chunkPos.y * gridSize};
    }
}

function getChunkPosFromIndex(mazeIndex, size)
{
    return {x: mazeIndex % size.x, y: Math.floor(mazeIndex / size.x)};
}

function getIndexFromChunkPos(chunkPos, size)
{
    return (size.x * chunkPos.y) + chunkPos.x;
}

function xyArrayConvTo2D(array) // [x1, y1, x2, y2, ..]
{
    let ar = [];
    for (let n = 0; n < array.length / 2; n++)
    {
        ar.push([array[n * 2], array[n * 2 + 1]]);
    }
    return ar;
}

function createGradTexture(from, to, x, y, w, h, direction = 0) {
    // adjust it if somehow you need better quality for very very big images
    const quality = 256;
    const canvas = document.createElement('canvas');
    canvas.width = x + w;
    canvas.height = y+h;

    const ctx = canvas.getContext('2d');
    let grd;
    // use canvas2d API to create gradient
    if (direction === 0)
        grd = ctx.createLinearGradient(x, y, x + w, y + h);
    if (direction === 90)
        grd = ctx.createLinearGradient(x, y, x, y + h);
    grd.addColorStop(0, from);
    grd.addColorStop(1, to);

    ctx.fillStyle = grd;
    ctx.fillRect(x, y, w, h);

    return PIXI.Texture.from(canvas);
}

function nf(num) {
    return num.toLocaleString();
}

function hexColorHashTag(hex)
{
    if (hex.substr(0,1) === "#")
        return hex;
    else
        return "#"+hex;
}

function hexColorDeHashTag(hex)
{
    if (hex.substr(0,1) === "#")
        return hex.substr(1);
    else
        return hex;
}

function hexColorToInt(hex)
{
    return parseInt(hexColorDeHashTag(hex), 16);
}

function intColorToHex(int)
{
    return int.toString(16).padStart(6, "0");
}

function isString(data)
{
    return typeof data === 'string' || data instanceof String;
}

function rgbaToIntoColor(red, green, blue, alpha = 1)
{
    let r = red & 0xFF;
    let g = green & 0xFF;
    let b = blue & 0xFF;
    let a = alpha & 0xFF;

    return (r << 24) + (g << 16) + (b << 8) + (a);
}

function aOverBColor(cA, cB, aA = 1, aB = 1, output = "{}") // 0x / # / [] // {}
{
    if (!isString(cA))
        cA = intColorToHex(cA);
    else
        cA = hexColorDeHashTag(cA);
    if (!isString(cB))
        cB = intColorToHex(cB);
    else
        cB = hexColorDeHashTag(cB);
    let redA;
    let greenA;
    let blueA;
    let alphaA;
    let redB;
    let greenB;
    let blueB;
    let alphaB;
    if (isString(aA))
        aA = (hexColorToInt(aA) < 256) ? hexColorToInt(aA) / 255 : 1;
    if (isString(aB))
        aB = (hexColorToInt(aB) < 256) ? hexColorToInt(aB) / 255 : 1;
    alphaA = aA;
    alphaB = aB;
    if (cA.length === 6)
    {
        redA = hexColorToInt(aA.substr(0,2));
        greenA = hexColorToInt(aA.substr(2,2));
        blueA = hexColorToInt(aA.substr(4,2));
    } else if (cA.length === 3)
    {
        redA = hexColorToInt(aA.substr(0,1) + aA.substr(0,1));
        greenA = hexColorToInt(aA.substr(1,1) + aA.substr(1,1));
        blueA = hexColorToInt(aA.substr(2,1) + aA.substr(2,1));
    }
    if (cB.length === 6)
    {
        redB = hexColorToInt(aB.substr(0,2));
        greenB = hexColorToInt(aB.substr(2,2));
        blueB = hexColorToInt(aB.substr(4,2));
    } else if (cB.length === 3)
    {
        redB = hexColorToInt(aB.substr(0,1) + aB.substr(0,1));
        greenB = hexColorToInt(aB.substr(1,1) + aB.substr(1,1));
        blueB = hexColorToInt(aB.substr(2,1) + aB.substr(2,1));
    }
    let alphaC = alphaA + alphaB * (1 - alphaA);
    let redC = Math.round((redA * alphaA + redB * alphaB * (1 - alphaA)) / alphaC);
    let greenC = Math.round((greenA * alphaA + greenB * alphaB * (1 - alphaA)) / alphaC);
    let blueC = Math.round((blueA * alphaA + blueB * alphaB * (1 - alphaA)) / alphaC);
    let alphaHex = (intColorToHex(Math.round(alphaC * 255)) !== "ff") ? intColorToHex(Math.round(alphaC * 255)) : "";
    if (output === "#")
    {
        return "#"+intColorToHex(redC)+intColorToHex(greenC)+intColorToHex(blueC)+alphaHex;
    } else if (output === "0x")
    {
        return hexColorToInt(intColorToHex(redC)+intColorToHex(greenC)+intColorToHex(blueC)+alphaHex);
    } else if (output === "[]")
    {
        return [redC, greenC, blueC, alphaC];
    } else if (output === "{}")
    {
        return {r: redC, g: greenC, b: blueC, a: alphaC};
    } else {
        return false;
    }
}

function genOddShapePath(px, py, hMin, vMin, step, minMin, scaleX = 1, scaleY = 1, hMax = false, vMax = false, minMax = false, maxMin = false, maxMax = false)
{
    let h = rng(hMin,hMax,3);
    let v = rng(vMin,vMax,3);
    let posX = 0;
    let posY = 0;
    let cords = [];
    for (let x = -h; x <= h; x += step)
    {
        let y1 = sqrt((1 - (pow(xx - posX,2) / pow(h,2))) * pow(v,2)) + posY;
        let y2 = -sqrt((1 - (pow(xx - posX,2) / pow(h,2))) * pow(v,2)) + posY;
        cords.push(
            {
                x: x,
                y: y1,
                ang: toDeg(angle({x: x, y: y1})),
            }
        );
        cords.push(
            {
                x: x,
                y: y2,
                ang: toDeg(angle({x: x, y: y2})),
            }
        );
    }
    cords = sortArrayByKey(cords, "ang");
    let newDist = 0;
    let count = cords.length;
    let maxDist = 0;
    let minDist = 99999999999;
    for (let c in cords)
    {
        let dist = distance({x: cords[c].x, y: cords[c].y});
        cords[c].dist = dist;
        let a1, a2, b1, b2, c1, c2;
        if (!minMax)
        {
            a1 = minMin;
            a2 = minMin;
        } else {
            a1 = rng(minMin, minMax,3);
            a2 = rng(minMin, minMax,3);
        }
        if (!maxMin)
        {
            c1 = a1;
            c2 = a2;
        } else {
            if (!maxMax)
            {
                b1 = maxMin;
                b2 = maxMin;
            } else {
                b1 = rng(maxMin, maxMax,3);
                b2 = rng(maxMin, maxMax,3);
            }
            c1 = rng(-a1, b1, 3);
            c2 = rng(-a2, b2, 3);
        }
        if (c < count / 2)
        {
            newDist += c1;
        } else if (c > count / 2) {
            newDist -= c2;
        }
        if (newDist > maxDist)
            maxDist = newDist;
        if (newDist < minDist)
            minDist = newDist;
        let nX = cosDeg(cords[c].ang) * (dist + newDist);
        let nY = sinDeg(cords[c].ang) * (dist + newDist);
        cords[c].nX = nX;
        cords[c].nY = nY;
    }

    let path = [];
    for (let k in cords)
    {
        path.push((hMin + maxDist + px + cords[k].nX) * scaleX);
        path.push((py + cords[k].nY) * scaleY);
    }
    return [path, minDist, maxDist];
}

function genEggShapePath(px, py, h, v, step, z, zAcc, scaleX = 1, scaleY = 1)
{
    let cords = [];
    let maxYDist = 0;
    let minXDist = 99999999999;
    let maxXDist = 0;
    for (let x = -h; x <= h; x += step)
    {
        let y1 = z * sqrt((1 - (pow(x, 2) / pow(h, 2))) * pow(v, 2));
        let y2 = z * -sqrt((1 - (pow(x, 2) / pow(h, 2))) * pow(v, 2));
        let yDist = abs(y1 - y2);
        if (yDist > maxYDist)
            maxYDist = yDist;
        z += (zAcc / step);
        cords.push(
            {
                x: x * scaleX,
                y: y1 * scaleY,
                ang: toDeg(angle({x: x * scaleX, y: y1 * scaleY})),
                dist: distance({x: x * scaleX, y: y1 * scaleY}),
            }
        );
        cords.push(
            {
                x: x * scaleX,
                y: y2 * scaleY,
                ang: toDeg(angle({x: x * scaleX, y: y2 * scaleY})),
                dist: distance({x: x * scaleX, y: y2 * scaleY}),
            }
        );
    }
    cords = sortArrayByKey(cords, "ang");
    for (let k in cords)
    {
        let dist = cords[k].dist;
        if (dist > maxXDist)
            maxXDist = dist;
        if (dist < minXDist)
            minXDist = dist;
    }
    let path = [];
    for (let k in cords)
    {
        path.push(px + cords[k].x);
        path.push(py + cords[k].y);
    }
    return [path, minXDist, maxXDist, maxYDist];
}

function getXYKey(pos)
{
    let xyKey = "";
    if (pos.x >= 0)
    {
        xyKey += "p" + pos.x;
    } else {
        xyKey += "n" + Math.abs(pos.x);
    }
    if (pos.y >= 0)
    {
        xyKey += "_p" + pos.y;
    } else {
        xyKey += "_n" + Math.abs(pos.y);
    }
    return xyKey;
}

function getXYPos(xyKey)
{
    let data = xyKey.split("_");
    let xData = data[0];
    let yData = data[1];
    let x = parseInt(xData.substr(1));
    if (xData.substr(0, 1) === "n")
    {
        x = parseInt(xData.substr(1)) * -1;
    }
    let y = parseInt(yData.substr(1));
    if (yData.substr(0, 1) === "n")
    {
        y = parseInt(yData.substr(1)) * -1;
    }
    return {x: x, y: y};
}
