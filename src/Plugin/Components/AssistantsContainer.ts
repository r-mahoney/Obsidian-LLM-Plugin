import LLMPlugin from "main";
import {
	ButtonComponent,
	DropdownComponent,
	Setting,
	TextAreaComponent,
} from "obsidian";
import { ViewType } from "Types/types";
import { models } from "utils/models";
import {
	createAssistant,
	createVectorAndUpdate,
	DEFAULT_DIRECTORY,
} from "utils/utils";
const fs = require("fs");

export class AssistantsContainer {
	viewType: ViewType;
	files: string;
	assistantName: string;
	assistantIntructions: string;
	assistantToolType: string;
	assistantModel: string;
	assistantFiles: string[];

	constructor(private plugin: LLMPlugin, viewType: ViewType) {
		this.viewType = viewType;
	}

	generateAssistantsContainer(parentContainer: HTMLElement) {
		const assistantName = new Setting(parentContainer)
			.setName("Assistant Name")
			.setDesc("The name to be attributed to the new assistant")
			.addText((text) => {
				text.inputEl.type = "text";
				text.onChange((change) => {
					this.assistantName = change;
				});
			});

		const assistantIntructions = new Setting(parentContainer)
			.setName("Assistant Instructions")
			.setDesc("The system instructions for the assistant to follow.")
			.addText((text) => {
				text.inputEl.type = "text";
				text.onChange((change) => {
					this.assistantIntructions = change;
				});
			});

		const assistantToolType = new Setting(parentContainer)
			.setName("Assistant Tool Type")
			.setDesc("File Search or Code Review")
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption("", "---Tool Type---");
				dropdown.addOption("file_search", "File Search");
				// dropdown.addOption("code_interpreter", "Code Interpreter");

				dropdown.onChange((change) => {
					this.assistantToolType = change;
					change === "file_search"
						? files.settingEl.setAttr("style", "display:flex")
						: files.settingEl.setAttr("style", "display:none");
				});
			});
		const files = new Setting(parentContainer)
			.setName("Files")
			.setDesc("Files to be added for the assistant to search")
			.addTextArea((component: TextAreaComponent) => {
				component.onChange((change) => {
					this.files = change;
				});
			});
		files.settingEl.setAttr("style", "display:none");
		const assistantModel = new Setting(parentContainer)
			.setName("Assistant Model")
			.setDesc("Which LLM you want your assistant to use")
			.addDropdown((dropdown: DropdownComponent) => {
				dropdown.addOption("", "---Select Model---");
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
					this.assistantModel = change;
				});
			});

		const buttonDiv = parentContainer.createDiv();
		buttonDiv.addClass("flex", "assistants-button-div", "setting-item");
		const submitButton = new ButtonComponent(buttonDiv);
		submitButton.buttonEl.addClass("mod-cta", "assistants-button");
		submitButton.buttonEl.textContent = "Create Assistant";

		submitButton.onClick(async (e: MouseEvent) => {
			e.preventDefault();
			//@ts-ignore
			const basePath = app.vault.adapter.basePath;

			this.assistantFiles = this.files.split(",").map((file) => {
				return `${basePath}\\${file.trim()}`;
			});
            
			const assistantObj = {
				name: this.assistantName,
				instructions: this.assistantIntructions,
				model: this.assistantModel,
				tools: [{ type: this.assistantToolType }],
			};
			const assistant = await createAssistant(
				assistantObj,
				this.plugin.settings.openAIAPIKey
			);

			const vector_store_id = await createVectorAndUpdate(
				this.assistantFiles,
				assistant,
				this.plugin.settings.openAIAPIKey
			);

			this.plugin.assistants.push({
				...assistant,
				modelType: "assistant",
				tool_resources: {
					file_search: { vector_store_ids: [vector_store_id] },
				},
			});

			this.resetContainer(parentContainer);
		});
	}

	resetContainer(parentContainer: HTMLElement) {
		parentContainer.innerHTML = "";
		this.generateAssistantsContainer(parentContainer);
	}
}
