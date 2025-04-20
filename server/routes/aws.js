import express from 'express';
import dotenv from 'dotenv';
import {
  ECSClient,
  RunTaskCommand,
  DescribeTasksCommand,
  waitUntilTasksStopped
} from "@aws-sdk/client-ecs";
import uniqueSlug from 'unique-slug';
import Project from '../models/Project.js';
dotenv.config();

const client = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const router = express.Router();

router.post('/project', async (req, res, next) => {
  try {
    // 1. Check for existing slug
    if (req.body.slug) {
      const existing = await Project.findOne({ slug: req.body.slug });
      if (existing) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }
    const domainWithoutProtocol = process.env.DOMAIN.replace('https://', '').replace('http://', '');

    // 2. Create the Project doc in "Deploying" state
    const slug = req.body.slug || uniqueSlug();
    const gitHubUrl = req.body.gitHubUrl;
    const name = gitHubUrl.split('/').pop().split('.')[0];
    const newProj = await Project.create({
      slug,
      name,
      repository: gitHubUrl,
      owner: req.user.id,
      status: 'Deploying',
      deployedUrl: `https://${slug}.${domainWithoutProtocol}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Run the ECS task
    const { tasks } = await client.send(new RunTaskCommand({
      cluster: 'builder-server',
      taskDefinition: 'builder-task',
      launchType: 'FARGATE',
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [
            "subnet-0664beb8ba06e758b",
            "subnet-0795b34dcfc38408a",
            "subnet-0f64545dc0835cfc1"
          ],
          assignPublicIp: 'ENABLED',
          securityGroups: ['sg-0e18b18a3c90cf13a']
        }
      },
      overrides: {
        containerOverrides: [{
          name: 'builder-image',
          environment: [
            { name: 'REPO_URL', value: gitHubUrl },
            { name: 'PROJECT_SLUG', value: slug },
            { name: 'AWS_REGION', value: process.env.AWS_REGION },
            { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
            { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },
            { name: 'AWS_BUCKET_NAME', value: process.env.AWS_BUCKET_NAME },
            { name: 'GITHUB_TOKEN', value: req.user.accessToken },
          ]
        }]
      }
    }));

    // Grab the task ARN
    const taskArn = tasks?.[0]?.taskArn;
    if (!taskArn) {
      throw new Error('Failed to start ECS task');
    }

    // 4. Immediately respond so the client isn’t waiting on the build
    res.status(202).json({
      status: 'Deploying',
      url: newProj.deployedUrl
    });

    // 5. In the background: wait for the task to STOP, then describe it
    (async () => {
      try {
        // waitUntilTasksStopped polls until the task stops (or times out after ~10 min)
        await waitUntilTasksStopped(
          { client, maxWaitTime: 600 },      // maxWaitTime is in seconds
          { cluster: 'builder-server', tasks: [taskArn] }
        );

        // Once stopped, fetch its final status
        const { tasks: [finishedTask] } = await client.send(new DescribeTasksCommand({
          cluster: 'builder-server',
          tasks: [taskArn]
        }));

        const container = finishedTask.containers.find(c => c.name === 'builder-image');
        const exitCode = container.exitCode;
        const reason = container.reason || '';
        console.log('status', exitCode);
        if (exitCode === 0) {
          // mark as Deployed
          await Project.findOneAndUpdate(
            { slug },
            { status: 'Deployed', updatedAt: new Date() }
          );
        } else {
          // mark as Failed, record reason
          await Project.findOneAndUpdate(
            { slug },
            {
              status: 'Failed',
              error: reason || `Exit code ${exitCode}`,
              updatedAt: new Date()
            }
          );
        }
      } catch (bgErr) {
        console.log(bgErr, 'bgErr');
        console.error('Error monitoring ECS task:', bgErr);
        // optional: mark project 'Error'
        await Project.findOneAndUpdate(
          { slug },
          { status: 'Error', error: bgErr.message, updatedAt: new Date() }
        );
      }
    })();

  } catch (err) {
    next(err);
  }
});

router.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

export default router;
