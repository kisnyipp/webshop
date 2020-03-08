var order='filename desc';
var keyword = undefined;
var filters=[];

function changeOrder(){
    var changeOrder= document.getElementById("changeOrder");
    changeOrder.addEventListener( 'change', function() {
        order=this.value;
        listProducts(0);
    });
}
function addKeyword(text){
    keyword=text;
    listProducts(0);
}

function removeAllKeywords(){
    keyword=undefined;
    listProducts(0);
}

function viewProduct(filename){
    fetch('/viewProduct', {
        method: 'POST',
        headers: new Headers({
            'filename': filename,
        })
    }).then((response) => {
        if (response.status==200){
            return response.json();
        }
        else{
            alert("Hiba történt!");
            return;
        }
    }).then((myJson) => {
        let views= myJson.viewed;
        alert(`Megtekintve ${views} alkalommal`);
    });
}

function listProducts(oldal){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/listproducts', true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            var productInfo = JSON.parse(xhr.response);
            let buttonContainer = document.getElementsByClassName("pageButtons")[0];
            buttonContainer.innerHTML = '';
            for (var i = 0; i<productInfo.buttonNumber; i++){
                buttonContainer.innerHTML += `<input type='button' value=${i+1} onclick='changePage("kesz", ${i})'>`;   
            }
            var productContainer = document.getElementById("productContainer");
            productContainer.innerHTML = "";

            for (let i = 0; i<productInfo.products.length; i++){
                productContainer.innerHTML +=
                `<div class="products" style="padding: 0; text-align: center;"><div class="imagediv productimg"> 
                    <div class="fadeinUp"><div class="fadeinUpShadow" onclick="viewProduct('${productInfo.products[i].filename}')"><h3>Részletek</h3></div></div>
                </div>
                <h4 class="name"></h4>
                <h4 class="price">Ár:</h4>
                <p class="labels"></p></div>`
            }
            for (let i = 0; i<productInfo.products.length; i++){
                var productimg=document.getElementsByClassName("productimg")[i];
                productimg.style.backgroundImage = `url('${productInfo.products[i].filename}')`;
                document.getElementsByClassName("fadeinUp")[i].style.backgroundColor = `rgb(${productInfo.products[i].color})`;
                document.getElementsByClassName("price")[i].innerHTML += " "+productInfo.products[i].price+" Ft/db";
                document.getElementsByClassName("name")[i].innerHTML = `<a onclick="viewProduct('${productInfo.products[i].filename}')">${productInfo.products[i].name}</a>`;
                if (productInfo.products[i].labels.length>0){
                    let labels = productInfo.products[i].labels.split(',');
                    for(let j = 0; j<labels.length; j++)
                    {
                        document.getElementsByClassName("labels")[i].innerHTML+=`<a class='productLabels' onclick="addKeyword('${labels[j]}')">${labels[j]}</a>, `;
                    }
                }
            }
        }
    }
    let requestInfo = {pageNumber: oldal,
                    order: order,
                    keyword: keyword}  
    xhr.send(JSON.stringify(requestInfo));
}

function changePage(id, page){
    console.log("lapozás: " + page);
    if (id == "ujdonsag")
        loadNews(page);
    else if(id == "kesz")
        listProducts(page);
}
