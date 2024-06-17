import { Plugin, WorkspaceLeaf } from "obsidian";
import { HistoryItem } from "./Types/types";

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
type imageAdvSettings = {
	numberOfImages: number;
	response_format: "url" | "b64_json";
	size: string;
	style: "vivid" | "natural";
	quality?: "hd" | "standard";
};

export interface LLMPluginSettings {
	appName: string;
	modalSettings: ViewSettings;
	widgetSettings: ViewSettings;
	fabSettings: ViewSettings;
	tokens: number;
	temperature: number;
	promptHistory: HistoryItem[];
	openAIAPIKey: string;
	GPT4AllStreaming: boolean;
	showFAB: boolean;
	imageAdvSettings: imageAdvSettings;
}

const defaultSettings = {
	model: "gpt-3.5-turbo",
	modelName: "ChatGPT-3.5 Turbo",
	modelType: "openAI",
	modelEndpoint: "chat",
	endpointURL: "/chat/completions",
	historyIndex: -1,
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
	imageAdvSettings: {
		numberOfImages: 1,
		response_format: "url",
		size: "1024x1024",
		style: "vivid",
		quality: "standard",
	},
	tokens: 300,
	temperature: 0.65,
	promptHistory: [],
	openAIAPIKey: "",
	GPT4AllStreaming: false,
	showFAB: true,
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
		this.fab = new FAB(this);
		this.addSettingTab(new SettingsView(this.app, this, this.fab));
		if (this.settings.showFAB) {
			setTimeout(() => {
				this.fab.regenerateFAB();
			}, 500);
		}
		this.history = new History(this);
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
