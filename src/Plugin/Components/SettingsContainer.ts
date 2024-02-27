import { ViewType } from "Types/types";
import LocalLLMPlugin, { DEFAULT_SETTINGS } from "main";
import { DropdownComponent, Setting } from "obsidian";
import {
	DEFAULT_DIRECTORY,
	getModelInfo,
	modelNames,
	models,
} from "utils/utils";
import { Header } from "./Header";
const fs = require("fs");

export class SettingsContainer {
	viewType: ViewType;

	constructor(private plugin: LocalLLMPlugin, viewType: ViewType) {
		this.viewType = viewType;
	}

	generateSettingsContainer(parentContainer: HTMLElement, Header: Header) {
		const settings: Record<string, string> = {
			modal: "modalSettings",
			widget: "widgetSettings",
		};
		const settingType: "modalSettings" | "widgetSettings" = settings[
			this.viewType
		] as "modalSettings" | "widgetSettings";

		const modelOptions = new Setting(parentContainer)
			.setName("Models")
			.setDesc("The model you want to use to generate a chat response.")
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption(
					DEFAULT_SETTINGS[settingType].modelName,
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
					const { historyIndex } = getModelInfo(
						this.plugin,
						this.viewType
					);
					const modelName = modelNames[change];
					const index = historyIndex;
					this.plugin.settings[settingType].model = change;
					this.plugin.settings[settingType].modelName = modelName;
					this.plugin.settings[settingType].modelType =
						models[modelName].type;
					if (index > -1) {
						this.plugin.settings.promptHistory[index].model =
							change;
						this.plugin.settings.promptHistory[index].modelName =
							modelName;
					}
					this.plugin.saveSettings();
					Header.setHeader(modelName);
				});
				dropdown.setValue(this.plugin.settings[settingType].model);
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
