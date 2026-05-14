import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: '재료를 입력해주세요.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `당신은 전문 요리사입니다. 다음 재료들을 사용하여 한식, 중식, 지중해식, 일식, 양식 각 카테고리에서 2개씩 총 10개의 레시피를 추천해주세요.

사용 가능한 재료: ${ingredients.join(', ')}

아래 JSON 스키마를 정확히 따르세요:
{
  "recipes": {
    "한식": [
      {"name": "string", "description": "string", "usedIngredients": ["string"], "additionalIngredients": ["string"], "cookingTime": "string", "difficulty": "string", "steps": ["string"]}
    ],
    "중식": [같은 구조로 2개],
    "지중해식": [같은 구조로 2개],
    "일식": [같은 구조로 2개],
    "양식": [같은 구조로 2개]
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Recipe API error:', error);
    return NextResponse.json(
      { error: '레시피를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
