import { GoogleGenAI, Type } from "@google/genai";
import { SingleProductAnalysis, ComparisonAnalysis } from '../types';

// Assume process.env.API_KEY is available in the execution environment
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const technologySchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
        },
        required: ['name', 'description'],
    },
};

const singleProductSchema = {
    type: Type.OBJECT,
    properties: {
        parameters: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ['name', 'value', 'description'],
            },
        },
        summary: { type: Type.STRING },
        technologies: technologySchema,
    },
    required: ['parameters', 'summary', 'technologies'],
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        parameters: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    values: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                productName: { type: Type.STRING },
                                value: { type: Type.STRING },
                                isBest: { type: Type.BOOLEAN },
                            },
                            required: ['productName', 'value', 'isBest'],
                        },
                    },
                },
                required: ['name', 'values'],
            },
        },
        summary: { type: Type.STRING },
        technologies: technologySchema,
    },
    required: ['parameters', 'summary', 'technologies'],
};


export const analyzeSingleProduct = async (productName: string): Promise<SingleProductAnalysis> => {
    const ai = getAI();
    const prompt = `Проведи исчерпывающий анализ продукта "${productName}" на русском языке. КРИТИЧЕСКИ ВАЖНО: при определении параметра "Страна производителя", будь предельно точным и ОБЯЗАТЕЛЬНО учитывай указанную модель продукта (например, "iPhone 15 Pro Max", а не просто "iPhone"), так как места производства могут отличаться. Результат верни СТРОГО в формате JSON по указанной схеме. В массив 'parameters' ОБЯЗАТЕЛЬНО включи параметр с 'name': 'Технологии', где 'value' будет содержать список ключевых технологий через запятую (например: "Технология 1, Технология 2"). Отдельный массив 'technologies' в корне JSON также ДОЛЖЕН БЫТЬ заполнен подробными описаниями для каждой упомянутой технологии. Поле 'technologies' не должно быть пустым.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 24576 },
                responseMimeType: "application/json",
                responseSchema: singleProductSchema,
            }
        });
        return JSON.parse(response.text) as SingleProductAnalysis;
    } catch (error) {
        console.error("Error analyzing single product:", error);
        throw new Error("Не удалось проанализировать продукт. Пожалуйста, попробуйте еще раз.");
    }
};

export const compareProducts = async (productNames: string[]): Promise<ComparisonAnalysis> => {
    const ai = getAI();
    const prompt = `Пожалуйста, предоставь всеобъемлющее сравнение следующих продуктов: ${productNames.join(', ')} на русском языке. КРИТИЧЕСКИ ВАЖНО: при определении "Страны производителя" для каждого товара, будь предельно точным и ОБЯЗАТЕЛЬНО учитывай конкретную модель продукта, если она указана. Верни результат СТРОГО в формате JSON по указанной схеме. В массив 'parameters' ОБЯЗАТЕЛЬНО включи параметр с 'name': 'Технологии'. Для этого параметра, в массиве 'values', поле 'value' для каждого продукта должно содержать список его ключевых технологий через запятую. Отдельный массив 'technologies' в корне JSON также ДОЛЖЕН БЫТЬ заполнен подробными описаниями для каждой технологии, упомянутой в сравнении. Поле 'technologies' не должно быть пустым. Для каждого другого параметра, в массиве 'values' укажи значение для каждого продукта и установи 'isBest' в 'true' для лучшего значения.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 24576 },
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });
        const result = JSON.parse(response.text) as Omit<ComparisonAnalysis, 'productNames'>;
        return { ...result, productNames: productNames };
    } catch (error) {
        console.error("Error comparing products:", error);
        throw new Error("Не удалось сравнить продукты. Пожалуйста, попробуйте еще раз.");
    }
};

export const chat = async (prompt: string, useSearch: boolean) => {
    const ai = getAI();
    const fullPrompt = `${prompt}. Отвечай на русском языке.`;
    try {
        const model = useSearch ? 'gemini-2.5-flash' : 'gemini-flash-lite-latest';
        const config = useSearch ? { tools: [{googleSearch: {}}] } : {};

        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: config,
        });

        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = groundingChunks ? groundingChunks.map((chunk: any) => chunk.web).filter(Boolean) : [];
        
        return { text, sources };

    } catch (error) {
        console.error("Error during chat:", error);
        return { text: "Извините, произошла ошибка. Пожалуйста, попробуйте снова.", sources: [] };
    }
};

export const analyzeFileContent = async (content: string, fileName: string): Promise<string> => {
    const ai = getAI();
    try {
        const prompt = `Проанализируй следующее содержимое из файла "${fileName}" и ответь на русском языке:\n\n---\n\n${content}\n\n---\n\nПожалуйста, предоставь краткое содержание и выдели ключевые идеи.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing file content:", error);
        return "Извините, не удалось проанализировать содержимое файла.";
    }
}