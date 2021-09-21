'use strict'
import BowyerWatson from './bowyer-watson.js'

const dpr = window.devicePixelRatio || 1
const canvas = document.getElementById('voronoiCells')
const regions = document.getElementById('regionCount')
const generate = document.getElementById('generate')
const speed = document.getElementById('speed')
const redrawBtn = document.getElementById('redraw')
const stopBtn = document.getElementById('stop')
canvas.addEventListener('mousedown', canvasClick)
generate.addEventListener('click', newPoints)
speed.addEventListener('change', drawSpeed)
redrawBtn.addEventListener('click', newpaint)
stopBtn.addEventListener('click', stopRedraw)

let bowyerWatson
let ctx

let drawRadius
let drawIncrement
let drawMax
let start
let hue = 360 * Math.random()
const hueIncrement = 180 * (5 ** 0.5 - 1)
const drawSpeedFactor = 0.03

function setupCanvas () {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx = canvas.getContext('2d', { alpha: true })
  ctx.lineWidth = 1.5 * dpr
  ctx.strokeStyle = '#ddd'
  ctx.globalCompositeOperation = 'source-over'
  drawMax = 1.5 * Math.max(canvas.width, canvas.height)
}

function draw (timestamp) {
  if (start === false) {
    return;
  } else if (start === true) {
    start = timestamp
  }
  console.log(timestamp)
  drawRadius = drawIncrement * (timestamp - start)
  for (const cell of bowyerWatson.points) fillRegion(cell)
  if (drawRadius < drawMax) {
    window.requestAnimationFrame(draw)
  } else {
    stopRedraw()
  }
}

function fillRegion (region) {
  ctx.save()

  ctx.beginPath()
  for (const [x, y] of region.corners) ctx.lineTo(x, y)
  ctx.clip()

  ctx.beginPath()
  ctx.fillStyle = region.color
  ctx.arc(region[0], region[1], drawRadius, 0, 2 * Math.PI)
  ctx.fill()
  ctx.clip()

  ctx.beginPath()
  for (const [x, y] of region.corners) ctx.lineTo(x, y)
  ctx.closePath()
  ctx.stroke()

  ctx.restore()
}

function newPoints () {
  setupCanvas()
  // ctx.setTransform(1,0,1,1,0,0);
  const n = parseInt(regions.value || 10)
  bowyerWatson = new BowyerWatson(Math.max(canvas.width, canvas.height))
  for (let i = 0; i < n; i++) {
    createPoint(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height))
  }
  newpaint()
}

function createPoint (x, y) {
  const point = [x, y]
  const outerRadius = drawMax / 5
  const innerProportion = 3 * dpr / outerRadius
  const currentHue = (hue += hueIncrement)

  point.color = ctx.createRadialGradient(x, y, 0, x, y, outerRadius)
  point.color.addColorStop(0, '#222')
  point.color.addColorStop(innerProportion, '#222')
  point.color.addColorStop(1.25*innerProportion, 'hsl(' + currentHue + ',70%,65%)')
  point.color.addColorStop(1, 'hsl(' + (currentHue + 40) + ',70%,40%)')
  return bowyerWatson.addPoint(point)
}

function drawSpeed () {
  let newSpeed = parseInt(speed.value)
  if (newSpeed === 11) {
    newSpeed = 1000 * Math.max(canvas.width, canvas.height)
  }
  newSpeed *= dpr * drawSpeedFactor
  if (typeof(start) === 'number') {
    start += drawRadius * ( 1 / drawIncrement - 1 / newSpeed )
  }
  drawIncrement = newSpeed
}

function newpaint () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  requestPaint()
}

function requestPaint () {
  if (!start) {
    window.requestAnimationFrame(draw)
  }
  start = true
}

function stopRedraw () {
  start = false
}

function canvasClick (event) {
  if (event.button !== 0) {
    return
  }
  if (createPoint(Math.floor(event.x * dpr), Math.floor(event.y * dpr)) !== -1) {
    requestPaint()
  }
}

// function updateWindow() {
// console.log(window.innerHeight);
// console.log(window.innerWidth);
// }

drawSpeed()
newPoints()
