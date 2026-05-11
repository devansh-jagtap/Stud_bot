export async function GET() {
  try {
    const headers = (key: string) => ({
      Authorization: `Bearer ${key}`,
    });

    const fetchModels = async (
      url: string,
      apiKey: string,
      provider: string,
    ) => {
      try {
        const res = await fetch(url, { headers: headers(apiKey) });
        const data = await res.json();
        return (data.data ?? []).map((m: { id: string }) => ({
          id: m.id,
          provider,
        }));
      } catch {
        return []; // if one provider fails, skip it
      }
    };

    const [groq, nvidia, openrouter, cerebras] = await Promise.all([
      fetchModels(
        "https://api.groq.com/openai/v1/models",
        process.env.GROQ_API_KEY!,
        "groq",
      ),
      fetchModels(
        "https://integrate.api.nvidia.com/v1/models",
        process.env.NVIDIA_API_KEY!,
        "nvidia",
      ),
      fetchModels(
        "https://openrouter.ai/api/v1/models",
        process.env.OPENROUTER_API_KEY!,
        "openrouter",
      ),
      fetchModels(
        "https://api.cerebras.ai/v1/models",
        process.env.CEREBRAS_API_KEY!,
        "cerebras",
      ),
    ]);

    // Gemini hardcoded — Google doesn't have a simple models list endpoint
   const gemini = [
  { id: "gemini-3-flash-preview",         provider: "google" },
  { id: "gemini-3.1-flash-lite-preview",  provider: "google" },
  { id: "gemini-2.5-flash-lite",          provider: "google" },
];
    return Response.json({
      models: [...gemini, ...groq, ...nvidia, ...openrouter, ...cerebras],
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch models" }), {
      status: 500,
    });
  }
}
