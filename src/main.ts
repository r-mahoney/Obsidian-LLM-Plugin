import { Plugin, WorkspaceLeaf } from "obsidian";
import { ChatHistoryItem, GPT4AllParams, Message } from "./Types/types";

import { History } from "History/HistoryHandler";
import { ChatModal } from "Plugin/ChatModal";
import { ConversationalModal } from "Plugin/ConversationalModal";
import { ChatModal2 } from "Plugin/ChatModal2";
import SettingsView from "Settings/SettingsView";
import { VIEW_TYPE, WidgetView } from "Plugin/Widget/Widget";

interface LocalLLMPluginSettings {
	appName: string;
	model: string;
	modelName: string;
	tokens: number;
	temperature: number;
	promptHistory: ChatHistoryItem[];
	historyIndex: number;
}

export const DEFAULT_SETTINGS: LocalLLMPluginSettings = {
	appName: "Local LLM Plugin",
	model: "mistral-7b-openorca.Q4_0.gguf",
	modelName: "Mistral OpenOrca",
	tokens: 300,
	temperature: 0.65,
	promptHistory: [],
	historyIndex: -1,
};

export default class LocalLLMPlugin extends Plugin {
	settings: LocalLLMPluginSettings;
	history: History;

	async onload() {
		await this.loadSettings();

		this.registerRibbonIcons();
		this.registerCommands();
		
		// this.registerView(
		// 	VIEW_TYPE,
		// 	(leaf) => new WidgetView(leaf, this)
		//   );
	  
		//   this.addRibbonIcon("dice", "Activate view", () => {
		// 	this.activateView();
		//   });

		// This adds a settings tab so the user can configure various aspects of the plugin
		// this.addSettingTab(new SettingsView(this.app, this));

		this.history = new History(this);
	}

	onunload() {}

	private registerCommands() {
		const openChat = this.addCommand({
			id: "open-conversation-modal",
			name: "Open GPT4All Chat Modal",
			editorCallback: () => {
				new ChatModal2(this).open();
			},
		});
	}

	private registerRibbonIcons() {
		const conversationalModalIcon = this.addRibbonIcon(
			"bot",
			"Ask A Question",
			(evt: MouseEvent) => {
				new ChatModal2(this).open();
			}
		);
	}

	async activateView() {
		const { workspace } = this.app;
	
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE);
	
		if (leaves.length > 0) {
		  // A leaf with our view already exists, use that
		  leaf = leaves[0];
		} else {
		  // Our view could not be found in the workspace, create a new leaf
		  // in the right sidebar for it
		  leaf = workspace.getRightLeaf(false);
		  await leaf.setViewState({ type: VIEW_TYPE, active: true });
		}
	
		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
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
