/* Drag Grid */

function addDrag(canvas, oncomplete) {
	// This listens to mouse movement and use `reScale()` for updating plot

	var getMousePos = function (canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top,
		};
	};

	var drag = false,
		startdragx,
		startdragy;

	canvas.addEventListener(
		"mousedown",
		function (evt) {
			let mousePos = getMousePos(canvas, evt);
			drag = true;
			startdragx = mousePos.x;
			startdragy = mousePos.y;
		},
		false
	);

	canvas.addEventListener(
		"mousemove",
		function (evt) {
			if (drag) {
				let mousePos = getMousePos(canvas, evt);
				cx = cx - (startdragx - mousePos.x);
				cy = cy - (startdragy - mousePos.y);
				// Here reScale() --> drawGrid() -->
				reScale(grid.scale, oncomplete);
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
		},
		false
	);
}



/* Zoom */

/* Requires range input, id 'scaleSlider', max=300, min=10
		var slider = document.getElementById("scaleSlider");
		slider.oninput = function() { reScale(this.value) }
	*/

var reScale = function (r, oncomplete) {
	// This rescale both image and grid

	grid.scale = r;

	grid.minx = (-1 * cx) / grid.scale;
	grid.maxx = (wd - cx) / grid.scale;
	grid.miny = (-1 * (ht - cy)) / grid.scale;
	grid.maxy = cy / grid.scale;

	drawGrid(); // update grid
	oncomplete(); // update image; see `drawF()`
};

/* GRIDLINES */

var drawGrid = function () {
	context.clearRect(0, 0, canvas.width, canvas.height);

	let minxgrid = Math.ceil(grid.minx),
		maxxgrid = Math.floor(grid.maxx),
		minygrid = Math.ceil(grid.miny),
		maxygrid = Math.floor(grid.maxy);

	// grid lines

	context.lineWidth = grid.gridwidth;
	context.strokeStyle = grid.gridcolor;

	if (grid.system == "polar") {
		let maxRad =
			1 +
			Math.ceil(
				Math.sqrt(
					2 *
						Math.max(
							Math.abs(maxxgrid),
							Math.abs(minxgrid),
							Math.abs(minygrid),
							Math.abs(maxygrid)
						) *
						Math.max(
							Math.abs(maxxgrid),
							Math.abs(minxgrid),
							Math.abs(minygrid),
							Math.abs(maxygrid)
						)
				)
			);

		if (grid.scale <= 200) {
			// zoom out, 1-1 radials
			for (let i = 0; i <= maxRad; i++) {
				let r = i * grid.scale;
				context.beginPath();
				context.arc(cx, cy, r, 0, 2 * Math.PI);
				context.stroke();
				context.closePath();
			}
		} else if (grid.scale > 200 && grid.scale < 270) {
			for (let i = 0; i <= maxRad; i += 0.25) {
				let r = i * grid.scale;
				context.beginPath();
				context.arc(cx, cy, r, 0, 2 * Math.PI);
				context.stroke();
				context.closePath();
			}
		} else {
			for (let i = 0; i <= maxRad; i += 0.1) {
				let r = i * grid.scale;
				context.beginPath();
				context.arc(cx, cy, r, 0, 2 * Math.PI);
				context.stroke();
				context.closePath();
			}
		}

		// pi/4   multiples
		for (let i = 0; i <= 8; i++) {
			context.beginPath();
			context.moveTo(cx, cy);
			context.lineTo(
				cx + maxRad * grid.scale * Math.cos((i * Math.PI) / 4),
				cy - maxRad * grid.scale * Math.sin((i * Math.PI) / 4)
			);
			context.stroke();
			context.closePath();
		}
		// pi/6  multiples
		for (let i = 0; i <= 12; i++) {
			context.beginPath();
			context.moveTo(cx, cy);
			context.lineTo(
				cx + maxRad * grid.scale * Math.cos((i * Math.PI) / 6),
				cy - maxRad * grid.scale * Math.sin((i * Math.PI) / 6)
			);
			context.stroke();
			context.closePath();
		}
	} else if (grid.system == "cartesian") {
		let inc;
		if (grid.scale >= 270) {
			inc = 0.2;
		} else if (grid.scale > 200 && grid.scale < 270) {
			inc = 0.5;
		} else {
			inc = 1;
		}

		// Draw fixed grids
		for (let i = minxgrid - 1; i <= maxxgrid + 1; i += inc) {
			context.beginPath();
			context.moveTo(cx + i * grid.scale, 0);
			context.lineTo(cx + i * grid.scale, ht);
			context.stroke();
			context.closePath();
		}

		for (let i = minygrid - 1; i <= maxygrid + 1; i += inc) {
			context.beginPath();
			context.moveTo(0, cy - i * grid.scale);
			context.lineTo(wd, cy - i * grid.scale);
			context.stroke();
			context.closePath();
		}

		// Draw transformed grids
		if (!fixgrid) {
			let x1, x2;
			for (let i = minxgrid * 2 - 1; i <= maxxgrid * 2 + 1; i += inc) {
				context.beginPath();
				x1 = MatrixVectorProd(transMat, [i * grid.scale, ht]);
				x2 = MatrixVectorProd(transMat, [i * grid.scale, -ht]);
				x1 = [cx + x1[0], cy - x1[1]];
				x2 = [cx + x2[0], cy - x2[1]];
				context.moveTo(x1[0], x1[1]);
				context.lineTo(x2[0], x2[1]);
				context.stroke();
				context.closePath();
			}

			let y1, y2;
			for (let i = minygrid * 2 - 1; i <= maxygrid * 2 + 1; i += inc) {
				context.beginPath();
				y1 = MatrixVectorProd(transMat, [-wd, i * grid.scale]);
				y2 = MatrixVectorProd(transMat, [wd, i * grid.scale]);
				y1 = [cx + y1[0], cy - y1[1]];
				y2 = [cx + y2[0], cy - y2[1]];
				context.moveTo(y1[0], y1[1]);
				context.lineTo(y2[0], y2[1]);
				context.stroke();
				context.closePath();
			}
		}
	}

	// axes
	context.lineWidth = grid.axiswidth;
	context.strokeStyle = grid.axiscolor;

	context.beginPath();
	context.moveTo(cx, 0);
	context.lineTo(cx, ht);
	context.stroke();
	context.closePath();

	context.beginPath();
	context.moveTo(0, cy);
	context.lineTo(wd, cy);
	context.stroke();
	context.closePath();

	// add labels
	labels();
};

