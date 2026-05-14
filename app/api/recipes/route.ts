import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: '재료를 입력해주세요.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `당신은 전문 요리사입니다. 다음 재료들을 사용하여 5가지 카테고리에서 각 2개씩 총 10개의 레시피를 추천해주세요.

사용 가능한 재료: ${ingredients.join(', ')}

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록을 사용하지 마세요. JSON 외 다른 텍스트는 절대 포함하지 마세요.

{"recipes":{"한식":[{"name":"레시피명","description":"설명","usedIngredients":["재료"],"additionalIngredients":["재료"],"cookingTime":"30분","difficulty":"쉬움","steps":["1단계","2단계"]},{"name":"레시피명2","description":"설명","usedIngredients":[],"additionalIngredients":[],"cookingTime":"20분","difficulty":"보통","steps":["1단계"]}],"중식":[{"name":"","description":"","usedIngredients":[],"additionalIngredients":[],"cookingTime":"","difficulty":"","steps":[]},{"name":"","description":"","usedIngredients":[],"additionalIngredients":[],"cookingTime":"","difficulty":"","steps":[]}],"지중해식":[{"name":"","description":"","usedIngredients":[],"additionalIngredients":[],"cookingTime":"","difficulty":"","steps":[]},{"name":"","description":"","usedIngredients":[],"additionalIngredients":[],"cookingTime":"","difficulty":"","steps":[]}],"일식":[{"name":"","description":"","usedIngredients":[],"additionalIngredients":[],"cookingTime":"","difficulty":"","steps":[]},{"name":"","description":"","usedIngredients":[],"additionalIngredients":[],"cookingTime":"","difficulty":"","steps":[]}],"양식":[{"name":"","description":"","usedIngredients":[],"additionalIngredients":[],"cookingTime":"","difficulty":"","steps":[]},{"name":"","description":"","usedIngredients":[],"additionalIngredients":[],"cookingTime":"","difficulty":"","steps":[]}]}}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Recipe API error:', error);
    return NextResponse.json(
      { error: '레시피를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}