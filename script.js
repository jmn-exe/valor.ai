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