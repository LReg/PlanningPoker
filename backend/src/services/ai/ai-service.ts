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
        `You are a software developer taking part in a Planning Poker meeting. Given the problem statement that follows, make an estimation and explain it.`,
        `The team estimates using the "${scale}" scale, with these valid point values, in increasing order of size: ${values.join(', ')} — never propose a value outside this list.`,
        `If the problem statement doesn't give enough information for one confident value, don't refuse to estimate: give the smallest reasonable range of adjacent values from that list (e.g. two neighbouring values) and say what information would narrow it down to one. Prefer a single value whenever you reasonably can.`,
        `Structure the reply as exactly three labelled parts, in this order, using <br/> between them — translate the three labels into the reply's own language (e.g. in German: Schätzung / Begründung / Überlegungen):`,
        `<b>Estimation</b><br/>the value or small range, nothing else on this line<br/><br/><b>Explanation</b><br/>one to two sentences justifying it<br/><br/><b>Consideration</b><br/>a short paragraph on the complexity, unknowns and risk that informed the estimate`,
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
