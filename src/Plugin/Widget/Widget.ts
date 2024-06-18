import { ChatContainer } from "Plugin/Components/ChatContainer";
import { Header } from "Plugin/Components/Header";
import { HistoryContainer } from "Plugin/Components/HistoryContainer";
import { SettingsContainer } from "Plugin/Components/SettingsContainer";
import LLMPlugin, { DEFAULT_SETTINGS } from "main";
import { ItemView, WorkspaceLeaf } from "obsidian";
import { classNames } from "utils/classNames";

export const TAB_VIEW_TYPE = "tab-view";
export const LEAF_VIEW_TYPE = "leaf-view";

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
		return "";
		//return an empty tring because workspace.getLeavesOfType function in widget commands uses this to determine what
		//view is open an causes issues if you want to be able to have commands that open a tab view and a sidebar view separately
		//The only issue now is that users can open an infinite number of widgets which is probably not ideal behavior
		//can either solve this issue with over engineering, leave it, or create a whole new class that exactly the same as this class for the tabs
	}

	getDisplayText(): string {
		return "LLM Plugin View";
	}

	async onOpen() {
		this.icon = "message-circle"
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
			this.hideContainer
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
