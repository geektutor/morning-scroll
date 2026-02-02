import { Router } from "express";
import { newsRouter } from "../../API/NEWS/route/index.js";

export const apiRouter = Router()

apiRouter.use(newsRouter)



