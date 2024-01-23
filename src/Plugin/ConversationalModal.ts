import { GPT4AllParams, Message } from "Types/types";
import LocalLLMPlugin from "main";
import {
	ButtonComponent,
	Modal,
	TextAreaComponent,
	TextComponent,
} from "obsidian";
import { messageGPT4AllServer, processReplacementTokens } from "utils/utils";

export class ConversationalModal extends Modal {
	prompt: string;
	processedPrompt: string;
	answerText: string;
	generateButton: ButtonComponent;
	answerTextArea: TextAreaComponent;
	promptText: TextComponent;
	messages: Message[];

	constructor(
		private plugin: LocalLLMPlugin,
		private modelParams: GPT4AllParams,
		private response: Message
	) {
		super(plugin.app);
	}

	toggleTextAreaDisabled() {
		this.answerTextArea.inputEl.disabled =
			!this.answerTextArea.inputEl.disabled;
	}

	async handleGenerateClick() {
		this.processedPrompt = processReplacementTokens(this.prompt);
		this.messages.push({ role: "user", content: this.processedPrompt });
		const params: GPT4AllParams = this.modelParams;
		params.messages = this.messages;

		let responseText = this.answerTextArea.inputEl.getText();
		this.answerTextArea.inputEl.setText(
			`${responseText}\n\nPrompt: ${this.processedPrompt}`
		);
		const reponse: Message = await messageGPT4AllServer(params);
		this.promptText.setValue("");
		this.promptText.setPlaceholder("Ask a follow-up question");
		this.generateButton.setDisabled(false);
		this.generateButton.setButtonText("Generate Notes");
		responseText = this.answerTextArea.inputEl.getText();
		this.answerTextArea.inputEl.setText(
			`${responseText}\n\nResponse: ${reponse.content}`
		);
	}

	onOpen() {
		this.messages = this.modelParams.messages;
		this.messages.push({
			role: "assistant",
			content: this.response.content,
		});
		const { contentEl } = this;

		const container = contentEl.createDiv();
		container.className = "chat_container";

		this.answerTextArea = new TextAreaComponent(container);
		this.answerTextArea.inputEl.defaultValue = `Prompt: ${this.modelParams.messages[0].content}\n\nResponse: ${this.response.content}`;
		this.answerTextArea.inputEl.disabled = true;
		this.answerTextArea.inputEl.className = "conversation_answer_textarea";
		this.answerTextArea.onChange(
			(change: string) => (this.answerText = change)
		);
		this.promptText = new TextComponent(container);
		this.promptText.inputEl.className = "conversation_prompt_textarea";
		this.promptText.setPlaceholder("Ask a follow-up question");
		this.promptText.onChange((change: string) => (this.prompt = change));

		const buttonContainer = container.createDiv();
		buttonContainer.className = "chatModal_button_container";

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.buttonEl.className = "cancel_button";
		cancelButton.buttonEl.style.backgroundColor = "#b33939";
		cancelButton.setButtonText("Cancel").onClick(() => {
			this.close();
		});

		this.generateButton = new ButtonComponent(buttonContainer);
		this.generateButton.buttonEl.className = "generate-button";
		this.generateButton.buttonEl.style.backgroundColor = "#218c74";
		this.generateButton.setButtonText("Generate Notes").onClick(() => {
			this.generateButton.setButtonText("Loading...");
			this.generateButton.setDisabled(true);
			this.generateButton.buttonEl.style.backgroundColor =
				"rbga(33, 140, 116, 0.5)";
			this.handleGenerateClick();
		});
	}
}
