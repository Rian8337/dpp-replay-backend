import { Router } from "express";
import { persistLocalReplay } from "../replaySavingManager";

const router = Router();

router.post<"/", unknown, unknown, { filename: string }>(
    "/",
    async (req, res) => {
        // Send response immediately
        res.send("Success");

        await persistLocalReplay(req.body.filename);
    }
);

export default router;
