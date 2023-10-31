import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), '/output.mp4');

  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath);
    const fileStat = fs.statSync(filePath);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="output.mp4"`);
    res.setHeader('Content-Length', fileStat.size);

    fileStream.pipe(res);
  } else {
    res.status(404).send('File not found');
  }
}
