import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";
import { readFile, copyFile, writeFile } from "fs/promises";
import { join } from "path";

/**
 * The directory of replays.
 */
export const replayDirectory = join(process.cwd(), "replays");

/**
 * Saves a replay to the disk.
 *
 * @param filename The name of the replay file.
 * @param replayFile The replay file.
 * @returns The name the replay file was saved in if the operation is successful, or `null`.
 */
export async function saveReplay(
    playerId: number,
    replayAnalyzer: ReplayAnalyzer
): Promise<string | null> {
    const { originalODR, data } = replayAnalyzer;
    if (!originalODR || !data) {
        return null;
    }

    // Rename incremental IDs
    let filename = `${playerId}_${data.hash}_${
        data.convertedMods.map((v) => v.droidString) || "-"
    }_${data.speedModification}x_`;

    if (data.forcedAR !== undefined) {
        filename += `AR${data.forcedAR}_`;
    }

    for (let i = 4; i > 0; --i) {
        const name = join(replayDirectory, filename);
        const file = await readFile(name + i + ".odr").catch(() => null);

        if (!file) {
            continue;
        }

        await copyFile(name + i + ".odr", name + (i + 1) + ".odr");
    }

    filename += "1.odr";
    const success = await writeFile(
        join(replayDirectory, filename),
        originalODR
    )
        .then(() => true)
        .catch(() => false);

    return success ? filename : null;
}
