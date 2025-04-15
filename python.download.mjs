import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import axios from 'axios';
import { Extract } from 'unzipper';



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

export async function downloadPython({ pythonURL, distDir } = {}) { 
    distDir ||= "./dist/openai/"
    pythonURL ||= 'https://www.python.org/ftp/python/3.8.10/python-3.8.10-embed-amd64.zip'
    const zipFileName = pythonURL.split('/')[ pythonURL.split('/').length - 1 ]
    const outputDirPath = path.resolve('./python');
    const outputZipPath = path.resolve('./python', zipFileName);
    if (!fs.existsSync(outputZipPath)) { 
        if (!fs.existsSync(outputDirPath)) {  fs.mkdirSync(outputDirPath); }
        await downloadFile(pythonURL, outputZipPath); 
    }
    unzipFile(outputZipPath, path.resolve(distDir, 'lib', 'python'));
}


if (import.meta.url === pathToFileURL(process.argv[1]).href) { downloadPython() }