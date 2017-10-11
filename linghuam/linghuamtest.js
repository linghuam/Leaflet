L.FullCanvasTileLayer = L.Renderer.extend({

    // @section
    // @aka GridLayer options
    options: {
        // @option tileSize: Number|Point = 256
        // Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
        tileSize: 256,

        // @option opacity: Number = 1.0
        // Opacity of the tiles. Can be used in the `createTile()` function.
        opacity: 1,

        // @option updateWhenIdle: Boolean = (depends)
        // Load new tiles only when panning ends. 
        // `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
        // `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
        // [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
        updateWhenIdle: L.Browser.mobile,

        // @option updateWhenZooming: Boolean = true
        // By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
        updateWhenZooming: true,

        // @option updateInterval: Number = 200
        // Tiles will not update more than once every `updateInterval` milliseconds when panning.
        updateInterval: 200,

        // @option zIndex: Number = 1
        // The explicit zIndex of the tile layer.
        zIndex: 1,

        // @option bounds: LatLngBounds = undefined
        // If set, tiles will only be loaded inside the set `LatLngBounds`.
        bounds: null,

        // @option minZoom: Number = 0
        // The minimum zoom level down to which this layer will be displayed (inclusive).
        minZoom: 1,

        // @option maxZoom: Number = undefined
        // The maximum zoom level up to which this layer will be displayed (inclusive).
        maxZoom: 18,

        // @option maxNativeZoom: Number = undefined
        // Maximum zoom number the tile source has available. If it is specified,
        // the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
        // from `maxNativeZoom` level and auto-scaled.
        maxNativeZoom: undefined,

        // @option minNativeZoom: Number = undefined
        // Minimum zoom number the tile source has available. If it is specified,
        // the tiles on all zoom levels lower than `minNativeZoom` will be loaded
        // from `minNativeZoom` level and auto-scaled.
        minNativeZoom: undefined,

        // @option errorTileUrl: String = ''
        // URL to the tile image to show in place of the tile that failed to load.
        errorTileUrl: '',

        // @option noWrap: Boolean = false
        // Whether the layer is wrapped around the antimeridian. If `true`, the
        // GridLayer will only be displayed once at low zoom levels. Has no
        // effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
        // in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
        // tiles outside the CRS limits.
        noWrap: false,

        // @option pane: String = 'tilePane'
        // `Map pane` where the grid layer will be added.
        pane: 'tilePane',

        // @option className: String = ''
        // A custom class name to assign to the tile layer. Empty by default.
        className: '',

        // @option keepBuffer: Number = 2
        // When panning the map, keep this many rows and columns of tiles before unloading them.
        keepBuffer: 2
    },


    initialize: function (url, options) {
        L.Renderer.prototype.initialize.call(this, options);
        this._url = url;
    },

    onAdd: function (map) {

        this._container = L.DomUtil.create('canvas', 'leaflet-zoom-animated');

        var pane = map.getPane(this.options.pane);
        pane.appendChild(this._container);

        this._ctx = this._container.getContext('2d');

        this._tiles = {};

        this._update();
    },

    onRemove: function (map) {
        L.DomUtil.remove(this._container);
    },

    _update: function () {
        if(this._map._animatingZoom && this._bounds) {
            return;
        }

        L.Renderer.prototype._update.call(this);

        var b = this._bounds,
            container = this._container,
            size = b.getSize(),
            m = L.Browser.retina ? 2 : 1;

        L.DomUtil.setPosition(container, b.min);

        // set canvas size (also clearing it); use double size on retina
        container.width = m * size.x;
        container.height = m * size.y;
        container.style.width = size.x + 'px';
        container.style.height = size.y + 'px';

        if(L.Browser.retina) {
            this._ctx.scale(2, 2);
        }

        // translate so we use the same path coordinates after canvas element moves
        this._ctx.translate(-b.min.x, -b.min.y);

        // Tell paths to redraw themselves
        this.fire('update');
        try {
            this._draw();
        } catch(e) {
            console.log(e);
        }

    },

    _draw: function () {
        var map = this._map;
        var center = this._map.getCenter();
        var zoom = this._map.getZoom();

        var tileZoom = this._clampZoom(Math.round(zoom));
        if((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
            (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
            tileZoom = undefined;
        }

        if(tileZoom === undefined) {
            this._ctx.clearRect(0, 0, this._container.width, this._container.height);
            return;
        }
        this._tileZoom = tileZoom;

        var pixelBounds = this._getTiledPixelBounds(center, this._tileZoom);
        var tileRange = this._pxBoundsToTileRange(pixelBounds);
        var tileCenter = tileRange.getCenter();
        var queue = [];
        var margin = this.options.keepBuffer;
        var noPruneRange = new L.Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
            tileRange.getTopRight().add([margin, -margin]));

        // Sanity check: panic if the tile range contains Infinity somewhere.
        if(!(isFinite(tileRange.min.x) &&
                isFinite(tileRange.min.y) &&
                isFinite(tileRange.max.x) &&
                isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }


        for(var key in this._tiles) {
            var c = this._tiles[key].coords;
            if(c.z !== this._tileZoom || !noPruneRange.contains(new L.Point(c.x, c.y))) {
                this._tiles[key].current = false;
            } else{
                this._tiles[key].current = true;
            }
        }

        // create a queue of coordinates to load tiles from
        for(var j = tileRange.min.y; j <= tileRange.max.y; j++) {
            for(var i = tileRange.min.x; i <= tileRange.max.x; i++) {
                var coords = L.point(i, j);
                coords.z = this._tileZoom;
                if(!this._isValidTile(coords)) { continue; }
                
                // if(!this._tiles[this._tileCoordsToKey(coords)]) { 
                    queue.push(coords);
                // }
            }
        }

        // sort tile queue to load tiles in order of their distance to center
        queue.sort(function (a, b) {
            return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
        });

        if(queue.length) {
            this.tileCount = queue.length;
            for(i = 0; i < queue.length; i++) {
                this.createTile(queue[i]);
            }
        }

    },

    createTile: function (coords) {
        var tile = new Image(),
            tilePos = this._getTilePos(coords),
            key = this._tileCoordsToKey(coords),
            tileSrc = this.getTileUrl(coords);

        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, tilePos, this._tileReady.bind(this), tile, key, coords));
        L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, tilePos, this._tileReady.bind(this), tile));

        tile.src = tileSrc;

        // save tile in cache
        // this._tiles[key] = {
        //     el: tile,
        //     coords: coords,
        //     current: true
        // };

        return tile;
    },

    _tileReady: function (tilePos, err, tile) {
        // if(!this.bufferCanvas){
        //     this.bufferCanvas = document.createElement('canvas');
        //     this.bufferCanvas.width = this._container.width;
        //     this.bufferCanvas.height = this._container.height;                        
        // }
        // var  bufferCtx = this.bufferCanvas.getContext('2d');
        // var size = this.getTileSize();
        // bufferCtx.clearRect(tilePos.x, tilePos.y, size.x, size.y);
        // bufferCtx.drawImage(tile, tilePos.x, tilePos.y, size.x, size.y);
        // if(this.tileCount <=0 ){
        //     this._ctx.clearRect(0,0,this._container.width,this._container.height);
        //     this._ctx.drawImage(this.bufferCanvas,0,0);
        // }
    },

    _tileOnLoad: function (tilePos, done, tile, key, coords) {
         this.tileCount --;
        // For https://github.com/Leaflet/Leaflet/issues/3332
        if(L.Browser.ielt9) {
            setTimeout(L.Util.bind(done, this, tilePos, null, tile), 0);
        } else {
            done(tilePos, null, tile);
        }
        var size = this.getTileSize();
        // save tile in cache
        // this._tiles[key] = {
        //     el: tile,
        //     coords: coords,
        //     current: true
        // };
        this._ctx.clearRect(tilePos.x, tilePos.y, size.x, size.y);
        this._ctx.drawImage(tile, tilePos.x, tilePos.y, size.x, size.y);
    },

    _tileOnError: function (tilePos, done, tile, e) {
        this.tileCount --;
        var errorUrl = this.options.errorTileUrl;
        if(errorUrl && tile.src !== errorUrl) {
            tile.src = errorUrl;
        }
        done(tilePos, e, tile);
    },

    getTileSize: function () {
        var s = this.options.tileSize;
        return s instanceof L.Point ? s : L.point(s, s);
    },

    getTileUrl: function (tilePoint) {
        return L.Util.template(this._url, {
            num: 2,
            x: tilePoint.x,
            y: tilePoint.y,
            z: tilePoint.z,
            lyrs: 'm' // m：路线图 t：地形图 p：带标签的地形图 s：卫星图 y：带标签的卫星图 h：标签层（路名、地名等）
        })
    },

    getTileSize: function () {
        var s = this.options.tileSize;
        return s instanceof L.Point ? s : L.point(s, s);
    },

    _getTilePos: function (coords) {
        var origin = this._map.project(this._map.unproject(this._map.getPixelOrigin()), this._tileZoom).round();
        return coords.scaleBy(this.getTileSize()).subtract(origin);
    },

    _clampZoom: function (zoom) {
        var options = this.options;

        if(undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
            return options.minNativeZoom;
        }

        if(undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
            return options.maxNativeZoom;
        }

        return zoom;
    },

    _removeTilesAtZoom: function (zoom) {
        for(var key in this._tiles) {
            if(this._tiles[key].coords.z !== zoom) {
                continue;
            }
            this._removeTile(key);
        }
    },

    _removeAllTiles: function () {
        for(var key in this._tiles) {
            this._removeTile(key);
        }
    },

    _removeTile: function (key) {
        var tile = this._tiles[key];
        if(!tile) { return; }
        var size = this.getTileSize();
        this._ctx.clearRect(tile.pos.x, tile.pos.y, size.x, size.y);

        delete this._tiles[key];
    },

    _isValidTile: function (coords) {
        var crs = this._map.options.crs;

        if(!crs.infinite) {
            var bounds = this._map.getPixelWorldBounds(this._tileZoom);
            if(bounds) {
                this._globalTileRange = this._pxBoundsToTileRange(bounds);
            }
            // don't load tile if it's out of bounds and not wrapped
            var bounds = this._globalTileRange;
            if((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
                (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
        }

        if(!this.options.bounds) { return true; }

        // don't load tile if it doesn't intersect the bounds in options
        var tileBounds = this._tileCoordsToBounds(coords);
        return latLngBounds(this.options.bounds).overlaps(tileBounds);
    },

    _keyToBounds: function (key) {
        return this._tileCoordsToBounds(this._keyToTileCoords(key));
    },

    // converts tile coordinates to its geographical bounds
    _tileCoordsToBounds: function (coords) {

        var map = this._map,
            tileSize = this.getTileSize(),

            nwPoint = coords.scaleBy(tileSize),
            sePoint = nwPoint.add(tileSize),

            nw = map.unproject(nwPoint, coords.z),
            se = map.unproject(sePoint, coords.z),
            bounds = new LatLngBounds(nw, se);

        if(!this.options.noWrap) {
            map.wrapLatLngBounds(bounds);
        }

        return bounds;
    },

    // converts tile coordinates to key for the tile cache
    _tileCoordsToKey: function (coords) {
        return coords.x + ':' + coords.y + ':' + coords.z;
    },

    // converts tile cache key to coordinates
    _keyToTileCoords: function (key) {
        var k = key.split(':'),
            coords = new L.Point(+k[0], +k[1]);
        coords.z = +k[2];
        return coords;
    },

    _getTiledPixelBounds: function (center, zoom) {
        var map = this._map,
            mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
            scale = map.getZoomScale(mapZoom, zoom),
            pixelCenter = map.project(center, zoom).floor(),
            halfSize = map.getSize().divideBy(scale * 2);

        return L.bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
    },

    _pxBoundsToTileRange: function (bounds) {
        var tileSize = this.getTileSize();
        return L.bounds(
            bounds.min.unscaleBy(tileSize).floor(),
            bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
    }
});