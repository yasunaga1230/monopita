export const SITE_TITLE = 'モノピタ';
export const SITE_DESCRIPTION = 'あなたの暮らしに、ぴったりのモノを。暮らしの便利グッズ＆ガジェット情報サイト';
export const SITE_LANG = 'ja';
export const AMAZON_ASSOCIATE_TAG = 'monopita22-22';

export const CATEGORIES = {
  desk: 'デスク周り・PC周辺',
  kitchen: 'キッチン便利グッズ',
  cleaning: '掃除・収納',
  smartphone: 'スマホ・モバイル',
  seasonal: '季節アイテム',
  other: 'その他暮らし',
} as const;

export type CategorySlug = keyof typeof CATEGORIES;
