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

const queryValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const token = await getToken();

        if (req.method === "GET") {
            const origin = queryValue(req.query.origin);
            const destination = queryValue(req.query.destination);
            const departDate = queryValue(req.query.departDate);
            const returnDate = queryValue(req.query.returnDate);
            const adults = queryValue(req.query.adults);
            const travelClass = queryValue(req.query.travelClass);
            const currencyCode = queryValue(req.query.currencyCode);
            const max = queryValue(req.query.max);

            if (!origin || !destination || !departDate || !adults) {
                return res.status(400).json({ error: "Missing required parameters" });
            }

            const params = new URLSearchParams({
                originLocationCode: origin,
                destinationLocationCode: destination,
                departureDate: departDate,
                adults,
            });

            if (returnDate) params.set("returnDate", returnDate);
            if (travelClass) params.set("travelClass", travelClass);
            if (currencyCode) params.set("currencyCode", currencyCode);
            if (max) params.set("max", max);

            const apiRes = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await apiRes.json();
            return res.status(apiRes.status).json(data);
        }

        if (req.method === "POST") {
            const apiRes = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(req.body ?? {}),
            });
            const data = await apiRes.json();
            return res.status(apiRes.status).json(data);
        }

        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Flight offers error";
        res.status(500).json({ error: message });
    }
}
