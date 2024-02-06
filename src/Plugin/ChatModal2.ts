import {
	ButtonComponent,
	DropdownComponent,
	Modal,
	Setting,
	TextAreaComponent,
	TextComponent,
	addIcon,
} from "obsidian";
import LocalLLMPlugin from "main";
import { ChatHistoryItem, Model } from "Types/types";
import { HistoryContainer } from "./HistoryContainer";

export class ChatModal2 extends Modal {
	prompt: string;
	constructor(private plugin: LocalLLMPlugin) {
		super(plugin.app);
	}

	hideContainer(container: HTMLElement) {
		container.setAttr("style", "display: none");
	}
	showContainer(container: HTMLElement) {
		container.setAttr("style", "display: flex");
	}

	generateHistoryItems(
		historyItem: ChatHistoryItem,
		parentElement: HTMLElement
	) {
		const item = parentElement.createDiv();
		item.className = "setting-item";
		item.innerHTML = historyItem.prompt;
	}

	onOpen() {
		console.log(
			this.modalEl
				.getElementsByClassName("modal-close-button")[0]
				.setAttr("style", "display: none")
		);
		const { contentEl } = this;
		let history = this.plugin.settings.promptHistory;
		const models = {
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

		const titleDiv = contentEl.createDiv();
		const leftButtonDiv = titleDiv.createDiv();
		const title = titleDiv.createDiv();
		const rightButtonsDiv = titleDiv.createDiv();
		const rightA = rightButtonsDiv.createDiv();
		const rightB = rightButtonsDiv.createDiv();

		titleDiv.className = "title-div";
		title.innerHTML = "LocalLLM Plugin";

		const chatHistoryButton = new ButtonComponent(leftButtonDiv);
		chatHistoryButton.onClick(() => {
			this.showContainer(chatHistoryContainer);
			this.hideContainer(settingsContainer);
			this.hideContainer(chatContainer);
		});
		const settingsButton = new ButtonComponent(rightA);
		settingsButton.onClick(() => {
			this.showContainer(settingsContainer);
			this.hideContainer(chatContainer);
			this.hideContainer(chatHistoryContainer);
		});
		const newChatButton = new ButtonComponent(rightB);
		newChatButton.onClick(() => {
			this.showContainer(chatContainer);
			this.hideContainer(settingsContainer);
			this.hideContainer(chatHistoryContainer);
		});
		const lineBreak = contentEl.createDiv();

		const chatContainer = contentEl.createDiv();
		const chatHistoryContainer = contentEl.createDiv();
		const settingsContainer = contentEl.createDiv();

		history.map((historyItem) => {
			this.generateHistoryItems(historyItem, chatHistoryContainer);
		});

		const historyMessages = new TextAreaComponent(chatContainer);
		const promptContainer = chatContainer.createDiv();
		const promptField = new TextComponent(promptContainer);
		const sendButton = new ButtonComponent(promptContainer);

		settingsContainer.setAttr("style", "display: none");
		settingsContainer.className = "settings-container";
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.className = "chat-history-container";
		lineBreak.className = "title-border";
		leftButtonDiv.className = "one left-buttons-div";
		rightButtonsDiv.className = "one right-buttons-div";
		title.className = "four title";
		chatContainer.className = "chat-container";
		historyMessages.inputEl.className = "messages-div";
		promptContainer.className = "prompt-container";
		promptField.inputEl.className = "chat-prompt-text-area";
		promptField.inputEl.id = "chat-prompt-text-area";
		sendButton.buttonEl.className = "send-button";
		chatHistoryButton.buttonEl.className = "title-buttons";
		settingsButton.buttonEl.className = "title-buttons";
		newChatButton.buttonEl.className = "title-buttons";
		rightA.className = "flex-end"
		rightB.className = "flex-end"

		chatHistoryButton.setIcon("bullet-list");
		settingsButton.setIcon("wrench-screwdriver-glyph");
		newChatButton.setIcon("plus");
		sendButton.setIcon("up-arrow-with-tail");

		promptField.onChange((change: string) => {
			this.prompt = change;
		});
		sendButton.onClick((e: MouseEvent) => {
			promptField.inputEl.setText("");
			promptField.setValue("");
			this.prompt = "";
		});

		new HistoryContainer(this.plugin).generateSettingsContainer(settingsContainer, models)
	}
}
