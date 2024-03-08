import { ChatContainer } from "Plugin/Components/ChatContainer";
import { Header } from "Plugin/Components/Header";
import { HistoryContainer } from "Plugin/Components/HistoryContainer";
import { SettingsContainer } from "Plugin/Components/SettingsContainer";
import LLMPlugin, { DEFAULT_SETTINGS } from "main";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { classNames } from "utils/classNames";

export const VIEW_TYPE = "example-view";

export class WidgetView extends ItemView {
	plugin: LLMPlugin;
	constructor(leaf: WorkspaceLeaf, plugin: LLMPlugin) {
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
		const widgetSettings = this.plugin.settings.widgetSettings;
		widgetSettings.historyIndex =
			DEFAULT_SETTINGS.widgetSettings.historyIndex;
		widgetSettings.model = DEFAULT_SETTINGS.widgetSettings.model;
		widgetSettings.modelName = DEFAULT_SETTINGS.widgetSettings.modelName;
		widgetSettings.modelType = DEFAULT_SETTINGS.widgetSettings.modelType;
		widgetSettings.modelEndpoint =
			DEFAULT_SETTINGS.widgetSettings.modelEndpoint;
		widgetSettings.endpointURL =
			DEFAULT_SETTINGS.widgetSettings.endpointURL;
		this.plugin.saveSettings();
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
		settingsContainerDiv.addClass("widget-settings-container", "flex");
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.addClass("widget-chat-history-container", "flex");
		lineBreak.className = classNames["widget"]["title-border"];
		chatContainerDiv.addClass("widget-chat-container", "flex");

		header.generateHeader(
			container,
			chatContainerDiv,
			chatHistoryContainer,
			settingsContainerDiv,
			chatContainer,
			historyContainer,
			settingsContainer,
			this.showContainer,
			this.hideContainer,
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
