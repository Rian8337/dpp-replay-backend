import { Router } from "express";
import { persistOnlineReplay } from "../replaySavingManager";

const router = Router();

router.post<"/", unknown, unknown, { uid: string; scoreId: string }>(
    "/",
    async (req, res) => {
        const success = await persistOnlineReplay(
            parseInt(req.body.uid),
            parseInt(req.body.scoreId)
        );

        if (!success) {
            return res
                .status(400)
                .json({ error: "Unable to persist online replay file" });
        }

        res.sendStatus(200);
    }
);

export default router;
