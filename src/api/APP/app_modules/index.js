import { app } from "../index.js";
import { config } from "../../CORE/utils/config/index.js";
import { formattedDate } from "../../CORE/utils/constants/index.js";
import { API_SUFFIX } from "../../CORE/utils/constants/index.js";


const PORT = config.app.port;

const server = app.listen(PORT, () => {
    console.log(`\x1b[32m[${formattedDate}]: Server is running on port: ${PORT}`);
    console.log(`[${formattedDate}]: \x1b[32mGo to http://localhost:${PORT}${API_SUFFIX}/health to check server health`);
});

export { server };

