import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env } from './config';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Competition API',
            version: '1.0.0',
            description: 'API documentation for the Competition Backend',
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    // This tells swagger-jsdoc to look for JSDoc @swagger comments in these files
    apis: ['./src/index.ts', './src/controllers/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    // Mount the Swagger UI at /docs
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: "Competition API Docs"
    }));
    
    console.log(`📑 Swagger Docs available at http://localhost:${env.PORT}/docs`);
};
