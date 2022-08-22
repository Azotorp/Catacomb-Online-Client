function brightnessFilter(b)
{
    let filter = new PIXI.filters.ColorMatrixFilter();
    if (b > 0)
    {
        filter.matrix = [
            1-b, 0, 0, 0, b,
            0, 1-b, 0, 0, b,
            0, 0, 1-b, 0, b,
            0, 0, 0, 1, 0];
    } else {
        filter.matrix = [
            1, 0, 0, 0, b,
            0, 1, 0, 0, b,
            0, 0, 1, 0, b,
            0, 0, 0, 1, 0];
    }
    return filter;
}

function thermalVisionFilter(intensity, multiply = true)
{
    let filter = new PIXI.filters.ColorMatrixFilter();
    let matrix = [
        // row 1
        11.224130630493164 * intensity,
        -4.794486999511719 * intensity,
        -2.8746118545532227 * intensity,
        0 * intensity,
        0.40342438220977783 * intensity,
        // row 2
        -3.6330697536468506 * intensity,
        9.193157196044922 * intensity,
        -2.951810836791992 * intensity,
        0 * intensity,
        -1.316135048866272 * intensity,
        // row 3
        -3.2184197902679443 * intensity,
        -4.2375030517578125 * intensity,
        7.476448059082031 * intensity,
        0 * intensity,
        0.8044459223747253 * intensity,
        // row 4
        0, 0, 0, 1, 0,
    ];
    filter._loadMatrix(matrix, multiply);
    return filter;
}

function resetFilter()
{
    let filter = new PIXI.filters.ColorMatrixFilter();
    let matrix = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0,
    ];
    filter._loadMatrix(matrix, false);
    return filter;
}

function desaturateFilter()
{
    let filter = new PIXI.filters.ColorMatrixFilter();
    filter.desaturate();
    return filter;
}

function invertFilter()
{
    let filter = new PIXI.filters.ColorMatrixFilter();
    filter.negative();
    return filter;
}

function hueFilter(hue, multiply = true)
{
    let filter = new PIXI.filters.ColorMatrixFilter();
    filter.hue(hue, multiply);
    return filter;
}
/*
function applyResetFilter(obj, alpha = 1, tint = 0xffffff, aboveVision = false)
{
    obj.filters = [resetFilter()];
    if (isDefined(obj.permFilters) && obj.permFilters.length > 0)
    {
        obj.filters = obj.permFilters;
    }
    obj.alpha = alpha;
    obj.tint = tint;
    if (aboveVision)
    {
        if (isDefined(obj.defaultParentLayer))
        {
            obj.defaultParentLayer.removeChild(obj);
            gameObject.aboveVisionLayer.addChild(obj);
            obj.currentParentLayer = gameObject.aboveVisionLayer;
            obj.defaultParentLayer.sortChildren();
        }
    } else {
        if (isDefined(obj.defaultParentLayer))
        {
            gameObject.aboveVisionLayer.removeChild(obj);
            obj.defaultParentLayer.addChild(obj);
            obj.currentParentLayer = obj.defaultParentLayer;
            obj.defaultParentLayer.sortChildren();
        }
    }
}
*/

function applyMaskFilters(masks)
{
    let allMasks = [];
    for (let mask in masks)
    {
        allMasks.push(new PIXI.SpriteMaskFilter(masks[mask]));
    }
    return allMasks;
}

function applyBlurFilter(blur)
{
    return new PIXI.filters.BlurFilter(blur);
}
/*
function applyNightVisionFilter(obj, tint = 0x00aa00, brightness = 0.2, alpha = 1, aboveVision = false)
{
    if (!nightVision)
        return;
    obj.filters = [brightnessFilter(brightness)];
    if (isDefined(obj.permFilters) && obj.permFilters.length > 0)
    {
        for (let f in obj.permFilters)
        {
            obj.filters.push(obj.permFilters[f]);
        }
    }
    obj.tint = tint;
    obj.alpha = alpha;
    if (aboveVision)
    {
        if (isDefined(obj.defaultParentLayer))
        {
            obj.defaultParentLayer.removeChild(obj);
            gameObject.aboveVisionLayer.addChild(obj);
            obj.currentParentLayer = gameObject.aboveVisionLayer;
            obj.defaultParentLayer.sortChildren();
        }
    } else {
        if (isDefined(obj.defaultParentLayer))
        {
            gameObject.aboveVisionLayer.removeChild(obj);
            obj.defaultParentLayer.addChild(obj);
            obj.currentParentLayer = obj.defaultParentLayer;
            obj.defaultParentLayer.sortChildren();
        }
    }
}

function applyThermalVisionFilter(obj, bodyHeat = 0, brightness = 0.2, alpha = 1, tint = 0xff8000, aboveVision = true)
{
    if (!thermalVision)
        return;
    if (bodyHeat > 0)
    {
        obj.filters = [brightnessFilter(brightness), thermalVisionFilter(bodyHeat)];
    } else {
        obj.filters = [brightnessFilter(brightness)];
    }
    obj.alpha = alpha;
    obj.tint = tint;
    if (isDefined(obj.permFilters) && obj.permFilters.length > 0)
    {
        for (let f in obj.permFilters)
        {
            obj.filters.push(obj.permFilters[f]);
        }
    }
    if (aboveVision)
    {
        if (isDefined(obj.defaultParentLayer))
        {
            obj.defaultParentLayer.removeChild(obj);
            gameObject.aboveVisionLayer.addChild(obj);
            obj.currentParentLayer = gameObject.aboveVisionLayer;
            obj.defaultParentLayer.sortChildren();
        }
    } else {
        if (isDefined(obj.defaultParentLayer))
        {
            gameObject.aboveVisionLayer.removeChild(obj);
            obj.defaultParentLayer.addChild(obj);
            obj.currentParentLayer = obj.defaultParentLayer;
            obj.defaultParentLayer.sortChildren();
        }
    }
}

function applySonarVisionFilter(obj, sonarReflectAble = true, brightness =  0.6, alpha = 1, tint = 0x00aaff, aboveVision = true)
{
    if (!sonarVision)
        return;
    if (sonarReflectAble)
    {
        obj.filters = [brightnessFilter(brightness), desaturateFilter()];
    } else {
        obj.filters = [brightnessFilter(brightness)];
    }
    obj.alpha = alpha;
    if (isDefined(obj.permFilters) && obj.permFilters.length > 0)
    {
        for (let f in obj.permFilters)
        {
            obj.filters.push(obj.permFilters[f]);
        }
    }
    if (aboveVision)
    {
        if (isDefined(obj.defaultParentLayer))
        {
            obj.defaultParentLayer.removeChild(obj);
            gameObject.aboveVisionLayer.addChild(obj);
            obj.currentParentLayer = gameObject.aboveVisionLayer;
            obj.defaultParentLayer.sortChildren();
        }
    } else {
        if (isDefined(obj.defaultParentLayer))
        {
            gameObject.aboveVisionLayer.removeChild(obj);
            obj.defaultParentLayer.addChild(obj);
            obj.currentParentLayer = obj.defaultParentLayer;
            obj.defaultParentLayer.sortChildren();
        }
    }
}
*/
function applyOutlineFilter(obj, thickness, color, quality, zoomed = true)
{
    let zoomMulti = 1;
    if (zoomed)
    {
        if (zoom < 1)
        {
            thickness *= 2 / zoom;
            zoomMulti = zoom;
        } else if (zoom > 1)
        {
            thickness /= 2 / zoom;
            zoomMulti = 1 / zoom;
        }
    }
    return new PIXI.filters.OutlineFilter(thickness * zoomMulti, color, quality);
}