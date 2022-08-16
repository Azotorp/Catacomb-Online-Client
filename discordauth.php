<?php
define("THISPAGE", "login");
session_start();
require("lib/init.php");
# Initializing all the required values for the script to work
if (isset($_SESSION["disc_auth"]) && $_SESSION["disc_auth"])
{
    if (discord_init(DISCORD_REDIRECT_URL, DISCORD_CLIENT_ID, DISCORD_SECRET_ID, DISCORD_BOT_TOKEN))
    {
        get_user();
        $_SESSION["avatar_uri"] = "https://cdn.discordapp.com/avatars/".$_SESSION['user_id']."/".$_SESSION['user_avatar'].is_animated($_SESSION['user_avatar']);

        # Adding user to guild | (guilds.join scope)
        # join_guild('SERVER_ID_HERE');

        # Fetching user guild details | (guilds scope)
        //$_SESSION['guild'] = get_guild($guild_id);

        # Redirecting to home page once all data has been fetched
        redirect(LOGIN_PAGE);
    } else {
        $_SESSION["invalid_state"] = true;
        redirect(LOGIN_PAGE);
    }
} else {
    redirect(LOGIN_PAGE);
}

