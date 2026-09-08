import type { BlockStdScope } from '@labre/std';

export type Template = {
  /**
   * name of the sticker
   *
   * if not provided, it cannot be searched
   */
  name?: string;

  /**
   * template content
   */
  content: unknown;

  /**
   * external assets
   */
  assets?: Record<string, string>;

  preview?: string;

  /**
   * type of template
   * `template`: normal template, looks like an article
   * `sticker`: sticker template, only contains one image block under surface block
   */
  type: 'template' | 'sticker';

  /**
   * Id of the command this template was derived from, when it was derived
   * rather than hand-written (see `snapshotFromAction`). Lets a coverage test
   * assert that every framework artefact command has a template.
   */
  commandId?: string;

  /**
   * Run once the template's elements are on the surface, with the FRESH
   * element ids in snapshot order — for a template whose final shape depends
   * on what is already on the board.
   */
  afterInsert?: (std: BlockStdScope, insertedIds: string[]) => void;
};

export type TemplateCategory = {
  name: string;
  templates: Template[] | (() => Promise<Template[]>);
};

export interface TemplateManager {
  list(category: string): Promise<Template[]> | Template[];

  categories(): Promise<string[]> | string[];

  search(keyword: string, category?: string): Promise<Template[]> | Template[];

  extend?(manager: TemplateManager): void;
}
