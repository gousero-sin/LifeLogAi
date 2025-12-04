// LifeLog IA - DeepSeek Integration

import type { Entry, AIInsight } from '../types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekConfig {
  apiKey: string;
  depth: 'shallow' | 'medium' | 'deep';
}

interface ContextData {
  recentEntries: Entry[];
  avgMood: number;
  avgSleep: number;
  avgEnergy: number;
  frequentTags: string[];
}

function buildSystemPrompt(depth: string): string {
  const basePrompt = `Você é o LifeLog IA, um assistente pessoal inteligente e empático que ajuda pessoas a entenderem melhor suas vidas através de análise de diário.

Seu papel é:
- Ser acolhedor e não-julgador
- Oferecer insights personalizados baseados nos dados reais do usuário
- Transformar observações em ações práticas e executáveis
- Respeitar a privacidade e vulnerabilidade do usuário
- Comunicar-se em português brasileiro de forma natural

IMPORTANTE: Sempre responda em formato JSON válido.`;

  const depthInstructions: Record<string, string> = {
    shallow: `
Modo: RESUMIDO
- Forneça resumos curtos (2-3 frases)
- Sugira 1-2 ações simples
- Seja direto e objetivo`,
    medium: `
Modo: EQUILIBRADO
- Forneça análises moderadas (4-6 frases)
- Identifique 2-3 padrões relevantes
- Sugira 2-3 ações práticas
- Inclua observações emocionais quando relevante`,
    deep: `
Modo: PROFUNDO
- Forneça análises detalhadas e reflexivas
- Explore conexões entre diferentes aspectos da vida
- Faça perguntas que estimulem autoconhecimento
- Sugira múltiplas ações com diferentes níveis de esforço
- Inclua observações sobre padrões de longo prazo`
  };

  return basePrompt + (depthInstructions[depth] || depthInstructions.medium);
}

export async function generateDailyInsights(
  config: DeepSeekConfig,
  entry: Entry,
  context: ContextData
): Promise<{ summary: string; insights: string[]; tomorrowPlan: string[]; emotions: string[] }> {
  const systemPrompt = buildSystemPrompt(config.depth);

  const userPrompt = `Analise esta entrada de diário e gere insights personalizados.

ENTRADA DE HOJE (${entry.entry_date}):
- Conteúdo: ${entry.content || 'Não informado'}
- Humor: ${entry.mood ?? 'Não informado'}/10
- Energia: ${entry.energy ?? 'Não informado'}/10
- Sono: ${entry.sleep_hours ?? 'Não informado'}h (qualidade: ${entry.sleep_quality ?? 'Não informado'}/10)
- Estresse: ${entry.stress ?? 'Não informado'}/10
- Foco: ${entry.focus ?? 'Não informado'}/10
- Momento marcante: ${entry.highlight || 'Não informado'}

CONTEXTO DOS ÚLTIMOS DIAS:
- Humor médio: ${context.avgMood.toFixed(1)}/10
- Sono médio: ${context.avgSleep.toFixed(1)}h
- Energia média: ${context.avgEnergy.toFixed(1)}/10
- Tags frequentes: ${context.frequentTags.join(', ') || 'Nenhuma'}

Responda APENAS com JSON válido neste formato:
{
  "summary": "Resumo do dia em 2-5 frases",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "tomorrowPlan": ["tarefa 1", "tarefa 2", "autocuidado"],
  "emotions": ["emoção1", "emoção2"]
}`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from DeepSeek');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from DeepSeek');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('DeepSeek error:', error);
    // Return fallback response
    return {
      summary: 'Não foi possível gerar o resumo no momento. Verifique sua API key nas configurações.',
      insights: ['Configure sua API key da DeepSeek para receber insights personalizados.'],
      tomorrowPlan: ['Descanse bem', 'Hidrate-se', 'Reserve um momento para você'],
      emotions: []
    };
  }
}

export async function generateWeeklySummary(
  config: DeepSeekConfig,
  entries: Entry[],
  context: ContextData
): Promise<{ title: string; narrative: string; highlights: string[]; lowlights: string[]; suggestions: string[] }> {
  const systemPrompt = buildSystemPrompt(config.depth);

  const entriesSummary = entries.map(e => 
    `${e.entry_date}: Humor ${e.mood ?? '?'}/10, Energia ${e.energy ?? '?'}/10, Sono ${e.sleep_hours ?? '?'}h`
  ).join('\n');

  const userPrompt = `Gere um resumo semanal baseado nestas entradas:

ENTRADAS DA SEMANA:
${entriesSummary}

MÉDIAS:
- Humor: ${context.avgMood.toFixed(1)}/10
- Sono: ${context.avgSleep.toFixed(1)}h
- Energia: ${context.avgEnergy.toFixed(1)}/10

Responda APENAS com JSON válido neste formato:
{
  "title": "Título criativo para a semana",
  "narrative": "Narrativa resumida da semana em 3-5 frases",
  "highlights": ["ponto alto 1", "ponto alto 2"],
  "lowlights": ["ponto de atenção 1"],
  "suggestions": ["sugestão para próxima semana 1", "sugestão 2"]
}`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;

    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('DeepSeek weekly error:', error);
    return {
      title: 'Semana em Análise',
      narrative: 'Configure sua API key da DeepSeek para receber análises semanais detalhadas.',
      highlights: [],
      lowlights: [],
      suggestions: ['Configure a integração com IA nas configurações']
    };
  }
}

export async function semanticSearch(
  config: DeepSeekConfig,
  query: string,
  entries: Entry[]
): Promise<{ results: { entry_id: number; relevance: string }[]; summary: string }> {
  const systemPrompt = `Você é um assistente de busca inteligente para um diário pessoal. 
Analise as entradas e encontre as mais relevantes para a pergunta do usuário.
Responda SEMPRE em JSON válido.`;

  const entriesData = entries.map(e => ({
    id: e.id,
    date: e.entry_date,
    content: e.content?.substring(0, 200),
    mood: e.mood,
    highlight: e.highlight
  }));

  const userPrompt = `Pergunta do usuário: "${query}"

Entradas disponíveis:
${JSON.stringify(entriesData, null, 2)}

Responda com JSON:
{
  "results": [{"entry_id": 1, "relevance": "Por que esta entrada é relevante"}],
  "summary": "Resumo do que foi encontrado"
}`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;

    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('DeepSeek search error:', error);
    return {
      results: [],
      summary: 'Configure sua API key para usar a busca inteligente.'
    };
  }
}
