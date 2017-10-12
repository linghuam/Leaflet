L.ShipLayer = L.Path.extend({

    options: {
        fill: true,
        rotate: 0,
        width: 12,
        height: 24
    },

    initialize: function (latlng, options) {
        L.Util.setOptions(this, options);
        this._latlng = this._toLatLng(latlng);
        this._rotate = this.options.rotate;
        this._width = this.options.width;
        this._height = this.options.height;
    },

    setLatLng: function (latlng) {
        this._latlng = this._toLatLng(latlng);
        this.redraw();
        return this.fire('move', { latlng: this._latlng });
    },

    getLatLng: function () {
        return this._latlng;
    },

    setRotate: function (rotate) {
        this.options.rotate = this._rotate = rotate;
        return this.redraw();
    },

    getRotate: function () {
        return this._rotate;
    },

    setStyle: function (options) {
        var rotate = options && options.rotate || this._rotate;
        Path.prototype.setStyle.call(this, options);
        this.setRotate(rotate);
        return this;
    },

    _project: function () {
        this._point = this._map.latLngToLayerPoint(this._latlng);
        this._updateBounds();
    },

    _updateBounds: function () {
        var r = this._width / 2,
            r2 = this._height / 2 || r,
            w = this._clickTolerance(),
            p = [r + w, r2 + w];
        this._pxBounds = new L.Bounds(this._point.subtract(p), this._point.add(p));
    },

    _update: function () {
        if(this._map) {
            this._updatePath();
        }
    },

    _updatePath: function () {
        this._renderer._updateShip(this);
    },

    _empty: function () {
        return this._width && this._height && this._rotate && !this._renderer._bounds.intersects(this._pxBounds);
    },

    // Needed by the `Canvas` renderer for interactivity
    _containsPoint: function (p) {
        var maxDis = Math.sqrt(Math.pow(this._width, 2) + Math.pow(this._height,2)) / 2;
        var minDis = Math.min(this._width,this._height) / 2;
        return p.distanceTo(this._point) <= minDis + this._clickTolerance();
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

L.ShipCanvas = L.Canvas.extend({
    _updateShip: function (layer) {
        if(!this._drawing || layer._empty()) { return; }

        var p = layer._point,
            ctx = this._ctx,
            rotate = layer._rotate,
            w = layer._width,
            h = layer._height,
            dh = h / 3;

        this._drawnLayers[layer._leaflet_id] = layer;

        // 绘制部分 -start
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((Math.PI / 180) * rotate);
        ctx.beginPath();
        ctx.moveTo(0, 0 - h / 2);
        ctx.lineTo(0 - w / 2, 0 - h / 2 + dh);
        ctx.lineTo(0 - w / 2, 0 + h / 2);
        ctx.lineTo(0 + w / 2, 0 + h / 2);
        ctx.lineTo(0 + w / 2, 0 - h / 2 + dh);
        ctx.closePath();

        this._fillStroke(ctx, layer);
        ctx.restore();
        // 绘制部分  -end 
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