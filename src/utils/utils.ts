import { GPT4AllParams } from "Types/types";
import { existsSync } from "fs";
import { Editor } from "obsidian";

const path = require("path");
const homeDir = require("os").homedir();
export const DEFAULT_DIRECTORY = path.resolve(
	homeDir,
	"AppData/Local/nomic.ai/GPT4All/"
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

// function readChunks(reader: any) {
// 	return {
// 		async *[Symbol.asyncIterator]() {
// 			let readResult = await reader.read();
// 			while (!readResult.done) {
// 				yield readResult.value;
// 				readResult = await reader.read();
// 			}
// 		},
// 	};
// }

// export function dowloadModel(modelName: string, options = {}) {
// 	const modelUrl = `https://gpt4all.io/models/gguf/${modelName}`;
// 	const finalModelPath = path.join(DEFAULT_DIRECTORY, modelName);
// 	if (existsSync(finalModelPath)) {
// 		console.log(`Model already exists at ${finalModelPath}`);
// 	}

// 	const abortController = new AbortController();
// 	const signal = abortController.signal;
// 	const headers = {
// 		"Accept-Ranges": "arraybuffer",
// 		"Response-Type": "arraybuffer",
// 	};

// 	const downloadPromise = new Promise((res, rej) => {
// 		const writeStream = createWriteStream(modelName);

// 		writeStream.on("error", (e) => {
// 			writeStream.close();
// 			rej(e);
// 		});

// 		fetch(modelUrl, {
// 			signal,
// 			headers,
// 			mode: "no-cors"
// 		})
// 			.then((res) => {
// 				if (!res.ok) {
// 					const message = `Failed to download model from ${modelUrl} - ${res.status} ${res.statusText}`;
// 					rej(Error(message));
// 				}
// 				return res.body?.getReader();
// 			})
// 			.then(async (reader) => {
// 				for await (const chunk of readChunks(reader)) {
// 					writeStream.write(chunk);
// 				}
// 				writeStream.end();
// 			})
// 			.catch(rej);
// 	});

// 	return {
// 		cancel: () => abortController.abort(),
// 		promis: downloadPromise,
// 	};
// }

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
	let newLine;
	moveCursorToEndOfFile(editor!);

	if (type === "prompt") {
		newLine = `\n\n<hr class="__chatgpt_plugin">\n\nPrompt: ${message}\n\n`;
		editor.replaceRange(newLine, editor.getCursor());
	} else if (type === "response") {
		newLine = `${message}\n\n<hr class="__chatgpt_plugin">\n\n`;
		editor.replaceRange(newLine, editor.getCursor());
	} else {
		newLine = `<hr class="__chatgpt_plugin">\n\n${message}\n\n<hr class="__chatgpt_plugin">\n\n`;
		editor.replaceRange(newLine, editor.getCursor());
	}
	moveCursorToEndOfFile(editor!);
}
