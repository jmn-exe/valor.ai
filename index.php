<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Valor.ai | Home</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>

</head>
<body>
    <?php
        session_start();
        if(isset($_SESSION["unauthorized"])){
            unset($_SESSION["unauthorized"]);
            echo '<script>showMessage("Please log in first!")</script>';
        }
        if(isset($_SESSION["loggedin"])){
            header("location: upload.php");
        }
        if(isset($_SESSION["wronglogin"])){
            unset($_SESSION["wronglogin"]);
            echo '<script>showMessage("Wrong login info!")</script>';
        }
    ?>

    <div class="white-background"></div>
    <div class="main-container flex-center">
        <div class="home-container">
            <div class="home-left-box flex-center">
                <h2 class="home-title">Valor.ai</h2>
                <div class="home-description">Valorant AI Coaching</div>
            </div>
            <div class="home-right-box flex-center">
                <div class="login-container flex-center">
                    <form class="login-box" action="./php/login.php" method="post">
                        <div class="login-title">
                            Login to your account
                        </div>
                        <div class="login-username-box">
                            <input type="text" name="uname" id="username" placeholder="Username" class="login-input">
                        </div>
                        <div class="login-password-box">
                            <input type="password" name="upwd" id="password" placeholder="Password" class="login-input"  autocomplete="off">
                        </div>
                        <div class="login-button-box">
                            <button type="submit"  class="login-btn">Login</button>
                            <button type="button" class="register-btn">Register</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>
</html>