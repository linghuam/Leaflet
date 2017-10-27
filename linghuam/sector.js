// 扇形 或环形
L.Sector = L.Path.extend({

    options: {
        fill: true,

        // self options 
        startRadius: 0, // in pixels
        endRadius:10,
        startAngle: 0, // the angle realtive to the east; between 0 and 360
        endAngle: 360, // the angle realtive to the east; between 0 and 360
    },

    initialize: function (latlng, options) {
        L.Util.setOptions(this, options);
        this._latlng = this._toLatLng(latlng);
        this._startAngle = this.options.startAngle;
        this._endAngle = this.options.endAngle;
        this._startRadius = this.options.startRadius;
        this._endRadius = this.options.endRadius;
    },

    setLatLng: function (latlng) {
        this._latlng = this._toLatLng(latlng);
        this.redraw();
        return this.fire('move', { latlng: this._latlng });
    },

    getLatLng: function () {
        return this._latlng;
    },

    setAngle: function (startAngle, endAngle) {
        if (endAngle === undefined){
            this.options.endAngle = this._endAngle = startAngle;
        } else {
            this.options.startAngle = this._startAngle = startAngle;
            this.options.endAngle = this._endAngle = endAngle;
        }
        return this.redraw();
    },

    setRadius: function (startRadius, endRadius) {
        if (endRadius === undefined){
            this.options.endRadius = this._endRadius = startRadius;
        } else {
            this.options.startRadius = this._startRadius = startRadius;
            this.options.endRadius = this._endRadius = endRadius;
        }
        return this.redraw();
    },

    setStyle: function (options) {
        var startAngle = options && options.startAngle || this._startAngle;
        var endAngle = options && options.endAngle || this._endAngle;
        var startRadius = options && options.startRadius || this._startRadius;
        var endRadius = options && options.endRadius || this._endRadius;
        Path.prototype.setStyle.call(this, options);
        this.setAngle(startAngle, endAngle);
        this.setRadius(startRadius, endRadius);
        return this;
    },

    _project: function () {
        this._point = this._map.latLngToLayerPoint(this._latlng);
        this._updateBounds();
    },

    _updateBounds: function () {
        var srad = Math.PI / 180 * this._startAngle;
        var erad = Math.PI / 180 * this._endAngle;
        // 计算几个点包括 ：扇心、四个边界点、最多四个与坐标轴交点
        var points = [];
        if (this._startRadius <= 0) {
            points.push(this._point.clone());
        }
        points.push(L.point(this._startRadius * Math.cos(srad), this._startRadius * Math.sin(srad)).add(this._point));
        points.push(L.point(this._startRadius * Math.cos(erad), this._startRadius * Math.sin(erad)).add(this._point));
        points.push(L.point(this._endRadius * Math.cos(srad), this._endRadius * Math.sin(srad)).add(this._point));
        points.push(L.point(this._endRadius * Math.cos(erad), this._endRadius * Math.sin(erad)).add(this._point));
        
        if (this._endAngle > 90 && this._startAngle < 90) {
            points.push(L.point(this._endRadius * Math.cos(Math.PI/2), this._endRadius * Math.sin(Math.PI/2)).add(this._point));
        }
        if (this._endAngle > 180 && this._startAngle < 180) {
            points.push(L.point(this._endRadius * Math.cos(Math.PI), this._endRadius * Math.sin(Math.PI)).add(this._point));
        }
        if (this._endAngle > 270 && this._startAngle < 270) {
            points.push(L.point(this._endRadius * Math.cos(Math.PI*3/2), this._endRadius * Math.sin(Math.PI*3/2)).add(this._point));
        }
        // 找出xmin,ymin,xmax,ymax 计算外包矩形
        var rect = {};
        rect.topLeft = points[0].clone();
        rect.bottomRight = points[0].clone();
        for (var i = 0, len = points.length; i < len; i++) {
            var pt = points[i];
            if (pt.x < rect.topLeft.x) rect.topLeft.x = pt.x;
            if (pt.y < rect.topLeft.y) rect.topLeft.y = pt.y;
            if (pt.x > rect.bottomRight.x) rect.bottomRight.x = pt.x;
            if (pt.y > rect.bottomRight.y) rect.bottomRight.y = pt.y;
        }
        // pxbounds
        var w = this._clickTolerance();
        this._pxBounds = new L.Bounds(rect.topLeft.subtract(w), rect.bottomRight.add(w));
    },

    _update: function () {
        if(this._map) {
            this._updatePath();
        }
    },

    _updatePath: function () {
        this._renderer._updateSector(this);
    },

    _empty: function () {
        return (this._endAngle - this._startAngle <= 0) || (this._endRadius - this._startRadius <= 0) && !this._renderer._bounds.intersects(this._pxBounds);
    },

    // Needed by the `Canvas` renderer for interactivity
    _containsPoint: function (p) {
        var maxDis = this._endRadius + this._clickTolerance(); 
        var minDis = this._startRadius + this._clickTolerance();
        var vectora = L.point(1, 0);
        var vectorb = p.subtract(this._point);
        var aMutiplyb = vectora.x * vectorb.x + vectora.y * vectorb.y;
        var aMbM = Math.sqrt(vectora.x * vectora.x + vectora.y * vectora.y) * Math.sqrt(vectorb.x * vectorb.x + vectorb.y * vectorb.y);
        var cosab = aMutiplyb / aMbM;
        var angle = Math.acos(cosab);
        if (p.y < this._point.y) {
            angle = 360 - angle;
        }
        return p.distanceTo(this._point) <= maxDis && p.distanceTo(this._point) >= minDis && angle >= this._startAngle && angle <= this._endAngle;
    },

    _clickTolerance: function () {
        return 0;
    },

    _toLatLng: function (a, b, c) {
        if(a instanceof L.LatLng) {
            return a;
        }
        if(L.Util.isArray(a) && typeof a[0] !== 'object') {
            if(a.length === 3) {
                return new L.LatLng(a[0], a[1], a[2]);
            }
            if(a.length === 2) {
                return new L.LatLng(a[0], a[1]);
            }
            return null;
        }
        if(a === undefined || a === null) {
            return a;
        }
        if(typeof a === 'object' && 'lat' in a) {
            return new L.LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
        }
        if(b === undefined) {
            return null;
        }
        return new L.LatLng(a, b, c);
    }
});

