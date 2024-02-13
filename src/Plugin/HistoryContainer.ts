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
		const eventListener = (index: number) => {
				chat.resetChat();
				// this.plugin.settings.historyIndex = index;
				hideContainer(parentElement);
				showContainer(containerToShow);
				chat.setMessages(true);
				const messages = chat.getMessages();
				chat.generateIMLikeMessgaes(messages);
				containerToShow.querySelector(".messages-div")?.scroll(0, 9999);
				const titleDiv =
					parentElement.parentNode?.querySelector(".title-div");
				const buttons = titleDiv?.querySelectorAll(".title-buttons");
				const settingsIndex = 0;
				const newChatIndex = 2;
				buttons![newChatIndex].id = "active-button";
				buttons![settingsIndex].id = "";
		}
		const toggleContentEditable = (element: HTMLElement, toggle: boolean) => {
			element.setAttr("contenteditable", toggle)
		}

		parentElement.addEventListener("click", (e) => {
			console.log(e.target)
		})

		history.map((historyItem: ChatHistoryItem, index: number) => {
			const item = parentElement.createDiv();
			item.innerHTML = historyItem.prompt;
			const buttonsDiv = item.createDiv();
			buttonsDiv.addClass("history-buttons-div");
			const editPrompt = new ButtonComponent(buttonsDiv);
			const savePrompt = new ButtonComponent(buttonsDiv);
			const deleteHistory = new ButtonComponent(buttonsDiv);

			item.className = "setting-item";
			item.setAttr("contenteditable", "false");
			item.addClass("history-item");
			savePrompt.buttonEl.setAttr("style", "display: none")
			editPrompt.buttonEl.addClass("edit-prompt-button");
			savePrompt.buttonEl.addClass("save-prompt-button");
			editPrompt.setIcon("pencil");
			savePrompt.setIcon("save")
			deleteHistory.buttonEl.addClass(
				"delete-history-button",
				"mod-warning"
			);
			deleteHistory.buttonEl.id = "delete-history-button";

			item.addEventListener("click", () => {
				this.plugin.settings.historyIndex = index;
			});

			deleteHistory.setIcon("trash");
			deleteHistory.onClick((e: MouseEvent) => {
				e.stopPropagation()
				this.resetHistory(parentElement);
				let updatedHistory = this.plugin.settings.promptHistory.filter(
					(item, idx) => idx !== index
				);
				this.plugin.settings.promptHistory = updatedHistory;
				this.plugin.saveSettings();
				this.generateHistoryContainer(
					parentElement,
					this.plugin.settings.promptHistory,
					hideContainer,
					showContainer,
					containerToShow,
					chat
				);
			});

			editPrompt.onClick((e: MouseEvent) => {
				e.stopPropagation()
				parentElement.removeEventListener("click", (e) => {
					console.log(e.target)
				})
				toggleContentEditable(item, true)
				editPrompt.buttonEl.setAttr("style", "display: none")
				savePrompt.buttonEl.setAttr("style", "display: inline-flex")
			})

			savePrompt.onClick((e: MouseEvent) => {
				e.stopPropagation()
				toggleContentEditable(item, false);
				editPrompt.buttonEl.setAttr("style", "display: inline-flex")
				savePrompt.buttonEl.setAttr("style", "display: none")
			})
		});
	}

	resetHistory(parentContainer: HTMLElement) {
		parentContainer.innerHTML = "";
	}
}
