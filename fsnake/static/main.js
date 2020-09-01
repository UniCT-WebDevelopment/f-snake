var square_dim = 20;
var field_dimX = ($( '#field' ).width()/square_dim) - 1;
var field_dimY = ($( '#field' ).height()/square_dim) - 1;
var refreshinterval = $('#fps').val();
var game_started = false;
var color_changed = false;
var snake_color;
var username = $('#username').text();
var score = 0;

class Snake{
    constructor(){
        this.position = [2,0];
        this.body = [[2,0],[1,0],[0,0]];
        this.direction = "RIGHT";
        this.changeDirectionTo = this.direction;
    }
    changeDirTo(dir){
        if((dir=="RIGHT")&&(!(this.direction == "LEFT"))){
            this.direction = "RIGHT";
        }
        if((dir=="LEFT")&&(!(this.direction == "RIGHT"))){
            this.direction = "LEFT";
        }
        if((dir=="UP")&&(!(this.direction == "DOWN"))){
            this.direction = "UP";
        }
        if((dir=="DOWN")&&(!(this.direction == "UP"))){
            this.direction = "DOWN";
        }
    }
    move(foodpos){
        if (this.direction == "RIGHT") this.position[0]+=1;
        if (this.direction == "LEFT") this.position[0]-=1;
        if (this.direction == "UP") this.position[1]-=1;
        if (this.direction == "DOWN") this.position[1]+=1;
        this.body.unshift([this.position[0], this.position[1]]); //... this.body.unshift(this.position)
        if((this.position[0] == foodpos[0]) && (this.position[1] == foodpos[1])){
            return 1;
        } else {
            this.body.pop();
            return 0;
        }
    }
    checkCollision(){
        if((this.position[0] > field_dimX) || (this.position[0] < 0)){
            return 1;
        } else if ((this.position[1] > field_dimY) || (this.position[1] < 0)){
            return 1;
        }
        for(let i = 1; i < this.body.length; i++){
            if((this.position[0]==this.body[i][0])&&
                (this.position[1]==this.body[i][1])){
                return 1;
            }
        }
        return 0;
    }
}

class FoodSpawner{
    constructor(){
        this.position = [Math.floor(Math.random() * field_dimX) + 1,Math.floor(Math.random() * field_dimY) + 1];
        this.isFoodOnScreen = true;       
    }
    spawnFood(){
        if(this.isFoodOnScreen == false){
            this.position = [Math.floor(Math.random() * field_dimX) + 1,Math.floor(Math.random() * field_dimY) + 1];
            this.isFoodOnScreen = true;
        }
        return this.position;
    }
    setFoodOnScreen(b){
        this.isFoodOnScreen = b;
    }
}

function loadImages(imagefiles) {
    // Initialize variables
    loadcount = 0;
    loadtotal = imagefiles.length;
    preloaded = false;
    
    // Load the images
    var loadedimages = [];
    for (var i=0; i<imagefiles.length; i++) {
        // Create the image object
        var image = new Image();

        // Add onload event handler
        image.onload = function () {
            loadcount++;
            if (loadcount == loadtotal) {
                // Done loading
                preloaded = true;
            }
        };
        
        // Set the source url of the image
        image.src = imagefiles[i];
        
        // Save to the image array
        loadedimages[i] = image;
    }
    
    // Return an array of images
    return loadedimages;
}

function change_snake_color(ctx){
    var imageData = ctx.getImageData(0, 0, $( '#field' ).width(), $( '#field' ).height());
    
    for (var i=0;i<imageData.data.length;i+=4){
        //old rgb
        if(imageData.data[i]>110 && imageData.data[i]<=115 &&
            imageData.data[i+1]>177 && imageData.data[i+1]<=182 &&
            imageData.data[i+2]>108 && imageData.data[i+2]<=113){ //primary
            // new rgb
            imageData.data[i]=snake_color.r;
            imageData.data[i+1]=snake_color.g;
            imageData.data[i+2]=snake_color.b;
        }
        // else if(imageData.data[i]>101 && imageData.data[i]<111 &&
        //     imageData.data[i+1]>153 && imageData.data[i+1]<163 && 
        //     imageData.data[i+2]>99 && imageData.data[i+2]<109){ //second
        //     // new rgb
        //     imageData.data[i]=181*(4/5);
        //     imageData.data[i+1]=54*(4/5);
        //     imageData.data[i+2]=58*(4/5);
        // }
        // else if(imageData.data[i]==76 && 
        //     imageData.data[i+1]==112 && 
        //     imageData.data[i+2]==75){ //third
        //     // new rgb
        //     imageData.data[i]=181*(5/6);
        //     imageData.data[i+1]=54*(5/6);
        //     imageData.data[i+2]=58*(5/6);
        // }
    }
    ctx.putImageData(imageData,0,0);
}

