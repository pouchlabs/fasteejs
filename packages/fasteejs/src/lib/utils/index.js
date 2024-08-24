import {join} from "path"; 
import fs from "fs";
import crypto from "crypto";
import colors from "kleur";  
/*
utill to gen secret
*/
export async function genSecret(num){
 let n = Number(num) || 16
  return {secret:crypto.randomBytes(n).toString("hex")}
}

/**utill read any json file
@param  file
*/
export async function readjsonFile(file){  
  try{ 
const pkg =  JSON.parse(fs.readFileSync(new URL(join(process.cwd(),file), import.meta.url), 'utf-8'));
 return {
   iserror:false,
   json:pkg 
 }
  }catch(err){ 
    return{
      iserror:true,
      error:err
    }
  }
} 
 
export async function logSuccess(port){
let msg = `
  [${colors.bold().green("fastee")}]: running on port : ${colors.blue(port)}\r\n
   http://localhost:${colors.blue(port)}`
 console.log(msg) 
}
export async function logError(err){
  let msg = `[${colors.bold().red("fastee")}]: error occured: ${colors.red(err)}`
   console.log(msg)
  }

export function clear(isSoft) {
	process.stdout.write(
		isSoft ? '\x1B[H\x1B[2J' : '\x1B[2J\x1B[3J\x1B[H\x1Bc'
	);
} 
 
export var checktype = (function(global) {
  var cache = {};
  return function(obj) {
      var key;
      return obj === null ? 'null' // null
          : obj === global ? 'global' // window in browser or global in nodejs
          : (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
          : obj.nodeType ? 'object' // DOM element
          : cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
          || (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
  };
}(this));

