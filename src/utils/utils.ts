import { GPT4AllParams, Message, Model } from "Types/types";
import { existsSync } from "fs";
import { Editor } from "obsidian";
import OpenAI from "openai";
import { Stream } from "openai/streaming";

const path = require("path");
const homeDir = require("os").homedir();
export const DEFAULT_DIRECTORY = path.resolve(
	homeDir,
	navigator.platform.indexOf("Win") > -1
		? "AppData/Local/nomic.ai/GPT4All/"
		: "Library/Application Support/nomic.ai/GPT4All"
);

export function modelLookup(modelName: string) {
	const model = path.join(DEFAULT_DIRECTORY, modelName);
	return existsSync(model);
}

export async function messageGPT4AllServer(params: GPT4AllParams) {
	const response = await fetch("http://localhost:4891/v1/chat/completions", {
		method: "POST",
		body: JSON.stringify({
			model: params.model,
			messages: params.messages,
			max_tokens: params.tokens,
			temperature: params.temperature,
		}),
	}).then((res) => res.json());
	return response.choices[0].message;
}

/* FOR NOW USING GPT4ALL PARAMS, BUT SHOULD PROBABLY MAKE NEW OPENAI PARAMS TYPE */
export async function openAIMessage(
	params: GPT4AllParams,
	OpenAI_API_Key: string
) {
	const openai = new OpenAI({
		apiKey: OpenAI_API_Key,
		dangerouslyAllowBrowser: true,
	});
	const { model, messages, tokens, temperature } = params;

	const stream = await openai.chat.completions.create({
		model,
		messages,
		max_tokens: tokens,
		temperature,
		stream: true,
	});

	return stream;
}

export function processReplacementTokens(prompt: string) {
	const tokenRegex = /\{\{(.*?)\}\}/g;
	const matches = [...prompt.matchAll(tokenRegex)];
	matches.forEach((match) => {
		const token = match[1] as keyof typeof this.replacementTokens;
		if (this.replacementTokens[token]) {
			prompt = this.replacementTokens[token](match, prompt);
		}
	});

	return prompt;
}

function moveCursorToEndOfFile(editor: Editor) {
	try {
		const length = editor.lastLine();

		const newCursor = {
			line: length + 1,
			ch: 0,
		};
		editor.setCursor(newCursor);

		return newCursor;
	} catch (err) {
		throw new Error("Error moving cursor to end of file" + err);
	}
}

export function appendMessage(editor: Editor, message: string, type?: string) {
	moveCursorToEndOfFile(editor!);
	const newLine = `${message}\n`;
	editor.replaceRange(newLine, editor.getCursor());

	moveCursorToEndOfFile(editor!);
}

export function serializeMessages(messages: Message[]) {
	let response = "";
	messages.forEach((message: Message) => {
		response += `${message.role} : ${message.content}\n\n`;
	});

	return response;
}

export const models: Record<string, Model> = {
	"Mistral OpenOrca": {model: "mistral-7b-openorca.Q4_0.gguf", type: "GPT4All"},
	"Mistral Instruct": {model: "mistral-7b-instruct-v0.1.Q4_0.gguf", type: "GPT4All"},
	"GPT4All Falcon": {model: "gpt4all-falcon-newbpe-q4_0.gguf", type: "GPT4All"},
	"Orca 2 (Medium)": {model: "orca-2-7b.Q4_0.gguf", type: "GPT4All"},
	"Orca 2 (Full)": {model: "orca-2-13b.Q4_0.gguf", type: "GPT4All"},
	"Mini Orca (Small)": {model: "orca-mini-3b-gguf2-q4_0.gguf", type: "GPT4All"},
	"MPT Chat": {model: "mpt-7b-chat-newbpe-q4_0.gguf", type: "GPT4All"},
	"Wizard v1.2": {model: "wizardlm-13b-v1.2.Q4_0.gguf", type: "GPT4All"},
	Hermes: {model: "nous-hermes-llama2-13b.Q4_0.gguf", type: "GPT4All"},
	Snoozy: {model: "gpt4all-13b-snoozy-q4_0.gguf", type: "GPT4All"},
	"EM German Mistral": {model: "em_german_mistral_v01.Q4_0.gguf", type: "GPT4All"},
	"ChatGPT-3.5 Turbo": {model: "gpt-3.5-turbo", type: "openAI"},
	"Text Embedding 3 (Small)": {model: "text-embedding-3-small", type: "openAI"},
	// "DALL·E 3": {model: "dall-e-3", type: "openAI"},
};

export const modelNames: Record<string, string> = {
	"mistral-7b-openorca.Q4_0.gguf": "Mistral OpenOrca",
	"mistral-7b-instruct-v0.1.Q4_0.gguf": "Mistral Instruct",
	"gpt4all-falcon-newbpe-q4_0.gguf": "GPT4All Falcon",
	"orca-2-7b.Q4_0.gguf": "Orca 2 (Medium)",
	"orca-2-13b.Q4_0.gguf": "Orca 2 (Full)",
	"orca-mini-3b-gguf2-q4_0.gguf": "Mini Orca (Small)",
	"mpt-7b-chat-newbpe-q4_0.gguf": "MPT Chat",
	"wizardlm-13b-v1.2.Q4_0.gguf": "Wizard v1.2",
	"nous-hermes-llama2-13b.Q4_0.gguf": "Hermes",
	"gpt4all-13b-snoozy-q4_0.gguf": "Snoozy",
	"em_german_mistral_v01.Q4_0.gguf": "EM German Mistral",
	"gpt-3.5-turbo": "ChatGPT-3.5 Turbo",
	"text-embedding-3-small": "Text Embedding 3 (Small)",
};

// export function getModelNames():Record<string, string> {
//     let modelNames = Object.keys(models)
//     let names:Record<string, string> = {}
//     for(const name of modelNames) {
//         names[models[name].model] = name
//     }
// 	return names
// }