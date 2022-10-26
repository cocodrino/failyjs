import {readFile, readFileSync,writeFileSync} from "fs"
import * as Path from 'path'
import * as lodash from 'lodash'

type Memo = {
    file?: MyFile

}

abstract class MyNode {
    memo: Memo
    property: string

    protected constructor(memo: Memo, propertyName: string) {
        this.memo = memo
        this.property = propertyName
    }

    abstract appendToArray(value: any): MyNode

    abstract removeFromArray(value: any): MyNode

    abstract setValue(value: any): MyNode

    abstract save() : boolean


}

class JSONNode extends MyNode {
    constructor(memo: Memo, propertyName: string) {
        super(memo, propertyName);
    }

    appendToArray(value: any): MyNode {
        const data = this.memo.file?.data

        if (!data) throw Error("data for file can't be founded")

        lodash.update(data,this.property,(v)=>{
            if (!Array.isArray(v)) throw new Error(`append only works with array, you are trying to push ${value} to ${this.property}`)
            return [...v,value]
        })
        return this;
    }

    removeFromArray(value: string): MyNode {
        const data = this.memo.file?.data

        if (!data) throw Error("data for file can't be founded")

        lodash.update(data,this.property,(v)=>{
            if (!Array.isArray(v)) throw new Error(`append only works with array, you are trying to push ${value} to ${v}`)
            return v.filter((e)=>e!==value)
        })
        return this;
    }

    addProperty(propertyName: string, value : any) : MyNode{
        const data = this.memo.file?.data

        if (!data) throw Error("data for file can't be founded")

        lodash.set(data,propertyName,value)
        return this
    }

    setValue(value: any): MyNode {
        const data = this.memo.file?.data

        if (!data) throw Error("data for file can't be founded")

        lodash.set(data, this.property, value)
        return this;
    }

    save() : boolean{
        const file = this.memo.file

        if(!file) throw Error("something weird happen, please report error")
        return file.save()
    }

}


export abstract class MyFile {
    abstract memo: Memo
    abstract  data: any
    fileName: string

    protected constructor(fileName: string) {
        this.fileName = fileName
    }

    abstract findProperty(s: string): MyNode

    abstract save(): boolean

    abstract saveDataToFile(data : any) : boolean

    abstract addProperty(propertyName: string, value : any) : MyFile

    appendTextToFile(textLine : string,inNewLine=true) : Boolean{
        const lineBreak = inNewLine ? "\n" : ""

        try{
            writeFileSync(this.fileName,lineBreak+textLine,{"flag" : "a"})
            return true
        }catch (e) {
            console.error(`error appendLineToFile: ${e}`)
            return false
        }

    }

}

class MyJsonFile extends MyFile {
    addProperty(propertyName: string, value: any): MyFile {
        const data = this.data

        if (!data) throw Error("data for file can't be founded")

        lodash.set(data,propertyName,value)
        return this
    }
    saveDataToFile(data: any): boolean {
        try {
            writeFileSync(this.fileName,JSON.stringify(this.data,null,4))
            return true
        }catch (e) {
            console.error(`saveDataToFile: can't save data ${e}`)
            return false
        }

    }
    data: any
    memo: Memo

    constructor(data: Buffer, fileName: string) {
        super(fileName)

        this.memo = {file: this}
        this.data = JSON.parse(data.toString())
    }

    findProperty(s: string): MyNode {
        return new JSONNode(this.memo, s)
    }

    save(): boolean {
        writeFileSync(this.fileName,JSON.stringify(this.data,null,4))
        return true
    }

}

class MyFileCreator {
    static createFileSync(data: Buffer, filePath: string): MyFile {
        const nameSeparated = filePath.split(".")

        if (nameSeparated.length < 2) throw Error(`please add fileName with extension, like test.json`)

        const extension = nameSeparated[nameSeparated.length - 1]

        if (['json', 'js'].includes(extension)) return new MyJsonFile(data, filePath)
        else throw Error(`extension ${extension} not valid`)
    }

}

export class MyUtils {
    path: string

    constructor(path = '') {
        if (path && path[path.length - 1] !== "/") path += "/"

        console.log(__dirname)
        this.path = Path.join(__dirname, path)
    }


    selectFileSync(fileName: string): MyFile {
        const filePath = Path.join(this.path, fileName)
        const buffer = readFileSync(filePath)
        return MyFileCreator.createFileSync(buffer, filePath)
    }


}