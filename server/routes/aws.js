import express from 'express';
import dotenv from 'dotenv';
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import uniqueSlug from 'unique-slug';

dotenv.config();

const client = new ECSClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


const router = express.Router();

router.post('/project', async (req, res) => {
  const slug = uniqueSlug();  
  const gitHubUrl = req.body.gitHubUrl;
  
  const command = new RunTaskCommand({
    cluster: 'builder-server',
    taskDefinition: 'builder-task',
    launchType:'FARGATE',
    count:1,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [
          "subnet-0664beb8ba06e758b",
          "subnet-0795b34dcfc38408a",
          "subnet-0f64545dc0835cfc1"
        ],
        assignPublicIp:'ENABLED',
        securityGroups: ['sg-0e18b18a3c90cf13a']
      }
    },
    overrides: {
      containerOverrides: [
        {
          name: 'builder-image',
          environment: [
            {
              name: 'REPO_URL',
              value: gitHubUrl
            },
            {
              name: 'PROJECT_SLUG',
              value: slug
            },
            {
              name: 'AWS_REGION',
              value: process.env.AWS_REGION
            },
            {
              name: 'AWS_ACCESS_KEY_ID',
              value: process.env.AWS_ACCESS_KEY_ID
            },
            {
              name: 'AWS_SECRET_ACCESS_KEY',
              value: process.env.AWS_SECRET_ACCESS_KEY
            },
            {
              name: 'AWS_BUCKET_NAME',
              value: process.env.AWS_BUCKET_NAME
            }
          ]
        }
      ]
    }
  });
  await client.send(command);
  res.json({
    'Status': `https://${slug}.${process.env.DOMAIN}`,
  })
});

router.get('/', (req, res) => {
    res.status(200).send('Hello World');
});

export default router;