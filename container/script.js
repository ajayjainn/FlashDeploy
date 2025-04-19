import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { lookup } from 'mime-types';
import { fileURLToPath } from 'url';

// Get the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const repoUrl = process.env.REPO_URL;
const projectId = process.env.PROJECT_ID;
const projectSlug = process.env.PROJECT_SLUG;

// Helper function to execute a command and return a promise
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command} ${args.join(' ')}`);
    const childProcess = spawn(command, args, options);
    
    childProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    childProcess.stderr.on('data', (error) => {
      const errorMessage = error.toString();
      if(!errorMessage.includes("Cloning into")){
        console.error(`${command} stderr:`, errorMessage);
      }
    });
    
    childProcess.on('close', (code) => {
      console.log(`${command} process exited with code: ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
      }
    });
    
    childProcess.on('error', (err) => {
      console.error(`Failed to start ${command}:`, err);
      reject(err);
    });
  });
}

async function main() {
  console.log('Script started');
  const outDir = path.resolve(__dirname, 'output');

  try {
    // Sequential execution of commands
    await executeCommand('git', ['clone', repoUrl, outDir]);
    await executeCommand('npm', ['install'], {cwd: outDir});
    await executeCommand('npm', ['run', 'build'], {cwd: outDir});
    
    const packageJson = JSON.parse(fs.readFileSync(path.resolve(outDir, 'package.json'), 'utf8'));
    const buildScript = packageJson.scripts.build;
    const projectType = buildScript.includes('vite') ? 'vite' : 'react';
    const buildDir = projectType === 'vite' ? path.resolve(outDir, 'dist') : path.resolve(outDir, 'build');
    
    console.log('Uploading build files to S3...');
    
    // Function to recursively get all files from a directory
    function getAllFiles(dir, fileList = []) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fileList = getAllFiles(filePath, fileList);
        } else {
          fileList.push(filePath);
        }
      });
      
      return fileList;
    }
    
    const allBuildFiles = getAllFiles(buildDir);
    
    const uploadPromises = allBuildFiles.map(async (filePath) => {
      // Get the relative path from the build directory for the S3 key
      const relativePath = path.relative(buildDir, filePath);
      console.log(`Uploading ${relativePath} to S3...`);
      
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `build/${projectSlug}/${relativePath.replace(/\\/g, '/')}`,
        Body: fs.createReadStream(filePath),
        ContentType: lookup(filePath) || 'application/octet-stream',
      });
      
      return s3Client.send(command);
    });

    await Promise.all(uploadPromises);
    console.log('Build upload completed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();