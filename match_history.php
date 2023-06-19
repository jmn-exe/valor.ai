<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Valor.ai | Match history</title>
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
                <a href="./summary.php">Summary</a>
                <a href="" class="current-page">Match history</a>
                <a href="">Learn</a>
            </div>
            <span class="vertical-line"></span>
            <div class="section-summary">
                <div class="section-title">Match history</div>
                <div class="history-container">
                    <table class="history-table">
                        <tr>
                            <th>No.</th>
                            <th>Time/Date</th>
                            <th>Whiff</th>
                            <th>Dry</th>
                            <th>Cross</th>
                            <th>Total</th>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>13:57 - 12/12/2022</td>
                            <td>11</td>
                            <td>8</td>
                            <td>3</td>
                            <td>22</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>13:57 - 12/12/2022</td>
                            <td>11</td>
                            <td>8</td>
                            <td>3</td>
                            <td>22</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>13:57 - 12/12/2022</td>
                            <td>11</td>
                            <td>8</td>
                            <td>3</td>
                            <td>22</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</body>
</html>