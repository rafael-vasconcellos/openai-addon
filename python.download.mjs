import axios from 'axios';
import { Extract } from 'unzipper';
import fs from 'fs';



export async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);

  const response = await axios({
    url,
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}


export function unzipFile(zipPath, outputDir) {
  fs.createReadStream(zipPath)
    .pipe(Extract({ path: outputDir }))
    .on('close', () => {
      console.log('Arquivo descompactado com sucesso!');
    })
    .on('error', (err) => {
      console.error('Erro ao descompactar o arquivo:', err);
    });
}


