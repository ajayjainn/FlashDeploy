import express from 'express';
import dotenv from 'dotenv';
import expressHttpProxy from 'express-http-proxy';
import awsRouter from './routes/aws.js';
dotenv.config();
const app = express();
app.use(express.json());

const bucketName = process.env.AWS_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;

app.use('/aws', awsRouter);

const proxy = expressHttpProxy(`https://${bucketName}.s3.${AWS_REGION}.amazonaws.com`, {
  proxyReqPathResolver: function (req) {
    const path = req.url === '/' ? '/index.html' : req.url;
    return `/build/${req.headers.host.split('.')[0]}${path}`;
  }
});
app.use('/', proxy);

app.get('/test', (req, res) => {
  res.status(200).send('Hello World');
});



app.listen(5001, () => {
  console.log('Server is running on port 5001');
});

export default app;