import { Router } from "express";
import { persistOnlineReplay } from "../replaySavingManager";

const router = Router();

router.post<"/", unknown, unknown, { uid: string; scoreid: string }>(
    "/",
    async (req, res) => {
        const success = await persistOnlineReplay(
            parseInt(req.body.uid),
            parseInt(req.body.scoreid)
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
