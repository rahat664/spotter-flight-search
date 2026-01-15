const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

export async function apiClient<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const resolvedUrl = resolveUrl(url);
    const res = await fetch(resolvedUrl, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        const message = await safeErrorMessage(res);
        throw new Error(message || `Request failed with status ${res.status}`);
    }

    return res.json() as Promise<T>;
}

async function safeErrorMessage(res: Response) {
    try {
        const data = await res.json();
        if (typeof data?.message === "string") return data.message;
        if (typeof data?.error === "string") return data.error;
    } catch {
        /* ignore */
    }
    return res.statusText;
}

function resolveUrl(url: string) {
    if (/^https?:\/\//.test(url) || !API_BASE) return url;
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}
