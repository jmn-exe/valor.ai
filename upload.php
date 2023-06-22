<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Valor.ai | Upload</title>
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
            <a href="./php/logout.php" class="logged-user">
                <?php
                echo $_SESSION["username"];
                ?>
            </a>
        </div>
        <div class="main-body">
            <div class="section-nav">
                <a href="" class="current-page">Upload</a>
                <a href="./summary.php">Summary</a>
                <a href="./match_history.php">Match history</a>
                <a href="">Learn</a>
            </div>
            <span class="vertical-line"></span>
            <div class="section-upload">
                <form class="upload-box flex-center" action="./upload-analysis.php" method="get" enctype='multipart/form-data'>
                    <div class="upload-drag-drop">
                        <input type="file" class="upload-input" name="videofile" id="videofile" accept="video/*">
                    </div>
                    <button type="submit" class="button-style">Upload</button>
                </form>
            </div>
        </div>
    </div>
</body>
</html>