import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import z from "zod";

import { publicProcedure } from "../index";

const ChatInputSchema = z
	.object({
		messages: z.array(z.any()),
	})
	.passthrough();

export const chatRouter = {
	sendMessage: publicProcedure
		.route({
			method: "POST",
			path: "/chat",
		})
		.input(ChatInputSchema)
		.handler(({ input }) => {
			console.log("❤️ ❤️ ❤️ ❤️ ❤️ input", JSON.stringify(input, null, 2));
			try {
				const result = streamText({
					model: anthropic("claude-sonnet-4.5"),
					system: "You are a helpful assistant.",
					messages: input.messages,
				});

				return result.textStream;
			} catch (error) {
				console.error("❤️ ❤️ ❤️ ❤️ ❤️ error", error);
				throw error;
			}
		}),
};
