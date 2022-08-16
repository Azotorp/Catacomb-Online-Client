<?php
if (!defined("THISPAGE")) {
    exit;
}

function get_item_img($id, $size = "small")
{
    if ($id !== 0)
    {
        $path = HOMEDIR."/images/icons/items/".$size;
        $image = $path."/".$id.".jpg";
        if (!file_exists($image)) {
            $html = file_get_contents("https://classicdb.ch/?item=$id");
            preg_match_all('/\<div id="icon'.$id.'-generic" style="float\: left" onclick="ShowIconName\(\'(.*?)\'\)"\>\<\/div\>/',$html,$data);
            $icon = $data[1];
            $icon = $icon[0];
            $download = "https://classicdb.ch/images/icons/$size/$icon.jpg";
            file_put_contents($image, file_get_contents($download));
            $icon = "https://".FULLWEBPATH."/images/icons/items/$size/$id.jpg";
        } else {
            $icon = "https://".FULLWEBPATH."/images/icons/items/$size/$id.jpg";
        }
        return $icon;
    } else {
        return false;
    }
}