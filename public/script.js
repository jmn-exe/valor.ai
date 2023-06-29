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

function showMessage(msg){
    var fadingMsg = document.createElement("div");
    fadingMsg.innerHTML = msg;
    fadingMsg.classList.add("fading-msg");
    document.body.appendChild(fadingMsg);
    setTimeout(function(){
        fadingMsg.classList.add("fade-animation");
        setTimeout(function(){
            fadingMsg.remove();
        },1000)
    },1000);
}

