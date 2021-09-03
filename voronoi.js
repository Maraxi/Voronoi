'use strict';

var dpr = window.devicePixelRatio || 1;
var canvas = document.getElementById("voronoiCells");
var regions = document.getElementById("regionCount");
var speed = document.getElementById("speed");
var ctx;

var drawRadius;
var drawIncrement;
var drawMax;
var stop = false;
var isPainting = false;
var hue = 360*Math.random();
const hueIncrement = 180 * (5**0.5 - 1);

var bowyerWatson;

function setupCanvas() {
	var rect = canvas.getBoundingClientRect();
	canvas.width = rect.width * dpr;
	canvas.height = rect.height * dpr;
	ctx = canvas.getContext('2d', {alpha: true});
	ctx.lineWidth = 1.5*dpr;
	ctx.strokeStyle="#ddd";
	ctx.globalCompositeOperation = 'source-over';
	drawMax = 1.5*Math.max(canvas.width, canvas.height);
}

function draw() {
	drawRadius += drawIncrement;
	for (var cell of bowyerWatson.points) fillRegion(cell);
	if (drawRadius < drawMax && !stop) {
		window.requestAnimationFrame(draw);
	} else {
		isPainting = false;
	}
}

function fillRegion(region) {
	ctx.save();

	ctx.beginPath();
	for (var [x,y] of region.corners) ctx.lineTo(x,y);
	ctx.clip();

	ctx.beginPath();
	ctx.fillStyle=region.color;
	ctx.arc(region[0],region[1],drawRadius,0,2*Math.PI);
	ctx.fill();
	ctx.clip();

	ctx.beginPath();
	ctx.fillStyle="#222";
	ctx.arc(region[0],region[1],3*dpr,0,2*Math.PI);
	ctx.fill();

	ctx.beginPath();
	for (var [x,y] of region.corners) ctx.lineTo(x,y);
	ctx.closePath();
	ctx.stroke();

	ctx.restore();
}

function newPoints() {
	setupCanvas();
	//ctx.setTransform(1,0,1,1,0,0);
	let n = parseInt(regions.value || 10);
	bowyerWatson = new BowyerWatson();
	for (let i=0; i<n; i++) {
		createPoint(Math.floor(Math.random()*canvas.width), Math.floor(Math.random()*canvas.height));
	}
	newpaint();
}

function createPoint(x, y) {
	let point = [x,y];
	point.color = ctx.createRadialGradient(x,y,0,x,y,600);
	let currentHue = (hue += hueIncrement);
	point.color.addColorStop(0, "hsl("+currentHue+",70%,65%)");
	point.color.addColorStop(1, "hsl("+currentHue+",70%,25%)");
	return bowyerWatson.addPoint(point);
}

function drawSpeed() {
	drawIncrement = parseInt(speed.value);
	if (drawIncrement == 11) {
		drawIncrement = 2000;
	}
	drawIncrement *= dpr;
}

function newpaint() {
	drawRadius = 0;
	stop = false;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	requestPaint()
}

function requestPaint() {
	if (!isPainting) {
		isPainting = true;
		window.requestAnimationFrame(draw);
	}
}

function stopRedraw() {
	stop = true;
}

function canvasClick(event) {
	if (createPoint(Math.floor(event.x * dpr), Math.floor(event.y * dpr)) != -1) {
		stop = false;
		drawRadius = 0;
		requestPaint();
	}
}

//function updateWindow() {
	//console.log(window.innerHeight);
	//console.log(window.innerWidth);
//}

drawSpeed();
newPoints();
