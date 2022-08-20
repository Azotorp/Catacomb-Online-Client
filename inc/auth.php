<?php
if (!defined("THISPAGE")) {
    exit;
}

if (!isset($_SESSION["authusername"]) || !isset($_SESSION["authsid"]) || !isset($_SESSION["authuserid"])) {
    $authusername = getval("authusername");
    $authsid = getval("authsid");
    $authuserid = getval("authuserid");
    if ($authusername) {
        $_SESSION["authusername"] = $authusername;
    } else {
        $authusername = "";
    }
    if ($authsid) {
        $_SESSION["authsid"] = $authsid;
    } else {
        $authsid = "";
    }
    if ($authuserid) {
        $_SESSION["authuserid"] = $authuserid;
    } else {
        $authuserid = "";
    }
} else {
    if ($_SESSION["authusername"])
        $authusername = $_SESSION["authusername"];
    else
        $authusername = "";
    if ($_SESSION["authsid"])
        $authsid = $_SESSION["authsid"];
    else
        $authsid = "";
    if ($_SESSION["authuserid"])
        $authuserid = $_SESSION["authuserid"];
    else
        $authuserid = "";
}
$authIP = get_ip();
$auth = getdiscordauth($authuserid, $authsid, $authIP);
$discordAvatar = $_SESSION["avatar_uri"];
$authkey = sha1($auth.SECRETSALT.$authusername.SECRETSALT.$authuserid.SECRETSALT.$authsid);
$_SESSION["authlevel"] = $auth;
$_SESSION["authkey"] = $authkey;
