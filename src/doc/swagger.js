
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'ESports Coin API',
    description: 'API documentation for ESports Coin application',
    version: '1.0.0'
  },
  host: 'localhost:3000',
  basePath: '/api/v1',
  schemes: ['http'],
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT token in format: Bearer <token>'
    }
  },
  definitions: {
    User: {
      name: 'string',
      email: 'string',
      walletBalance: 0
    },
    Game: {
      name: 'string',
      image: 'string',
      publisher: 'string'
    },
    WalletAdd: {
      amount: 0
    },
    WalletDeduct: {
      amount: 0
    }
  }
};

const outputFile = './swagger-output.json';
const routes = ['../routes/index.ts'];



swaggerAutogen(outputFile, routes, doc);