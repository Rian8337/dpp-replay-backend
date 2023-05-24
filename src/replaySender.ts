import { ReplayAnalyzer } from "@rian8337/osu-droid-replay-analyzer";

/**
 * A set that contains replays that failed to submit to the processing backend.
 */
export const failedReplaySubmissions = new Set<ReplayAnalyzer>();

/**
 * Starts the interval to resend failed replay submissions.
 */
export function startResendCycle() {
    setInterval(async () => {
        for (const replay of failedReplaySubmissions) {
            if (await sendReplay(replay)) {
                failedReplaySubmissions.delete(replay);
            }
        }
    }, 60 * 5 * 1000);
}

/**
 * Sends a replay to the processing backend.
 *
 * @param filename The name of the replay file.
 * @param replay The replay to be sent.
 * @returns Whether the request was successful.
 */
export async function sendReplay(replay: ReplayAnalyzer): Promise<boolean> {
    if (!replay.originalODR) {
        return false;
    }

    const formData = new FormData();
    formData.append("replayID", replay.scoreID.toString());
    formData.append("key", process.env.DROID_SERVER_INTERNAL_KEY!);
    formData.append("replayfile", new Blob([replay.originalODR]));

    const success = await fetch("http://127.0.0.1:3006/forward-replay", {
        method: "POST",
        body: formData,
    })
        .then(() => true)
        .catch(() => false);

    if (!success) {
        failedReplaySubmissions.add(replay);
    }

    return success;
}
