/**
 * morningstar-base-charts
 *
 * Copyright © 2016 . All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { expect } from "chai";
import { StringUtils } from "../src/js/utils.js";

describe("StringUtils", () => {

    describe("testing template", () => {
        it("should return 17:", () => {
            const data = { value: 17 };
            const template = "this.value";
            const result = StringUtils.template(template, data);
            expect(result).to.be.equal("17");
        });

    });

});
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
}));*/