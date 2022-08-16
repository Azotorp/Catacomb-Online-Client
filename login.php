<?php
define("THISPAGE", "login");
session_start();
require("lib/init.php");
$_SESSION["disc_auth"] = false;
if (!isset($_SESSION["login_redirect"]) || !$_SESSION["login_redirect"])
{
    if ($_SERVER['HTTP_REFERER'] != "https://".FULLWEBPATH.LOGIN_PAGE)
    {
        if ($_SERVER['HTTP_REFERER'])
            $_SESSION["login_redirect"] = $_SERVER['HTTP_REFERER'];
        else
            $_SESSION["login_redirect"] = "https://".FULLWEBPATH;
    } else {
        $_SESSION["login_redirect"] = "https://".FULLWEBPATH;
    }
}

if (!isset($_SESSION['user']))
{
    if (isset($_SESSION["invalid_state"]) || $_SESSION["invalid_state"])
    {
        $redir = $_SESSION["login_redirect"];
        $_SESSION["login_redirect"] = "";
        redirect($redir);
    } else {
        $_SESSION["disc_auth"] = true;
        redirect(discord_auth_url(DISCORD_CLIENT_ID, DISCORD_REDIRECT_URL, DISCORD_SCOPES));
    }
} else {
    $ip = get_ip();
    $discord_user_id = $_SESSION["user_id"];
    $discord_username = $_SESSION["username"];
    $discord_discrim = $_SESSION["discrim"];
    $discord_tag = $discord_username."#".$discord_discrim;
    $discord_access_token = $_SESSION["access_token"];
    $discord_avatar = $_SESSION["user_avatar"];
    $discord_user_auth_key = $_SESSION['user_auth_key'];
    $binding = array(":userid", $discord_user_id);
    $user_auth = sqlqry($sql, "select * from `user_auth` where `user_id` = :userid", $binding);
    if ($user_auth)
    {
        $binding = array(
            array(":userid", $discord_user_id),
            array(":username", $discord_username),
            array(":discrim", $discord_discrim),
            array(":access", $discord_access_token),
            array(":avatar", $discord_avatar),
            array(":ip", $ip),
            array(":time", time()),
            array(":userauth", $discord_user_auth_key),
        );
        sqlexe($sql, "UPDATE `user_auth` SET `username` = :username, `discriminator` = :discrim, `access_token` = :access, `user_auth_key` = :userauth, `discord_avatar` = :avatar, `last_ip` = :ip, `last_login` = :time WHERE `user_id` = :userid", $binding);
    } else {
        $binding = array(
            array(":userid", $discord_user_id),
            array(":username", $discord_username),
            array(":discrim", $discord_discrim),
            array(":access", $discord_access_token),
            array(":avatar", $discord_avatar),
            array(":ip", $ip),
            array(":time", time()),
            array(":userauth", $discord_user_auth_key),
        );
        sqlexe($sql, "INSERT INTO `user_auth` (`user_id`, `username`, `discriminator`, `access_token`, `user_auth_key`, `discord_avatar`, `last_ip`, `last_login`) VALUES (:userid, :username, :discrim, :access, :userauth, :avatar, :ip, :time)", $binding);
    }
    setval("authusername", $discord_tag, MAXAUTOLOGIN * 24 * 3600);
    setval("authsid", $discord_user_auth_key, MAXAUTOLOGIN * 24 * 3600);
    setval("authuserid", $discord_user_id, MAXAUTOLOGIN * 24 * 3600);
    $_SESSION["authusername"] = $discord_tag;
    $_SESSION["authsid"] = $discord_user_auth_key;
    $_SESSION["authuserid"] = $discord_user_id;
    $redir = $_SESSION["login_redirect"];
    $_SESSION["login_redirect"] = "";
    if (isset($_SESSION["post_login_redirect"]))
    {
        $redir = $_SESSION["post_login_redirect"];
        $_SESSION["post_login_redirect"] = "";
        unset($_SESSION["post_login_redirect"]);
    }
    redirect($redir);
}
