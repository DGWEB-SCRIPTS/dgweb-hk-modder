import { ModeOfOperation as aes } from 'aes-js'
import * as base64 from "./base64.js"

const cSharpHeader = [0, 1, 0, 0, 0, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0]
const aesKey = StringToBytes('UKu52ePUBwetZ9wNX88o54dnfKRu0T1l')
const ecb = new aes.ecb(aesKey)

String.prototype.reverse = function(){
    return this.split("").reverse().join("")
}

export function StringToBytes(string){
    return new TextEncoder().encode(string) 
}

export function BytesToString(bytes){
    return new TextDecoder().decode(bytes)
}

export function AESDecrypt(bytes){
    let data = ecb.decrypt(bytes)
    data = data.subarray(0, -data[data.length-1]) 
    return data
}

export function AESEncrypt(bytes){
    let padValue = 16 - bytes.length % 16
    var padded = new Uint8Array(bytes.length + padValue)
    padded.fill(padValue)
    padded.set(bytes)
    return ecb.encrypt(padded)
}

export function GenerateLengthPrefixedString(length){
    var length = Math.min(0x7FFFFFFF, length) 
    var bytes = [] 
    for (let i=0; i<4; i++){
        if (length >> 7 != 0){
            bytes.push(length & 0x7F | 0x80)
            length >>= 7 
        } else {
            bytes.push(length & 0x7F)
            length >>= 7
            break 
        }
    } 
    if (length != 0){
        bytes.push(length)
    }
    return bytes 
}

export function AddHeader(bytes){
    var lengthData = GenerateLengthPrefixedString(bytes.length)
    var newBytes = new Uint8Array(bytes.length + cSharpHeader.length + lengthData.length + 1)
    newBytes.set(cSharpHeader) 
    newBytes.subarray(cSharpHeader.length).set(lengthData) 
    newBytes.subarray(cSharpHeader.length + lengthData.length).set(bytes) 
    newBytes.subarray(cSharpHeader.length + lengthData.length + bytes.length).set([11]) 
    return newBytes
}

export function RemoveHeader(bytes){
    bytes = bytes.subarray(cSharpHeader.length, bytes.length - 1) 
    let lengthCount = 0 
    for (let i = 0; i < 5; i++){
        lengthCount++
        if ((bytes[i] & 0x80) == 0){ 
            break  
        }
    }
    bytes = bytes.subarray(lengthCount)
    return bytes 
}

export function Decode(bytes){
    bytes = bytes.slice() 
    bytes = RemoveHeader(bytes)
    bytes = base64.decode(bytes)
    bytes = AESDecrypt(bytes)
    return BytesToString(bytes)
}

export function Encode(jsonString){
    var bytes = StringToBytes(jsonString)
    bytes = AESEncrypt(bytes)
    bytes = base64.encode(bytes)
    return AddHeader(bytes)
}

export function DownloadData(data, fileName){
    var a = document.createElement("a")
    a.setAttribute("href", window.URL.createObjectURL(new Blob([data], {type: "octet/stream"})));
    a.setAttribute('download', fileName)
    a.setAttribute('style', `position: fixed; opacity: 0; left: 0; top: 0;`)
    document.body.append(a)
    a.click()
    document.body.removeChild(a)
}
