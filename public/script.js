function checkPopupPos(mistake){
    var popup = mistake.childNodes[1];
    bottomBound = popup.getBoundingClientRect().bottom;
    console.log(popup.getBoundingClientRect().bottom);
    console.log(window.innerHeight);
    if(bottomBound > window.innerHeight){
        popupPos = window.innerHeight - bottomBound - 30;
        console.log(popupPos);
        popup.style.top = popupPos + "px";
    }
}

function showConfirmation(){
    var confirmationBox = document.getElementById("confirmationBox");
    confirmationBox.style.display = "inline";
}

function hideConfirmation(){
    var confirmationBox = document.getElementById("confirmationBox");
    confirmationBox.style.display = "none";
}

function showDiscardConfirm(){
    var confirmationBox = document.getElementById("discardConfirm");
    confirmationBox.style.display = "inline";
}

function hideDiscardConfirm(){
    var confirmationBox = document.getElementById("discardConfirm");
    confirmationBox.style.display = "none";
}


function showMessage(msg,mode){
    
    var fadingMsg = document.createElement("div");
    fadingMsg.innerHTML = msg;
    fadingMsg.classList.add("fading-msg");
    switch(mode){
        case "alert":
            fadingMsg.style.backgroundColor = 'rgb(231, 205, 53)';
            break;
        case "warning":
            fadingMsg.style.backgroundColor = 'rgb(221, 59, 59)';
            break;
        case "success":
            fadingMsg.style.backgroundColor = 'rgb(69, 194, 44)';
            break;
    }
    document.body.appendChild(fadingMsg);
    setTimeout(function(){
        fadingMsg.classList.add("fade-animation");
        setTimeout(function(){
            fadingMsg.remove();
        },1000)
    },1000);
}
