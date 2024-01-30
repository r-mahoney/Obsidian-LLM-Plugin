import { ChatHistoryItem, GPT4AllParams } from "Types/types";
import LocalLLMPlugin from "main";
import {
	ButtonComponent,
	DropdownComponent,
	MarkdownView,
	Modal,
	Notice,
	Setting,
	TextAreaComponent,
	ToggleComponent,
} from "obsidian";
import {
	messageGPT4AllServer,
	modelLookup,
	processReplacementTokens,
} from "utils/utils";

export class ChatModal extends Modal {
	prompt: string;
	processedPrompt: string;
	replaceTokensInHistory: boolean;
	generateButton: ButtonComponent;
	promptField: TextAreaComponent;
	historyIndex: number;

	constructor(
		private plugin: LocalLLMPlugin,
	) {
		super(plugin.app);
	}

	onOpen() {
		const { contentEl } = this;
		const models = {
			"Mistral OpenOrca": "mistral-7b-openorca.Q4_0.gguf",
			"Mistral Instruct": "mistral-7b-instruct-v0.1.Q4_0.gguf",
			"GPT4All Falcon": "gpt4all-falcon-newbpe-q4_0.gguf",
			"Orca 2 (Medium)": "orca-2-7b.Q4_0.gguf",
			SBert: "all-MiniLM-L6-v2-f16.gguf",
			"MPT Chat": "mpt-7b-chat-newbpe-q4_0.gguf",
		};
		const titleDiv = contentEl.createDiv();
		titleDiv.className = "setting-item setting-item-heading";
		const title = titleDiv.createDiv();
		title.className = "setting-item-info";
		title.innerHTML = "What do you want to chat about?";

		const container = contentEl.createDiv();
		container.className = "chat_container";

		const modelOptions = new Setting(container)
			.setName("Models")
			.setDesc("The model you want to use to generate a chat response.")
			.addDropdown((dropdown: DropdownComponent) => {
				let keys = Object.keys(models);
				for (let model of keys) {
					//@ts-ignore
					dropdown.addOption(models[model], model);
				}
				dropdown.onChange((change) => {
					this.plugin.settings.model = change;
					this.plugin.saveSettings();
				});
				dropdown.setValue(this.plugin.settings.model);
			});

		const tempSetting = new Setting(container)
			.setName("Temperature")
			.setDesc("Higher temperatures (eg., 1.2) increase randomness, resulting in more imaginative and diverse text. Lower temperatures (eg., 0.5) make the output more focused, predictable, and conservative. A safe range would be around 0.6 - 0.85")
			.addText((text) => {
				text.setValue(`${this.plugin.settings.temperature}`);
				text.inputEl.type = "number";
				text.onChange((change) => {
					this.plugin.settings.temperature = parseFloat(change);
					this.plugin.saveSettings();
				});
			});

		const tokenSetting = new Setting(container)
			.setName("Tokens")
			.setDesc("The number of tokens used in the completion.")
			.addText((text) => {
				text.setValue(`${this.plugin.settings.tokens}`);
				text.inputEl.type = "number";
				text.onChange((change) => {
					this.plugin.settings.tokens = parseInt(change);
					this.plugin.saveSettings();
				});
			});

		const history_toggle_container = container.createDiv({
			cls: "history_container",
			text: "Replace prompt in history.",
		});
		const history_toggle = new ToggleComponent(history_toggle_container);

		const history_dropdown = new DropdownComponent(container);
		history_dropdown.selectEl.className = "history_dropdown";

		let history = this.plugin.settings.promptHistory;

		this.generateHistoryOptions(history_dropdown, history);
		history_toggle.onChange((change) => {
			this.replaceTokensInHistory = change;
		});

		history_dropdown.onChange((change) => {
			try {
				const index = parseInt(change);
				this.useHistoryItem(history[index]);
				history_dropdown.setValue("History");
				this.historyIndex = index
			} catch (e: any) {}
		});

		this.promptField = new TextAreaComponent(container);
		this.promptField.inputEl.className = "chat_prompt_textarea";
		this.promptField.setPlaceholder("Enter your prompt...");
		this.promptField.onChange((change) => {
			this.prompt = change;
		});

		const buttonContainer = container.createDiv();
		buttonContainer.className = "chatModal_button_container";

		const cancelButton = new ButtonComponent(buttonContainer);
		cancelButton.setButtonText("Cancel").onClick(() => {
			this.close();
		});

		this.generateButton = new ButtonComponent(buttonContainer);
		this.generateButton.buttonEl.className = "mod-cta";
		this.generateButton.setButtonText("Generate Notes").onClick(() => {
			this.generateButton.setButtonText("Loading...");
			this.generateButton.setDisabled(true);
			this.handleGenerateClick();
		});
	}

	generateHistoryOptions(
		history_dropdown: DropdownComponent,
		history: ChatHistoryItem[]
	) {
		history_dropdown.addOption("History", "History");
		for (let i = 0; i < history.length - 1; i++) {
			const prompt = history[i].prompt;
			if (prompt.length > 80) {
				history_dropdown.addOption(`${i}`, prompt.slice(0, 80) + "...");
				continue;
			}
			history_dropdown.addOption(`${i}`, prompt);
		}
	}

	useHistoryItem(item: ChatHistoryItem) {
		const prompt = this.replaceTokensInHistory
			? item.processedPrompt
			: item.prompt;
		this.promptField.setValue(prompt);
		this.prompt = prompt;
	}

	async handleGenerateClick() {
		const view =
			this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		this.processedPrompt = processReplacementTokens(this.prompt);

		if (!view) {
			new Notice(
				"You must have a markdown file open to complete this action."
			);
			this.generateButton.setDisabled(false);
			this.generateButton.setButtonText("Generate Notes");
			return;
		}

		const params: GPT4AllParams = {
			messages: [{ role: "user", content: this.processedPrompt }],
			temperature: this.plugin.settings.temperature / 10,
			tokens: this.plugin.settings.tokens,
			model: this.plugin.settings.model,
		};

		if (!modelLookup(this.plugin.settings.model)) {
			new Notice(
				"You must first install the selected model from the GPT4All Chat Client"
			);
			return;
		}

		try {
			const response = await messageGPT4AllServer(params);
			if (!response) {
				throw new Error(response);
			}
			this.close();
			this.plugin.showConversationalModel(params, response);
		} catch (err) {
			if (err.message === "Failed to fetch") {
				new Notice(
					"You must have GPT4All open with the API Server enabled"
				);
			}
			this.generateButton.setDisabled(false);
			this.generateButton.setButtonText("Generate Notes");
			return;
		}

		this.plugin.history.push({
			prompt: this.prompt,
			processedPrompt: this.processedPrompt,
			messages: params.messages,
			temperature: params.temperature,
			tokens: params.tokens,
		});
	}
}
