'use strict';

function circumcircle(a,b,c) {
	const [ax,ay] = a;
	const [bx,by] = b;
	const [cx,cy] = c;
	const det = (bx-ax)*(ay-cy) - (ax-cx)*(by-ay);
	if (-1e-11 < det && det < 1e-11) {
		return [0,0,100000];
	}
	const t = ((ay-cy)*(by-cy)+(cx-ax)*(cx-bx))/(2*det);
	const mx = (ax+bx)/2 + t*(by-ay);
	const my = (ay+by)/2 + t*(ax-bx);
	const r = ((ax-mx)**2 + (ay-my)**2)**0.5;
	return [mx, my, r];
}

function inside(p, circle){
	const [px,py] = p;
	const [mx,my,r] = circle;
	return (px-mx)**2 + (py-my)**2 <= r**2;
}

function angle(p,q){
	return Math.atan2(q[1]-p[1],q[0]-p[0]);
}

function add_corners(triangle) {
	const m = triangle.circle.slice(0,2);
	for (const vertex of triangle) {
		if (vertex.hasOwnProperty('corners')){
			const phi = angle(vertex,m);
			const index = vertex.corners.findIndex(q => angle(vertex,q)>phi);
			if (index > -1) {
				vertex.corners.splice(index, 0, m);
			} else {
				vertex.corners.push(m);
			}
		}
	}
}

function remove_corners(triangle) {
	const m = triangle.circle.slice(0,2);
	for (const vertex of triangle) {
		if (vertex.hasOwnProperty('corners')){
			const index = vertex.corners.findIndex(e => (e[0]==m[0] && e[1]==m[1]));
			vertex.corners.splice(index,1);
		}
	}
}

class BowyerWatson {
	constructor() {
		const max = Math.max(canvas.width, canvas.height);
		this.outside = [[-max,-max],[2.5*max,0],[0,2.5*max]];
		this.outside.circle = circumcircle(...this.outside);
		this.triangulation = [this.outside];
		this.points = [];
	}
	
	addPoint(p) {
		if (this.points.findIndex(e => (e[0]==p[0] && e[1] == p[1])) != -1){
			// Point exists already
			return -1;
		}
		this.points.push(p);
		var badTriangles = this.triangulation.filter(tri => inside(p,tri.circle));
		this.triangulation = this.triangulation.filter(tri => !inside(p,tri.circle));
		var polygon = [];
		for (var triangle of badTriangles) {
			remove_corners(triangle);
			const [a,b,c] = triangle;
			for (var line of [[a,b],[a,c],[b,c]]){
				const index = polygon.findIndex((e) => (e[0]==line[0] && e[1]==line[1]));
				if (index == -1) {
					polygon.push(line);
				} else {
					polygon.splice(index,1);
				}
			}
		}
		p.corners = [];
		for (const [u,v] of polygon) {
			let triangle = [u,v,p];
			triangle.sort((p,q) => {
				if (p[0]<q[0]) {
					return -1;
				} else {
					if (p[0] == q[0] && p[1] < q[1]) {
						return 0;
					}
				}
				return 1;
			});
			triangle.circle = circumcircle(...triangle);
			this.triangulation.push(triangle);
			add_corners(triangle);
		}
	}
	
	print() {
		for (const triangle of this.triangulation) {
			ctx.beginPath();
			for (const [x,y] of triangle) {
				ctx.lineTo(x,y);
			}
			ctx.closePath();
			ctx.stroke();
		}
	}
}
