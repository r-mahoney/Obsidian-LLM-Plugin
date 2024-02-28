import { Model } from "Types/types";

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