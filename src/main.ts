import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import {
	ChatHistoryItem,
	ChatModalSettings,
	GPT4AllParams,
	TokenParams,
} from "./Types/types";
import data from "../prompts.json";

import SettingsView from "Settings/SettingsView";
import { ChatModal } from "Plugin/ChatModal";
import { json } from "stream/consumers";

interface LocalLLMPluginSettings {
	appName: string;
	model: string;
	tokens: number;
	temperature: number;
	promptHistory: ChatHistoryItem[];
	tokenParams: TokenParams;
}

export const DEFAULT_SETTINGS: LocalLLMPluginSettings = {
	appName: "Local LLM  Plugin",
	model: "mistral-7b-openorca.Q4_0.gguf",
	tokens: 300,
	temperature: 5,
	promptHistory: [],
	tokenParams: data as TokenParams,
};

export default class LocalLLMPlugin extends Plugin {
	settings: LocalLLMPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerRibbonIcons();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsView(this.app, this));

		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			editorCallback: () => {
				new SampleModal(this.app).open();
			},
		});
	}

	onunload() {}

	private registerRibbonIcons() {
		const ribbonIcon = this.addRibbonIcon(
			"bot",
			"GPT4All Chat",
			(evt: MouseEvent) => {
				new ChatModal(this).open();
			}
		);
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

// // This creates an icon in the left ribbon.
// const ribbonIconEl = this.addRibbonIcon(
// 	"dice",
// 	"Sample Plugin",
// 	(evt: MouseEvent) => {
// 		// Called when the user clicks the icon.
// 		new Notice("This is a notice!");
// 	}
// );
// // Perform additional things with the ribbon
// ribbonIconEl.addClass("my-plugin-ribbon-class");

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
// // This adds a complex command that can check whether the current state of the app allows execution of the command
// this.addCommand({
// 	id: "open-sample-modal-complex",
// 	name: "Open sample modal (complex)",
// 	checkCallback: (checking: boolean) => {
// 		// Conditions to check
// 		const markdownView =
// 			this.app.workspace.getActiveViewOfType(MarkdownView);
// 		if (markdownView) {
// 			// If checking is true, we're simply "checking" if the command can be run.
// 			// If checking is false, then we want to actually perform the operation.
// 			if (!checking) {
// 				new SampleModal(this.app).open();
// 			}

// 			// This command will only show up in Command Palette when the check function returns true
// 			return true;
// 		}
// 	},
// });
