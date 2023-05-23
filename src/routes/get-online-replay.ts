import { Router } from "express";
import { lstat } from "fs/promises";
import { join } from "path";
import { onlineReplayDirectory } from "../replaySavingManager";

const router = Router();

router.get<"/", unknown, unknown, unknown, { scoreId: string }>(
    "/",
    async (req, res) => {
        const filePath = join(
            onlineReplayDirectory,
            `${req.query.scoreId}.odr`
        );
        const fileStat = await lstat(filePath).catch(() => null);

        if (!fileStat?.isFile()) {
            return res.status(404).json({ error: "File not found." });
        }

        res.download(filePath, (err) => {
            if (err) {
                res.status(500).json({ error: "Internal server error." });
            }
        });
    }
);

export default router;
