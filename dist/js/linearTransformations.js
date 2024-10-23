/*
Adapted from Dr. Lauren K Williams 
*/

// Basic canvas/graphing setup - requires canvasGridConstruction.js
/*
Jaekoo's note

Two inputs
- zoom slider
- mouse

When inputs change `reScale()` is called
`reScale()` updates `grid` and calls both `drawGrid()` and `drawF()`

*/

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var wd = document.getElementById("canvasdiv").offsetWidth;
var ht = 0.7 * wd;
canvas.width = wd * 2;
canvas.height = ht * 2;

canvas.style.width = wd + "px";
canvas.style.height = ht + "px";

canvas.getContext("2d").scale(2, 2);

// When slider input changes or mouse moves, reScale() is called and `grid` is updated
var grid = {
	scale: 30, // min 10 (zoomed out) max 300 (zoomed in)
	gridcolor: "#ccc", // color of (non-axis) grid lines
	gridwidth: "1", // pixel with of (non-axis) grid lines
	axiscolor: "#555", // color of axes
	axiswidth: "2", // pixel width of axes
	labelcolor: "#888", // color for axis labels
	labelsize: "14", // font size for axis labels
	system: "cartesian", // 'polar' or 'cartesian'
};

var graphcolor = "rgba(63, 167, 146, 0.9)";
var fillcolor = "rgba(63, 167, 146, 0.3)";
var flipfillcolor = "rgba(90, 90, 90, 0.3)";
var originalfillcolor = "rgba(246,254,215, 0.5)";
var originalstrokecolor = "rgba(129, 127, 79, 0.8)";
var cx = wd / 2,
	cy = ht / 2; // start origin at center of canvas

var slider = document.getElementById("scaleSlider");

slider.oninput = function () {
	// From scale slider inputs, this rescales both grids and the image
	//  `reScale()` --> `drawGrid()` & `drawF()`
	reScale(this.value, drawF);
};

// Shape examples to use
var n_samples = 50;
var randomSamples = multivariate_normal(n_samples);
var shapes = {
	square: {
		orig: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
		],
		flip: false,
	},
	star: {
		orig: [
			[0, -1.5],
			[-1.76, -2.43],
			[-1.43, -0.46],
			[-2.85, 0.93],
			[-0.88, 1.21],
			[0, 3],
			[0.88, 1.21],
			[2.85, 0.93],
			[1.43, -0.46],
			[1.76, -2.42],
		],
		flip: false,
	},
	house: {
		orig: [
			[0.34, 0.82],
			[2.05, 0.82],
			[2.05, 1.78],
			[2.42, 1.78],
			[1.85, 2.36],
			[1.85, 2.85],
			[1.59, 2.85],
			[1.59, 2.62],
			[1.21, 3],
			[0, 1.76],
			[0.34, 1.76],
		],
		flip: false,
	},
	random: {
		orig: randomSamples,
		flip: false,
	},
};

var cshape = "star";
var transMat = [
	[1, 0],
	[0, 1],
];
var det = 1;
var compose = false;

