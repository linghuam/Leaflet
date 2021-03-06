// 扇形 或环形
L.Sector = L.Path.extend({

    options: {
        fill: true,
        fillColor:'#3388ff',
        // renderer:L.sectorCanvas(),

        // self options 
        startRadius: 0, // in meter
        endRadius:10,
        startAngle: 0, // the angle realtive to the east; between 0 and 360 (必须顺时针)
        endAngle: 360, // the angle realtive to the east; between 0 and 360
    },

    initialize: function (latlng, options) {
        L.Util.setOptions(this, options);
        this._latlng = this._toLatLng(latlng);
        var startAngle = this._wrapAngle(this.options.startAngle);
        var  endAngle = this._wrapAngle(this.options.endAngle);
        this._startAngle = startAngle;
        this._endAngle = endAngle;
        this._startRadius = Math.abs(this.options.startRadius);
        this._endRadius = Math.abs(this.options.endRadius);
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
        var nstartAngle = endAngle === undefined ?  this._startAngle : startAngle;
        var nendAngle = endAngle === undefined ?  startAngle : endAngle;
        this.options.startAngle = this._startAngle = this._wrapAngle(nstartAngle);
        this.options.endAngle = this._endAngle = this._wrapAngle(nendAngle);        
        return this.redraw();
    },

    _wrapAngle: function (angle) {
        return angle;
        angle = Number(angle);
        if (Number.isNaN(angle)){            
            throw new Error('angle is not a number!');
            return 0 ;
        }
        if (Math.abs(angle / 360) > 1) {
            return (angle % 360 < 0) ? (360 + angle % 360) : (angle % 360);
        } else {
            return angle < 0 ? (360 + angle) : angle;
        }
    },

    setRadius: function (startRadius, endRadius) {
        if (endRadius === undefined){
            this.options.endRadius = this._endRadius = Math.abs(startRadius);
        } else {
            this.options.startRadius = this._startRadius = Math.abs(startRadius);
            this.options.endRadius = this._endRadius = Math.abs(endRadius);
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
        this._pStartRadius = this.getPixelRadius(Math.abs(this.options.startRadius));
        this._pEndRadius = this.getPixelRadius(Math.abs(this.options.endRadius));
        this._updateBounds();
    },

    getPixelRadius: function (mRadius) {
        var lng = this._latlng.lng,
            lat = this._latlng.lat,
            map = this._map,
            crs = map.options.crs;

        if (crs.distance === L.CRS.Earth.distance) {
            var d = Math.PI / 180,
                latR = (mRadius / L.CRS.Earth.R) / d,
                top = map.project([lat + latR, lng]),
                bottom = map.project([lat - latR, lng]),
                p = top.add(bottom).divideBy(2),
                lat2 = map.unproject(p).lat,
                lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
                        (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

            if (isNaN(lngR) || lngR === 0) {
                lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
            }

            var point = p.subtract(map.getPixelOrigin());
            return isNaN(lngR) ? 0 : Math.max(Math.round(p.x - map.project([lat2, lng - lngR]).x), 1);
            // this._radiusY = Math.max(Math.round(p.y - top.y), 1);

        } else {
            var latlng2 = crs.unproject(crs.project(this._latlng).subtract([mRadius, 0]));

            var point = map.latLngToLayerPoint(this._latlng);
            return point.x - map.latLngToLayerPoint(latlng2).x;
        }    
    },

    getBounds: function () {
        if (this._pxBounds) {
            return new L.latLngBounds(this._map.layerPointToLatLng(this._pxBounds.min), this._map.layerPointToLatLng(this._pxBounds.max));
        }
    },

    _updateBounds: function () {
        var srad = Math.PI / 180 * this._startAngle;
        var erad = Math.PI / 180 * this._endAngle;
        // 计算几个点包括 ：扇心、四个边界点、最多四个与坐标轴交点
        var points = [];
        if (this._pStartRadius <= 0) {
            points.push(this._point.clone());
        }
        points.push(L.point(this._pStartRadius * Math.cos(srad), this._pStartRadius * Math.sin(srad)).add(this._point));
        points.push(L.point(this._pStartRadius * Math.cos(erad), this._pStartRadius * Math.sin(erad)).add(this._point));
        points.push(L.point(this._pEndRadius * Math.cos(srad), this._pEndRadius * Math.sin(srad)).add(this._point));
        points.push(L.point(this._pEndRadius * Math.cos(erad), this._pEndRadius * Math.sin(erad)).add(this._point));
        
        if (this._endAngle > 90 && this._startAngle < 90) {
            points.push(L.point(this._pEndRadius * Math.cos(Math.PI/2), this._pEndRadius * Math.sin(Math.PI/2)).add(this._point));
        }
        if (this._endAngle > 180 && this._startAngle < 180) {
            points.push(L.point(this._pEndRadius * Math.cos(Math.PI), this._pEndRadius * Math.sin(Math.PI)).add(this._point));
        }
        if (this._endAngle > 270 && this._startAngle < 270) {
            points.push(L.point(this._pEndRadius * Math.cos(Math.PI*3/2), this._pEndRadius * Math.sin(Math.PI*3/2)).add(this._point));
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
        if ( Number.isNaN(rect.topLeft.x) || Number.isNaN(rect.topLeft.y) || Number.isNaN(rect.bottomRight.x) || Number.isNaN(rect.bottomRight.y)){
            console.log('_pxBounds is not a number!');
        }
        this._pxBounds = new L.Bounds(rect.topLeft.subtract(L.point([w,w])), rect.bottomRight.add(L.point([w,w])));
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
        return (this._endAngle - this._startAngle === 0) || (this._endRadius - this._startRadius === 0) && !this._renderer._bounds.intersects(this._pxBounds);
    },

    // Needed by the `Canvas` renderer for interactivity
    _containsPoint: function (p) {
        var maxDis = Math.max(this._pEndRadius, this._pStartRadius) + this._clickTolerance(); 
        var minDis = Math.min(this._pEndRadius, this._pStartRadius) + this._clickTolerance();
        var vectora = L.point(1, 0);
        var vectorb = p.subtract(this._point);
        var aMutiplyb = vectora.x * vectorb.x + vectora.y * vectorb.y;
        var aMbM = Math.sqrt(vectora.x * vectora.x + vectora.y * vectora.y) * Math.sqrt(vectorb.x * vectorb.x + vectorb.y * vectorb.y);
        var cosab = aMutiplyb / aMbM;
        var angle = Math.acos(cosab) * 180 / Math.PI;
        if (p.y < this._point.y) {
            angle = 360 - angle;
        }
        var isAngleCorrect = false;
        if (this._startAngle > this._endAngle) {
            isAngleCorrect = angle >= this._startAngle || angle <= this._endAngle;
        } else {
            isAngleCorrect =  angle >= this._startAngle && angle <= this._endAngle;
        }
        return p.distanceTo(this._point) <= maxDis && p.distanceTo(this._point) >= minDis && isAngleCorrect;
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

    /*
     * 在移除时移除整个canvas，避免遗留多余canvas元素
     * 
     */
    _removePath: function(layer) {
        L.DomUtil.remove(this._container);
        L.Canvas.prototype._removePath.call(this, layer);
        layer._removed = true;
    },    

    _updateSector: function (layer) {
        
        // if(!this._drawing || layer._empty()) { return; }
        // this._clear(); 清除方法有问题，只能清除屏幕内的，屏幕外的不能清除
        this._ctx.clearRect(0, 0, this._container.width*2, this._container.height*2);
        var p = layer._point,
            ctx = this._ctx,
            startAngle = layer._startAngle,
            endAngle = layer._endAngle,
            startRadius = layer._pStartRadius,
            endRadius = layer._pEndRadius,
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
        // if (startAngle < endAngle){
        //     ctx.arc(0, 0, startRadius, erad, srad, true);
        //     ctx.lineTo(epoint1.x, epoint1.y);
        //     ctx.arc(0, 0, endRadius, srad, erad, false);
        //     ctx.lineTo(spoint2.x, spoint2.y);            
        // } else {
        //     ctx.arc(0, 0, startRadius, erad, srad, false);
        //     ctx.lineTo(epoint1.x, epoint1.y);
        //     ctx.arc(0, 0, endRadius, srad, erad, true);
        //     ctx.lineTo(spoint2.x, spoint2.y);             
        // }
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