import { Message } from "Types/types";
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
			console.log(this.prompt);
			promptField.inputEl.setText("");
			promptField.setValue("");
			this.prompt = "";
		});
	}

	setMessages(replaceChatHistory: boolean) {
		if (replaceChatHistory) {
			let history = this.plugin.settings.promptHistory;
			this.messages = history[this.plugin.settings.historyIndex].messages;
		} else {
			this.messages = [{ role: "user", content: this.processedPrompt }];
		}
	}

	getMessages() {
		return this.messages;
	}

	generateIMLikeMessgaes(messages: Message[]) {
		messages.map(({ role, content }, index) => {
			const imLikeMessage = this.historyMessages.createDiv();
			imLikeMessage.innerHTML = content;
			index % 2 === 0
				? (imLikeMessage.className = "flex-start")
				: (imLikeMessage.className = "flex-end");
            imLikeMessage.addClass("im-message")
		});
	}

    resetChat() {
        this.historyMessages.innerHTML  = ""
    }
}