// axis labels, based on zoom:
var labels = function () {
	context.font = grid.labelsize + "px Arial";
	context.fillStyle = grid.labelcolor;
	context.textAlign = "center";
	context.textBaseline = "top";

	var labelevery, digits;

	if (grid.system == "polar") {
		if (grid.scale >= 270) {
			labelevery = 0.2;
			digits = 1;
		} else if (grid.scale > 200 && grid.scale < 270) {
			labelevery = 0.5;
			digits = 1;
		} else {
			labelevery = Math.min(Math.floor(250 / grid.scale), 5);
			digits = 0;
		}

		if (grid.maxx > labelevery) {
			for (let i = labelevery; i <= grid.maxx; i += labelevery) {
				context.fillText(
					i.toFixed(digits),
					cx + i * grid.scale,
					cy + 3
				);
			}
		}
		if (grid.minx < -1 * labelevery) {
			for (let i = -1 * labelevery; i >= grid.minx; i -= labelevery) {
				context.fillText(
					(-1 * i).toFixed(digits),
					cx + i * grid.scale,
					cy + 3
				);
			}
		}

		context.textBaseline = "middle";
		context.textAlign = "right";
		if (grid.maxy > labelevery) {
			for (let i = labelevery; i <= grid.maxy; i += labelevery) {
				context.fillText(
					i.toFixed(digits),
					cx - 5,
					cy - i * grid.scale
				);
			}
		}
		if (grid.miny < -1 * labelevery) {
			for (let i = -1 * labelevery; i >= grid.miny; i -= labelevery) {
				context.fillText(
					(-1 * i).toFixed(digits),
					cx - 5,
					cy - i * grid.scale
				);
			}
		}
	} else if (grid.system == "cartesian") {
		if (grid.scale >= 270) {
			labelevery = 0.2;
			digits = 1;
		} else if (grid.scale > 200 && grid.scale < 270) {
			labelevery = 0.5;
			digits = 1;
		} else {
			labelevery = Math.min(Math.floor(250 / grid.scale), 5);
			digits = 0;
		}

		if (grid.maxx > labelevery) {
			for (let i = labelevery; i < grid.maxx; i += labelevery) {
				context.fillText(
					i.toFixed(digits),
					cx + i * grid.scale,
					cy + 3
				);
			}
		}
		if (grid.minx < -1 * labelevery) {
			for (let i = -1 * labelevery; i > grid.minx; i -= labelevery) {
				context.fillText(
					i.toFixed(digits),
					cx + i * grid.scale,
					cy + 3
				);
			}
		}

		context.textBaseline = "middle";
		context.textAlign = "right";
		if (grid.maxy > labelevery) {
			for (let i = labelevery; i < grid.maxy; i += labelevery) {
				context.fillText(
					i.toFixed(digits),
					cx - 5,
					cy - i * grid.scale
				);
			}
		}
		if (grid.miny < -1 * labelevery) {
			for (let i = -1 * labelevery; i > grid.miny; i -= labelevery) {
				context.fillText(
					i.toFixed(digits),
					cx - 5,
					cy - i * grid.scale
				);
			}
		}
	}
};
