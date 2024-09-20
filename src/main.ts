import { Plugin, WorkspaceLeaf } from "obsidian";
import {
	HistoryItem,
	ImageQuality,
	ImageSize,
	ImageStyle,
	ResponseFormat,
	ViewSettings,
} from "./Types/types";

import { Assistants } from "Assistants/AssistantHandler";
import { History } from "History/HistoryHandler";
import { FAB } from "Plugin/FAB/FAB";
import { ChatModal2 } from "Plugin/Modal/ChatModal2";
import {
	LEAF_VIEW_TYPE,
	TAB_VIEW_TYPE,
	WidgetView,
} from "Plugin/Widget/Widget";
import SettingsView from "Settings/SettingsView";
import { Assistant } from "openai/resources/beta/assistants";
import { generateAssistantsList } from "utils/utils";
import { chat } from "utils/constants";

export interface LLMPluginSettings {
	appName: string;
	modalSettings: ViewSettings;
	widgetSettings: ViewSettings;
	fabSettings: ViewSettings;
	promptHistory: HistoryItem[];
	assistants: Assistant[];
	claudeAPIKey: string;
	geminiAPIKey: string;
	openAIAPIKey: string;
	GPT4AllStreaming: boolean;
	showFAB: boolean;
}

const defaultSettings = {
	assistant: false,
	assistantId: "",
	model: "gpt-3.5-turbo",
	modelName: "ChatGPT-3.5 Turbo",
	modelType: "openAI",
	modelEndpoint: chat,
	endpointURL: "/chat/completions",
	historyIndex: -1,
	imageSettings: {
		numberOfImages: 1,
		response_format: "url" as ResponseFormat,
		size: "1024x1024" as ImageSize,
		style: "vivid" as ImageStyle,
		quality: "standard" as ImageQuality,
	},
	chatSettings: {
		maxTokens: 300,
		temperature: 0.65,
		GPT4All: {},
		openAI: {
			frequencyPenalty: 0,
			logProbs: false,
			topLogProbs: null,
			presencePenalty: 0,
			responseFormat: "",
			topP: 1,
		},
	},
	speechSettings: {
		voice: "alloy",
		responseFormat: "mp3",
		speed: 1.0,
	},
};

export const DEFAULT_SETTINGS: LLMPluginSettings = {
	appName: "Local LLM Plugin",
	modalSettings: {
		...defaultSettings,
	},
	widgetSettings: {
		...defaultSettings,
	},
	fabSettings: {
		...defaultSettings,
	},
	promptHistory: [],
	assistants: [],
	openAIAPIKey: "",
	claudeAPIKey: "",
	geminiAPIKey: "",
	GPT4AllStreaming: false,
	showFAB: true,
};

export default class LLMPlugin extends Plugin {
	settings: LLMPluginSettings;
	assistants: Assistants;
	history: History;
	fab: FAB;

	async onload() {
		await this.loadSettings();
		this.registerRibbonIcons();
		this.registerCommands();

		this.registerView(
			TAB_VIEW_TYPE,
			(tab) => new WidgetView(tab, this, "tab")
		);
		this.registerView(
			LEAF_VIEW_TYPE,
			(leaf) => new WidgetView(leaf, this, "leaf")
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.fab = new FAB(this);
		this.addSettingTab(new SettingsView(this.app, this, this.fab));
		if (this.settings.showFAB) {
			setTimeout(() => {
				this.fab.regenerateFAB();
			}, 500);
		}
		this.history = new History(this);
		this.assistants = new Assistants(this);
	}

	onunload() {
		this.fab.removeFab();
	}

	private registerCommands() {
		//modal command that will be removed when modal is depricated
		const openChat = this.addCommand({
			id: "open-llm-modal",
			name: "Open LLM Modal",
			callback: () => {
				new ChatModal2(this).open();
			},
		});

		//widget command
		const openWidgetLeaf = this.addCommand({
			id: "open-LLM-widget-leaf",
			name: "Open Chat in Sidebar",
			callback: () => {
				this.activateLeaf();
			},
		});

		const openWidgetTab = this.addCommand({
			id: "open-LLM-widget-tab",
			name: "open Chat in Tab",
			callback: () => {
				this.activateTab();
			},
		});

		const toggleFab = this.addCommand({
			id: "toggle-LLM-fab",
			name: "Toggle LLM FAB",
			callback: () => {
				const currentFABState = this.settings.showFAB;
				this.settings.showFAB = !currentFABState;
				this.saveSettings();
				this.settings.showFAB
					? this.fab.regenerateFAB()
					: this.fab.removeFab();
			},
		});
	}

	private registerRibbonIcons() {
		//modal ribbon icon will be removed when modal is depricated
		const conversationalModalIcon = this.addRibbonIcon(
			"bot",
			"Ask A Question",
			(evt: MouseEvent) => {
				new ChatModal2(this).open();
			}
		);
	}

	async activateLeaf() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(LEAF_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({ type: LEAF_VIEW_TYPE, active: true });
		}
		workspace.revealLeaf(leaf);
	}

	async activateTab() {
		const { workspace } = this.app;

		let tab: WorkspaceLeaf | null = null;
		const tabs = workspace.getLeavesOfType(TAB_VIEW_TYPE);

		if (tabs.length > 0) {
			// A leaf with our view already exists, use that
			tab = tabs[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in a tab for it
			tab = workspace.getLeaf("tab");
			await tab.setViewState({ type: TAB_VIEW_TYPE, active: true });
		}
		workspace.revealLeaf(tab);
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
