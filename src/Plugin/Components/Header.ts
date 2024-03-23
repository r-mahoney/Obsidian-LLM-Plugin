import LLMPlugin from "main";
import { ButtonComponent } from "obsidian";
import { ChatContainer } from "./ChatContainer";
import { HistoryContainer } from "./HistoryContainer";
import { ViewType } from "Types/types";
import { getViewInfo, setHistoryIndex } from "utils/utils";
import { SettingsContainer } from "./SettingsContainer";

export class Header {
	viewType: ViewType;
	constructor(private plugin: LLMPlugin, viewType: ViewType) {
		this.viewType = viewType;
	}
	modelEl: HTMLElement;
	titleEl?: HTMLElement;
	chatHistoryButton: ButtonComponent;
	newChatButton: ButtonComponent;
	settingsButton: ButtonComponent;

	setHeader(modelName: string, title?: string) {
		if (title) {
			this.titleEl!.textContent = title;
		}
		this.modelEl.innerHTML = modelName;
	}

	resetHistoryButton() {
		this.chatHistoryButton.buttonEl.removeClass("is-active");
	}

	clickHandler(button: ButtonComponent, toggles: ButtonComponent[]) {
		if (button.buttonEl.classList.contains("is-active")) {
			button.buttonEl.removeClass("is-active");
		} else {
			if (!button.buttonEl.classList.contains("new-chat-button")) {
				button.buttonEl.addClass("is-active");
			}
			toggles.map((el) => {
				el.buttonEl.removeClass("is-active");
			});
		}
	}

	disableButtons() {
		this.chatHistoryButton.setDisabled(true);
		this.newChatButton.setDisabled(true);
		this.settingsButton.setDisabled(true);
	}

	enableButtons() {
		this.chatHistoryButton.setDisabled(false);
		this.newChatButton.setDisabled(false);
		this.settingsButton.setDisabled(false);
	}

	generateHeader(
		parentElement: Element,
		chatContainerDiv: HTMLElement,
		chatHistoryContainerDiv: HTMLElement,
		settingsContainerDiv: HTMLElement,
		chatContainer: ChatContainer,
		historyContainer: HistoryContainer,
		settingsContainer: SettingsContainer,
		showContainer: (container: HTMLElement) => void,
		hideContainer: (container: HTMLElement) => void
	) {
		const { modelName } = getViewInfo(this.plugin, this.viewType);
		const titleDiv = createDiv();
		const leftButtonDiv = titleDiv.createDiv();
		const titleContainer = titleDiv.createDiv();
		this.titleEl = titleContainer.createDiv();
		this.titleEl.addClass(`${this.viewType}-llm-title`);
		const rightButtonsDiv = titleDiv.createDiv();

		titleDiv.addClass("title-div", "flex");
		this.titleEl.innerHTML = "LLM Plugin";
		this.modelEl = titleContainer.createDiv();
		this.modelEl.addClass("model-name");
		this.modelEl.innerHTML = modelName;

		this.chatHistoryButton = new ButtonComponent(leftButtonDiv);
		this.chatHistoryButton.setTooltip("Chats");
		this.chatHistoryButton.onClick(() => {
			historyContainer.resetHistory(chatHistoryContainerDiv);
			historyContainer.generateHistoryContainer(
				chatHistoryContainerDiv,
				this.plugin.settings.promptHistory,
				hideContainer,
				showContainer,
				chatContainerDiv,
				chatContainer,
				this
			);
			this.clickHandler(this.chatHistoryButton, [this.settingsButton]);
			if (chatHistoryContainerDiv.style.display === "none") {
				showContainer(chatHistoryContainerDiv);
				hideContainer(settingsContainerDiv);
				hideContainer(chatContainerDiv);
			} else {
				showContainer(chatContainerDiv);
				hideContainer(chatHistoryContainerDiv);
			}
		});

		if (this.viewType === "floating-action-button") {
			this.newChatButton = new ButtonComponent(leftButtonDiv);
			this.settingsButton = new ButtonComponent(rightButtonsDiv);
			const closeButton = new ButtonComponent(rightButtonsDiv);
			closeButton.buttonEl.addClass("clickable-icon");
			closeButton.setIcon("cross")
			closeButton.onClick(() => {
				const FAV = document.querySelectorAll('.fab-view-area')[0]
				hideContainer(FAV as HTMLElement)
			})
		} else {
			this.newChatButton = new ButtonComponent(rightButtonsDiv);
			this.settingsButton = new ButtonComponent(leftButtonDiv);
		}

		this.settingsButton.setTooltip("Chat Settings");
		this.settingsButton.onClick(() => {
			settingsContainer.resetSettings(settingsContainerDiv);
			settingsContainer.generateSettingsContainer(
				settingsContainerDiv,
				this
			);
			this.clickHandler(this.settingsButton, [this.chatHistoryButton]);
			if (settingsContainerDiv.style.display === "none") {
				showContainer(settingsContainerDiv);
				hideContainer(chatContainerDiv);
				hideContainer(chatHistoryContainerDiv);
			} else {
				showContainer(chatContainerDiv);
				hideContainer(settingsContainerDiv);
			}
		});

		this.newChatButton.setTooltip("New Chat");
		this.newChatButton.onClick(() => {
			const { modelName } = getViewInfo(this.plugin, this.viewType);
			this.clickHandler(this.newChatButton, [
				this.settingsButton,
				this.chatHistoryButton,
			]);
			this.setHeader(modelName, "New Chat");
			showContainer(chatContainerDiv);
			hideContainer(settingsContainerDiv);
			hideContainer(chatHistoryContainerDiv);
			chatContainer.resetChat();
			chatContainer.resetMessages();
			setHistoryIndex(this.plugin, this.viewType);
		});

		leftButtonDiv.addClass("one", "left-buttons-div", "flex");
		rightButtonsDiv.addClass("one", "right-buttons-div", "flex");
		titleContainer.addClass("four", "title", "flex");
		this.chatHistoryButton.buttonEl.addClass(
			"clickable-icon",
			"chat-history"
		);
		this.settingsButton.buttonEl.addClass(
			"clickable-icon",
			"settings-button"
		);
		this.newChatButton.buttonEl.addClass(
			"clickable-icon",
			"new-chat-button"
		);
		this.chatHistoryButton.setIcon("menu");
		this.settingsButton.setIcon("sliders-horizontal");
		this.newChatButton.setIcon("plus");

		parentElement.prepend(titleDiv);
	}
}