function new_game(){
    var started = true;
    $("#username_input").remove();
    document.getElementById('start').style.display = "none";
    document.getElementById('save_score').style.display = "none";
    document.getElementById('field').style.display = "grid";
    var snake = new Snake();
    var foodsp = new FoodSpawner();
    score = 0;
    document.getElementById("score").innerHTML = (score) + ' apples';
    var tileimage = loadImages(["/static/snake-graphics.png"])[0];
    const cvs = document.getElementById('field');
    const ctx = cvs.getContext('2d');

    document.addEventListener("keydown", direction);

    function direction(event){
        if((event.keyCode == 37)&&(snake.direction != "RIGHT")){
            snake.direction = "LEFT";
        } else if((event.keyCode == 38)&&(snake.direction != "DOWN")){
            snake.direction = "UP";
        } else if((event.keyCode == 39)&&(snake.direction != "LEFT")){
            snake.direction = "RIGHT";
        } else if((event.keyCode == 40)&&(snake.direction != "UP")){
            snake.direction = "DOWN";
        }
    }

    function draw() {
        ctx.fillStyle = "#f7e697";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        foodpos = foodsp.spawnFood();
        if (snake.move([foodpos[0], foodpos[1]]) == 1){
            document.getElementById("score").innerHTML = (++score) + ' apples';
            foodsp.setFoodOnScreen(false);
        }
        drawSnake(snake, ctx, tileimage);
        ctx.drawImage(tileimage, 0*64, 3*64, 64, 64, foodpos[0]*square_dim, foodpos[1]*square_dim, square_dim, square_dim);
        if(color_changed) change_snake_color(ctx);

        if(snake.checkCollision()==1){
            clearInterval(game);
            game_over();
        }
    }

    if(started){
        var game = setInterval(draw, refreshinterval);
        started = false;
    }
}

function drawSnake(snake, ctx, tileimage){
    for(let i = 0; i < snake.body.length; i++){
        // sprite column and row
        var tx = 0;
        var ty = 0;

        if(i==0){
            //head
            if(snake.direction == "UP"){
                tx = 3; ty = 0;
            }
            if(snake.direction == "RIGHT"){
                tx = 4; ty = 0;
            }
            if(snake.direction == "DOWN"){
                tx = 4; ty = 1;
            }
            if(snake.direction == "LEFT"){
                tx = 3; ty = 1;
            }
        } else if (i == snake.body.length-1){
            //coda
            var pseg = snake.body[i-1];

            if(pseg[1] < snake.body[i][1]){ //Up
                tx = 3; ty = 2;
            } else if(pseg[0] > snake.body[i][0]){ //Right
                tx = 4; ty = 2;
            } else if(pseg[1] > snake.body[i][1]){ //Left
                tx = 4; ty = 3;
            } else if(pseg[0] < snake.body[i][0]){ //Down
                tx = 3; ty = 3;
            }
        } else {
            //body
            var pseg = snake.body[i-1];
            var nseg = snake.body[i+1];

            if (pseg[0] < snake.body[i][0] && nseg[0] > snake.body[i][0] || nseg[0] < snake.body[i][0] && pseg[0] > snake.body[i][0]) {
                // Horizontal Left-Right
                tx = 1; ty = 0;
            } else if (pseg[0] < snake.body[i][0] && nseg[1] > snake.body[i][1] || nseg[0] < snake.body[i][0] && pseg[1] > snake.body[i][1]) {
                // Angle Left-Down
                tx = 2; ty = 0;
            } else if (pseg[1] < snake.body[i][1] && nseg[1] > snake.body[i][1] || nseg[1] < snake.body[i][1] && pseg[1] > snake.body[i][1]) {
                // Vertical Up-Down
                tx = 2; ty = 1;
            } else if (pseg[1] < snake.body[i][1] && nseg[0] < snake.body[i][0] || nseg[1] < snake.body[i][1] && pseg[0] < snake.body[i][0]) {
                // Angle Top-Left
                tx = 2; ty = 2;
            } else if (pseg[0] > snake.body[i][0] && nseg[1] < snake.body[i][1] || nseg[0] > snake.body[i][0] && pseg[1] < snake.body[i][1]) {
                // Angle Right-Up
                tx = 0; ty = 1;
            } else if (pseg[1] > snake.body[i][1] && nseg[0] > snake.body[i][0] || nseg[1] > snake.body[i][1] && pseg[0] > snake.body[i][0]) {
                // Angle Down-Right
                tx = 0; ty = 0;
            }
        }
        ctx.drawImage(tileimage, tx*64, ty*64, 64, 64, snake.body[i][0]*square_dim, snake.body[i][1]*square_dim, square_dim, square_dim);
    }
}

