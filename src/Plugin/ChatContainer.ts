import LocalLLMPlugin from "main";
import { ButtonComponent, TextAreaComponent, TextComponent } from "obsidian";

export class ChatContainer{
    prompt: string;
    constructor(private plugin: LocalLLMPlugin) {}

    generateChatContainer(parentElement: HTMLElement) {
        const historyMessages = new TextAreaComponent(parentElement);
		const promptContainer = parentElement.createDiv();
		const promptField = new TextComponent(promptContainer);
		const sendButton = new ButtonComponent(promptContainer);

        historyMessages.inputEl.className = "messages-div";
		promptContainer.className = "prompt-container";
		promptField.inputEl.className = "chat-prompt-text-area";
		promptField.inputEl.id = "chat-prompt-text-area";
		sendButton.buttonEl.className = "send-button";

        sendButton.setIcon("up-arrow-with-tail");
		
		promptField.onChange((change: string) => {
			this.prompt = change;
		});
		sendButton.onClick((e: MouseEvent) => {
			promptField.inputEl.setText("");
			promptField.setValue("");
			this.prompt = "";
		});
    }
}