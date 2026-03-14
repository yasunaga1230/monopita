import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const CATEGORIES = [
  { slug: 'desk', name: 'デスク周り・PC周辺', themes: ['モニターアーム', 'キーボード', 'マウス', 'デスクマット', 'USBハブ', 'ケーブル整理', 'PCスタンド', 'Webカメラ', 'ヘッドセット', 'デスクライト'] },
  { slug: 'kitchen', name: 'キッチン便利グッズ', themes: ['電気ケトル', '保存容器', 'まな板', '調理器具', '水筒', '弁当箱', 'コーヒーグッズ', 'キッチンタオル', '食器', 'スパイスラック'] },
  { slug: 'cleaning', name: '掃除・収納', themes: ['ロボット掃除機', '収納ボックス', 'ハンディクリーナー', 'ゴミ箱', 'ランドリーグッズ', '靴収納', 'クローゼット整理', '掃除シート', 'カビ対策', '消臭グッズ'] },
  { slug: 'smartphone', name: 'スマホ・モバイル', themes: ['モバイルバッテリー', 'スマホケース', 'ワイヤレスイヤホン', '充電器', 'スマホスタンド', 'タブレットケース', 'USB-Cケーブル', 'カーマウント', 'スマホリング', '画面保護フィルム'] },
  { slug: 'seasonal', name: '季節アイテム', themes: ['扇風機', 'ヒーター', '加湿器', '除湿機', 'UV対策', '冷感グッズ', '防寒グッズ', '花粉対策', '虫除け', 'アウトドアグッズ'] },
  { slug: 'other', name: 'その他暮らし', themes: ['目覚まし時計', 'エコバッグ', 'ポーチ', 'アイマスク', 'クッション', 'スリッパ', '防災グッズ', '文房具', 'LEDライト', 'ブックスタンド'] },
];

const SEASONAL_HINTS: Record<number, string> = {
  1: '新年・冬の防寒・乾燥対策',
  2: '花粉対策・バレンタイン・確定申告グッズ',
  3: '新生活準備・春の掃除・引っ越し',
  4: '新生活スタート・GW準備・UV対策',
  5: 'GW・母の日・梅雨対策準備',
  6: '梅雨対策・除湿・父の日',
  7: '夏本番・冷感グッズ・夏休み準備',
  8: '暑さ対策・お盆・夏の掃除',
  9: '秋の模様替え・防災の日・読書',
  10: 'ハロウィン・秋の夜長・暖房準備',
  11: 'ブラックフライデー・冬支度・クリスマス準備',
  12: 'クリスマス・年末大掃除・冬の防寒',
};

function getExistingPosts(): string[] {
  const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
  if (!fs.existsSync(postsDir)) return [];
  return fs.readdirSync(postsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
}

function getCategoryBalance(existingPosts: string[]): string {
  const counts: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    counts[cat.slug] = 0;
  }

  for (const file of existingPosts) {
    const content = fs.readFileSync(path.join(process.cwd(), 'src', 'content', 'posts', file), 'utf-8');
    const match = content.match(/category:\s*"?(\w+)"?/);
    if (match && counts[match[1]] !== undefined) {
      counts[match[1]]++;
    }
  }

  const minCount = Math.min(...Object.values(counts));
  const underrepresented = Object.entries(counts)
    .filter(([, count]) => count === minCount)
    .map(([slug]) => slug);

  return underrepresented[Math.floor(Math.random() * underrepresented.length)];
}

function getExistingTitles(existingPosts: string[]): string[] {
  const titles: string[] = [];
  for (const file of existingPosts) {
    const content = fs.readFileSync(path.join(process.cwd(), 'src', 'content', 'posts', file), 'utf-8');
    const match = content.match(/title:\s*"([^"]+)"/);
    if (match) titles.push(match[1]);
  }
  return titles;
}

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function generateSlug(title: string): string {
  const words = title
    .replace(/[【】「」『』（）\(\)！!？?・、。]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join('-')
    .toLowerCase();

  const sanitized = words.replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return sanitized || 'article';
}

async function main() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const month = today.getMonth() + 1;
  const seasonalHint = SEASONAL_HINTS[month] || '';

  const existingPosts = getExistingPosts();
  const targetCategorySlug = getCategoryBalance(existingPosts);
  const targetCategory = CATEGORIES.find(c => c.slug === targetCategorySlug)!;
  const randomTheme = targetCategory.themes[Math.floor(Math.random() * targetCategory.themes.length)];
  const existingTitles = getExistingTitles(existingPosts);

  console.log(`Target category: ${targetCategory.name} (${targetCategorySlug})`);
  console.log(`Random theme hint: ${randomTheme}`);
  console.log(`Seasonal hint: ${seasonalHint}`);

  const prompt = `あなたは「モノピタ」という暮らしの便利グッズ＆ガジェット情報サイトのライターです。

以下の条件で記事を1本作成してください。

【カテゴリ】${targetCategory.name}
【テーマのヒント】${randomTheme}に関連する具体的な商品を紹介する記事
【季節】${month}月（${seasonalHint}）
【既存記事のタイトル（重複を避ける）】
${existingTitles.slice(-10).map(t => `- ${t}`).join('\n')}

【記事の形式】以下のフォーマットで出力してください。フォーマット以外のテキストは一切出力しないでください。

---
title: "SEOを意識した32文字以内のタイトル"
description: "120文字以内のメタディスクリプション"
category: "${targetCategorySlug}"
tags: ["タグ1", "タグ2", "タグ3"]
pubDate: "${dateStr}"
products:
  - name: "実在するAmazon商品名1"
    asin: "実在するASIN"
    price: "実勢価格"
    description: "商品の一言説明"
    rating: 4.5
  - name: "実在するAmazon商品名2"
    asin: "実在するASIN"
    price: "実勢価格"
    description: "商品の一言説明"
    rating: 4.3
  - name: "実在するAmazon商品名3"
    asin: "実在するASIN"
    price: "実勢価格"
    description: "商品の一言説明"
    rating: 4.1
---

本文をここに書く（1500〜3000文字）

【記事のルール】
- PREP法（結論→理由→具体例→結論）で構成
- H2見出しを3〜5個、H3見出しも適宜使用
- 「実際に使ってみた」風の体験ベースの記述
- メリット・デメリットを公平に紹介
- 押し売り感を排除し、読者に有益な情報を提供
- 商品は実在するAmazon.co.jpの商品を紹介（ASINは実在のものを使用）
- 本文中で商品名に言及する際は自然な文脈で
- 最後に「まとめ」セクションを必ず入れる`;

  console.log('Calling Gemini API...');
  const articleContent = await callGemini(prompt);

  if (!articleContent.includes('---')) {
    console.error('Generated content does not contain valid frontmatter');
    console.error('Content:', articleContent.substring(0, 500));
    process.exit(1);
  }

  const titleMatch = articleContent.match(/title:\s*"([^"]+)"/);
  const title = titleMatch ? titleMatch[1] : 'article';
  const slug = generateSlug(title);
  const filename = `${dateStr}-${slug}.md`;
  const filePath = path.join(process.cwd(), 'src', 'content', 'posts', filename);

  const cleanedContent = articleContent.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();

  fs.writeFileSync(filePath, cleanedContent, 'utf-8');
  console.log(`Article saved: ${filePath}`);
  console.log(`Title: ${title}`);
  console.log(`Slug: ${slug}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
