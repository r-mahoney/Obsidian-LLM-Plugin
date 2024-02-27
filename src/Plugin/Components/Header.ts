import LocalLLMPlugin from "main";
import { ButtonComponent } from "obsidian";
import { ChatContainer } from "./ChatContainer";
import { HistoryContainer } from "./HistoryContainer";
import { ViewType } from "Types/types";
import { getModelInfo, setHistoryIndex } from "utils/utils";

export class Header {
	viewType: ViewType;
	constructor(private plugin: LocalLLMPlugin, viewType: ViewType) {
		this.viewType = viewType;
	}
	modelEl: HTMLElement;
	titleEl?: HTMLElement;
	chatHistoryButton: ButtonComponent;
	newChatButton: ButtonComponent;

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

	generateHeader(
		parentElement: Element,
		chatContainerDiv: HTMLElement,
		chatHistoryContainer: HTMLElement,
		settingsContainer: HTMLElement,
		chatContainer: ChatContainer,
		showContainer: (container: HTMLElement) => void,
		hideContainer: (container: HTMLElement) => void,
		historyContainer: HistoryContainer
	) {
		const {model, modelName, modelType, historyIndex} = getModelInfo(this.plugin, this.viewType)
		const titleDiv = createDiv();
		const leftButtonDiv = titleDiv.createDiv();
		const titleContainer = titleDiv.createDiv();
		this.titleEl = titleContainer.createDiv();
		const rightButtonsDiv = titleDiv.createDiv();
		const rightA = rightButtonsDiv.createDiv();
		const rightB = rightButtonsDiv.createDiv();

		titleDiv.className = "title-div";
		this.titleEl.innerHTML = "LocalLLM Plugin";
		this.modelEl = titleContainer.createDiv();
		this.modelEl.addClass("model-name");
		this.modelEl.innerHTML = modelName;

		this.chatHistoryButton = new ButtonComponent(leftButtonDiv);
		this.chatHistoryButton.onClick(() => {
			historyContainer.resetHistory(chatHistoryContainer);
			historyContainer.generateHistoryContainer(
				chatHistoryContainer,
				this.plugin.settings.promptHistory,
				hideContainer,
				showContainer,
				chatContainerDiv,
				chatContainer,
				this
			);
			this.clickHandler(this.chatHistoryButton, [settingsButton]);
			if (chatHistoryContainer.style.display === "none") {
				showContainer(chatHistoryContainer);
				hideContainer(settingsContainer);
				hideContainer(chatContainerDiv);
			} else {
				showContainer(chatContainerDiv);
				hideContainer(chatHistoryContainer);
			}
		});

		const settingsButton = new ButtonComponent(rightA);
		settingsButton.onClick(() => {
			this.clickHandler(settingsButton, [this.chatHistoryButton]);
			if (settingsContainer.style.display === "none") {
				showContainer(settingsContainer);
				hideContainer(chatContainerDiv);
				hideContainer(chatHistoryContainer);
			} else {
				showContainer(chatContainerDiv);
				hideContainer(settingsContainer);
			}
		});

		this.newChatButton = new ButtonComponent(rightB);
		this.newChatButton.onClick(() => {
			this.clickHandler(this.newChatButton, [
				settingsButton,
				this.chatHistoryButton,
			]);
			this.setHeader(modelName, "New Chat");
			showContainer(chatContainerDiv);
			hideContainer(settingsContainer);
			hideContainer(chatHistoryContainer);
			chatContainer.resetChat();
			chatContainer.resetMessages();
			setHistoryIndex(this.plugin, this.viewType)
		});

		leftButtonDiv.className = "one left-buttons-div";
		rightButtonsDiv.className = "one right-buttons-div";
		titleContainer.className = "four title";
		this.chatHistoryButton.buttonEl.addClass(
			"clickable-icon",
			"chat-history"
		);
		settingsButton.buttonEl.addClass("clickable-icon", "settings-button");
		this.newChatButton.buttonEl.addClass(
			"clickable-icon",
			"new-chat-button"
		);
		rightA.className = "flex-end";
		rightB.className = "flex-end";
		this.chatHistoryButton.setIcon("bullet-list");
		settingsButton.setIcon("sliders-horizontal");
		this.newChatButton.setIcon("plus");

		parentElement.prepend(titleDiv);
	}
}
