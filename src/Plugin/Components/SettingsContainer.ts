import LocalLLMPlugin, { DEFAULT_SETTINGS } from "main";
import { ButtonComponent, DropdownComponent, Setting } from "obsidian";
import { DEFAULT_DIRECTORY, modelNames, models } from "utils/utils";
import { Header } from "./Header";
import { Model } from "Types/types";
const fs = require("fs");

export class SettingsContainer {
	constructor(private plugin: LocalLLMPlugin) {}

	generateSettingsContainer(
		parentContainer: HTMLElement,
		Header: Header
	) {
		const modelOptions = new Setting(parentContainer)
			.setName("Models")
			.setDesc("The model you want to use to generate a chat response.")
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption(
					DEFAULT_SETTINGS.modelName,
					"---Default Model---"
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
					const index = this.plugin.settings.historyIndex;
					this.plugin.settings.model = change;
					this.plugin.settings.modelName = modelName;
					this.plugin.settings.modelType = models[modelName].type;
					if (index > -1) {
						this.plugin.settings.promptHistory[index].model =
							change;
						this.plugin.settings.promptHistory[index].modelName =
							modelName;
					}
					this.plugin.saveSettings();
					Header.setHeader(modelName);
				});
				dropdown.setValue(this.plugin.settings.model);
			});

		const tempSetting = new Setting(parentContainer)
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

		const tokenSetting = new Setting(parentContainer)
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
