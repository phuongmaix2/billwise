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
    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("json");

    const body = isJson
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        if (typeof body === "object" && body !== null) {
            const problem = body as {
                detail?: string;
                message?: string;
                errors?: Record<string, string>;
            };

            const fieldErrors = problem.errors
                ? Object.values(problem.errors)
                : [];

            if (fieldErrors.length > 0) {
                throw new Error(
                    fieldErrors
                        .map((message) => `• ${message}`)
                        .join("\n")
                );
            }

            throw new Error(
                problem.detail ||
                problem.message ||
                `Request failed: ${response.status}`
            );
        }

        throw new Error(
            body || `Request failed: ${response.status}`
        );
    }
    if (!isJson) {
        throw new Error(
            response.redirected
                ? "Your session expired. Please log in again."
                : "The server did not return JSON."
        );
    }

    return body as T;
}