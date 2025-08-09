const fetch = require('node-fetch');

async function getFirstYoutubeVideoId(query) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YOUTUBE_API_KEY not set");

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(query)}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();
    console.log("📺 YouTube raw response:\n", JSON.stringify(data, null, 2));
    if (data.items && data.items.length > 0) {
        return data.items[0].id.videoId;
    } else {
        return null;
    }
}

module.exports = {
    getFirstYoutubeVideoId
};