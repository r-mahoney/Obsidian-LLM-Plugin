import LLMPlugin from "main";
import {
	ButtonComponent,
	MarkdownRenderer,
	Notice,
	TextAreaComponent,
} from "obsidian";
import { ChatCompletionChunk, Images } from "openai/resources";
import { Stream } from "openai/streaming";
import { errorMessages, settingsErrorHandling } from "Plugin/Errors/errors";
import {
	ChatHistoryItem,
	ChatParams,
	HistoryItem,
	ImageHistoryItem,
	ImageParams,
	Message,
	SpeechParams,
	ViewType,
} from "Types/types";
import { classNames } from "utils/classNames";
import {
	getSettingType,
	getViewInfo,
	messageGPT4AllServer,
	openAIMessage,
	setHistoryIndex,
} from "utils/utils";
import { Header } from "./Header";

export class ChatContainer {
	historyMessages: HTMLElement;
	prompt: string;
	messages: Message[];
	replaceChatHistory: boolean;
	loadingDivContainer: HTMLElement;
	streamingDiv: HTMLElement;
	viewType: ViewType;
	previewText: string;
	// closeModal?: () => void;
	constructor(
		private plugin: LLMPlugin,
		viewType: ViewType /*closeModal?: () => void*/
	) {
		// this.closeModal = closeModal;
		this.viewType = viewType;
	}

	getParams(endpoint: string, model: string, modelType: string) {
		const settingType = getSettingType(this.viewType);
		if (endpoint === "images") {
			const params: ImageParams = {
				prompt: this.prompt,
				messages: this.messages,
				model,
				...this.plugin.settings[settingType].imageSettings,
			};
			return params;
		}

		if (endpoint === "chat") {
			if (modelType === "GPT4All") {
				const params: ChatParams = {
					prompt: this.prompt,
					messages: this.messages,
					model,
					temperature:
						this.plugin.settings[settingType].chatSettings
							.temperature,
					tokens: this.plugin.settings[settingType].chatSettings
						.maxTokens,
					...this.plugin.settings[settingType].chatSettings.GPT4All,
				};

				return params;
			}

			const params: ChatParams = {
				prompt: this.prompt,
				messages: this.messages,
				model,
				temperature:
					this.plugin.settings[settingType].chatSettings.temperature,
				tokens: this.plugin.settings[settingType].chatSettings
					.maxTokens,
				...this.plugin.settings[settingType].chatSettings.openAI,
			};
			return params;
		}

		if (endpoint === "speech") {
			const params: SpeechParams = {
				model,
				input: this.prompt,
				voice: this.plugin.settings[settingType].speechSettings.voice,
				responseFormat:
					this.plugin.settings[settingType].speechSettings
						.responseFormat,
				speed: this.plugin.settings[settingType].speechSettings.speed,
			};
			return params;
		}
	}

	async regenerateOutput() {
		this.removeLastMessageAndHistoryMessage();
		this.handleGenerate();
	}

	async handleGenerate() {
		// TODO - support more than chatgpt

		this.previewText = "";
		const { model, endpointURL, modelEndpoint, modelType } = getViewInfo(
			this.plugin,
			this.viewType
		);
		const params = this.getParams(modelEndpoint, model, modelType);
		if (modelEndpoint === "chat") {
			const stream = await openAIMessage(
				params as ChatParams,
				this.plugin.settings.openAIAPIKey,
				endpointURL,
				modelEndpoint
			);
			this.setDiv(true);
			for await (const chunk of stream as Stream<ChatCompletionChunk>) {
				this.previewText += chunk.choices[0]?.delta?.content || "";
				this.streamingDiv.innerHTML = this.previewText;
				this.historyMessages.scroll(0, 9999);
			}
			this.streamingDiv.innerHTML = "";
			MarkdownRenderer.render(
				this.plugin.app,
				this.previewText,
				this.streamingDiv,
				"",
				this.plugin
			);
			const copyButton = this.streamingDiv.querySelectorAll(
				".copy-code-button"
			) as NodeListOf<HTMLElement>;
			copyButton.forEach((item) => {
				item.setAttribute("style", "display: none");
			});
			this.messages.push({
				role: "assistant",
				content: this.previewText,
			});
			const message_context = {
				...(params as ChatParams),
				messages: this.messages,
			} as ChatHistoryItem;
			this.historyPush(message_context);
		}
	}

