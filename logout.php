<?php
define("THISPAGE", "logout");
session_start();
require("lib/init.php");
$binding = array(":name", strtolower($_SESSION["authusername"]));
$_SESSION = array();
session_destroy();
setval("authusername", "", -3600);
setval("authsid", "", -3600);
if (!$_SERVER['HTTP_REFERER'])
{
    header("Location: https://".FULLWEBPATH);
} else {
    if ($_SERVER['HTTP_REFERER'] != "https://".FULLWEBPATH.LOGOUT_PAGE)
    {
        header("Location: ".$_SERVER['HTTP_REFERER']);
    } else {
        header("Location: https://".FULLWEBPATH);
    }
}