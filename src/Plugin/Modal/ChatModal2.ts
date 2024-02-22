import LocalLLMPlugin, { DEFAULT_SETTINGS } from "main";
import { ButtonComponent, Modal } from "obsidian";
import { ChatContainer } from "../Components/ChatContainer";
import { HistoryContainer } from "../Components/HistoryContainer";
import { SettingsContainer } from "../Components/SettingsContainer";
import { Header } from "../Components/Header";

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
		this.plugin.settings.historyIndex = DEFAULT_SETTINGS.historyIndex;
		this.plugin.settings.model = DEFAULT_SETTINGS.model;
		this.plugin.settings.modelName = DEFAULT_SETTINGS.modelName;
		this.plugin.saveSettings()
		const { contentEl } = this;
		const closeModal = () => {
			this.close();
		};

		const header = new Header(this.plugin);
		const chatContainer = new ChatContainer(this.plugin /*, closeModal*/);
		const historyContainer = new HistoryContainer(this.plugin);
		const settingsContainer = new SettingsContainer(this.plugin);

		const lineBreak = contentEl.createDiv();
		const chatContainerDiv = contentEl.createDiv();
		const chatHistoryContainer = contentEl.createDiv();
		const settingsContainerDiv = contentEl.createDiv();
		header.generateHeader(
			contentEl,
			chatContainerDiv,
			chatHistoryContainer,
			settingsContainerDiv,
			chatContainer,
			this.showContainer,
			this.hideContainer,
			historyContainer
		);
		let history = this.plugin.settings.promptHistory;
		const models = {
			"Mistral OpenOrca": {model: "mistral-7b-openorca.Q4_0.gguf", type: "GPT4All"},
			"Mistral Instruct": {model: "mistral-7b-instruct-v0.1.Q4_0.gguf", type: "GPT4All"},
			"GPT4All Falcon": {model: "gpt4all-falcon-newbpe-q4_0.gguf", type: "GPT4All"},
			"Orca 2 (Medium)": {model: "orca-2-7b.Q4_0.gguf", type: "GPT4All"},
			"Orca 2 (Full)": {model: "orca-2-13b.Q4_0.gguf", type: "GPT4All"},
			"Mini Orca (Small)": {model: "orca-mini-3b-gguf2-q4_0.gguf", type: "GPT4All"},
			"MPT Chat": {model: "mpt-7b-chat-newbpe-q4_0.gguf", type: "GPT4All"},
			"Wizard v1.2": {model: "wizardlm-13b-v1.2.Q4_0.gguf", type: "GPT4All"},
			Hermes: {model: "nous-hermes-llama2-13b.Q4_0.gguf", type: "GPT4All"},
			Snoozy: {model: "gpt4all-13b-snoozy-q4_0.gguf", type: "GPT4All"},
			"EM German Mistral": {model: "em_german_mistral_v01.Q4_0.gguf", type: "GPT4All"},
			"ChatGPT-3.5 Turbo": {model: "gpt-3.5-turbo", type: "openAI"},
			"Text Embedding 3 (Small)": {model: "text-embedding-3-small", type: "openAI"},
			// "DALL·E 3": {model: "dall-e-3", type: "openAI"},
		};

		settingsContainerDiv.setAttr("style", "display: none");
		settingsContainerDiv.className = "settings-container";
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.className = "chat-history-container";
		lineBreak.className = "title-border";
		chatContainerDiv.className = "chat-container";

		chatContainer.generateChatContainer(chatContainerDiv);
		historyContainer.generateHistoryContainer(
			chatHistoryContainer,
			history,
			this.hideContainer,
			this.showContainer,
			chatContainerDiv,
			chatContainer,
			header
		);
		settingsContainer.generateSettingsContainer(
			settingsContainerDiv,
			models,
			header
		);
	}
}
