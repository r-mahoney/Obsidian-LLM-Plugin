import LLMPlugin from "main";
import { Modal } from "obsidian";
import { classNames } from "utils/classNames";
import { ChatContainer } from "../Components/ChatContainer";
import { Header } from "../Components/Header";
import { HistoryContainer } from "../Components/HistoryContainer";
import { SettingsContainer } from "../Components/SettingsContainer";
import { AssistantsContainer } from "Plugin/Components/AssistantsContainer";

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
		this.modalEl
			.getElementsByClassName("modal-close-button")[0]
			.setAttr("style", "display: none");
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
		const assistantsContainer = new AssistantsContainer(
			this.plugin,
			"modal"
		);

		const lineBreak = contentEl.createDiv();
		const chatContainerDiv = contentEl.createDiv();
		const chatHistoryContainer = contentEl.createDiv();
		const settingsContainerDiv = contentEl.createDiv();
		const assistantsContainerDiv = contentEl.createDiv();
		header.generateHeader(
			contentEl,
			chatContainerDiv,
			chatHistoryContainer,
			settingsContainerDiv,
			assistantsContainerDiv,
			chatContainer,
			historyContainer,
			settingsContainer,
			assistantsContainer,
			this.showContainer,
			this.hideContainer
		);
		let history = this.plugin.settings.promptHistory;

		settingsContainerDiv.setAttr("style", "display: none");
		settingsContainerDiv.addClass("modal-settings-container", "llm-flex");
		assistantsContainerDiv.setAttr("style", "display: none");
		assistantsContainerDiv.addClass("modal-assistants-container", "llm-flex");
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.addClass("modal-chat-history-container", "llm-flex");
		lineBreak.className = classNames["modal"]["title-border"];
		chatContainerDiv.addClass("modal-chat-container", "llm-flex");

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
