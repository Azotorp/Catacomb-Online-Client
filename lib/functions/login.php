<?php
if (!defined("THISPAGE")) {
    exit;
}
function getdiscordauth($userid, $sid, $ip)
{
    global $serverSQL, $access_levels;
    $binding = array(
        array(":userid", $userid),
        array(":sid", $sid),
    );
    $checkuser = sqlqry2($serverSQL, "select * from `user_auth` where `user_id` = :userid and `user_auth_key` = :sid", $binding);
    $auth = 0;
    if ($checkuser)
    {
        $access_level = $checkuser["access_level"];
        $access_token = $checkuser["access_token"];
        get_user($access_token);
        $discord_user_id = $_SESSION["user_id"];
        $discord_username = $_SESSION["username"];
        $discord_discrim = $_SESSION["discrim"];
        $discord_access_token = $_SESSION["access_token"];
        $discord_avatar = $_SESSION["user_avatar"];
        $discord_user_auth_key = $_SESSION['user_auth_key'];
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
        sqlexe($serverSQL, "UPDATE `user_auth` SET `username` = :username, `discriminator` = :discrim, `access_token` = :access, `user_auth_key` = :userauth, `discord_avatar` = :avatar, `last_ip` = :ip, `last_login` = :time WHERE `user_id` = :userid", $binding);
        $_SESSION["avatar_uri"] = "https://cdn.discordapp.com/avatars/".$_SESSION['user_id']."/".$_SESSION['user_avatar'].is_animated($_SESSION['user_avatar']);
        $auth = (isset($access_levels[$access_level])) ? $access_levels[$access_level] : 0;
    }
    return $auth;
}

function verifyauthkey($level,$user,$userid,$key)
{
    global $serverSQL, $access_levelids;
    if (!$user || !$level || !$key || !$userid)
        return false;
    $user = explode("#", $user);
    //echo "<script>console.log('ALvl: ".$access_levelids[$level]."')</script>";
    $binding = array(
        array(":level", $access_levelids[$level]),
        array(":id", $userid),
    );
    $username = $user[0]."#".$user[1];
    $sid = sqlqry2($serverSQL, "select `user_auth_key` from `user_auth` where `user_id` = :id and `access_level` = :level", $binding);
    if ($sid)
    {
        if ($key != sha1($level.SECRETSALT.$username.SECRETSALT.$userid.SECRETSALT.$sid))
        {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}