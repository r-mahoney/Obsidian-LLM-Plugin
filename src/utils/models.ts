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
	"GPT-4o": {
		model: "gpt-4o",
		type: "openAI",
		endpoint: "chat",
		url: "/chat/completions",
	},
	// Claude Models
	"Claude-3-5-Sonnet-20240620": {
		model: "claude-3-5-sonnet-20240620",
		type: "claude",
		endpoint: "messages",
		url: "/v1/messages",
	},
	// "Text to Speech": {
	// 	model: "tts-1",
	// 	type: "openAI",
	// 	endpoint: "speech",
	// 	url: "/audio/speech",
	// },
	// "Text to Speech (HD)": {
	// 	model: "tts-1-hd",
	// 	type: "openAI",
	// 	endpoint: "speech",
	// 	url: "/audio/speech",
	// },
	"DALL·E 3": {
		model: "dall-e-3",
		type: "openAI",
		endpoint: "images",
		url: "/images/generations",
	},
	"DALL·E 2": {
		model: "dall-e-2",
		type: "openAI",
		endpoint: "images",
		url: "/images/generations",
	},
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
	"gpt-4o": "GPT-4o",
	// "text-embedding-3-small": "Text Embedding 3 (Small)",
	"dall-e-3": "DALL·E 3",
	"dall-e-2": "DALL·E 2",
	// "tts-1": "Text to Speech",
	// "tts-1-hd": "Text to Speech (HD)"
};