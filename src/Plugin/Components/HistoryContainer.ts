import { ChatHistoryItem, ViewType } from "Types/types";
import LocalLLMPlugin, { DEFAULT_SETTINGS } from "main";
import { ButtonComponent, Notice } from "obsidian";
import { ChatContainer } from "./ChatContainer";
import { Header } from "./Header";
import { models } from "utils/utils";

export class HistoryContainer {
	viewType: string;
	model: string;
	modelName: string;
	modelType: string;
	historyIndex: number;
	constructor(private plugin: LocalLLMPlugin, viewType: ViewType) {
		this.viewType = viewType;
	}

	generateHistoryContainer(
		parentElement: HTMLElement,
		history: ChatHistoryItem[],
		hideContainer: (container: HTMLElement) => void,
		showContainer: (container: HTMLElement) => void,
		containerToShow: HTMLElement,
		chat: ChatContainer,
		Header: Header
	) {
		const settings: Record<string, string> = {'modal': 'modalSettings', 'widget': 'widgetSettings'}
		const settingType: ('modalSettings' | 'widgetSettings') = settings[this.viewType] as ('modalSettings' | 'widgetSettings')
		if (this.viewType === "modal") {
			this.model = this.plugin.settings.modalSettings.model;
			this.modelName = this.plugin.settings.modalSettings.modelName;
			this.modelType = this.plugin.settings.modalSettings.modelType;
			this.modelType = this.plugin.settings.modalSettings.modelType;
			this.historyIndex = this.plugin.settings.modalSettings.historyIndex;
		} else {
			this.model = this.plugin.settings.widgetSettings.model;
			this.modelName = this.plugin.settings.widgetSettings.modelName;
			this.modelType = this.plugin.settings.widgetSettings.modelType;
			this.modelType = this.plugin.settings.widgetSettings.modelType;
			this.historyIndex =
				this.plugin.settings.widgetSettings.historyIndex;
		}

		const eventListener = () => {
			chat.resetChat();
			hideContainer(parentElement);
			showContainer(containerToShow);
			chat.setMessages(true);
			const messages = chat.getMessages();
			chat.generateIMLikeMessgaes(messages);
			containerToShow.querySelector(".messages-div")?.scroll(0, 9999);
			const index = this.historyIndex;
			const header = this.plugin.settings.promptHistory[index].prompt;
			const modelName =
				this.plugin.settings.promptHistory[index].modelName;
			this.plugin.settings[settingType].modelName = modelName
			this.plugin.settings[settingType].model = models[modelName].model
			this.plugin.saveSettings();
			Header.setHeader(modelName, header);
			Header.resetHistoryButton();
		};

		eventListener.bind(this);

		const disableHistory = (
			collection: HTMLCollection,
			index: number,
			enabled: boolean
		) => {
			for (let i = 0; i < collection.length; i++) {
				if (i !== index && !enabled) {
					collection.item(i)?.addClass("no-pointer");
				} else {
					collection.item(i)?.removeClass("no-pointer");
				}
			}
		};
		const toggleContentEditable = (
			element: HTMLElement,
			toggle: boolean
		) => {
			element.setAttr("contenteditable", toggle);
		};

		history.map((historyItem: ChatHistoryItem, index: number) => {
			const item = parentElement.createDiv();
			const text = item.createEl("p");
			text.innerHTML = historyItem.prompt;
			const buttonsDiv = item.createDiv();
			buttonsDiv.addClass("history-buttons-div");
			const editPrompt = new ButtonComponent(buttonsDiv);
			const savePrompt = new ButtonComponent(buttonsDiv);
			const deleteHistory = new ButtonComponent(buttonsDiv);

			item.className = "setting-item";
			item.setAttr("contenteditable", "false");
			item.addClass("history-item");
			savePrompt.buttonEl.setAttr("style", "display: none");
			editPrompt.buttonEl.addClass("edit-prompt-button");
			savePrompt.buttonEl.addClass("save-prompt-button");
			editPrompt.setIcon("pencil");
			savePrompt.setIcon("save");
			deleteHistory.buttonEl.addClass(
				"delete-history-button",
				"mod-warning"
			);
			deleteHistory.buttonEl.id = "delete-history-button";
			item.addEventListener("click", () => {
				this.plugin.settings[settingType].historyIndex =
					index;
				this.historyIndex = index;
				this.plugin.saveSettings();
			});

			item.addEventListener("click", eventListener);

			deleteHistory.setIcon("trash");
			deleteHistory.onClick((e: MouseEvent) => {
				e.stopPropagation();
				this.resetHistory(parentElement);
				let updatedHistory = this.plugin.settings.promptHistory.filter(
					(item, idx) => idx !== index
				);
				this.plugin.settings.promptHistory = updatedHistory;
				this.plugin.saveSettings();
				this.generateHistoryContainer(
					parentElement,
					this.plugin.settings.promptHistory,
					hideContainer,
					showContainer,
					containerToShow,
					chat,
					Header
				);
				chat.resetChat();
				chat.resetMessages();
				Header.setHeader(this.modelName, "Local LLM Plugin");
				this.plugin.settings[settingType].historyIndex =
					DEFAULT_SETTINGS[settingType].historyIndex;
				this.plugin.saveSettings();
			});

			editPrompt.onClick((e: MouseEvent) => {
				e.stopPropagation();
				item.removeEventListener("click", eventListener);
				toggleContentEditable(text, true);
				text.focus();
				editPrompt.buttonEl.setAttr("style", "display: none");
				savePrompt.buttonEl.setAttr("style", "display: inline-flex");
				disableHistory(parentElement.children, index, false);
			});

			savePrompt.onClick((e: MouseEvent) => {
				e.stopPropagation();
				if (item.textContent) {
					this.plugin.settings.promptHistory[index].prompt =
						item.textContent;
					this.plugin.saveSettings();
				} else {
					new Notice("Prompt length must be greater than 0");
					return;
				}
				item.addEventListener("click", eventListener);
				toggleContentEditable(text, false);
				editPrompt.buttonEl.setAttr("style", "display: inline-flex");
				savePrompt.buttonEl.setAttr("style", "display: none");
				disableHistory(parentElement.children, index, true);
			});
		});
	}

	resetHistory(parentContainer: HTMLElement) {
		parentContainer.innerHTML = "";
	}
}
