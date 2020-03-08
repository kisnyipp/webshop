/* function login(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/login', true);
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
           alert(xhr.response);
        }
    }
    var data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    }
    xhr.send(JSON.stringify(data));
} */

var loadFile = function(event) {
    var output = document.getElementById('output');
    output.style.display ="block";
    output.src = URL.createObjectURL(event.target.files[0]);
};

function showTextbox(){
    var customCheckbox = document.getElementById("egyeb");
    customCheckbox.addEventListener( 'change', function() {
        if(this.checked) {
            document.getElementById("defineLabels").style.display="block";
        } 
        else {
            document.getElementById("defineLabels").style.display="none";
        }
    });
}

function showPreview(type){
    document.getElementsByTagName("BODY")[0].style.overflow = "hidden";
    document.getElementsByClassName("previewWindow")[0].style.display = "flex";
    document.getElementsByClassName("previewBackground")[0].style.display = "flex";
    if (type == 'product')
        showProductPreview();
    else if (type == 'news')
        showNewsPreview();
}

function  showNewsPreview(){
    var missingInfo = false;
    console.log( document.getElementsByClassName("previewWindow")[0].style.display);
    var title = document.getElementById("newsTitle").value;
    var shortText = document.getElementById("shortText").value;
    var longText = document.getElementById("longText").value;
    document.getElementsByClassName("previewWindow")[0].innerHTML =
    `<div class="news">
        <div class="imagediv" onclick="showText(0)"></div>
        <div class="textdiv">
            <h3>${title}</h3>
            <p>${shortText} </p>
            <p class="hiddenP">${longText}</p>
            <h4 class="showButton"  onclick="showText(0)">Részletek</h4>
        </div>
    </div>
    <div style="display: flex; justify-content: center; align-items: flex-start; width: 100%; height: 50px; align-self: flex-end;">
            <input type="button" value="Módosítás" onclick="hidePreview()">
            <input type="button" value="Feltöltés!" id="uploadNews" >
    </div>`
    var img = document.getElementsByClassName("imagediv")[0];
    img.style.backgroundImage = `url(${document.getElementById('output').src})`;
    
    document.getElementById("uploadNews").addEventListener("click", function(){
        if (title.length == 0 || shortText.length == 0 || longText == 0){  //  ha longText nincs, részletek gombot levenni
            missingInfo = true;
        }
        if(missingInfo == false){
           uploadNews(title, shortText, longText);
        }
        else{
            alert("Nem töltöttél ki egy kötelező mezőt. Kattints a Módosítás gombra!");
            return;
        }
    }); 
}