function drawF() {
	// This draws both original and transformed image
	// This is used as 2nd arg for reScale() as `oncomplete()` function

	// Original image
	if (cshape !== "random") {
		context.lineWidth = "1";
		context.strokeStyle = originalstrokecolor;
		context.fillStyle = originalfillcolor;

		context.beginPath();

		let o1 = shapes[cshape].orig[0];

		context.moveTo(cx + o1[0] * grid.scale, cy - o1[1] * grid.scale);
		for (let i = 1; i < shapes[cshape].orig.length; i++) {
			let o = shapes[cshape].orig[i];
			context.lineTo(cx + o[0] * grid.scale, cy - o[1] * grid.scale);
		}
		context.lineTo(cx + o1[0] * grid.scale, cy - o1[1] * grid.scale);
		context.lineJoin = "round";
		context.stroke();
		context.fill();
		context.closePath();
	} else {
		// if shape is "random"
		let pointSize = 3;
		context.fillStyle = 'rgba(128,128,128,0.5)';
		let x, y;
		for (var i=0; i < shapes[cshape].orig.length; i++) {
			x = cx + shapes[cshape].orig[i][0] * grid.scale;
			y = cy - shapes[cshape].orig[i][1] * grid.scale;
			context.beginPath();
			context.arc(x, y, pointSize, 0, Math.PI * 2, true);
			context.fill();
		}
	}

	// Modified image after transformation
	if (cshape !== "random") {
		context.lineWidth = "2";
		context.strokeStyle = graphcolor;
		context.fillStyle = det >= 0 ? fillcolor : flipfillcolor;

		context.beginPath();

		let p1 = MatrixVectorProd(transMat, shapes[cshape].orig[0]); // transform the 1st coord of original image

		context.moveTo(cx + p1[0] * grid.scale, cy - p1[1] * grid.scale);
		for (let i = 1; i < shapes[cshape].orig.length; i++) {
			let p = MatrixVectorProd(transMat, shapes[cshape].orig[i]); // transform subsequent coord
			context.lineTo(cx + p[0] * grid.scale, cy - p[1] * grid.scale);
		}
		context.lineTo(cx + p1[0] * grid.scale, cy - p1[1] * grid.scale);
		context.lineJoin = "round";
		context.stroke();
		context.fill();
		context.closePath();
	} else {
		// if shape is "random"
		let pointSize = 3;
		context.fillStyle = '#228B22';
		let x, y;
		for (var i=0; i < shapes[cshape].orig.length; i++) {
			let p = MatrixVectorProd(transMat, shapes[cshape].orig[i]); // transform subsequent coord
			x = cx + p[0] * grid.scale;
			y = cy - p[1] * grid.scale;
			context.beginPath();
			context.arc(x, y, pointSize, 0, Math.PI * 2, true);
			context.fill();
		}
	}
}

// Initialize grid and plot
addDrag(canvas, drawF); // listen to mouse movements
reScale(grid.scale, drawF); // update plots (REDUNDANT; because addDrag uses `reScale()`)

function resetCanvas() {
	var canvas = document.getElementById("canvas");
	wd = document.getElementById("canvasdiv").offsetWidth;
	ht = 0.7 * wd;
	canvas.width = wd * 2;
	canvas.height = ht * 2;

	canvas.style.width = wd + "px";
	canvas.style.height = ht + "px";

	canvas.getContext("2d").scale(2, 2);

	// When slider input changes or mouse moves, reScale() is called and `grid` is updated
	grid = {
		scale: 30, // min 10 (zoomed out) max 300 (zoomed in)
		gridcolor: "#ccc", // color of (non-axis) grid lines
		gridwidth: "1", // pixel with of (non-axis) grid lines
		axiscolor: "#555", // color of axes
		axiswidth: "2", // pixel width of axes
		labelcolor: "#888", // color for axis labels
		labelsize: "14", // font size for axis labels
		system: "cartesian", // 'polar' or 'cartesian'
	};
	var cx = wd / 2,
		cy = ht / 2; // start origin at center of canvas

	var slider = document.getElementById("scaleSlider");
	slider.value = grid.scale;

	// Update random samples
	shapes['random'].orig = multivariate_normal(n_samples);
	
	transMat = [
		[1, 0],
		[0, 1],
	];
	det = 1;
	compose = false;
	document.getElementById("compose").checked = false;

	// Reset Matrix of Transformation
	document.getElementById("m00").value = 1.0;
	document.getElementById("m01").value = 0.0;
	document.getElementById("m10").value = 0.0;
	document.getElementById("m11").value = 1.0;

	// Reset Transformations
	document.getElementById("rotateAngle").value = 0;
	document.getElementById("scaleFactor").value = 2;
	document.getElementById("hstretchFactor").value = 2;
	document.getElementById("vstretchFactor").value = 2;
	document.getElementById("hsheerFactor").value = 1;
	document.getElementById("vsheerFactor").value = 1;
	document.getElementById("xproject").value = 1;

	// Reset showGrid option
	showGrid = false;
	checkbox = document.getElementById("showGrid");
	checkbox.checked = false;
	// drawGrid();
	// document.getElementById("defaultShape").checked = true;

	newMatrix();
	reScale(grid.scale, drawF);
}

