const axios = require('axios');

exports.getShortUrl = async (req, res) => {
    try {
        const { longUrl } = req.body;
        if (!longUrl) {
            return res.status(400).json({ message: "URL is required" });
        }

        // Use TinyURL API (no key required for basic shortening)
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);

        if (response.data) {
            // TinyURL simply returns the shorter string as text
            res.status(200).json({ shortUrl: response.data });
        } else {
            res.status(500).json({ message: "Failed to generate short URL" });
        }

    } catch (error) {
        console.error("Error shortening URL:", error);
        res.status(500).json({ message: "Error processing request" });
    }
};
