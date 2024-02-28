import { GPT4AllParams } from "Types/types";
import { Notice } from "obsidian";

export function settingsErrorHandling(params:GPT4AllParams) {
    const settings = Object.keys(params)
    const errors: string[] = []
    settings.map((setting: keyof GPT4AllParams) => {
        if(!params[setting]) {
            errors.push(`Request must include ${setting.toUpperCase()}`)
        }
    })

    return errors
}

export function errorMessages(error: Error, params: GPT4AllParams) {
    if(error.message === "Incorrect Settings") {
        settingsErrorHandling(params).forEach(wrongSetting => {
            new Notice(wrongSetting)
        })
    }
    if (error.message === "Failed to fetch") {
        new Notice(
            "You must have GPT4All open with the API Server enabled"
        );
    }

    if(error.message === "No API Key") {
        new Notice("You must have an API Key to access OpenAI models")
    }
}