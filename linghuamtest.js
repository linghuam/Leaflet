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
        minZoom: 0,

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

        this._draw();
    },

    _draw: function () {
    	this._ctx.clearRect(0, 0, this._container.width, this._container.height);
        var map = this._map;
        var center = this._map.getCenter();
        var zoom = this._map.getZoom();
        this._level = {};
        this._level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
        var pixelBounds = this._getTiledPixelBounds(center, zoom);
        var tileRange = this._pxBoundsToTileRange(pixelBounds);
        var tileCenter = tileRange.getCenter();
        var queue = [];
        for(var j = tileRange.min.y; j <= tileRange.max.y; j++) {
            for(var i = tileRange.min.x; i <= tileRange.max.x; i++) {
                var coords = L.point(i, j);
                coords.z = zoom;
                queue.push(coords);
            }
        }
        queue.sort(function (a, b) {
            return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
        });
        for(i = 0; i < queue.length; i++) {
            this.createTile(queue[i], L.Util.bind(this._tileReady, this, queue[i]));
        }
    },

    createTile: function (coords, done) {
        var tile = new Image(),
            tilePos = this._getTilePos(coords),
            tileSrc = this.getTileUrl(coords);

        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, tilePos, done, tile));
        L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, tilePos, done, tile));

        tile.src = tileSrc;

        return tile;
    },

    _tileReady: function (coords, err, tile) {
        // if(!this._map) { return; }

        // if(err) {
        //     // @event tileerror: TileErrorEvent
        //     // Fired when there is an error loading a tile.
        //     this.fire('tileerror', {
        //         error: err,
        //         tile: tile,
        //         coords: coords
        //     });
        // }

        // var key = this._tileCoordsToKey(coords);

        // tile = this._tiles[key];
        // if(!tile) { return; }

        // tile.loaded = +new Date();
        // if(this._map._fadeAnimated) {
        //     DomUtil.setOpacity(tile.el, 0);
        //     Util.cancelAnimFrame(this._fadeFrame);
        //     this._fadeFrame = Util.requestAnimFrame(this._updateOpacity, this);
        // } else {
        //     tile.active = true;
        //     this._pruneTiles();
        // }

        // if(!err) {
        //     DomUtil.addClass(tile.el, 'leaflet-tile-loaded');

        //     // @event tileload: TileEvent
        //     // Fired when a tile loads.
        //     this.fire('tileload', {
        //         tile: tile.el,
        //         coords: coords
        //     });
        // }

        // if(this._noTilesToLoad()) {
        //     this._loading = false;
        //     // @event load: Event
        //     // Fired when the grid layer loaded all visible tiles.
        //     this.fire('load');

        //     if(Browser.ielt9 || !this._map._fadeAnimated) {
        //         Util.requestAnimFrame(this._pruneTiles, this);
        //     } else {
        //         // Wait a bit more than 0.2 secs (the duration of the tile fade-in)
        //         // to trigger a pruning.
        //         setTimeout(Util.bind(this._pruneTiles, this), 250);
        //     }
        // }
    },

    _tileOnLoad: function (tilePos, done, tile) {
        // For https://github.com/Leaflet/Leaflet/issues/3332
        if(L.Browser.ielt9) {
            setTimeout(L.Util.bind(done, this, null, tile), 0);
        } else {
            done(null, tile);
        }
        var size = this.getTileSize();
        this._ctx.drawImage(tile, tilePos.x, tilePos.y, size.x, size.y);
    },

    _tileOnError: function (tilePos, done, tile, e) {
        var errorUrl = this.options.errorTileUrl;
        if(errorUrl && tile.src !== errorUrl) {
            tile.src = errorUrl;
        }
        done(e, tile);
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

    _getTilePos: function (coords) {
        return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
    },

    getTileSize: function () {
        var s = this.options.tileSize;
        return s instanceof L.Point ? s : L.point(s, s);
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