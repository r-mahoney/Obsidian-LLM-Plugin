import { GPT4AllParams, Message } from "Types/types";
import LocalLLMPlugin from "main";
import { ButtonComponent, MarkdownView, Notice, TextComponent } from "obsidian";
import { messageGPT4AllServer, processReplacementTokens } from "utils/utils";

export class ChatContainer {
	historyMessages: HTMLElement;
	prompt: string;
	processedPrompt: string;
	messages: Message[];
	replaceChatHistory: boolean;
	historyIndex: number;
	constructor(private plugin: LocalLLMPlugin) {}

	private handleGenerateClick() {
		this.messages.push({ role: "user", content: this.prompt });
			this.appendNewMessage({ role: "user", content: this.prompt });

			const params: GPT4AllParams = {
				messages: this.messages,
				temperature: this.plugin.settings.temperature / 10,
				tokens: this.plugin.settings.tokens,
				model: this.plugin.settings.model,
			};

			messageGPT4AllServer(params)
				.then((response: Message) => {
					this.messages.push(response);
					this.appendNewMessage(response);
					if (this.plugin.settings.historyIndex > -1) {
						this.plugin.history.overwriteHistory(
							this.messages,
							this.plugin.settings.historyIndex
						);
					} else {
						this.plugin.history.push({
							prompt: this.prompt,
							processedPrompt: this.processedPrompt,
							messages: params.messages,
							temperature: params.temperature,
							tokens: params.tokens,
						});
					const length = this.plugin.settings.promptHistory.length
					this.plugin.settings.historyIndex = length - 1;
					this.plugin.saveSettings()
					this.prompt = "";
					}
				})
				.catch((err) => console.log(err));
	}

	generateChatContainer(parentElement: HTMLElement) {
		this.messages = [];
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
		sendButton.onClick(() => {
			this.handleGenerateClick();
			promptField.inputEl.setText("");
			promptField.setValue("");
		});
	}

	setMessages(replaceChatHistory: boolean = false) {
		if (replaceChatHistory) {
			let history = this.plugin.settings.promptHistory;
			this.messages = history[this.plugin.settings.historyIndex].messages;
		} else {
			this.messages.push({ role: "user", content: this.prompt });
			// this.messages.push({ role: "user", content: this.processedPrompt });
		}
	}

	getMessages() {
		return this.messages;
	}

	resetMessages() {
		this.messages = [];
	}

	generateIMLikeMessgaes(messages: Message[]) {
		messages.map(({ role, content }, index) => {
			const imLikeMessageContainer = this.historyMessages.createDiv();
			const icon = imLikeMessageContainer.createDiv();
			icon.innerHTML = role[0];
			const imLikeMessage = imLikeMessageContainer.createDiv();
			imLikeMessage.innerHTML = content;
			imLikeMessageContainer.addClass("im-like-message-container");
			icon.addClass("message-icon");
			imLikeMessage.addClass("im-like-message");
			// let width = imLikeMessage.offsetWidth
			if (index % 2 === 0) {
				imLikeMessageContainer.addClass("flex-start");
			} else {
				imLikeMessageContainer.addClass("flex-end");
				// imLikeMessageContainer.setAttr("style", `padding: 5px 5px 5px calc(100% - ${width}px); max-width: none`)
			}
		});
	}

	appendNewMessage(message: Message) {
		const length = this.historyMessages.childNodes.length;
		const { role, content } = message;

		const imLikeMessageContainer = this.historyMessages.createDiv();
		const icon = imLikeMessageContainer.createDiv();
		icon.innerHTML = role[0];
		const imLikeMessage = imLikeMessageContainer.createDiv();
		imLikeMessage.innerHTML = content;
		imLikeMessageContainer.addClass("im-like-message-container");
		icon.addClass("message-icon");
		imLikeMessage.addClass("im-like-message");
		if (length % 2 === 0) {
			imLikeMessageContainer.addClass("flex-start");
		} else {
			imLikeMessageContainer.addClass("flex-end"); // imLikeMessageContainer.setAttr("style", `padding: 5px 5px 5px calc(100% - ${width}px); max-width: none`)
		}
	}

	resetChat() {
		this.historyMessages.innerHTML = "";
	}
}
