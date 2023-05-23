import { Router } from "express";
import { join } from "path";
import { localReplayDirectory } from "../replaySavingManager";
import { lstat } from "fs/promises";

const router = Router();

router.get<"/", {}, {}, {}, { filename: string }>("/", async (req, res) => {
    const filePath = join(localReplayDirectory, req.query.filename);
    const fileStat = await lstat(filePath).catch(() => null);

    if (!fileStat?.isFile()) {
        return res.status(404).json({ error: "File not found." });
    }

    res.download(filePath, (err) => {
        if (err) {
            res.status(500).json({ error: "Internal server error." });
        }
    });
});

export default router;
