import {
	ButtonComponent,
	DropdownComponent,
	Modal,
	Setting,
	TextAreaComponent,
	TextComponent,
	addIcon,
} from "obsidian";
import LocalLLMPlugin from "main";

export class ChatModal2 extends Modal {
	prompt: string;
	constructor(private plugin: LocalLLMPlugin) {
		super(plugin.app);
	}

	hideContainer(container: HTMLElement) {
		container.setAttr("style", "display: none");
	}
	showContainer(container: HTMLElement) {
		container.setAttr("style", "display: flex");
	}

	onOpen() {
		const { contentEl } = this;
		let history = this.plugin.settings.promptHistory;
		const models = {
			"Mistral OpenOrca": "mistral-7b-openorca.Q4_0.gguf",
			"Mistral Instruct": "mistral-7b-instruct-v0.1.Q4_0.gguf",
			"GPT4All Falcon": "gpt4all-falcon-newbpe-q4_0.gguf",
			"Orca 2 (Medium)": "orca-2-7b.Q4_0.gguf",
			"Orca 2 (Full)": "orca-2-13b.Q4_0.gguf",
			"Mini Orca (Small)": "orca-mini-3b-gguf2-q4_0.gguf",
			"MPT Chat": "mpt-7b-chat-newbpe-q4_0.gguf",
			"Wizard v1.2": "wizardlm-13b-v1.2.Q4_0.gguf",
			Hermes: "nous-hermes-llama2-13b.Q4_0.gguf",
			Snoozy: "gpt4all-13b-snoozy-q4_0.gguf",
			"EM German Mistral": "em_german_mistral_v01.Q4_0.gguf",
		};

		const titleDiv = contentEl.createDiv();
		const leftButtonDiv = titleDiv.createDiv();
		const title = titleDiv.createDiv();
		const rightButtonsDiv = titleDiv.createDiv();

		titleDiv.className = "title-div";
		title.innerHTML = "LocalLLM Plugin";

		const chatHistoryButton = new ButtonComponent(leftButtonDiv);
		chatHistoryButton.onClick(() => {
			this.showContainer(chatHistoryContainer);
			this.hideContainer(settingsContainer);
			this.hideContainer(chatContainer);
		});
		const settingsButton = new ButtonComponent(rightButtonsDiv);
		settingsButton.onClick(() => {
			this.showContainer(settingsContainer);
			this.hideContainer(chatContainer);
			this.hideContainer(chatHistoryContainer);
		});
		const newChatButton = new ButtonComponent(rightButtonsDiv);
		newChatButton.onClick(() => {
			this.showContainer(chatContainer);
			this.hideContainer(settingsContainer);
			this.hideContainer(chatHistoryContainer);
		});
		const lineBreak = contentEl.createDiv();

		const chatContainer = contentEl.createDiv();
		const chatHistoryContainer = contentEl.createDiv();
		const settingsContainer = contentEl.createDiv();
		settingsContainer.setAttr("style", "display: none");
		settingsContainer.className = "settings-container";
		chatHistoryContainer.setAttr("style", "display: none");
		chatHistoryContainer.className = "chat-history-container";
		const historyMessages = new TextAreaComponent(chatContainer);
		const promptContainer = chatContainer.createDiv();
		const promptField = new TextComponent(promptContainer);
		const sendButton = new ButtonComponent(promptContainer);

		lineBreak.className = "title-border";
		leftButtonDiv.className = "one left-buttons-div";
		rightButtonsDiv.className = "one right-buttons-div";
		title.className = "four title";
		chatContainer.className = "chat-container";
		historyMessages.inputEl.className = "messages-div";
		promptContainer.className = "prompt-container";
		promptField.inputEl.className = "chat-prompt-text-area";
		promptField.inputEl.id = "chat-prompt-text-area";
		sendButton.buttonEl.className = "send-button";
		chatHistoryButton.buttonEl.className = "title-buttons";
		settingsButton.buttonEl.className = "title-buttons";
		newChatButton.buttonEl.className = "title-buttons";

		chatHistoryButton.setIcon("bullet-list");
		settingsButton.setIcon("wrench-screwdriver-glyph");
		newChatButton.setIcon("plus");
		sendButton.setIcon("up-arrow-with-tail");

		promptField.onChange((change: string) => {
			this.prompt = change;
		});
		sendButton.onClick((e: MouseEvent) => {
			console.log(this.plugin.settings);
			promptField.inputEl.setText("");
			promptField.setValue("");
			this.prompt = "";
		});

		const modelOptions = new Setting(settingsContainer)
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

		const tempSetting = new Setting(settingsContainer)
			.setName("Temperature")
			.setDesc(
				"Higher temperatures (eg., 1.2) increase randomness, resulting in more imaginative and diverse text. Lower temperatures (eg., 0.5) make the output more focused, predictable, and conservative. A safe range would be around 0.6 - 0.85"
			)
			.addText((text) => {
				text.setValue(`${this.plugin.settings.temperature}`);
				text.inputEl.type = "number";
				text.onChange((change) => {
					this.plugin.settings.temperature = parseFloat(change);
					this.plugin.saveSettings();
				});
			});

		const tokenSetting = new Setting(settingsContainer)
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
	}
}