function game_over(){
    document.getElementById('start').style.top = "26%";
    document.getElementById('start').style.display = "block";
    document.getElementById('save_score').style.display = "block";
}

function save_score(){
    if(username == "Guest"){
        $("#divbtn").append('<div id="regform">\
            <form id="myform">\
                <div class="containerform">\
                <h1 class=".txtgdy">Register or login</h1>\
                <p class=".txtgdy">Please fill in this form to create an account.</p>\
                <hr>\
                <label for="username"><b>Username</b></label>\
                <input type="text" placeholder="Enter username" name="usr" required>\
                <label for="psw"><b>Password</b></label>\
                <input type="password" placeholder="Enter Password" name="psw" required>\
                <hr>\
                <button class="registerbtn" onclick="regorlog(this)">Register</button>\
                <button class="registerbtn" onclick="regorlog(this)">Login</button>\
                </div>\
            </form>\
        </div>');
        $("#myform").submit(function(e){
            e.preventDefault();
        });
        $('#regform').css({
            'position': 'absolute',
            'left': '35%'
        });
        $('.containerform').css({
            'padding': '16px',
            'background-color': '#fdf9ee' //heard
        });
        $('input[type=text], input[type=password]').css({
            'width': '95%',
            'padding': '15px',
            'margin': '5px 0 22px 0',
            'display': 'inline-block',
            'border': 'none',
            'background': '#f1f1f1',
            'font-family': '"Work Sans", "sans-serif"'
        });
        $('input[type=text]:focus, input[type=password]:focus').css({
            'background-color': '#ddd',
            'outline': 'none',
            'font-family': '"Work Sans", "sans-serif"'
        });
        $('hr').css({
            'border': '1px solid #f1f1f1',
            'margin-bottom': '25px'
        });
        $('.registerbtn').css({
            'display': 'inline-block',
            'background-color': '#4CAF50',
            'color': 'white',
            'padding': '16px 20px',
            'margin': '8px 0',
            'border': 'none',
            'cursor': 'pointer',
            'width': '49.5%',
            'opacity': '0.9',
            'font-family': '"Work Sans", "sans-serif"'
        });
        $('.registerbtn:hover').css({'opacity': '1'});
        $('.txtgdy').css({'font-family': '"Work Sans", sans-serif'});
    } else {
        save(username);
    }
    document.getElementById('start').style.top = "40%";
    document.getElementById('save_score').style.display = "none";
}

