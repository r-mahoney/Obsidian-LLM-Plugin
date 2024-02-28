import LLMPlugin, { DEFAULT_SETTINGS } from "main";
import {
	App,
	ButtonComponent,
	DropdownComponent,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { DEFAULT_DIRECTORY } from "utils/utils";
import {  models, modelNames  } from "utils/models";
const fs = require("fs");

export default class SettingsView extends PluginSettingTab {
	plugin: LLMPlugin;

	constructor(app: App, plugin: LLMPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const resetHistory = new Setting(containerEl)
			.setName("Reset Chat History")
			.setDesc("This will delete previous Prompts and Chat Contexts")
			.addButton((button: ButtonComponent) => {
				button.setButtonText("Reset History");
				button.onClick(() => {
					this.plugin.history.reset();
				});
			});

		const openAIAPIKey = new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("OpenAI models require an API key for authentication.")
			.addText((text) => {
				text.setValue(`${this.plugin.settings.openAIAPIKey}`);
				text.onChange((change) => {
					this.plugin.settings.openAIAPIKey = change;
					this.plugin.saveSettings();
				});
			})
			.addButton((button: ButtonComponent) => {
				button.setButtonText("Generate token");
				button.onClick((evt: MouseEvent) => {
					window.open("https://beta.openai.com/account/api-keys");
				});
			});

		const setDefaultModel = new Setting(containerEl)
			.setName("Set Default Model")
			.setDesc("Sets the default LLM you want to use for the plugin")
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption(
					DEFAULT_SETTINGS.modalSettings.modelName,
					"Select Default Model"
				);
				let keys = Object.keys(models);
				for (let model of keys) {
					if (models[model].type === "GPT4All") {
						fs.exists(
							`${DEFAULT_DIRECTORY}/${models[model].model}`,
							(exists: boolean) => {
								if (exists) {
									dropdown.addOption(
										models[model].model,
										model
									);
								}
							}
						);
					} else {
						dropdown.addOption(models[model].model, model);
					}
				}
				dropdown.onChange((change) => {
					const modelName = modelNames[change];
					DEFAULT_SETTINGS.modalSettings.model = change;
					DEFAULT_SETTINGS.modalSettings.modelName = modelName;
					DEFAULT_SETTINGS.modalSettings.modelType =
						models[modelName].type;
					DEFAULT_SETTINGS.modalSettings.endpointURL =
						models[modelName].url;
					DEFAULT_SETTINGS.modalSettings.modelEndpoint =
						models[modelName].endpoint;
					DEFAULT_SETTINGS.widgetSettings.model = change;
					DEFAULT_SETTINGS.widgetSettings.modelName = modelName;
					DEFAULT_SETTINGS.widgetSettings.modelType =
						models[modelName].type;
					DEFAULT_SETTINGS.widgetSettings.endpointURL =
						models[modelName].url;
					DEFAULT_SETTINGS.widgetSettings.modelEndpoint =
						models[modelName].endpoint;
					this.plugin.saveSettings();
				});
				dropdown.setValue(this.plugin.settings.modalSettings.model);
			});
	}
}
