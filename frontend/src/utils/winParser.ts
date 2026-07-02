export interface ParsedWin {
  category: string;
  carbonSaved: number;
  icon: string;
  detail: string;
}

export const parseGreenWin = (text: string): ParsedWin => {
  const t = text.toLowerCase();
  
  // Transport
  if (t.includes('walk') || t.includes('run') || t.includes('foot') || t.includes('jog')) {
    return { category: 'transport', carbonSaved: 1.5, icon: '🚶', detail: 'swapped a short vehicle drive for a zero-emissions walk!' };
  }
  if (t.includes('bike') || t.includes('cycle') || t.includes('bicycle')) {
    return { category: 'transport', carbonSaved: 3.2, icon: '🚲', detail: 'replaced fossil combustion commuting with active cycling!' };
  }
  if (t.includes('bus') || t.includes('train') || t.includes('metro') || t.includes('subway') || t.includes('transit')) {
    return { category: 'transport', carbonSaved: 4.8, icon: '🚇', detail: 'opted for mass transit, dramatically reducing passenger footprint!' };
  }
  if (t.includes('ev') || t.includes('electric vehicle') || t.includes('tesla') || t.includes('hybrid')) {
    return { category: 'transport', carbonSaved: 8.5, icon: '⚡', detail: 'drove electric, eliminating direct exhaust greenhouse gas emissions!' };
  }
  
  // Energy
  if (t.includes('solar') || t.includes('panel')) {
    return { category: 'energy', carbonSaved: 15.0, icon: '☀️', detail: 'generated green electricity locally and offset thermal coal fuel!' };
  }
  if (t.includes('led') || t.includes('bulb') || t.includes('light')) {
    return { category: 'energy', carbonSaved: 1.2, icon: '💡', detail: 'swapped high-draw lighting for highly efficient solid state LEDs!' };
  }
  if (t.includes('ac') || t.includes('air conditioning') || t.includes('heating') || t.includes('thermostat') || t.includes('fan')) {
    return { category: 'energy', carbonSaved: 4.5, icon: '❄️', detail: 'adjusted energy loading to save fossil grid generation peak draw!' };
  }
  
  // Food / Diet
  if (t.includes('vegan') || t.includes('plant') || t.includes('veg') || t.includes('vegetarian') || t.includes('salad') || t.includes('tofu') || t.includes('meatless')) {
    return { category: 'food', carbonSaved: 2.8, icon: '🥗', detail: 'avoided methane-heavy animal agriculture emissions for a plant meal!' };
  }
  if (t.includes('compost') || t.includes('composting') || t.includes('organic')) {
    return { category: 'food', carbonSaved: 5.2, icon: '🍂', detail: 'diverted organic waste from oxygen-deprived landfill methane generation!' };
  }
  
  // Shopping / Lifestyle
  if (t.includes('thrift') || t.includes('secondhand') || t.includes('used') || t.includes('repair') || t.includes('mend') || t.includes('clothes')) {
    return { category: 'lifestyle', carbonSaved: 9.8, icon: '🧵', detail: 'bypassed fast-fashion supply chains and textile manufacturing waste!' };
  }
  if (t.includes('bottle') || t.includes('bag') || t.includes('cup') || t.includes('plastic') || t.includes('reuse')) {
    return { category: 'lifestyle', carbonSaved: 0.8, icon: '🥤', detail: 'prevented single-use packaging waste production and petroleum draw!' };
  }
  
  // Default fallback
  return { category: 'lifestyle', carbonSaved: 2.0, icon: '🌿', detail: 'took a proactive green step to reduce carbon footprint!' };
};

export const parseGreenWinAI = async (text: string, apiKey?: string | null): Promise<ParsedWin> => {
  if (!apiKey) {
    return parseGreenWin(text);
  }
  
  try {
    const prompt = `You are an environmental science AI. Analyze this green deed: "${text}". Output a JSON object containing: 'category' (one of: 'transport', 'energy', 'food', 'lifestyle'), 'carbonSaved' (float estimation in kg CO2 saved), 'icon' (a single emoji representing the deed), and 'detail' (a brief explanation under 15 words of why this saves carbon). Return ONLY the raw JSON block without any markdown formatting or extra text.`;
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.2
      })
    });
    
    if (!response.ok) throw new Error("AI parser failed");
    const json = await response.json();
    const content = json.choices[0].message.content.trim();
    
    // Clean JSON markdown code blocks if present
    const cleanJson = content.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      category: parsed.category || 'lifestyle',
      carbonSaved: Number(parsed.carbonSaved) || 2.0,
      icon: parsed.icon || '🌿',
      detail: parsed.detail || 'took a proactive green step.'
    };
  } catch (e) {
    console.error("AI green win parsing failed, falling back to static rules", e);
    return parseGreenWin(text);
  }
};
