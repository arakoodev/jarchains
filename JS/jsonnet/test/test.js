import Jsonnet from "../src/jsonnet.js";
import { expect } from "chai";

let jsonnet = new Jsonnet();

describe("Testing evaluateSnippet function of jsonnet library", () => {
	it("self reference", () => {
		let result = JSON.parse(jsonnet.evaluateSnippet(`{
          Martini: {
            local drink = self,
            ingredients: [
              { kind: "Farmer's Gin", qty: 1 },
              {
                kind: 'Dry White Vermouth',
                qty: drink.ingredients[0].qty,
              },
            ],
            garnish: 'Olive',
            served: 'Straight Up',
          },
        }`));
		let expected = JSON.parse(`{
      "Martini": {
        "garnish": "Olive",
        "ingredients": [
          {
            "kind": "Farmer's Gin",
            "qty": 1
          },
          {
            "kind": "Dry White Vermouth",
            "qty": 1
          }
        ],
        "served": "Straight Up"
      }
    }`);
		// expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
		expect(result).to.eql(expected);
	});

	it("math operations", () => {
		let result = JSON.parse(jsonnet.evaluateSnippet(`{
		  a: 1 + 2,
		  b: 3 * 4,
		  c: 5 / 6,
		  d: 7 % 8,
		  e: 9 - 10,
		}`));
		let expected = JSON.parse(`{
	  "a": 3,
	  "b": 12,
	  "c": 0.8333333333333334,
	  "d": 7,
	  "e": -1
	}`);
		// expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
		expect(result).to.eql(expected);
	})
});


describe("Testing evaluateFile function of jsonnet library", () => {
	it("Read File and evaluate", () => {
		// let result = jsonnet.extString("name", "Alice");
		let result = JSON.parse(jsonnet.evaluateFile("./test.jsonnet"));
		let expected = JSON.parse(`{
			"concat_array": [
			   1,
			   2,
			   3,
			   4
			],
			"concat_string": "1234",
			"equality1": false,
			"equality2": true,
			"ex1": 1.6666666666666665,
			"ex2": 3,
			"ex3": 1.6666666666666665,
			"ex4": true,
			"obj": {
			   "a": 1,
			   "b": 3,
			   "c": 4
			},
			"obj_member": true,
			"str1": "The value of self.ex2 is 3.",
			"str2": "The value of self.ex2 is 3.",
			"str3": "ex1=1.67, ex2=3.00",
			"str4": "ex1=1.67, ex2=3.00",
			"str5": "ex1=1.67\\nex2=3.00\\n"
		 }`);
		expect(result).to.eql(expected);
	});
});