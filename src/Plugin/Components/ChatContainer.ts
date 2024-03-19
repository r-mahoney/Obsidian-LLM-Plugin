import { errorMessages, settingsErrorHandling } from "Plugin/Errors/errors";
import { GPT4AllParams, Message, ViewType } from "Types/types";
import LLMPlugin from "main";
import { ButtonComponent, Notice, TextAreaComponent } from "obsidian";
import { ChatCompletionChunk } from "openai/resources";
import { Stream } from "openai/streaming";
import { classNames } from "utils/classNames";
import {
	getViewInfo,
	messageGPT4AllServer,
	openAIMessage,
	setHistoryIndex,
} from "utils/utils";
import { Header } from "./Header";

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
		private plugin: LLMPlugin,
		viewType: ViewType /*closeModal?: () => void*/
	) {
		// this.closeModal = closeModal;
		this.viewType = viewType;
	}

	async handleGenerateClick(header: Header, sendButton: ButtonComponent) {
		header.disableButtons();
		sendButton.setDisabled(true);
		const { model, modelName, modelType, endpointURL, modelEndpoint } =
			getViewInfo(this.plugin, this.viewType);
		if (this.historyMessages.children.length < 1) {
			header.setHeader(modelName, this.prompt);
		}
		this.messages.push({ role: "user", content: this.prompt });
		const params: GPT4AllParams = {
			prompt: this.prompt,
			messages: this.messages,
			temperature: this.plugin.settings.temperature,
			tokens: this.plugin.settings.tokens,
			model,
		};
		try {
			if (settingsErrorHandling(params).length > 0) {
				throw new Error("Incorrect Settings");
			}
			this.appendNewMessage({ role: "user", content: this.prompt });
			if (this.plugin.settings.GPT4AllStreaming)
				throw new Error("GPT4All streaming");
			if (modelType === "GPT4All") {
				this.plugin.settings.GPT4AllStreaming = true;
				this.setDiv(false);
				messageGPT4AllServer(params, endpointURL)
					.then((response: Message) => {
						this.removeLodingDiv();
						this.messages.push(response);
						this.appendNewMessage(response);
						this.historyPush(params);
					})
					.catch((err) => {
						this.removeLodingDiv();
						errorMessages(err, params);
						if (this.messages.length > 0) {
							setTimeout(() => {
								this.removeMessage(header, modelName);
							}, 1000);
						}
					})
					.finally(() => {
						this.prompt = "";
						header.enableButtons();
						sendButton.setDisabled(false);
						this.plugin.settings.GPT4AllStreaming = false;
					});
			} else {
				const API_KEY = this.plugin.settings.openAIAPIKey;
				if (!API_KEY) {
					throw new Error("No API Key");
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
					header.enableButtons();
					sendButton.setDisabled(false);
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
		} catch (error) {
			header.enableButtons();
			sendButton.setDisabled(false);
			this.plugin.settings.GPT4AllStreaming = false;
			this.prompt = "";
			errorMessages(error, params);
			if (this.messages.length > 0) {
				setTimeout(() => {
					this.removeMessage(header, modelName);
				}, 1000);
			}
		}
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

	auto_height(elem: TextAreaComponent, parentElement: Element) {
		elem.inputEl.style.height = "50px";
		const height = elem.inputEl.scrollHeight - 5;
		if (!(height > Number(elem.inputEl.style.height.slice(0, 2)))) return;
		elem.inputEl.style.height = `${height}px`;
		elem.inputEl.style.overflow = "hidden";
		parentElement.scrollTo(0, 9999);
	}

	generateChatContainer(parentElement: Element, header: Header) {
		this.messages = [];
		this.historyMessages = parentElement.createDiv();
		this.historyMessages.className =
			classNames[this.viewType]["messages-div"];
		const promptContainer = parentElement.createDiv();
		const promptField = new TextAreaComponent(promptContainer);
		const sendButton = new ButtonComponent(promptContainer);

		if (this.viewType === "floating-action-button") {
			promptContainer.addClass("flex");
		}
		promptContainer.addClass(classNames[this.viewType]["prompt-container"]);
		promptField.inputEl.className = classNames[this.viewType]["text-area"];
		promptField.inputEl.id = "chat-prompt-text-area";
		promptContainer.addEventListener("input", () => {
			this.auto_height(promptField, parentElement);
		});
		sendButton.buttonEl.addClass(
			classNames[this.viewType].button,
			"send-button"
		);
		sendButton.setIcon("up-arrow-with-tail");
		sendButton.setTooltip("Send Prompt");

		promptField.onChange((change: string) => {
			this.prompt = change;
			promptField.setValue(change);
		});
		promptField.inputEl.addEventListener("keydown", (event) => {
			if (sendButton.disabled === true) return;

			if (event.code == "Enter") {
				event.preventDefault();
				this.handleGenerateClick(header, sendButton);
				promptField.inputEl.setText("");
				promptField.setValue("");
			}
		});
		sendButton.onClick(() => {
			this.handleGenerateClick(header, sendButton);
			promptField.inputEl.setText("");
			promptField.setValue("");
		});
	}

	setMessages(replaceChatHistory: boolean = false) {
		const settings: Record<string, string> = {
			modal: "modalSettings",
			widget: "widgetSettings",
			"floating-action-button": "fabSettings",
		};
		const settingType = settings[this.viewType] as
			| "modalSettings"
			| "widgetSettings"
			| "fabSettings";
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
			: (this.streamingDiv.innerHTML = `<span class="bouncing-dots"><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></span>`);
		loadingIcon.innerHTML = "A";
		loadingIcon.addClass("message-icon");
		this.streamingDiv.addClass("im-like-message");
		this.loadingDivContainer.addClass(
			"flex-end",
			"im-like-message-container",
			"flex"
		);

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
		imLikeMessageContainer.addClass("im-like-message-container", "flex");
		icon.addClass("message-icon");
		imLikeMessage.addClass("im-like-message");
		if (length % 2 === 0) {
			imLikeMessageContainer.addClass("flex-start", "flex");
		} else {
			imLikeMessageContainer.addClass("flex-end", "flex");
		}
		
	}

	private createMessage(role: string, content: string, index: number) {
		const imLikeMessageContainer = this.historyMessages.createDiv();
		const icon = imLikeMessageContainer.createDiv();
		const imLikeMessage = imLikeMessageContainer.createDiv();
		const addText = new ButtonComponent(imLikeMessageContainer);

		addText.setIcon("files");
		icon.innerHTML = role[0];
		imLikeMessage.innerHTML = content;
		imLikeMessageContainer.addClass("im-like-message-container", "flex");
		addText.buttonEl.addClass("add-text", "hide");
		icon.addClass("message-icon");
		imLikeMessage.addClass(
			"im-like-message",
			classNames[this.viewType]["chat-message"]
		);
		if (index % 2 === 0) {
			imLikeMessageContainer.addClass("flex-start", "flex");
		} else {
			imLikeMessageContainer.addClass("flex-end", "flex");
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
	}

	generateIMLikeMessgaes(messages: Message[]) {
		messages.map(({ role, content }, index) => {
			this.createMessage(role, content, index);
		});
		console.log(this.historyMessages)
		this.historyMessages.scroll(0, 9999);
	}

	appendNewMessage(message: Message) {
		const length = this.historyMessages.childNodes.length;
		const { role, content } = message;

		this.createMessage(role, content, length);
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
