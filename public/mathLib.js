/* MATRICES */
document.addEventListener('DOMContentLoaded', () => {
    console.log('App is ready!');
});

function MatrixVectorProd(mat, vec) {
	// expects mat as mxn array, vec as array with length m
	// ex: mat = [[1,0],[0,1]], vec = [1,2]
	// returns mat*vec as array with length n
	// Sample call: MatrixVectorProd ( [[1,0,3],[0,-1,2]], [1,2,4] )

	if (mat[0].length != vec.length) {
		console.error("Dimension mismatch");
	} else {
		let v = [];
		for (let r = 0; r < mat.length; r++) {
			v[r] = 0;
			for (let c = 0; c < mat[r].length; c++) {
				v[r] += mat[r][c] * vec[c];
			}
		}
		return v;
	}
}

function MatrixMatrixProd(mat1, mat2) {
	// expects mat1 as mxn array, mat2 as nxk array

	if (mat1[0].length != mat2.length) {
		console.error("Dimension mismatch");
	} else {
		let v = [];
		for (let r = 0; r < mat1.length; r++) {
			v.push([]);
			for (let c = 0; c < mat2[0].length; c++) {
				let s = 0;
				for (let p = 0; p < mat1[r].length; p++) {
					s += mat1[r][p] * mat2[p][c];
				}
				v[r].push(s);
			}
		}
		console.log(v);
		return v;
	}
}

/* POLAR COORDINATES */

function CartToPolar(x, y) {
	let r = Math.sqrt(x * x + y * y);
	let rad = Math.atan(y / x);
	return [r, rad];
}

function PolarToCart(r, rad) {
	let x = Math.cos(rad) * r;
	let y = Math.sin(rad) * r;
	return [x, y];
}
