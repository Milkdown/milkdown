import type { MermaidConfig } from 'mermaid'

import { codeBlockConfig } from '@milkdown/kit/component/code-block'
import mermaid from 'mermaid'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig, FeaturesCtx } from '../../core/slice'
import { downloadIcon } from '../../icons/download'
import { fitViewportIcon } from '../../icons/fit-viewport'
import { fullscreenIcon } from '../../icons/fullscreen'
import { zoomInIcon } from '../../icons/zoomin'
import { zoomOutIcon } from '../../icons/zoomout'
import { PanZoom } from '../../utils/panzoom'
import { CrepeFeature } from '../index'
import { blockMermaidSchema } from './block-mermaid'
import { mermaidBlockInputRule } from './input-rule'
import { remarkMermaidBlockPlugin } from './remark'


function uuid() {
  let timestamp = Date.now();
  let perforNow = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let random = Math.random() * 16;
    if (timestamp > 0) {
      random = (timestamp + random) % 16 | 0;
      timestamp = Math.floor(timestamp / 16);
    } else {
      random = (perforNow + random) % 16 | 0;
      perforNow = Math.floor(perforNow / 16);
    }
    return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

/*export interface MermaidOptionsConfig {
  mermaidOptions: MermaidConfig
}*/

export type MermaidFeatureConfig = Partial<MermaidConfig>

export const defineFeature: DefineFeature<MermaidFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config((ctx) => {
      const flags = ctx.get(FeaturesCtx)
      const isCodeMirrorEnabled = flags.includes(CrepeFeature.CodeMirror)
      if (!isCodeMirrorEnabled) {
        throw new Error('You need to enable CodeMirror to use Mermaid feature')
      }

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose', // 允许更宽松的语法
        suppressErrorRendering: true,
        ...config
      });
      // 关闭全局错误解析
      mermaid.parseError = () => { };

      ctx.update(codeBlockConfig.key, (prev) => ({
        ...prev,
        renderPreview: (language, content, applyPreview) => {
          if (language.toLowerCase() === 'mermaid' && content.length > 0) {
            return renderMermaid(content);
          }
          const renderPreview0 = prev.renderPreview;
          return renderPreview0 ? renderPreview0(language, content, applyPreview) : null;
        },
      }))

    })
    .use(remarkMermaidBlockPlugin)
    .use(mermaidBlockInputRule)
    .use(blockMermaidSchema)
}

function renderMermaid(content: string) {
  const graphId = 'mermaid-' + uuid();
  let dom = document.createElement('div');
  dom.className = 'milkdown-mermaid-preview-panel';
  dom.id = graphId;

  (function (divId) {
    try {
      // 先验证语法,提前抛出错误, 为了增量渲染正确的部分
      // 配置了 suppressErrors = false, 当语法无效时抛出错误异常
      mermaid.parse(content, { suppressErrors: false })
        .then(async () => {
          await renderSvg(divId, content);
        })
        .catch((err) => {
          const previewDiv = document.getElementById(divId);
          if (previewDiv) {
            const svgDiv = previewDiv.querySelector('div.milkdown-mermaid-svg');
            if (!svgDiv) {
              previewDiv.innerHTML = `<span style="color:#DC362E">语法错误: ${err.message}</span>`;
            }
          } else {
            console.error('>>>>> 渲染错误:', err);
          }
        });

    } catch (e) {
      console.error(e);
    }

  })(graphId);

  return dom;
}

