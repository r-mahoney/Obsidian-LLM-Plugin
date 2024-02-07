import LocalLLMPlugin from "main";
import { ButtonComponent, Modal } from "obsidian";
import { ChatContainer } from "./ChatContainer";
import { HistoryContainer } from "./HistoryContainer";
import { SettingsContainer } from "./SettingsContainer";

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
		this.modalEl
			.getElementsByClassName("modal-close-button")[0]
			.setAttr("style", "display: none");
		this.plugin.settings.historyIndex = -1;
		const { contentEl } = this;

		const chatContainer = new ChatContainer(this.plugin);
		const historyContainer = new HistoryContainer(this.plugin);
		const settingsContainer = new SettingsContainer(this.plugin);

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
			newChatButton.buttonEl.id = "";
			settingsButton.buttonEl.id = "";
			chatHistoryButton.buttonEl.id = "active-button";
			this.showContainer(chatHistoryContainer);
			this.hideContainer(settingsContainerDiv);
			this.hideContainer(chatContainerDiv);
		});

		const settingsButton = new ButtonComponent(rightA);
		settingsButton.onClick(() => {
			newChatButton.buttonEl.id = "";
			settingsButton.buttonEl.id = "active-button";
			chatHistoryButton.buttonEl.id = "";
			this.showContainer(settingsContainerDiv);
			this.hideContainer(chatContainerDiv);
			this.hideContainer(chatHistoryContainer);
		});

		const newChatButton = new ButtonComponent(rightB);
		newChatButton.buttonEl.id = "active-button";
		newChatButton.onClick(() => {
			newChatButton.buttonEl.id = "active-button";
			settingsButton.buttonEl.id = "";
			chatHistoryButton.buttonEl.id = "";
			this.showContainer(chatContainerDiv);
			this.hideContainer(settingsContainerDiv);
			this.hideContainer(chatHistoryContainer);
			chatContainer.resetChat();
			chatContainer.resetMessages();
			this.plugin.settings.historyIndex = -1;
		});
		const lineBreak = contentEl.createDiv();

		const chatContainerDiv = contentEl.createDiv();
		const chatHistoryContainer = contentEl.createDiv();
		const settingsContainerDiv = contentEl.createDiv();

		settingsContainerDiv.setAttr("style", "display: none");
		settingsContainerDiv.className = "settings-container";
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.className = "chat-history-container";
		lineBreak.className = "title-border";
		leftButtonDiv.className = "one left-buttons-div";
		rightButtonsDiv.className = "one right-buttons-div";
		title.className = "four title";
		chatContainerDiv.className = "chat-container";
		chatHistoryButton.buttonEl.className = "title-buttons";
		settingsButton.buttonEl.addClass("title-buttons");
		newChatButton.buttonEl.className = "title-buttons";
		rightA.className = "flex-end";
		rightB.className = "flex-end";

		chatHistoryButton.setIcon("bullet-list");
		settingsButton.setIcon("wrench-screwdriver-glyph");
		newChatButton.setIcon("plus");

		chatContainer.generateChatContainer(chatContainerDiv);
		historyContainer.generateHistoryContainer(
			chatHistoryContainer,
			history,
			this.hideContainer,
			this.showContainer,
			chatContainerDiv,
			chatContainer
		);
		settingsContainer.generateSettingsContainer(
			settingsContainerDiv,
			models
		);
	}
}
