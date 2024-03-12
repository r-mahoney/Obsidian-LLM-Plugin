import LLMPlugin, { DEFAULT_SETTINGS } from "main";
import { Modal } from "obsidian";
import { classNames } from "utils/classNames";
import { ChatContainer } from "../Components/ChatContainer";
import { Header } from "../Components/Header";
import { HistoryContainer } from "../Components/HistoryContainer";
import { SettingsContainer } from "../Components/SettingsContainer";

export class ChatModal2 extends Modal {
	constructor(private plugin: LLMPlugin) {
		super(plugin.app);
	}
	hideContainer(container: HTMLElement) {
		container.setAttr("style", "display: none");
	}
	showContainer(container: HTMLElement) {
		container.setAttr("style", "display: flex");
	}

	onOpen() {
		const modalSettings = this.plugin.settings.modalSettings;
		this.modalEl
			.getElementsByClassName("modal-close-button")[0]
			.setAttr("style", "display: none");
		modalSettings.historyIndex =
			DEFAULT_SETTINGS.modalSettings.historyIndex;
		modalSettings.model = DEFAULT_SETTINGS.modalSettings.model;
		modalSettings.modelName = DEFAULT_SETTINGS.modalSettings.modelName;
		modalSettings.modelType = DEFAULT_SETTINGS.modalSettings.modelType;
		modalSettings.modelEndpoint =
			DEFAULT_SETTINGS.modalSettings.modelEndpoint;
		modalSettings.endpointURL = DEFAULT_SETTINGS.modalSettings.endpointURL;
		this.plugin.saveSettings();
		const { contentEl } = this;
		const closeModal = () => {
			this.close();
		};

		const header = new Header(this.plugin, "modal");
		const chatContainer = new ChatContainer(
			this.plugin,
			"modal" /*, closeModal*/
		);
		const historyContainer = new HistoryContainer(this.plugin, "modal");
		const settingsContainer = new SettingsContainer(this.plugin, "modal");

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
			historyContainer,
			settingsContainer,
			this.showContainer,
			this.hideContainer,
		);
		let history = this.plugin.settings.promptHistory;

		settingsContainerDiv.setAttr("style", "display: none");
		settingsContainerDiv.addClass("modal-settings-container", "flex");
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.addClass("modal-chat-history-container", "flex");
		lineBreak.className = classNames["modal"]["title-border"];
		chatContainerDiv.addClass("modal-chat-container", "flex");

		chatContainer.generateChatContainer(chatContainerDiv, header);
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
