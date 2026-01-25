import { LanguageDescription } from "@codemirror/language";
import { codeBlockConfig } from "@milkdown/kit/component/code-block";
import mermaidLib from "mermaid";

import type { DefineFeature } from '../shared';

import { crepeFeatureConfig, useCrepeFeatures } from '../../core/slice';
import { CrepeFeature } from '../../feature';

export type MermaidConfig = {
  mermaidOptions: Parameters<typeof mermaidLib.initialize>[0]
}

export type MermaidFeatureConfig = Partial<MermaidConfig>

const renderMermaid = async (
  content: string,
  applyPreview: (value: null | string | HTMLElement) => void
) => {
  // eslint-disable-next-line no-console
  console.log("render mermaid preview", content);
  const id = `mermaid-${Date.now()}`;
  try {
    const result = await mermaidLib.render(id, content);
    const wrapper = document.createElement("div");
    wrapper.className = "mermaid";
    wrapper.setAttribute("data-mermaid-id", id);
    wrapper.innerHTML = result.svg;
    result.bindFunctions?.(wrapper);
    applyPreview(wrapper);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("render mermaid error", error);
  }
};

export const mermaid: DefineFeature<MermaidFeatureConfig> = (editor, config) => {

  mermaidLib.initialize({
    startOnLoad: false,
    theme: 'default',
    ...config?.mermaidOptions,
  });

  editor
    .config(crepeFeatureConfig(CrepeFeature.Mermaid))
    .config((ctx) => {
      const flags = useCrepeFeatures(ctx).get()
      const isCodeMirrorEnabled = flags.includes(CrepeFeature.CodeMirror)
      if (!isCodeMirrorEnabled) {
        throw new Error('You need to enable CodeMirror to use Mermaid feature')
      }

      ctx.update(codeBlockConfig.key, (prev) => ({
        ...prev,
        previewOnlyByDefault: true,
        languages: [
          ...prev.languages,
          LanguageDescription.of({
            name: 'Mermaid',
            alias: ['mermaid'],
            extensions: ['mermaid'],
            load: () => import('codemirror-lang-mermaid').then((m) => m.mermaid()),
          }),
        ],
        renderPreview: (language, content, applyPreview) => {
          if (language.toLowerCase() === "mermaid" && content.trim().length > 0) {
            renderMermaid(content, applyPreview).catch((error) => {
              console.error("render mermaid error", error);
            });
          }
          const renderPreview = prev.renderPreview;
          return renderPreview(language, content, applyPreview);
        },
      }));
    });
};
