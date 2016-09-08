class Event {
    constructor () {
        this._dispatch = d3.dispatch("axis_updated", "axis_rendered", "zone_mouseover", "zone_mouseout");
    }

    trigger (type, data) {
        this._dispatch[type](data);
    }

    get dispatch () {
        return this._dispatch;
    }
}

export default Event;