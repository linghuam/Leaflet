import {Point} from './Point';
import * as Util from '../core/Util';


/*
 * @namespace LineUtil
 *
 * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
 */

// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
// Improves rendering performance dramatically by lessening the number of points to draw.

// @function simplify(points: Point[], tolerance: Number): Point[]
// Dramatically reduces the number of points in a polyline while retaining
// its shape and returns a new array of simplified points, using the
// [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
// Used for a huge performance boost when processing/displaying Leaflet polylines for
// each zoom level and also reducing visual noise. tolerance affects the amount of
// simplification (lesser value means higher quality but slower and with more points).
// Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
export function simplify(points, tolerance) {
	if (!tolerance || !points.length) {
		return points.slice();
	}

	var sqTolerance = tolerance * tolerance;

		// stage 1: vertex reduction
		// 第一步将距离很近的点剔除出去
	    points = _reducePoints(points, sqTolerance);

		// stage 2: Douglas-Peucker simplification
		// 第二步执行道格拉斯普客算法压缩直线
		// 算法思想：
		/* 1. 连接曲线（多个直线段组成）首尾端点构成一条直线，计算中间各点与直线的距离
		   2. 取距离最大值与阈值比较
		   3. 如果大于阈值，则将线在此点出一分为二，递归执行以上步骤；否则舍弃中间所有点
	    */
	    points = _simplifyDP(points, sqTolerance);

	return points;
}

// @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
// Returns the distance between point `p` and segment `p1` to `p2`.
// 返回点到直线段的距离
export function pointToSegmentDistance(p, p1, p2) {
	return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
}

// @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
// Returns the closest point from a point `p` on a segment `p1` to `p2`.
// 返回直线段端点距离点p最近的点
export function closestPointOnSegment(p, p1, p2) {
	return _sqClosestPointOnSegment(p, p1, p2);
}

// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
// 道格拉斯普客算法 http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
function _simplifyDP(points, sqTolerance) {

	var len = points.length,
	    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
	    markers = new ArrayConstructor(len);
        // 采用标记法来标记应该保留的点（提高效率）
	    markers[0] = markers[len - 1] = 1;

	_simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

	var i,
	    newPoints = [];
    // 将标记保留的点取出
	for (i = 0; i < len; i++) {
		if (markers[i]) {
			newPoints.push(points[i]);
		}
	}

	return newPoints;
}

// 递归执行算法
function _simplifyDPStep(points, markers, sqTolerance, first, last) {

	var maxSqDist = 0,
	index, i, sqDist;

	// 计算最大距离
	for (i = first + 1; i <= last - 1; i++) {
		sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);

		if (sqDist > maxSqDist) {
			index = i;
			maxSqDist = sqDist;
		}
	}
    // 如果最大距离大于阈值，则将曲线分成两段，递归执行
	if (maxSqDist > sqTolerance) {
		markers[index] = 1;

		_simplifyDPStep(points, markers, sqTolerance, first, index);
		_simplifyDPStep(points, markers, sqTolerance, index, last);
	}
}

// reduce points that are too close to each other to a single point
// 距离很近的点剔除出去
function _reducePoints(points, sqTolerance) {
	var reducedPoints = [points[0]];

	for (var i = 1, prev = 0, len = points.length; i < len; i++) {
		if (_sqDist(points[i], points[prev]) > sqTolerance) {
			reducedPoints.push(points[i]);
			prev = i;
		}
	}
	if (prev < len - 1) {
		reducedPoints.push(points[len - 1]);
	}
	return reducedPoints;
}

var _lastCode;

// @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
// Clips the segment a to b by rectangular bounds with the
// [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
// (modifying the segment points directly!). Used by Leaflet to only show polyline
// points that are on the screen or near, increasing performance.
// 丹·科恩和伊凡·苏泽兰直线段裁剪算法 https://baike.baidu.com/item/%E4%B8%B9%C2%B7%E7%A7%91%E6%81%A9%E5%92%8C%E4%BC%8A%E5%87%A1%C2%B7%E8%8B%8F%E6%B3%BD%E5%85%B0%E7%9B%B4%E7%BA%BF%E6%AE%B5%E8%A3%81%E5%89%AA%E7%AE%97%E6%B3%95/5177854
// 该算法将窗口之外的部分裁剪出去，提高效率
export function clipSegment(a, b, bounds, useLastCode, round) {
	var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds),
	    codeB = _getBitCode(b, bounds),

	    codeOut, p, newCode;

	    // save 2nd code to avoid calculating it on the next segment
	    _lastCode = codeB;

	while (true) {
		// if a,b is inside the clip window (trivial accept)
		// 如果 a, b（直线的两个端点）在裁剪窗口内部
		// 按位操作符 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
		if (!(codeA | codeB)) {
			return [a, b];
		}

		// if a,b is outside the clip window (trivial reject)
		// 如果 a, b 在裁剪窗口外部
		if (codeA & codeB) {
			return false;
		}

		// other cases
		// a, b与裁剪窗口相交
		codeOut = codeA || codeB;
		p = _getEdgeIntersection(a, b, codeOut, bounds, round);
		newCode = _getBitCode(p, bounds);

		if (codeOut === codeA) {
			a = p;
			codeA = newCode;
		} else {
			b = p;
			codeB = newCode;
		}
	}
}

export function _getEdgeIntersection(a, b, code, bounds, round) {
	var dx = b.x - a.x,
	    dy = b.y - a.y,
	    min = bounds.min,
	    max = bounds.max,
	    x, y;

	if (code & 8) { // top
		x = a.x + dx * (max.y - a.y) / dy;
		y = max.y;

	} else if (code & 4) { // bottom
		x = a.x + dx * (min.y - a.y) / dy;
		y = min.y;

	} else if (code & 2) { // right
		x = max.x;
		y = a.y + dy * (max.x - a.x) / dx;

	} else if (code & 1) { // left
		x = min.x;
		y = a.y + dy * (min.x - a.x) / dx;
	}

	return new Point(x, y, round);
}

export function _getBitCode(p, bounds) {
	var code = 0;

	if (p.x < bounds.min.x) { // left
		code |= 1;
	} else if (p.x > bounds.max.x) { // right
		code |= 2;
	}

	if (p.y < bounds.min.y) { // bottom
		code |= 4;
	} else if (p.y > bounds.max.y) { // top
		code |= 8;
	}

	return code;
}

// square distance (to avoid unnecessary Math.sqrt calls)
function _sqDist(p1, p2) {
	var dx = p2.x - p1.x,
	    dy = p2.y - p1.y;
	return dx * dx + dy * dy;
}

// return closest point on segment or distance to that point
export function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
	var x = p1.x,
	    y = p1.y,
	    dx = p2.x - x,
	    dy = p2.y - y,
	    dot = dx * dx + dy * dy,
	    t;

	if (dot > 0) {
		t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

		if (t > 1) {
			x = p2.x;
			y = p2.y;
		} else if (t > 0) {
			x += dx * t;
			y += dy * t;
		}
	}

	dx = p.x - x;
	dy = p.y - y;

	return sqDist ? dx * dx + dy * dy : new Point(x, y);
}


// @function isFlat(latlngs: LatLng[]): Boolean
// Returns true if `latlngs` is a flat array, false is nested.
export function isFlat(latlngs) {
	return !Util.isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
}

export function _flat(latlngs) {
	console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.');
	return isFlat(latlngs);
}
