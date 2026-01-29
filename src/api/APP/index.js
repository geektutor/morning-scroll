import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";

import cors from "cors";
import { apiRouter } from "./app_router/index.js";
import logger from "../CORE/utils/logger/index.js";
import { API_SUFFIX } from "../CORE/utils/constants/index.js";
import { handleShutdown } from "../CORE/services/handleShutdown/index.js";
import { config } from "../CORE/utils/config/index.js";
import { sendResponse } from "../CORE/utils/response.handler/index.js";
import CorsHandler from "../CORE/services/cors/index.js";
import {requestLogger} from "../CORE/middleware/requestlogger/index.js"

export const app = express();

const corsHandler = new CorsHandler();
app.use(...corsHandler.initialize());
app.use(requestLogger);
app.use(helmet());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(API_SUFFIX, apiRouter);

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);
app.get(`${API_SUFFIX}/health`, async (req, res) => {
    let databaseStatus = "down";
    try {
        if (mongoose.connection.readyState === 1) {
            databaseStatus = "up";
        }
    } catch (error) {
        databaseStatus = "down";
    }
    const healthcheck = {
        server: "up",
        database: databaseStatus,
    };
    try {
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.server = "down";
        res.status(503).json(healthcheck);
    }
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    sendResponse(res, statusCode, message, null, "error");
});
