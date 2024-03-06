import { ChatContainer } from "Plugin/Components/ChatContainer";
import { Header } from "Plugin/Components/Header";
import { HistoryContainer } from "Plugin/Components/HistoryContainer";
import { SettingsContainer } from "Plugin/Components/SettingsContainer";
import LLMPlugin from "main";
import { ButtonComponent } from "obsidian";
import { classNames } from "utils/classNames";

const ROOT_WORKSPACE_CLASS = ".app-container";

export class FAB {
	plugin: LLMPlugin;
	constructor(plugin: LLMPlugin) {
		this.plugin = plugin;
	}

	hideContainer(container: HTMLElement) {
		container.setAttr("style", "display: none");
	}
	showContainer(container: HTMLElement) {
		container.setAttr("style", "display: flex");
	}

	showViewArea(container: HTMLElement) {
		container.setAttr("style", "display: block");
	}

	generateFAB() {
		const fabContainer = createDiv();
		fabContainer.setAttribute("class", `floating-action-button`);
		fabContainer.setAttribute("id", "_floating-action-button");
		const viewArea = fabContainer.createDiv();
		viewArea.addClass("fab-view-area");
		viewArea.setAttr("style", "display: none");
		const header = new Header(this.plugin, "floating-action-button");
		const chatContainer = new ChatContainer(
			this.plugin,
			"floating-action-button"
		);
		const historyContainer = new HistoryContainer(
			this.plugin,
			"floating-action-button"
		);
		const settingsContainer = new SettingsContainer(
			this.plugin,
			"floating-action-button"
		);

		const lineBreak = viewArea.createDiv();
		const chatContainerDiv = viewArea.createDiv();
		const chatHistoryContainer = viewArea.createDiv();
		const settingsContainerDiv = viewArea.createDiv();
		header.generateHeader(
			viewArea,
			chatContainerDiv,
			chatHistoryContainer,
			settingsContainerDiv,
			chatContainer,
			historyContainer,
			settingsContainer,
			this.showContainer,
			this.hideContainer
		);
		let history = this.plugin.settings.promptHistory;

		settingsContainerDiv.setAttr("style", "display: none");
		settingsContainerDiv.addClass(
			"settings-container",
			"fab-settings-container"
		);
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.addClass(
			"chat-history-container",
			"fab-chat-history-container"
		);
		lineBreak.className =
			classNames["floating-action-button"]["title-border"];
		chatContainerDiv.addClass("chat-container", "fab-chat-container");

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

		let button = new ButtonComponent(fabContainer);
		button
			.setIcon("message-circle")
			.setClass("buttonItem")
			.onClick(() => {
				if (viewArea.style.display === "none") {
					this.showViewArea(viewArea);
				} else {
					this.hideContainer(viewArea);
				}
			});

		document.body
			.querySelector(ROOT_WORKSPACE_CLASS)
			?.insertAdjacentElement("afterbegin", fabContainer);
	}

	removeFab() {
		const FAB = document.getElementById("_floating-action-button")
		if(FAB) {
			FAB.remove()
		}
	}

	regenerateFAB() {
		this.removeFab();
		this.generateFAB()
	}
}
