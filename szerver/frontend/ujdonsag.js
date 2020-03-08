function loadNews(page, insertPageButtons){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/readtext', true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            resText = JSON.parse(xhr.response);
            articlePerPage = resText['articlePerPage'];
            if(insertPageButtons){
                //insert page buttons
                var buttonContainer = document.getElementsByClassName("pageButtons")[0];
                for (var i = 0; i<resText.buttonNumber; i++){
                    buttonContainer.innerHTML += `<input type='button' value=${i+1} onclick='changePage("ujdonsag", ${i})'>`;   
                }
            }
            
            var newscontainer = document.getElementById("newscontainer");
            newscontainer.innerHTML = "";
            for (var i = 0; i<articlePerPage; i++){
                console.log(resText[i].image)
                newscontainer.innerHTML +=`
                    <div class="news">
                        <div class="imagediv" onclick="showText(${i})"></div>
                        <div class="textdiv">
                        </div>
                    </div>`
            }  
            for (var i = 0; i<articlePerPage; i++){
                var textdiv = document.getElementsByClassName("textdiv")[i];
                var imagediv = document.getElementsByClassName("imagediv")[i];
                /* resText[i] = decodeURI(resText[i]); */
                var text = resText[i].text.split("*", 3);
                imagediv.style.backgroundImage = `url('../cikkek/${resText[i].image}')`;
                if(resText[i].image == 0)
                {
                    imagediv.style.display = 'none';
                }
                textdiv.innerHTML = `<h3>${text[0]}</h3>`;
                textdiv.innerHTML += `<p>${text[1]}</p>`;
                textdiv.innerHTML += `<p class="hiddenP">${text[2]}</p>`;
                textdiv.innerHTML += `<h4 class="showButton"  onclick="showText(${i})">Részletek</h4>`
            }
        }
    };
    var pageNumber = {pageNumber: page}  
    xhr.send(JSON.stringify(pageNumber));
}

function showText(number){
    var text = document.getElementsByClassName("hiddenP")[number];
    var showButton = document.getElementsByClassName("showButton")[number];
    if(text.style.display == "flex"){
        text.style.display = "none";
        showButton.innerHTML = "Részletek";
    }   
    else{
        text.style.display = "flex";
        showButton.innerHTML = "Kevesebb";
    }
}
