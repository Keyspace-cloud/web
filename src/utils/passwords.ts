import { ZXCVBNResult } from "zxcvbn"

export const passwordStrength = (password: string, otherInputs: Array<string>) : ZXCVBNResult => {
    let zxcvbn = require('zxcvbn')
    return zxcvbn(password, otherInputs)
}

export interface passwordOptions {
    length: number,
    uppercase:boolean,
    lowercase: boolean,
    numbers: boolean,
    symbols: boolean
}

export const randomPassword = (options:passwordOptions) => {
    var charSet = "";
    
    if(options.lowercase) {
        charSet += "abcdefghijklmnopqrstuvwxyz";
    }
    if(options.uppercase) {
        charSet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    } 
    if(options.numbers) {
        charSet += "0123456789";
    } 
    if(options.symbols) {
        charSet += "!\"#$%&'()*+,-./:;<=>?@[\]^_`{|}~";
    } 
    var array = new Uint32Array(options.length);
    window.crypto.getRandomValues(array);

    let password = "";
    for (var i = 0; i < options.length; i++) {
        password += charSet[array[i]%charSet.length]
    }
    
    return password
}
