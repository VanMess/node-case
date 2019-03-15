import cv from "opencv";
import { promisfy } from "promisfy";
import { Readable } from "stream";
import fs from "fs";
import http from "http";

const boundary = "gc0p4Jq0M2Yt08jU534c0p";

class VideoStream extends Readable {
  constructor(opt) {
    super(opt);
    this._vid = opt.vid;
  }
  async _read() {
    const vid = this._vid;
    const read = promisfy(vid.read, vid);
    const frame = await read();
    const buffer = Buffer.concat([
      new Buffer(`--${boundary}\r\n`),
      new Buffer("Content-Type: image/jpeg\r\n\r\n")
    ]);
    const result = Buffer.concat([buffer, frame.toBuffer()]);
    this.push(result);
  }
}

http
  .createServer((req, res) => {
    switch (req.url) {
      case '/video':
        res.writeHead(200, {
          "Content-Type": `multipart/x-mixed-replace; boundary="${boundary}"`
        });
        const vid = new cv.VideoCapture(0);
        const stream = new VideoStream({ vid });
        stream.pipe(res);
        break;
      default:
        res.statusCode = 404;
        res.end('url not found');
        break;
    }
  })
  .listen(4000);
