import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { getConfig } from './config/app.config';
// TSOA generated routes (will be created automatically)
import { RegisterRoutes } from '../build/routes';
const app = express();
const config = getConfig();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve OpenAPI docs
app.use('/docs', swaggerUi.serve, async (_req, res) => {
    return res.send(swaggerUi.generateHTML(await import('../build/swagger.json')));
});
RegisterRoutes(app); // We will uncomment this once controllers are ready
app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`🕒 Event Starts: ${config.startDatetime}`);
    console.log(`❄️ Scoreboard Freeze: ${config.freezeDatetime}`);
});
//# sourceMappingURL=server.js.map