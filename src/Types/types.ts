type InitialParams = {
	prompt: string;
	messages: Message[];
	model: string;
}
export type ChatParams = InitialParams & {
	temperature: number;
	tokens: number;
};

export type ImageParams = InitialParams & {
	numberOfImages: number;
	response_format: "url" | "b64_json";
	size: string;
	style: "vivid" | "natural"
	quality?: "hd" |  "standard";
}
export type ChatHistoryItem = InitialParams & ChatParams & {
	processedPrompt: string;
	modelName: string;
};

export type ImageHistoryItem = InitialParams & ImageParams & {
	modelName: string
}

export type HistoryItem = ChatHistoryItem | ImageHistoryItem & {

}

export type TokenParams = {
	prefix: string[];
	postfix: string[];
};

export type Message = {
	// TODO - abstract role 'user' into a const
	role: "user" | "assistant";
	content: string;
};

export type Model = {
	model: string;
	type: string;
	endpoint: string;
	url: string;
};

export type ViewType = "modal" | "widget" | "floating-action-button";

export type ViewSettings = {
	model: string;
	modelName: string;
	modelType: string;
	historyIndex: number;
	modelEndpoint: string;
	endpointURL: string;
};