function regorlog(el) {
    usr = $("#myform :input[name='usr']").val();
    var entry = {
        username : usr,
        password : $("#myform :input[name='psw']").val(),
        score : score,
        type : 'single'
    };
    if(el.textContent == "Register"){
        fetch('../registration', {
            method : "POST",
            credentials : "include",
            body : JSON.stringify(entry),
            cache : "no-cache",
            headers : new Headers({
                "contentType" : "application/json; charset=utf-8"
            })
        })
        .then(function (response){
            if(response.status !== 200){
                $("#myform :input[name='usr']").val('');
                $("#myform :input[name='usr']").attr("placeholder", "Username taken!");
                return;
            }else{
                username = usr;
                $("#regform").remove();
                $('#username').text(usr);
            }
        });
    } else {
        fetch('../login', {
            method : "POST",
            credentials : "include",
            body : JSON.stringify(entry),
            cache : "no-cache",
            headers : new Headers({
                "contentType" : "application/json; charset=utf-8"
            })
        })
        .then(function (response){
            if(response.status !== 200){
                response.json().then(function (data) {
                    console.log(data.message);
                    if(data.message == "username doesn't exist"){
                        $("#myform :input[name='usr']").val('');
                        $("#myform :input[name='usr']").attr("placeholder", "Username doesn't exist");
                    }else{
                        $("#myform :input[name='psw']").val('');
                        $("#myform :input[name='psw']").attr("placeholder", "wrong password!");
                    }
                    return;
                })
            }else {
                username = usr;
                $("#regform").remove();
                $('#username').text(usr);
            }
        });
    }
}

function save(){
    $.ajax({
        type : 'POST',
        url : "../savescore",
        contentType: 'application/json;charset=UTF-8',
        data : JSON.stringify({'score' : score, 'type' : 'single'}),
    });
}

let toggleNavStatus = false;

let toggleNav = function(){
    let sidebar = $(".nav-sidebar");
    let spans = $(".nav-side-span");
    let lab = $(".side-lab");
    let inp = $(".side-inp");
    let bubble = $(".bubble");

    if(!toggleNavStatus){
        spans.css('opacity', '1');
        sidebar.width("250px");
        for(let i = 0; i < lab.length; i++) lab.css('opacity', '1');
        for(let i = 0; i < inp.length; i++) inp.css('opacity', '1');
        for(let i = 0; i < bubble.length; i++) bubble.css('opacity', '1');
        toggleNavStatus = true;
    } else if(toggleNavStatus){
        spans.css('opacity', '0');
        sidebar.width("27px");
        for(let i = 0; i < lab.length; i++) lab.css('opacity', '0');
        for(let i = 0; i < inp.length; i++) inp.css('opacity', '0');
        for(let i = 0; i < bubble.length; i++) bubble.css('opacity', '0');
        toggleNavStatus = false;
    }
}

const allRanges = document.querySelectorAll(".range-wrap");
allRanges.forEach(wrap => {
    const range = wrap.querySelector(".side-inp");
    const bubble = wrap.querySelector(".bubble");

    range.addEventListener("input", () => {
    setBubble(range, bubble);
    });
    setBubble(range, bubble);
});

function setBubble(range, bubble) {
    const val = range.value;
    const min = range.min ? range.min : 0;
    const max = range.max ? range.max : 100;
    const newVal = Number(((val - min) * 100) / (max - min));
    try{
        bubble.innerHTML = val;
        // Sorta magic numbers based on size of the native UI thumb
        bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
    } catch(e){
        //color input non ha una bubble.
    }
}

$('#X').on('change', function () {
    if(!game_started){
        $("#divcanv").remove();
        $("#score").remove();
        $(".parent_field").append("<div id='divcanv'><canvas id='field' width='"+$('#X').val()+"' height='"+$('#Y').val()+"'></canvas></div>\
                                <div class='div_score'><p id='score'></p></div>");
        field_dimX = ($('#X').val()/square_dim) - 1;
        $("#field").css('display', 'grid');
        const cvs = document.getElementById('field');
        const ctx = cvs.getContext('2d');
        ctx.fillStyle = "#f7e697";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
    }
});

$('#Y').on('change', function () {
    if(!game_started){
        $("#divcanv").remove();
        $("#score").remove();
        $(".parent_field").append("<div id='divcanv'><canvas id='field' width='"+$('#X').val()+"' height='"+$('#Y').val()+"'></canvas></div>\
                                <div class='div_score'><p id='score'></p></div>");
        field_dimY = ($('#Y').val()/square_dim) - 1;
        $("#field").css('display', 'grid');
        const cvs = document.getElementById('field');
        const ctx = cvs.getContext('2d');
        ctx.fillStyle = "#f7e697";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
    }
});

$('#fps').on('change', function () {
    if(!game_started){
        refreshinterval = $('#fps').val();
    }
});

$('#favcolor').on('change', function(){
    snake_color = hexToRgb($('#favcolor').val());
    color_changed = true;
});

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}