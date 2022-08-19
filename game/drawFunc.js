function drawLine(obj, x1, y1, x2, y2, lineColor, thickness = 1, lineAlpha = 1, clear = false, moveTo = true)
{
    if (clear)
        obj.clear();
    if (moveTo)
    {
        if (thickness === 1)
        {
            let lineStyle = 0.5;
            obj.lineStyle({native: true, width: thickness, color: lineColor, alignment: lineStyle, alpha: lineAlpha});
            obj.moveTo(x1, y1);
        } else {
            // angswap
            let lineAng = angle({x: x2, y: y2}, {x: x1, y: y1});
            x1 += cos(lineAng) * thickness / 2;
            y1 += sin(lineAng) * thickness / 2;
            x2 -= cos(lineAng) * thickness / 2;
            y2 -= sin(lineAng) * thickness / 2;
            let path = [
                x1 + cos(lineAng - toRad(90)) * thickness / 2,
                y1 + sin(lineAng - toRad(90)) * thickness / 2,

                x2 + cos(lineAng - toRad(90)) * thickness / 2,
                y2 + sin(lineAng - toRad(90)) * thickness / 2,

                x2 + cos(lineAng + toRad(90)) * thickness / 2,
                y2 + sin(lineAng + toRad(90)) * thickness / 2,

                x1 + cos(lineAng + toRad(90)) * thickness / 2,
                y1 + sin(lineAng + toRad(90)) * thickness / 2,
            ];
            //drawLine(obj, x1, y1, x2, y2, lineColor, 1, lineAlpha);
            drawPoly(obj, path, lineColor, 1, lineAlpha, lineColor, lineAlpha);
        }
    }
    if (thickness === 1)
    {
        obj.lineTo(x2, y2);
    }
}

function drawCircle(obj, x, y, radius, lineColor, thickness = 1, lineAlpha = 1, fillColor = false, fillAlpha = 1, clear = false)
{
    if (clear)
        obj.clear();
    let lineStyle = 0.5;
    obj.lineStyle({native: true, width: thickness, color: lineColor, alignment: lineStyle, alpha: lineAlpha});
    if (fillColor !== false)
        obj.beginFill(fillColor, fillAlpha);
    obj.drawCircle(x, y, radius);
    if (fillColor)
        obj.endFill();
}

function drawEllipse(obj, x, y, hRadius, vRadius, lineColor, thickness = 1, lineAlpha = 1, fillColor = false, fillAlpha = 1, clear = false)
{
    if (clear)
        obj.clear();
    let lineStyle = 0.5;
    obj.lineStyle({native: true, width: thickness, color: lineColor, alignment: lineStyle, alpha: lineAlpha});
    if (fillColor !== false)
        obj.beginFill(fillColor, fillAlpha);
    obj.drawEllipse(x, y, hRadius, vRadius);
    if (fillColor)
        obj.endFill();
}



function drawArc(obj, x, y, radius, startAngle, endAngle, lineColor, thickness = 1, lineAlpha = 1, native = true, clear = false, moveTo = true)
{
    if (clear)
        obj.clear();
    let arc = angleDist(startAngle, endAngle, true);
    let maxSeg = 32;
    let lineStyle = 0.5;
    obj.lineStyle({native: native, width: thickness, color: lineColor, alignment: lineStyle, alpha: lineAlpha});
    let cx, cy, ca;
    ca = startAngle;// - angleDist(startAngle, endAngle) / maxSeg;
    cx = x + cos(ca) * radius;
    cy = y + sin(ca) * radius;
    let ex = cx;
    let ey = cy;
    if (moveTo)
        obj.moveTo(cx, cy);
    for (let seg = 0; seg < maxSeg; seg++)
    {
        ca += arc / maxSeg;
        cx = x + cos(ca) * radius;
        cy = y + sin(ca) * radius;
        obj.lineTo(cx,cy);
    }
}

function drawPie(obj, x, y, radius, startAngle, endAngle, lineColor, thickness = 1, lineAlpha = 1, fillColor = false, fillAlpha = 1, native = true, clear = false)
{
    if (clear)
        obj.clear();
    if (fillColor !== false)
        obj.beginFill(fillColor, fillAlpha);
    let lineStyle = 0.5;
    obj.lineStyle({native: native, width: thickness, color: lineColor, alignment: lineStyle, alpha: lineAlpha});
    drawArc(obj, x, y, radius, startAngle, endAngle, lineColor, thickness, lineAlpha, native);
    let arc = angleDist(startAngle, endAngle, true);
    if (arc < toRad(360))
    {
        let px1 = x + cos(startAngle) * radius;
        let py1 = y + sin(startAngle) * radius;
        let px2 = x + cos(endAngle) * radius;
        let py2 = y + sin(endAngle) * radius;
        drawLine(obj, px2, py2, x, y, lineColor, thickness, lineAlpha, false, false);
        drawLine(obj, x, y, px1, py1, lineColor, thickness, lineAlpha, false, false);
    }
    if (fillColor)
        obj.endFill();

}

function drawRect(obj, x, y, w, h, borderColor, borderThickness = 1, borderAlpha = 1, fillColor = false, fillAlpha = 1, clear = false)
{
    if (clear)
        obj.clear();
    let lineStyle = 0;
    obj.lineStyle({native: true, width: borderThickness, color: borderColor, alignment: lineStyle, alpha: borderAlpha});
    if (fillColor !== false)
        obj.beginFill(fillColor, fillAlpha);
    obj.drawRect(x, y, w, h);
    if (fillColor)
        obj.endFill();
}

function drawRectGrad(obj, x, y, w, h, fromColor, toColor, direction = 0, fillAlpha = 1, clear = false)
{
    if (clear)
        obj.clear();
    let tex = createGradTexture(fromColor, toColor, x, y, w, h, 90);
    obj.lineStyle({native: true, width: 0, color: 0, alignment: 0, alpha: 0});
    obj.beginTextureFill({texture: tex});
    obj.drawRect(x, y, w, h);
    obj.alpha = fillAlpha;
    obj.endFill();
}

function drawPoly(obj, path, lineColor, lineThickness = 1, lineAlpha = 1, fillColor = false, fillAlpha = 1, clear = false)
{
    if (clear)
        obj.clear();
    let lineStyle = 0;
    obj.lineStyle({native: true, width: lineThickness, color: lineColor, alignment: lineStyle, alpha: lineAlpha});
    if (fillColor !== false)
        obj.beginFill(fillColor, fillAlpha);
    obj.drawPolygon(path);
    if (fillColor)
        obj.endFill();
}

function drawText(obj, string, append = false, newline = true, posX = false, posY = false, anchorX = false, anchorY = false)
{
    if (posX !== false && posY !== false)
    {
        obj.position = {x: posX, y: posY};
    }
    if (anchorX !== false && anchorY !== false)
    {
        obj.anchor = {x: anchorX, y: anchorY};
    }
    if (!append)
    {
        obj.text = string;
    } else {
        if (newline)
        {
            obj.text += "\n";
        }
        obj.text += string;
    }
}
