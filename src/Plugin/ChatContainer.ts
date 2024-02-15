import { GPT4AllParams, Message } from "Types/types";
import LocalLLMPlugin from "main";
import { ButtonComponent, Notice, TextComponent } from "obsidian";
import { appendMessage, messageGPT4AllServer } from "utils/utils";

export class ChatContainer {
	historyMessages: HTMLElement;
	prompt: string;
	processedPrompt: string;
	messages: Message[];
	replaceChatHistory: boolean;
	historyIndex: number;
	closeModal: () => void;
	constructor(private plugin: LocalLLMPlugin, closeModal: () => void) {
		this.closeModal = closeModal;
	}

	private handleGenerateClick() {
		if (!this.prompt) {
			new Notice("You need to ask a question first.");
			return;
		}
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
						modelName: this.plugin.settings.modelName,
						model: params.model,
					});
					const length = this.plugin.settings.promptHistory.length;
					this.plugin.settings.historyIndex = length - 1;
					this.plugin.saveSettings();
					this.prompt = "";
				}
			})
			.catch((err) => {
				if (err.message === "Failed to fetch") {
					new Notice(
						"You must have GPT4All open with the API Server enabled"
					);
					this.removeMessage();
				}
			});
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
		promptField.inputEl.addEventListener("keydown", (event) => {
			if (event.code == "Enter") {
				this.handleGenerateClick();
				promptField.inputEl.setText("");
				promptField.setValue("");
			}
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

	private createMessage(role: string, content: string, index: number) {
		const imLikeMessageContainer = this.historyMessages.createDiv();
		const icon = imLikeMessageContainer.createDiv();
		const imLikeMessage = imLikeMessageContainer.createDiv();
		const addText = new ButtonComponent(imLikeMessageContainer);

		addText.setIcon("files");
		icon.innerHTML = role[0];
		imLikeMessage.innerHTML = content;
		imLikeMessageContainer.addClass("im-like-message-container");
		addText.buttonEl.addClass("add-text", "hide");
		icon.addClass("message-icon");
		imLikeMessage.addClass("im-like-message");
		if (index % 2 === 0) {
			imLikeMessageContainer.addClass("flex-start");
		} else {
			imLikeMessageContainer.addClass("flex-end");
		}

		imLikeMessageContainer.addEventListener("mouseenter", () => {
			addText.buttonEl.removeClass("hide");
		});

		imLikeMessageContainer.addEventListener("mouseleave", () => {
			addText.buttonEl.addClass("hide");
		});

		addText.onClick(() => {
			const editor = this.plugin.app.workspace.activeEditor?.editor;
			if (!editor) {
				new Notice(
					"You must have a Markdown File open to complete this action."
				);
				return;
			}
			appendMessage(editor, content);
			//Use this if we want to close modal after adding any text
			// this.closeModal();
		});
	}

	generateIMLikeMessgaes(messages: Message[]) {
		messages.map(({ role, content }, index) => {
			this.createMessage(role, content, index);
		});
	}

	appendNewMessage(message: Message) {
		const length = this.historyMessages.childNodes.length;
		const { role, content } = message;

		this.createMessage(role, content, length);

		this.historyMessages.scroll(0, 9999);
	}

	removeMessage() {
		this.messages.pop();
		this.historyMessages.lastElementChild?.remove();
	}

	resetChat() {
		this.historyMessages.innerHTML = "";
	}
}
