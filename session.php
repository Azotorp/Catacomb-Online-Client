<?php
header('Content-Type: application/json; charset=utf-8');
define("THISPAGE", "session");
require("lib/init.php");
$jsonData = post("jsonData", get("jsonData", false));
$jsonDataKey = post("jsonDataKey", get("jsonDataKey"));
$gen = post("gen", get("gen", 0));
$do = post("do", get("do", ""));
$auth = post("auth", get("auth", 0));
$authusername = post("authusername", get("authusername", 0));
$authkey = post("authkey", get("authkey", 0));
$authuserid = post("authuserid", get("authuserid", 0));

if (!verifyauthkey($auth,$authusername,$authuserid,$authkey))
{
    $auth = 0;
    $authusername = "";
    $authuserid = 0;
    $authkey = "";
}

if ($auth < $access_levels["Member"])
{
    echo json_encode(array("result" => "error"));
    exit;
}

if ($jsonData && $jsonDataKey)
{
    if (sha1($jsonData.SECRETSALT.$authuserid) == $jsonDataKey)
    {
        echo json_encode(array("result" => "auth"));
    } else {
        echo json_encode(array("result" => "error"));
    }
}

if ($jsonData && $gen == 1)
{
    echo json_encode(array("dataKey" => sha1($jsonData.SECRETSALT.$authuserid)));
}

if ($do == "getJsonData")
{
    $binding = array(":id", $authuserid);
    $data = sqlqry2($serverSQL, "select * from `cloud_save` where `user_id` = :id", $binding);
    if ($data)
    {
        echo json_encode(array("jsonData" => base64_encode($data["jsonData"]), "jsonDataKey" => $data["jsonDataKey"]));
    } else {
        echo json_encode(array("result" => "error"));
    }
}

if ($do == "setJsonData")
{
    $binding = array(":id", $authuserid);
    $data = sqlqry($serverSQL, "select * from `cloud_save` where `user_id` = :id", $binding);
    $binding = array(
        array(":id", $authuserid),
        array(":jsonData", base64_decode($jsonData)),
        array(":jsonDataKey", sha1($jsonData.SECRETSALT.$authuserid)),
    );
    if ($data)
    {
        sqlexe($serverSQL, "UPDATE `cloud_save` SET `jsonData` = :jsonData, `jsonDataKey` = :jsonDataKey WHERE `user_id` = :id", $binding);
        echo json_encode(array("result" => "updated"));
    } else {
        sqlexe($serverSQL, "INSERT INTO `cloud_save` (`user_id`, `jsonData`, `jsonDataKey`) VALUES (:id, :jsonData, :jsonDataKey)", $binding);
        echo json_encode(array("result" => "inserted"));
    }
}

