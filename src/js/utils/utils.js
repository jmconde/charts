
export class ChartUtils {
    /**
     * Returns all values as an unique array.
     */
    static getAllValues (data) {
        var allValues = [];
        data.forEach(function (value) {
            allValues = allValues.concat(value.values);
        });
        return allValues;
    }
    /**
     * Returns false if the array passed contains negative values.
     */
    static hasNegative (allValues) {
        return d3.min(allValues) < 0;
    }
    /**
     * Calculates the domain fot a certain dataset.
     */
    static getDomain (allValues, round_to = 100) {
        if (!allValues || !allValues.length) {
            return [0, 1];
        }
        var domainMax, domainMin;
        domainMax = (Math.ceil(d3.max(allValues) / round_to) * round_to);
        domainMin = this.hasNegative(allValues) ? domainMax * -1 : 0;
        return [domainMin, domainMax];
    }
    /**
     * Calculate tickvalues for a given dataset.
     */
    static getTickValues (domain, ticksNumber = 4) {
        var distance = Math.abs(domain[0] - domain[1]),
            domain_step = distance / ticksNumber,
            min = d3.min(domain),
            max = d3.max(domain),
            tickValues = [];

        while (min < max) {
            tickValues.push(min);
            min += domain_step;
        }
        tickValues.push(min);
        return tickValues;
    }
}

export class StringUtils {
    dashify (str) {
        str = str.replace(/\s+/g, "-").toLowerCase();
        return str;
    }
    /*
    var template =
    'My skills:' +
    '<%if(this.showSkills) {%>' +
        '<%for(var index in this.skills) {%>' +
        '<a href="#"><%this.skills[index]%></a>' +
        '<%}%>' +
    '<%} else {%>' +
        '<p>none</p>' +
    '<%}%>';
    console.log(TemplateEngine(template, {
        skills: ["js", "html", "css"],
        showSkills: true
    }));
    */
    template (html, data) {
        var re = /<%([^%>]+)?%>/g,
            reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
            code = "var r=[];\n",
            cursor = 0,
            match;

        var add = function (line, js) {
            js ? (code += line.match(reExp) ? line + "\n" : "r.push(" + line + ");\n") :
                (code += line != "" ? "r.push('" + line.replace(/"/g, "\\'") + "');\n" : "");
            return add;
        };
        match = re.exec(html);
        while ( match ) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
            match = re.exec(html);
        }

        add(html.substr(cursor, html.length - cursor));
        code += "return r.join('');";
        return new Function(code.replace(/[\r\t\n]/g, "")).apply(data);
    }
}

export class ObjectUtils {
    extend (...args) {

        // Variables
        let extended = {},
            deep = false,
            i = 0,
            length = args.length,
            merge;

        // Check if a deep merge
        if (Object.prototype.toString.call(args[0]) === "[object Boolean]") {
            deep = args[0];
            i++;
        }

        // Merge the object into the extended object
        merge = (obj) => {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    // If deep merge and property is an object, merge properties
                    if (deep && Object.prototype.toString.call(obj[prop]) === "[object Object]") {
                        extended[prop] = this.extend(true, extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for (; i < length; i++) {
            var obj = args[i];
            merge(obj);
        }

        return extended;
    }

    mixin (baseClass, ...mixins) {
        let base = class _Combined extends baseClass {
            constructor (...args) {
                super(...args);
                mixins.forEach((mixin) => {
                    mixin.prototype.initializer.call(this);
                });
            }
        };
        let copyProps = (target, source) => {
            Object.getOwnPropertyNames(source)
                .concat(Object.getOwnPropertySymbols(source))
                .forEach((prop) => {
                    if (prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
                        return;
                    }
                    Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop))
                });
        };
        mixins.forEach((mixin) => {
            copyProps(base.prototype, mixin.prototype);
            copyProps(base, mixin);
        });
        return base;
    }
}
