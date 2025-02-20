import EventEmitter from "eventemitter3";
import { checktype ,genUuid} from "./utils.js";

export const roomEvent = new EventEmitter();

let rooms =[];

function lead(x) {
  return x.charCodeAt(0) === 47 ? x : ('/' + x);
}


/**
 * edge room for realtime.
 * @class
 * @constructor
 * @param {string} room - room name.
 */
export class Room{
    #req
    #room
    /**
     * 
     * @param {string} room 
     */
    constructor(room){
      if(!room || typeof room !== "string" || room.length === 0)throw new Error("room name required")
      
        let found = rooms.find(r=> r.name === room);
        if(found)throw new Error(` ${room} room exists`);
      
        rooms.push({name:lead(room)})
        this.#room = room;
        this.clients=new Set();

      //req
      roomEvent.on("req",req=>{
        this.#req =req;
        this.params = req._parsedUrl.searchParams;
      })
      //init
      roomEvent.on("ws",(data)=>{
        let {ws} = data;
           //room check logic
          
       if(this.#req.pathName === this.roomName){ 
        
        //initials
      let id = genUuid(16);
      this.id=id;
      ws.id=this.id;
        ws.room=this.roomName;
   
         //add clients
         this.clients.add(ws)
         this.ws=ws
         roomEvent.emit("on_ws",this.ws)
      return
       }
        

       
    })
    //close
    roomEvent.on("on_close",async (ws)=>{
   
      
      this.clients.delete(ws)
       roomEvent.emit("closed",this)
    })
    }
   get count(){
    return this.clients.size;
   }
   get roomName(){
     return this.#room;
   }
    /**
     * event emitter to socket
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
     * event listener for socket
     * @param {string} ev -event to listen.
     * 
     * @param {Function} cb  callback
     */
     on(ev,cb){
      if(!ev || typeof ev !== "string" || ev.length === 0 || !cb || typeof cb !== "function")throw new  Error("valid options required")
        roomEvent.on("message",async (msg)=>{
         
         try {
           this.event=ev;
          const {data,event} = JSON.parse(msg.data||msg);
          if(data && event){
            if(event === ev){

              this.data=JSON.parse(msg.data).data || JSON.parse(msg).data;
              cb(
                this
             ) 
            return
            }
           
          }
          this.data=msg.data || msg,
          cb(this)
         

         } catch (error) {
          this.data=msg.data || msg;
            cb(this)
           }
         
        
         
      })
     }
      /**
     * broadcast all and self
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
     * broadcast to all sockets in the room
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
       * broadcast to socket id.
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
     * broadcast to socket ids.
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
        cb(this.id) 

      })
    }
     /**
     * run socket events when disconnected.
     * @param {Function} cb 
     */
     onDisconnected(cb){
      if(!cb || typeof cb !== "function")throw new Error("onDisconnected cb required");
      roomEvent.on("closed",async (ws)=>{
        cb(ws.id)
      })
    }
}

