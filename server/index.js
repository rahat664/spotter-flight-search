import "dotenv/config";
import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const AMADEUS_BASE = "https://test.api.amadeus.com";

let cachedToken = null;

async function getToken() {
    if (cachedToken && cachedToken.expires_at > Date.now()) {
        return cachedToken.access_token;
    }
    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_CLIENT_ID || "",
        client_secret: AMADEUS_CLIENT_SECRET || "",
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
    const data = await res.json();
    cachedToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 60) * 1000,
    };
    return cachedToken.access_token;
}

app.post("/api/amadeus/token", async (_req, res) => {
    try {
        const token = await getToken();
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Token error" });
    }
});

app.get("/api/amadeus/flight-offers", async (req, res) => {
    try {
        const token = await getToken();

        const {
            origin,
            destination,
            departDate,
            returnDate,
            adults,
            travelClass,
            currencyCode,
            max,
        } = req.query;

        if (!origin || !destination || !departDate || !adults) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const params = new URLSearchParams({
            originLocationCode: String(origin),
            destinationLocationCode: String(destination),
            departureDate: String(departDate),
            adults: String(adults),
        });

        if (returnDate) params.set("returnDate", String(returnDate));
        if (travelClass) params.set("travelClass", String(travelClass));
        if (currencyCode) params.set("currencyCode", String(currencyCode));
        if (max) params.set("max", String(max));

        const apiRes = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers?${params.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await apiRes.json();
        res.status(apiRes.status).json(data);
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Flight offers error" });
    }
});

app.get("/api/amadeus/locations", async (req, res) => {
    try {
        const token = await getToken();
        const { q = "", subType = "CITY,AIRPORT" } = req.query;
        const params = new URLSearchParams({ keyword: String(q), subType: String(subType) });
        const apiRes = await fetch(`${AMADEUS_BASE}/v1/reference-data/locations?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await apiRes.json();
        res.status(apiRes.status).json(data);
    } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Locations error" });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