async function renderSvg(divId: string, svgContent: string) {
  const svgId = 'mermaid-svg-' + divId;
  await mermaid.render(svgId, svgContent).then((output: any) => {
    let stime = Date.now();
    let previewPanel: HTMLElement | null;
    while (!(previewPanel = document.getElementById(divId))) {
      if (Date.now() - stime > 2000) {
        break;
      }
    }
    if (!previewPanel) {
      console.error('Mermaid渲染失败，没有找到渲染节点: div#' + divId);
      return;
    }

    previewPanel.innerHTML = `
    <div class="milkdown-mermaid-svg"></div>
    <div class="milkdown-mermaid-toolbar">
      <div class="toolbar-item" title="下载">
        <span class="toolbar-item-icon">${downloadIcon}</span>
        <div class="milkdown-dropdown-menu">
          <div class="milkdown-dropdown-menu-item" data-action="download_svg">下载SVG</div>
          <div class="milkdown-dropdown-menu-item" data-action="download_png">下载图片</div>
        </div>
      </div>
      <button class="toolbar-item" title="缩小" data-action="zoomout">${zoomOutIcon}</button>
      <button class="toolbar-item" title="放大" data-action="zoomin">${zoomInIcon}</button>
      <button class="toolbar-item" title="自适应" data-action="fit">${fitViewportIcon}</button>
      <button class="toolbar-item" title="切换全屏模式" data-action="fullscreen">${fullscreenIcon}</button>
    </div>
    `;

    const svgCode = output.svg;
    const svgPanel = previewPanel.querySelector('.milkdown-mermaid-svg') as HTMLElement;
    if (!svgPanel) {
      console.error('Mermaid渲染失败，没有找到渲染节点: .milkdown-mermaid-svg');
      return;
    }
    svgPanel.innerHTML = svgCode;
    const svgImg = document.querySelector('#' + svgId);
    if (!svgImg) {
      return;
    }

    // 绑定zoom-pan能力
    const svgViewBox = svgImg.getAttribute('viewBox')?.split(' ').map(Number) || [];
    const svgWidth = Math.round(svgViewBox[2] || svgImg.clientWidth || svgImg.getBoundingClientRect().width) + 10;
    const svgHeight = Math.round(svgViewBox[3] || svgImg.clientHeight || svgImg.getBoundingClientRect().height) + 10;
    previewPanel.style.height = previewPanel.dataset.height = Math.round(svgHeight + 20) + 'px';
    svgPanel.style.width = svgWidth + 'px';
    svgPanel.style.height = svgHeight + 'px';

    const pz = new PanZoom(previewPanel, {
      transformElement: svgPanel,
      width: svgWidth,
      height: svgHeight,
      fitOnInit: true,
      beforeWheel: (e: any) => {
        // Ctrl + 滚轮缩放
        return !e.ctrlKey && !e.metaKey;
      }
    });

    const toolbar = previewPanel.querySelector('.milkdown-mermaid-toolbar');
    if (!toolbar) {
      return;
    }
    toolbar.querySelectorAll('[data-action]').forEach(ele => {
      ele.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
      ele.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
        switch (action) {
          case 'zoomin':
          case 'zoomout':
            if (pz) {
              'zoomout' === action ? pz.scaleDown() : pz.scaleUp();
            }
            break;
          case 'fit':
            pz && pz.fit();
            break;
          case 'download_svg':
            downloadSvg(svgCode, 'svg');
            break;
          case 'download_png':
            downloadSvg(svgCode, 'png');
            break;
          case 'fullscreen':
            previewPanel.classList.toggle('fullscreen');
            if (previewPanel.classList.contains('fullscreen')) {
              previewPanel.style.height = 'calc(100% - 100px)';
              previewPanel.style.width = 'calc(100% - 100px)';
            } else {
              previewPanel.style.height = previewPanel.dataset.height || 'auto';
              previewPanel.style.width = 'auto';
            }
            pz && pz.fit();
            break;
        }
      });
    });

  });
}

function downloadSvg(svgCode: string, format: string) {
  const namePrefix = `mermaid-diagram-${new Date().toISOString().replace(/-/g, "").slice(0, 8)}`;
  if ('png' === format) {
    //const svgString = new XMLSerializer().serializeToString(svgElement);
    let svgEle;
    try {
      svgEle = new DOMParser().parseFromString(svgCode, "text/xml").querySelector("svg");
    } catch (e) {
      console.error('DOMParser failed to parse mermaid-svg-code: ', e);
      return;
    }
    if (!svgEle) {
      console.error('DOMParser failed to parse mermaid-svg-code');
      return;
    }

    const svgW = svgEle.viewBox.baseVal.width,
      svgH = svgEle.viewBox.baseVal.height;

    const canvas = document.createElement("canvas");
    canvas.width = 3 * svgW,
      canvas.height = 3 * svgH,
      canvas.style.width = svgW + 'px',
      canvas.style.height = svgH + 'px';
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error('no svg-convas-context2d');
      return;
    }
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((d) => {
        if (!d) {
          return;
        }
        const url = URL.createObjectURL(d);
        const a = document.createElement("a");
        a.href = url;
        a.download = namePrefix + '.png';
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    });
    const base64String = window.btoa(unescape(encodeURIComponent(svgCode)));
    const svgBase64 = `data:image/svg+xml;base64,${base64String}`;
    img.src = svgBase64;
    return;
  }
  else if ('svg' === format) {
    // download as svg
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = namePrefix + '.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

}

// 新增：将 mermaid 注册为 crepe feature，并调用已有的 defineFeature 实现
// 注意：保持与其他 feature 文件一致的特性标记注册顺序
export const mermaid1: DefineFeature<MermaidFeatureConfig> = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.Mermaid));
  defineFeature(editor, config);
}