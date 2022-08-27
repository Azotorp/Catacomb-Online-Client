<?php
define("THISPAGE", "game");
session_start();
require("lib/init.php");
if (!verifyauthkey($auth,$authusername,$authuserid,$authkey))
{
    $auth = 0;
    $authuserid = 0;
    $authusername = "";
    $authkey = "";
    $authIP = "";
}
if ($auth < $access_levels["Member"])
{
    //$_SESSION["post_Login_redirect"] = "game.php";
    header("Location: https://".FULLWEBPATH.LOGIN_PAGE);
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Zombie SHooter Multiplayer Test</title>
    <style>
        body {
            background: #000000;
            margin:0;
            padding:0;
            overflow:hidden;
            text-align: center;
        }

        canvas {
            display:block;
        }

        #frame {
        }
        .offline {
            color: red;
            width: 100%;
            top: 100px;
            font-size: 30px;
            font-weight: bold;
            position: relative;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
<!doctype html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="manifest" href="site.webmanifest">
    <link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <title>Zombie Top Down Shooter</title>
    <link rel="stylesheet" href="css/style.css" type="text/css" />
</head>
<body>
<span class="offline" style="display: none">Sorry server is offline.</span>
<div id="frame"></div>
<script src="js/socket.io.min.js"></script>
<script src="js/jquery.min.js"></script>
<script src="js/p2.min.js"></script>
<script src="js/pixi-core-6.5.1.min.js"></script>
<script src="js/pixi-filters-4.1.6.js"></script>
<script src="js/pixi-input-1.0.1-min.js"></script>
<script src="js/pixi-layers-1.0.11.umd.js"></script>
<script src="js/pixi-sound-4.2.0.js"></script>
<script src="js/crypto-js.min.js"></script>
<script src="game/misc.js"></script>
<script>
    function dump(input)
    {
        console.log(input);
    }

    function now(last = 0)
    {
        return window.performance.now() - last;
    }

    function isDefined(x)
    {
        return typeof x !== "undefined";
    }
    const playerScale = <?php echo $settings["playerScale"]; ?>;
    const gridSize = <?php echo $settings["gridSize"]; ?> * playerScale;
    let mapSize = {
        x: <?php echo $settings["mapWidth"]; ?>,
        y: <?php echo $settings["mapHeight"]; ?>,
    };
    const AUTH_LEVEL = <?php echo $auth; ?>;
    const AUTH_USERNAME = "<?php echo $authusername; ?>";
    const AUTH_USERID = "<?php echo $authuserid; ?>";
    const AUTH_KEY = "<?php echo $authkey; ?>";
    const AUTH_IP = "<?php echo $authIP; ?>";
    const DISCORD_AVATAR = "<?php echo $discordAvatar; ?>";
    const socketIOHost = "<?php echo SOCKET_IO_HOST; ?>";
    const socketIOPort = "<?php echo SOCKET_IO_PORT; ?>";
</script>
<script src="game/globals.js"></script>
<script src="game/textStyles.js"></script>
<script src="game/drawFunc.js"></script>
<script src="game/filters.js"></script>
<script src="game/keyBindings.js"></script>
<script src="game/mouse.js"></script>
<script src="game/setup.js"></script>
<script src="game/main.js"></script>
<script src="game/physics.js"></script>
<script src="game/socketEvents.js"></script>
<script src="game/gameObjectFunc.js"></script>
<script src="game/keyBindFunc.js"></script>
</body>
</html>