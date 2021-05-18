<form action="" method="post">
    <p>用户名：<input type="text" name="username" value=""></p>
    <p>密码：<input type="text" name="password" value=""></p>
    <input type="submit"  value="登录">
</form>
<a href="register.php">注册</a>

<?php
session_start();
require("lineMysql.php");

if(!empty($_POST['username'])){

    $username = $_POST['username'];
    $password = $_POST['password'];

    $select = $db->selectbyUser("user", $username);     # $db-> 调用实例化对象db中的方法
    $rows=$db->rows($select);       #返回的结果集记录总数 
    $assoc = $db->assoc($select);   #从结果集中取得一行作为关联数组

    if(empty($rows)){
        echo "<script>alert('该用户不存在！')</script>";
    }else{
        if($password==$assoc['password']){
            $_SESSION['username']=$username;
            header('Location:loginSuccess.php');
        }else{
            echo "<script>alert('密码错误！')</script>";
        }
    }
}
?>


