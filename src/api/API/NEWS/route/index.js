import { Router } from "express";
import { getNews } from "../services/get.all.news/index.js";


export const newsRouter = Router();

newsRouter.get("/news", getNews)