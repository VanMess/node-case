import http from 'http';
import fs from 'fs';

const boundary = "gc0p4Jq0M2Yt08jU534c0p";

function run() {
  let buff = new Buffer(0);
  const req = http.request('http://localhost:4000/video', (res) => {
    res.on('data', (buf) => {
      buff = Buffer.concat([buff, buf]);
      emitParts(buff);
    });
    res.on('end', () => {
      console.log(`Request stop with: ${res.statusCode}`);
    });
  });
  req.end();
}

run();

function emitParts(buff) {
  const boundaryBuffer = new Buffer(boundary);
  const idx = buff.indexOf(boundaryBuffer);

  if (idx === -1) {
    return;
  }

  emitPart(buff.slice(0, idx));
  buff = buff.slice(idx + boundaryBuffer.length);

  emitParts(buff);
}

function emitPart(buf) {
  if (buf.length === 0) {
    return;
  }

  const idx = buf.indexOf('\r\n\r\n');

  if (idx === -1) {
    return;
  }

  const slice = buf.slice(idx + 4);

  fs.writeFileSync(`${Date.now()}.jpg`, slice);
}
