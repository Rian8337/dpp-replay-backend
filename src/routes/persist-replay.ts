import { Router } from "express";
import { persistReplay } from "../replaySavingManager";

const router = Router();

router.post<"/", unknown, unknown, { filename: string }>(
    "/",
    async (req, res) => {
        // Send response immediately
        res.send("Success");

        await persistReplay(req.body.filename);
    }
);

export default router;
