import LocalLLMPlugin from "main";
import { ButtonComponent, Modal } from "obsidian";
import { ChatContainer } from "./ChatContainer";
import { HistoryContainer } from "./HistoryContainer";
import { SettingsContainer } from "./SettingsContainer";
import { Header } from "./Header";

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
		const closeModal = () => {
			this.close();
		};

		const header = new Header(this.plugin);
		const chatContainer = new ChatContainer(this.plugin, closeModal);
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
			this.hideContainer
		);
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
