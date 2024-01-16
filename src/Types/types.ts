export type ChatModalSettings = {
	loadLastItem?: boolean;
};

export type GPT4AllParams = {
	prompt: string;
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
