function checkEmail(){
    var mailName=document.getElementById("mailName");
    var nameOK=false;

    var mailAddress=document.getElementById("mailAddress");
    var addressOK=false;

    mailText=document.getElementById("mailText");
    var textOK=false;
    var mailcopy=document.getElementById("mailcopy");

    if (mailName.value.length != 0){
        nameOK=true;
        document.getElementById("nameError").style.display="none";
    }
    else{
        document.getElementById("nameError").style.display="flex";
        console.log('!!');
    }
    if (mailAddress.value.length != 0 && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mailAddress.value)){
        addressOK=true;
        document.getElementById("addressError").style.display="none";
    }
    else{
        document.getElementById("addressError").style.display="flex";
    }
    if (mailText.value.length != 0){
        textOK=true;
        document.getElementById("textError").style.display="none";
    }
    else{
        document.getElementById("textError").style.display="flex";
    }
    if (nameOK==true && addressOK==true && textOK==true){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/email', true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.onreadystatechange = function(){
            if(xhr.readyState === XMLHttpRequest.DONE){
                alert(xhr.response);
                if(xhr.status==200){
                    mailName.value="";
                    mailAddress.value="";
                    mailText.value="";  
                }
            }
        }
        var jsonToSend = {
            name: mailName.value,
            address: mailAddress.value,
            text: mailText.value,
            copy: mailcopy.checked
        }
        xhr.send(JSON.stringify(jsonToSend));  
    }
}
