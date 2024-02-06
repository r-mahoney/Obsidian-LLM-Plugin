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
import { SettingsContainer } from "./SettingsContainer";
import { HistoryContainer } from "./HistoryContainer";
import { ChatContainer } from "./ChatContainer";

export class ChatModal2 extends Modal {
	constructor(private plugin: LocalLLMPlugin) {
		super(plugin.app);
	}

	hideContainer(container: HTMLElement) {
		container.setAttr("style", "display: none");
	}
	showContainer(container: HTMLElement) {
		container.setAttr("style", "display: flex");
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
		
		settingsContainer.setAttr("style", "display: none");
		settingsContainer.className = "settings-container";
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.className = "chat-history-container";
		lineBreak.className = "title-border";
		leftButtonDiv.className = "one left-buttons-div";
		rightButtonsDiv.className = "one right-buttons-div";
		title.className = "four title";
		chatContainer.className = "chat-container";
		chatHistoryButton.buttonEl.className = "title-buttons";
		settingsButton.buttonEl.className = "title-buttons";
		newChatButton.buttonEl.className = "title-buttons";
		rightA.className = "flex-end"
		rightB.className = "flex-end"
		
		chatHistoryButton.setIcon("bullet-list");
		settingsButton.setIcon("wrench-screwdriver-glyph");
		newChatButton.setIcon("plus");

		new ChatContainer(this.plugin).generateChatContainer(chatContainer)
		new HistoryContainer(this.plugin).generateHistoryContainer(chatHistoryContainer, history)
		new SettingsContainer(this.plugin).generateSettingsContainer(settingsContainer, models)
	}
}
