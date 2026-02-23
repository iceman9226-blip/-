import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, PEM_METRICS } from '../constants';
import { AnalysisResult, Dimension, PriorityLevel, IssueSeverity, IssueFrequency, FixCost } from '../types';

const getPriorityLevel = (score: number): PriorityLevel => {
  if (score >= 10) return PriorityLevel.URGENT;
  if (score >= 6) return PriorityLevel.HIGH;
  if (score >= 3) return PriorityLevel.MEDIUM;
  return PriorityLevel.LOW;
};

const getRatingLevel = (score: number) => {
  if (score >= 8.5) return '卓越';
  if (score >= 7) return '优秀';
  if (score >= 5) return '一般';
  return '较差';
};

export const analyzeImage = async (base64Image: string, mimeType: string, sourceUrl?: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType || 'image/jpeg', data: base64Image } },
          { text: SYSTEM_PROMPT }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Sanitize JSON (remove markdown code blocks if present)
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    let rawData;
    
    try {
        rawData = JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error. Raw Text:", text);
        throw new Error("Failed to parse AI response.");
    }

    // Transform raw JSON to strictly typed AnalysisResult
    const metrics = rawData.metrics.map((m: any) => {
      const ref = PEM_METRICS.find(p => p.id === m.id);
      return {
        ...m,
        question: ref?.text || "未知指标",
        dimension: ref?.dimension || Dimension.OPERABILITY,
      };
    });

    // Calculate Averages
    const dimScores: Record<string, number[]> = {
      [Dimension.OPERABILITY]: [],
      [Dimension.LEARNABILITY]: [],
      [Dimension.CLARITY]: [],
    };

    metrics.forEach((m: any) => {
      if (dimScores[m.dimension]) {
        dimScores[m.dimension].push(m.score);
      }
    });

    const dimensions = {
      [Dimension.OPERABILITY]: average(dimScores[Dimension.OPERABILITY]),
      [Dimension.LEARNABILITY]: average(dimScores[Dimension.LEARNABILITY]),
      [Dimension.CLARITY]: average(dimScores[Dimension.CLARITY]),
    };

    // Overall Score (Simple average of metrics for Expert Review)
    // The PDF suggests 0.4 weight for experts, but since this is 100% expert (AI), we normalize to 10.
    const overallScore = Number((metrics.reduce((acc: number, cur: any) => acc + cur.score, 0) / metrics.length).toFixed(1));

    // Process Issues
    const issues = rawData.issues.map((issue: any, index: number) => {
      const priorityScore = issue.severity * issue.frequency * issue.fixCost;
      return {
        id: `issue-${index}`,
        ...issue,
        priorityScore,
        priorityLevel: getPriorityLevel(priorityScore)
      };
    });

    return {
      title: rawData.title || "界面分析报告",
      overallScore,
      ratingLevel: getRatingLevel(overallScore),
      dimensions,
      metrics,
      issues,
      summary: rawData.summary,
      recommendations: rawData.recommendations,
      sourceUrl
    };

  } catch (error: any) {
    console.error("Analysis Failed:", error);
    
    // Detailed error handling for better user feedback
    const msg = error.message || "";
    const strError = JSON.stringify(error);

    // Check for Region/403 errors
    if (msg.includes("Region not supported") || strError.includes("Region not supported")) {
        throw new Error("当前地区不支持访问 Gemini API (403)。请开启 VPN (推荐美国/新加坡节点) 后重试。");
    }

    if (msg.includes("403") || (error.status === 403)) {
         throw new Error("访问被拒绝 (403)。可能是 API Key 无效或当前地区受限。");
    }
    
    if (msg.includes("503")) {
        throw new Error("服务暂时不可用 (503)。请稍后重试。");
    }

    // Default error
    throw new Error("分析失败，请检查网络连接或稍后重试。");
  }
};

const average = (arr: number[]) => {
  if (arr.length === 0) return 0;
  return Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
};