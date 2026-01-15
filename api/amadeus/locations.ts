import type { VercelRequest, VercelResponse } from "@vercel/node";

const AMADEUS_BASE = "https://test.api.amadeus.com";
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.token;
    }

    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_CLIENT_ID || "",
        client_secret: process.env.AMADEUS_CLIENT_SECRET || "",
    });

    const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + Math.max(0, data.expires_in - 60) * 1000,
    };

    return cachedToken.token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const keywordQuery = typeof req.query.keyword === "string" ? req.query.keyword : undefined;
    const qQuery = typeof req.query.q === "string" ? req.query.q : undefined;
    const keyword = keywordQuery ?? qQuery ?? "";
    const subType = typeof req.query.subType === "string" ? req.query.subType : "CITY,AIRPORT";

    try {
        const token = await getToken();
        const searchParams = new URLSearchParams({
            keyword,
            subType,
        });

        const apiRes = await fetch(`${AMADEUS_BASE}/v1/reference-data/locations?${searchParams.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await apiRes.json();
        res.status(apiRes.status).json(data);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Locations error";
        res.status(500).json({ error: message });
    }
}
