import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Replace 'your_file_path' with the actual path to the file you want to download
  const filePath = path.join(process.cwd(), '/output.mp4');
  const fileStream = fs.createReadStream(filePath);
  const fileStat = fs.statSync(filePath);

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="output.mp4"`);
  res.setHeader('Content-Length', fileStat.size);

  fileStream.pipe(res);
}