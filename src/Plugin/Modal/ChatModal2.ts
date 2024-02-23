import LocalLLMPlugin, { DEFAULT_SETTINGS } from "main";
import { Modal } from "obsidian";
import { models } from "utils/utils";
import { ChatContainer } from "../Components/ChatContainer";
import { Header } from "../Components/Header";
import { HistoryContainer } from "../Components/HistoryContainer";
import { SettingsContainer } from "../Components/SettingsContainer";

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
		this.plugin.settings.modelType = DEFAULT_SETTINGS.modelType;
		this.plugin.saveSettings();
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
			header
		);
	}
}
