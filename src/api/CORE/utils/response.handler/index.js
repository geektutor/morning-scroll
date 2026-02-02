export function sendResponse(res, statusCode, message, data = null, status = "success") {
    res.status(statusCode).json({
        status,
        message,
        data
    });
}

