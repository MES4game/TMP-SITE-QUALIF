import express, { Response as ExResponse, Request as ExRequest } from "express";
import swaggerUi from "swagger-ui-express";

export const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the Swagger UI page
app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
    return res.send(
        swaggerUi.generateHTML(await import("../build/swagger.json"))
    );
});

// Import the generated routes (created by tsoa)
import { RegisterRoutes } from "../build/routes";
RegisterRoutes(app);
