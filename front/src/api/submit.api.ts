import { type User, mapUser } from "~/shared/models/user.model";
import { ENV } from "~/shared/config/env.config";

export async function getAllUserSubmitsByProblem(token: string, problem_id: number): Promise<User | undefined> {
    const response = await fetch(
        `${ENV.api_url}/submit/byProblem/${problem_id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch problem data: ${response.status}`);

    if (typeof data.user !== "object") throw new Error("Invalid response from server");

    return mapUser(data.user);
}

export async function getSubmitById(token: string, id: number): Promise<User | undefined> {
    const response = await fetch(
        `${ENV.api_url}/submit/${id}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch problem data: ${response.status}`);

    if (typeof data.user !== "object") throw new Error("Invalid response from server");

    return mapUser(data.user);
}
