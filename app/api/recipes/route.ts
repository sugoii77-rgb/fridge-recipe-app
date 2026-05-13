import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CUISINES = [
  { id: "korean", name: "한식", emoji: "🇰🇷" },
  { id: "chinese", name: "중식", emoji: "🇨🇳" },
  { id: "mediterranean", name: "지중해식", emoji: "🫒" },
  { id: "japanese", name: "일식", emoji: "🇯🇵" },
  { id: "western", name: "양식", emoji: "🍝" },
];

export async function POST(req: NextRequest) {
  try {
    const { ingredients } = await req.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: "재료를 입력해주세요." },
        { status: 400 }
      );
    }

    const ingredientList = ingredients.join(", ");

    const prompt = `당신은 세계 각국 요리의 전문 셰프입니다. 냉장고에 있는 재료로 만들 수 있는 레시피를 추천해주세요.

냉장고에 있는 재료: ${ingredientList}

다음 5가지 요리 카테고리 각각에 대해 2개씩 레시피를 추천해주세요:
1. 한식 (Korean)
2. 중식 (Chinese)
3. 지중해식 (Mediterranean)
4. 일식 (Japanese)
5. 양식 (Western)

반드시 아래의 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:

{
  "recipes": {
    "korean": [
      {
        "name": "요리 이름",
        "description": "요리에 대한 간단한 설명 (2-3문장)",
        "usedIngredients": ["사용되는 재료1", "재료2"],
        "additionalIngredients": ["추가로 필요한 재료1", "재료2"],
        "cookingTime": "조리 시간 (예: 30분)",
        "difficulty": "난이도 (쉬움/보통/어려움)",
        "steps": ["1단계 설명", "2단계 설명", "3단계 설명", "4단계 설명", "5단계 설명"]
      }
    ],
    "chinese": [...],
    "mediterranean": [...],
    "japanese": [...],
    "western": [...]
  }
}

중요: 반드시 모든 5개 카테고리에 각 2개씩 레시피를 포함해야 합니다. 재료를 최대한 활용하고, 부족한 재료는 additionalIngredients에 표시해주세요.`;

    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonText = content.text.trim();
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Recipe API error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "레시피 생성 중 오류가 발생했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export { CUISINES };
