var square_dim = 20;
var field_dimX = ($( '#field' ).width()/square_dim) - 1;
var field_dimY = ($( '#field' ).height()/square_dim) - 1;
var refreshinterval = $('#fps').val();
var heuristic = 2;
var game_started = false;
var game_started = false;
var color_changed = false;
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
    inbody(fpos){
        for(let i = 0; i < this.body.length; i++){
            if((fpos[0] == this.body[i][0])&&(fpos[1] == this.body[i][1])) return true;
        }
        return false;
    }
    get_body(){
        return Array.from(this.body);
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

class QElement { 
    constructor(element, priority) 
    { 
        this.element = element; 
        this.priority = priority; 
    } 
}

class PriorityQueue { 
    constructor(){ 
        this.items = []; 
    }
    enqueue(element, priority){ 
        var qElement = new QElement(element, priority); 
        var contain = false; 

        for (var i = 0; i < this.items.length; i++) { 
            if (this.items[i].priority < qElement.priority) { 
                // Once the correct location is found it is 
                // enqueued 
                this.items.splice(i, 0, qElement); 
                contain = true; 
                break; 
            } 
        } 
        if (!contain) { 
            this.items.push(qElement); 
        } 
    } 
    dequeue(){ 
        if (this.isEmpty()) return "Underflow"; 
        return this.items.pop(); 
    } 
    front(){ 
        if (this.isEmpty()) 
            return "No elements in Queue"; 
        return this.items[0]; 
    }
    rear(){ 
        if (this.isEmpty()) 
            return "No elements in Queue"; 
        return this.items[this.items.length - 1]; 
    }   
    isEmpty(){ 
        return this.items.length == 0; 
    }
    len(){
        return this.items.length;
    }
    isPresent(state){
        for(let i = 0; i < this.items.length; i++){
            if((this.items[i].element[0] == state[0]) && (this.items[i].element[1] == state[1])) return i;
        }
        return -1;
    }
    el_at(index){
        return this.items[index];
    }
    remove_at(index){
        this.items.splice(index, 1);
    }
} 

class State{
    constructor(parent, position, body){
        this.parent = parent;
        this.position = position;
        this.body = body;
        this.g = 0;
        this.h = 0;
        this.f = 0;
    }
    removeTail(){
        this.body.pop();
    }
    collision(pos){
        for(let i = 0; i < this.body.length; i++){
            if((this.body[i][0] == pos[0]) && (this.body[i][1] == pos[1])) return true;
        }
        return false;
    }
}

function astar(start, goal, dir, body){

    let start_state = new State(null, start, []);
    let goal_state = new State(null, goal, []);

    start_state.g = start_state.h = start_state.f = 0;
    goal_state.g = goal_state.h = goal_state.f = 0;
    
    explored_set = [];
    frontier = new PriorityQueue(); //coda di priorità

    let direction = dir;
    start_state.body = body;

    frontier.enqueue(start_state, start_state.f);

    var start = new Date();

    while(frontier.len() > 0){

        if(frontier.len() == 0){
            return [-1,-1];
        }
        
        let current_state = frontier.dequeue().element;

        let end = new Date();
        if (end - start > refreshinterval){
            console.log("taking too long");
            let path = [];
            let current = current_state;
            while(current.parent != null){
                path.push([current.position[0],current.position[1]]);
                current = current.parent;
            }
            return path;
        }

        if(current_state.parent != null){
            if((current_state.position[0] > current_state.parent.position[0]) && (current_state.position[1] == current_state.parent.position[1])){
                direction = "RIGHT";
            } else if ((current_state.position[0] < current_state.parent.position[0]) && (current_state.position[1] == current_state.parent.position[1])){
                direction = "LEFT";
            } else if ((current_state.position[0] == current_state.parent.position[0]) && (current_state.position[1] < current_state.parent.position[1])){
                direction = "UP";
            } else if ((current_state.position[0] == current_state.parent.position[0]) && (current_state.position[1] > current_state.parent.position[1])){
                direction = "DOWN";
            }
        }
        if((current_state.position[0] == goal_state.position[0]) && (current_state.position[1] == goal_state.position[1])){
            let path = [];
            let current = current_state;
            while(current.parent != null){
                path.push([current.position[0],current.position[1]]);
                current = current.parent;
            }
            return path;
        }

        explored_set.push(current_state);

        for(let i = 0; i < 4; i++){
            let inFrontier = false;
            let inExplored = false;
            let index = -1;
            if(i == 0) {
                new_position = [-1,0];
                if(direction == "RIGHT") continue;
            }
            if(i == 1) {
                new_position = [1,0];
                if(direction == "LEFT") continue;
            }
            if(i == 2){
                new_position = [0,1];
                if(direction == "UP") continue;
            }
            if(i == 3){
                new_position = [0,-1];
                if(direction == "DOWN") continue;
            } 
            
            let state_position = [current_state.position[0] + new_position[0], current_state.position[1] + new_position[1]];
            if(current_state.collision(state_position)) continue;
            if((state_position[0]>field_dimX) || (state_position[0]<0) || (state_position[1]>field_dimY) || (state_position[1]<0)) continue;

            new_state = new State(current_state, state_position, Array.from(current_state.body));
            let h;
            if(heuristic == 1)  h = Math.abs(state_position[0] - goal_state.position[0]) + Math.abs(state_position[1] - goal_state.position[1]); // Manhattam
            else if (heuristic >= 2) h = Math.sqrt((Math.pow(state_position[0]-goal_state.position[0],2))+(Math.pow(state_position[1]-goal_state.position[1],2))); // euclidea 
            let g = current_state.g + 1;
            let f = h + g;
            h = h*(1.0 * (1/50));
            if(heuristic == 4){
                let dx1 = state_position[0] - goal_state.position[0];
                let dy1 = state_position[1] - goal_state.position[1];
                let dx2 = start_state.position[0] - goal_state.position[0];
                let dy2 = start_state.position[1] - goal_state.position[1];
                let cross = Math.abs( dx1*dy2 - dx2*dy1 );
                h += cross*0.001;
            }

            index = frontier.isPresent(state_position);
            if(index != -1){
                inFrontier = true;
            }

            if(explored_set.length > 0){
                for(let i = 0; i < explored_set.length; i++){
                    if((explored_set[i][0] == state_position[0])&&(explored_set[i][1] == state_position[1])) inExplored = true;
                }
            }
            if((!inExplored)&&(!inFrontier)){
                new_state.g = g;
                new_state.h = h;
                new_state.f = f;
                new_state.body.unshift([state_position[0], state_position[1]]);
                new_state.removeTail();
                frontier.enqueue(new_state, new_state.f);
            } else if(inFrontier && (frontier.el_at(index).element.g > g)){
                new_state.g = g;
                new_state.h = h;
                new_state.f = f;
                new_state.body.unshift([state_position[0], state_position[1]]);
                new_state.removeTail()
                frontier.remove_at(index);
                frontier.enqueue(new_state, new_state.f);
            }
        }
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
    document.getElementById("score").innerHTML ='0 apples';
    game_started = true;
    $('#X').disabled = true;
    $('#Y').disabled = true;
    document.getElementById('start').style.display = "none";
    document.getElementById('field').style.display = "grid";
    var started = true;
    var snake = new Snake();
    var foodsp = new FoodSpawner();
    score = 0;
    var tileimage = loadImages(["/static/snake-graphics.png"])[0];

    const cvs = document.getElementById('field');
    const ctx = cvs.getContext('2d');

    var path = [];
    var needAstar = true;

    function draw(){
        ctx.fillStyle = "#f7e697";
        ctx.fillRect(0, 0, cvs.width, cvs.height);

        foodpos = foodsp.spawnFood();  
        while(snake.inbody(foodpos)){
            foodsp.setFoodOnScreen(false);
            foodpos = foodsp.spawnFood();
        }

        drawSnake(snake, ctx, tileimage);
        ctx.drawImage(tileimage, 0*64, 3*64, 64, 64, foodpos[0]*square_dim, foodpos[1]*square_dim, square_dim, square_dim);
        if(color_changed) change_snake_color(ctx);

        if(needAstar){
            path = astar([snake.position[0], snake.position[1]], foodpos, snake.direction, snake.get_body());
            needAstar = false;
        }

        if (path == null){
            console.log("rip");
            clearInterval(game);
            game_over();
        }else if(path[0] == -1){
            console.log("rip");
            clearInterval(game);
            game_over();
        } else if(path[0]==-2){
            needAstar=true;
        } else if(path.length > 0){
            var mossa = path.pop();
            if ((mossa[0] > snake.position[0]) && (mossa[1] == snake.position[1])) snake.changeDirTo('RIGHT');
            else if ((mossa[0] < snake.position[0]) && (mossa[1] == snake.position[1])) snake.changeDirTo('LEFT');
            else if ((mossa[0] == snake.position[0]) && (mossa[1] < snake.position[1])) snake.changeDirTo('UP');
            else if ((mossa[0] == snake.position[0]) && (mossa[1] > snake.position[1])) snake.changeDirTo('DOWN');
            if(path.length == 0) needAstar = true;
        }
        
        if (snake.move([foodpos[0], foodpos[1]]) == 1){
            document.getElementById("score").innerHTML = (++score) + ' apples';
            foodsp.setFoodOnScreen(false);
        }
        
        if(snake.checkCollision()==1){
            clearInterval(game);
            game_over();
        }
    }
    if(started){
        var game = setInterval(draw, refreshinterval);
        $('#X').disabled = false;
        $('#Y').disabled = false;
    }
}

function drawSnake(snake, ctx, tileimage){
    let tboby = snake.get_body();
    for(let i = 0; i < tboby.length; i++){
        // sprite column and row
        let tx = 0;
        let ty = 0;

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
        } else if (i == tboby.length-1){
            //coda
            let pseg = tboby[i-1];

            if(pseg[1] < tboby[i][1]){ //Up
                tx = 3; ty = 2;
            } else if(pseg[0] > tboby[i][0]){ //Right
                tx = 4; ty = 2;
            } else if(pseg[1] > tboby[i][1]){ //Left
                tx = 4; ty = 3;
            } else if(pseg[0] < tboby[i][0]){ //Down
                tx = 3; ty = 3;
            }
        } else {
            //body
            let pseg = tboby[i-1];
            let nseg = tboby[i+1];

            if (pseg[0] < tboby[i][0] && nseg[0] > tboby[i][0] || nseg[0] < tboby[i][0] && pseg[0] > tboby[i][0]) {
                // Horizontal Left-Right
                tx = 1; ty = 0;
            } else if (pseg[0] < tboby[i][0] && nseg[1] > tboby[i][1] || nseg[0] < tboby[i][0] && pseg[1] > tboby[i][1]) {
                // Angle Left-Down
                tx = 2; ty = 0;
            } else if (pseg[1] < tboby[i][1] && nseg[1] > tboby[i][1] || nseg[1] < tboby[i][1] && pseg[1] > tboby[i][1]) {
                // Vertical Up-Down
                tx = 2; ty = 1;
            } else if (pseg[1] < tboby[i][1] && nseg[0] < tboby[i][0] || nseg[1] < tboby[i][1] && pseg[0] < tboby[i][0]) {
                // Angle Top-Left
                tx = 2; ty = 2;
            } else if (pseg[0] > tboby[i][0] && nseg[1] < tboby[i][1] || nseg[0] > tboby[i][0] && pseg[1] < tboby[i][1]) {
                // Angle Right-Up
                tx = 0; ty = 1;
            } else if (pseg[1] > tboby[i][1] && nseg[0] > tboby[i][0] || nseg[1] > tboby[i][1] && pseg[0] > tboby[i][0]) {
                // Angle Down-Right
                tx = 0; ty = 0;
            }
        }
        ctx.drawImage(tileimage, tx*64, ty*64, 64, 64, tboby[i][0]*square_dim, tboby[i][1]*square_dim, square_dim, square_dim);
        
    }
}

function game_over(){
    document.getElementById('start').style.top = "26%";
    document.getElementById('start').style.display = "block";
    document.getElementById('save_score').style.display = "block";
    game_started = false;
}

function save(){
    $.ajax({
        type : 'POST',
        url : "../savescoreAI",
        contentType: 'application/json;charset=UTF-8',
        data : JSON.stringify({'score' : score, 'type' : 'AI'}),
    });
    document.getElementById('start').style.top = "40%";
    document.getElementById('save_score').style.display = "none";
}

let spn = document.createElement("SPAN");
spn.className += "nav-side-span";
spn.innerHTML = "a* heuristics:";
spn.id = "heuristicspan";
document.querySelector(".nav-sidebar").appendChild(spn);

let slct = document.createElement("SELECT");
slct.className += "side-select";
slct.innerHTML = "<option value='1'>Manhattam</option>\
                  <option value='2' selected>Euclidean distance</option>";
$("#heuristicspan").append(slct);

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

$(".side-select").on('change', function (){
    heuristic = $(".side-select").val();
});

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