	async handleGenerateClick(header: Header, sendButton: ButtonComponent) {
		header.disableButtons();
		sendButton.setDisabled(true);

		// The refresh button should only be displayed on the most recent
		// assistant message.
		const refreshButton =
			this.historyMessages.querySelector(".refresh-output");
		refreshButton?.remove();

		const { model, modelName, modelType, endpointURL, modelEndpoint } =
			getViewInfo(this.plugin, this.viewType);
		if (this.historyMessages.children.length < 1) {
			header.setHeader(modelName, this.prompt);
		}
		this.messages.push({ role: "user", content: this.prompt });
		const params = this.getParams(modelEndpoint, model, modelType);
		try {
			// if (settingsErrorHandling(params).length > 0) {
			// 	throw new Error("Incorrect Settings");
			// }
			this.appendNewMessage({ role: "user", content: this.prompt });
			if (this.plugin.settings.GPT4AllStreaming)
				throw new Error("GPT4All streaming");
			if (modelType === "GPT4All") {
				this.plugin.settings.GPT4AllStreaming = true;
				this.setDiv(false);
				messageGPT4AllServer(params as ChatParams, endpointURL).then(
					(response: Message) => {
						this.removeLodingDiv();
						this.messages.push(response);
						this.appendNewMessage(response);
						this.historyPush(params as ChatHistoryItem);
					}
				);
			} else {
				const API_KEY = this.plugin.settings.openAIAPIKey;
				if (!API_KEY) {
					throw new Error("No API Key");
				}
				this.previewText = "";
				if (modelEndpoint === "chat") {
					this.handleGenerate();
				}

				if (modelEndpoint === "images") {
					this.setDiv(false);
					await openAIMessage(
						params as ImageParams,
						this.plugin.settings.openAIAPIKey,
						endpointURL,
						modelEndpoint
					).then((response: string[]) => {
						let content = "";
						response.map((url) => {
							content += `![created with prompt ${this.prompt}](${url})`;
						});
						// Patch spelling
						this.removeLodingDiv();
						this.messages.push({
							role: "assistant",
							content,
						});
						this.appendImage(response);
						this.historyPush({
							...params,
							messages: this.messages,
						} as ImageHistoryItem);
					});
				}
				if (modelEndpoint === "speech") {
					const response = await openAIMessage(
						params as SpeechParams,
						this.plugin.settings.openAIAPIKey,
						endpointURL,
						modelEndpoint
					);
				}
				header.enableButtons();
				sendButton.setDisabled(false);
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

	historyPush(params: HistoryItem) {
		const { modelName, historyIndex, modelEndpoint } = getViewInfo(
			this.plugin,
			this.viewType
		);
		if (historyIndex > -1) {
			this.plugin.history.overwriteHistory(this.messages, historyIndex);
			return;
		}

		if (modelEndpoint === "chat") {
			this.plugin.history.push({
				...(params as ChatHistoryItem),
				modelName,
			});
		}
		if (modelEndpoint === "images") {
			this.plugin.history.push({
				...(params as ImageHistoryItem),
				modelName,
			});
		}
		const length = this.plugin.settings.promptHistory.length;
		setHistoryIndex(this.plugin, this.viewType, length);
		this.plugin.saveSettings();
		this.prompt = "";
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

		promptField.setPlaceholder("Send a message...");

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

		const copyToClipboardButton = new ButtonComponent(
			this.loadingDivContainer
		);
		copyToClipboardButton.setIcon("files");

		const refreshButton = new ButtonComponent(this.loadingDivContainer);
		refreshButton.setIcon("refresh-cw");

		copyToClipboardButton.buttonEl.addClass("add-text", "hide");
		refreshButton.buttonEl.addClass("refresh-output", "hide");

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
				copyToClipboardButton.buttonEl.removeClass("hide");
				refreshButton.buttonEl.removeClass("hide");
			});

			this.loadingDivContainer.addEventListener("mouseleave", () => {
				copyToClipboardButton.buttonEl.addClass("hide");
				refreshButton.buttonEl.addClass("hide");
			});
		}

		copyToClipboardButton.onClick(async () => {
			await navigator.clipboard.writeText(this.previewText);
			new Notice("Text copied to clipboard");
		});

		refreshButton.onClick(async () => {
			new Notice("Regenerating response...");
			this.regenerateOutput();
		});
	}

	removeLodingDiv() {
		this.loadingDivContainer.remove();
	}

	appendImage(imageURLs: string[]) {
		const length = this.historyMessages.childNodes.length;
		const imLikeMessageContainer = this.historyMessages.createDiv();
		const icon = imLikeMessageContainer.createDiv();
		const imLikeMessage = imLikeMessageContainer.createDiv();
		icon.innerHTML = "A";
		imageURLs.map((url) => {
			imLikeMessage.innerHTML += `<img src=${url} alt="image generated with ${this.prompt}">\n`;
		});
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
		const copyToClipboardButton = new ButtonComponent(
			imLikeMessageContainer
		);

		copyToClipboardButton.setIcon("files");
		icon.innerHTML = role[0];
		// imLikeMessage.innerHTML = content;
		MarkdownRenderer.render(
			this.plugin.app,
			content,
			imLikeMessage,
			"",
			this.plugin
		);
		const copyButton = imLikeMessage.querySelectorAll(
			".copy-code-button"
		) as NodeListOf<HTMLElement>;
		copyButton.forEach((item) => {
			item.setAttribute("style", "display: none");
		});
		imLikeMessageContainer.addClass("im-like-message-container", "flex");
		copyToClipboardButton.buttonEl.addClass("add-text", "hide");
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
			copyToClipboardButton.buttonEl.removeClass("hide");
		});

		imLikeMessageContainer.addEventListener("mouseleave", () => {
			copyToClipboardButton.buttonEl.addClass("hide");
		});

		copyToClipboardButton.setTooltip("Copy to clipboard");
		copyToClipboardButton.onClick(async () => {
			await navigator.clipboard.writeText(content);
			new Notice("Text copied to clipboard");
		});
	}

	generateIMLikeMessgaes(messages: Message[]) {
		messages.map(({ role, content }, index) => {
			this.createMessage(role, content, index);
		});
		this.historyMessages.scroll(0, 9999);
	}

	appendNewMessage(message: Message) {
		const length = this.historyMessages.childNodes.length;
		const { role, content } = message;

		this.createMessage(role, content, length);
	}
	removeLastMessageAndHistoryMessage() {
		this.messages.pop();
		this.historyMessages.lastElementChild?.remove();
	}

	removeMessage(header: Header, modelName: string) {
		this.removeLastMessageAndHistoryMessage();
		if (this.historyMessages.children.length < 1) {
			header.setHeader(modelName, "LLM Plugin");
		}
	}

	resetChat() {
		this.historyMessages.innerHTML = "";
	}
}
