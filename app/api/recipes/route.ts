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

    const prompt = `You are a professional chef. Using the following ingredients, recommend 2 recipes for each of the 5 cuisine categories (total 10 recipes).

Available ingredients: ${ingredients.join(', ')}

Return ONLY a JSON object with this exact structure (use these exact English keys):
{
  "recipes": {
    "korean": [
      {
        "name": "recipe name in Korean",
        "description": "brief description in Korean",
        "usedIngredients": ["ingredient1", "ingredient2"],
        "additionalIngredients": ["extra ingredient1"],
        "cookingTime": "30분",
        "difficulty": "쉬움",
        "steps": ["step 1 in Korean", "step 2 in Korean", "step 3 in Korean"]
      },
      { same structure for second recipe }
    ],
    "chinese": [ 2 recipes with same structure ],
    "mediterranean": [ 2 recipes with same structure ],
    "japanese": [ 2 recipes with same structure ],
    "western": [ 2 recipes with same structure ]
  }
}

All recipe names, descriptions, ingredients, and steps must be in Korean. difficulty must be one of: 쉬움, 보통, 어려움.`;

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
