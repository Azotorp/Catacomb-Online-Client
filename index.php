<?php
define("THISPAGE", "index");
session_start();
require("lib/init.php");
?>
<center>
    <?php
    if ($auth > 0)
    {
        echo "Welcome ".$authusername."<br>";
    ?>
        <br>
        <a href="game.php">Play</a><br><br>
        <a href="logout.php">Logout</a><br>
    <?php
    } else {
    ?><br>
        <a href="login.php">Login</a><br>
    <?php
    }
    ?>
    <a href="https://github.com/Vzotorp">Catacomb Online @ GitHub</a>
</center>
