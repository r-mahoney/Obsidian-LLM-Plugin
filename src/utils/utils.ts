import {
	GPT4AllParams,
	Message,
	Model,
	ViewSettings,
	ViewType,
} from "Types/types";
import { existsSync } from "fs";
import LocalLLMPlugin from "main";
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

export async function messageGPT4AllServer(params: GPT4AllParams, url: string) {
	const response = await fetch(`http://localhost:4891${url}`, {
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
	OpenAI_API_Key: string,
	endpoint: string,
	endpointType: string
) {
	const openai = new OpenAI({
		apiKey: OpenAI_API_Key,
		dangerouslyAllowBrowser: true,
	});
	const { prompt, model, messages, tokens, temperature } = params;

	if (endpointType === "chat") {
		const stream = await openai.chat.completions.create(
			{
				model,
				messages,
				max_tokens: tokens,
				temperature,
				stream: true,
			},
			{ path: endpoint }
		);

		return stream;
	}

	if (endpointType === "images") {
		const image = await openai.images.generate({
			model,
			prompt,
			size: "1024x1024",
			quality: "standard",
			n: 1,
		});

		return image.data[0].url;
	}
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

export function getViewInfo(
	plugin: LocalLLMPlugin,
	viewType: ViewType
): ViewSettings {
	if (viewType === "modal") {
		return {
			model: plugin.settings.modalSettings.model,
			modelName: plugin.settings.modalSettings.modelName,
			modelType: plugin.settings.modalSettings.modelType,
			historyIndex: plugin.settings.modalSettings.historyIndex,
			modelEndpoint: plugin.settings.modalSettings.modelEndpoint,
			endpointURL: plugin.settings.modalSettings.endpointURL,
		};
	}

	if (viewType === "widget") {
		return {
			model: plugin.settings.widgetSettings.model,
			modelName: plugin.settings.widgetSettings.modelName,
			modelType: plugin.settings.widgetSettings.modelType,
			historyIndex: plugin.settings.widgetSettings.historyIndex,
			modelEndpoint: plugin.settings.widgetSettings.modelEndpoint,
			endpointURL: plugin.settings.widgetSettings.endpointURL,
		};
	}

	if (viewType === "floating-action-button") {
		return {
			model: plugin.settings.widgetSettings.model,
			modelName: plugin.settings.widgetSettings.modelName,
			modelType: plugin.settings.widgetSettings.modelType,
			historyIndex: plugin.settings.widgetSettings.historyIndex,
			modelEndpoint: plugin.settings.widgetSettings.modelEndpoint,
			endpointURL: plugin.settings.widgetSettings.endpointURL,
		};
	}

	return {
		model: "",
		modelName: "",
		modelType: "",
		historyIndex: -1,
		modelEndpoint: "",
		endpointURL: "",
	};
}

export function setHistoryIndex(
	plugin: LocalLLMPlugin,
	viewType: ViewType,
	length?: number
) {
	if (!length) {
		viewType === "modal"
			? (plugin.settings.modalSettings.historyIndex = -1)
			: (plugin.settings.widgetSettings.historyIndex = -1);
		plugin.saveSettings();
		return;
	}
	viewType === "modal"
		? (plugin.settings.modalSettings.historyIndex = length - 1)
		: (plugin.settings.widgetSettings.historyIndex = length - 1);
	plugin.saveSettings();
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
	"Mistral OpenOrca": {
		model: "mistral-7b-openorca.Q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"Mistral Instruct": {
		model: "mistral-7b-instruct-v0.1.Q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"GPT4All Falcon": {
		model: "gpt4all-falcon-newbpe-q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"Orca 2 (Medium)": {
		model: "orca-2-7b.Q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"Orca 2 (Full)": {
		model: "orca-2-13b.Q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"Mini Orca (Small)": {
		model: "orca-mini-3b-gguf2-q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"MPT Chat": {
		model: "mpt-7b-chat-newbpe-q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"Wizard v1.2": {
		model: "wizardlm-13b-v1.2.Q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	Hermes: {
		model: "nous-hermes-llama2-13b.Q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	Snoozy: {
		model: "gpt4all-13b-snoozy-q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"EM German Mistral": {
		model: "em_german_mistral_v01.Q4_0.gguf",
		type: "GPT4All",
		endpoint: "chat",
		url: "/v1/chat/completions",
	},
	"ChatGPT-3.5 Turbo": {
		model: "gpt-3.5-turbo",
		type: "openAI",
		endpoint: "chat",
		url: "/chat/completions",
	},
	// "Text Embedding 3 (Small)": {
	// 	model: "text-embedding-3-small",
	// 	type: "openAI",
	// 	endpoint: "embeddings",
	// 	url: "/embeddings",
	// },
	// "DALL·E 3": {
	// 	model: "dall-e-3",
	// 	type: "openAI",
	// 	endpoint: "images",
	// 	url: "/images/generations",
	// // },
	// "DALL·E 2": {
	// 	model: "dall-e-2",
	// 	type: "openAI",
	// 	endpoint: "images",
	// 	url: "/images/generations",
	// },
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
	// "text-embedding-3-small": "Text Embedding 3 (Small)",
	// "dall-e-3": "DALL·E 3",
	// "dall-e-2": "DALL·E 2",
};

// export function getModelNames():Record<string, string> {
//     let modelNames = Object.keys(models)
//     let names:Record<string, string> = {}
//     for(const name of modelNames) {
//         names[models[name].model] = name
//     }
// 	return names
// }

export const classNames = {
	modal: {
		"messages-div": "modal-messages-div",
		"title-border": "modal-title-border",
		"prompt-container": "modal-prompt-container",
		"text-area": "modal-chat-prompt-text-area",
		button: "modal-send-button",
	},
	widget: {
		"messages-div": "widget-messages-div",
		"title-border": "widget-title-border",
		"prompt-container": "widget-prompt-container",
		"text-area": "widget-chat-prompt-text-area",
		button: "widget-send-button",
	},
	"floating-action-button": {
		"messages-div": "fab-messages-div",
		"title-border": "fab-title-border",
		"prompt-container": "fab-prompt-container",
		"text-area": "fab-chat-prompt-text-area",
		button: "fab-send-button",
	},
};
