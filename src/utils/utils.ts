import { GPT4AllParams } from "Types/types";

export async function messageGPT4AllServer(params: GPT4AllParams) {
    const response = await fetch("http://localhost:4891/v1/chat/completions", {
        method: "POST",
        body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            max_tokens: params.tokens,
            temperature: params.temperature,
        }),
    }).then((res) => res.json());
    return response.choices[0].message;
}

export function processReplacementTokens(prompt: string) {
    const tokenRegex = /\{\{(.*?)\}\}/g;
    const matches = [...prompt.matchAll(tokenRegex)];
    matches.forEach((match) => {
        const token = match[1] as keyof typeof this.replacementTokens;
        if (this.replacementTokens[token]) {
            prompt = this.replacementTokens[token](match, prompt);
        }
    });

    return prompt;
}