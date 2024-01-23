export type ChatModalSettings = {
	loadLastItem?: boolean;
};

export type GPT4AllParams = {
	messages: Message[];
	temperature: number;
	tokens: number;
	model: string;
};
export type ChatHistoryItem = {
	prompt: string;
	processedPrompt: string;
	temperature: number;
	tokens: number;
};

export type TokenParams = {
	prefix: string[];
	postfix: string[];
};

export type Message = {
	role: "user" | "assistant";
	content: string
}