import {ChatDeepSeek} from "@langchain/deepseek";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {sendMessageStrFromServer} from "../socket/socketSendService.js";
import {getPlayerTokenFromSocketId} from "../socket/socketDataService.js";
import {getSessionByToken, getSessionTokenByPlayerToken} from "../sessionService.js";
import {EstimationOption, FibonacciEstimationValues} from "../../models/SessionModel.js";

const model = new ChatDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    temperature: 0.3,
});

interface SessionInformation {
    estimationOptions: EstimationOption;
    estimationValues: string[];
}
interface ContextInformation {
    sessionToken: string;
    userToken: string;
    socketId: string;
    sessionInformation: SessionInformation;
}

export async function gatherContextInformation(socketId: string): Promise<ContextInformation | null> {
    const userToken = await getPlayerTokenFromSocketId(socketId);
    if (!userToken) {
        sendMessageStrFromServer(socketId, "error");
        return null;
    }
    const sessionToken = await getSessionTokenByPlayerToken(userToken);
    if (!sessionToken) {
        sendMessageStrFromServer(socketId, "error");
        return null;
    }
    const session = await getSessionByToken(sessionToken);

    const sessionInformation: SessionInformation = {
        estimationOptions: session?.estimationOptions ?? EstimationOption.Fibonacci,
        estimationValues: session?.estimationValues ?? FibonacciEstimationValues,
    }

    return {
        sessionToken,
        userToken,
        sessionInformation,
        socketId
    } as ContextInformation;
}

// The client renders this string with v-html after sanitize-html (default allow-list + <img>),
// so formatting has to stay inside that allow-list — no markdown fences/headings, they'd render
// as literal text instead of formatting.
const OUTPUT_FORMAT_RULES = `Formatting: plain text, optionally using only <b>, <i>, <code>, <br/>, <ul>/<li> for structure. Never use markdown (no backticks, no #, no **). Never wrap the whole reply in a code block. Reply in the same language the user's message is written in.`;

function systemPromptForAsk(): string {
    return [
        `You are the embedded technical assistant inside a Planning Poker session used by a software team during estimation.`,
        `Answer the engineer's technical question directly and concisely — a few sentences, no filler, no restating the question, no disclaimers about being an AI.`,
        `If the question is ambiguous, make a reasonable assumption and answer instead of asking a clarifying question first — this is a live estimation session, not a back-and-forth chat.`,
        OUTPUT_FORMAT_RULES,
    ].join(' ');
}

function systemPromptForEstimation(sessionInformation: SessionInformation): string {
    const scale = sessionInformation.estimationOptions;
    const values = sessionInformation.estimationValues.filter(v => v !== '🤷‍♂️' && v !== '☕');
    return [
        `You are an estimation-support assistant inside a Planning Poker session. The team estimates using the "${scale}" scale, with these valid point values, in increasing order of size: ${values.join(', ')}.`,
        `Given the feature/task description that follows, propose exactly one value from that list — never invent a value outside it, never output a range — and give 1-2 sentences of reasoning covering complexity, unknowns, and risk.`,
        `Start the reply with the chosen value, then the reasoning.`,
        `If the description is too vague to estimate at all, say so briefly instead of guessing a number.`,
        OUTPUT_FORMAT_RULES,
    ].join(' ');
}

export async function sendMessageToAi(message: string, context: ContextInformation, command: string): Promise<string> {
    const systemPrompt = command === "estimation"
        ? systemPromptForEstimation(context.sessionInformation)
        : systemPromptForAsk();
    // message still carries its leading slash-command (e.g. "/ask ...") — the model should
    // only see the actual question/description.
    const userInput = message.replace(/^\/\S+\s*/, '');

    try {
        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userInput),
        ]);
        return typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    } catch (error) {
        console.log(error);
        return "error";
    }
}
