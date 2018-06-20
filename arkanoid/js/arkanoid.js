var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
var statusText = document.getElementById("status");
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var player, speed, ball, bricks, touchPosition, gameOver, winner;

var xhr = new XMLHttpRequest();
var age, nick, group, number;
var lives, time;
var points = 0;
var date = new Date();
var begin = date.getTime();
age = Math.random()*30;
lives = 2;
time = 45;
xhr.open('GET', '/arkanoid/config', true);
xhr.onreadystatechange = function() {
	if (xhr.readyState == XMLHttpRequest.DONE) {
		if(xhr.status == "200"){
			var json = xhr.responseText;
			obj = JSON.parse(json);
			console.log(obj)
			group = obj['group'];
			nick = obj['nick'];
			age = obj['age'];
			var config = obj['config'];
			config.forEach(parameter =>{
				if(parameter.name == 'lives')
					lives = parameter.value;
				else if(parameter.name == 'time')
					time = parameter.value;
			});
		}
		window.addEventListener("touchstart", handleTouch, false);
		window.addEventListener("touchmove", handleTouch, false);
		window.addEventListener("touchend", handleEnd, false);


		player = new Player(160,380,80,25);
		speed = Math.max(Math.min(5.25, age/4), 1.25) +2;

		ball = new Ball(200,200,5,speed,"red");
		bricks;
		touchPosition = -1;
		gameOver = false;
		winner = false;

		loadMap();
		start();
	}
}
xhr.send(null);


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
	this.dy = speed/2;
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
	var date = new Date();
	var leftTime = (time-Math.round((date.getTime()-begin)/1000));
	statusText.innerText = "Życia: "+lives + " Czas: "+leftTime;
	if(leftTime <= 0)
		gameOver = true;
	if(gameOver === false){
		requestAnimationFrame(start);
	} else {
		if(winner == 1)
			points = 1;
		else
			points = Math.round(points/number * 75)/100;
		
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
			points++;
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
		lives--;
		if(lives == 0)
		{
			gameOver = true;
			winner = false;
		}else{
			delete ball;
			ball = new Ball(200,200,5,speed,"red");
		}
	}
}

function checkBall_PlayerCollision(){
	var p_x1 = player.x;
	var p_y1 = player.y;
	var p_x2 = player.x+player.width;
	var p_y2 = player.y+player.height;
	var p_x = (p_x1 + p_x2) / 2;
	var p_y = (p_y1 + p_y2) / 2;
	var b_x1 = ball.x-ball.r;
	var b_y1 = ball.y-ball.r;
	var b_x2 = ball.x+ball.r;
	var b_y2 = ball.y+ball.r;
	if(p_x2 >= b_x1 && p_x1 <= b_x2 && p_y1 <= b_y2 && p_y2 >= b_y2){
		ball.dx = ball.speed * 1.5 * ((ball.x-(p_x))/player.width)
		ball.dy = -Math.sqrt(ball.speed*ball.speed - (ball.dx*ball.dx))
		if(b_y2 > p_y)
			ball.dy = - ball.dy;
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
	number = Math.max(Math.min(42, 2*age), 10);
	bricks = [
		new Brick(50,50,50,15,"blue"),
		new Brick(101,50,50,15,"blue"),
		new Brick(152,50,50,15,"blue"),
		new Brick(203,50,50,15,"blue"),
		new Brick(254,50,50,15,"blue"),
		new Brick(305,50,50,15,"blue"), //Row 1
		new Brick(50,66,50,15,"green"),
		new Brick(101,66,50,15,"green"),
		new Brick(152,66,50,15,"green"),
		new Brick(203,66,50,15,"green"),
		new Brick(254,66,50,15,"green"),
		new Brick(305,66,50,15,"green"), //Row 2
		new Brick(50,82,50,15,"darkcyan"),
		new Brick(101,82,50,15,"darkcyan"),
		new Brick(152,82,50,15,"darkcyan"),
		new Brick(203,82,50,15,"darkcyan"),
		new Brick(254,82,50,15,"darkcyan"),
		new Brick(305,82,50,15,"darkcyan"), //Row 3
		new Brick(50,98,50,15,"coral"),
		new Brick(101,98,50,15,"coral"),
		new Brick(152,98,50,15,"coral"),
		new Brick(203,98,50,15,"coral"),
		new Brick(254,98,50,15,"coral"),
		new Brick(305,98,50,15,"coral"), //Row 4
		new Brick(50,114,50,15,"darkred"),
		new Brick(101,114,50,15,"darkred"),
		new Brick(152,114,50,15,"darkred"),
		new Brick(203,114,50,15,"darkred"),
		new Brick(254,114,50,15,"darkred"),
		new Brick(305,114,50,15,"darkred"), //Row 5
		new Brick(50,130,50,15,"lightsteelblue"),
		new Brick(101,130,50,15,"lightsteelblue"),
		new Brick(152,130,50,15,"lightsteelblue"),
		new Brick(203,130,50,15,"lightsteelblue"),
		new Brick(254,130,50,15,"lightsteelblue"),
		new Brick(305,130,50,15,"lightsteelblue"),  //Row 6
		new Brick(50,146,50,15,"yellow"),
		new Brick(101,146,50,15,"yellow"),
		new Brick(152,146,50,15,"yellow"),
		new Brick(203,146,50,15,"yellow"),
		new Brick(254,146,50,15,"yellow"),
		new Brick(305,146,50,15,"yellow")  //Row 7
	];
	bricks = bricks.slice(0, number);
}

function checkWinner(){
	if(bricks.length < 1){
		gameOver = true;
		winner = true;
	}
}

function restart(){
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
	xhr.open('POST', '/arkanoid/end', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.send(JSON.stringify({result: points, group: group, nick: nick, age: age}));
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			<!--window.alert(xhr.responseText);-->
			window.location.replace(xhr.responseText);
		}
	}
}