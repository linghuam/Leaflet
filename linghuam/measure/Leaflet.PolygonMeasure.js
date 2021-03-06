/*********************************************************
**                                                      **
**       Leaflet Plugin "Leaflet.PolygonMeasure"       **
**       Version: 2019-3-27                           **
**                                                      **    
*********************************************************/


(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
        // Browser globals
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first');
        }
        factory(window.L);
    }
}(function (L) {
    var _measureControlId = 'polygon-measure-control';
    var _unicodeClass = 'polygon-measure-unicode-icon';

    /**
     * Polyline Measure class
     * @extends L.Control
     */
    L.Control.PolygonMeasure = L.Control.extend({
        /**
         * Default options for the tool
         * @type {Object}
         */
        options: {
            /**
             * Position to show the control. Possible values are: 'topright', 'topleft', 'bottomright', 'bottomleft'
             * @type {String}
             * @default
             */
            position: 'topleft',        
            /**
             * Which units the distances are displayed in. Possible values are: 'metres', 'landmiles', 'nauticalmiles'
             * @type {String}
             * @default
             */
            unit: 'metres',
            /**
             * Clear the measurements on stop
             * @type {Boolean}
             * @default
             */
            clearMeasurementsOnStop: true,
            /**
             * Whether bearings are displayed within the tooltips
             * @type {Boolean}
             * @default
             */
            showBearings: false,
            /**
             * 是否显示箭头
             */
            showArrow: false, 
            /**
             * 是否显示距离标签
             */
             showDistance: false,
             /**
             * Text for the bearing In
             * @type {String}
             * @default
             */
            bearingTextIn: 'In',
            /**
             * Text for the bearing Out
             * @type {String}
             * @default
             */
            bearingTextOut: 'Out',
             /**
             * Text for last point's tooltip
             * @type {String}
             * @default
             */
            tooltipTextDraganddelete: 'Click and drag to <b>move point</b><br>Press SHIFT-key and click to <b>delete point</b>',
            tooltipTextResume: '<br>Press CTRL-key and click to <b>resume line</b>',
            tooltipTextAdd: 'Press CTRL-key and click to <b>add point</b>',
                        
            /**
             * Title for the control going to be switched on
             * @type {String}
             * @default
             */
            measureControlTitleOn: "Turn on PolygonMeasure",
            /**
             * Title for the control going to be switched off
             * @type {String}
             * @default
             */
            measureControlTitleOff: "Turn off PolygonMeasure",
            /**
             * Label of the Measure control (maybe a unicode symbol)
             * @type {String}
             * @default
             */
            measureControlLabel: '&#8614;',
            /**
             * Classes to apply to the Measure control
             * @type {Array}
             * @default
             */
            measureControlClasses: [],
            /**
             * Show a control to clear all the measurements
             * @type {Boolean}
             * @default
             */
            showClearControl: false,
            /**
             * Title text to show on the Clear measurements control button
             * @type {String}
             * @default
             */
            clearControlTitle: 'Clear Measurements',
            /**
             * Label of the Clear control (maybe a unicode symbol)
             * @type {String}
             * @default
             */
            clearControlLabel: '&times;',
            /**
             * Classes to apply to Clear control button
             * @type {Array}
             * @default
             */
            clearControlClasses: [],
            /**
             * Show a control to change the units of measurements
             * @type {Boolean}
             * @default
             */
            showUnitControl: false,
            /**
             * Title texts to show on the Unit Control button
             * @type {Object}
             * @default
             */
            unitControlTitle: {
               text: 'Change Units',
               metres: 'metres',
               landmiles: 'land miles',
               nauticalmiles: 'nautical miles'
            },
            /**
             * Label symbols to show in the Unit Control button
             * @type {Object}
             * @default
             */   
            unitControlLabel: {
               metres: 'm',
               kilometres: 'km',
               feet: 'ft',
               landmiles: 'mi',
               nauticalmiles: 'nm'
            },
            /**
             * Styling settings for the temporary dashed rubberline
             * @type {Object}
             */
            tempLine: {
                /**
                 * Dashed line color
                 * @type {String}
                 * @default
                 */
                color: '#00f',
                /**
                 * Dashed line weight
                 * @type {Number}
                 * @default
                 */
                weight: 2
            },
            /**
             * Styling for the fixed polyline
             * @type {Object}
             */
            fixedLine: {
                /**
                 * Solid line color
                 * @type {String}
                 * @default
                 */
                color: '#006',
                /**
                 * Solid line weight
                 * @type {Number}
                 * @default
                 */
                weight: 2
            },
            polygon: {
                stroke: true,
                color: '#0f0',
                weight: 1
            },
            /**
             * Style settings for circle marker indicating the starting point of the polyline
             * @type {Object}
             */
            startCircle: {
                /**
                 * Color of the border of the circle
                 * @type {String}
                 * @default
                 */
                color: '#000',
                /**
                 * Weight of the circle
                 * @type {Number}
                 * @default
                 */
                weight: 1,
                /**
                 * Fill color of the circle
                 * @type {String}
                 * @default
                 */
                fillColor: '#0f0',
                /**
                 * Fill opacity of the circle
                 * @type {Number}
                 * @default
                 */
                fillOpacity: 1,
                /**
                 * Radius of the circle
                 * @type {Number}
                 * @default
                 */
                radius: 3
            },
            /**
             * Style settings for all circle markers between startCircle and endCircle
             * @type {Object}
             */
            intermedCircle: {
                /**
                 * Color of the border of the circle
                 * @type {String}
                 * @default
                 */
                color: '#000',
                /**
                 * Weight of the circle
                 * @type {Number}
                 * @default
                 */
                weight: 1,
                /**
                 * Fill color of the circle
                 * @type {String}
                 * @default
                 */
                fillColor: '#ff0',
                /**
                 * Fill opacity of the circle
                 * @type {Number}
                 * @default
                 */
                fillOpacity: 1,
                /**
                 * Radius of the circle
                 * @type {Number}
                 * @default
                 */
                radius: 3
            },
            /**
             * Style settings for circle marker indicating the latest point of the polygon during drawing a line
             * @type {Object}
             */
            currentCircle: {
                /**
                 * Color of the border of the circle
                 * @type {String}
                 * @default
                 */
                color: '#000',
                /**
                 * Weight of the circle
                 * @type {Number}
                 * @default
                 */
                weight: 1,
                /**
                 * Fill color of the circle
                 * @type {String}
                 * @default
                 */
                fillColor: '#f0f',
                /**
                 * Fill opacity of the circle
                 * @type {Number}
                 * @default
                 */
                fillOpacity: 1,
                /**
                 * Radius of the circle
                 * @type {Number}
                 * @default
                 */
                radius: 6
            },
            /**
             * Style settings for circle marker indicating the end point of the polygon
             * @type {Object}
             */
            endCircle: {
                /**
                 * Color of the border of the circle
                 * @type {String}
                 * @default
                 */
                color: '#000',
                /**
                 * Weight of the circle
                 * @type {Number}
                 * @default
                 */
                weight: 1,
                /**
                 * Fill color of the circle
                 * @type {String}
                 * @default
                 */
                fillColor: '#f00',
                /**
                 * Fill opacity of the circle
                 * @type {Number}
                 * @default
                 */
                fillOpacity: 1,
                /**
                 * Radius of the circle
                 * @type {Number}
                 * @default
                 */
                radius: 3
            }
        },
        
        /**
         * Create a control button
         * @param {String}      label           Label to add
         * @param {String}      title           Title to show on hover
         * @param {Array}       classesToAdd    Collection of classes to add
         * @param {Element}     container       Parent element
         * @param {Function}    fn              Callback function to run
         * @param {Object}      context         Context
         * @returns {Element}                   Created element
         * @private
         */
        _createControl: function (label, title, classesToAdd, container, fn, context) {
            var anchor = document.createElement('a');
            anchor.innerHTML = label;
            anchor.setAttribute('title', title);
            classesToAdd.forEach(function(c) {
                anchor.classList.add(c);
            });
            L.DomEvent.on (anchor, 'click', fn, context);
            container.appendChild(anchor);
            return anchor;
        },

        /**
         * Method to fire on add to map
         * @param {Object}      map     Map object
         * @returns {Element}           Containing element
         */
        onAdd: function(map) {
            var self = this
            // needed to avoid creating points by mouseclick during dragging the map
    	    map.on('movestart ', function() {
    		  self._mapdragging = true
    	    })
            this._container = document.createElement('div');
            this._container.classList.add('leaflet-bar');
            L.DomEvent.disableClickPropagation(this._container); // otherwise drawing process would instantly start at controls' container or double click would zoom-in map
            var title = this.options.measureControlTitleOn;
            var label = this.options.measureControlLabel;
            var classes = this.options.measureControlClasses;
            if (label.indexOf('&') != -1) {
                classes.push(_unicodeClass);
            }

            // initialize state
            this._arrPolygons = [];
            this._measureControl = this._createControl (label, title, classes, this._container, this._toggleMeasure, this);
            // 绘制前清除其他绘制
            L.DomEvent.on(this._measureControl, 'click', function(e) {
                if(this._map && this._map.PMControl && this._map.PMControl._measuring) {
                    this._map.PMControl._toggleMeasure();
                }
            }, this);
            this._defaultControlBgColor = this._measureControl.style.backgroundColor;
            this._measureControl.setAttribute('id', _measureControlId);
            if (this.options.showClearControl) {
                var title = this.options.clearControlTitle;
                var label = this.options.clearControlLabel;
                var classes = this.options.clearControlClasses;
                if (label.indexOf('&') != -1) {
                    classes.push(_unicodeClass);
                }
                this._clearMeasureControl = this._createControl (label, title, classes, this._container, this._clearAllMeasurements, this);
                this._clearMeasureControl.classList.add('polygon-measure-clearControl')
            }
            if (this.options.showUnitControl) {
                if (this.options.unit == "metres") {
                    var label = this.options.unitControlLabel.metres;
                    var title = this.options.unitControlTitle.text + " [" + this.options.unitControlTitle.metres  + "]";
                }  else if  (this.options.unit == "landmiles") {
                    var label = this.options.unitControlLabel.landmiles;
                    var title = this.options.unitControlTitle.text + " [" + this.options.unitControlTitle.landmiles  + "]";
                } else {
                    var label = this.options.unitControlLabel.nauticalmiles;
                    var title = this.options.unitControlTitle.text + " [" + this.options.unitControlTitle.nauticalmiles  + "]";
                }
                var classes = [];
                this._unitControl = this._createControl (label, title, classes, this._container, this._changeUnit, this);
                this._unitControl.setAttribute ('id', 'unitControlId');
            }

            map.PGControl = this;
            return this._container;
        },

        /**
         * Method to fire on remove from map
         */
        onRemove: function () {
            if (this._measuring) {
                this._toggleMeasure();
            } 
        },
        
        // turn off all Leaflet-own events of markers (popups, tooltips). Needed to allow creating points on top of markers
        _blockEvents: function () {
            if (!this._oldTargets) {
                this._oldTargets = this._map._targets;
                this._map._targets = {};
            }
        },
        
        // on disabling the measure add-on, enable the former Leaflet-own events again
        _unblockEvents: function () {
            if (this._oldTargets) {
                this._map._targets = this._oldTargets;
                delete this._oldTargets;
            }
        },
    
        /**
         * Toggle the measure functionality on or off
         * @private
         */
        _toggleMeasure: function () {
            this._measuring = !this._measuring;
            if (this._measuring) {   // if measuring is going to be switched on
                this._mapdragging = false;
                this._blockEvents();
                this._measureControl.classList.add ('polygon-measure-controlOnBgColor');
                this._measureControl.style.backgroundColor = this.options.backgroundColor;
                this._measureControl.title = this.options.measureControlTitleOff;
                this._oldCursor = this._map._container.style.cursor;          // save former cursor type
                this._map._container.style.cursor = 'crosshair';
                this._doubleClickZoom = this._map.doubleClickZoom.enabled();  // save former status of doubleClickZoom
                this._map.doubleClickZoom.disable();
                // create LayerGroup "layerPaint" (only) the first time Measure Control is switched on
                if (!this._layerPaint) {
                    this._layerPaint = L.layerGroup().addTo(this._map);
                }
                this._map.on ('mousemove', this._mouseMove, this);   //  enable listing to 'mousemove', 'click', 'keydown' events
                this._map.on ('click', this._mouseClick, this);
                L.DomEvent.on (document, 'keydown', this._onKeyDown, this);
                this._resetPathVariables();
            } else {   // if measuring is going to be switched off
                this._unblockEvents();
                this._measureControl.classList.remove ('polygon-measure-controlOnBgColor');
                this._measureControl.style.backgroundColor = this._defaultControlBgColor;
                this._measureControl.title = this.options.measureControlTitleOn;
                this._map._container.style.cursor = this._oldCursor;
                this._map.off ('mousemove', this._mouseMove, this);
                this._map.off ('click', this._mouseClick, this);
                L.DomEvent.off (document, 'keydown', this._onKeyDown, this);
                if(this._doubleClickZoom) {
                    this._map.doubleClickZoom.enable();
                }
                if(this.options.clearMeasurementsOnStop && this._layerPaint) {
                    this._clearAllMeasurements();
                }
                // to remove temp. Line if line at the moment is being drawn and not finished while clicking the control
                if (this._cntCircle !== 0) {
                    this._finishPolygonPath();
                }
            }
            // allow easy to connect the measure control to the app, f.e. to disable the selection on the map when the measurement is turned on
            this._map.fire('polygonmeasure:toggle', {sttus: this._measuring});
        },

        /**
         * Clear all measurements from the map
         */
        _clearAllMeasurements: function() {
            if ((this._cntCircle !== undefined) && (this._cntCircle !== 0)) {
                    this._finishPolygonPath();
            }
            if (this._layerPaint) {
                this._layerPaint.clearLayers();
            }
            this._arrPolygons = [];
        },
        
        _changeUnit: function() {
            if (this.options.unit == "metres") {
                this.options.unit = "landmiles";
                document.getElementById("unitControlId").innerHTML = this.options.unitControlLabel.landmiles;
                this._unitControl.title = this.options.unitControlTitle.text +" [" + this.options.unitControlTitle.landmiles  + "]";
            } else if (this.options.unit == "landmiles") {
                this.options.unit = "nauticalmiles";
                document.getElementById("unitControlId").innerHTML = this.options.unitControlLabel.nauticalmiles;
                this._unitControl.title = this.options.unitControlTitle.text +" [" + this.options.unitControlTitle.nauticalmiles  + "]";
            } else {
                this.options.unit = "metres";
                document.getElementById("unitControlId").innerHTML = this.options.unitControlLabel.metres;
                this._unitControl.title = this.options.unitControlTitle.text +" [" + this.options.unitControlTitle.metres  + "]";
            }
            this._arrPolygons.map (function(polygon) {
                if (this.options.showDistance) {
                    let totalDistance = 0;
                    polygon.circleCoords.map (function(point, point_index) {
                        if (point_index >= 1) {
                            let distance = polygon.circleCoords [point_index - 1].distanceTo (polygon.circleCoords [point_index]);
                            totalDistance += distance;
                            this._updateTooltip (polygon.tooltips [point_index], polygon.tooltips [point_index - 1], totalDistance, distance, polygon.circleCoords [point_index - 1], polygon.circleCoords [point_index]);
                        }
                    }.bind(this));
                }
                {
                    let area = this._getArea(polygon.polygonPath.getLatLngs()[0]);
                    let center = polygon.polygonPath.getCenter();
                    polygon.areaTooltip._icon.innerHTML = area;
                    polygon.areaTooltip.setLatLng(center);
                }
            }.bind(this));
        },

        /**
         * Event to fire when a keyboard key is depressed.
         * Currently only watching for ESC key (= keyCode 27). 1st press finishes line, 2nd press turns Measuring off.
         * @param {Object} e Event
         * @private
         */
        _onKeyDown: function (e) {
            if (e.keyCode === 27) {
                // if resuming a line at its first point is active
                if (this._resumeFirstpointFlag === true) {
                    this._resumeFirstpointFlag = false;
                    this._map.off ('mousemove', this._resumeFirstpointMousemove, this);
                    this._map.off ('click', this._resumeFirstpointClick, this); 
                    this._layerPaint.removeLayer (this._rubberlinePath2);
                    this._layerPaint.removeLayer (tooltipNew);
                    this._arrPolygons[lineNr].circleMarkers [0].setStyle (this.options.startCircle);
                    text = '';
                    var totalDistance = 0;
                    if (this.options.showBearings === true) {
                        text = this.options.bearingTextIn+':---°<br>'+this.options.bearingTextOut+':---°';
                    }  
                    text = text + '<div class="polygon-measure-tooltip-difference">+' + '0</div>';
                    text = text + '<div class="polygon-measure-tooltip-total">' + '0</div>'; 
                    if (this.options.showDistance) {
                        this._arrPolygons[lineNr].tooltips [0]._icon.innerHTML = text;
                        this._arrPolygons[lineNr].tooltips.map (function (item, index) {
                            if (index >= 1) {
                                var distance = this._arrPolygons[lineNr].circleCoords[index-1].distanceTo (this._arrPolygons[lineNr].circleCoords[index]);
                                var lastCircleCoords = this._arrPolygons[lineNr].circleCoords[index - 1];
                                var mouseCoords = this._arrPolygons[lineNr].circleCoords[index];
                                totalDistance += distance;
                                var prevTooltip = this._arrPolygons[lineNr].tooltips[index-1]
                                this._updateTooltip (item, prevTooltip, totalDistance, distance, lastCircleCoords, mouseCoords);
                            }
                        }.bind (this));
                    }                   
                    this._map.on ('mousemove', this._mouseMove, this);
                    return                
                }                 
                // if NOT drawing a line, ESC will directly switch of measuring 
                if (!this._currentLine) {
                    this._toggleMeasure();
                } else {
                    this._finishPolygonPath(e);
                }
            }
        },

        _getArea: function (latlngs) {
            const area = L.GeometryUtil.geodesicArea(latlngs);
            return L.GeometryUtil.readableArea(area, true);
        },

        /**
         * Get the distance in the format specified in the options
         * @param {Number} distance Distance to convert
         * @returns {{value: *, unit: *}}
         * @private
         */
        _getDistance: function (distance) {
            var dist = distance;
            if (this.options.unit === 'nauticalmiles') {
                unit = this.options.unitControlLabel.nauticalmiles;
                if (dist >= 1852000) {
                    dist = (dist/1852).toFixed(0);
                } else if (dist >= 185200) {
                    dist = (dist/1852).toFixed(1);
                    // don't use 3 decimal digits, cause especially in countries using the "." as thousands separator a number could optically be confused (e.g. "1.234 nm": is it 1234 nm or 1,234 nm ?)
                } else if (dist >= 1852) {
                    dist = (dist/1852).toFixed(2);
                } else  {
                    dist = (dist/0.3048).toFixed(0);
                    unit = this.options.unitControlLabel.feet;
                }
            } else if (this.options.unit === 'landmiles') {
                unit = this.options.unitControlLabel.landmiles;
                if (dist >= 1609344) {
                    dist = (dist/1609.344).toFixed(0);
                } else if (dist >= 160934.4) {
                    dist = (dist/1609.344).toFixed(1);
                    // don't use 3 decimal digits, cause especially in countries using the "." as thousands separator a number could optically be confused (e.g. "1.234mi": is it 1234mi or 1,234mi ?)
                } else if (dist >= 1609.344) {
                    dist = (dist/1609.344).toFixed(2);
                } else {
                    dist = (dist/0.3048).toFixed(0);
                    unit = this.options.unitControlLabel.feet;
                }
            }
            else {
                unit = this.options.unitControlLabel.kilometres;
                if (dist >= 1000000) {
                    dist = (dist/1000).toFixed(0);
                } else if (dist >= 100000) {
                    dist = (dist/1000).toFixed(1);
                    // don't use 3 decimal digits, cause especially in countries using the "." as thousands separator a number could optically be confused (e.g. "1.234 km": is it 1234 km or 1,234 km ?)
                } else if (dist >= 1000) {
                    dist = (dist/1000).toFixed(2);
                } else {
                    dist = (dist).toFixed(1);
                    unit = this.options.unitControlLabel.metres;
                }
            }
            return {value:dist, unit:unit};
        },

        /**
         * Calculate Great-circle Arc (= shortest distance on a sphere like the Earth) between two coordinates
         * formulas: http://www.edwilliams.org/avform.htm
         * @private
         */     
        _polylineArc: function (_from, _to) {
            function _GCinterpolate (f) {
                A = Math.sin((1 - f) * d) / Math.sin(d);
                B = Math.sin(f * d) / Math.sin(d);
                x = A * Math.cos(fromLat) * Math.cos(fromLng) + B * Math.cos(toLat) * Math.cos(toLng);
                y = A * Math.cos(fromLat) * Math.sin(fromLng) + B * Math.cos(toLat) * Math.sin(toLng);
                z = A * Math.sin(fromLat) + B * Math.sin(toLat);
                // atan2 better than atan-function cause results are from -pi to +pi
                // => results of latInterpol, lngInterpol always within range -180° ... +180°  => conversion into values < -180° or > + 180° has to be done afterwards
                latInterpol = 180 / Math.PI * Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
                lngInterpol = 180 / Math.PI * Math.atan2(y, x);
                // don't split polygon if it crosses dateline ( -180° or +180°).  Without the polygon would look like: +179° ==> +180° ==> -180° ==> -179°...
                // algo: if difference lngInterpol-from.lng is > 180° there's been an unwanted split from +180 to -180 cause an arc can never span >180°
                diff = lngInterpol-fromLng*180/Math.PI;
                function trunc(n) { return Math[n > 0 ? "floor" : "ceil"](n); }   // alternatively we could use the new Math.trunc method, but Internet Explorer doesn't know it
                if (diff < 0) {
                    lngInterpol = lngInterpol  - trunc ((diff - 180)/ 360) * 360; 
                } else {
                    lngInterpol = lngInterpol  - trunc ((diff +180)/ 360) * 360;
                }
                return [latInterpol, lngInterpol];
            }
             
            function _GCarc (npoints) {
                arrArcCoords = [];
                var delta = 1.0 / (npoints-1 );
                // first point of Arc should NOT be returned
                for (var i = 0; i < npoints; i++) {
                    var step = delta * i;
                    var coordPair = _GCinterpolate (step);
                    arrArcCoords.push (coordPair);
                }
                return arrArcCoords;
            }
   
            var fromLat = _from.lat;  // work with with copies of object's elements _from.lat and _from.lng, otherwise they would get modiefied due to call-by-reference on Objects in Javascript
            var fromLng = _from.lng;
            var toLat = _to.lat;
            var toLng = _to.lng;
            fromLat=fromLat * Math.PI / 180;
            fromLng=fromLng * Math.PI / 180;
            toLat=toLat * Math.PI / 180;
            toLng=toLng * Math.PI / 180;
            var d = 2.0 * Math.asin(Math.sqrt(Math.pow (Math.sin((fromLat - toLat) / 2.0), 2) + Math.cos(fromLat) *  Math.cos(toLat) *  Math.pow(Math.sin((fromLng - toLng) / 2.0), 2)));
            if (d === 0) {
                arrLatLngs = [[fromLat, fromLng]];
            } else {
                arcpoints = 100;   // 100 points = 99 line segments. lower value to make arc less accurate or increase value to make it more accurate.
                arrLatLngs = _GCarc(arcpoints);
            }
            return arrLatLngs;
        },
    
        /**
         * Update the tooltip distance
         * @param {Number} total        Total distance
         * @param {Number} difference   Difference in distance between 2 points
         * @private
         */
        _updateTooltip: function (currentTooltip, prevTooltip, total, difference, lastCircleCoords, mouseCoords, area) {
            // Explanation of formula: http://www.movable-type.co.uk/scripts/latlong.html
            calcAngle = function (p1, p2, direction) {
                var lat1 = p1.lat / 180 * Math.PI;
                var lat2 = p2.lat / 180 * Math.PI;
                var lng1 = p1.lng / 180 * Math.PI;
                var lng2 = p2.lng / 180 * Math.PI;
                var y = Math.sin(lng2-lng1) * Math.cos(lat2);
                var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lng2-lng1);
                if (direction === "inbound") {
                    var brng = (Math.atan2(y, x) * 180 / Math.PI + 180).toFixed(0);
                } else {
                    var brng = (Math.atan2(y, x) * 180 / Math.PI + 360).toFixed(0);
                }
                return (brng % 360);
            }
            
            var angleIn = calcAngle (mouseCoords, lastCircleCoords, "inbound");
            var angleOut = calcAngle (lastCircleCoords, mouseCoords, "outbound");
            var totalRound = this._getDistance (total);
            var differenceRound = this._getDistance (difference);
            var textCurrent = '';
            if (differenceRound.value > 0 ) {
                if (this.options.showBearings === true) {
                     textCurrent = this.options.bearingTextIn + ': ' + angleIn + '°<br>'+this.options.bearingTextOut+':---°';
                }
                textCurrent += '<div class="polygon-measure-tooltip-difference">+' + differenceRound.value + '&nbsp;' +  differenceRound.unit + '</div>';
            }
            textCurrent += '<div class="polygon-measure-tooltip-total">' + totalRound.value + '&nbsp;' +  totalRound.unit + '</div>';
            textCurrent += '<div class="polygon-measure-tooltip-area">' + area + '&nbsp;' +  '平方米' + '</div>';
            currentTooltip._icon.innerHTML = textCurrent;
            if ((this.options.showBearings === true) && (prevTooltip)) {
                textPrev = prevTooltip._icon.innerHTML;
                var regExp = new RegExp(this.options.bearingTextOut + '.*\°');
                textReplace = textPrev.replace(regExp, this.options.bearingTextOut + ': ' + angleOut + "°");
                prevTooltip._icon.innerHTML = textReplace;
            }
        },

        _drawArrow: function (arcLine) {
            var P48 = arcLine[48];
            var P49 = arcLine[49];
            var diffLng4849 = P49[1] - P48[1];
            var diffLat4849 = P49[0] - P48[0];
            var center = [P48[0] + diffLat4849/2, P48[1] + diffLng4849/2];  // center of Great-circle distance, NOT of the arc on a Mercator map! reason: a) to complicated b) map not always Mercator c) good optical feature to see where real center of distance is not the "virtual" warped arc center due to Mercator projection
                // angle just an aprroximation, which could be somewhat off if Line runs near high latitudes. Use of *geographical coords* for line segment [48] to [49] is best method. Use of *Pixel coords* for just one arc segement [48] to [49] could create for short lines unexact rotation angles, and the use Use of Pixel coords between endpoints [0] to [98] results in even more rotation difference for high latitudes as with geogrpaphical coords-method 
            var cssAngle = -Math.atan2(diffLat4849, diffLng4849)*57.29578   // convert radiant to degree as needed for use as CSS value; cssAngle is opposite to mathematical angle.                 
            iconArrow = L.divIcon ({ 
                className: "",  // to avoid getting a default class with paddings and borders assigned by Leaflet
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                    // html : "<img src='iconArrow.png' style='background:green; height:100%; vertical-align:top; transform:rotate("+ cssAngle +"deg)'>"  <<=== alternative method by the use of an image instead of a Unicode symbol.
                html : "<div style = 'font-size: 16px; line-height: 16px; vertical-align:top; transform: rotate("+ cssAngle +"deg)'>&#x27a4;</div>"   // best results if iconSize = font-size = line-height and iconAnchor font-size/2 .both values needed to position symbol in center of L.divIcon for all font-sizes. 
            });
            newArrowMarker = L.marker (center, {icon: iconArrow}).addTo(this._layerPaint);
            newArrowMarker.bindTooltip (this.options.tooltipTextAdd, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
            newArrowMarker.on ('click', this._clickedArrow, this);
            return newArrowMarker;
            
        },
        
        /**
         * Event to fire on mouse move
         * @param {Object} e Event
         * @private
         */
        _mouseMove: function (e) {
            var mouseCoords = e.latlng;
            this._map.on ('click', this._mouseClick, this);  // necassary for _dragCircle. If switched on already within _dragCircle an unwanted click is fired at the end of the drag.
            if(!mouseCoords || !this._currentLine) {
                return;
            }
            var firstCircleCoords = this._currentLine.circleCoords.first();
            var lastCircleCoords = this._currentLine.circleCoords.last();  
            if (lastCircleCoords.equals(mouseCoords)) {
                return;
            }
            if (this._currentLine.circleCoords.length >= 3) {
                let lastToCurrentArc = this._polylineArc (lastCircleCoords, mouseCoords);
                let currentTofirstArc = this._polylineArc (mouseCoords, firstCircleCoords);
                this._rubberlinePath.setLatLngs(lastToCurrentArc.concat(currentTofirstArc));
            } else if (this._currentLine.circleCoords.length >= 2) {
                let firstToLastArc = this._polylineArc (firstCircleCoords, lastCircleCoords);
                let lastToCurrentArc = this._polylineArc (lastCircleCoords, mouseCoords);
                let currentToFirstArc = this._polylineArc (mouseCoords, firstCircleCoords);
                this._rubberlinePath.setLatLngs(firstToLastArc.concat(lastToCurrentArc, currentToFirstArc));
            } else {
                this._rubberlinePath.setLatLngs (this._polylineArc (lastCircleCoords, mouseCoords));
            }

            if (this._currentLine.circleCoords.length >= 2) {
                var area;
                if (this._currentLine.circleCoords.length === 2) {
                    area = this._getArea(this._rubberlinePath.getLatLngs());
                } else {
                    let arc = this._polylineArc (lastCircleCoords, mouseCoords);
                    let arcLatLngs = arc.map(item => L.latLng(item[0], item[1]));
                    area = this._getArea(this._currentLine.polygonPath.getLatLngs()[0].concat(arcLatLngs));
                }
                var currentTooltip = this._currentLine.tooltips.last();
                var prevTooltip = this._currentLine.tooltips.slice(-2,-1)[0];
                currentTooltip.setLatLng (mouseCoords);
                var distanceSegment = mouseCoords.distanceTo (lastCircleCoords);
                this._updateTooltip (currentTooltip, prevTooltip, this._currentLine.distance + distanceSegment, distanceSegment, lastCircleCoords, mouseCoords, area);
            } else {
                if (this.options.showDistance) {
                    let currentTooltip = this._currentLine.tooltips.last();
                    let prevTooltip = this._currentLine.tooltips.slice(-2,-1)[0];
                    currentTooltip.setLatLng (mouseCoords);
                    let distanceSegment = mouseCoords.distanceTo (lastCircleCoords);
                    this._updateTooltip (currentTooltip, prevTooltip, this._currentLine.distance + distanceSegment, distanceSegment, lastCircleCoords, mouseCoords);
                }
            }
        },
        
        _startLine: function (clickCoords) {
            var icon = L.divIcon({
                className: 'polygon-measure-tooltip',
                iconAnchor: [-4, -4]
            });
            var first = function() {
                return this.slice(0)[0];
            };
            var last = function() {
                return this.slice(-1)[0];
            };
            this._rubberlinePath = L.polyline ([], {
                // Style of temporary, dashed line while moving the mouse
                color: this.options.tempLine.color,
                weight: this.options.tempLine.weight,
                interactive: false,
                dashArray: '8,8'
            }).addTo(this._layerPaint).bringToBack();

            var polygonState = this;   // use "polygonState" instead of "this" to allow measuring on 2 different maps the same time 
            
            this._currentLine = {
                id: 0,
                circleCoords: [],
                circleMarkers: [],
                arrowMarkers: [],
                tooltips: [],
                areaTooltip: null,
                distance: 0,
                areas: 0,
                
                polygonPath: L.polygon([], {
                    // Style of fixed, polygon after mouse is clicked
                    color: this.options.polygon.color,
                    weight: this.options.polygon.weight,
                    stroke: this.options.polygon.stroke,
                    interactive: false
                }).addTo(this._layerPaint).bringToBack(),
                
                handleMarkers: function (latlng) {
                    // update style on previous marker
                    var lastCircleMarker = this.circleMarkers.last();
                    if (lastCircleMarker) {
                        lastCircleMarker.off ('click', polygonState._finishPolygonPath, polygonState);
                        if (this.circleMarkers.length === 1) {
                            lastCircleMarker.setStyle (polygonState.options.startCircle);
                            lastCircleMarker.unbindTooltip ();
                            lastCircleMarker.bindTooltip (polygonState.options.tooltipTextDraganddelete + polygonState.options.tooltipTextResume, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
                        } else {
                            lastCircleMarker.setStyle (polygonState.options.intermedCircle);
                        }
                    }
                    var newCircleMarker = new L.CircleMarker (latlng, polygonState.options.currentCircle).addTo(polygonState._layerPaint);
                    newCircleMarker.bindTooltip (polygonState.options.tooltipTextDraganddelete, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
                    newCircleMarker.cntLine = polygonState._currentLine.id;
                    newCircleMarker.cntCircle = polygonState._cntCircle;
                    polygonState._cntCircle++;
                    newCircleMarker.on ('mousedown', polygonState._dragCircle, polygonState);
                    newCircleMarker.on ('click', polygonState._finishPolygonPath, polygonState);
                    this.circleMarkers.push (newCircleMarker);
                },
                
                getNewToolTip: function(latlng) {
                    return L.marker (latlng, {
                        icon: icon,
                        interactive: false
                    });
                },
                
                addPoint: function (mouseCoords) {
                    var arc, firstCircleCoords;
                    var lastCircleCoords = this.circleCoords.last();
                    if (lastCircleCoords && lastCircleCoords.equals (mouseCoords)) {    // don't add a new circle if the click was onto the last circle
                        return;
                    }
                    this.circleCoords.push (mouseCoords);
                    firstCircleCoords = this.circleCoords.first();
                    
                    if (this.circleCoords.length > 1) {
                        arc = polygonState._polylineArc (lastCircleCoords, mouseCoords);
                        if (this.circleCoords.length > 2) {
                            arc.shift();  // remove first coordinate og the arc, cause it is identical with last coordinate of previous arc
                        }

                        if (polygonState.options.showArrow) {
                            let arrowMarker = polygonState._drawArrow (arc);
                            arrowMarker.cntLine = polygonState._currentLine.id;
                            arrowMarker.cntArrow = polygonState._cntCircle - 1;
                            polygonState._currentLine.arrowMarkers.push (arrowMarker);
                        }

                        // update rubberline
                        if (this.circleCoords.length === 2) {
                            let firstToCurrentArc = polygonState._polylineArc (firstCircleCoords, mouseCoords);
                            polygonState._rubberlinePath.setLatLngs(firstToCurrentArc);
                        } else {
                            polygonState._rubberlinePath.setLatLngs([]);
                        } 

                        var distanceSegment = lastCircleCoords.distanceTo (mouseCoords);
                        this.distance += distanceSegment;
                        if (polygonState.options.showDistance) {
                            var currentTooltip = polygonState._currentLine.tooltips.last();
                            var prevTooltip = polygonState._currentLine.tooltips.slice(-2,-1)[0];
                            polygonState._updateTooltip (currentTooltip, prevTooltip, this.distance, distanceSegment, lastCircleCoords, mouseCoords);
                        }
                    }
                    
                    // update polygon
                    if (this.circleCoords.length > 2) {
                        if (this.circleCoords.length === 3) {
                            let firstToLastArc = polygonState._polylineArc (firstCircleCoords, lastCircleCoords);
                            this.polygonPath.setLatLngs(firstToLastArc.concat(arc));
                        } else {
                            this.polygonPath.setLatLngs (this.polygonPath.getLatLngs()[0].concat(arc));
                        }

                        let area = polygonState._getArea(this.polygonPath.getLatLngs()[0]);
                        let center = this.polygonPath.getCenter();
                        // let currentTooltip = polygonState._currentLine.tooltips.last();
                        // let prevTooltip = polygonState._currentLine.tooltips.slice(-2,-1)[0];
                        // polygonState._updateTooltip (currentTooltip, prevTooltip, this.distance, distanceSegment, lastCircleCoords, mouseCoords, area);
                        this.areaTooltip._icon.innerHTML = area;
                        this.areaTooltip.setLatLng(center);
                        // following lines needed especially for Mobile Browsers where we just use mouseclicks. No mousemoves, no tempLine.
                        // var arrowMarker = polygonState._drawArrow (arc);
                        // arrowMarker.cntLine = polygonState._currentLine.id;
                        // arrowMarker.cntArrow = polygonState._cntCircle - 1;
                        // polygonState._currentLine.arrowMarkers.push (arrowMarker);
                        // distanceSegment = lastCircleCoords.distanceTo (mouseCoords);
                        // this.distance += distanceSegment;
                        // var currentTooltip = polygonState._currentLine.tooltips.last();
                        // var prevTooltip = polygonState._currentLine.tooltips.slice(-1,-2)[0];
                        // polygonState._updateTooltip (currentTooltip, prevTooltip, this.distance, distanceSegment, lastCircleCoords, mouseCoords);
                    }
                    // update last tooltip with final value
                    if (polygonState.options.showDistance && currentTooltip) {
                        currentTooltip.setLatLng (mouseCoords);
                    }

                    // add new tooltip to update on mousemove
                    if (polygonState.options.showDistance) {
                        var tooltipNew = this.getNewToolTip(mouseCoords);
                        tooltipNew.addTo(polygonState._layerPaint);
                        this.tooltips.push (tooltipNew);
                    }

                    this.handleMarkers (mouseCoords);
                },
                
                finalize: function() {
                    // remove tooltip created by last click
                    polygonState._layerPaint.removeLayer (this.tooltips.last());
                    this.tooltips.pop();
                    // remove temporary rubberline
                    polygonState._layerPaint.removeLayer (polygonState._rubberlinePath);
                    if (this.circleCoords.length > 1) {
                        if (polygonState.options.showDistance) this.tooltips.last()._icon.classList.add('polygon-measure-tooltip-end'); // add Class e.g. another background-color to the Previous Tooltip (which is the last fixed tooltip, cause the moving tooltip is being deleted later)
                        var lastCircleMarker = this.circleMarkers.last()
                        lastCircleMarker.setStyle (polygonState.options.endCircle);
                        // use Leaflet's own tooltip method to shwo a popuo tooltip if user hovers the last circle of a polygon
                        lastCircleMarker.unbindTooltip ();
                        lastCircleMarker.bindTooltip (polygonState.options.tooltipTextDraganddelete + polygonState.options.tooltipTextResume, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
                        lastCircleMarker.off ('click', polygonState._finishPolygonPath, polygonState);
                        lastCircleMarker.on ('click', polygonState._resumePolylinePath, polygonState);
                        polygonState._arrPolygons.push(this);
                    } else {
                        // if there is only one point, just clean it up
                        polygonState._layerPaint.removeLayer (this.circleMarkers.last());
                        polygonState._layerPaint.removeLayer (this.tooltips.last());
                    }
                    polygonState._resetPathVariables();
                }
            };
            
            var firstTooltip = L.marker (clickCoords, {
                icon: icon,
                interactive: false
            })
            firstTooltip.addTo(this._layerPaint);
            if (this.options.showDistance) {
                let text = '';
                if (this.options.showBearings === true) {
                    text = this.options.bearingTextIn+':---°<br>'+this.options.bearingTextOut+':---°';
                }   
                text = text + '<div class="polygon-measure-tooltip-difference">+' + '0</div>';
                text = text + '<div class="polygon-measure-tooltip-total">' + '0</div>';
                firstTooltip._icon.innerHTML = text;
            }
            this._currentLine.tooltips.push (firstTooltip);

            var areaTooltip = L.marker (clickCoords, {
                icon: icon,
                interactive: false
            })
            areaTooltip.addTo(this._layerPaint);
            this._currentLine.areaTooltip = areaTooltip;

            this._currentLine.circleCoords.first = first;
            this._currentLine.tooltips.first = first;
            this._currentLine.circleMarkers.first = first;
            this._currentLine.circleCoords.last = last;
            this._currentLine.tooltips.last = last;
            this._currentLine.circleMarkers.last = last;
            this._currentLine.id = this._arrPolygons.length;
        },

        /**
         * Event to fire on mouse click
         * @param {Object} e Event
         * @private
         */
        _mouseClick: function (e) {
            // skip if there are no coords provided by the event, or this event's screen coordinates match those of finishing CircleMarker for the line we just completed
            if (!e.latlng || (this._finishCircleScreencoords && this._finishCircleScreencoords.equals(e.containerPoint))) {
                return;
            }
            if (!this._currentLine && !this._mapdragging) {
                this._startLine (e.latlng);
            }
            // just create a point if the map isn't dragged during the mouseclick.
            if (!this._mapdragging) {
                this._currentLine.addPoint (e.latlng);
            } else {
                this._mapdragging = false; // this manual setting to "false" needed, instead of a "moveend"-Event. Cause the mouseclick of a "moveend"-event immediately would create a point too the same time.
            }            
        },

        /**
         * Finish the drawing of the path by clicking onto the last circle or pressing ESC-Key
         * @private
         */
        _finishPolygonPath: function (e) {
            // 如果点数不够三个，无法停止
            if (this._currentLine.circleCoords.length < 3) {
                return;
            }
            this._currentLine.finalize();
            if (e) {
                this._finishCircleScreencoords = e.containerPoint;
            }
        },
        
        /**
         * Resume the drawing of a polygon by pressing CTRL-Key and clicking onto the last circle
         * @private
         */
        _resumePolylinePath: function (e) {
            if (e.originalEvent.ctrlKey === true) {    // just resume if user pressed the CTRL-Key while clicking onto the last circle
                this._currentLine = this._arrPolygons [e.target.cntLine];
                this._rubberlinePath = L.polygon ([], {
                    // Style of temporary, rubberline while moving the mouse
                    color: this.options.tempLine.color,
                    weight: this.options.tempLine.weight,
                    interactive: false,
                    dashArray: '8,8'
                }).addTo(this._layerPaint).bringToBack();
                this._currentLine.tooltips.last()._icon.classList.remove ('polygon-measure-tooltip-end');   // remove extra CSS-class of previous, last tooltip
                var tooltipNew = this._currentLine.getNewToolTip (e.latlng);
                tooltipNew.addTo (this._layerPaint);
                this._currentLine.tooltips.push(tooltipNew);
                this._currentLine.circleMarkers.last().unbindTooltip();   // remove popup-tooltip of previous, last circleMarker
                this._currentLine.circleMarkers.last().bindTooltip (this.options.tooltipTextDraganddelete, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
                this._currentLine.circleMarkers.last().setStyle (this.options.currentCircle);
                this._cntCircle = this._currentLine.circleCoords.length;
            }
        },

        /**
         * After completing a path, reset all the values to prepare in creating the next polygon measurement
         * @private
         */
        _resetPathVariables: function() {
            this._cntCircle = 0;
            this._currentLine = null;
        },
      
        _clickedArrow: function(e) {
            var arrowMarker;
            if (e.originalEvent.ctrlKey) {           
                var lineNr = e.target.cntLine;
                var arrowNr = e.target.cntArrow;
                this._arrPolygons[lineNr].arrowMarkers [arrowNr].removeFrom (this._layerPaint);
                var newCircleMarker = new L.CircleMarker (e.latlng, this.options.intermedCircle).addTo(this._layerPaint);
                newCircleMarker.cntLine = lineNr;
                newCircleMarker.on ('mousedown', this._dragCircle, this);
                newCircleMarker.bindTooltip (this.options.tooltipTextDraganddelete, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
                this._arrPolygons[lineNr].circleMarkers.splice (arrowNr+1, 0, newCircleMarker);
                this._arrPolygons[lineNr].circleMarkers.map (function (item, index) {
                    item.cntCircle = index;
                });
                this._arrPolygons[lineNr].circleCoords.splice (arrowNr+1, 0, e.latlng);
                lineCoords = this._arrPolygons[lineNr].polygonPath.getLatLngs()[0]; // get Coords of each Point of the current Polyline 
                var arc1 = this._polylineArc (this._arrPolygons[lineNr].circleCoords[arrowNr], e.latlng);
                arc1.pop(); 
                var arc2 = this._polylineArc (e.latlng, this._arrPolygons[lineNr].circleCoords[arrowNr+2]);
                Array.prototype.splice.apply (lineCoords, [(arrowNr)*(arcpoints-1), arcpoints].concat (arc1, arc2));
                this._arrPolygons[lineNr].polygonPath.setLatLngs (lineCoords);
                arrowMarker = this._drawArrow (arc1);
                this._arrPolygons[lineNr].arrowMarkers[arrowNr] = arrowMarker;
                arrowMarker = this._drawArrow (arc2);
                this._arrPolygons[lineNr].arrowMarkers.splice(arrowNr+1,0,arrowMarker);
                this._arrPolygons[lineNr].arrowMarkers.map (function (item, index) {
                    item.cntLine = lineNr;
                    item.cntArrow = index;
                });
                tooltipNew = L.marker (e.latlng, {
                    icon: L.divIcon({
                        className: 'polygon-measure-tooltip',
                        iconAnchor: [-4, -4]
                    }),
                    interactive: false
                });
                tooltipNew.addTo(this._layerPaint);
                this._arrPolygons[lineNr].tooltips.splice (arrowNr+1, 0, tooltipNew);
                var totalDistance = 0;
                this._arrPolygons[lineNr].tooltips.map (function (item, index) {
                    if (index >= 1) {
                        var distance = this._arrPolygons[lineNr].circleCoords[index-1].distanceTo (this._arrPolygons[lineNr].circleCoords[index]);
                        var lastCircleCoords = this._arrPolygons[lineNr].circleCoords[index - 1];
                        var mouseCoords = this._arrPolygons[lineNr].circleCoords[index];
                        totalDistance += distance;
                        var prevTooltip = this._arrPolygons[lineNr].tooltips[index-1]
                        this._updateTooltip (item, prevTooltip, totalDistance, distance, lastCircleCoords, mouseCoords);
                    }
                }.bind(this));
            }
        },
      
        _dragCircleMouseup: function () {
            // bind new popup-tooltip to the last CircleMArker if dragging finished
            if ((circleNr === 0) || (circleNr === this._arrPolygons[lineNr].circleCoords.length-1)) {
               this._e1.target.bindTooltip (this.options.tooltipTextDraganddelete + this.options.tooltipTextResume, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
            } else {
               this._e1.target.bindTooltip (this.options.tooltipTextDraganddelete, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
            }
            this._resetPathVariables();
            this._map.off ('mousemove', this._dragCircleMousemove, this);
            this._map.dragging.enable();
            this._map.on ('mousemove', this._mouseMove, this);
            this._map.off ('mouseup', this._dragCircleMouseup, this);
        },
      
        _dragCircleMousemove: function (e2) {
            var arrowMarker;
            var mouseNewLat = e2.latlng.lat;
            var mouseNewLng = e2.latlng.lng;
            var latDifference = mouseNewLat - this._mouseStartingLat;
            var lngDifference = mouseNewLng - this._mouseStartingLng;
            var currentCircleCoords = L.latLng (this._circleStartingLat + latDifference, this._circleStartingLng + lngDifference);
            lineNr = this._e1.target.cntLine;
            circleNr = this._e1.target.cntCircle;
            this._e1.target.setLatLng (currentCircleCoords);
            this._e1.target.unbindTooltip();    // unbind popup-tooltip cause otherwise it would be annoying during dragging, or popup instantly again if it's just closed
            this._arrPolygons[lineNr].circleCoords[circleNr] = currentCircleCoords;
            lineCoords = this._arrPolygons[lineNr].polygonPath.getLatLngs()[0]; // get Coords of each Point of the current Polyline
            if (circleNr >= 1) {   // redraw previous arc just if circle is not starting circle of polygon
                newLineSegment1 = this._polylineArc(this._arrPolygons[lineNr].circleCoords[circleNr-1], currentCircleCoords);
                // the next line's syntax has to be used since Internet Explorer doesn't know new spread operator (...) for inserting the individual elements of an array as 3rd argument of the splice method; Otherwise we could write: lineCoords.splice (circleNr*(arcpoints-1), arcpoints, ...newLineSegment1);
                Array.prototype.splice.apply (lineCoords, [(circleNr-1)*(arcpoints-1), arcpoints].concat (newLineSegment1));
                if (this.options.showArrow) {
                    arrowMarker = this._drawArrow (newLineSegment1);
                    arrowMarker.cntLine = lineNr;
                    arrowMarker.cntArrow = circleNr-1;
                    this._arrPolygons[lineNr].arrowMarkers [circleNr-1].removeFrom (this._layerPaint);
                    this._arrPolygons[lineNr].arrowMarkers [circleNr-1] = arrowMarker;
                }
            }
            if (circleNr < this._arrPolygons[lineNr].circleCoords.length-1) {   // redraw following arc just if circle is not end circle of polygon
                newLineSegment2 = this._polylineArc (currentCircleCoords, this._arrPolygons[lineNr].circleCoords[circleNr+1]);
                Array.prototype.splice.apply (lineCoords, [circleNr*(arcpoints-1), arcpoints].concat (newLineSegment2));
                if (this.options.showArrow) {
                    arrowMarker = this._drawArrow (newLineSegment2);
                    arrowMarker.cntLine = lineNr;
                    arrowMarker.cntArrow = circleNr;
                    this._arrPolygons[lineNr].arrowMarkers [circleNr].removeFrom (this._layerPaint);
                    this._arrPolygons[lineNr].arrowMarkers [circleNr] = arrowMarker;
                }
            }
            this._arrPolygons[lineNr].polygonPath.setLatLngs (lineCoords);
            if (circleNr >= 0) {     // just update tooltip position if moved circle is 2nd, 3rd, 4th etc. circle of a polygon
                if(this.options.showDistance) this._arrPolygons[lineNr].tooltips[circleNr].setLatLng (currentCircleCoords);
                this._arrPolygons[lineNr].areaTooltip.setLatLng(currentCircleCoords);
            } 
            
            if (this.options.showDistance) {
                var totalDistance = 0;
                // update tooltip texts of each tooltip
                this._arrPolygons[lineNr].tooltips.map (function (item, index) {
                    if (index >= 1) {
                        var distance = this._arrPolygons[lineNr].circleCoords[index-1].distanceTo (this._arrPolygons[lineNr].circleCoords[index]);
                        var lastCircleCoords = this._arrPolygons[lineNr].circleCoords[index - 1];
                        var mouseCoords = this._arrPolygons[lineNr].circleCoords[index];
                        totalDistance += distance;
                        var prevTooltip = this._arrPolygons[lineNr].tooltips[index-1]
                        this._updateTooltip (item, prevTooltip, totalDistance, distance, lastCircleCoords, mouseCoords);
                    }
                }.bind(this));
            }
            {
                let polygon = this._arrPolygons[lineNr];
                let area = this._getArea(polygon.polygonPath.getLatLngs()[0]);
                let center = polygon.polygonPath.getCenter();
                polygon.areaTooltip._icon.innerHTML = area;
                polygon.areaTooltip.setLatLng(center);
            }
            this._map.on ('mouseup', this._dragCircleMouseup, this);
        },
      
        _resumeFirstpointMousemove: function (e) {
            this._map.on ('click', this._resumeFirstpointClick, this);  // necassary for _dragCircle. If switched on already within _dragCircle an unwanted click is fired at the end of the drag.
            var mouseCoords = e.latlng;
            this._rubberlinePath2.setLatLngs (this._polylineArc (mouseCoords, currentCircleCoords));
            tooltipNew.setLatLng (mouseCoords);
            var totalDistance = 0;
            var distance = mouseCoords .distanceTo (this._arrPolygons[lineNr].circleCoords[0]);
            var lastCircleCoords = mouseCoords;
            var currentCoords = this._arrPolygons[lineNr].circleCoords[0];
            totalDistance += distance;
            var prevTooltip = tooltipNew;
            var currentTooltip = this._arrPolygons[lineNr].tooltips[0]
            this._updateTooltip (currentTooltip, prevTooltip, totalDistance, distance, lastCircleCoords, currentCoords);
            this._arrPolygons[lineNr].tooltips.map (function (item, index) {
                if (index >= 1) {
                    var distance = this._arrPolygons[lineNr].circleCoords[index-1].distanceTo (this._arrPolygons[lineNr].circleCoords[index]);
                    var lastCircleCoords = this._arrPolygons[lineNr].circleCoords[index - 1];
                    var mouseCoords = this._arrPolygons[lineNr].circleCoords[index];
                    totalDistance += distance;
                    var prevTooltip = this._arrPolygons[lineNr].tooltips[index-1]
                    this._updateTooltip (item, prevTooltip, totalDistance, distance, lastCircleCoords, mouseCoords);
                }
            }.bind (this));
        },
      
        _resumeFirstpointClick: function (e) {
            var arrowMarker;
            this._resumeFirstpointFlag = false;
            this._map.off ('mousemove', this._resumeFirstpointMousemove, this);
            this._map.off ('click', this._resumeFirstpointClick, this); 
            this._layerPaint.removeLayer (this._rubberlinePath2);
            this._arrPolygons[lineNr].circleMarkers [0].setStyle (this.options.intermedCircle);
            this._arrPolygons[lineNr].circleMarkers [0].unbindTooltip();
            this._arrPolygons[lineNr].circleMarkers [0].bindTooltip (this.options.tooltipTextDraganddelete, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
            var newCircleMarker = new L.CircleMarker (e.latlng, this.options.startCircle).addTo(this._layerPaint);
            newCircleMarker.cntLine = lineNr;
            newCircleMarker.cntCircle = 0;
            newCircleMarker.on ('mousedown', this._dragCircle, this);
            newCircleMarker.bindTooltip (this.options.tooltipTextDraganddelete + this.options.tooltipTextResume, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
            this._arrPolygons[lineNr].circleMarkers.unshift(newCircleMarker);
            this._arrPolygons[lineNr].circleMarkers.map (function (item, index) {
                item.cntCircle = index;
            });
            this._arrPolygons[lineNr].circleCoords.unshift(e.latlng);
            var arc = this._polylineArc (e.latlng, currentCircleCoords);
            arrowMarker = this._drawArrow (arc);
            this._arrPolygons[lineNr].arrowMarkers.unshift(arrowMarker);
            this._arrPolygons[lineNr].arrowMarkers.map (function (item, index) {
                item.cntLine = lineNr;
                item.cntArrow = index;
            });
            arc.pop();  // remove last coordinate of arc, cause it's already part of the next arc.          
            this._arrPolygons[lineNr].polygonPath.setLatLngs (arc.concat(this._arrPolygons[lineNr].polygonPath.getLatLngs()[0]));
            if(this.options.showDistance) this._arrPolygons[lineNr].tooltips.unshift(tooltipNew);
            this._map.on ('mousemove', this._mouseMove, this);
        },
      
      
        // not just used for dragging Cirles but also for deleting circles and resuming line at its starting point.
        _dragCircle: function (e1) {
            if (e1.originalEvent.ctrlKey) {   // if user wants to resume drawing a line
                this._map.off ('click', this._mouseClick, this); // to avoid unwanted creation of a new line if CTRL-clicked onto a point 
                // if user wants resume the line at its starting point
                if (e1.target.cntCircle === 0) { 
                    this._resumeFirstpointFlag = true;
                    lineNr = e1.target.cntLine;
                    circleNr = e1.target.cntCircle;
                    currentCircleCoords = e1.latlng;
                    this._arrPolygons[lineNr].circleMarkers [0].setStyle (this.options.currentCircle);
                    this._rubberlinePath2 = L.polygon ([], {
                        // Style of temporary, rubberline while moving the mouse
                        color: this.options.tempLine.color,
                        weight: this.options.tempLine.weight,
                        interactive: false,
                        dashArray: '8,8'
                    }).addTo(this._layerPaint).bringToBack();
                    tooltipNew = L.marker (currentCircleCoords, {
                        icon: L.divIcon({
                            className: 'polygon-measure-tooltip',
                            iconAnchor: [-4, -4]
                        }),
                        interactive: false
                    });
                    tooltipNew.addTo(this._layerPaint);
                    text='';
                    if (this.options.showBearings === true) {
                        text = text + this.options.bearingTextIn+':---°<br>'+this.options.bearingTextOut+':---°';
                    }    
                    text = text + '<div class="polygon-measure-tooltip-difference">+' + '0</div>';
                    text = text + '<div class="polygon-measure-tooltip-total">' + '0</div>';   
                    tooltipNew._icon.innerHTML = text;                     
                    this._map.off ('mousemove', this._mouseMove, this);
                    this._map.on ('mousemove', this._resumeFirstpointMousemove, this);
                }   
                return;
            }
            
            // if user wants to delete a circle
            if (e1.originalEvent.shiftKey) {    // it's not possible to use "ALT-Key" instead, cause this won't work in some Linux distributions (there it's the default hotkey for moving windows) 
                lineNr = e1.target.cntLine;
                circleNr = e1.target.cntCircle;
                this._arrPolygons[lineNr].circleCoords.splice(circleNr,1);
                this._arrPolygons[lineNr].circleMarkers [circleNr].removeFrom (this._layerPaint);
                this._arrPolygons[lineNr].circleMarkers.splice(circleNr,1);
                this._arrPolygons[lineNr].circleMarkers.map (function (item, index) {
                    item.cntCircle = index;
                });
                lineCoords = this._arrPolygons[lineNr].polygonPath.getLatLngs()[0];
                this._arrPolygons[lineNr].tooltips [circleNr].removeFrom (this._layerPaint);
                this._arrPolygons[lineNr].tooltips.splice(circleNr,1);
                // if first Circle is being removed
                if (circleNr === 0) {     
                    this._arrPolygons[lineNr].circleMarkers [0].setStyle (this.options.startCircle);
                    lineCoords.splice (0, arcpoints-1)
                    this._arrPolygons[lineNr].circleMarkers [0].bindTooltip (this.options.tooltipTextDraganddelete + this.options.tooltipTextResume, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
                    this._arrPolygons[lineNr].arrowMarkers [circleNr].removeFrom (this._layerPaint);
                    this._arrPolygons[lineNr].arrowMarkers.splice(0,1);
                    text='';
                    if (this.options.showBearings === true) {
                        text = this.options.bearingTextIn+':---°<br>'+this.options.bearingTextOut+':---°';
                    }   
                    text = text + '<div class="polygon-measure-tooltip-difference">+' + '0</div>';
                    text = text + '<div class="polygon-measure-tooltip-total">' + '0</div>';
                    this._arrPolygons[lineNr].tooltips [0]._icon.innerHTML = text;
                // if last Circle is being removed
                } else if (circleNr === this._arrPolygons[lineNr].circleCoords.length) {
                    this._arrPolygons[lineNr].circleMarkers [circleNr-1].on ('click', this._resumePolylinePath, this);
                    this._arrPolygons[lineNr].circleMarkers [circleNr-1].bindTooltip (this.options.tooltipTextDraganddelete + this.options.tooltipTextResume, {direction:'top', opacity:0.7, className:'polygon-measure-popupTooltip'});
                    this._arrPolygons[lineNr].circleMarkers.slice(-1)[0].setStyle (this.options.endCircle);  // get last element of the array
                    this._arrPolygons[lineNr].tooltips.slice(-1)[0]._icon.classList.add('polygon-measure-tooltip-end');
                    lineCoords.splice (-(arcpoints-1), arcpoints-1)
                    this._arrPolygons[lineNr].arrowMarkers [circleNr-1].removeFrom (this._layerPaint);
                    this._arrPolygons[lineNr].arrowMarkers.splice(-1,1);
                // if intermediate Circle is being removed
                } else {
                    newLineSegment = this._polylineArc (this._arrPolygons[lineNr].circleCoords[circleNr-1], this._arrPolygons[lineNr].circleCoords[circleNr]);
                    Array.prototype.splice.apply (lineCoords, [(circleNr-1)*(arcpoints-1), (2*arcpoints-1)].concat (newLineSegment));
                    this._arrPolygons[lineNr].arrowMarkers [circleNr-1].removeFrom (this._layerPaint);
                    this._arrPolygons[lineNr].arrowMarkers [circleNr].removeFrom (this._layerPaint);
                    var arrowMarker = this._drawArrow (newLineSegment);
                    this._arrPolygons[lineNr].arrowMarkers.splice(circleNr-1,2,arrowMarker);
                } 
                this._arrPolygons[lineNr].polygonPath.setLatLngs (lineCoords);
                this._arrPolygons[lineNr].arrowMarkers.map (function (item, index) {
                    item.cntLine = lineNr;
                    item.cntArrow = index;
                });
                var totalDistance = 0;
                this._arrPolygons[lineNr].tooltips.map (function (item, index) {
                    if (index >= 1) {
                        var distance = this._arrPolygons[lineNr].circleCoords[index-1].distanceTo (this._arrPolygons[lineNr].circleCoords[index]);
                        var lastCircleCoords = this._arrPolygons[lineNr].circleCoords[index - 1];
                        var mouseCoords = this._arrPolygons[lineNr].circleCoords[index];
                        totalDistance += distance;
                        var prevTooltip = this._arrPolygons[lineNr].tooltips[index-1]
                        this._updateTooltip (item, prevTooltip, totalDistance, distance, lastCircleCoords, mouseCoords);
                    }
                }.bind (this));
                return;
            }

            this._e1 = e1;
            if ((this._measuring) && (this._cntCircle === 0)) {    // just execute drag-function if Measuring tool is active but no line is being drawn at the moment.
                this._map.dragging.disable();  // turn of moving of the map during drag of a circle
                this._map.off ('mousemove', this._mouseMove, this);
                this._map.off ('click', this._mouseClick, this);
                this._mouseStartingLat = e1.latlng.lat;
                this._mouseStartingLng = e1.latlng.lng;
                this._circleStartingLat = e1.target._latlng.lat;
                this._circleStartingLng = e1.target._latlng.lng;
                this._map.on ('mousemove', this._dragCircleMousemove, this);
            }
        }
    });

//======================================================================================

    L.Map.mergeOptions({
        polygonMeasureControl: false
    });

    L.Map.addInitHook(function () {
        if (this.options.polygonMeasureControl) {
            this.PGControl = new L.Control.PolygonMeasure();
            this.addControl(this.PGControl);
        }
    });

    L.control.polygonMeasure = function (options) {
        return new L.Control.PolygonMeasure (options);
    };

    return L.Control.PolygonMeasure;
    // to allow
    // import PolygonMeasure from 'leaflet.polygonmeasure';
    // const measureControl = new PolygonMeasure();
    // together with
    // import 'leaflet.polygonmeasure';
    // const measureControl = new L.Control.PolygonMeasure();
    
}));
