/*! MIT © Luke Edwards https://github.com/lukeed/sirv/blob/master/packages/sirv/index.js */
import { existsSync, statSync, Stats,createReadStream,openSync,readFileSync } from "node:fs";
import { join, normalize, resolve } from "node:path";
import { mimes, lookup as getExt } from "mrmime";
import { totalist } from "totalist/sync";
import exmimes from "./mime.js";

// function isMatch(uri, arr) {
//     for (let i = 0; i < arr.length; i++) {
//         if (arr[i].test(uri)) return true;
//     }
// }

export function toAssume(uri, extns) {
  let i = 0,
    x,
    len = uri.length - 1;
  if (uri.charCodeAt(len) === 47) {
    uri = uri.substring(0, len);
  }

  let arr = [],
    tmp = `${uri}/index`;
  for (; i < extns.length; i++) {
    x = extns[i] ? `.${extns[i]}` : "";
    if (uri) arr.push(uri + x);
    arr.push(tmp + x);
  }

  return arr;
}

export function viaCache(cache, uri, extns) {
  let i = 0,
    data,
    arr = toAssume(uri, extns);
  for (; i < arr.length; i++) {
    if ((data = cache[arr[i]])) return data;
  }
}

export function viaLocal(dir, isEtag, uri, extns) {
  let i = 0,
    arr = toAssume(uri, extns);
  let abs, stats, name, headers;
  for (; i < arr.length; i++) {
    abs = normalize(join(dir, (name = arr[i])));
    if (abs.startsWith(dir) && existsSync(abs)) {
      stats = statSync(abs);
      if (stats.isDirectory()) continue;
      headers = toHeaders(name, stats, isEtag);
      headers.set("Cache-Control", isEtag ? "no-cache" : "no-store");
      return { abs, stats, headers };
    }
  }
}


/**
 *
 * @param {Request} req
 * @param {import('../sirv').SirvData} data
 */
export async function send(req, data) {
  let code = 200,
    opts = {};

  if (req.headers.has("range")) {
    code = 206;
    let [x, y] = req.headers.get("range").replace("bytes=", "").split("-");
    let end = (opts.end = parseInt(y, 10) || data.stats.size - 1);
    let start = (opts.start = parseInt(x, 10) || 0);

    if (start >= data.stats.size || end >= data.stats.size) {
      data.headers.set("Content-Range", `bytes */${data.stats.size}`);
      return new Response(null, {
        headers: data.headers,
        status: 416,
      });
    }

    data.headers.set("Content-Range", `bytes ${start}-${end}/${data.stats.size}`);
    data.headers.set("Content-Length", end - start + 1);
    data.headers.set("Accept-Ranges", "bytes");
    opts.range = true;
  }

  if (opts.range) {
    //bun
    if(globalThis.Bun){

    
    return new Response(Bun.file(data.abs).slice(opts.start, opts.end + 1), {
      headers: data.headers,
      status: code,
    });
  }
   //deno
   if(globalThis.Deno){
      let res;
       
  const num_blocks = 100;
  const block_size = 16_384;
  const chunk_size = block_size * num_blocks;
  const file = await Deno.open(data.abs, { read: true });
  if (opts.start > 0) {
    await file.seek(opts.start, Deno.SeekMode.Start);
  }

  let read_blocks = num_blocks; 
  let read_bytes = 0;

  const stream = new ReadableStream({
    start(){
     
    },
    async pull(controller) {
      const chunk = new Uint8Array(block_size);
      try {
        const read = await file.read(chunk);
     
        if (read !== null && read > 0) {
          controller.enqueue(chunk.subarray(0, read));
          read_bytes += read;
        }

        read_blocks--;
        if (read_blocks === 0) {
          controller.close();
          file.close();
        }
      } catch (e) {
   
        file.close();
      }
    },

    cancel(reason){
   
      file.close();
    }
  });
     res = new Response(stream,{
      headers: data.headers, 
      status: code, 
    });

      return res
   }//
  
  }else{
    //not range
      //bun
      if(globalThis.Bun){
        let res = new Response(Bun.file(data.abs),{
          headers: data.headers,
          status: code,
        });
      
       
        return res
      }
      //normal
          let res = new Response(readFileSync(data.abs),{
            headers: data.headers,
            status: code,
          });
        
         
          return res
     
  
  }


}

const ENCODING = {
  ".br": "br",
  ".gz": "gzip",
};
/**
 *
 * @param {string} name
 * @param {Stats} stats
 * @param {boolean} isEtag
 */
export function toHeaders(name, stats, isEtag) {
  let enc = ENCODING[name.slice(-3)];

  let ctype = getExt(name.slice(0, enc && -3)) || "";
  if (ctype === "text/html") ctype += ";charset=utf-8";

  let headers = new Headers({
    "Content-Length": stats.size,
    "Content-Type": ctype,
    "Last-Modified": stats.mtime.toUTCString(),
  });

  if (enc) headers.set("Content-Encoding", enc);

  if (isEtag) headers.set("ETag", `W/"${stats.size}-${stats.mtime.getTime()}"`);

  return headers;
}

for (const mime in exmimes) {
  mimes[mime] = exmimes[mime];
}

/**
 * @param {import("../sirv").Options} opts
 * @param {string} dir
 * @return {import('../sirv').RequestHandler}
 */
