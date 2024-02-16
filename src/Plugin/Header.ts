import LocalLLMPlugin from "main";
import { ButtonComponent } from "obsidian";
import { ChatContainer } from "./ChatContainer";

export class Header {
	constructor(private plugin: LocalLLMPlugin) {}
	modelEl: HTMLElement;
	titleEl?: HTMLElement;

	setHeader(modelName: string, title?: string) {
		if (title) {
			this.titleEl!.textContent = title;
		}
		this.modelEl.innerHTML = modelName;
	}

	generateHeader(
		parentElement: Element,
		chatContainerDiv: HTMLElement,
		historyContainer: HTMLElement,
		settingsContainer: HTMLElement,
		chatContainer: ChatContainer,
		showContainer: (container: HTMLElement) => void,
		hideContainer: (container: HTMLElement) => void
	) {
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
		this.modelEl.innerHTML = this.plugin.settings.modelName;

		const chatHistoryButton = new ButtonComponent(leftButtonDiv);
		chatHistoryButton.onClick(() => {
			newChatButton.buttonEl.id = "";
			settingsButton.buttonEl.id = "";
			chatHistoryButton.buttonEl.id = "active-button";
			showContainer(historyContainer);
			hideContainer(settingsContainer);
			hideContainer(chatContainerDiv);
		});

		const settingsButton = new ButtonComponent(rightA);
		settingsButton.onClick(() => {
			newChatButton.buttonEl.id = "";
			settingsButton.buttonEl.id = "active-button";
			chatHistoryButton.buttonEl.id = "";
			showContainer(settingsContainer);
			hideContainer(chatContainerDiv);
			hideContainer(historyContainer);
		});

		const newChatButton = new ButtonComponent(rightB);
		newChatButton.buttonEl.id = "active-button";
		newChatButton.onClick(() => {
			newChatButton.buttonEl.id = "active-button";
			settingsButton.buttonEl.id = "";
			chatHistoryButton.buttonEl.id = "";
			showContainer(chatContainerDiv);
			hideContainer(settingsContainer);
			hideContainer(historyContainer);
			chatContainer.resetChat();
			chatContainer.resetMessages();
			this.plugin.settings.historyIndex = -1;
		});

		leftButtonDiv.className = "one left-buttons-div";
		rightButtonsDiv.className = "one right-buttons-div";
		titleContainer.className = "four title";
		chatHistoryButton.buttonEl.className = "title-buttons";
		settingsButton.buttonEl.addClass("title-buttons");
		newChatButton.buttonEl.className = "title-buttons";
		rightA.className = "flex-end";
		rightB.className = "flex-end";
		chatHistoryButton.setIcon("bullet-list");
		settingsButton.setIcon("wrench-screwdriver-glyph");
		newChatButton.setIcon("plus");

		parentElement.prepend(titleDiv)
	}
}
