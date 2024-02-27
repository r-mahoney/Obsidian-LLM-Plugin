import { GPT4AllParams, Message, ViewType } from "Types/types";
import LocalLLMPlugin from "main";
import { ButtonComponent, Notice, TextComponent, View } from "obsidian";
import {
	messageGPT4AllServer,
	openAIMessage,
	classNames,
	getViewInfo,
	setHistoryIndex,
} from "utils/utils";
import { Header } from "./Header";
import { ChatCompletionChunk } from "openai/resources";
import { Stream } from "openai/streaming";

export class ChatContainer {
	historyMessages: HTMLElement;
	prompt: string;
	processedPrompt: string;
	messages: Message[];
	replaceChatHistory: boolean;
	loadingDivContainer: HTMLElement;
	streamingDiv: HTMLElement;
	viewType: ViewType;
	// closeModal?: () => void;
	constructor(
		private plugin: LocalLLMPlugin,
		viewType: ViewType /*closeModal?: () => void*/
	) {
		// this.closeModal = closeModal;
		this.viewType = viewType;
	}

	async handleGenerateClick(header: Header) {
		const { model, modelName, modelType, endpointURL, modelEndpoint } =
			getViewInfo(this.plugin, this.viewType);
		if (!this.prompt) {
			new Notice("You need to ask a question first.");
			return;
		}
		this.messages.push({ role: "user", content: this.prompt });
		this.appendNewMessage({ role: "user", content: this.prompt });
		header.setHeader(modelName, this.prompt);
		const params: GPT4AllParams = {
			prompt: this.prompt,
			messages: this.messages,
			temperature: this.plugin.settings.temperature,
			tokens: this.plugin.settings.tokens,
			model,
		};
		try {
			if (modelType === "GPT4All") {
				this.setDiv(false);
				messageGPT4AllServer(params, endpointURL)
					.then((response: Message) => {
						this.removeLodingDiv();
						this.messages.push(response);
						this.appendNewMessage(response);
						this.historyPush(params);
					})
					.catch((err) => {
						if (err.message === "Failed to fetch") {
							new Notice(
								"You must have GPT4All open with the API Server enabled"
							);
							this.removeMessage(header, modelName);
						}
					});
			} else {
				const API_KEY = this.plugin.settings.openAIAPIKey;
				if (!API_KEY) {
					setTimeout(() => {
						this.removeMessage(header, modelName);
					}, 1000);
					new Notice(
						"You must have an OpenAI API Key in order to use OpenAI models"
					);
				}
				let previewText = "";
				if (modelEndpoint === "chat") {
					const stream = await openAIMessage(
						params,
						this.plugin.settings.openAIAPIKey,
						endpointURL,
						modelEndpoint
					);
					this.setDiv(true);
					for await (const chunk of stream as Stream<ChatCompletionChunk>) {
						previewText += chunk.choices[0]?.delta?.content || "";
						this.streamingDiv.innerHTML = previewText;
						this.historyMessages.scroll(0, 9999);
					}
					this.historyPush(params);
					this.messages.push({
						role: "assistant",
						content: previewText,
					});
				}
				if (modelEndpoint === "images") {
					this.setDiv(false);
					await openAIMessage(
						params,
						this.plugin.settings.openAIAPIKey,
						endpointURL,
						modelEndpoint
					).then((response: string) => {
						this.removeLodingDiv();
						// this.messages.push(response);
						this.appendImage(response);
						// this.historyPush(params);
					});
				}
			}
		} catch (error) {}
	}

	historyPush(params: GPT4AllParams) {
		const { modelName, historyIndex } = getViewInfo(
			this.plugin,
			this.viewType
		);
		if (historyIndex > -1) {
			this.plugin.history.overwriteHistory(this.messages, historyIndex);
		} else {
			this.plugin.history.push({
				prompt: this.prompt,
				processedPrompt: this.processedPrompt,
				messages: params.messages,
				temperature: params.temperature,
				tokens: params.tokens,
				modelName: modelName,
				model: params.model,
			});
			const length = this.plugin.settings.promptHistory.length;
			setHistoryIndex(this.plugin, this.viewType, length);
			this.plugin.saveSettings();
			this.prompt = "";
		}
	}

