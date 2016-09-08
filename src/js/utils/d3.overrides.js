export default function () {
    // d3 overrides
    //----------------------------------

    d3.selection.prototype.first = function () {
        return d3.select(this[0][0]);
    };

    d3.selection.prototype.last = function () {
        var last = this.size() - 1;
        return d3.select(this[0][last]);
    };
    d3.selection.prototype.attrs = function(obj) {
        for(let attr in obj) {
            this.attr(attr, obj[attr]);
        }
        return this;
    };
    //---------------oOo-----------------
}
