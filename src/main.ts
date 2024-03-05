import { Plugin, WorkspaceLeaf } from "obsidian";
import { ChatHistoryItem } from "./Types/types";

import { History } from "History/HistoryHandler";
import { ChatModal2 } from "Plugin/Modal/ChatModal2";
import SettingsView from "Settings/SettingsView";
import { VIEW_TYPE, WidgetView } from "Plugin/Widget/Widget";
import { FAB } from "Plugin/FAB/FAB";

type ViewSettings = {
	model: string;
	modelName: string;
	modelType: string;
	modelEndpoint: string;
	endpointURL: string;
	historyIndex: number;
};

export interface LLMPluginSettings {
	appName: string;
	modalSettings: ViewSettings;
	widgetSettings: ViewSettings;
	fabSettings: ViewSettings,
	tokens: number;
	temperature: number;
	promptHistory: ChatHistoryItem[];
	openAIAPIKey: string;
}

export const DEFAULT_SETTINGS: LLMPluginSettings = {
	appName: "Local LLM Plugin",
	modalSettings: {
		model: "mistral-7b-openorca.Q4_0.gguf",
		modelName: "Mistral OpenOrca",
		modelType: "GPT4All",
		modelEndpoint: "chat",
		endpointURL: "/v1/chat/completions",
		historyIndex: -1,
	},
	widgetSettings: {
		model: "mistral-7b-openorca.Q4_0.gguf",
		modelName: "Mistral OpenOrca",
		modelType: "GPT4All",
		modelEndpoint: "chat",
		endpointURL: "/v1/chat/completions",
		historyIndex: -1,
	},
	fabSettings: {
		model: "mistral-7b-openorca.Q4_0.gguf",
		modelName: "Mistral OpenOrca",
		modelType: "GPT4All",
		modelEndpoint: "chat",
		endpointURL: "/v1/chat/completions",
		historyIndex: -1,
	},
	tokens: 300,
	temperature: 0.65,
	promptHistory: [],
	openAIAPIKey: "",
};

export default class LLMPlugin extends Plugin {
	settings: LLMPluginSettings;
	history: History;
	fab: FAB;

	async onload() {
		await this.loadSettings();

		this.registerRibbonIcons();
		this.registerCommands();

		this.registerView(VIEW_TYPE, (leaf) => new WidgetView(leaf, this));
		this.activateView();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsView(this.app, this));
		this.fab = new FAB(this);
		this.fab.generateFAB()

		this.history = new History(this);
	}

	onunload() {}

	private registerCommands() {
		const openChat = this.addCommand({
			id: "open-conversation-modal",
			name: "Open LLM Modal",
			editorCallback: () => {
				new ChatModal2(this).open();
			},
		});

		const openWidget = this.addCommand({
			id: "open-LLM-widget",
			name: "Open LLM Widget",
			callback: () => {
				this.activateView();
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
		// workspace.revealLeaf(leaf);
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
