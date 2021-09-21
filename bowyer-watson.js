'use strict'

function circumcircle (a, b, c) {
  const [ax, ay] = a
  const [bx, by] = b
  const [cx, cy] = c
  const det = (bx - ax) * (ay - cy) - (ax - cx) * (by - ay)
  if (det > -1e-11 && det < 1e-11) {
    return [0, 0, 100000]
  }
  const t = ((ay - cy) * (by - cy) + (cx - ax) * (cx - bx)) / (2 * det)
  const mx = (ax + bx) / 2 + t * (by - ay)
  const my = (ay + by) / 2 + t * (ax - bx)
  const r = ((ax - mx) ** 2 + (ay - my) ** 2) ** 0.5
  return [mx, my, r]
}

function inside (p, circle) {
  const [px, py] = p
  const [mx, my, r] = circle
  return (px - mx) ** 2 + (py - my) ** 2 <= r ** 2
}

function angle (p, q) {
  return Math.atan2(q[1] - p[1], q[0] - p[0])
}

function addCorners (triangle) {
  const m = triangle.circle.slice(0, 2)
  for (const vertex of triangle) {
    if (Object.prototype.hasOwnProperty.call(vertex, 'corners')) {
      const phi = angle(vertex, m)
      const index = vertex.corners.findIndex(q => angle(vertex, q) > phi)
      if (index > -1) {
        vertex.corners.splice(index, 0, m)
      } else {
        vertex.corners.push(m)
      }
    }
  }
}

function removeCorners (triangle) {
  const m = triangle.circle.slice(0, 2)
  for (const vertex of triangle) {
    if (Object.prototype.hasOwnProperty.call(vertex, 'corners')) {
      const index = vertex.corners.findIndex(e => (e[0] === m[0] && e[1] === m[1]))
      vertex.corners.splice(index, 1)
    }
  }
}

export default class BowyerWatson {
  constructor (size) {
    this.outside = [[-size, -size], [2.5 * size, 0], [0, 2.5 * size]]
    this.outside.circle = circumcircle(...this.outside)
    this.triangulation = [this.outside]
    this.points = []
  }

  addPoint (p) {
    if (this.points.findIndex(e => (e[0] === p[0] && e[1] === p[1])) !== -1) {
      // Point exists already
      return -1
    }
    this.points.push(p)
    const badTriangles = this.triangulation.filter(tri => inside(p, tri.circle))
    this.triangulation = this.triangulation.filter(tri => !inside(p, tri.circle))
    const polygon = []
    for (const triangle of badTriangles) {
      removeCorners(triangle)
      const [a, b, c] = triangle
      for (const line of [[a, b], [a, c], [b, c]]) {
        const index = polygon.findIndex((e) => (e[0] === line[0] && e[1] === line[1]))
        if (index === -1) {
          polygon.push(line)
        } else {
          polygon.splice(index, 1)
        }
      }
    }
    p.corners = []
    for (const [u, v] of polygon) {
      const triangle = [u, v, p]
      triangle.sort((p, q) => {
        if (p[0] < q[0]) {
          return -1
        } else {
          if (p[0] === q[0] && p[1] < q[1]) {
            return 0
          }
        }
        return 1
      })
      triangle.circle = circumcircle(...triangle)
      this.triangulation.push(triangle)
      addCorners(triangle)
    }
  }
}
