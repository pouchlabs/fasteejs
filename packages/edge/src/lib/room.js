import EventEmitter from "eventemitter3";
import { checktype ,genUuid} from "./utils.js";

export const roomEvent = new EventEmitter();

/**
 * edge room for realtime.
 * @class
 * @constructor
 */
export class Room{
    #req
    constructor(path){
      this.clients=new Set();

      //req
      roomEvent.on("req",req=>{
        this.#req =req
      })
      //init
      roomEvent.on("ws",(data)=>{
        let {ws} = data;
        if(ws)this.ws = ws;
        //initials
        let id = genUuid(16);

        this.ws.id=id;
        ws.id=id;
        
        //add clients
        this.clients.add(ws)

        roomEvent.emit("on_ws",ws)
    })
    }
   
    /**
     * 
     * @param {string} event -event to emit.
     * @param {*} data -data to send
     * @param {Function} cb  callback
     */
    emit(event,data,cb){
        if(!event || typeof event !== "string" || event.length === 0 || !data || !cb || typeof cb !== "function")throw new  Error("valid options required")
         roomEvent.on("on_ws",async (ws)=>{
        this.ws=ws;
        this.id=this.ws.id;
          if(checktype(data) === checktype({})){
          if( this.ws.readyState === 1){
           
            this.ws.send(JSON.stringify(data));
            this.success = true;
            this.data = data
            cb(this)
          
          }else{
          
            this.success = false;
            this.data = data
            cb(this)
          }
          return
        }//not json
        if( this.ws.readyState === 1){
          
          this.ws.send(data);
          this.success = true;
          this.data = data
          cb(this)
        
        }else{
          this.success = false;
          this.data = data
          cb(this)
        }
      })
        
    }
     /**
     * 
     * @param {string} ev -event to listen.
     * 
     * @param {Function} cb  callback
     */
     on(ev,cb){
      if(!ev || typeof ev !== "string" || ev.length === 0 || !cb || typeof cb !== "function")throw new  Error("valid options required")
        roomEvent.on("message",async (msg)=>{
          this.id=this.ws.id;
         try {
          
          const {data,event} = JSON.parse(msg);
          if(data && event){
            if(event === ev){
              this.data=msg,
              cb(
                this
             ) 
            return
            }
           
          }
          this.data=msg,
          cb(this)
         

         } catch (error) {
          this.data=msg;
            cb(this)
           }
         
        
         
      })
     }
      /**
     * 
     * @param {string} event -event to emit.
     * @param {*} data -data to send
     * @param {Function} cb  callback
     */
    broadcast(event,data,cb){
      if(!event || typeof event !== "string" || event.length === 0 || !data || !cb || typeof cb !== "function")throw new  Error("valid options required")
       roomEvent.on("on_ws",async (ws)=>{
      this.ws=ws;
      this.id=this.ws.id;
        if(checktype(data) === checktype({})){
        if( this.ws.readyState === 1){
         
          this.clients.forEach(w=>{
            
            w.send(JSON.stringify(data));
          })
          this.success = true;
          this.data = data
          cb(this)
        
        }else{
           
          this.success = false;
          this.data = data
          cb(this)
        }
        return
      }//not json
      if( this.ws.readyState === 1){
        
        this.clients.forEach(w=>{
            
          w.send(data);
        })
        this.success = true;
        this.data = data
        cb(this)
      
      }else{
        this.success = false;
        this.data = data
        cb(this)
      }
    })
      
  }
      /**
     * 
     * @param {string} event -event to emit.
     * @param {*} data -data to send
     * @param {Function} cb  callback
     */
      broadcastAll(event,data,cb){
        if(!event || typeof event !== "string" || event.length === 0 || !data || !cb || typeof cb !== "function")throw new  Error("valid options required")
         roomEvent.on("on_ws",async (ws)=>{
        this.ws=ws;
        this.id=this.ws.id;
          if(checktype(data) === checktype({})){
          if( this.ws.readyState === 1){
           
            this.clients.forEach(w=>{
               if(w !== ws){
              w.send(JSON.stringify(data));
               }
            })
            this.success = true;
            this.data = data
            cb(this)
          
          }else{
             
            this.success = false;
            this.data = data
            cb(this)
          }
          return
        }//not json
        if( this.ws.readyState === 1){
          
          this.clients.forEach(w=>{
            if(w !== ws){
            w.send(data);
            }
          })
          this.success = true;
          this.data = data
          cb(this)
        
        }else{
          this.success = false;
          this.data = data
          cb(this)
        }
      })
        
    }
      /**
     * @param {string} id - id to broadcast to.
     * @param {string} event -event to emit.
     * @param {*} data -data to send
     * @param {Function} cb  callback
     */
      broadcastTo(id,event,data,cb){
        if(!id || typeof id !== "string" || id.length ===0 || !event || typeof event !== "string" || event.length === 0 || !data || !cb || typeof cb !== "function")throw new  Error("valid options required")
         roomEvent.on("on_ws",async (ws)=>{
        this.ws=ws;
        this.id=this.ws.id;
          if(checktype(data) === checktype({})){
          if( this.ws.readyState === 1){
           
            this.clients.forEach(w=>{
               if(w.id === id){
              ws.send(JSON.stringify(data));
               }
            })
            this.success = true;
            this.data = data
            cb(this)
          
          }else{
             
            this.success = false;
            this.data = data
            cb(this)
          }
          return
        }//not json
        if( this.ws.readyState === 1){
          
          this.clients.forEach(w=>{
            if(w.id === id){
            w.send(data);
            }
          })
          this.success = true;
          this.data = data
          cb(this)
        
        }else{
          this.success = false;
          this.data = data
          cb(this)
        }
      })
        
    }
    /**
     * @param {string[]} [ids=[""]] 
     * @param {string} event 
     * @param {*} data 
     * @param {*} cb 
     */
    broadcastToIds(ids=[""],event,data,cb){
      if(!ids || checktype(ids) !== checktype([""]) || ids.length === 0 || !event || typeof event !== "string" || event.length === 0 || !data || !cb || typeof cb !== "function")throw new  Error("valid options required")
        roomEvent.on("on_ws",async (ws)=>{
           for(let id of ids){
             this.broadcastTo(id,event,data,cb)
           }
        })
       
    }
    /**
     * run socket events when connected
     * @param {Function} cb 
     */
    onConnected(cb){
      if(!cb || typeof cb !== "function")throw new Error("onconnected cb required");
      roomEvent.on("on_ws",async (ws)=>{
        this.ws=ws;
        this.id=this.ws.id;
        if(ws.readyState === 1){
          this.ready = true;
          
        }else{
          this.ready = false
        }
        cb(this)

      })
    }
     /**
     * run socket events when disconnected.
     * @param {Function} cb 
     */
     onDisconnected(cb){
      if(!cb || typeof cb !== "function")throw new Error("onDisconnected cb required");
      roomEvent.on("on_close",async (ws)=>{
        this.ws=ws;
        this.id=this.ws.id;
        if(ws.readyState === 1){
          this.ready = true;
          
        }else{
          this.ready = false
        }
        
        this.clients.delete(this.ws)
        cb(this)
      })
    }
}

