import type { Token as PrismToken, Grammar } from 'prismjs';

export type Language = string;
export type PrismGrammar = Grammar;

export type Themes = 'linear' | 'raycast' | 'vercel' | 'framer';

export type Token = {
	types: string[];
	content: string;
	empty?: boolean;
};

export type EnvConfig = {
	code: string;
	grammar: PrismGrammar;
	language: Language;
	tokens: (string | PrismToken)[];
};
