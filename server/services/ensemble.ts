export type AgentResult = { agent: string; headline: string; detail: string; adjustment?: string };

export function soilAgent(soilType = "Clay"): AgentResult {
  return { agent: "soil", headline: "25mm baseline", detail: `${soilType} soil has higher water retention`, adjustment: "baseline" };
}

export function plantHealthAgent(health = "Healthy"): AgentResult {
  return { agent: "plant", headline: "0.85× adjustment", detail: `${health} crop signals indicate low disease risk`, adjustment: "-15%" };
}

export function weatherAgent(): AgentResult {
  return { agent: "weather", headline: "1.3× adjustment", detail: "Hot conditions are expected tomorrow", adjustment: "+30%" };
}

export function marketAgent(crop = "Tomato"): AgentResult {
  return { agent: "market", headline: "Best harvest window: Day 24", detail: `${crop} demo market trend is strongest around Day 24` };
}

export function ensembleRecommendation(input?: { soilType?: string; crop?: string }) {
  const soil = soilAgent(input?.soilType);
  const plant = plantHealthAgent();
  const weather = weatherAgent();
  const market = marketAgent(input?.crop);
  return {
    waterMm: 28,
    recommendedTime: "06:00",
    confidence: 86,
    harvestRecommendation: "Best harvest window: Day 24",
    agentResults: [soil, plant, weather, market],
    reasoning: ["Clay soil baseline: 25mm", "Healthy plant adjustment: -15%", "Hot weather adjustment: +30%"],
    mode: "demo",
  } as const;
}

export function demoWeather() {
  return {
    mode: "demo",
    location: "Chennai, Tamil Nadu",
    current: { temperature: 38, humidity: 64, rainfall: 0, wind: 14 },
    forecast: [
      { day: "Today", temp: 38, rain: 0 }, { day: "Tue", temp: 37, rain: 10 }, { day: "Wed", temp: 35, rain: 25 },
      { day: "Thu", temp: 34, rain: 40 }, { day: "Fri", temp: 36, rain: 10 }, { day: "Sat", temp: 37, rain: 0 }, { day: "Sun", temp: 38, rain: 0 },
    ],
  };
}

export function demoMarket(crop = "Tomato") {
  const prices = [35, 37, 39, 38, 42, 44, 43, 46, 47, 45, 48, 51];
  return { mode: "demo", crop, unit: "₹ / kg", current: 42, trend: "+14%", harvestWindow: "Day 24", history: prices.map((price, index) => ({ day: `D${index + 12}`, price })) };
}