	generateChatContainer(parentElement: Element, header: Header) {
		this.messages = [];
		this.historyMessages = parentElement.createDiv();
		this.historyMessages.className =
			classNames[this.viewType]["messages-div"];
		const promptContainer = parentElement.createDiv();
		const promptField = new TextComponent(promptContainer);
		const sendButton = new ButtonComponent(promptContainer);

		promptContainer.className =
			classNames[this.viewType]["prompt-container"];
		promptField.inputEl.className = classNames[this.viewType]["text-area"];
		promptField.inputEl.id = "chat-prompt-text-area";
		sendButton.buttonEl.className = classNames[this.viewType].button;

		sendButton.setIcon("up-arrow-with-tail");
		sendButton.setTooltip("Send Prompt");

		promptField.onChange((change: string) => {
			this.prompt = change;
			promptField.setValue(change);
		});
		promptField.inputEl.addEventListener("keydown", (event) => {
			if (event.code == "Enter") {
				this.handleGenerateClick(header);
				promptField.inputEl.setText("");
				promptField.setValue("");
			}
		});
		sendButton.onClick(() => {
			this.handleGenerateClick(header);
			promptField.inputEl.setText("");
			promptField.setValue("");
		});
	}

	setMessages(replaceChatHistory: boolean = false) {
		const settings: Record<string, string> = {
			modal: "modalSettings",
			widget: "widgetSettings",
		};
		const settingType: "modalSettings" | "widgetSettings" = settings[
			this.viewType
		] as "modalSettings" | "widgetSettings";
		const index = this.plugin.settings[settingType].historyIndex;
		if (replaceChatHistory) {
			let history = this.plugin.settings.promptHistory;
			this.messages = history[index].messages;
		} else {
			this.messages.push({ role: "user", content: this.prompt });
		}
	}

	getMessages() {
		return this.messages;
	}

	resetMessages() {
		this.messages = [];
	}

	setDiv(streaming: boolean) {
		this.loadingDivContainer = this.historyMessages.createDiv();
		const loadingIcon = this.loadingDivContainer.createDiv();
		this.streamingDiv = this.loadingDivContainer.createDiv();
		const addText = new ButtonComponent(this.loadingDivContainer);
		addText.setIcon("files");
		addText.buttonEl.addClass("add-text", "hide");
		streaming
			? (this.streamingDiv.innerHTML = "")
			: (this.streamingDiv.innerHTML = `Loading<span class="bouncing-dots"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>`);
		loadingIcon.innerHTML = "A";
		loadingIcon.addClass("message-icon");
		this.streamingDiv.addClass("im-like-message");
		this.loadingDivContainer.addClass(
			"flex-end",
			"im-like-message-container"
		);
		this.historyMessages.scroll(0, 9999);

		if (streaming) {
			this.loadingDivContainer.addEventListener("mouseenter", () => {
				addText.buttonEl.removeClass("hide");
			});

			this.loadingDivContainer.addEventListener("mouseleave", () => {
				addText.buttonEl.addClass("hide");
			});
		}

		addText.onClick(async () => {
			await navigator.clipboard.writeText(this.streamingDiv.innerHTML);
			new Notice("Text copied to clipboard");
		});
	}

	removeLodingDiv() {
		this.loadingDivContainer.remove();
	}

	appendImage(image: string) {
		const length = this.historyMessages.childNodes.length;
		const imLikeMessageContainer = this.historyMessages.createDiv();
		const icon = imLikeMessageContainer.createDiv();
		const imLikeMessage = imLikeMessageContainer.createDiv();
		icon.innerHTML = "A";
		imLikeMessage.innerHTML = `<img src=${image} alt="image generated with ${this.prompt}" width="250" height="300">`;
		imLikeMessageContainer.addClass("im-like-message-container");
		icon.addClass("message-icon");
		imLikeMessage.addClass("im-like-message");
		if (length % 2 === 0) {
			imLikeMessageContainer.addClass("flex-start");
		} else {
			imLikeMessageContainer.addClass("flex-end");
		}
		this.historyMessages.scroll(0, 9999);
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

		addText.setTooltip("Copy to clipboard");
		addText.onClick(async () => {
			await navigator.clipboard.writeText(content);
			new Notice("Text copied to clipboard");
		});
		this.historyMessages.scroll(0, 9999);
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

	removeMessage(header: Header, modelName: string) {
		this.messages.pop();
		this.historyMessages.lastElementChild?.remove();
		if (this.historyMessages.children.length < 1) {
			header.setHeader(modelName, "LLM Plugin");
		}
	}

	resetChat() {
		this.historyMessages.innerHTML = "";
	}
}
