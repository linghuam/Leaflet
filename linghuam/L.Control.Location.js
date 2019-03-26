L.Control.Location = L.Control.extend({
    options: {
        position: 'bottomright',
        onClickCallback: null
    },
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'my-leaflet-control-location');
        L.DomEvent.on(container, 'click', this._onClickHandler, this);
        return container;
    },
    onRemove: function(map) {
        L.DomEvent.off(this._container, 'click', this._onClickHandler, this);
    },
    _onClickHandler: function(e) {
        if (this.options.onClickCallback) {
            this.options.onClickCallback.apply(this, arguments);
        }
    }
});

L.control.location = function(options) {
    return new L.Control.Location(options);
}