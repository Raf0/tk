var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
var out = document.getElementById("out");
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var xhr = new XMLHttpRequest();
xhr.open('GET', '/arkanoid/config', true);
xhr.onreadystatechange = function() {
	if (xhr.readyState == XMLHttpRequest.DONE) {
		var json = xhr.responseText;
		obj = JSON.parse(json);
		console.log(obj)
	}
}
xhr.send(null);

window.addEventListener("touchstart", handleTouch, false);
window.addEventListener("touchmove", handleTouch, false);
window.addEventListener("touchend", handleEnd, false);

var player = new Player(160,380,80,15);
var ball = new Ball(200,200,5,5,"red");
var bricks;
var touchPosition = -1;
var gameOver = false;
var winner = false;

loadMap();
start();

function handleTouch(evt) {
	touchPosition = (evt.changedTouches[0].pageX/window.innerWidth)*400;
}

function handleEnd(evt) {
	touchPosition = -1;
}

function Brick(x,y,width,height,color){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;
}

function Ball(x,y,r,speed,color){
	this.x = x;
	this.y = y;
	this.r = r;
	this.speed = speed;
	this.dx = Math.random() - 0.5;
	this.dy = speed;
	this.color = color;
}

function Player(x,y,width,height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.moveSpeedLimit = 10;
	this.accel = 1;
	this.decel = 2;
	this.xVel = 0;
	this.yVel = 0;
	this.color = "orange";
}

function start(){
	movePlayer();
	checkPlayer_BoundsCollision();
	checkBall_PlayerCollision();
	checkBall_BoundsCollision();
	checkBall_BrickCollision();
	clear();
	renderPlayer();
	moveBall();
	renderBall();
	renderBricks();
	checkWinner();
	if(gameOver === false){
		requestAnimationFrame(start);
	} else {
		out.innerHTML = "Game over";
		if(winner){
			out.innerHTML += ", you won!";
		}
		out.innerHTML += "<br>";
		out.innerHTML += "Press R to restart";
		endFun();
	}
		
}

function moveBall(){
	ball.x = ball.x+ball.dx;
	ball.y = ball.y+ball.dy;
}

function checkBall_BrickCollision(){
	var ax1 = ball.x-ball.r;
	var ay1 = ball.y-ball.r;
	var ax2 = ball.x+ball.r;
	var ay2 = ball.y+ball.r;
	var bx1;
	var bx2;
	var bx2;
	var by2;
	for(var i = 0; i < bricks.length; i++){
		bx1 = bricks[i].x;
		by1 = bricks[i].y;
		bx2 = bricks[i].x+bricks[i].width;
		by2 = bricks[i].y+bricks[i].height;
		if(!(ax2 <= bx1 || bx2 <= ax1 || ay2 <= by1 || by2 <= ay1)){
			prevX = ball.x - ball.dx - ball.r;
			prevY = ball.y - ball.dy - ball.r;
			if((prevX > bx2 || prevX < bx1) && prevY >= by1 && prevY <= by2){
				ball.dx = -ball.dx;	
			} else {
				ball.dy = -ball.dy;
			}
			bricks.splice(i,1);
			return;
		}
	}
}

function checkBall_BoundsCollision(){
	var x = ball.x - ball.r;
	var y = ball.y - ball.r;
	var size = ball.r*2;
	var x2 = x + size;
	var y2 = y + size;
	if(x < 0){
		ball.x = 0 + ball.r;
		ball.dx = -ball.dx;
	} else if(x + size > canvas.width){
		ball.x = canvas.width - ball.r;
		ball.dx = -ball.dx;
	}
	if(ball.y < 0){
		ball.y = 0 + ball.r;
		ball.dy = -ball.dy
	} else if(ball.y + ball.r > canvas.height){
		gameOver = true;
		winner = false;
	}
}

function checkBall_PlayerCollision(){
	var ax1 = player.x;
	var ay1 = player.y;
	var ax2 = player.x+player.width;
	var ay2 = player.y+player.height;
	var ax = (ax1 + ax2) / 2;
	var ay = (ay1 + ay2) / 2;
	var bx1 = ball.x-ball.r;
	var by1 = ball.y-ball.r;
	var bx2 = ball.x+ball.r;
	var by2 = ball.y+ball.r;
	if(ax2 > bx1 && ax1 < bx2 && ay1 < by2 && ay > by2){
		ball.dx = 8 * ((ball.x-(ax))/player.width)
		ball.dy = -Math.sqrt(ball.speed*ball.speed - ball.dx*ball.dx)
	}
}

