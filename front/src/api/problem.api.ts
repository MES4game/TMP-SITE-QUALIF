import { ENV } from "~/shared/config/env.config";
import { mapProblem, mapSample, mapSubmitStatus, type Problem, type Sample } from "~/shared/models/problem.model";
import { type Language, mapLanguage, mapSubmit, type Submit, type SubmitStatus } from "../shared/models/problem.model";

export async function getAllProblems(): Promise<Problem[] | undefined> {
    const response = await fetch(
        `${ENV.api_url}/problem/all`,
        {
            method: "GET",
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch problems data: ${response.status}`);

    if (!Array.isArray(data.problems)) throw new Error("Invalid response from server");

    return data.problems.map(mapProblem);
}

export async function getAllSamplesByProblem(id: number): Promise<Sample[] | undefined> {
    const response = await fetch(
        `${ENV.api_url}/problem/${id}/samples`,
        {
            method: "GET",
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch samples data: ${response.status}`);

    if (!Array.isArray(data.problems)) throw new Error("Invalid response from server");

    return data.problems.map(mapSample);
}

export async function getSkeletonCodeByProblem(id: number, language: string): Promise<{ filename: string, blob: Blob }> {
    const response = await fetch(
        `${ENV.api_url}/problem/${id}/skeleton/${language}`,
        {
            method: "GET",
        },
    );

    const filename = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? `skeleton_${id}_${language}`;
    const data = await response.blob();

    if (!response.ok) throw new Error(`Failed to fetch skeleton code: ${response.status}`);

    return {
        filename,
        blob: data,
    };
}

export async function getAllLanguages(): Promise<Language[] | undefined> {
    const response = await fetch(
        `${ENV.api_url}/problem/languages`,
        {
            method: "GET",
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch languages data: ${response.status}`);

    if (!Array.isArray(data.languages)) throw new Error("Invalid response from server");

    return data.languages.map(mapLanguage);
}

export async function getAllStatuses(): Promise<SubmitStatus[] | undefined> {
    const response = await fetch(
        `${ENV.api_url}/problem/statuses`,
        {
            method: "GET",
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch statuses data: ${response.status}`);

    if (!Array.isArray(data.statuses)) throw new Error("Invalid response from server");

    return data.statuses.map(mapSubmitStatus);
}

export async function getUserInfoByProblem(token: string, id: number): Promise<{ status: number, number_tries: number }> {
    const response = await fetch(
        `${ENV.api_url}/problem/${id}/user-info`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch problems data: ${response.status}`);

    if (typeof data.number_tries !== "number") throw new Error("Invalid response from server");
    if (typeof data.number_tries !== "number") throw new Error("Invalid response from server");

    return {
        status: data.status,
        number_tries: data.number_tries,
    };
}

export async function getAllSubmitsByProblem(token: string, id: number): Promise<Submit[] | undefined> {
    const response = await fetch(
        `${ENV.api_url}/problem/${id}/submits`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch submits data: ${response.status}`);

    if (!Array.isArray(data.submits)) throw new Error("Invalid response from server");

    return data.submits.map(mapSubmit);
}

export async function submitProblem(token: string, id: number, language: string, form: FormData): Promise<void> {
    const response = await fetch(
        `${ENV.api_url}/submit/${id}/${language}`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: form,
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to submit problem: ${response.status}`);

    return;
}

export async function getCodeBySubmit(token: string, submit_id: number): Promise<{ filename: string, blob: Blob }> {
    const response = await fetch(
        `${ENV.api_url}/submit/${submit_id}/code`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        },
    );

    const filename = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") ?? `code_${submit_id}`;
    const data = await response.blob();

    if (!response.ok) throw new Error(`Failed to fetch code: ${response.status}`);

    return {
        filename,
        blob: data,
    };
}
