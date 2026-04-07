import { type UserScore, mapUserScore } from "~/shared/models/scoreboard.model";
import { ENV } from "~/shared/config/env.config";

export async function getScoreboard(): Promise<UserScore[] | undefined> {
    const response = await fetch(
        `${ENV.api_url}/scoreboard`,
        {
            method: "GET",
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch scoreboard data: ${response.status}`);

    if (data.scores === undefined) return undefined;

    if (!Array.isArray(data.scores)) throw new Error("Invalid response from server");

    return data.scores.map(mapUserScore);
}