function movePlayer(){
	if(touchPosition > player.x + player.width/2 + 2){
		if(player.xVel < player.moveSpeedLimit){
			player.xVel += player.accel;
		} else {
			player.xVel = player.moveSpeedLimit;
		}
	} else {
		if(player.xVel > 0){
			player.xVel -= player.decel;
			if(player.xVel < 0) player.xVel = 0;
		}
	}
	if(touchPosition != -1 && touchPosition < player.x + player.width/2 - 2){
		if(player.xVel > -player.moveSpeedLimit){
			player.xVel -= player.accel;	
		} else {
			player.xVel = -player.moveSpeedLimit;
		}
	} else {
		if(player.xVel < 0){
			player.xVel += player.decel;
			if(player.xVel > 0) player.xVel = 0;
		}
	}
	player.x+=player.xVel;
}

function checkPlayer_BoundsCollision(){
	if(player.x < 0){
		player.x = 0;
		player.xVel = 0;
	} else if(player.x + player.width > canvas.width){
		player.x = canvas.width - player.width;
		player.xVel = 0;
	}
	if(player.y < 0){
		player.y = 0;
		player.yVel = 0;
	} else if(player.y + player.height > canvas.height){
		player.y = canvas.height - player.height;
		player.yVel = 0;
	}
}

function renderPlayer(){
	c.save();
	c.fillStyle = player.color;
	c.fillRect(player.x,player.y,player.width,player.height);
	c.restore();
}

function loadMap(){
	bricks = [
		new Brick(50,50,50,10,"blue"),
		new Brick(101,50,50,10,"blue"),
		new Brick(152,50,50,10,"blue"),
		new Brick(203,50,50,10,"blue"),
		new Brick(254,50,50,10,"blue"),
		new Brick(305,50,50,10,"blue"), //Row 1
		new Brick(50,61,50,10,"green"),
		new Brick(101,61,50,10,"green"),
		new Brick(152,61,50,10,"green"),
		new Brick(203,61,50,10,"green"),
		new Brick(254,61,50,10,"green"),
		new Brick(305,61,50,10,"green"), //Row 2
		new Brick(50,72,50,10,"darkcyan"),
		new Brick(101,72,50,10,"darkcyan"),
		new Brick(152,72,50,10,"darkcyan"),
		new Brick(203,72,50,10,"darkcyan"),
		new Brick(254,72,50,10,"darkcyan"),
		new Brick(305,72,50,10,"darkcyan"), //Row 3
		new Brick(50,83,50,10,"coral"),
		new Brick(101,83,50,10,"coral"),
		new Brick(152,83,50,10,"coral"),
		new Brick(203,83,50,10,"coral"),
		new Brick(254,83,50,10,"coral"),
		new Brick(305,83,50,10,"coral"), //Row 4
		new Brick(50,94,50,10,"darkolivegreen"),
		new Brick(101,94,50,10,"darkolivegreen"),
		new Brick(152,94,50,10,"darkolivegreen"),
		new Brick(203,94,50,10,"darkolivegreen"),
		new Brick(254,94,50,10,"darkolivegreen"),
		new Brick(305,94,50,10,"darkolivegreen"), //Row 5
		new Brick(50,105,50,10,"lightsteelblue"),
		new Brick(101,105,50,10,"lightsteelblue"),
		new Brick(152,105,50,10,"lightsteelblue"),
		new Brick(203,105,50,10,"lightsteelblue"),
		new Brick(254,105,50,10,"lightsteelblue"),
		new Brick(305,105,50,10,"lightsteelblue")  //Row 6
	];
}

function checkWinner(){
	if(bricks.length < 1){
		gameOver = true;
		winner = true;
	}
}

function restart(){
	out.innerHTML = "";
	gameOver = false;
	loadMap();
	ball = new Ball(200,200,5,Math.floor(Math.random()*4+4),Math.floor(Math.random()*4+4),"red");
	player = new Player(300,380,80,15);
	start();
}

function renderBall(){
	c.save();
	c.fillStyle = ball.color;
	c.beginPath();
	c.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
	c.fill();
	c.restore();
}

function clear(){
	c.clearRect(0,0,canvas.width,canvas.height);
}

function renderBricks(){
	for(var i = 0; i < bricks.length; i++){
		c.save();
		c.fillStyle = bricks[i].color;
		c.fillRect(bricks[i].x,bricks[i].y,bricks[i].width,bricks[i].height);
		c.restore();	
	}
}

function endFun() {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/game/end', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.send(JSON.stringify({result: 0.57, group: "1", nick: "john", age: 5}));
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			<!--window.alert(xhr.responseText);-->
			window.location.replace(xhr.responseText);
		}
	}
}