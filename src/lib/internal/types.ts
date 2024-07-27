import type { HTMLAttributes } from 'svelte/elements';
import type { TransitionConfig } from 'svelte/transition';
import type { ReadableBox, WritableBox } from 'svelte-toolbelt';

export type Expand<T> = T extends object
	? T extends infer O
		? { [K in keyof O]: O[K] }
		: never
	: T;

export type Box<T> = ReadableBox<T> | WritableBox<T>;

export type WritableBoxedValues<T> = {
	[K in keyof T]: WritableBox<T[K]>;
};

export type ReadableBoxedValues<T> = {
	[K in keyof T]: ReadableBox<T[K]>;
};

export type ValueOf<T> = T[keyof T];

export type HTMLDivAttributes = HTMLAttributes<HTMLDivElement>;

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type RenameProperties<T, NewNames extends Partial<Record<keyof T, string>>> = Expand<{
	[K in keyof T as K extends keyof NewNames
		? NewNames[K] extends PropertyKey
			? NewNames[K]
			: K
		: K]: T[K];
}>;

export type PrefixKeys<T, Prefix extends string> = Expand<{
	[K in keyof T as `${Prefix}${Capitalize<string & K>}`]: T[K];
}>;

// eslint-disable-next-line ts/no-explicit-any
export type Transition = (node: Element, params?: any) => TransitionConfig;

export type Arrayable<T> = T | T[];

// eslint-disable-next-line ts/no-empty-object-type
export type WithRefProps<T = {}> = T &
	ReadableBoxedValues<{ id: string }> &
	WritableBoxedValues<{ ref: HTMLElement | null }>;

/**
 * Constructs a new type by omitting properties from type
 * 'T' that exist in type 'U'.
 *
 * @template T - The base object type from which properties will be omitted.
 * @template U - The object type whose properties will be omitted from 'T'.
 * @example
 * type Result = Without<{ a: number; b: string; }, { b: string; }>;
 * // Result type will be { a: number; }
 */
export type Without<T extends object, U extends object> = Omit<T, keyof U>;
