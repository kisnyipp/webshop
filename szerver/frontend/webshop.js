var selectedButton;
var body;
var mailText;

var articlePerPage;

var productlength;
var productPerPage;

function changeTitle(id){
    var selectedTitle = document.getElementById(id).textContent;
    document.getElementById("title").innerHTML = selectedTitle;
}

function selectButton(id){
    if (selectedButton != null){
        selectedButton.style.transform = "translateX(0px)";
        selectedButton.classList.add("menuEntry");
        selectedButton.classList.add("menuEntry:hover");
    }
    selectedButton = document.getElementById(id);
    selectedButton.style.transform = "translateX(-20px)";
    changeTitle(id);
    loadPage(id);
}

function index(){
    var index = document.getElementById("index");
    var logo = document.getElementById("logocontainer");
    var menu = document.getElementsByClassName("menu")[0];
    var screen = document.getElementsByClassName("screen")[0];

    var transD = '1s';
    index.style.transitionDuration = transD;
    index.style.width = "10%";
    index.style.height = screen.offsetHeight;
    index.style.display = "block";
    index.classList.add("sidepic");
    index.style.zIndex = "1";
    
    logo.style.transitionDuration = transD;
    logo.style.width = "185px"
    logo.style.height = logo.style.width;
    logo.style.left = "45%";
    logo.style.top = 5;
    
    menu.style.top = parseInt(logo.style.height)+24;
    menu.style.opacity = "1";
    
    body.style.overflow = "auto";
}

function init(){
    body = document.getElementsByTagName("BODY")[0];
    var logocontainer = document.getElementById("logocontainer");
    var logosize = body.offsetWidth*0.25
    var pozX = body.offsetWidth/2-logosize/2;
    var pozY = body.offsetHeight/2-logosize/2;
    logocontainer.style.left = pozX;
    logocontainer.style.top = pozY;
    logocontainer.style.width = logosize;
    logocontainer.style.height = logosize;
    logocontainer.onclick=index(); selectButton(`kesz`);
    /* logocontainer.innerHTML = "<img src='logo.png' width='100%' height='100%' style='cursor: pointer;' onclick='index(); selectButton(`kesz`)'> "; */
}

function loadPage(id){
    var pageContent = document.getElementById("pagecontent")/* document.getElementsByTagName("BODY")[0]; */
    console.log(id);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", id + '.html', true);
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200)
        {
            pageContent.innerHTML=xhr.responseText;
            if(id == "ujdonsag"){
                loadNews(0, true);
            }
            else if(id == "kesz")
            {
                listProducts(0, true);
                changeOrder();  
            }
            else if(id == "upload"){                    
                showTextbox();
            }
        }
        else{
            pageContent.innerHTML = "<h1>Feltöltés alatt!</h1>"  
        }
    }
    xhr.send(id);
}

window.onload = init;
