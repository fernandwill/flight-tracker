const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

let cachedFlights = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 1000; // 30 secs

app.use(cors());
app.use(express.json());

app.get("/api/flights", async (req, res) => {
    const now = Date.now();
    
    // Use cache if still fresh
    if (cachedFlights && now - lastFetchTime < CACHE_DURATION) {
        return res.json({source: "cache", ...cachedFlights});
    }

    try {
        const response = await axios.get("https://opensky-network.org/api/states/all");
        cachedFlights = response.data;
        lastFetchTime = now;
        
        res.json({source: "api", ...cachedFlights });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch flight data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});