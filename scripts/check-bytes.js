const fs = require('fs');
const buf = fs.readFileSync('D:\\Campozy\\services\\housing-service.ts');
const start = 2200;
for (let i = start; i < start + 80; i++) {
  const hex = buf[i].toString(16).padStart(2, '0');
  const ch = (buf[i] >= 32 && buf[i] <= 126) ? String.fromCharCode(buf[i]) : '.';
  console.log(`${i}: 0x${hex} '${ch}'`);
}
