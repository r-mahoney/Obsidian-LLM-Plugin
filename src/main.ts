import { Plugin } from "obsidian";
import {
	ChatHistoryItem,
	GPT4AllParams,
	Message
} from "./Types/types";

import { History } from "History/HistoryHandler";
import { ChatModal } from "Plugin/ChatModal";
import { ConversationalModal } from "Plugin/ConversationalModal";
import { ChatModal2 } from "Plugin/ChatModal2";
import SettingsView from "Settings/SettingsView";

interface LocalLLMPluginSettings {
	appName: string;
	model: string;
	tokens: number;
	temperature: number;
	promptHistory: ChatHistoryItem[];
}

export const DEFAULT_SETTINGS: LocalLLMPluginSettings = {
	appName: "Local LLM Plugin",
	model: "mistral-7b-openorca.Q4_0.gguf",
	tokens: 300,
	temperature: 5,
	promptHistory: [],
};

export default class LocalLLMPlugin extends Plugin {
	settings: LocalLLMPluginSettings;
	history: History

	async onload() {
		await this.loadSettings();

		this.registerRibbonIcons();
		this.registerCommands();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsView(this.app, this));
		this.history = new History(this);
	}

	onunload() {}

	private registerCommands() {
		const openChat = this.addCommand({
			id: "open-conversation-modal",
			name: "GPT4All Chat",
			editorCallback: () => {
				new ChatModal(this).open();
			},
		});
	}

	private registerRibbonIcons() {
		const singleQuestionIcon = this.addRibbonIcon(
			"bot",
			"Ask A Question",
			(evt: MouseEvent) => {
				new ChatModal(this).open();
			}
		);

		const conversationalModalIcon = this.addRibbonIcon(
			"lines-of-text",
			"test",
			(evt: MouseEvent) => {
				new ChatModal2(this).open();
				// new ConversationalModal(
				// 	this,
				// 	{
				// 		model: "",
				// 		messages: [{ role: "user", content: "what is 1 + 1" }],
				// 		temperature: 0.7,
				// 		tokens: 10,
				// 	},
				// 	{ role: "assistant", content: "Response" }
				// ).open();
			}
		);
	}

	showConversationalModel(modelParams: GPT4AllParams, response: Message) {
		new ConversationalModal(this, modelParams, response).open();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
// const statusBarItemEl = this.addStatusBarItem();
// statusBarItemEl.setText("Status Bar Text");

// // This adds a simple command that can be triggered anywhere
// this.addCommand({
// 	id: "open-sample-modal-simple",
// 	name: "Open sample modal (simple)",
// 	callback: () => {
// 		new SampleModal(this.app).open();
// 	},
// });
// // This adds an editor command that can perform some operation on the current editor instance
// this.addCommand({
// 	id: "sample-editor-command",
// 	name: "Sample editor command",
// 	editorCallback: (editor: Editor, view: MarkdownView) => {
// 		console.log(editor.getSelection());
// 		editor.replaceSelection("Sample Editor Command");
// 	},
// });