function  showProductPreview(){
    var photo = document.getElementById("uploadedImg").files[0];
    if (photo == undefined){
        alert("Nem töltöttél fel képet!");
        hidePreview();
        return;
    }
    var fileType = photo.name.split('.')[1];
    if (fileType != ("jpg" || "jpeg")){
        alert("Rossz képformátum. A színfelismerő csak JPG-t kezel. ");
        hidePreview();
        return;
    }
    
    var name = document.getElementById("name").value;
    var description = document.getElementById("description").value;
    var price = document.getElementById("price").value;
    var category = document.getElementById("category").value;

    var labels = [];
    for (var i = 0; i<document.getElementsByClassName("productLabels").length; i++){
        if (document.getElementsByClassName("labelCheckbox")[i].checked == true){
            labels.push(document.getElementsByClassName("productLabels")[i].textContent);
        }
    }

    if(document.getElementById("egyeb").checked == true && document.getElementById("defineLabels").value.length>0){
        labels.push(document.getElementById("defineLabels").value);
    }

     var preview = document.getElementsByClassName("previewWindow")[0];
    preview.innerHTML = 
        `<div style="display: flex; width: 100%; height: 100%;">
            <div style="display: flex; flex-direction: column; flex-wrap: wrap; width: 80%; height: 100%; margin: 15px;">
                <h3>${name}</h3><p class=errText id="noName" style="color: red">Nem adtál meg nevet!</p>
                <div style="width: 50%; height: 45%" id="productImgContainer"><img style='height: 100%; width: 100%; object-fit: contain' id="previewImg"/></div>
                <p>${description}<p><p class=errText id="noDescription" style="color: red">Nem adtál meg leírást! (nem kötelező)</p><br>
                <h4>Ár: ${price} Ft</h4><p class=errText id="noPrice" style="color: red">Nem adtál meg árat, vagy hibás!</p><p class=errText id="lowPrice" style="color: red">Alacsony ár, ellenőrizd!</p>
                <p>Kategória: ${category}</p><p class=errText id="noCategory" style="color: red">Válassz kategóriát!</p>
                <p>Címkék: ${labels}</p><p class=errText id="noLabels" style="color: red">Ha nem adsz meg címkét, a termék nehezen megtalálható lesz (nem kötelező)</p>
            </div> 
            <div class="news" style="padding: 0; text-align: center; margin-left: auto"><div class="imagediv productimg"> </div>
            <h4 class="price"> ${name}</h4>
            <h4 class="price">Ár: ${price} Ft</h4>
            </div> 
        </div>
        <div style="display: flex; justify-content: center; align-items: flex-start; width: 100%; height: 50px; align-self: flex-end;">
            <input type="button" value="Módosítás" onclick="hidePreview()">
            <input type="button" value="Feltöltés!" id="uploadProduct" >
        </div>`;
        /* onclick='uploadProduct(${price},"${category}","${labels}",${missingInfo})' */
    document.getElementById("uploadProduct").addEventListener("click", function(){
        if(missingInfo == false)
        {
            uploadProduct(name, price, category, labels);
        }
        else{
            alert("Nem töltöttél ki egy kötelező mezőt. Kattints a Módosítás gombra!");
            return;
        }
    }); 
    var previewImg = document.getElementById("previewImg");
    previewImg.src = document.getElementById('output').src;
    var productimg = document.getElementsByClassName("productimg")[0];
    productimg.style.backgroundImage = `url(${previewImg.src})`;
    document.getElementsByClassName("previewWindow")[0].style.display = "flex";
    document.getElementsByClassName("previewBackground")[0].style.display = "flex";
    var missingInfo = false;

    if (name.length == 0){
        document.getElementById("noName").style.display = "block";
        missingInfo = true;
    }
    if (price.length == 0 || price == "0" || /^\d+$/.test(price) == false || price[0] == "0") {
        document.getElementById("noPrice").style.display = "block";
        missingInfo = true;
    }
    if (price.length>0 && price.length<3) {
        document.getElementById("lowPrice").style.display = "block";
    }
    if (description.length == 0){
        document.getElementById("noDescription").style.display = "block";
        /* missingInfo=true; */                                           // kötelező legyen?
    }
    if (category == "none"){
        document.getElementById("noCategory").style.display = "block";
        missingInfo = true;
    }
    if (labels.length == 0){
        document.getElementById("noLabels").style.display = "block";
    }     
}

function uploadNews(title, shortText, longText){
    var photo = document.getElementById("uploadedImg").files[0];                   
    var formData = new FormData();
    formData.append('photo', photo);
    var content= title + '*' + shortText + '*' + longText + '*';
    var headers = new Headers();
    console.log(content);
    headers.append('content', content);
    
    fetch('/uploadNews', {
        method: 'POST',
        headers: headers,
        body: formData
    }).then(response => {
        if (response.status == 200){
            alert("Cikk feltöltve!");
            hidePreview();
        }
        else{
            alert("Hiba történt!");
        }
    }) 
}

function hidePreview(){
    document.getElementsByTagName("BODY")[0].style.overflow = "visible";
    document.getElementsByClassName("previewWindow")[0].style.display = "none";
    document.getElementsByClassName("previewBackground")[0].style.display = "none";
}

function uploadProduct(name, price,category,labels){
    var photo = document.getElementById("uploadedImg").files[0];                   
    var formData = new FormData();
    formData.append('photo', photo);

    fetch('/uploadProduct', {
        method: 'POST',
        headers: new Headers({
            'name' : name,
            'price': price,
            'category': category,
            'labels': labels
        }),
        body: formData
    }).then(response => {
        if (response.status == 200){
            alert("Termék feltöltve!");
            hidePreview();
        }
        else{
            alert("Hiba történt!");
        }
    }) 
}