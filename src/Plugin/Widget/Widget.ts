import { ChatContainer } from "Plugin/Components/ChatContainer";
import { Header } from "Plugin/Components/Header";
import { HistoryContainer } from "Plugin/Components/HistoryContainer";
import { SettingsContainer } from "Plugin/Components/SettingsContainer";
import LocalLLMPlugin from "main";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { classNames } from "utils/utils";

export const VIEW_TYPE = "example-view";

export class WidgetView extends ItemView {
	plugin: LocalLLMPlugin;
	constructor(leaf: WorkspaceLeaf, plugin: LocalLLMPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	hideContainer(container: HTMLElement) {
		container.setAttr("style", "display: none");
	}
	showContainer(container: HTMLElement) {
		container.setAttr("style", "display: flex");
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Example View";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		const history = this.plugin.settings.promptHistory;
		container.empty();
		const header = new Header(this.plugin, "widget");
		const chatContainer = new ChatContainer(
			this.plugin,
			"widget" /*, closeModal*/
		);
		const historyContainer = new HistoryContainer(this.plugin, "widget");
		const settingsContainer = new SettingsContainer(this.plugin, "widget");

		const lineBreak = container.createDiv();
		const chatContainerDiv = container.createDiv();
		const chatHistoryContainer = container.createDiv();
		const settingsContainerDiv = container.createDiv();

		settingsContainerDiv.setAttr("style", "display: none");
		settingsContainerDiv.className = "settings-container";
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.className = "chat-history-container";
		lineBreak.className = classNames["widget"]["title-border"];
		chatContainerDiv.className = "chat-container";

		header.generateHeader(
			container,
			chatContainerDiv,
			chatHistoryContainer,
			settingsContainerDiv,
			chatContainer,
			this.showContainer,
			this.hideContainer,
			historyContainer
		);
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

	async onClose() {}
}
