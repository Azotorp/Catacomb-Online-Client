<?php
//$ts_start = microtime(true);
if (!defined("THISPAGE")) {
    exit;
}
date_default_timezone_set('America/Vancouver');
error_reporting(E_ALL);
ini_set('display_errors', '0');
/*
if (THISPAGE == "logout" || THISPAGE == "login")
{
    header("Expires: Tue, 01 Jan 2000 00:00:00 GMT");
    header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");
} else {
    $seconds_to_cache = 3600 * 1;
    $ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";
    header("Expires: $ts");
    header("Cache-Control: max-age=$seconds_to_cache");
    header("Pragma: cache");
}*/
//ob_start("ob_gzhandler");
require("config/config.php");
require("data.php");


$cli = false;
$sapi_type = php_sapi_name();
$subdomain = str_replace(".".DOMAINNAME, "", $_SERVER["HTTP_HOST"]);
if ($subdomain == $_SERVER["HTTP_HOST"])
{
    define("SUBDOMAIN", "");
    define("HTTPHOST", "https://".DOMAINNAME);
    define("FULLDOMAIN", DOMAINNAME);
} else {
    define("SUBDOMAIN", $subdomain);
    define("HTTPHOST", "https://".SUBDOMAIN.".".DOMAINNAME);
    define("FULLDOMAIN", SUBDOMAIN.".".DOMAINNAME);
}
define("FULLWEBPATH", FULLDOMAIN.WEBPATH);
define("SITEURL", HTTPHOST.WEBPATH);

if(substr($sapi_type, 0, 3) == 'cli' || empty($_SERVER['REMOTE_ADDR'])) {
    $cli = true;
} else {
    if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == "off") {
        $redirect = 'https://'.FULLDOMAIN.$_SERVER['REQUEST_URI'];
        header("HTTP/1.1 301 Moved Permanently");
        header('Location: '.$redirect);
        exit;
    }
}

if ($_SERVER['HTTP_HOST'] != FULLDOMAIN && !$cli)
{
    $redirect = 'https://'.FULLDOMAIN.$_SERVER['REQUEST_URI'];
    header("HTTP/1.1 301 Moved Permanently");
    header('Location: ' . $redirect);
    exit;
}
require(HOMEDIR."/lib/sql/sql.php");
$serverSQL = new sql(SERVER_SQL_HOST, SERVER_SQL_USER, SERVER_SQL_PASS, SERVER_SQL_DB, SERVER_SQL_DRIVER, SERVER_SQL_DEBUG);
$clientSQL = new sql(CLIENT_SQL_HOST, CLIENT_SQL_USER, CLIENT_SQL_PASS, CLIENT_SQL_DB, CLIENT_SQL_DRIVER, CLIENT_SQL_DEBUG);



require(HOMEDIR."/lib/functions/main.php");
require(HOMEDIR."/lib/functions/login.php");
require(HOMEDIR."/lib/functions/discord.php");

$access_levelids = array();
$access_levels = array();

$authLvlData = sqlqry($serverSQL, "select * from `access_levels` order by `level`");
if ($authLvlData)
{
    foreach ($authLvlData as $lvls)
    {
        $access_levelids[] = $lvls["rank"];
        $access_levels[$lvls["rank"]] = $lvls["level"];
    }
}

$ip = get_ip();
if (THISPAGE != "logout")
{
    require(HOMEDIR."/inc/auth.php");
} else {
    $authusername = "";
    $authsid = "";
}


$settings = array();
$settings_data = sqlqry($serverSQL, "select * from `settings`");
if ($settings_data)
{
    foreach ($settings_data as $s)
    {
        $settings[$s["setting"]] = $s["value"];
    }
}