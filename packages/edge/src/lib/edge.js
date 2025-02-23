import { checktype} from './utils.js';
import { parse} from './regex.js';
import { LoadGlobalWares } from './middlewares.js';
import { EdgeRequest } from './request.js';
import EdgeResponse  from './response.js';
import {resolve} from "node:path";
import { totalist } from "totalist/sync";
import {send,viaCache,viaLocal,toHeaders} from "./sirv.js";
import { roomEvent,Room } from './room.js';

  export  function parser(req) {
    let url = req.url;
    if (url === void 0) return url;
  
    let obj = req._parsedUrl;
    if (obj && obj._raw === url) return obj;
  
    obj = {};
    obj.query = obj.search = null;
    obj.href = obj.path = obj.pathname = url;
  
    let idx = url.indexOf('?', 1);
    if (idx !== -1) {
      obj.search = url.substring(idx);
      obj.query = obj.search.substring(1);
      obj.pathname = url.substring(0, idx);
    }
  
    obj._raw = url;
  
    return (req._parsedUrl = obj);
  }

  function exec(path, result) {
    let i=0, out={};
    let matches = result.pattern.exec(path);
    while (i < result.keys.length) {
      out[ result.keys[i] ] = matches[++i] || null;
    }
    return out;
  }
  
  function lead(x) {
    return x.charCodeAt(0) === 47 ? x : ('/' + x);
  }
  
  function value(x) {
    let y = x.indexOf('/', 1);
    return y > 1 ? x.substring(0, y) : x;
  } 
  
  function mutate(str, req) {
   req.url.substring(str.length) || '/';
   req.path.substring(str.length) || '/';
  } 
  
  function verify(pattern,fn,method=""){
      if(!method || typeof method !== "string" || method.length === 0){
          throw new Error("method not valid,allowed are'*,POST,GET,PUT,PATCH,CONNECT,OPTIONS,DELETE,TRACE,HEAD'")
        }
      if(!pattern || typeof pattern !== "string" || pattern.length === 0){
        throw new Error("pattern not valid,try some like,'/' or '/users/:id' ")
      }
     
      if(!fn || checktype(fn)!== "function"){
          throw new Error("handler not valid,requires a handler")
      }
     // for(let fn of fns){
        if(typeof fn !== "function"){
          throw new Error("fn not function");
      }
     
    //}
    }
    function add_route_to_routes(instance,method,pattern,fn){
          let newroute = {
              method:method,
              pasedurl:parse(pattern),
              rawurl:pattern,
              fn
          }
          let filtered = instance.routes.find((r)=>r.rawurl === newroute.rawurl);
              if(filtered){
                      //exists
                 throw new Error("route already exist" + " " + newroute.rawurl)
              }else{
                      //add
                  instance.routes.push(newroute)
                  return instance.routes
              }
              
     
    }

    async function handleHandlerResponse(resp,request){

      //undefined
      if(!resp){
        throw new Error(`${new URL(request.url).pathname} handler requires response`);
      }
      //response
      if(resp instanceof Response){ 
        return resp
      }
      //object
      if(checktype(resp) === checktype({})){
        let {status,type,data,...rest}=resp;
        let status_code= Number(status) || 200;
        let others = rest || null;
        if(data && type && typeof type === "string"){
             switch(type){
               case "html":
                       //html
                if(/^/.test(data)){
                     let r = new EdgeResponse()
                     r.headers.append( "X-Content-Type-Options","nosniff")
                     r.html(data,status_code)
                     return r
                }
          //err
            throw new Error("handler received non html text")
             
                case "text":
                  //text
                  if(/^/.test(data)){
                    let r = new EdgeResponse()
                    r.headers.append( "X-Content-Type-Options","nosniff")
                    r.text(data,status_code)
                    return r
                  }
                  //err
                  throw new Error("handler received non text")
                  //json
                  case "json":
                    if(checktype(data) === checktype({})){
                      let r = new EdgeResponse()
                      r.headers.append( "X-Content-Type-Options","nosniff")
                      r.json(data,status_code)
                      
                      return r
                    }
                    //err
                    throw new Error("handler received non object")
                    //stream
                  case "stream":
                  
                    //json
                      if(checktype(data) === checktype({}) && !data.readable || !data.stream || !data.writer){
                        const response = new Response({
                          [Symbol.asyncIterator]: async function* () {
                          yield JSON.stringify(data);
                          },
                        },{
                          status:206,
                          ...rest

                        });
                        response.headers.append( "X-Content-Type-Options","nosniff")
                        return response;
                    }else{
                        //normal stream
                    //all text
                    if(typeof data === "string" || typeof data === "number"){
                        const response = new Response({
                        [Symbol.asyncIterator]: async function* () {
                          
                          yield data
                          
                        },
                        },{
                          status:status_code,
                          ...rest
                    
                        });
                        response.headers.append( "X-Content-Type-Options","nosniff")
                        return response;
                    

                      
                    }else{
                        const response = new Response(data,
                          {
                              status:206,
                              ...rest
                        
                          }
                        );
                        response.headers.append( "X-Content-Type-Options","nosniff")
                        return response;
                    }

                    }
                  default:
                    throw new Error("handler requires response")
             }
        }else{
          throw new Error("data and type properties required,try return {type:'text',data:'hello world'}")
        }
       
      }
    }

   
    /**
 * Fastee Edge class
 * @constructor
 * @param {object} opts - app options.
 * @returns {object}
 */
    export class Edge{
    
    
      constructor(opts={}){
      this.opts = opts;
      this.all = this.route.bind(this, '*');
      this.get = this.route.bind(this, 'GET');
      this.head = this.route.bind(this, 'HEAD');
      this.patch = this.route.bind(this, 'PATCH');
      this.options = this.route.bind(this, 'OPTIONS');
      this.connect = this.route.bind(this, 'CONNECT');
      this.delete = this.route.bind(this, 'DELETE');
      this.trace = this.route.bind(this, 'TRACE');
      this.post = this.route.bind(this, 'POST');
      this.put = this.route.bind(this, 'PUT');
      this.routes=[];
      this.wares=[];
      this.bwares=[];
      this.apps=[];
      this.parse=parser
      this.Room = Room
      /**
       * no match handler
       * @param {object} req 
       * @param {object} res 
       * @returns 
       */
      this.onNotFound = (req,res)=>{
        return new Response("404 Not Found",{status:404})
      }
      /**error handle
       * @param {Error} err 
       * @param {object} req 
       * @param {object} res 
       * @returns 
       */
      this.onError = (err,req,res)=>{
        return new Response("internal error",{status:500})
      }
        /**
           * fetch handler for server.
            * 
            * @param {object} request - The incoming request object.
            * @param {object} env - The environment object.
            * @param {object} ctx - The context object.
           */
      this.fetch= async (request={},env={},ctx={})=>{
        
         if(!request.url || typeof request.url !== "string" || request.url.length === 0 || !request.method || typeof request.method !== "string" || request.method.length === 0){
           throw new Error("valid request object required")
         }
         let req;
         let res = new EdgeResponse();
         try {
          
          let handler = this.find(request.method,new URL(request.url).pathname);
          req= new EdgeRequest(request);
         
          req.env=env;
          req.ctx=ctx;
           roomEvent.emit("req_main",req)
          if(handler)req.params=handler.params || {};
           //call global wares
       let ware= await LoadGlobalWares(this,req);
       if(ware instanceof Response){
        return  ware
       }
       //bwares
       for(let b of this.bwares){
        if(b.base === new URL(request.url).pathname.slice(0,b.base.length)){
          req.params = Object.fromEntries(new URL(request.url).searchParams);
        
          req.base=new URL(request.url).pathname.slice(b.base.length,Infinity)
          let bres= await b.fn(req,res);
          if(bres && bres instanceof Response)return bres
        }
      }

      
          //upgrade bun websocket
          
          if(env && env.upgrade){
            if (env.upgrade(request)){
              let re = new EdgeRequest(request);
              roomEvent.emit("req",re) 
              return
            }

            
          
            }//

         //deno ws
         if(globalThis.Deno){
          if (req.headers.get("upgrade") === "websocket") {
          const { socket, response } = Deno.upgradeWebSocket(request);
          let re = new EdgeRequest(request);
          roomEvent.emit("req",re) 
         
              //open
                setTimeout(()=>{
                  roomEvent.emit("ws",{ws:socket})
                },10)
              //message
              socket.addEventListener("message",(msg)=>{
                roomEvent.emit("message",msg)
              })
              //close 
              socket.addEventListener("close",(ev)=>{
                setTimeout(()=>{
                roomEvent.emit("on_close",{ws:socket})
                },10)
              })
              //error
              socket.addEventListener("error",(ev)=>{
                setTimeout(()=>roomEvent.emit("on_error",ev))
              })
  
          
          
          return response
         } }
          //cloudflare ws
          if(ctx){
            const upgradeHeader = request.headers.get('Upgrade');
            if (upgradeHeader || upgradeHeader === 'websocket') {
             
          
            const webSocketPair = new WebSocketPair();
            const [client, server] = Object.values(webSocketPair);
            let re = new EdgeRequest(request);
            roomEvent.emit("req",re) 
          server.accept()
      
            //open
            setTimeout(()=>{
            roomEvent.emit("ws",{ws:server})
            },10)
            //message
            server.addEventListener("message",(msg)=>{
              roomEvent.emit("message",msg)
            })
            //close
          server.addEventListener("close",(ev)=>{
              setTimeout(()=>{
              roomEvent.emit("on_close",{ws:server})
              },10)
            })
             //error
             server.addEventListener("error",(ev)=>{
              setTimeout(()=>roomEvent.emit("on_error",ev))
            })
        

          
            return new Response(null, {
              status: 101,
              webSocket: client,
            });
          }
          }
    
      //call route handler
        if(handler){ 
         

      
          let resp = await handler.fn(req, res);
          //handle response
          return await handleHandlerResponse(resp,req); 
        
        }else{
          //not found
          return this.onNotFound(req,res)
        }
      
        
    
         
         } catch (error) {
          return this.onError(error,req,res)
         }
      
        };
  
  
  return this
  }
  /**
   * 
   * @param {string} method - http methods
   * @param {string} pattern - url pattern eg "/","api/:id"
   * @param {function} fn  - handler function return response
   * @returns {object}
   */
  route(method="", pattern="", fn) {
    verify(pattern,fn,method);
    if(this.routed && this.routed.base){
    
      if(this.routed.base.endsWith("/") && pattern.startsWith("/")){
          pattern = this.routed.base+pattern.replace("/","").trim();
        
      }else if(!this.routed.base.endsWith("/") && pattern.startsWith("/")){
        pattern = this.routed.base+"/"+pattern.replace("/","").trim();
        
      }
      else if(!this.routed.base.endsWith("/") && !pattern.startsWith("/")){
        pattern = this.routed.base+"/"+pattern.trim();
        
      }
    }else{
      //not router use
      if(pattern.startsWith("/")){
        pattern = pattern.trim();
      
    }else if(!pattern.startsWith("/")){
      pattern = "/"+pattern.trim();
      
    }
   
    }
     this.routes = add_route_to_routes(this,method.toUpperCase().trim(),pattern.trim(),fn);
  
    return this;
  }
  /**
   * find route
   * @param {string} method 
   * @param {string} path 
   * @returns 
   */
  find(method="",path="") {
    let handlers=this.routes;
    let handler;
    let l = handlers.length;
      for (var i = 0; i < l; i++) {
       let h = this.routes[i];
       if(h.pasedurl.pattern.test(path) && h.method === method)
        handler=h;
      }
      if(handler){
        handler.params=exec(path,handler.pasedurl)
        return handler
      }
  } 
  /**
   * 
   * @param {string | function} base - route path or a function.
   * @param  {Function} fns -function handlers for middleware.
   * 
   */
  use(base, ...fns) {
    if (typeof base === 'function') {
      this.wares = this.wares.concat(base, fns);
    } else if (base === '/') {
      this.wares = this.wares.concat(fns);
    } else {
      base = lead(base);
      
      fns.forEach(fn => {
        if (fn instanceof Edge) {
          this.routed = {
            base,
          };
          this.apps.push({base,fns:fn});
        } else {
        
          this.bwares.push({base,fn}); 
        
        }
      });
    }
    return this; // chainable 
  }
   /**
   * Router - split funtionality
   * @param {string} base -base route
   * @example let api = app.Router("/api");
   * api.get("/",async(req,res)=>{
   * return res.json({msg:"test api"})
   * })
   * export default api
   * @returns {Edge}
   */
  Router(base){
    if(!base || base.length === 0 || typeof base !== "string")throw new Error("Router requires valid path");
    
    return this.use(base,this)
  }
  /**
   * serve static folder
   * @param {string} folder -folder to serve, default .
   * @param {object} opts - options
   */
  #Servestatic(dir,opts){
    
    dir = resolve(dir || ".");
    
      let isNotFound = opts.onNoMatch || this.onNotFound;
      let setHeaders = opts.setHeaders || false;
    
      let extensions = opts.extensions || ["html", "htm"];
      let gzips = opts.gzip && extensions.map(x => `${x}.gz`).concat("gz");
      let brots = opts.brotli && extensions.map(x => `${x}.br`).concat("br");
    
      /** @type {import('../sirv').SirvFiles} */
      const FILES = {};
    
      // let fallback = '/';
      let isEtag = !!opts.etag;
      // let isSPA = !!opts.single;
    
      // if (typeof opts.single === 'string') {
      //     let idx = opts.single.lastIndexOf('.');
      //     fallback += !!~idx ? opts.single.substring(0, idx) : opts.single;
      // }
    
      let ignores = [];
      if (opts.ignores !== false) {
        ignores.push(/[/]([A-Za-z\s\d~$._-]+\.\w+){1,}$/); // any extn
        if (opts.dotfiles) ignores.push(/\/\.\w/);
        else ignores.push(/\/\.well-known/);
        [].concat(opts.ignores || []).forEach(x => {
          ignores.push(new RegExp(x, "i"));
        });
      }
    
      let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
      if (cc && opts.immutable) cc += ",immutable";
      else if (cc && opts.maxAge === 0) cc += ",must-revalidate";
    
      if (!opts.dev) {
        totalist(dir, (name, abs, stats) => {
          if (/\.well-known[\\+\/]/.test(name)) {
          } // keep
          else if (!opts.dotfiles && /(^\.|[\\+|\/+]\.)/.test(name)) return;
    
          let headers = toHeaders(name, stats, isEtag);
          if (cc) headers.set("Cache-Control", cc);
    
          FILES["/" + name.normalize().replace(/\\+/g, "/")] = { abs, stats, headers };
        });
      }
    
      /**
       * @callback lookup
       * @return { import('../sirv').SirvData }
       */
      /**@type {lookup} */
      let lookup = opts.dev ? viaLocal.bind(0, dir, isEtag) : viaCache.bind(0, FILES);
    
      /**
       * @param {Request} req
       */
      return function (req) {
        let extns = [""];
        let pathname;
        if(req.base){
          pathname= req.base
        }else{
         pathname= new URL(req.url).pathname;
        }
   
        let val = req.headers.get("accept-encoding") || "";
        if (gzips && val.includes("gzip")) extns.unshift(...gzips);
        if (brots && /(br|brotli)/i.test(val)) extns.unshift(...brots);
        extns.push(...extensions); // [...br, ...gz, orig, ...exts]
    
        if (pathname.indexOf("%") !== -1) {
          try {
            pathname = decodeURIComponent(pathname);
          } catch (err) {
            /* malform uri */
          }
        }
    
        // tmp = lookup(pathname, extns)
        // if (!tmp) {
        //     if (isSPA && !isMatch(pathname, ignores)) {
        //         tmp = lookup(fallback, extns)
        //     }
        // }
        let data = lookup(pathname, extns);
        //  || isSPA && !isMatch(pathname, ignores) && lookup(fallback, extns);
    
        if (!data) return isNotFound(req);
    
        if (isEtag && req.headers.get("if-none-match") === data.headers.get("ETag")) {
          return new Response(null, { status: 304 });
        }
    
        data = {
          ...data,
          // clone a new headers to prevent the cached one getting modified
          headers: new Headers(data.headers),
        };
    
        if (gzips || brots) {
          data.headers.append("Vary", "Accept-Encoding");
        }
    
        if (setHeaders) {
          data.headers = setHeaders(data.headers, pathname, data.stats);
        }
        return send(req, data);
      };
  }
  /**
   * serve static folder (works on bun and deno only )
   * @param {string} path -path to append folder,optional.
   * @param {string} folder -folder to serve, default ,must.
   * 
   * @param {object} [opts?] - options ,must i.e {  
  etag: true, 
  gzip: true,  
  brotli: true,  

}
   */
 useStatic(path,folder,opts){
 
  if(typeof path === "string" && typeof folder === "string" && opts && checktype(opts) === checktype({})){
    if(path.length === 0 || folder.length === 0 )throw new Error("path and folder must not be empty")
    //bware like
      path=path.trim()
      this.use(path,this.#Servestatic(folder,opts))

  }else if(typeof path === "string" && checktype(folder) === checktype({})){
    if(path.length === 0)throw new Error("folder must not be empty")
    //only path and folder
      //global ware
     this.use(this.#Servestatic(path,folder))
  }
 }
 websocket={
 
    message(ws, message) {
      roomEvent.emit("message",message)
    }, // a message is received
    open(ws) {
    setTimeout(()=>{
      roomEvent.emit("ws",{ws})
    },1)
    
    },
    close(ws, code, message) {
      setTimeout(()=>{
      roomEvent.emit("on_close",ws)
      },2)
    }, // a socket is closed
   
 

}
/**
 * listener for incoming websocket
 * @param {Function} cb - callback
 */
onWebsocket(cb){
  if(!cb || typeof cb !== "function")throw new  Error("cb required")
     roomEvent.on("on_ws",cb)    
}
/**
 * listener for incoming request;
 * @param {Function} cb - callback
 */
onRequest(cb){
  if(!cb || typeof cb !== "function")throw new  Error("cb required")
     roomEvent.on("req",(req)=>{
    cb(req)
    })    
    roomEvent.on("req_main",(req)=>{
      cb(req)
      }) 
}
  }
 


export default Edge