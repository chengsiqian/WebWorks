<?php
session_start();
if (isset($_SESSION['username'])) {
    echo '欢迎您，'.$_SESSION["username"];
}
?>
<br>
<a href="index.html">点击此处开始游戏！</a>
