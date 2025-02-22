import EdgeResponse from "./response.js";
export async function LoadGlobalWares(instance,request){
   request.params = Object.fromEntries(new URL(request.url).searchParams);
        
  let wares=instance.wares;
  let l =wares.length;
  let i =0;
   while(i<l){
      let fn = wares[i++]
      let resp = await fn(request,new EdgeResponse);
       if(resp && resp instanceof Response){
          //response
          return resp
        }
   }

}
