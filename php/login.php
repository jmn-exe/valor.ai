<?php
require_once("./class.php");
$id = trim($_POST["uname"]);
$pwd = trim($_POST["upwd"]);
//echo($id);
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "valorant_ai";

//$id = "usertest";

//$password = "usertest";
//$password = password_hash($password,PASSWORD_DEFAULT);

$MYSQL = new MYSQL($host,$user,$pass,$dbname);
//$insertq = 'INSERT INTO user(id,pwd) VALUES("usertest","'.$password.'");';
$verifyquery = 'SELECT * from user WHERE id="'.$id.'"';
$result = $MYSQL->execQuery($verifyquery)->fetch_row();
if(password_verify($pwd,$result[1])){
    session_start();
    $_SESSION["loggedin"] = true;
    $_SESSION["username"] = $id;
    
    header("location: ../upload.php");
}else{
    echo "something is wrong lol";
}


?>