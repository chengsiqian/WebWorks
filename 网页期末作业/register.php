<form action="" method="post">
    <p>用户名：<input type="text" name="username" value=""></p>
    <p>密码：<input type="text" name="password1" value=""></p>
    <p>确认密码：<input type="text" name="password2" value=""></p>
    <input type="submit"  value="注册">
</form>

<?php
session_start();
require("lineMysql.php");

if(!empty($_POST['username'])){
    $username = $_POST['username'];
    $password = $_POST['password1'];
    $select = $db->selectbyUser("user", $username);
    $rows=$db->rows($select);       #返回的结果集记录总数
    if(empty($rows)){
        if(!empty($_POST['password1'])){
            if($_POST['password1'] != $_POST['password2']){
                echo "<script>alert('两次输入密码不同！')</script>";
            }else{
                $db->insert("user","$username","$password");
                header('Location:registerSuccess.php');
            }
        }else{
            echo "<script>alert('请输入密码！')</script>";
        }
    }else{
        echo "<script>alert('该用户名已被注册！')</script>";
    }
}
?>
