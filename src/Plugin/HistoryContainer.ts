import { ChatHistoryItem } from "Types/types";
import LocalLLMPlugin from "main";
import { ButtonComponent, Notice } from "obsidian";
import { ChatContainer } from "./ChatContainer";

export class HistoryContainer {
	constructor(private plugin: LocalLLMPlugin) {}

	generateHistoryContainer(
		parentElement: HTMLElement,
		history: ChatHistoryItem[],
		hideContainer: (container: HTMLElement) => void,
		showContainer: (container: HTMLElement) => void,
		containerToShow: HTMLElement,
		chat: ChatContainer,
		setHeading: (
			modelEl: HTMLElement,
			modelName: string,
			titleEl?: HTMLElement,
			title?: string,
		) => void,
		titleEl: HTMLElement,
		modelEl: HTMLElement
	) {

		const models: Record<string, string> = {
			"Mistral OpenOrca": "mistral-7b-openorca.Q4_0.gguf",
			"Mistral Instruct": "mistral-7b-instruct-v0.1.Q4_0.gguf",
			"GPT4All Falcon": "gpt4all-falcon-newbpe-q4_0.gguf",
			"Orca 2 (Medium)": "orca-2-7b.Q4_0.gguf",
			"Orca 2 (Full)": "orca-2-13b.Q4_0.gguf",
			"Mini Orca (Small)": "orca-mini-3b-gguf2-q4_0.gguf",
			"MPT Chat": "mpt-7b-chat-newbpe-q4_0.gguf",
			"Wizard v1.2": "wizardlm-13b-v1.2.Q4_0.gguf",
			Hermes: "nous-hermes-llama2-13b.Q4_0.gguf",
			Snoozy: "gpt4all-13b-snoozy-q4_0.gguf",
			"EM German Mistral": "em_german_mistral_v01.Q4_0.gguf",
		};

		const eventListener = () => {
			chat.resetChat();
			hideContainer(parentElement);
			showContainer(containerToShow);
			chat.setMessages(true);
			const messages = chat.getMessages();
			chat.generateIMLikeMessgaes(messages);
			containerToShow.querySelector(".messages-div")?.scroll(0, 9999);
			const titleDiv =
				parentElement.parentNode?.querySelector(".title-div");
			const buttons = titleDiv?.querySelectorAll(".title-buttons");
			const settingsIndex = 0;
			const newChatIndex = 2;
			buttons![newChatIndex].id = "active-button";
			buttons![settingsIndex].id = "";
			const index = this.plugin.settings.historyIndex
			const header = this.plugin.settings.promptHistory[index].prompt
			const modelName = this.plugin.settings.promptHistory[index].modelName
			this.plugin.settings.model = models[modelName];
			this.plugin.settings.modelName = modelName;
			this.plugin.saveSettings()
			setHeading( modelEl, modelName, titleEl, header);
		};

		eventListener.bind(this)

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
			// item.innerHTML = historyItem.prompt;
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
				this.plugin.settings.historyIndex = index;
				this.plugin.saveSettings()
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
					setHeading,
					titleEl,
					modelEl
				);
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