function newMatrix() {
	// Get determinant --> update "Invertible", "Orientation Preserving" and "Area Preserving "
	transMat[0][0] = document.getElementById("m00").value;
	transMat[1][0] = document.getElementById("m10").value;
	transMat[0][1] = document.getElementById("m01").value;
	transMat[1][1] = document.getElementById("m11").value;

	det = transMat[0][0] * transMat[1][1] - transMat[1][0] * transMat[0][1];

	document.getElementById("detOut").innerHTML =
		"Determinant: " + det.toFixed(3);

	let propstring = "";
	propstring +=
		det != 0
			? "&#9745; Invertible &nbsp; &nbsp;"
			: "&#9744; Invertible &nbsp; &nbsp;";
	propstring +=
		det >= 0
			? "&#9745; Orientation Preserving &nbsp; &nbsp;"
			: "&#9744; Orientation Preserving &nbsp; &nbsp;";
	propstring +=
		Math.abs(det.toFixed(8)) == 1
			? "&#9745; Area Preserving &nbsp; &nbsp;"
			: "&#9744; Area Preserving &nbsp; &nbsp;";
	document.getElementById("propOut").innerHTML = propstring;

	reScale(grid.scale, drawF);
}

var drag = false,
	startdragx,
	startdragy,
	customShape = {
		orig: [],
		flip: false,
	};

function addCustom() {
	// Draw custom shape
	//
	// ---------- THIS FUNCTION IS INCOMPLETE!! ----------
	//
	// - Due to mouse movement, it couldn't easily fixed (2020-04-25)
	//
	canvas = document.getElementById("canvas");

	var getMousePos = function (canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top,
		};
	};

	canvas.addEventListener(
		"mousedown",
		function (evt) {
			console.log("mousedown");
			let mousePos = getMousePos(canvas, evt);
			drag = true;
			startdragx = mousePos.x;
			startdragy = mousePos.y;
			customShape.orig.push([cx + startdragx, cy - startdragy]);
		},
		false
	);

	canvas.addEventListener(
		"mousemove",
		function (evt) {
			if (drag) {
				evt.preventDefault(); // override `addDrag()`
				console.log("mousedrag");
				console.log("drag");
				let mousePos = getMousePos(canvas, evt);
				// cx = cx - (startdragx - mousePos.x);
				// cy = cy - (startdragy - mousePos.y);
				customShape.orig.push([cx + mousePos.x, cy - mousePos.y]);

				context.beginPath();
				context.lineWidth = 5;
				context.lineCap = "round";
				context.moveTo(startdragx, startdragy);
				context.lineTo(mousePos.x, mousePos.y);
				context.stroke();

				startdragx = mousePos.x;
				startdragy = mousePos.y;
			}
		},
		false
	);

	canvas.addEventListener(
		"mouseup",
		function (evt) {
			drag = false;
			context.closePath();

			shapes.custom = customShape;
			cshape = "custom"; // the appended last array element
			// reScale(grid.scale, drawF);
		},
		false
	);
}

function multivariate_normal(n_samples) {
	// Generate samples from 2D multivariate normal distribution
	// See: https://stackoverflow.com/a/36481059
	if (!n_samples) n_samples = 10;

	// let scale = 2.0; // default
	let scale = 3.0;
	let u = 0,
		v = 0;
	// while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	// while (v === 0) v = Math.random();
	let x, y;
	let samples = [];
	for (var i = 0; i < n_samples; i++) {
		u = 1 - Math.random();
		v = 1 - Math.random();
		x = Math.sqrt(- scale * Math.log(u)) * Math.cos(scale * Math.PI * v);

		u = 1 - Math.random();
		v = 1 - Math.random();
		y = Math.sqrt(- scale * Math.log(u)) * Math.cos(scale * Math.PI * v);

		samples.push([x, y]);
	}
	return samples;
}

