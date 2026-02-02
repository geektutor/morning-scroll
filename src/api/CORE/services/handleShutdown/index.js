import logger from "../../utils/logger/index.js";

export function handleShutdown(error) {
    logger.info("Shutting down gracefully...");
    if (error) {
        logger.error("Error causing shutdown:", error);
    }
    process.exit(0);
}

