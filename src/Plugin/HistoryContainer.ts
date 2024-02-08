import { ChatHistoryItem } from "Types/types";
import LocalLLMPlugin from "main";
import { ButtonComponent } from "obsidian";
import { ChatContainer } from "./ChatContainer";

export class HistoryContainer {
	messagesUpdated: boolean;
	constructor(private plugin: LocalLLMPlugin) {
		this.messagesUpdated = false;
	}

	generateHistoryContainer(
		parentElement: HTMLElement,
		history: ChatHistoryItem[],
		hideContainer: (container: HTMLElement) => void,
		showContainer: (container: HTMLElement) => void,
		containerToShow: HTMLElement,
		chat: ChatContainer
	) {
		history.map((historyItem: ChatHistoryItem, index: number) => {
			const item = parentElement.createDiv();
			item.innerHTML = historyItem.prompt;
			const buttonsDiv = item.createDiv();
            buttonsDiv.addClass("history-buttons-div")
			const setHistory = new ButtonComponent(buttonsDiv);
			const deleteHistory = new ButtonComponent(buttonsDiv);

			item.className = "setting-item";
			item.addClass("history-item");
			setHistory.buttonEl.addClass("set-history-button", "mod-cta");
			deleteHistory.buttonEl.addClass("delete-history-button", "mod-warning");
			setHistory.buttonEl.id = "set-history-button";
			deleteHistory.buttonEl.id = "delete-history-button";

			setHistory.onClick(() => {
				chat.resetChat();
				this.plugin.settings.historyIndex = index;
				hideContainer(parentElement);
				showContainer(containerToShow);
				chat.setMessages(true);
				const messages = chat.getMessages();
				chat.generateIMLikeMessgaes(messages);
				const titleDiv = parentElement.parentNode?.querySelector(".title-div")
				const buttons = titleDiv?.querySelectorAll(".title-buttons")
				const settingsIndex = 0;
				const newChatIndex = 2;
				buttons![newChatIndex].id = "active-button"
				buttons![settingsIndex].id = ""
			});

            deleteHistory.setIcon("trash")
			deleteHistory.onClick(() => {
                this.resetHistory(parentElement)
				let updatedHistory = this.plugin.settings.promptHistory.filter(
					(item, idx) => idx !== index
				);
				this.plugin.settings.promptHistory = updatedHistory;
				this.plugin.saveSettings()
				this.generateHistoryContainer(
					parentElement,
					this.plugin.settings.promptHistory,
					hideContainer,
					showContainer,
					containerToShow,
					chat
				);
			});
		});
	}

    resetHistory(parentContainer: HTMLElement) {
        parentContainer.innerHTML  = ""
    }
}
