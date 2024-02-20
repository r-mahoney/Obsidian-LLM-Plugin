import LocalLLMPlugin, { DEFAULT_SETTINGS } from "main";
import { ButtonComponent, DropdownComponent, Setting } from "obsidian";
import { DEFAULT_DIRECTORY } from "utils/utils";
import { Header } from "./Header";
import { Model } from "Types/types";
const fs = require("fs");

export class SettingsContainer {
	constructor(private plugin: LocalLLMPlugin) {}

	generateSettingsContainer(
		parentContainer: HTMLElement,
		models: Record<string, Model>,
		Header: Header
	) {
		const modelNames: Record<string, string> = {
			"mistral-7b-openorca.Q4_0.gguf": "Mistral OpenOrca",
			"mistral-7b-instruct-v0.1.Q4_0.gguf": "Mistral Instruct",
			"gpt4all-falcon-newbpe-q4_0.gguf": "GPT4All Falcon",
			"orca-2-7b.Q4_0.gguf": "Orca 2 (Medium)",
			"orca-2-13b.Q4_0.gguf": "Orca 2 (Full)",
			"orca-mini-3b-gguf2-q4_0.gguf": "Mini Orca (Small)",
			"mpt-7b-chat-newbpe-q4_0.gguf": "MPT Chat",
			"wizardlm-13b-v1.2.Q4_0.gguf": "Wizard v1.2",
			"nous-hermes-llama2-13b.Q4_0.gguf": "Hermes",
			"gpt4all-13b-snoozy-q4_0.gguf": "Snoozy",
			"em_german_mistral_v01.Q4_0.gguf": "EM German Mistral",
			"gpt-3.5-turbo" : "ChatGPT-3.5 Turbo",
			"text-embedding-3-small": "Text Embedding 3 (Small)",
		};

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
					this.plugin.settings.model = change;
					this.plugin.settings.modelName = modelName;
					this.plugin.settings.modelType = models[modelName].type;
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
