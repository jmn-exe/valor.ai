<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Valor.ai | Summary</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
    <?php
        session_start();
        if(!isset($_SESSION["loggedin"])){
            $_SESSION["unauthorized"] = true;
            header("location: index.php");
        }
    ?>
</head>
<body>
    <div class="white-background"></div>
    <div class="body-container">
        <div class="top-header">
            <a href="./upload.php" class="logo-title">Valor.ai</a>
            <a href="./php/logout.php" class="logged-user"><?php echo $_SESSION["username"]; ?></a>
        </div>
        <div class="main-body">
            <div class="section-nav">
                <a href="./upload.php">Upload</a>
                <a href="" class="current-page">Summary</a>
                <a href="./match_history.php">Match history</a>
                <a href="">Learn</a>
            </div>
            <span class="vertical-line"></span>
            <div class="section-summary">
                <div class="section-title">Summary</div>
                <div class="summary-container">
                    <div class="summary-instance">
                        <div class="summary-instance-title">Stats</div>
                        <table class="summary-instance-info">
                            <tr>
                                <td>Average mistakes per match</td>
                                <td>20.7</td>
                            </tr>
                            <tr>
                                <td>Total mistakes analyzed</td>
                                <td>62</td>
                            </tr>
                            <tr>
                                <td>Total match analyzed</td>
                                <td>3</td>
                            </tr>
                            <tr>
                                <td>Percentage change</td>
                                <td>+14.5%</td>
                            </tr>
                        </table>
                    </div>
                    <div class="summary-instance">
                        <div class="summary-instance-title">Stats</div>
                        <table class="summary-instance-info">
                            <tr>
                                <td>Average mistakes per match</td>
                                <td>20.7</td>
                            </tr>
                            <tr>
                                <td>Total mistakes analyzed</td>
                                <td>62</td>
                            </tr>
                            <tr>
                                <td>Total match analyzed</td>
                                <td>3</td>
                            </tr>
                            <tr>
                                <td>Percentage change</td>
                                <td>+14.5%</td>
                            </tr>
                        </table>
                    </div>
                    <div class="summary-instance">
                        <div class="summary-instance-title">Stats</div>
                        <table class="summary-instance-info">
                            <tr>
                                <td>Average mistakes per match</td>
                                <td>20.7</td>
                            </tr>
                            <tr>
                                <td>Total mistakes analyzed</td>
                                <td>62</td>
                            </tr>
                            <tr>
                                <td>Total match analyzed</td>
                                <td>3</td>
                            </tr>
                            <tr>
                                <td>Percentage change</td>
                                <td>+14.5%</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>