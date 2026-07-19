export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "development") {
    const key = process.env.OPENAI_API_KEY;
    console.info("OPENAI_API_KEY present:", Boolean(key));
    console.info("OPENAI_API_KEY prefix valid:", Boolean(key?.startsWith("sk-") && key.length > 20));
  }
}

