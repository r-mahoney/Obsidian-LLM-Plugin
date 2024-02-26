export type GPT4AllParams = {
	messages: Message[];
	temperature: number;
	tokens: number;
	model: string;
};
export type ChatHistoryItem = {
	prompt: string;
	processedPrompt: string;
	messages: Message[];
	temperature: number;
	tokens: number;
	modelName: string;
	model: string;
};

export type TokenParams = {
	prefix: string[];
	postfix: string[];
};

export type Message = {
	role: "user" | "assistant";
	content: string;
};

export type Model = {
	model: string;
	type: string;
};

export type ViewType = "modal" | "widget" | "floating-action-button";
