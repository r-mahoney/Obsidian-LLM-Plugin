import { Plugin, WorkspaceLeaf, Platform	 } from "obsidian";
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
import { generateAssistantsList, getApiKeyValidity } from "utils/utils";
import {
	chat,
	claudeSonnetJuneModel,
	geminiModel,
	openAIModel,
	openAI,
	claude,
	gemini,
} from "utils/constants";

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
	defaultModel: string;
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
	defaultModel: "",
};

// NOTE -> shift all OS | File System abstractions out of main.
class MobileOperatingSystem implements OperatingSystem {
	homedir() {
		return "";
	}
	platform() {
		return "";
	}
}

class DesktopOperatingSystem implements OperatingSystem {
	private os: typeof import("os");
	constructor() {
		this.os = require("os");
	}
	homedir() {
		return this.os.homedir();
	}
	platform() {
		return this.os.platform();
	}
}

interface OperatingSystem {
	homedir: () => string;
	platform: () => string;
}

export interface FileSystem {
    existsSync: (path: string) => boolean;
    createReadStream: (path: string) => Promise<ReadableStream>; 
}

class DesktopFileSystem implements FileSystem {
	private fs: typeof import('fs');

	constructor() {
		this.fs = require('fs');
	}
    existsSync(path: string) {
        return this.fs.existsSync(path);
    }
	async createReadStream(path: string): Promise<ReadableStream> {
		return new Promise((resolve) => {
			const nodeStream = this.fs.createReadStream(path);
			resolve(new ReadableStream({
				start(controller) {
					nodeStream.on('data', (chunk) => controller.enqueue(chunk));
					nodeStream.on('end', () => controller.close());
					nodeStream.on('error', (err) => controller.error(err));
				}
			}));
		});
	}
}

class MobileFileSystem implements FileSystem {
	private plugin: LLMPlugin;

	constructor(plugin: LLMPlugin) {
		this.plugin = plugin;
	}

	existsSync(path: string) {
		return false;
	}

	async createReadStream(path: string): Promise<ReadableStream> {
		console.log("reading file from mobile", path);
		const buffer = await this.plugin.app.vault.adapter.readBinary(path);
		return new ReadableStream({
			start(controller) {
				controller.enqueue(buffer);
				controller.close();
			}
		});
	}
}
// ---------------------- end of lift and shift section -------------

export default class LLMPlugin extends Plugin {
	fileSystem: DesktopFileSystem | MobileFileSystem;
	os: DesktopOperatingSystem | MobileOperatingSystem;
	settings: LLMPluginSettings;
	assistants: Assistants;
	history: History;
	fab: FAB;

	async onload() {
		this.fileSystem = Platform.isDesktop ? new DesktopFileSystem() : new MobileFileSystem(this);
		this.os = new MobileOperatingSystem();
		await this.loadSettings();
		await this.checkForAPIKeyBasedModel();
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
			name: "Open Chat in Tab",
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
		const dataJSON = await this.loadData();
		if (dataJSON) {
			this.settings = Object.assign({}, dataJSON);
		} else {
			this.settings = Object.assign(
				{},
				DEFAULT_SETTINGS,
				await this.loadData()
			);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// TODO - refactor into utils
	async validateActiveModelsAPIKeys() {
		let activeClaudeModel, activeGeminiModel, activeOpenAIModel;

		const settingsObjects = [
			this.settings.modalSettings,
			this.settings.widgetSettings,
			this.settings.fabSettings,
		];

		settingsObjects.forEach((settings) => {
			const model = settings.model;
			switch (model) {
				case claudeSonnetJuneModel:
					activeClaudeModel = model === claudeSonnetJuneModel;
					break;
				case geminiModel:
					activeGeminiModel = model === geminiModel;
					break;
				case openAIModel:
					activeOpenAIModel = model === openAIModel;
					break;
			}
		});

		const providerKeyPairs = [
			{
				provider: openAI,
				key: this.settings.openAIAPIKey,
				isActive: activeOpenAIModel,
			},
			{
				provider: claude,
				key: this.settings.claudeAPIKey,
				isActive: activeClaudeModel,
			},
			{
				provider: gemini,
				key: this.settings.geminiAPIKey,
				isActive: activeGeminiModel,
			},
		];

		const filteredPairs = providerKeyPairs.filter(({ key, isActive }) => {
			// Skip providers with no keys -> this leaves us exposed to a user selecting a default model without adding a key.
			if (!key) return;
			// Only inspect pairs that are active in the application
			if (!isActive) return;
			return key;
		});

		// TODO - when a user saves a new api key, we should check if it's valid
		const promises = filteredPairs.map(async (pair) => {
			const result = await getApiKeyValidity(pair);
			return result;
		});

		const results = await Promise.all(promises);
		const hasValidOpenAIAPIKey: boolean = results.some((result) => {
			if (result) {
				return result.valid && result.provider === openAI;
			}
		});

		// We likely want a 'global' state variable to track whether or not
		// any UI elements around assistants should be on.

		// If the model is OpenAI and the key is valid -> generate the assistant list
		if (hasValidOpenAIAPIKey) await generateAssistantsList(this.settings);
	}

	async checkForAPIKeyBasedModel() {
		const fabModelRequiresKey =
			this.settings.fabSettings.model === openAIModel ||
			this.settings.fabSettings.model === claudeSonnetJuneModel ||
			this.settings.fabSettings.model === geminiModel;

		const widgetModelRequresKey =
			this.settings.widgetSettings.model === openAIModel ||
			this.settings.widgetSettings.model === claudeSonnetJuneModel ||
			this.settings.widgetSettings.model === geminiModel;

		const modalModelRequresKey =
			this.settings.modalSettings.model === openAIModel ||
			this.settings.modalSettings.model === claudeSonnetJuneModel ||
			this.settings.modalSettings.model === geminiModel;

		const activeModelRequiresKey =
			fabModelRequiresKey ||
			widgetModelRequresKey ||
			modalModelRequresKey;

		if (activeModelRequiresKey) await this.validateActiveModelsAPIKeys();
	}
	// end refactor into utils section
}
