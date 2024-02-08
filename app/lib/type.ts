import type {Storefront as HydrogenStorefront} from '@shopify/hydrogen';
import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
} from '@shopify/hydrogen/storefront-api-types';

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type Locale = {
  language: LanguageCode;
  country: CountryCode;
  label: string;
  currency: CurrencyCode;
};

export type Localizations = Record<string, Locale>;

export type I18nLocale = Locale & {
  pathPrefix: string;
};

export type Storefront = HydrogenStorefront<I18nLocale>;

export type RichTextNode = {
  type:
    | 'root'
    | 'paragraph'
    | 'text'
    | 'bold'
    | 'italic'
    | 'link'
    | 'list'
    | 'list-item'
    | 'heading';
  value?: string;
  children?: RichTextNode[];
  italic?: boolean; // For italic text
  bold?: boolean; // For bold text
  url?: string; // For links
  title?: string; // For link titles
  listType?: 'ordered' | 'unordered'; // For lists
  level?: number; // For headings, to specify the heading level (e.g., 1 for <h1>, 2 for <h2>, etc.)
};