L.SectorCanvas = L.Canvas.extend({

    _updateSector: function (layer) {
        
        // if(!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            startAngle = layer._startAngle,
            endAngle = layer._endAngle,
            startRadius = layer._startRadius,
            endRadius = layer._endRadius,
            srad = Math.PI / 180 * startAngle,
            erad = Math.PI / 180 * endAngle,
            spoint1 = L.point(startRadius * Math.cos(srad), startRadius * Math.sin(srad)),
            spoint2 = L.point(startRadius * Math.cos(erad), startRadius * Math.sin(erad)),
            epoint1 = L.point(endRadius * Math.cos(srad), endRadius * Math.sin(srad)),
            epoint2 = L.point(endRadius * Math.cos(erad), endRadius * Math.sin(erad));

        this._drawnLayers[layer._leaflet_id] = layer;

        // 绘制部分-start
        ctx.save();        
        ctx.beginPath();
        ctx.translate(p.x, p.y);
        ctx.arc(0, 0, startRadius, erad, srad, true);
        ctx.lineTo(epoint1.x, epoint1.y);
        ctx.arc(0, 0, endRadius, srad, erad, false);
        ctx.lineTo(spoint2.x, spoint2.y);
        ctx.closePath();
        this._fillStroke(ctx, layer);
        ctx.restore();
        // 绘制部分-end
    },

    _fillStroke: function (ctx, layer) {
        var options = layer.options;

        if(options.fill) {
            ctx.globalAlpha = options.fillOpacity;
            ctx.fillStyle = options.fillColor || options.color;
            ctx.fill(options.fillRule || 'evenodd');
        }

        if(options.stroke && options.weight !== 0) {
            if(ctx.setLineDash) {
                ctx.setLineDash(layer.options && layer.options._dashArray || []);
            }
            ctx.globalAlpha = options.opacity;
            ctx.lineWidth = options.weight;
            ctx.strokeStyle = options.color;
            ctx.lineCap = options.lineCap;
            ctx.lineJoin = options.lineJoin;
            ctx.stroke();
        }
    }    
});

L.sector = function (latlng, options) {
    return new L.Sector(latlng, options);
}

L.sectorCanvas = function (options) {
    return new L.SectorCanvas(options);
}