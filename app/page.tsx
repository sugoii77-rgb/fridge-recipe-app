"use client";

import { useState, useRef } from "react";

const CUISINES = [
  { id: "korean", name: "한식", emoji: "🇰🇷" },
  { id: "chinese", name: "중식", emoji: "🇨🇳" },
  { id: "mediterranean", name: "지중해식", emoji: "🫒" },
  { id: "japanese", name: "일식", emoji: "🇯🇵" },
  { id: "western", name: "양식", emoji: "🍝" },
];

const QUICK_INGREDIENTS = [
  "달걀", "두부", "파", "마늘", "간장", "참기름",
  "돼지고기", "양파", "당근", "버섯", "감자", "닭고기",
];

interface Recipe {
  name: string;
  description: string;
  usedIngredients: string[];
  additionalIngredients: string[];
  cookingTime: string;
  difficulty: string;
  steps: string[];
}

interface RecipesData {
  recipes: {
    korean: Recipe[];
    chinese: Recipe[];
    mediterranean: Recipe[];
    japanese: Recipe[];
    western: Recipe[];
  };
}

const difficultyColor = (d: string) => {
  if (d === "쉬움") return "bg-green-100 text-green-700";
  if (d === "어려움") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [activeCuisine, setActiveCuisine] = useState("korean");
  const [loading, setLoading] = useState(false);
  const [recipesData, setRecipesData] = useState<RecipesData | null>(null);
  const [error, setError] = useState("");
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addIngredient = (value: string) => {
    const trimmed = value.trim().replace(/,$/, "").trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) addIngredient(inputValue);
    } else if (e.key === "Backspace" && !inputValue && ingredients.length > 0) {
      setIngredients((prev) => prev.slice(0, -1));
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients((prev) => prev.filter((i) => i !== ing));
  };

  const handleGetRecipes = async () => {
    const extra = inputValue.trim() ? [inputValue.trim()] : [];
    const finalIngredients = [
      ...ingredients,
      ...extra.filter((i) => !ingredients.includes(i)),
    ];
    if (inputValue.trim()) addIngredient(inputValue);

    if (finalIngredients.length === 0) {
      setError("재료를 최소 1개 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipesData(null);
    setExpandedRecipe(null);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: finalIngredients }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "오류가 발생했습니다.");
      setRecipesData(data);
      setActiveCuisine("korean");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const currentRecipes = recipesData
    ? recipesData.recipes[activeCuisine as keyof typeof recipesData.recipes] ?? []
    : [];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      {/* Header */}
      <header
        className="text-white py-10 px-4 text-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-3xl font-bold mb-2">냉장고 셰프</h1>
          <p className="text-purple-100 text-base">
            냉장고 재료로 세계 각국의 요리를 만들어보세요
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>🥕</span> 냉장고에 있는 재료를 입력하세요
          </h2>

          {/* Tag input */}
          <div
            className="flex flex-wrap gap-2 p-3 border-2 border-purple-200 rounded-xl min-h-[56px] cursor-text focus-within:border-purple-500 transition-colors mb-4 bg-purple-50"
            onClick={() => inputRef.current?.focus()}
          >
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                {ing}
                <button
                  onClick={(e) => { e.stopPropagation(); removeIngredient(ing); }}
                  className="ml-1 hover:opacity-70 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                ingredients.length === 0
                  ? "예: 달걀, 두부, 파, 간장... (Enter 또는 쉼표로 추가)"
                  : "재료 추가..."
              }
              className="flex-1 min-w-[180px] outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm"
            />
          </div>

          {/* Quick Add */}
          <div className="mb-5">
            <p className="text-xs text-gray-500 mb-2">빠른 추가:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_INGREDIENTS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    if (!ingredients.includes(s))
                      setIngredients((p) => [...p, s]);
                  }}
                  disabled={ingredients.includes(s)}
                  className="px-3 py-1 text-xs rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGetRecipes}
            disabled={loading || (ingredients.length === 0 && !inputValue.trim())}
            className="w-full py-3 px-6 rounded-xl text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-md"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="loading-spinner w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI가 레시피를 생성하는 중...
              </span>
            ) : (
              "✨ 레시피 추천받기"
            )}
          </button>
        </div>

        {/* Results */}
        {recipesData && (
          <div className="fade-in">
            {/* Cuisine Tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
              {CUISINES.map((cuisine) => {
                const isActive = activeCuisine === cuisine.id;
                return (
                  <button
                    key={cuisine.id}
                    onClick={() => {
                      setActiveCuisine(cuisine.id);
                      setExpandedRecipe(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                      isActive
                        ? "text-white shadow-lg scale-105"
                        : "bg-white text-gray-600 hover:bg-gray-50 shadow"
                    }`}
                    style={
                      isActive
                        ? { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }
                        : {}
                    }
                  >
                    <span className="text-xl">{cuisine.emoji}</span>
                    <span>{cuisine.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Recipe Cards */}
            <div className="space-y-4">
              {currentRecipes.map((recipe, idx) => {
                const key = `${activeCuisine}-${idx}`;
                const isExpanded = expandedRecipe === key;
                return (
                  <div
                    key={key}
                    className="bg-white rounded-2xl shadow-md overflow-hidden recipe-card"
                  >
                    <div
                      className="p-5 cursor-pointer"
                      onClick={() =>
                        setExpandedRecipe(isExpanded ? null : key)
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              레시피 {idx + 1}
                            </span>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor(recipe.difficulty)}`}
                            >
                              {recipe.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">
                              ⏱ {recipe.cookingTime}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {recipe.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {recipe.description}
                          </p>
                        </div>
                        <div className="text-gray-400 text-xl flex-shrink-0 mt-1">
                          {isExpanded ? "▲" : "▼"}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {recipe.usedIngredients.slice(0, 5).map((ing) => (
                          <span
                            key={ing}
                            className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium"
                          >
                            ✓ {ing}
                          </span>
                        ))}
                        {recipe.additionalIngredients.slice(0, 3).map((ing) => (
                          <span
                            key={ing}
                            className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600"
                          >
                            + {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-100 px-5 pb-5 fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-5">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                              사용 가능한 재료
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {recipe.usedIngredients.map((ing) => (
                                <span
                                  key={ing}
                                  className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium"
                                >
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                          {recipe.additionalIngredients.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                                추가 필요한 재료
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {recipe.additionalIngredients.map((ing) => (
                                  <span
                                    key={ing}
                                    className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-600"
                                  >
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            📝 조리 순서
                          </h4>
                          <div className="space-y-3">
                            {recipe.steps.map((step, stepIdx) => (
                              <div key={stepIdx} className="flex gap-3 items-start">
                                <span
                                  className="flex-shrink-0 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  }}
                                >
                                  {stepIdx + 1}
                                </span>
                                <p className="text-sm text-gray-600 pt-1 leading-relaxed">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleGetRecipes}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90 shadow-md disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                🔄 다시 추천받기
              </button>
            </div>
          </div>
        )}

        {!recipesData && !loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">🧑‍🍳</div>
            <p className="text-lg font-medium text-gray-500">
              재료를 입력하고 레시피를 추천받아보세요!
            </p>
            <p className="text-sm mt-1">
              한식, 중식, 지중해식, 일식, 양식 중에서 골라드릴게요
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>🤖 Powered by Claude AI · 냉장고 셰프</p>
      </footer>
    </div>
  );
}