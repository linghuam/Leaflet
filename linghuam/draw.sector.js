L.drawLocal.draw.toolbar.buttons.sector = '绘制扇形或环形';

L.drawLocal.draw.handlers.sector = {
    tooltip: {
        start: '点击绘制中心点',
        line: '点击绘制起始半径和角度',
        end: '点击绘制终止角度'
    },
    radius: '半径 (海里): ',
    bearing: '角度 (度): '
};

L.Draw.Sector = L.Draw.Feature.extend({
    statics: {
        TYPE: 'sector'
    },

    options: {
        shapeOptions: {
            stroke: true,
            color: '#0000ff',
            weight: 5,
            opacity: 0.5,
            fillOpacity: 0.2,
            clickable: true
        },
        lineOptions: {
            color: '#ff0000',
            weight: 5,
            dashArray: '5, 10'
        },
        showRadius: true,
        metric: true, // Whether to use the metric measurement system or imperial
        feet: false, // When not metric, to use feet instead of yards for display.
        nautic: false // When not metric, not feet use nautic mile for display      
    },

    initialize: function (map, options) {
        if(options && options.shapeOptions) {
            options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions);
        }
        if(options && options.lineOptions) {
            options.lineOptions = L.Util.extend({}, this.options.lineOptions, options.lineOptions);
        }

        // Save the type so super can fire, need to do this as cannot do this.TYPE :(
        this.type = L.Draw.Sector.TYPE;

        this._initialLabelText = L.drawLocal.draw.handlers.sector.tooltip.start;

        L.Draw.Feature.prototype.initialize.call(this, map, options);
    },

    addHooks: function () {
        L.Draw.Feature.prototype.addHooks.call(this);
        if(this._map) {

            this._sectorCanvas = L.sectorCanvas();
            this._mapDraggable = this._map.dragging.enabled();

            if(this._mapDraggable) {
                this._map.dragging.disable();
            }

            this._container.style.cursor = 'crosshair';

            this._tooltip.updateContent({ text: this._initialLabelText });

            //绘制过程经历 D U M, D U M, D U 
            //暂不考虑触摸屏
            this._map
                .on('mousedown', this._onMouseDown, this)
                .on('mousemove', this._onMouseMove, this)
                .on('mouseup', this._onMouseUp, this);
        }
    },

    removeHooks: function () {
        if(this._map) {
            if(this._mapDraggable) {
                this._map.dragging.enable();
            }

            this._container.style.cursor = '';

            this._map
                .off('mousedown', this._onMouseDown, this)
                .off('mousemove', this._onMouseMove, this)
                .off('mouseup', this._onMouseUp, this);

            L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);

            // If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
            if(this._shape) {
                this._map.removeLayer(this._shape)
                delete this._shape
            }
            if(this._line) {
                this._map.removeLayer(this._line)
                delete this._line
            }
            if (this._tooltip){
                this._tooltip.dispose()
            }
            if (this._startLatLng ) {
                delete this._startLatLng 
            }
            if (this._innerRadius) {
                delete this._innerRadius
            }
            if (this._startBearing) {
                delete this._startBearing
            }
            if (this._endBearing) {
                delete this._endBearing
            }
        }
        this._isDrawing = false;
    },

    _onMouseDown: function (e) {
        var latlng = e.latlng,
            pc = this._map.project(this._startLatLng || latlng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],
            newB = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360;

        this._isDrawing = true;

        if (!this._startLatLng) {
            this._startLatLng = latlng;
        } else if (!this._innerRadius) {
            this._startBearing = newB;
            this._innerRadius = this._startLatLng.distanceTo(latlng);
            // this._innerRadius = pc.distanceTo(ph);
        } else {
            this._endBearing = newB;
        }
    },

    _onMouseMove: function (e) {
        var latlng = e.latlng;

        var radius, pc, ph, v, bearing, nradius;

        this._tooltip.updatePosition(latlng);

        if (this._isDrawing) {
            if (this._innerRadius) {
                this._drawShape(latlng);

                pc = this._map.project(this._startLatLng);
                ph = this._map.project(latlng);

                v = [ph.x - pc.x, ph.y - pc.y];

                bearing = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360;

                this._tooltip.updateContent({
                    text: L.drawLocal.draw.handlers.sector.tooltip.end,
                    subtext: `角度(度): ${bearing}`
                });

            } else {
                radius = this._startLatLng.distanceTo(latlng);
                nradius = this.convertMileToNmile(radius);
                pc = this._map.project(this._startLatLng);
                ph = this._map.project(latlng);
                v = [ph.x - pc.x, ph.y - pc.y];

                bearing = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360;

                this._drawLine(latlng);
                this._tooltip.updateContent({
                    text: L.drawLocal.draw.handlers.sector.tooltip.line,
                    subtext: `半径(海里): ${nradius}, 角度(度): ${bearing}`
                });
            }
        }
    },

    _onMouseUp: function (e) {
        if (this._endBearing) {           
            this._fireCreatedEvent(e)

            this.disable()

            if (this.options.repeatMode) {
                this.enable()
            }
        }
    },

    _drawShape: function (latlng) {       
        var pc, ph, v, startBearing, endBearing;
        pc = this._map.project(this._startLatLng);
        ph = this._map.project(latlng);
        v = [ph.x - pc.x, ph.y - pc.y];
        var radius = Math.max(this._startLatLng.distanceTo(latlng), 5);

        if(!this._shape) {

            startBearing = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360;

            this._shape = L.sector(this._startLatLng, {
                renderer: this._sectorCanvas,
                startRadius: this._innerRadius, // in meter
                endRadius: radius,
                startAngle: this.getAngle(this._startBearing), // the angle realtive to the east; between 0 and 360
                endAngle: this.getAngle(startBearing + 1)   
            });
            this._map.addLayer(this._shape);
        } else {

            endBearing = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360;

            this._shape.setRadius(radius);
            this._shape.setAngle(this.getAngle(endBearing));    
        }
    },

    getAngle: function (angle) {
        angle = Number(angle);
        if (angle >= 90 && angle <= 180) {
            return Math.abs(angle) - 90;
        } else {
            return 270 + angle;
        }
    },

    /*米转化为海里*/
    convertMileToNmile: function (mileVal) {
        var oval = parseFloat(mileVal);
        var newval = Number(oval / (1.852 * 1000));
        return newval.toFixed(3);
    },

    _drawLine: function (latlng) {
        if(!this._line) {
            this._line = L.polyline([this._startLatLng, latlng], this.options.lineOptions);
            this._map.addLayer(this._line);
        } else {
            this._line.setLatLngs([this._startLatLng, latlng]);
        }
    },

    _fireCreatedEvent: function () {
        var sector = L.sector(this._startLatLng, {
            renderer: L.sectorCanvas(),
            startRadius: this._shape._startRadius, // in pixels
            endRadius: this._shape._endRadius,
            startAngle: this._shape._startAngle, // the angle realtive to the east; between 0 and 360
            endAngle: this._shape._endAngle 
        });        

        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, sector);
    }
});