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

	clickHandler(button: ButtonComponent, toggles: ButtonComponent[]) {
		const buttonMap: Record<string, string> = {
			"new-chat-button": "plus",
			"settings-button": "wrench-screwdriver-glyph",
			"chat-history": "bullet-list",
		};
		const clickedButton = button.buttonEl.classList[1];
		if (clickedButton === "new-chat-button") {
			button.buttonEl.id = "active-button";
			toggles.map((el) => {
				el.buttonEl.id = "";
				el.setIcon(buttonMap[el.buttonEl.classList[1]]);
			});
			return;
		}
		if (button.buttonEl.id === "active-button") {
			button.setIcon(buttonMap[clickedButton]);
			button.buttonEl.id = "";
			toggles.map((el) => {
				if (el.buttonEl.classList[1] === "new-chat-button") {
					el.buttonEl.id = "active-button";
				}
			});
		} else {
			button.setIcon("arrow-left");
			button.buttonEl.id = "active-button";
			toggles.map((el) => {
				el.buttonEl.id = "";
				el.setIcon(buttonMap[el.buttonEl.classList[1]]);
			});
		}
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
			this.clickHandler(chatHistoryButton, [
				newChatButton,
				settingsButton,
			]);
			if (historyContainer.style.display === "none") {
				showContainer(historyContainer);
				hideContainer(settingsContainer);
				hideContainer(chatContainerDiv);
			} else {
				showContainer(chatContainerDiv);
				hideContainer(historyContainer);
			}
		});

		const settingsButton = new ButtonComponent(rightA);
		settingsButton.onClick(() => {
			this.clickHandler(settingsButton, [
				newChatButton,
				chatHistoryButton,
			]);
			if (settingsContainer.style.display === "none") {
				showContainer(settingsContainer);
				hideContainer(chatContainerDiv);
				hideContainer(historyContainer);
			} else {
				showContainer(chatContainerDiv);
				hideContainer(settingsContainer);
			}
		});

		const newChatButton = new ButtonComponent(rightB);
		newChatButton.buttonEl.id = "active-button";
		newChatButton.onClick(() => {
			this.clickHandler(newChatButton, [
				settingsButton,
				chatHistoryButton,
			]);
			this.setHeader(this.plugin.settings.modelName, "New Chat");
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
		chatHistoryButton.buttonEl.className = "title-buttons chat-history";
		settingsButton.buttonEl.addClass("title-buttons", "settings-button");
		newChatButton.buttonEl.className = "title-buttons new-chat-button";
		rightA.className = "flex-end";
		rightB.className = "flex-end";
		chatHistoryButton.setIcon("bullet-list");
		settingsButton.setIcon("wrench-screwdriver-glyph");
		newChatButton.setIcon("plus");

		parentElement.prepend(titleDiv);
	}
}
