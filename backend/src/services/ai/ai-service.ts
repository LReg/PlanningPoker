import axios from "axios";

export async function sendMessageToAi(message: string, sessionId: string): Promise<string> {
    let data = JSON.stringify({
        action: "sendMessage",
        sessionId: sessionId,
        chatInput: message
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.N8NCHAT,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
            'Accept': '*/*',
            'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Content-Type': 'application/json',
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        return JSON.stringify(response.data.output);
    } catch (error) {
        console.log(error);
        return "error";
    }

}