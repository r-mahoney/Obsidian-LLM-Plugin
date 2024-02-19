import LocalLLMPlugin from "main";
import { ButtonComponent } from "obsidian";
import { ChatContainer } from "./ChatContainer";

export class Header {
	constructor(private plugin: LocalLLMPlugin) {}
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
		this.newChatButton.buttonEl.addClass("is-active");
	}

	clickHandler(button: ButtonComponent, toggles: ButtonComponent[]) {
		if (button.buttonEl.classList.contains("is-active")) {
			button.buttonEl.removeClass("is-active");
			toggles.map((el) => {
				if (el.buttonEl.classList.contains("new-chat-button")) {
					el.buttonEl.addClass("is-active");
				}
			});
		} else {
			button.buttonEl.addClass("is-active");
			toggles.map((el) => {
				el.buttonEl.removeClass("is-active");
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

		this.chatHistoryButton = new ButtonComponent(leftButtonDiv);
		this.chatHistoryButton.onClick(() => {
			this.clickHandler(this.chatHistoryButton, [
				this.newChatButton,
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
				this.newChatButton,
				this.chatHistoryButton,
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

		this.newChatButton = new ButtonComponent(rightB);
		this.newChatButton.buttonEl.addClass("is-active");
		this.newChatButton.onClick(() => {
			this.clickHandler(this.newChatButton, [
				settingsButton,
				this.chatHistoryButton,
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
		settingsButton.setIcon("wrench-screwdriver-glyph");
		this.newChatButton.setIcon("plus");

		parentElement.prepend(titleDiv);
	}
}
