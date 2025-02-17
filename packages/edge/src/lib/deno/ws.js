export function upgradeDenoWs(req){
    if (req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 501 });
      }
    
      const { socket, response } = Deno.upgradeWebSocket(req);
      return {res:response,ws:socket};
}