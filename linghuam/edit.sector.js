L.Edit = L.Edit || {}

L.Edit.Sector = L.Edit.SimpleShape.extend({
    options: {
        moveIcon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
        }),
        resizeIcon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
        }),
        startIcon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
        }),
        endIcon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
        }),
        rotateIcon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
        })
    },

    _initMarkers: function () {
        if (!this._markerGroup) {
            this._markerGroup = new L.LayerGroup()
        }
        this._resizeMarkers = []

        // Create center marker
        this._createMoveMarker()

        // Create edge marker
        this._createInnerRadiusMarker()
        this._createOuterRadiusMarker()

        // Create start Marker();
        this._createStartMarker()

        // Create end Marker
        this._createEndMarker()

        //Create rotate Marker
        this._createRotateMarker()
    },

    _createMoveMarker:function () {
        //var center = this._shape.getLatLng();
        var center = this._shape.getCenter()
        //this._moveMarker = this._createMarker(center, this.options.moveIcon);
        this._moveMarker = this._createMarker(center, this.options.moveIcon)
    },

    _createInnerRadiusMarker:function () {
        var center = this._shape.getCenter()

        var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2

        var point = this._shape.computeDestinationPoint(
            center,
            this._shape.getInnerRadius(),
            bearing
        )

        this._innerRadiusMarker = this._createMarker(point, this.options.resizeIcon)

    },

    _createOuterRadiusMarker: function () {
        var center = this._shape.getCenter()

        var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2

        var point = this._shape.computeDestinationPoint(
            center,
            this._shape.getOuterRadius(),
            bearing
        )

        this._outerRadiusMarker = this._createMarker(point, this.options.resizeIcon)
    },

    _createStartMarker: function () {
        var center = this._shape.getCenter()

        var point = this._shape.computeDestinationPoint(
            center,
            (this._shape.getInnerRadius() + this._shape.getOuterRadius())/2,
            this._shape.getStartBearing()
        )

        this._startMarker = this._createMarker(point, this.options.startIcon)
    },

    _createEndMarker: function () {
        var center = this._shape.getCenter()

        var point = this._shape.computeDestinationPoint(
            center,
            (this._shape.getInnerRadius() + this._shape.getOuterRadius())/2,
            this._shape.getEndBearing()
        )

        this._endMarker = this._createMarker(point, this.options.endIcon)
    },

    _createRotateMarker:function () {
        var center = this._shape.getCenter()

        var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2

        var point = this._shape.computeDestinationPoint(
            center, this._shape.getOuterRadius() * 1.3,
            bearing
        )

        this._rotateMarker = this._createMarker(point, this.options.rotateIcon)
    },

    _onMarkerDragStart:function (e) {
        L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e)
        this._currentMarker = e.target
    },

    _onMarkerDrag:function (e) {
        var marker = e.target,
            latlng = marker.getLatLng()

        if (marker === this._moveMarker) {
            this._move(latlng)
        } else if (marker === this._innerRadiusMarker) {
            this._resizeInnerRadius(latlng)
        } else if (marker === this._outerRadiusMarker) {
            this._resizeOuterRadius(latlng)
        } else if (marker === this._startMarker) {
            this._restart(latlng)
        } else if (marker === this._endMarker) {
            this._end(latlng)
        } else {
            this._rotate(latlng)
        }

        this._shape.redraw()
    },

    _move:function (latlng) {
        this._shape.setCenter(latlng)
        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        this._repositionInnerRadiusMarker()
        this._repositionOuterRadiusMarker()
        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionRotateMarker()
    },

    _resizeInnerRadius:function (latlng) {
        var innerRadius = this._shape.getCenter().distanceTo(latlng)
        this._shape.setInnerRadius(innerRadius)
        this._shape.setLatLngs(this._shape.getLatLngs())

        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionRotateMarker()
        this._repositionInnerRadiusMarker()
        this._repositionOuterRadiusMarker()
    },

    _resizeOuterRadius:function (latlng) {
        var outerRadius = this._shape.getCenter().distanceTo(latlng)
        this._shape.setOuterRadius(outerRadius)
        this._shape.setLatLngs(this._shape.getLatLngs())

        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionRotateMarker()
        this._repositionInnerRadiusMarker()
        this._repositionOuterRadiusMarker()
    },

    _restart:function (latlng) {
        var moveLatLng = this._shape.getCenter()

        var pc = this._map.project(moveLatLng)
        var ph = this._map.project(latlng)
        var v = [ph.x - pc.x, ph.y - pc.y]

        var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI

        this._shape.setStartBearing(newB)

        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        //this._repositionResizeMarker()
        this._repositionInnerRadiusMarker()
        this._repositionOuterRadiusMarker()
        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionRotateMarker()
    },

    _end:function (latlng) {
        var moveLatLng = this._shape.getCenter(),
            pc = this._map.project(moveLatLng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],

            newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI

        this._shape.setEndBearing(newB)

        this._shape.setLatLngs(this._shape.getLatLngs())

        // Move the resize marker
        this._repositionInnerRadiusMarker()
        this._repositionOuterRadiusMarker()
        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionRotateMarker()
    },

    _rotate:function (latlng) {
        var moveLatLng = this._shape.getCenter(),

            pc = this._map.project(moveLatLng),
            ph = this._map.project(latlng),
            v = [ph.x - pc.x, ph.y - pc.y],

            newB = (Math.atan2(v[0], -v[1]) * 180 / Math.PI) % 360,
            halfAngle = (this._shape.getEndBearing() - this._shape.getStartBearing()) / 2,

            newStart = (newB - halfAngle),
            newEnd = (newStart + 2 * halfAngle)

        this._shape.setStartBearing(newStart)
        this._shape.setEndBearing(newEnd)
        this._shape.setLatLngs(this._shape.getLatLngs())


        this._repositionInnerRadiusMarker()
        this._repositionOuterRadiusMarker()
        this._repositionStartMarker()
        this._repositionEndMarker()
        this._repositionRotateMarker()
    },

    _repositionInnerRadiusMarker:function () {
        var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2,
            point = this._shape.computeDestinationPoint(
                this._shape.getCenter(),
                this._shape.getInnerRadius(),
                bearing
            )

        this._innerRadiusMarker.setLatLng(point)
    },

    _repositionOuterRadiusMarker:function  () {
        var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2,
            point = this._shape.computeDestinationPoint(
                this._shape.getCenter(),
                this._shape.getOuterRadius(),
                bearing
            )

        this._outerRadiusMarker.setLatLng(point)
    },

    _repositionStartMarker:function  () {
        var start = this._shape.computeDestinationPoint(
            this._shape.getCenter(),
            (this._shape.getOuterRadius() + this._shape.getInnerRadius())/2,
            this._shape.getStartBearing()
        )
        this._startMarker.setLatLng(start)
    },

    _repositionEndMarker:function  () {
        var end = this._shape.computeDestinationPoint(
            this._shape.getCenter(),
            (this._shape.getOuterRadius() + this._shape.getInnerRadius()) /2,
            this._shape.getEndBearing()
        )
        this._endMarker.setLatLng(end)
    },

    _repositionRotateMarker:function  () {
        var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2,

            point = this._shape.computeDestinationPoint(
                this._shape.getCenter(),
                this._shape.getOuterRadius() * 1.3,
                bearing
            )

        this._rotateMarker.setLatLng(point)
    },

})

L.Sector.addInitHook(function () {
    if (L.Edit.Sector) {
        this.editing = new L.Edit.Sector(this)

        if (this.options.editable) {
            this.editing.enable()
        }
    }

    this.on('add', function () {
        if (this.editing && this.editing.enabled()) {
            this.editing.addHooks()
        }
    })

    this.on('remove', function () {
        if (this.editing && this.editing.enabled()) {
            this.editing.removeHooks()
        }
    })
})