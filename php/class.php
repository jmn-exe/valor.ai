<?php
class FTP{
    private $ftpserver = "files.000webhost.com";
    private $username = "ecourse-portfolio";
    private $password = "Abc@12345";
    private $conn;
    private $login;
    private $ftppath = 'ftpstorage';
    private $ftpcheckpath;

    function connectFTP(){
        $this->conn = ftp_connect($this->ftpserver)or die("Failed to connect to FTP");
    }
    function loginFTP(){
        $this->login = ftp_login($this->conn, $this->username, $this->password)or die("Failed to login");
    }

    function uploadFile($tmppath,$newfile){
        $this->connectFTP();
        $this->loginFTP();
        ftp_pasv($this->conn,true)or die("Cannot switch to passive mode");
        $serverfilepath = $this->ftppath . '/' . $newfile;
        if(ftp_put($this->conn,$serverfilepath,$tmppath,FTP_BINARY)){
           echo "Successful upload!";
        }else{
            echo "File upload failed!";
        }
        ftp_close($this->conn);
    }

    function checkIfPathExist($path){
        $this->ftpcheckpath = "ftp://". $this->username.":". $this->password."@files.000webhost.com"."/".$this->ftppath."/".$path;
        $this->connectFTP();
        $this->loginFTP();
        ftp_pasv($this->conn,true)or die("Cannot switch to passive mode");
        if(is_dir($this->ftpcheckpath)){

        }else{
            if(ftp_mkdir($this->conn,$this->ftppath.'/'.$path)){
            }else{
                $pathdir = explode('/',$path);
                $predir = $this->ftppath;
                for($i = 0;$i < count($pathdir);$i++){
                    $predir .= '/'.$pathdir[$i];
                    if(ftp_mkdir($this->conn,$predir)){
                    }
                }
            }
        }
        ftp_close($this->conn);
    }
    function bruh($local,$remote){
        $handle = fopen($local, 'w');
        if(ftp_fget($this->conn,$handle,$this->ftppath.'/'.$remote,FTP_BINARY,0)){
            echo "file downloaded";
        }else{
            echo "download fail";
        }
        ftp_close($this->conn);
    }
}

class MYSQL{
    private $hostname;
    private $username;
    private $password;
    private $dbname;
    private $conn;

    private $tmpdocs = array();
    private $tmprevs = array();

    function __construct($host,$user,$pass,$db){
        $this->hostname = $host;
        $this->username = $user;
        $this->password = $pass;
        $this->dbname = $db;
    }
    function connectMYSQL(){
        $this->conn = mysqli_connect($this->hostname,$this->username,$this->password,$this->dbname);
    }
    function closeMYSQL(){
        mysqli_close($this->conn);
    }
    function execQuery($query){
        if(!($this->conn)){
            $this->connectMYSQL();
        }
        return mysqli_query($this->conn,$query);
    }
    function errMsg(){
        return mysqli_error($this->conn);
    }
    function prepare($q){
        return mysqli_prepare($this->conn,$q);
    }
    function fetchAll($result){
        return mysqli_fetch_all($result);
    }
}
?>