function newShape() {
	// Update the new shape
	cshape = document.querySelector('input[name="shapeOption"]:checked').value;
	console.log("Selected shape:", cshape);
	reScale(grid.scale, drawF);
}

// This connects HTML matrix inputs with `newMatrix()`
document.querySelectorAll('input[name="matrixIn"]').forEach(function (element) {
	element.setAttribute("oninput", "newMatrix();");
});

// This connects HTML shape option inputs with `newShape()`
document
	.querySelectorAll('input[name="shapeOption"]')
	.forEach(function (element) {
		if (element.value !== "custom") {
			element.setAttribute("onchange", "newShape();");
		}
	});

function newTransformMat(newtrans) {
	compose = document.getElementById("compose").checked;

	if (compose == true) {
		transMat = MatrixMatrixProd(newtrans, transMat);
	} else {
		transMat[0][0] = newtrans[0][0];
		transMat[0][1] = newtrans[0][1];
		transMat[1][0] = newtrans[1][0];
		transMat[1][1] = newtrans[1][1];
	}

	document.getElementById("m00").value = transMat[0][0].toFixed(3);
	document.getElementById("m10").value = transMat[1][0].toFixed(3);
	document.getElementById("m01").value = transMat[0][1].toFixed(3);
	document.getElementById("m11").value = transMat[1][1].toFixed(3);

	det = transMat[0][0] * transMat[1][1] - transMat[1][0] * transMat[0][1];

	document.getElementById("detOut").innerHTML =
		"Determinant: " + det.toFixed(3);

	let propstring = "";
	propstring +=
		det != 0
			? "&#9745; Invertible &nbsp; &nbsp;"
			: "&#9744; Invertible &nbsp; &nbsp;";
	propstring +=
		det >= 0
			? "&#9745; Orientation Preserving &nbsp; &nbsp;"
			: "&#9744; Orientation Preserving &nbsp; &nbsp;";
	propstring +=
		Math.abs(det.toFixed(8)) == 1
			? "&#9745; Area Preserving &nbsp; &nbsp;"
			: "&#9744; Area Preserving &nbsp; &nbsp;";
	document.getElementById("propOut").innerHTML = propstring;

	reScale(grid.scale, drawF);
}

/* IS POINT ON LINE - PIXELS */

function onLine([x1, y1], [x2, y2], [p1, p2]) {
	// check if pixel at (p1,p2) is on line segment from pixel (x1,y1) to pixel (x2,y2)

	var online = true;
	var yAtp1 = p2;
	// if vertical segment:
	if (p2 > y1 && p2 > y2) {
		online = false;
	} // below both endpoints, not on segment
	else if (p2 < y1 && p2 < y2) {
		online = false;
	} // above both endpoints, not on segment
	else if (p1 < x1 && p1 < x2) {
		online = false;
	} // left of both endpoints, not on segment
	else if (p1 > x1 && p1 > x2) {
		online = false;
	} // right of both endpoints, not on segment
	else if (x1 === x2) {
		if (p1 != x1) {
			online = false;
		} // different x coordinate, not on line
	} else {
		// slope of line through endpoints:
		let m = (y1 - y2) / (x1 - x2);
		// point slope form:
		yAtp1 = m * (p1 - x1) + y1;
		if (Math.abs(p2 - yAtp1) > 12) {
			online = false;
		} // not within 8 pixels of line through x1,y1 with slope m
	}
	return [online, yAtp1];
}

