/* The purpose of this file is to remove inline scripts
 * and styles from the HTML files generated by Astro.
 * For more information, see:
 * https://github.com/withastro/roadmap/discussions/377
 */

import { Glob } from 'bun';
import { readFile, writeFile } from 'fs/promises';
import path, { join } from 'path';
import { djb2 } from './hash';

/**
 * Remove inline scripts and styles from the generated HTML files.
 *
 * @param directory The directory to remove inline scripts and styles from.
 */
async function removeInlineScriptAndStyle(directory: string) {
  console.log('Removing Inline Scripts and Styles');
  const scriptRegx = /<script[^>]*>([\s\S]+?)<\/script>/g;
  const styleRegx = /<style[^>]*>([\s\S]+?)<\/style>/g;
  const glob = new Glob('**/*.html');

  for await (const file of glob.scan({
    cwd: directory,
    dot: true,
    absolute: false,
  })) {
    const filePath = join(directory, file);
    // console.log(`Found ${files.length} files`);
    console.log(`Edit file: ${filePath}`);
    let f = await readFile(filePath, { encoding: 'utf-8' });

    let script;
    while ((script = scriptRegx.exec(f))) {
      const inlineScriptContent = script[1]
        .replace('__sveltekit', 'const __sveltekit')
        .replace(
          'document.currentScript.parentElement',
          'document.body.firstElementChild'
        );
      // Using djb2 hash function to generate a unique filename
      const fn = `/script-${djb2(inlineScriptContent)}.js`;
      f = f.replace(
        script[0], // Using script[0] to replace the entire matched script tag
        `<script type="module" src="${fn}"></script>`
      );
      await writeFile(`${directory}${fn}`, inlineScriptContent);
      console.log(`Inline script extracted and saved at: ${directory}${fn}`);
    }

    let style;
    while ((style = styleRegx.exec(f))) {
      const inlineStyleContent = style[1];
      // Using djb2 hash function to generate a unique filename
      const fn = `/style-${djb2(inlineStyleContent)}.css`;
      f = f.replace(
        style[0], // Using style[0] to replace the entire matched style tag
        `<link rel="stylesheet" href="${fn}" />`
      );
      await writeFile(`${directory}${fn}`, inlineStyleContent);
      console.log(`Inline style extracted and saved at: ${directory}${fn}`);
    }

    await writeFile(filePath, f);
  }
}

const distFolder = path.join(import.meta.dirname, "..", "dist");
await removeInlineScriptAndStyle(distFolder);
