const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");

    if (options.body) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    const body = isJson
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            typeof body === "object" && body !== null
                ? body.detail || body.message
                : body;

        throw new Error(message || `Request failed: ${response.status}`);
    }

    return body as T;
}