function detectEdge(x, y) {
	var cverts = []; // current transformed vertices
	for (let i = 0; i < shapes[cshape].orig.length; i++) {
		cverts.push(MatrixVectorProd(transMat, shapes[cshape].orig[i]));
	}
	//console.log(cverts)
	for (let i = 0; i < cverts.length; i++) {
		cverts[i][0] = cx + cverts[i][0] * grid.scale;
		cverts[i][1] = cy - cverts[i][1] * grid.scale;
	}
	let edge = false;
	let acty;
	let vertsBetween = [];
	for (let i = 0; i < cverts.length - 1; i++) {
		if (onLine(cverts[i], cverts[i + 1], [x, y])[0] == true) {
			edge = true;
			acty = onLine(cverts[i], cverts[i + 1], [x, y])[1];
			vertsBetween = [i, i + 1];
		}
	}
	if (onLine(cverts[0], cverts[cverts.length - 1], [x, y])[0] == true) {
		edge = true;
		acty = onLine(cverts[0], cverts[cverts.length - 1], [x, y])[1];
		vertsBetween = [0, cverts.length - 1];
	}

	reScale(grid.scale, drawF);
	if (edge) {
		context.strokeStyle = graphcolor;
		context.beginPath();
		context.arc(x, acty, 4, 0, 2 * Math.PI);
		context.stroke();

		// percentage of distance between vertices to touch, in pixels
		let xperc =
			(cverts[vertsBetween[0]][0] - x) /
			(cverts[vertsBetween[0]][0] - cverts[vertsBetween[1]][0]);
		let yperc =
			(cverts[vertsBetween[0]][1] - y) /
			(cverts[vertsBetween[0]][1] - cverts[vertsBetween[1]][1]);
		let origx =
			xperc *
				(shapes[cshape].orig[vertsBetween[1]][0] -
					shapes[cshape].orig[vertsBetween[0]][0]) +
			shapes[cshape].orig[vertsBetween[0]][0];
		let origy =
			xperc *
				(shapes[cshape].orig[vertsBetween[1]][1] -
					shapes[cshape].orig[vertsBetween[0]][1]) +
			shapes[cshape].orig[vertsBetween[0]][1];

		let scaledorigx = cx + origx * grid.scale;
		let scaledorigy = cy - origy * grid.scale;

		context.strokeStyle = originalstrokecolor;
		context.beginPath();
		context.arc(scaledorigx, scaledorigy, 4, 0, 2 * Math.PI);
		context.stroke();
	}
}

// canvas.addEventListener("mousemove", function (e) {
// 	var rect = canvas.getBoundingClientRect();
// 	var x = ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
// 		y = ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
// 	detectEdge(x / 2, y / 2);
// });

console.log(onLine([200, 200], [0, 0], [100, 101]));

// preset transforms

function rotate() {
	var angle = (Math.PI * document.getElementById("rotateAngle").value) / 180;
	newTransformMat([
		[Math.cos(angle), -1 * Math.sin(angle)],
		[Math.sin(angle), Math.cos(angle)],
	]);
}

function hstretch() {
	var f = Number(document.getElementById("hstretchFactor").value);
	newTransformMat([
		[f, 0],
		[0, 1],
	]);
}

function vstretch() {
	var f = Number(document.getElementById("vstretchFactor").value);
	newTransformMat([
		[1, 0],
		[0, f],
	]);
}

function vhscale() {
	var f = Number(document.getElementById("scaleFactor").value);
	newTransformMat([
		[f, 0],
		[0, f],
	]);
}

function hsheer() {
	var f = Number(document.getElementById("hsheerFactor").value);
	newTransformMat([
		[1, f],
		[0, 1],
	]);
}

function vsheer() {
	var f = Number(document.getElementById("vsheerFactor").value);
	newTransformMat([
		[1, 0],
		[f, 1],
	]);
}

function projection() {
	var px = parseFloat(document.getElementById("xproject").value);
	var py = parseFloat(document.getElementById("yproject").value);
	var slope = Number(py / px.toFixed(2));
	var den = 1 + slope * slope;
	newTransformMat([
		[1 / den, slope / den],
		[slope / den, (slope * slope) / den],
	]);
}
