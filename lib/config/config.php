<?php
if (!defined("THISPAGE")) {
    exit;
}

$homedir = explode("/lib/config",__DIR__);
define("HOMEDIR",$homedir[0]);
define("DOMAINNAME", "domain.com");
define("WEBPATH","/"); // relative to the domain name root. Must start and end with a slash unless there is no subfolder, then use "/"
define("SOCKET_IO_HOST", "localhost");
define("SOCKET_IO_PORT", "3000");
define("SERVER_SQL_HOST", "localhost");
define("SERVER_SQL_USER", "user");
define("SERVER_SQL_PASS", "pass");
define("SERVER_SQL_DB", "db");
define("SERVER_SQL_DRIVER", "mysql");
define("SERVER_SQL_DEBUG", false);
define("CLIENT_SQL_HOST", "localhost");
define("CLIENT_SQL_USER", "user");
define("CLIENT_SQL_PASS", "pass");
define("CLIENT_SQL_DB", "db");
define("CLIENT_SQL_DRIVER", "mysql");
define("CLIENT_SQL_DEBUG", false);
define("RECAPTCHA_SITEKEY", "");
define("RECAPTCHA_SECRETKEY", "");
define("SECRETSALT", "changeme123@#");
define("MAXAUTOLOGIN", 30); // days
define("LOGOUT_PAGE", "logout.php");
define("LOGIN_PAGE", "login.php");
define("DISCORD_AUTH_PAGE", "discordauth.php");
define("DISCORD_CLIENT_ID", "");
define("DISCORD_SECRET_ID", "");
define("DISCORD_SCOPES", "identify");
define("DISCORD_GUILD_ID", "");
define("DISCORD_REDIRECT_URL", "https://".DOMAINNAME.WEBPATH.DISCORD_AUTH_PAGE);
define("DISCORD_BOT_TOKEN", null);