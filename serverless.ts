import type { AWS } from '@serverless/typescript';

const getPathHandler = (path: string) => {
  return `src/functions/${path}.handler`;
}

const serverlessConfiguration: AWS = {
  service: 'todo-serverless',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-offline',
  ],
  
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  
  // import the function via paths
  functions: { 
    hello: {
      handler: getPathHandler('hello'),
      events: [
        {
          http: {
            path: '/hello',
            method: 'GET',

            cors: true
          }
        }
      ]
    },
    saveTodos: {
      handler: getPathHandler('createTodo'),
      events: [
        {
          http: {
            path: '/todos/{user_id}',
            method: 'POST',

            cors: true
          }
        }
      ]
    },
    getTodos: {
      handler: getPathHandler('getTodoByUserId'),
      events: [
        {
          http: {
            path: '/todos/{user_id}',
            method: 'GET',

            cors: true
          }
        }
      ]
    }
  },

  package: { individually: true },

  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },

    dynamodb: {
      stages: ['dev', 'local'],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      }
    }
  },

  resources: {
    Resources: {
      dbTodos: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'todos',
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: 'S',
            },
            {
              AttributeName: "user_id",
              AttributeType: 'S',
            }
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: 'HASH',
            },
          ],
          GlobalSecondaryIndexes: [
            { 
              IndexName: 'user_index', 
              KeySchema: [
                {
                  AttributeName: 'user_id',
                  KeyType: 'HASH',
                }
              ],
              Projection: {
                ProjectionType: 'ALL' // (ALL | KEYS_ONLY | INCLUDE)
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          ],
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
