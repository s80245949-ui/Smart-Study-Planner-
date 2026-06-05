import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import usersRouter from "./users";
import statsRouter from "./stats";
import quotesRouter from "./quotes";
import resetRouter from "./reset";
import playlistsRouter from "./playlists";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tasksRouter);
router.use(usersRouter);
router.use(statsRouter);
router.use(quotesRouter);
router.use(resetRouter);
router.use(playlistsRouter);

export default router;
