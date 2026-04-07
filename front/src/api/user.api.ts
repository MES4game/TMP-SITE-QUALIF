import { type User, mapUser } from "~/shared/models/user.model";
import { ENV } from "~/shared/config/env.config";

export async function getSelf(token: string): Promise<User | undefined> {
    const response = await fetch(
        `${ENV.api_url}/user/self`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to fetch self user data: ${response.status}`);

    if (data.user === undefined) return undefined;

    if (typeof data.user !== "object") throw new Error("Invalid response from server");

    return mapUser(data.user);
}

export async function getPseudoById(id: number): Promise<string> {
    const response = await fetch(
        `${ENV.api_url}/user/pseudo/${id}`,
        {
            method: "GET",
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(`Failed to fetch self user data: ${response.status}`);

    if (data.pseudo === undefined || typeof data.pseudo !== "string") throw new Error("Invalid response from server");

    return data.pseudo;
}

export async function getAvatarById(id: number): Promise<Blob> {
    const response = await fetch(
        `${ENV.api_url}/user/avatar/${id}`,
        {
            method: "GET",
        },
    );

    const data = await response.blob();

    if (!response.ok) throw new Error(`Failed to fetch self user data: ${response.status}`);

    return data;
}

export async function loginUser(user_login: string, password: string): Promise<string | undefined> {
    const response = await fetch(
        `${ENV.api_url}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_login: user_login,
                password: password,
            }),
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Login failed: ${response.status}`);

    if (data.token === undefined || typeof data.token === "string") return data.token;

    throw new Error("Invalid response from server");
}

export async function registerUser(pseudo: string, email: string, firstname: string, lastname: string, password: string): Promise<void> {
    const response = await fetch(
        `${ENV.api_url}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                pseudo: pseudo,
                email: email,
                firstname: firstname,
                lastname: lastname,
                password: password,
            }),
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Registration failed: ${response.status}`);

    return;
}

export async function updateUser(token: string, updates: Partial<User>): Promise<void> {
    const response = await fetch(
        `${ENV.api_url}/user/self`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to update user data: ${response.status}`);

    return;
}

export async function uploadAvatar(token: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(
        `${ENV.api_url}/user/self`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to upload avatar: ${response.status}`);

    return;
}

export async function deleteAccount(token: string): Promise<void> {
    const response = await fetch(
        `${ENV.api_url}/user/self`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message ?? `Failed to delete account: ${response.status}`);

    return;
}
