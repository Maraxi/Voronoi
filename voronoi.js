'use strict'
import BowyerWatson from './bowyer-watson.js'

const dpr = window.devicePixelRatio || 1
const canvas = document.getElementById('voronoiCells')
canvas.addEventListener('mousedown', canvasClick)
const regions = document.getElementById('regionCount')
const generate = document.getElementById('generate')
generate.addEventListener('click', newPoints)
const speed = document.getElementById('speed')
speed.addEventListener('change', drawSpeed)
const redrawBtn = document.getElementById('redraw')
redrawBtn.addEventListener('click', newpaint)
const stopBtn = document.getElementById('stop')
stopBtn.addEventListener('click', stopRedraw)
let ctx

let drawRadius
let drawIncrement
let drawMax
let stop = false
let isPainting = false
let hue = 360 * Math.random()
const hueIncrement = 180 * (5 ** 0.5 - 1)

let bowyerWatson

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
  drawRadius += drawIncrement
  for (const cell of bowyerWatson.points) fillRegion(cell)
  if (drawRadius < drawMax && !stop) {
    window.requestAnimationFrame(draw)
  } else {
    isPainting = false
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
  ctx.fillStyle = '#222'
  ctx.arc(region[0], region[1], 3 * dpr, 0, 2 * Math.PI)
  ctx.fill()

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
  point.color = ctx.createRadialGradient(x, y, 0, x, y, drawMax / 5)
  const currentHue = (hue += hueIncrement)
  point.color.addColorStop(0, 'hsl(' + currentHue + ',70%,65%)')
  const otherHue = currentHue + 40
  point.color.addColorStop(1, 'hsl(' + otherHue + ',70%,40%)')
  return bowyerWatson.addPoint(point)
}

function drawSpeed () {
  drawIncrement = parseInt(speed.value)
  if (drawIncrement === 11) {
    drawIncrement = 2000
  }
  drawIncrement *= dpr
}

function newpaint () {
  drawRadius = 0
  stop = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  requestPaint()
}

function requestPaint () {
  if (!isPainting) {
    isPainting = true
    window.requestAnimationFrame(draw)
  }
}

function stopRedraw () {
  stop = true
}

function canvasClick (event) {
  if (event.button !== 0) {
    return
  }
  if (createPoint(Math.floor(event.x * dpr), Math.floor(event.y * dpr)) !== -1) {
    stop = false
    drawRadius = 0
    requestPaint()
  }
}

// function updateWindow() {
// console.log(window.innerHeight);
// console.log(window.innerWidth);
// }

drawSpeed()
newPoints()
