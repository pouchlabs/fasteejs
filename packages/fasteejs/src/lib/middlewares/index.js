import bodyParser from "body-parser";
//import multer from 'multer';
import { checktype,logError } from "../utils/index.js";
import { STATUS_CODES } from 'http';
import colors from "kleur";
import Ip from "../core/ip.js";
import { DEV } from "esm-env";
// create application/json parser
export const jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
export const urlencodedParser = bodyParser.urlencoded({ extended: false })
export const textParser = bodyParser.text({})

export function json(req,res,next){
    res.json = (code=200,data)=>{
      if(!code || typeof code !== "number" || !data ){
        logError(`\n res.json requires status code,data must be valid object 👈,\n ${colors.blue("try some like <res.json(400,{msg:'bad request'})>")}`)
         res.end()//avoids infinite loop response
        return
      }
    if(data && checktype(data) === checktype({})){
    res.writeHead(code, {'Content-Type':'application/json'});
    res.write(JSON.stringify(data,null,2))
    res.end() 
    return
    }
    throw new Error('valid object required')
    }

 next()
}
export function text(req,res,next){
  res.text = (code=200,data)=>{
    if(!code || typeof code !== "number" || !data ){
      logError(`\n res.text requires status code,data must be string 👈,\n ${colors.blue("try some like <res.text(400,'bad request')>")}`)
       res.end()//avoids infinite loop response
      return
    }
  if(typeof data === "string"){
  res.writeHead(code, {'Content-Type':'text/plain'});
  res.end(data) 
  return
  }
  throw new Error('valid string required')
  }

next()
}
export function html(req,res,next){
  res.html = (code=200,data)=>{
    if(!code || typeof code !== "number" || !data ){
      logError(`\n res.html requires status code,data must be html string 👈,\n ${colors.blue("try some like <res.html(400,'<h1>oops! bad request</h1>')>")}`)
       res.end()//avoids infinite loop response
      return
    }
  if(typeof data === "string"){
  res.writeHead(code, {'Content-Type':'text/html'});
  res.end(data) 
  return
  }
  throw new Error('valid html string required')
  }

next()
}

export async function send(req,res,next){
    res.send = async (code=200, data='', headers={})=>{
       if(!code || typeof code !== "number" || !data ){
         logError(`\n res.send requires status code,data must have  👈, also can pass optional headers\n ${colors.blue("try some like <res.send(400,'bad request',{'content-type':'text/plain'})>")}`)
          res.end()//avoids infinite loop response
         return
       }
        const TYPE = 'content-type';
        const OSTREAM = 'application/octet-stream';
  
            let k, obj={};
            for (k in headers) {
                obj[k.toLowerCase()] = headers[k];
            }
        
            let type = obj[TYPE] || res.getHeader(TYPE);
        
            if (!!data && typeof data.pipe === 'function') {
                obj[TYPE] = type || OSTREAM;
                for (k in obj) {
                  res.setHeader(k, obj[k]);
                }
                return data.pipe(res);
            }
        
            if (data instanceof Buffer) {
                type = type || OSTREAM; // prefer given
            } else if (typeof data === 'object') {
                data = JSON.stringify(data);
                type = type || 'application/json;charset=utf-8';
            } else {
                data = data || STATUS_CODES[code];
            }
        
            obj[TYPE] = type || 'text/plain';
            obj['content-length'] = Buffer.byteLength(data);
        
            res.writeHead(code, obj);
            res.end(data);
        
    }
 next()
}
export function reqValidator(req,res,next){
    req.validate=(schema)=>{
       if(schema && schema.safeParse){
      let result = schema.safeParse(req.body);
      if (!result.success) {
        console.log(DEV)
        if(DEV === true){
         logError("request validator failed \n" + JSON.stringify(result.error.issues,null,2))
        }
        req.body={}
      } else {
  
        req.body=result.data
      }
       }else{
        logError(`\n req.validate requires valid zod schema 👈,\n ${colors.blue("try some like <req.validate(z.object({name:z.string()}))>")}`)
        req.body={}
       }
    }
    next()
}
export function resValidator(req,res,next){
    /**
     * 
     * @param {*} schema 
     * @param {*} data 
     * @returns 
     */
    res.validate=(schema,data)=>{
       if(schema && schema.safeParse && data){
      let result = schema.safeParse(data);
      if (!result.success) {
        logError("response validator failed \n" + JSON.stringify(result.error.issues,null,2))
         res.validated=null
      } else {
        res.validated=result.data
      }
       }else{
        logError(`\n res.validate requires valid zod schema and data to validate 👈,\n ${colors.blue("try some like <res.validate(z.object({name:z.string()}),{name:'fastee'}) and watch res.validated >")}`)
       }
    }
    next()
}

export function redirect(req,res,next){
  res.redirect= (code=302,url="")=>{
    res.statusCode = code;
    res.setHeader('Location', url);
    res.end();
  }
next()
}

export function stream(req,res,next){
  /**
   * 
   * @params data ,type
   */
  res.stream=(data,type)=>{
    if(!data){
      logError(`\n res.stream requires data 👈, also can pass optional content type\n ${colors.blue("try some like <res.stream('<h1>this html is streamed</h1>','text/html')>")}`)
      
      res.end()//avoids infinite loop response
     return
    }
    res.send(206,data,{"content-type":type})
  }
next()
}

export function ip(req,res,next){
  req.getip = ()=>{
     return Ip().get_ip(req,true) 
  }
  req.getTrustedIp=(proxies=[])=>{
    return Ip().get_trusted_ip(req,proxies,true)
  }
  req.isLoopbackIp=(ip)=>{
    return Ip().is_loopback_ip(ip)
  }
  req.isPrivateIp=(ip)=>{
    return Ip().is_private_ip(ip)
  }
  req.isValidIp=(ip)=>{
    return Ip().is_valid_ip(ip)
  }
  req.isValidIp6=(ip)=>{
    return Ip().is_valid_ipv6(ip)
  }
  next()
}