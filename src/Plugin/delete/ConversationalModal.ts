import { GPT4AllParams, Message } from "Types/types";
import LocalLLMPlugin from "main";
import {
	ButtonComponent,
	Modal,
	TextAreaComponent,
	TextComponent,
} from "obsidian";
import {
	appendMessage,
	messageGPT4AllServer,
	processReplacementTokens,
} from "utils/utils";
import { ChatModal } from "./ChatModal";

export class ConversationalModal extends Modal {
	prompt: string;
	processedPrompt: string;
	answerText: string;
	answerTextArea: TextAreaComponent;
	generateButton: ButtonComponent;
	addHiglightedButton: ButtonComponent;
	addTextButton: ButtonComponent;
	promptText: TextComponent;
	messages: Message[];
	selectedText: string;

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
		this.promptText.setValue("");
		this.processedPrompt = processReplacementTokens(this.prompt);
		this.messages.push({ role: "user", content: this.processedPrompt });
		const params: GPT4AllParams = this.modelParams;
		params.messages = this.messages;

		let responseText = this.answerTextArea.inputEl.getText();
		this.answerTextArea.inputEl.setText(
			`${responseText}\n\nPrompt: ${this.processedPrompt}`
		);
		const response: Message = await messageGPT4AllServer(params);
		this.promptText.setPlaceholder("Ask a follow-up question");
		this.generateButton.setDisabled(false);
		this.generateButton.setButtonText("Generate Notes");
		responseText = this.answerTextArea.inputEl.getText();
		this.answerTextArea.inputEl.setText(
			`${responseText}\n\nResponse: ${response.content}`
		);
		let history = this.messages;
		history.push({ role: response.role, content: response.content });
		this.plugin.history.addContext(history);
	}

	handleAddHiglightedClick() {
		const editor = this.app.workspace.activeEditor?.editor;
		const selectionStart = this.answerTextArea.inputEl.selectionStart;
		const selectionEnd = this.answerTextArea.inputEl.selectionEnd;
		const selection = this.answerTextArea.inputEl.value.substring(
			selectionStart,
			selectionEnd
		);
		this.selectedText = selection;
		appendMessage(editor!, this.selectedText);
		this.close();
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
		cancelButton.buttonEl.className = "mod-warning";
		cancelButton.setButtonText("Go Back").onClick(() => {
			this.close();
			new ChatModal(this.plugin, this.messages[this.messages.length-2]).open()
		});

		const undoButton = new ButtonComponent(buttonContainer);
		undoButton.buttonEl.addClass("no-display");
		undoButton.setButtonText("Undo").onClick(() => {
			this.toggleTextAreaDisabled();
			this.generateButton.buttonEl.removeClass("no-display");
			this.addHiglightedButton.buttonEl.removeClass("no-display");
			this.addTextButton.buttonEl.addClass("no-display");
			cancelButton.buttonEl.removeClass("no-display");
			undoButton.buttonEl.addClass("no-display");
		});

		this.generateButton = new ButtonComponent(buttonContainer);
		this.generateButton.buttonEl.className = "mod-cta";
		this.generateButton.setButtonText("Continue Chatting").onClick(() => {
			this.generateButton.setButtonText("Loading...");
			this.generateButton.setDisabled(true);
			this.handleGenerateClick();
		});

		this.addTextButton = new ButtonComponent(buttonContainer);
		this.addTextButton.buttonEl.addClass("no-display");
		this.addTextButton.setButtonText("Add Text to Note").onClick(() => {
			this.handleAddHiglightedClick();
		});

		this.addHiglightedButton = new ButtonComponent(buttonContainer);
		this.addHiglightedButton.buttonEl.className = "select-text";
		this.addHiglightedButton
			.setButtonText("Select Text to Add")
			.onClick(() => {
				this.toggleTextAreaDisabled();
				this.answerTextArea.inputEl.focus();
				this.generateButton.buttonEl.addClass("no-display");
				this.addHiglightedButton.buttonEl.addClass("no-display");
				this.addTextButton.buttonEl.removeClass("no-display");
				cancelButton.buttonEl.addClass("no-display");
				undoButton.buttonEl.removeClass("no-display");
			});
	}
}
