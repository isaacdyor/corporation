import alchemy from "alchemy";
import {
	Assets,
	DurableObjectNamespace,
	Vite,
	Worker,
} from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });
config({ path: "../../apps/agent/.env" });

const app = await alchemy("corporation");

export const web = await Vite("web", {
	cwd: "../../apps/web",
	assets: "dist",
	bindings: {
		VITE_SERVER_URL: alchemy.env("VITE_SERVER_URL"),
	},
});

export const server = await Worker("server", {
	cwd: "../../apps/server",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		DATABASE_URL: alchemy.secret(alchemy.env("DATABASE_URL")),
		CORS_ORIGIN: alchemy.env("CORS_ORIGIN"),
		BETTER_AUTH_SECRET: alchemy.secret(alchemy.env("BETTER_AUTH_SECRET")),
		BETTER_AUTH_URL: alchemy.env("BETTER_AUTH_URL"),
	},
	dev: {
		port: 3000,
	},
});

export const agent = await Worker("agent", {
	cwd: "../../apps/agent",
	entrypoint: "src/server.ts",
	compatibility: "node",
	url: true,
	bindings: {
		ASSETS: await Assets({ path: "../../apps/agent/public" }),
		Chat: DurableObjectNamespace("Chat", {
			className: "Chat",
			sqlite: true,
		}),
		OPENAI_API_KEY: alchemy.secret(alchemy.env("OPENAI_API_KEY")),
	},
	observability: {
		enabled: true,
	},
	dev: {
		port: 3002,
	},
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);
console.log(`Agent  -> ${agent.url}`);

await app.finalize();
