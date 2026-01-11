import { useChat } from "@ai-sdk/react";
import { env } from "@corporation/env/web";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export const Route = createFileRoute("/chat")({
	component: RouteComponent,
});

function RouteComponent() {
	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: `${env.VITE_SERVER_URL}/api/chat`,
			credentials: "include",
		}),
	});
	const [input, setInput] = useState("");

	return (
		<>
			{messages.map((message) => (
				<div key={message.id}>
					{message.role === "user" ? "User: " : "AI: "}
					{message.parts.map((part, index) =>
						part.type === "text" ? <span key={index}>{part.text}</span> : null
					)}
				</div>
			))}

			<form
				className="pb-40"
				onSubmit={(e) => {
					e.preventDefault();
					if (input.trim()) {
						sendMessage({ text: input });
						setInput("");
					}
				}}
			>
				<input
					disabled={status !== "ready"}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Say something..."
					value={input}
				/>
				<button disabled={status !== "ready"} type="submit">
					Submit
				</button>
			</form>
		</>
	);
}
