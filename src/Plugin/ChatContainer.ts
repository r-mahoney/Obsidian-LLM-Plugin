import { GPT4AllParams, Message } from "Types/types";
import LocalLLMPlugin from "main";
import {
	ButtonComponent,
	MarkdownView,
	Notice,
	TextAreaComponent,
	TextComponent,
} from "obsidian";
import { processReplacementTokens } from "utils/utils";

export class ChatContainer {
	historyMessages: HTMLElement;
	prompt: string;
	processedPrompt: string;
	messages: Message[];
	replaceChatHistory: boolean;
	historyIndex: number;
	constructor(private plugin: LocalLLMPlugin) {}

	private handleGenerateClick() {
		const view =
			this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		this.processedPrompt = processReplacementTokens(this.prompt);

		if (!view) {
			new Notice(
				"You must have a markdown file open to complete this action."
			);
			return;
		}
		this.setMessages(this.replaceChatHistory);
	}

	generateChatContainer(parentElement: HTMLElement) {
		// this.historyMessages = new TextAreaComponent(parentElement);
		this.historyMessages = parentElement.createDiv();
		this.historyMessages.className = "messages-div";
		const promptContainer = parentElement.createDiv();
		const promptField = new TextComponent(promptContainer);
		const sendButton = new ButtonComponent(promptContainer);

		// this.historyMessages.inputEl.className = "messages-div";
		promptContainer.className = "prompt-container";
		promptField.inputEl.className = "chat-prompt-text-area";
		promptField.inputEl.id = "chat-prompt-text-area";
		sendButton.buttonEl.className = "send-button";

		sendButton.setIcon("up-arrow-with-tail");

		promptField.onChange((change: string) => {
			this.prompt = change;
			promptField.setValue(change);
		});
		sendButton.onClick((e: MouseEvent) => {
			const params: GPT4AllParams = {
				messages: this.messages,
				temperature: this.plugin.settings.temperature / 10,
				tokens: this.plugin.settings.tokens,
				model: this.plugin.settings.model,
			};

			this.setMessages();
			promptField.inputEl.setText("");
			this.generateIMLikeMessgaes(this.messages);
			promptField.setValue("");
			this.prompt = "";
		});
	}

	setMessages(replaceChatHistory: boolean = false) {
		if (replaceChatHistory) {
			let history = this.plugin.settings.promptHistory;
			this.messages = history[this.plugin.settings.historyIndex].messages;
		} else {
			this.messages = [{ role: "user", content: this.prompt }];
			// this.messages = [{ role: "user", content: this.processedPrompt }];
		}
	}

	getMessages() {
		return this.messages;
	}

	generateIMLikeMessgaes(messages: Message[]) {
		messages.map(({ role, content }, index) => {
			const imLikeMessageContainer = this.historyMessages.createDiv();
			const icon = imLikeMessageContainer.createDiv();
			icon.innerHTML = role[0];
			const imLikeMessage = imLikeMessageContainer.createDiv();
			imLikeMessage.innerHTML = content;
			index % 2 === 0
				? (imLikeMessageContainer.className = "flex-start")
				: (imLikeMessageContainer.className = "flex-end");

			imLikeMessageContainer.addClass("im-like-message-container");
			icon.addClass("message-icon");
			imLikeMessage.addClass("im-like-message");
		});
	}

	resetChat() {
		this.historyMessages.innerHTML = "";
	}
}
