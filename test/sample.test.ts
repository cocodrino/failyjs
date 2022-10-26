import {it,describe,expect, beforeEach} from "vitest";
import {MyUtils, sayGoodBye, sayHello} from "../src";
import {MyFile} from "../src/MyUtils";

describe('my util',()=>{
    let select : MyFile;

    beforeEach(()=>{
        const file = new MyUtils('../test/samples')
        select = file.selectFileSync("test1.json")
        select.saveDataToFile({
            "user": "tom",
            "color": "yellow",
            "nested": {
                "nestedProp": 5
            },
            "array_value": [
                2,
                3,
                4
            ]
        })
    })

    describe("can load a file",()=>{
        it("can load file",()=>{
            expect(select).toBeDefined()
        })


        it("can find and edit property",()=>{

            expect(select.findProperty("color").setValue("green").save()).toBe(true)
            expect(select?.data?.color).toBe("green")
        })


        it("can find and edit nested property",()=>{
            expect(select.findProperty("nested.nestedProp").setValue(12).save()).toBe(true)
            expect(select.data?.nested?.nestedProp).toBe(12)
        })

        it("can add fields to array for property",()=>{
            expect((select.findProperty("array_value").appendToArray(23).save())).toBe(true)
            expect(select.data?.array_value.includes(23)).toBe(true)
        })

        it("can remove fields from array from property",()=>{
            expect((select.findProperty("array_value").removeFromArray(2).save())).toBe(true)
            expect(select.data?.array_value.includes(2)).toBe(false)
        })

        it("can append a line of text to file",()=>{
            expect(select.appendTextToFile("test")).toBe(true)

        })

        it("can add properties to object",()=>{
            select.addProperty("addedProperty",3).save()
            expect(select.data?.addedProperty).toBe(3)
        })


    })
})