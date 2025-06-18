import { defaultsDeep } from 'lodash-es';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import { blockConfig, block, BlockProvider } from '@milkdown/kit/plugin/block';
import { createSlice } from '@milkdown/kit/ctx';
import { commandsCtx, editorViewCtx, editorCtx, EditorStatus, Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/kit/core';
import { paragraphSchema, clearTextInCurrentBlockCommand, setBlockTypeCommand, headingSchema, blockquoteSchema, wrapInBlockTypeCommand, hrSchema, addBlockTypeCommand, bulletListSchema, orderedListSchema, listItemSchema, codeBlockSchema, selectTextNearPosCommand, toggleStrongCommand, isMarkSelectedCommand, strongSchema, toggleEmphasisCommand, emphasisSchema, toggleInlineCodeCommand, inlineCodeSchema, isNodeSelectedCommand, linkSchema, commonmark } from '@milkdown/kit/preset/commonmark';
import { findParent, findNodeInSelection, nodeRule } from '@milkdown/kit/prose';
import { TextSelection, NodeSelection, EditorState, Plugin, PluginKey } from '@milkdown/kit/prose/state';
import { defineComponent, ref, computed, watch, watchEffect, onUnmounted, h, createApp, Fragment, shallowRef } from 'vue';
import { slashFactory, SlashProvider } from '@milkdown/kit/plugin/slash';
import { $ctx, $prose, $nodeSchema, $command, $inputRule, $remark, getMarkdown } from '@milkdown/kit/utils';
import { Icon } from '@milkdown/kit/component';
import { imageBlockSchema, imageBlockConfig, imageBlockComponent } from '@milkdown/kit/component/image-block';
import { createTable, toggleStrikethroughCommand, strikethroughSchema, gfm } from '@milkdown/kit/preset/gfm';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { codeBlockConfig, codeBlockComponent } from '@milkdown/kit/component/code-block';
import { basicSetup } from 'codemirror';
import { dropCursorConfig, cursor as cursor$1 } from '@milkdown/kit/plugin/cursor';
import { createVirtualCursor } from 'prosemirror-virtual-cursor';
import { inlineImageConfig, imageInlineComponent } from '@milkdown/kit/component/image-inline';
import katex from 'katex';
import { tooltipFactory, TooltipProvider } from '@milkdown/kit/plugin/tooltip';
import { redo, undo } from '@milkdown/kit/prose/history';
import { keymap as keymap$1 } from '@milkdown/kit/prose/keymap';
import { Schema } from '@milkdown/kit/prose/model';
import { EditorView, DecorationSet, Decoration } from '@milkdown/kit/prose/view';
import { textblockTypeInputRule } from '@milkdown/kit/prose/inputrules';
import remarkMath from 'remark-math';
import { visit } from 'unist-util-visit';
import { configureLinkTooltip, linkTooltipConfig, linkTooltipPlugin, toggleLinkCommand } from '@milkdown/kit/component/link-tooltip';
import { listItemBlockComponent, listItemBlockConfig } from '@milkdown/kit/component/list-item-block';
import { tableBlockConfig, tableBlock } from '@milkdown/kit/component/table-block';
import clsx from 'clsx';
import { clipboard } from '@milkdown/kit/plugin/clipboard';
import { history } from '@milkdown/kit/plugin/history';
import { indentConfig, indent } from '@milkdown/kit/plugin/indent';
import { listenerCtx, listener } from '@milkdown/kit/plugin/listener';
import { trailing } from '@milkdown/kit/plugin/trailing';

const CrepeFeature = /* @__PURE__ */ ((CrepeFeature2) => {
  CrepeFeature2["CodeMirror"] = "code-mirror";
  CrepeFeature2["ListItem"] = "list-item";
  CrepeFeature2["LinkTooltip"] = "link-tooltip";
  CrepeFeature2["Cursor"] = "cursor";
  CrepeFeature2["ImageBlock"] = "image-block";
  CrepeFeature2["BlockEdit"] = "block-edit";
  CrepeFeature2["Toolbar"] = "toolbar";
  CrepeFeature2["Placeholder"] = "placeholder";
  CrepeFeature2["Table"] = "table";
  CrepeFeature2["Latex"] = "latex";
  return CrepeFeature2;
})(CrepeFeature || {});
const defaultFeatures = {
  ["cursor" /* Cursor */]: true,
  ["list-item" /* ListItem */]: true,
  ["link-tooltip" /* LinkTooltip */]: true,
  ["image-block" /* ImageBlock */]: true,
  ["block-edit" /* BlockEdit */]: true,
  ["placeholder" /* Placeholder */]: true,
  ["toolbar" /* Toolbar */]: true,
  ["code-mirror" /* CodeMirror */]: true,
  ["table" /* Table */]: true,
  ["latex" /* Latex */]: true
};

const alignCenterIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M4.25 20.5C4.0375 20.5 3.85942 20.4281 3.71575 20.2843C3.57192 20.1404 3.5 19.9622 3.5 19.7498C3.5 19.5371 3.57192 19.359 3.71575 19.2155C3.85942 19.0718 4.0375 19 4.25 19H19.75C19.9625 19 20.1406 19.0719 20.2843 19.2158C20.4281 19.3596 20.5 19.5378 20.5 19.7502C20.5 19.9629 20.4281 20.141 20.2843 20.2845C20.1406 20.4282 19.9625 20.5 19.75 20.5H4.25ZM8.25 16.625C8.0375 16.625 7.85942 16.5531 7.71575 16.4093C7.57192 16.2654 7.5 16.0872 7.5 15.8748C7.5 15.6621 7.57192 15.484 7.71575 15.3405C7.85942 15.1968 8.0375 15.125 8.25 15.125H15.75C15.9625 15.125 16.1406 15.1969 16.2843 15.3408C16.4281 15.4846 16.5 15.6628 16.5 15.8753C16.5 16.0879 16.4281 16.266 16.2843 16.4095C16.1406 16.5532 15.9625 16.625 15.75 16.625H8.25ZM4.25 12.75C4.0375 12.75 3.85942 12.6781 3.71575 12.5343C3.57192 12.3904 3.5 12.2122 3.5 11.9998C3.5 11.7871 3.57192 11.609 3.71575 11.4655C3.85942 11.3218 4.0375 11.25 4.25 11.25H19.75C19.9625 11.25 20.1406 11.3219 20.2843 11.4658C20.4281 11.6096 20.5 11.7878 20.5 12.0003C20.5 12.2129 20.4281 12.391 20.2843 12.5345C20.1406 12.6782 19.9625 12.75 19.75 12.75H4.25ZM8.25 8.875C8.0375 8.875 7.85942 8.80308 7.71575 8.65925C7.57192 8.51542 7.5 8.33725 7.5 8.12475C7.5 7.91208 7.57192 7.734 7.71575 7.5905C7.85942 7.44683 8.0375 7.375 8.25 7.375H15.75C15.9625 7.375 16.1406 7.44692 16.2843 7.59075C16.4281 7.73458 16.5 7.91275 16.5 8.12525C16.5 8.33792 16.4281 8.516 16.2843 8.6595C16.1406 8.80317 15.9625 8.875 15.75 8.875H8.25ZM4.25 5C4.0375 5 3.85942 4.92808 3.71575 4.78425C3.57192 4.64042 3.5 4.46225 3.5 4.24975C3.5 4.03708 3.57192 3.859 3.71575 3.7155C3.85942 3.57183 4.0375 3.5 4.25 3.5H19.75C19.9625 3.5 20.1406 3.57192 20.2843 3.71575C20.4281 3.85958 20.5 4.03775 20.5 4.25025C20.5 4.46292 20.4281 4.641 20.2843 4.7845C20.1406 4.92817 19.9625 5 19.75 5H4.25Z"
    />
  </svg>
`;

const alignLeftIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M4.25 20.5C4.0375 20.5 3.85942 20.4281 3.71575 20.2843C3.57192 20.1404 3.5 19.9622 3.5 19.7498C3.5 19.5371 3.57192 19.359 3.71575 19.2155C3.85942 19.0718 4.0375 19 4.25 19H19.75C19.9625 19 20.1406 19.0719 20.2843 19.2158C20.4281 19.3596 20.5 19.5378 20.5 19.7502C20.5 19.9629 20.4281 20.141 20.2843 20.2845C20.1406 20.4282 19.9625 20.5 19.75 20.5H4.25ZM4.25 16.625C4.0375 16.625 3.85942 16.5531 3.71575 16.4093C3.57192 16.2654 3.5 16.0872 3.5 15.8748C3.5 15.6621 3.57192 15.484 3.71575 15.3405C3.85942 15.1968 4.0375 15.125 4.25 15.125H13.75C13.9625 15.125 14.1406 15.1969 14.2843 15.3408C14.4281 15.4846 14.5 15.6628 14.5 15.8753C14.5 16.0879 14.4281 16.266 14.2843 16.4095C14.1406 16.5532 13.9625 16.625 13.75 16.625H4.25ZM4.25 12.75C4.0375 12.75 3.85942 12.6781 3.71575 12.5343C3.57192 12.3904 3.5 12.2122 3.5 11.9998C3.5 11.7871 3.57192 11.609 3.71575 11.4655C3.85942 11.3218 4.0375 11.25 4.25 11.25H19.75C19.9625 11.25 20.1406 11.3219 20.2843 11.4658C20.4281 11.6096 20.5 11.7878 20.5 12.0003C20.5 12.2129 20.4281 12.391 20.2843 12.5345C20.1406 12.6782 19.9625 12.75 19.75 12.75H4.25ZM4.25 8.875C4.0375 8.875 3.85942 8.80308 3.71575 8.65925C3.57192 8.51542 3.5 8.33725 3.5 8.12475C3.5 7.91208 3.57192 7.734 3.71575 7.5905C3.85942 7.44683 4.0375 7.375 4.25 7.375H13.75C13.9625 7.375 14.1406 7.44692 14.2843 7.59075C14.4281 7.73458 14.5 7.91275 14.5 8.12525C14.5 8.33792 14.4281 8.516 14.2843 8.6595C14.1406 8.80317 13.9625 8.875 13.75 8.875H4.25ZM4.25 5C4.0375 5 3.85942 4.92808 3.71575 4.78425C3.57192 4.64042 3.5 4.46225 3.5 4.24975C3.5 4.03708 3.57192 3.859 3.71575 3.7155C3.85942 3.57183 4.0375 3.5 4.25 3.5H19.75C19.9625 3.5 20.1406 3.57192 20.2843 3.71575C20.4281 3.85958 20.5 4.03775 20.5 4.25025C20.5 4.46292 20.4281 4.641 20.2843 4.7845C20.1406 4.92817 19.9625 5 19.75 5H4.25Z"
    />
  </svg>
`;

const alignRightIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M4.25 5C4.0375 5 3.85942 4.92808 3.71575 4.78425C3.57192 4.64042 3.5 4.46225 3.5 4.24975C3.5 4.03708 3.57192 3.859 3.71575 3.7155C3.85942 3.57183 4.0375 3.5 4.25 3.5H19.75C19.9625 3.5 20.1406 3.57192 20.2843 3.71575C20.4281 3.85958 20.5 4.03775 20.5 4.25025C20.5 4.46292 20.4281 4.641 20.2843 4.7845C20.1406 4.92817 19.9625 5 19.75 5H4.25ZM10.25 8.875C10.0375 8.875 9.85942 8.80308 9.71575 8.65925C9.57192 8.51542 9.5 8.33725 9.5 8.12475C9.5 7.91208 9.57192 7.734 9.71575 7.5905C9.85942 7.44683 10.0375 7.375 10.25 7.375H19.75C19.9625 7.375 20.1406 7.44692 20.2843 7.59075C20.4281 7.73458 20.5 7.91275 20.5 8.12525C20.5 8.33792 20.4281 8.516 20.2843 8.6595C20.1406 8.80317 19.9625 8.875 19.75 8.875H10.25ZM4.25 12.75C4.0375 12.75 3.85942 12.6781 3.71575 12.5343C3.57192 12.3904 3.5 12.2122 3.5 11.9998C3.5 11.7871 3.57192 11.609 3.71575 11.4655C3.85942 11.3218 4.0375 11.25 4.25 11.25H19.75C19.9625 11.25 20.1406 11.3219 20.2843 11.4658C20.4281 11.6096 20.5 11.7878 20.5 12.0003C20.5 12.2129 20.4281 12.391 20.2843 12.5345C20.1406 12.6782 19.9625 12.75 19.75 12.75H4.25ZM10.25 16.625C10.0375 16.625 9.85942 16.5531 9.71575 16.4093C9.57192 16.2654 9.5 16.0872 9.5 15.8748C9.5 15.6621 9.57192 15.484 9.71575 15.3405C9.85942 15.1968 10.0375 15.125 10.25 15.125H19.75C19.9625 15.125 20.1406 15.1969 20.2843 15.3408C20.4281 15.4846 20.5 15.6628 20.5 15.8753C20.5 16.0879 20.4281 16.266 20.2843 16.4095C20.1406 16.5532 19.9625 16.625 19.75 16.625H10.25ZM4.25 20.5C4.0375 20.5 3.85942 20.4281 3.71575 20.2843C3.57192 20.1404 3.5 19.9622 3.5 19.7498C3.5 19.5371 3.57192 19.359 3.71575 19.2155C3.85942 19.0718 4.0375 19 4.25 19H19.75C19.9625 19 20.1406 19.0719 20.2843 19.2158C20.4281 19.3596 20.5 19.5378 20.5 19.7502C20.5 19.9629 20.4281 20.141 20.2843 20.2845C20.1406 20.4282 19.9625 20.5 19.75 20.5H4.25Z"
    />
  </svg>
`;

const boldIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M8.85758 18.625C8.4358 18.625 8.07715 18.4772 7.78163 18.1817C7.48613 17.8862 7.33838 17.5275 7.33838 17.1058V6.8942C7.33838 6.47242 7.48613 6.11377 7.78163 5.81825C8.07715 5.52275 8.4358 5.375 8.85758 5.375H12.1999C13.2191 5.375 14.1406 5.69231 14.9643 6.32693C15.788 6.96154 16.1999 7.81603 16.1999 8.89038C16.1999 9.63779 16.0194 10.2471 15.6585 10.7183C15.2976 11.1894 14.9088 11.5314 14.4922 11.7442C15.005 11.9211 15.4947 12.2708 15.9614 12.7933C16.428 13.3157 16.6614 14.0192 16.6614 14.9038C16.6614 16.182 16.1902 17.1217 15.2479 17.723C14.3056 18.3243 13.3563 18.625 12.3999 18.625H8.85758ZM9.4883 16.6327H12.3191C13.1063 16.6327 13.6627 16.4141 13.9884 15.9769C14.314 15.5397 14.4768 15.1205 14.4768 14.7192C14.4768 14.3179 14.314 13.8987 13.9884 13.4615C13.6627 13.0243 13.0909 12.8057 12.273 12.8057H9.4883V16.6327ZM9.4883 10.875H12.0826C12.6903 10.875 13.172 10.7013 13.5278 10.3539C13.8836 10.0064 14.0615 9.59037 14.0615 9.10575C14.0615 8.59035 13.8733 8.16918 13.497 7.84225C13.1207 7.51533 12.6595 7.35188 12.1133 7.35188H9.4883V10.875Z"
    />
  </svg>
`;

const bulletIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_952_6527)">
      <circle cx="12" cy="12" r="3" />
    </g>
    <defs>
      <clipPath id="clip0_952_6527">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const bulletListIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_8070)">
      <path
        d="M4 10.5C3.17 10.5 2.5 11.17 2.5 12C2.5 12.83 3.17 13.5 4 13.5C4.83 13.5 5.5 12.83 5.5 12C5.5 11.17 4.83 10.5 4 10.5ZM4 4.5C3.17 4.5 2.5 5.17 2.5 6C2.5 6.83 3.17 7.5 4 7.5C4.83 7.5 5.5 6.83 5.5 6C5.5 5.17 4.83 4.5 4 4.5ZM4 16.5C3.17 16.5 2.5 17.18 2.5 18C2.5 18.82 3.18 19.5 4 19.5C4.82 19.5 5.5 18.82 5.5 18C5.5 17.18 4.83 16.5 4 16.5ZM8 19H20C20.55 19 21 18.55 21 18C21 17.45 20.55 17 20 17H8C7.45 17 7 17.45 7 18C7 18.55 7.45 19 8 19ZM8 13H20C20.55 13 21 12.55 21 12C21 11.45 20.55 11 20 11H8C7.45 11 7 11.45 7 12C7 12.55 7.45 13 8 13ZM7 6C7 6.55 7.45 7 8 7H20C20.55 7 21 6.55 21 6C21 5.45 20.55 5 20 5H8C7.45 5 7 5.45 7 6Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_8070">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const captionIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M9 22a1 1 0 0 1-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29zm1-6v3.08L13.08 16H20V4H4v12z"
    />
  </svg>
`;

const checkBoxCheckedIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_1803_1151)">
      <path
        d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM10.71 16.29C10.32 16.68 9.69 16.68 9.3 16.29L5.71 12.7C5.32 12.31 5.32 11.68 5.71 11.29C6.1 10.9 6.73 10.9 7.12 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.71 16.29Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_1803_1151">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const checkBoxUncheckedIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_1803_535)">
      <path
        d="M18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H18C18.55 5 19 5.45 19 6V18C19 18.55 18.55 19 18 19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_1803_535">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const chevronDownIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-6 h-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
`;

const clearIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_1098_15553)">
      <path
        d="M18.3007 5.70973C17.9107 5.31973 17.2807 5.31973 16.8907 5.70973L12.0007 10.5897L7.1107 5.69973C6.7207 5.30973 6.0907 5.30973 5.7007 5.69973C5.3107 6.08973 5.3107 6.71973 5.7007 7.10973L10.5907 11.9997L5.7007 16.8897C5.3107 17.2797 5.3107 17.9097 5.7007 18.2997C6.0907 18.6897 6.7207 18.6897 7.1107 18.2997L12.0007 13.4097L16.8907 18.2997C17.2807 18.6897 17.9107 18.6897 18.3007 18.2997C18.6907 17.9097 18.6907 17.2797 18.3007 16.8897L13.4107 11.9997L18.3007 7.10973C18.6807 6.72973 18.6807 6.08973 18.3007 5.70973Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_1098_15553">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const codeIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_8081)">
      <path
        d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_8081">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const confirmIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <g clip-path="url(#clip0_1013_1606)">
      <path
        d="M9.00012 16.1998L5.50012 12.6998C5.11012 12.3098 4.49012 12.3098 4.10012 12.6998C3.71012 13.0898 3.71012 13.7098 4.10012 14.0998L8.29012 18.2898C8.68012 18.6798 9.31012 18.6798 9.70012 18.2898L20.3001 7.69982C20.6901 7.30982 20.6901 6.68982 20.3001 6.29982C19.9101 5.90982 19.2901 5.90982 18.9001 6.29982L9.00012 16.1998Z"
        fill="#817567"
      />
    </g>
    <defs>
      <clipPath id="clip0_1013_1606">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const copyIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="none"
  >
    <path
      d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"
    />
  </svg>
`;

const dividerIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_7900)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M19 13H5C4.45 13 4 12.55 4 12C4 11.45 4.45 11 5 11H19C19.55 11 20 11.45 20 12C20 12.55 19.55 13 19 13Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_7900">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const dragHandleIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
  >
    <path
      d="M3.5 9.83366C3.35833 9.83366 3.23961 9.78571 3.14383 9.68983C3.04794 9.59394 3 9.47516 3 9.33349C3 9.19171 3.04794 9.07299 3.14383 8.97733C3.23961 8.88155 3.35833 8.83366 3.5 8.83366H12.5C12.6417 8.83366 12.7604 8.8816 12.8562 8.97749C12.9521 9.07338 13 9.19216 13 9.33383C13 9.4756 12.9521 9.59433 12.8562 9.68999C12.7604 9.78577 12.6417 9.83366 12.5 9.83366H3.5ZM3.5 7.16699C3.35833 7.16699 3.23961 7.11905 3.14383 7.02316C3.04794 6.92727 3 6.80849 3 6.66683C3 6.52505 3.04794 6.40633 3.14383 6.31066C3.23961 6.21488 3.35833 6.16699 3.5 6.16699H12.5C12.6417 6.16699 12.7604 6.21494 12.8562 6.31083C12.9521 6.40671 13 6.52549 13 6.66716C13 6.80894 12.9521 6.92766 12.8562 7.02333C12.7604 7.1191 12.6417 7.16699 12.5 7.16699H3.5Z"
    />
  </svg>
`;

const editIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_1013_1585)">
      <path
        d="M14.06 9.02L14.98 9.94L5.92 19H5V18.08L14.06 9.02ZM17.66 3C17.41 3 17.15 3.1 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C18.17 3.09 17.92 3 17.66 3ZM14.06 6.19L3 17.25V21H6.75L17.81 9.94L14.06 6.19Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_1013_1585">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const h1Icon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_992_5553)">
      <path
        d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM12 17H14V7H10V9H12V17Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_992_5553">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const h2Icon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_992_5559)">
      <path
        d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM15 15H11V13H13C14.1 13 15 12.11 15 11V9C15 7.89 14.1 7 13 7H9V9H13V11H11C9.9 11 9 11.89 9 13V17H15V15Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_992_5559">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const h3Icon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_992_5565)">
      <path
        d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM15 15V13.5C15 12.67 14.33 12 13.5 12C14.33 12 15 11.33 15 10.5V9C15 7.89 14.1 7 13 7H9V9H13V11H11V13H13V15H9V17H13C14.1 17 15 16.11 15 15Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_992_5565">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const h4Icon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_7757)">
      <path
        d="M19.04 3H5.04004C3.94004 3 3.04004 3.9 3.04004 5V19C3.04004 20.1 3.94004 21 5.04004 21H19.04C20.14 21 21.04 20.1 21.04 19V5C21.04 3.9 20.14 3 19.04 3ZM19.04 19H5.04004V5H19.04V19ZM13.04 17H15.04V7H13.04V11H11.04V7H9.04004V13H13.04V17Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_7757">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const h5Icon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_7760)">
      <path
        d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM15 15V13C15 11.89 14.1 11 13 11H11V9H15V7H9V13H13V15H9V17H13C14.1 17 15 16.11 15 15Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_7760">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const h6Icon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_7763)">
      <path
        d="M11 17H13C14.1 17 15 16.11 15 15V13C15 11.89 14.1 11 13 11H11V9H15V7H11C9.9 7 9 7.89 9 9V15C9 16.11 9.9 17 11 17ZM11 13H13V15H11V13ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_7763">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const imageIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_8075)">
      <path
        d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14.14 11.86L11.14 15.73L9 13.14L6 17H18L14.14 11.86Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_8075">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const italicIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M6.29811 18.625C6.04505 18.625 5.83115 18.5375 5.65641 18.3626C5.48166 18.1877 5.39429 17.9736 5.39429 17.7203C5.39429 17.467 5.48166 17.2532 5.65641 17.0788C5.83115 16.9045 6.04505 16.8173 6.29811 16.8173H9.21159L12.452 7.18265H9.53851C9.28545 7.18265 9.07155 7.0952 8.89681 6.9203C8.72206 6.7454 8.63469 6.5313 8.63469 6.278C8.63469 6.02472 8.72206 5.81089 8.89681 5.63652C9.07155 5.46217 9.28545 5.375 9.53851 5.375H16.8847C17.1377 5.375 17.3516 5.46245 17.5264 5.63735C17.7011 5.81225 17.7885 6.02634 17.7885 6.27962C17.7885 6.53293 17.7011 6.74676 17.5264 6.92113C17.3516 7.09548 17.1377 7.18265 16.8847 7.18265H14.2789L11.0385 16.8173H13.6443C13.8973 16.8173 14.1112 16.9048 14.286 17.0797C14.4607 17.2546 14.5481 17.4687 14.5481 17.722C14.5481 17.9752 14.4607 18.1891 14.286 18.3634C14.1112 18.5378 13.8973 18.625 13.6443 18.625H6.29811Z"
    />
  </svg>
`;

const linkIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M17.0385 19.5003V16.5388H14.0769V15.0388H17.0385V12.0773H18.5384V15.0388H21.5V16.5388H18.5384V19.5003H17.0385ZM10.8077 16.5388H7.03845C5.78282 16.5388 4.7125 16.0963 3.8275 15.2114C2.9425 14.3266 2.5 13.2564 2.5 12.0009C2.5 10.7454 2.9425 9.67504 3.8275 8.78979C4.7125 7.90454 5.78282 7.46191 7.03845 7.46191H10.8077V8.96186H7.03845C6.1987 8.96186 5.48235 9.25834 4.8894 9.85129C4.29645 10.4442 3.99998 11.1606 3.99998 12.0003C3.99998 12.8401 4.29645 13.5564 4.8894 14.1494C5.48235 14.7423 6.1987 15.0388 7.03845 15.0388H10.8077V16.5388ZM8.25 12.7503V11.2504H15.75V12.7503H8.25ZM21.5 12.0003H20C20 11.1606 19.7035 10.4442 19.1106 9.85129C18.5176 9.25834 17.8013 8.96186 16.9615 8.96186H13.1923V7.46191H16.9615C18.2171 7.46191 19.2875 7.90441 20.1725 8.78939C21.0575 9.67439 21.5 10.7447 21.5 12.0003Z"
    />
  </svg>
`;

const menuIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_971_7680)">
      <path
        d="M11 18C11 19.1 10.1 20 9 20C7.9 20 7 19.1 7 18C7 16.9 7.9 16 9 16C10.1 16 11 16.9 11 18ZM9 10C7.9 10 7 10.9 7 12C7 13.1 7.9 14 9 14C10.1 14 11 13.1 11 12C11 10.9 10.1 10 9 10ZM9 4C7.9 4 7 4.9 7 6C7 7.1 7.9 8 9 8C10.1 8 11 7.1 11 6C11 4.9 10.1 4 9 4ZM15 8C16.1 8 17 7.1 17 6C17 4.9 16.1 4 15 4C13.9 4 13 4.9 13 6C13 7.1 13.9 8 15 8ZM15 10C13.9 10 13 10.9 13 12C13 13.1 13.9 14 15 14C16.1 14 17 13.1 17 12C17 10.9 16.1 10 15 10ZM15 16C13.9 16 13 16.9 13 18C13 19.1 13.9 20 15 20C16.1 20 17 19.1 17 18C17 16.9 16.1 16 15 16Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_971_7680">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const orderedListIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_8067)">
      <path
        d="M8 7H20C20.55 7 21 6.55 21 6C21 5.45 20.55 5 20 5H8C7.45 5 7 5.45 7 6C7 6.55 7.45 7 8 7ZM20 17H8C7.45 17 7 17.45 7 18C7 18.55 7.45 19 8 19H20C20.55 19 21 18.55 21 18C21 17.45 20.55 17 20 17ZM20 11H8C7.45 11 7 11.45 7 12C7 12.55 7.45 13 8 13H20C20.55 13 21 12.55 21 12C21 11.45 20.55 11 20 11ZM4.5 16H2.5C2.22 16 2 16.22 2 16.5C2 16.78 2.22 17 2.5 17H4V17.5H3.5C3.22 17.5 3 17.72 3 18C3 18.28 3.22 18.5 3.5 18.5H4V19H2.5C2.22 19 2 19.22 2 19.5C2 19.78 2.22 20 2.5 20H4.5C4.78 20 5 19.78 5 19.5V16.5C5 16.22 4.78 16 4.5 16ZM2.5 5H3V7.5C3 7.78 3.22 8 3.5 8C3.78 8 4 7.78 4 7.5V4.5C4 4.22 3.78 4 3.5 4H2.5C2.22 4 2 4.22 2 4.5C2 4.78 2.22 5 2.5 5ZM4.5 10H2.5C2.22 10 2 10.22 2 10.5C2 10.78 2.22 11 2.5 11H3.8L2.12 12.96C2.04 13.05 2 13.17 2 13.28V13.5C2 13.78 2.22 14 2.5 14H4.5C4.78 14 5 13.78 5 13.5C5 13.22 4.78 13 4.5 13H3.2L4.88 11.04C4.96 10.95 5 10.83 5 10.72V10.5C5 10.22 4.78 10 4.5 10Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_8067">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const plusIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_971_7676)">
      <path
        d="M18 13H13V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H11V6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6V11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_971_7676">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const quoteIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_7897)">
      <path
        d="M7.17 17C7.68 17 8.15 16.71 8.37 16.26L9.79 13.42C9.93 13.14 10 12.84 10 12.53V8C10 7.45 9.55 7 9 7H5C4.45 7 4 7.45 4 8V12C4 12.55 4.45 13 5 13H7L5.97 15.06C5.52 15.95 6.17 17 7.17 17ZM17.17 17C17.68 17 18.15 16.71 18.37 16.26L19.79 13.42C19.93 13.14 20 12.84 20 12.53V8C20 7.45 19.55 7 19 7H15C14.45 7 14 7.45 14 8V12C14 12.55 14.45 13 15 13H17L15.97 15.06C15.52 15.95 16.17 17 17.17 17Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_7897">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const removeIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M7.30775 20.4997C6.81058 20.4997 6.385 20.3227 6.031 19.9687C5.677 19.6147 5.5 19.1892 5.5 18.692V5.99973H5.25C5.0375 5.99973 4.85942 5.92782 4.71575 5.78398C4.57192 5.64015 4.5 5.46198 4.5 5.24948C4.5 5.03682 4.57192 4.85873 4.71575 4.71523C4.85942 4.57157 5.0375 4.49973 5.25 4.49973H9C9 4.2549 9.08625 4.04624 9.25875 3.87374C9.43108 3.7014 9.63967 3.61523 9.8845 3.61523H14.1155C14.3603 3.61523 14.5689 3.7014 14.7413 3.87374C14.9138 4.04624 15 4.2549 15 4.49973H18.75C18.9625 4.49973 19.1406 4.57165 19.2843 4.71548C19.4281 4.85932 19.5 5.03748 19.5 5.24998C19.5 5.46265 19.4281 5.64073 19.2843 5.78423C19.1406 5.9279 18.9625 5.99973 18.75 5.99973H18.5V18.692C18.5 19.1892 18.323 19.6147 17.969 19.9687C17.615 20.3227 17.1894 20.4997 16.6923 20.4997H7.30775ZM17 5.99973H7V18.692C7 18.7818 7.02883 18.8556 7.0865 18.9132C7.14417 18.9709 7.21792 18.9997 7.30775 18.9997H16.6923C16.7821 18.9997 16.8558 18.9709 16.9135 18.9132C16.9712 18.8556 17 18.7818 17 18.692V5.99973ZM10.1543 16.9997C10.3668 16.9997 10.5448 16.9279 10.6885 16.7842C10.832 16.6404 10.9037 16.4622 10.9037 16.2497V8.74973C10.9037 8.53723 10.8318 8.35907 10.688 8.21523C10.5443 8.07157 10.3662 7.99973 10.1535 7.99973C9.941 7.99973 9.76292 8.07157 9.61925 8.21523C9.47575 8.35907 9.404 8.53723 9.404 8.74973V16.2497C9.404 16.4622 9.47583 16.6404 9.6195 16.7842C9.76333 16.9279 9.94158 16.9997 10.1543 16.9997ZM13.8465 16.9997C14.059 16.9997 14.2371 16.9279 14.3807 16.7842C14.5243 16.6404 14.596 16.4622 14.596 16.2497V8.74973C14.596 8.53723 14.5242 8.35907 14.3805 8.21523C14.2367 8.07157 14.0584 7.99973 13.8458 7.99973C13.6333 7.99973 13.4552 8.07157 13.3115 8.21523C13.168 8.35907 13.0962 8.53723 13.0962 8.74973V16.2497C13.0962 16.4622 13.1682 16.6404 13.312 16.7842C13.4557 16.9279 13.6338 16.9997 13.8465 16.9997Z"
    />
  </svg>
`;

const searchIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-6 h-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
`;

const strikethroughIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M3.25 13.7404C3.0375 13.7404 2.85938 13.6684 2.71563 13.5246C2.57188 13.3808 2.5 13.2026 2.5 12.99C2.5 12.7774 2.57188 12.5993 2.71563 12.4558C2.85938 12.3122 3.0375 12.2404 3.25 12.2404H20.75C20.9625 12.2404 21.1406 12.3123 21.2843 12.4561C21.4281 12.5999 21.5 12.7781 21.5 12.9907C21.5 13.2033 21.4281 13.3814 21.2843 13.525C21.1406 13.6686 20.9625 13.7404 20.75 13.7404H3.25ZM10.9423 10.2596V6.62495H6.5673C6.2735 6.62495 6.02377 6.52201 5.8181 6.31613C5.61245 6.11026 5.50963 5.86027 5.50963 5.56615C5.50963 5.27205 5.61245 5.02083 5.8181 4.8125C6.02377 4.60417 6.2735 4.5 6.5673 4.5H17.4423C17.7361 4.5 17.9858 4.60294 18.1915 4.80883C18.3971 5.01471 18.5 5.2647 18.5 5.5588C18.5 5.85292 18.3971 6.10413 18.1915 6.31245C17.9858 6.52078 17.7361 6.62495 17.4423 6.62495H13.0673V10.2596H10.9423ZM10.9423 15.7211H13.0673V18.4423C13.0673 18.7361 12.9643 18.9858 12.7584 19.1915C12.5526 19.3971 12.3026 19.5 12.0085 19.5C11.7144 19.5 11.4631 19.3962 11.2548 19.1887C11.0465 18.9811 10.9423 18.7291 10.9423 18.4327V15.7211Z"
    />
  </svg>
`;

const tableIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_977_8078)">
      <path
        d="M20 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3ZM20 5V8H5V5H20ZM15 19H10V10H15V19ZM5 10H8V19H5V10ZM17 19V10H20V19H17Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_977_8078">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const textIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g clip-path="url(#clip0_992_5547)">
      <path
        d="M5 5.5C5 6.33 5.67 7 6.5 7H10.5V17.5C10.5 18.33 11.17 19 12 19C12.83 19 13.5 18.33 13.5 17.5V7H17.5C18.33 7 19 6.33 19 5.5C19 4.67 18.33 4 17.5 4H6.5C5.67 4 5 4.67 5 5.5Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_992_5547">
        <rect width="24" height="24" />
      </clipPath>
    </defs>
  </svg>
`;

const todoListIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M5.66936 16.3389L9.39244 12.6158C9.54115 12.4671 9.71679 12.3937 9.91936 12.3957C10.1219 12.3976 10.2975 12.4761 10.4463 12.6312C10.5847 12.7823 10.654 12.9585 10.654 13.1599C10.654 13.3613 10.5847 13.5363 10.4463 13.6851L6.32704 17.8197C6.14627 18.0004 5.93538 18.0908 5.69436 18.0908C5.45333 18.0908 5.24243 18.0004 5.06166 17.8197L3.01744 15.7754C2.87899 15.637 2.81136 15.4629 2.81456 15.2533C2.81776 15.0437 2.88859 14.8697 3.02706 14.7312C3.16551 14.5928 3.34008 14.5235 3.55076 14.5235C3.76144 14.5235 3.93494 14.5928 4.07126 14.7312L5.66936 16.3389ZM5.66936 8.72359L9.39244 5.00049C9.54115 4.85177 9.71679 4.77838 9.91936 4.78031C10.1219 4.78223 10.2975 4.86075 10.4463 5.01586C10.5847 5.16691 10.654 5.34314 10.654 5.54454C10.654 5.74592 10.5847 5.92097 10.4463 6.06969L6.32704 10.2043C6.14627 10.3851 5.93538 10.4755 5.69436 10.4755C5.45333 10.4755 5.24243 10.3851 5.06166 10.2043L3.01744 8.16009C2.87899 8.02162 2.81136 7.84759 2.81456 7.63799C2.81776 7.42837 2.88859 7.25433 3.02706 7.11586C3.16551 6.97741 3.34008 6.90819 3.55076 6.90819C3.76144 6.90819 3.93494 6.97741 4.07126 7.11586L5.66936 8.72359ZM13.7597 16.5581C13.5472 16.5581 13.3691 16.4862 13.2253 16.3424C13.0816 16.1986 13.0097 16.0204 13.0097 15.8078C13.0097 15.5952 13.0816 15.4171 13.2253 15.2735C13.3691 15.13 13.5472 15.0582 13.7597 15.0582H20.7597C20.9722 15.0582 21.1503 15.1301 21.2941 15.2739C21.4378 15.4177 21.5097 15.5959 21.5097 15.8085C21.5097 16.0211 21.4378 16.1992 21.2941 16.3427C21.1503 16.4863 20.9722 16.5581 20.7597 16.5581H13.7597ZM13.7597 8.94276C13.5472 8.94276 13.3691 8.87085 13.2253 8.72704C13.0816 8.58324 13.0097 8.40504 13.0097 8.19244C13.0097 7.97985 13.0816 7.80177 13.2253 7.65819C13.3691 7.5146 13.5472 7.44281 13.7597 7.44281H20.7597C20.9722 7.44281 21.1503 7.51471 21.2941 7.65851C21.4378 7.80233 21.5097 7.98053 21.5097 8.19311C21.5097 8.40571 21.4378 8.5838 21.2941 8.72739C21.1503 8.87097 20.9722 8.94276 20.7597 8.94276H13.7597Z"
    />
  </svg>
`;

const functionsIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M7 19v-.808L13.096 12L7 5.808V5h10v1.25H9.102L14.727 12l-5.625 5.77H17V19z"
    />
  </svg>
`;

const visibilityOffIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
  >
    <path
      d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"
    />
  </svg>
`;

const editWithAiIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M12 2l2.09 6.26L20.5 8.27l-5 3.87L17.18 18 12 14.77 6.82 18 8.5 12.14 3.5 8.27l6.41-.01L12 2z"/>
  </svg>
`;

const defaultConfig = {
  [CrepeFeature.CodeMirror]: {
    theme: oneDark,
    languages,
    expandIcon: chevronDownIcon,
    searchIcon,
    clearSearchIcon: clearIcon,
    searchPlaceholder: "Search language",
    noResultText: "No result",
    previewToggleIcon: (previewOnlyMode) => previewOnlyMode ? editIcon : visibilityOffIcon
  }
};

const FeaturesCtx = createSlice([], "FeaturesCtx");
const CrepeCtx = createSlice({}, "CrepeCtx");
function useCrepe(ctx) {
  return ctx.get("CrepeCtx");
}
function useCrepeFeatures(ctx) {
  return ctx.use("FeaturesCtx");
}
function crepeFeatureConfig(feature) {
  return (ctx) => {
    useCrepeFeatures(ctx).update((features) => {
      if (features.includes(feature)) {
        return features;
      }
      return [...features, feature];
    });
  };
}

function isInCodeBlock(selection) {
  const type = selection.$from.parent.type;
  return type.name === "code_block";
}
function isInList(selection) {
  let _a;
  const type = (_a = selection.$from.node(selection.$from.depth - 1)) == null ? void 0 : _a.type;
  return (type == null ? void 0 : type.name) === "list_item";
}

const __typeError$5 = (msg) => {
  throw TypeError(msg);
};
const __accessCheck$5 = (obj, member, msg) => member.has(obj) || __typeError$5("Cannot " + msg);
const __privateGet$5 = (obj, member, getter) => (__accessCheck$5(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
const __privateAdd$5 = (obj, member, value) => member.has(obj) ? __typeError$5("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
const __privateSet$5 = (obj, member, value, setter) => (__accessCheck$5(obj, member, "write to private field"), member.set(obj, value), value);
let _groups, _getGroupInstance;
class GroupBuilder {
  constructor() {
    __privateAdd$5(this, _groups, []);
    this.clear = () => {
      __privateSet$5(this, _groups, []);
      return this;
    };
    __privateAdd$5(this, _getGroupInstance, (group) => {
      const groupInstance = {
        group,
        addItem: (key, item) => {
          const data = { ...item, key };
          group.items.push(data);
          return groupInstance;
        },
        clear: () => {
          group.items = [];
          return groupInstance;
        }
      };
      return groupInstance;
    });
    this.addGroup = (key, label) => {
      const items = [];
      const group = {
        key,
        label,
        items
      };
      __privateGet$5(this, _groups).push(group);
      return __privateGet$5(this, _getGroupInstance).call(this, group);
    };
    this.getGroup = (key) => {
      const group = __privateGet$5(this, _groups).find((group2) => group2.key === key);
      if (!group) throw new Error(`Group with key ${key} not found`);
      return __privateGet$5(this, _getGroupInstance).call(this, group);
    };
    this.build = () => {
      return __privateGet$5(this, _groups);
    };
  }
}
_groups = new WeakMap();
_getGroupInstance = new WeakMap();

function getGroups$1(filter, config, ctx) {
  let _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba, _ca, _da, _ea, _fa, _ga, _ha, _ia, _ja, _ka, _la, _ma, _na, _oa, _pa, _qa, _ra, _sa, _ta, _ua, _va, _wa, _xa, _ya, _za, _Aa, _Ba, _Ca, _Da, _Ea, _Fa, _Ga, _Ha, _Ia, _Ja, _Ka, _La, _Ma, _Na, _Oa, _Pa, _Qa, _Ra, _Sa, _Ta, _Ua, _Va, _Wa, _Xa, _Ya, _Za, __a, _$a, _ab, _bb, _cb, _db, _eb, _fb, _gb, _hb, _ib, _jb, _kb;
  const flags = ctx && useCrepeFeatures(ctx).get();
  const isLatexEnabled = flags == null ? void 0 : flags.includes(CrepeFeature.Latex);
  const isImageBlockEnabled = flags == null ? void 0 : flags.includes(CrepeFeature.ImageBlock);
  const isTableEnabled = flags == null ? void 0 : flags.includes(CrepeFeature.Table);
  const groupBuilder = new GroupBuilder();
  if ((config == null ? void 0 : config.textGroup) !== null) {
    const textGroup = groupBuilder.addGroup(
      "text",
      (_b = (_a = config == null ? void 0 : config.textGroup) == null ? void 0 : _a.label) != null ? _b : "Text"
    );
    if (((_c = config == null ? void 0 : config.textGroup) == null ? void 0 : _c.text) !== null) {
      textGroup.addItem("text", {
        label: (_f = (_e = (_d = config == null ? void 0 : config.textGroup) == null ? void 0 : _d.text) == null ? void 0 : _e.label) != null ? _f : "Text",
        icon: (_i = (_h = (_g = config == null ? void 0 : config.textGroup) == null ? void 0 : _g.text) == null ? void 0 : _h.icon) != null ? _i : textIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const paragraph = paragraphSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(setBlockTypeCommand.key, {
            nodeType: paragraph
          });
        }
      });
    }
    if (((_j = config == null ? void 0 : config.textGroup) == null ? void 0 : _j.h1) !== null) {
      textGroup.addItem("h1", {
        label: (_m = (_l = (_k = config == null ? void 0 : config.textGroup) == null ? void 0 : _k.h1) == null ? void 0 : _l.label) != null ? _m : "Heading 1",
        icon: (_p = (_o = (_n = config == null ? void 0 : config.textGroup) == null ? void 0 : _n.h1) == null ? void 0 : _o.icon) != null ? _p : h1Icon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const heading = headingSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(setBlockTypeCommand.key, {
            nodeType: heading,
            attrs: {
              level: 1
            }
          });
        }
      });
    }
    if (((_q = config == null ? void 0 : config.textGroup) == null ? void 0 : _q.h2) !== null) {
      textGroup.addItem("h2", {
        label: (_t = (_s = (_r = config == null ? void 0 : config.textGroup) == null ? void 0 : _r.h2) == null ? void 0 : _s.label) != null ? _t : "Heading 2",
        icon: (_w = (_v = (_u = config == null ? void 0 : config.textGroup) == null ? void 0 : _u.h2) == null ? void 0 : _v.icon) != null ? _w : h2Icon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const heading = headingSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(setBlockTypeCommand.key, {
            nodeType: heading,
            attrs: {
              level: 2
            }
          });
        }
      });
    }
    if (((_x = config == null ? void 0 : config.textGroup) == null ? void 0 : _x.h3) !== null) {
      textGroup.addItem("h3", {
        label: (_A = (_z = (_y = config == null ? void 0 : config.textGroup) == null ? void 0 : _y.h3) == null ? void 0 : _z.label) != null ? _A : "Heading 3",
        icon: (_D = (_C = (_B = config == null ? void 0 : config.textGroup) == null ? void 0 : _B.h3) == null ? void 0 : _C.icon) != null ? _D : h3Icon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const heading = headingSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(setBlockTypeCommand.key, {
            nodeType: heading,
            attrs: {
              level: 3
            }
          });
        }
      });
    }
    if (((_E = config == null ? void 0 : config.textGroup) == null ? void 0 : _E.h4) !== null) {
      textGroup.addItem("h4", {
        label: (_H = (_G = (_F = config == null ? void 0 : config.textGroup) == null ? void 0 : _F.h4) == null ? void 0 : _G.label) != null ? _H : "Heading 4",
        icon: (_K = (_J = (_I = config == null ? void 0 : config.textGroup) == null ? void 0 : _I.h4) == null ? void 0 : _J.icon) != null ? _K : h4Icon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const heading = headingSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(setBlockTypeCommand.key, {
            nodeType: heading,
            attrs: {
              level: 4
            }
          });
        }
      });
    }
    if (((_L = config == null ? void 0 : config.textGroup) == null ? void 0 : _L.h5) !== null) {
      textGroup.addItem("h5", {
        label: (_O = (_N = (_M = config == null ? void 0 : config.textGroup) == null ? void 0 : _M.h5) == null ? void 0 : _N.label) != null ? _O : "Heading 5",
        icon: (_R = (_Q = (_P = config == null ? void 0 : config.textGroup) == null ? void 0 : _P.h5) == null ? void 0 : _Q.icon) != null ? _R : h5Icon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const heading = headingSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(setBlockTypeCommand.key, {
            nodeType: heading,
            attrs: {
              level: 5
            }
          });
        }
      });
    }
    if (((_S = config == null ? void 0 : config.textGroup) == null ? void 0 : _S.h6) !== null) {
      textGroup.addItem("h6", {
        label: (_V = (_U = (_T = config == null ? void 0 : config.textGroup) == null ? void 0 : _T.h6) == null ? void 0 : _U.label) != null ? _V : "Heading 6",
        icon: (_Y = (_X = (_W = config == null ? void 0 : config.textGroup) == null ? void 0 : _W.h6) == null ? void 0 : _X.icon) != null ? _Y : h6Icon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const heading = headingSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(setBlockTypeCommand.key, {
            nodeType: heading,
            attrs: {
              level: 6
            }
          });
        }
      });
    }
    if (((_Z = config == null ? void 0 : config.textGroup) == null ? void 0 : _Z.quote) !== null) {
      textGroup.addItem("quote", {
        label: (_aa = (_$ = (__ = config == null ? void 0 : config.textGroup) == null ? void 0 : __.quote) == null ? void 0 : _$.label) != null ? _aa : "Quote",
        icon: (_da = (_ca = (_ba = config == null ? void 0 : config.textGroup) == null ? void 0 : _ba.quote) == null ? void 0 : _ca.icon) != null ? _da : quoteIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const blockquote = blockquoteSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(wrapInBlockTypeCommand.key, {
            nodeType: blockquote
          });
        }
      });
    }
    if (((_ea = config == null ? void 0 : config.textGroup) == null ? void 0 : _ea.divider) !== null) {
      textGroup.addItem("divider", {
        label: (_ha = (_ga = (_fa = config == null ? void 0 : config.textGroup) == null ? void 0 : _fa.divider) == null ? void 0 : _ga.label) != null ? _ha : "Divider",
        icon: (_ka = (_ja = (_ia = config == null ? void 0 : config.textGroup) == null ? void 0 : _ia.divider) == null ? void 0 : _ja.icon) != null ? _ka : dividerIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const hr = hrSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(addBlockTypeCommand.key, {
            nodeType: hr
          });
        }
      });
    }
  }
  if ((config == null ? void 0 : config.listGroup) !== null) {
    const listGroup = groupBuilder.addGroup(
      "list",
      (_ma = (_la = config == null ? void 0 : config.listGroup) == null ? void 0 : _la.label) != null ? _ma : "List"
    );
    if (((_na = config == null ? void 0 : config.listGroup) == null ? void 0 : _na.bulletList) !== null) {
      listGroup.addItem("bullet-list", {
        label: (_qa = (_pa = (_oa = config == null ? void 0 : config.listGroup) == null ? void 0 : _oa.bulletList) == null ? void 0 : _pa.label) != null ? _qa : "Bullet List",
        icon: (_ta = (_sa = (_ra = config == null ? void 0 : config.listGroup) == null ? void 0 : _ra.bulletList) == null ? void 0 : _sa.icon) != null ? _ta : bulletListIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const bulletList = bulletListSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(wrapInBlockTypeCommand.key, {
            nodeType: bulletList
          });
        }
      });
    }
    if (((_ua = config == null ? void 0 : config.listGroup) == null ? void 0 : _ua.orderedList) !== null) {
      listGroup.addItem("ordered-list", {
        label: (_xa = (_wa = (_va = config == null ? void 0 : config.listGroup) == null ? void 0 : _va.orderedList) == null ? void 0 : _wa.label) != null ? _xa : "Ordered List",
        icon: (_Aa = (_za = (_ya = config == null ? void 0 : config.listGroup) == null ? void 0 : _ya.orderedList) == null ? void 0 : _za.icon) != null ? _Aa : orderedListIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const orderedList = orderedListSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(wrapInBlockTypeCommand.key, {
            nodeType: orderedList
          });
        }
      });
    }
    if (((_Ba = config == null ? void 0 : config.listGroup) == null ? void 0 : _Ba.taskList) !== null) {
      listGroup.addItem("task-list", {
        label: (_Ea = (_Da = (_Ca = config == null ? void 0 : config.listGroup) == null ? void 0 : _Ca.taskList) == null ? void 0 : _Da.label) != null ? _Ea : "Task List",
        icon: (_Ha = (_Ga = (_Fa = config == null ? void 0 : config.listGroup) == null ? void 0 : _Fa.taskList) == null ? void 0 : _Ga.icon) != null ? _Ha : todoListIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const listItem = listItemSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(wrapInBlockTypeCommand.key, {
            nodeType: listItem,
            attrs: { checked: false }
          });
        }
      });
    }
  }
  if ((config == null ? void 0 : config.advancedGroup) !== null) {
    const advancedGroup = groupBuilder.addGroup(
      "advanced",
      (_Ja = (_Ia = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _Ia.label) != null ? _Ja : "Advanced"
    );
    if (((_Ka = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _Ka.image) !== null && isImageBlockEnabled) {
      advancedGroup.addItem("image", {
        label: (_Na = (_Ma = (_La = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _La.image) == null ? void 0 : _Ma.label) != null ? _Na : "Image",
        icon: (_Qa = (_Pa = (_Oa = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _Oa.image) == null ? void 0 : _Pa.icon) != null ? _Qa : imageIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const imageBlock = imageBlockSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(addBlockTypeCommand.key, {
            nodeType: imageBlock
          });
        }
      });
    }
    if (((_Ra = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _Ra.codeBlock) !== null) {
      advancedGroup.addItem("code", {
        label: (_Ua = (_Ta = (_Sa = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _Sa.codeBlock) == null ? void 0 : _Ta.label) != null ? _Ua : "Code",
        icon: (_Xa = (_Wa = (_Va = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _Va.codeBlock) == null ? void 0 : _Wa.icon) != null ? _Xa : codeIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const codeBlock = codeBlockSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(setBlockTypeCommand.key, {
            nodeType: codeBlock
          });
        }
      });
    }
    if (((_Ya = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _Ya.table) !== null && isTableEnabled) {
      advancedGroup.addItem("table", {
        label: (_$a = (__a = (_Za = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _Za.table) == null ? void 0 : __a.label) != null ? _$a : "Table",
        icon: (_cb = (_bb = (_ab = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _ab.table) == null ? void 0 : _bb.icon) != null ? _cb : tableIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const view = ctx2.get(editorViewCtx);
          commands.call(clearTextInCurrentBlockCommand.key);
          const { from } = view.state.selection;
          commands.call(addBlockTypeCommand.key, {
            nodeType: createTable(ctx2, 3, 3)
          });
          commands.call(selectTextNearPosCommand.key, {
            pos: from
          });
        }
      });
    }
    if (((_db = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _db.math) !== null && isLatexEnabled) {
      advancedGroup.addItem("math", {
        label: (_gb = (_fb = (_eb = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _eb.math) == null ? void 0 : _fb.label) != null ? _gb : "Math",
        icon: (_jb = (_ib = (_hb = config == null ? void 0 : config.advancedGroup) == null ? void 0 : _hb.math) == null ? void 0 : _ib.icon) != null ? _jb : functionsIcon,
        onRun: (ctx2) => {
          const commands = ctx2.get(commandsCtx);
          const codeBlock = codeBlockSchema.type(ctx2);
          commands.call(clearTextInCurrentBlockCommand.key);
          commands.call(addBlockTypeCommand.key, {
            nodeType: codeBlock,
            attrs: { language: "LaTex" }
          });
        }
      });
    }
  }
  (_kb = config == null ? void 0 : config.buildMenu) == null ? void 0 : _kb.call(config, groupBuilder);
  let groups = groupBuilder.build();
  if (filter) {
    groups = groups.map((group) => {
      const items2 = group.items.filter(
        (item) => item.label.toLowerCase().includes(filter.toLowerCase())
      );
      return {
        ...group,
        items: items2
      };
    }).filter((group) => group.items.length > 0);
  }
  const items = groups.flatMap((groups2) => groups2.items);
  items.forEach((item, index) => {
    Object.assign(item, { index });
  });
  groups.reduce((acc, group) => {
    const end = acc + group.items.length;
    Object.assign(group, {
      range: [acc, end]
    });
    return end;
  }, 0);
  return {
    groups,
    size: items.length
  };
}

const Menu = defineComponent({
  props: {
    ctx: {
      type: Object,
      required: true
    },
    show: {
      type: Object,
      required: true
    },
    filter: {
      type: Object,
      required: true
    },
    hide: {
      type: Function,
      required: true
    },
    config: {
      type: Object,
      required: false
    }
  },
  setup({ ctx, show, filter, hide, config }) {
    const host = ref();
    const groupInfo = computed(() => getGroups$1(filter.value, config, ctx));
    const hoverIndex = ref(0);
    const prevMousePosition = ref({ x: -999, y: -999 });
    const onPointerMove = (e) => {
      const { x, y } = e;
      prevMousePosition.value = { x, y };
    };
    watch([groupInfo, show], () => {
      const { size } = groupInfo.value;
      if (size === 0 && show.value) hide();
      else if (hoverIndex.value >= size) hoverIndex.value = 0;
    });
    const onHover = (index, after) => {
      const prevHoverIndex = hoverIndex.value;
      const next = typeof index === "function" ? index(prevHoverIndex) : index;
      after == null ? void 0 : after(next);
      hoverIndex.value = next;
    };
    const scrollToIndex = (index) => {
      let _a, _b;
      const target = (_a = host.value) == null ? void 0 : _a.querySelector(
        `[data-index="${index}"]`
      );
      const scrollRoot = (_b = host.value) == null ? void 0 : _b.querySelector(".menu-groups");
      if (!target || !scrollRoot) return;
      scrollRoot.scrollTop = target.offsetTop - scrollRoot.offsetTop;
    };
    const runByIndex = (index) => {
      const item = groupInfo.value.groups.flatMap((group) => group.items).at(index);
      if (item && ctx) item.onRun(ctx);
      hide();
    };
    const onKeydown = (e) => {
      const { size, groups } = groupInfo.value;
      if (e.key === "Escape") {
        e.preventDefault();
        hide == null ? void 0 : hide();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        return onHover(
          (index) => index < size - 1 ? index + 1 : index,
          scrollToIndex
        );
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        return onHover(
          (index) => index <= 0 ? index : index - 1,
          scrollToIndex
        );
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        return onHover((index) => {
          const group = groups.find(
            (group2) => group2.range[0] <= index && group2.range[1] > index
          );
          if (!group) return index;
          const prevGroup = groups[groups.indexOf(group) - 1];
          if (!prevGroup) return index;
          return prevGroup.range[1] - 1;
        }, scrollToIndex);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        return onHover((index) => {
          const group = groups.find(
            (group2) => group2.range[0] <= index && group2.range[1] > index
          );
          if (!group) return index;
          const nextGroup = groups[groups.indexOf(group) + 1];
          if (!nextGroup) return index;
          return nextGroup.range[0];
        }, scrollToIndex);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        runByIndex(hoverIndex.value);
      }
    };
    const getOnPointerEnter = (index) => (e) => {
      const prevPos = prevMousePosition.value;
      if (!prevPos) return;
      const { x, y } = e;
      if (x === prevPos.x && y === prevPos.y) return;
      onHover(index);
    };
    watchEffect(() => {
      const isShown = show.value;
      if (isShown) {
        window.addEventListener("keydown", onKeydown, { capture: true });
      } else {
        window.removeEventListener("keydown", onKeydown, { capture: true });
      }
    });
    onUnmounted(() => {
      window.removeEventListener("keydown", onKeydown, { capture: true });
    });
    return () => {
      return /* @__PURE__ */ h("div", { ref: host, onPointerdown: (e) => e.preventDefault() }, /* @__PURE__ */ h("nav", { class: "tab-group" }, /* @__PURE__ */ h("ul", null, groupInfo.value.groups.map((group) => /* @__PURE__ */ h(
        "li",
        {
          key: group.key,
          onPointerdown: () => onHover(group.range[0], scrollToIndex),
          class: hoverIndex.value >= group.range[0] && hoverIndex.value < group.range[1] ? "selected" : ""
        },
        group.label
      )))), /* @__PURE__ */ h("div", { class: "menu-groups", onPointermove: onPointerMove }, groupInfo.value.groups.map((group) => /* @__PURE__ */ h("div", { key: group.key, class: "menu-group" }, /* @__PURE__ */ h("h6", null, group.label), /* @__PURE__ */ h("ul", null, group.items.map((item) => /* @__PURE__ */ h(
        "li",
        {
          key: item.key,
          "data-index": item.index,
          class: hoverIndex.value === item.index ? "hover" : "",
          onPointerenter: getOnPointerEnter(item.index),
          onPointerdown: () => {
            let _a, _b;
            (_b = (_a = host.value) == null ? void 0 : _a.querySelector(`[data-index="${item.index}"]`)) == null ? void 0 : _b.classList.add("active");
          },
          onPointerup: () => {
            let _a, _b;
            (_b = (_a = host.value) == null ? void 0 : _a.querySelector(`[data-index="${item.index}"]`)) == null ? void 0 : _b.classList.remove("active");
            runByIndex(item.index);
          }
        },
        /* @__PURE__ */ h(Icon, { icon: item.icon }),
        /* @__PURE__ */ h("span", null, item.label)
      )))))));
    };
  }
});

const __typeError$4 = (msg) => {
  throw TypeError(msg);
};
const __accessCheck$4 = (obj, member, msg) => member.has(obj) || __typeError$4("Cannot " + msg);
const __privateGet$4 = (obj, member, getter) => (__accessCheck$4(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
const __privateAdd$4 = (obj, member, value) => member.has(obj) ? __typeError$4("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
const __privateSet$4 = (obj, member, value, setter) => (__accessCheck$4(obj, member, "write to private field"), member.set(obj, value), value);
let _content$3, _app$3, _filter, _slashProvider, _programmaticallyPos;
const menu = slashFactory("CREPE_MENU");
const menuAPI = $ctx(
  {
    show: () => {
    },
    hide: () => {
    }
  },
  "menuAPICtx"
);
function configureMenu(ctx, config) {
  ctx.set(menu.key, {
    view: (view) => new MenuView(ctx, view, config)
  });
}
class MenuView {
  constructor(ctx, view, config) {
    __privateAdd$4(this, _content$3);
    __privateAdd$4(this, _app$3);
    __privateAdd$4(this, _filter);
    __privateAdd$4(this, _slashProvider);
    __privateAdd$4(this, _programmaticallyPos, null);
    this.update = (view) => {
      __privateGet$4(this, _slashProvider).update(view);
    };
    this.show = (pos) => {
      __privateSet$4(this, _programmaticallyPos, pos);
      __privateGet$4(this, _filter).value = "";
      __privateGet$4(this, _slashProvider).show();
    };
    this.hide = () => {
      __privateSet$4(this, _programmaticallyPos, null);
      __privateGet$4(this, _slashProvider).hide();
    };
    this.destroy = () => {
      __privateGet$4(this, _slashProvider).destroy();
      __privateGet$4(this, _app$3).unmount();
      __privateGet$4(this, _content$3).remove();
    };
    const content = document.createElement("div");
    content.classList.add("milkdown-slash-menu");
    const show = ref(false);
    const filter = ref("");
    __privateSet$4(this, _filter, filter);
    const hide = this.hide;
    const app = createApp(Menu, {
      ctx,
      config,
      show,
      filter,
      hide
    });
    __privateSet$4(this, _app$3, app);
    app.mount(content);
    __privateSet$4(this, _content$3, content);
    const self = this;
    __privateSet$4(this, _slashProvider, new SlashProvider({
      content: __privateGet$4(this, _content$3),
      debounce: 20,
      shouldShow(view2) {
        if (isInCodeBlock(view2.state.selection) || isInList(view2.state.selection))
          return false;
        const currentText = this.getContent(
          view2,
          (node) => ["paragraph", "heading"].includes(node.type.name)
        );
        if (currentText == null) return false;
        if (!isSelectionAtEndOfNode(view2.state.selection)) {
          return false;
        }
        const pos = __privateGet$4(self, _programmaticallyPos);
        filter.value = currentText.startsWith("/") ? currentText.slice(1) : currentText;
        if (typeof pos === "number") {
          const maxSize = view2.state.doc.nodeSize - 2;
          const validPos = Math.min(pos, maxSize);
          if (view2.state.doc.resolve(validPos).node() !== view2.state.doc.resolve(view2.state.selection.from).node()) {
            __privateSet$4(self, _programmaticallyPos, null);
            return false;
          }
          return true;
        }
        if (!currentText.startsWith("/")) return false;
        return true;
      },
      offset: 10
    }));
    __privateGet$4(this, _slashProvider).onShow = () => {
      show.value = true;
    };
    __privateGet$4(this, _slashProvider).onHide = () => {
      show.value = false;
    };
    this.update(view);
    ctx.set(menuAPI.key, {
      show: (pos) => this.show(pos),
      hide: () => this.hide()
    });
  }
}
_content$3 = new WeakMap();
_app$3 = new WeakMap();
_filter = new WeakMap();
_slashProvider = new WeakMap();
_programmaticallyPos = new WeakMap();
function isSelectionAtEndOfNode(selection) {
  if (!(selection instanceof TextSelection)) return false;
  const { $head } = selection;
  const parent = $head.parent;
  const offset = $head.parentOffset;
  return offset === parent.content.size;
}

const BlockHandle = defineComponent({
  props: {
    onAdd: {
      type: Function,
      required: true
    },
    addIcon: {
      type: String,
      required: true
    },
    handleIcon: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const addButton = ref();
    return () => {
      return /* @__PURE__ */ h(Fragment, null, /* @__PURE__ */ h(
        "div",
        {
          ref: addButton,
          class: "operation-item",
          onPointerdown: (e) => {
            let _a;
            e.preventDefault();
            e.stopPropagation();
            (_a = addButton.value) == null ? void 0 : _a.classList.add("active");
          },
          onPointerup: (e) => {
            let _a;
            e.preventDefault();
            e.stopPropagation();
            (_a = addButton.value) == null ? void 0 : _a.classList.remove("active");
            props.onAdd();
          }
        },
        /* @__PURE__ */ h(Icon, { icon: props.addIcon })
      ), /* @__PURE__ */ h("div", { class: "operation-item" }, /* @__PURE__ */ h(Icon, { icon: props.handleIcon })));
    };
  }
});

const __typeError$3 = (msg) => {
  throw TypeError(msg);
};
const __accessCheck$3 = (obj, member, msg) => member.has(obj) || __typeError$3("Cannot " + msg);
const __privateGet$3 = (obj, member, getter) => (__accessCheck$3(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
const __privateAdd$3 = (obj, member, value) => member.has(obj) ? __typeError$3("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
const __privateSet$3 = (obj, member, value, setter) => (__accessCheck$3(obj, member, "write to private field"), member.set(obj, value), value);
let _content$2, _provider$1, _app$2, _ctx;
class BlockHandleView {
  constructor(ctx, config) {
    __privateAdd$3(this, _content$2);
    __privateAdd$3(this, _provider$1);
    __privateAdd$3(this, _app$2);
    __privateAdd$3(this, _ctx);
    this.update = () => {
      __privateGet$3(this, _provider$1).update();
    };
    this.destroy = () => {
      __privateGet$3(this, _provider$1).destroy();
      __privateGet$3(this, _content$2).remove();
      __privateGet$3(this, _app$2).unmount();
    };
    this.onAdd = () => {
      const ctx = __privateGet$3(this, _ctx);
      const view = ctx.get(editorViewCtx);
      if (!view.hasFocus()) view.focus();
      const { state, dispatch } = view;
      const active = __privateGet$3(this, _provider$1).active;
      if (!active) return;
      const $pos = active.$pos;
      const pos = $pos.pos + active.node.nodeSize;
      let tr = state.tr.insert(pos, paragraphSchema.type(ctx).create());
      tr = tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
      dispatch(tr.scrollIntoView());
      __privateGet$3(this, _provider$1).hide();
      ctx.get(menuAPI.key).show(tr.selection.from);
    };
    let _a, _b;
    __privateSet$3(this, _ctx, ctx);
    const content = document.createElement("div");
    content.classList.add("milkdown-block-handle");
    const app = createApp(BlockHandle, {
      onAdd: this.onAdd,
      addIcon: (_a = config == null ? void 0 : config.handleAddIcon) != null ? _a : plusIcon,
      handleIcon: (_b = config == null ? void 0 : config.handleDragIcon) != null ? _b : menuIcon
    });
    app.mount(content);
    __privateSet$3(this, _app$2, app);
    __privateSet$3(this, _content$2, content);
    __privateSet$3(this, _provider$1, new BlockProvider({
      ctx,
      content,
      getOffset: () => 16,
      getPlacement: ({ active, blockDom }) => {
        if (active.node.type.name === "heading") return "left";
        let totalDescendant = 0;
        active.node.descendants((node) => {
          totalDescendant += node.childCount;
        });
        const dom = active.el;
        const domRect = dom.getBoundingClientRect();
        const handleRect = blockDom.getBoundingClientRect();
        const style = window.getComputedStyle(dom);
        const paddingTop = Number.parseInt(style.paddingTop, 10) || 0;
        const paddingBottom = Number.parseInt(style.paddingBottom, 10) || 0;
        const height = domRect.height - paddingTop - paddingBottom;
        const handleHeight = handleRect.height;
        return totalDescendant > 2 || handleHeight < height ? "left-start" : "left";
      }
    }));
    this.update();
  }
}
_content$2 = new WeakMap();
_provider$1 = new WeakMap();
_app$2 = new WeakMap();
_ctx = new WeakMap();
function configureBlockHandle(ctx, config) {
  ctx.set(blockConfig.key, {
    filterNodes: (pos) => {
      const filter = findParent(
        (node) => ["table", "blockquote", "math_inline"].includes(node.type.name)
      )(pos);
      if (filter) return false;
      return true;
    }
  });
  ctx.set(block.key, {
    view: () => new BlockHandleView(ctx, config)
  });
}

const blockEdit = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.BlockEdit)).config((ctx) => configureBlockHandle(ctx, config)).config((ctx) => configureMenu(ctx, config)).use(menuAPI).use(block).use(menu);
};

const codeMirror = (editor, config = {}) => {
  editor.config(crepeFeatureConfig(CrepeFeature.CodeMirror)).config((ctx) => {
    const { languages = [], theme } = config;
    const extensions = [
      keymap.of(defaultKeymap.concat(indentWithTab)),
      basicSetup
    ];
    if (theme) {
      extensions.push(theme);
    }
    if (config.extensions) {
      extensions.push(...config.extensions);
    }
    ctx.update(codeBlockConfig.key, (defaultConfig) => ({
      extensions,
      languages,
      expandIcon: config.expandIcon || chevronDownIcon,
      searchIcon: config.searchIcon || searchIcon,
      clearSearchIcon: config.clearSearchIcon || clearIcon,
      searchPlaceholder: config.searchPlaceholder || "Search language",
      noResultText: config.noResultText || "No result",
      renderLanguage: config.renderLanguage || defaultConfig.renderLanguage,
      renderPreview: config.renderPreview || defaultConfig.renderPreview,
      previewToggleButton: (previewOnlyMode) => {
        let _a, _b;
        const icon = ((_a = config.previewToggleIcon) == null ? void 0 : _a.call(config, previewOnlyMode)) || (previewOnlyMode ? editIcon : visibilityOffIcon);
        const text = ((_b = config.previewToggleText) == null ? void 0 : _b.call(config, previewOnlyMode)) || (previewOnlyMode ? "Edit" : "Hide");
        return [icon, text].map((v) => v.trim()).join(" ");
      },
      previewLabel: config.previewLabel || defaultConfig.previewLabel
    }));
  }).use(codeBlockComponent);
};

const cursor = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.Cursor)).config((ctx) => {
    ctx.update(dropCursorConfig.key, () => {
      let _a, _b;
      return {
        class: "crepe-drop-cursor",
        width: (_a = config == null ? void 0 : config.width) != null ? _a : 4,
        color: (_b = config == null ? void 0 : config.color) != null ? _b : false
      };
    });
  }).use(cursor$1);
  if ((config == null ? void 0 : config.virtual) === false) {
    return;
  }
  const virtualCursor = createVirtualCursor();
  editor.use($prose(() => virtualCursor));
};

const imageBlock = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.ImageBlock)).config((ctx) => {
    ctx.update(inlineImageConfig.key, (value) => {
      let _a, _b, _c, _d, _e, _f;
      return {
        uploadButton: (_a = config == null ? void 0 : config.inlineUploadButton) != null ? _a : "Upload",
        imageIcon: (_b = config == null ? void 0 : config.inlineImageIcon) != null ? _b : imageIcon,
        confirmButton: (_c = config == null ? void 0 : config.inlineConfirmButton) != null ? _c : confirmIcon,
        uploadPlaceholderText: (_d = config == null ? void 0 : config.inlineUploadPlaceholderText) != null ? _d : "or paste link",
        onUpload: (_f = (_e = config == null ? void 0 : config.inlineOnUpload) != null ? _e : config == null ? void 0 : config.onUpload) != null ? _f : value.onUpload,
        proxyDomURL: config == null ? void 0 : config.proxyDomURL
      };
    });
    ctx.update(imageBlockConfig.key, (value) => {
      let _a, _b, _c, _d, _e, _f, _g, _h;
      return {
        uploadButton: (_a = config == null ? void 0 : config.blockUploadButton) != null ? _a : "Upload file",
        imageIcon: (_b = config == null ? void 0 : config.blockImageIcon) != null ? _b : imageIcon,
        captionIcon: (_c = config == null ? void 0 : config.blockCaptionIcon) != null ? _c : captionIcon,
        confirmButton: (_d = config == null ? void 0 : config.blockConfirmButton) != null ? _d : "Confirm",
        captionPlaceholderText: (_e = config == null ? void 0 : config.blockCaptionPlaceholderText) != null ? _e : "Write Image Caption",
        uploadPlaceholderText: (_f = config == null ? void 0 : config.blockUploadPlaceholderText) != null ? _f : "or paste link",
        onUpload: (_h = (_g = config == null ? void 0 : config.blockOnUpload) != null ? _g : config == null ? void 0 : config.onUpload) != null ? _h : value.onUpload,
        proxyDomURL: config == null ? void 0 : config.proxyDomURL
      };
    });
  }).use(imageBlockComponent).use(imageInlineComponent);
};

const blockLatexSchema = codeBlockSchema.extendSchema((prev) => {
  return (ctx) => {
    const baseSchema = prev(ctx);
    return {
      ...baseSchema,
      toMarkdown: {
        match: baseSchema.toMarkdown.match,
        runner: (state, node) => {
          let _a, _b;
          const language = (_a = node.attrs.language) != null ? _a : "";
          if (language.toLowerCase() === "latex") {
            state.addNode(
              "math",
              void 0,
              ((_b = node.content.firstChild) == null ? void 0 : _b.text) || ""
            );
          } else {
            return baseSchema.toMarkdown.runner(state, node);
          }
        }
      }
    };
  };
});

const mathInlineId = "math_inline";
const mathInlineSchema = $nodeSchema(mathInlineId, () => ({
  group: "inline",
  inline: true,
  draggable: true,
  atom: true,
  attrs: {
    value: {
      default: ""
    }
  },
  parseDOM: [
    {
      tag: `span[data-type="${mathInlineId}"]`,
      getAttrs: (dom) => {
        let _a;
        return {
          value: (_a = dom.dataset.value) != null ? _a : ""
        };
      }
    }
  ],
  toDOM: (node) => {
    const code = node.attrs.value;
    const dom = document.createElement("span");
    dom.dataset.type = mathInlineId;
    dom.dataset.value = code;
    katex.render(code, dom, {
      throwOnError: false
    });
    return dom;
  },
  parseMarkdown: {
    match: (node) => node.type === "inlineMath",
    runner: (state, node, type) => {
      state.addNode(type, { value: node.value });
    }
  },
  toMarkdown: {
    match: (node) => node.type.name === mathInlineId,
    runner: (state, node) => {
      state.addNode("inlineMath", void 0, node.attrs.value);
    }
  }
}));

const toggleLatexCommand = $command("ToggleLatex", (ctx) => {
  return () => (state, dispatch) => {
    const {
      hasNode: hasLatex,
      pos: latexPos,
      target: latexNode
    } = findNodeInSelection(state, mathInlineSchema.type(ctx));
    const { selection, doc, tr } = state;
    if (!hasLatex) {
      const text = doc.textBetween(selection.from, selection.to);
      let _tr2 = tr.replaceSelectionWith(
        mathInlineSchema.type(ctx).create({
          value: text
        })
      );
      if (dispatch) {
        dispatch(
          _tr2.setSelection(NodeSelection.create(_tr2.doc, selection.from))
        );
      }
      return true;
    }
    const { from, to } = selection;
    if (!latexNode || latexPos < 0) return false;
    let _tr = tr.delete(latexPos, latexPos + 1);
    const content = latexNode.attrs.value;
    _tr = _tr.insertText(content, latexPos);
    if (dispatch) {
      dispatch(
        _tr.setSelection(
          TextSelection.create(_tr.doc, from, to + content.length - 1)
        )
      );
    }
    return true;
  };
});

const inlineLatexTooltip = tooltipFactory("INLINE_LATEX");

const LatexTooltip = defineComponent({
  props: {
    config: {
      type: Object,
      required: true
    },
    innerView: {
      type: Object,
      required: true
    },
    updateValue: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const innerViewRef = (el) => {
      if (!el || !(el instanceof HTMLElement)) return;
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      if (props.innerView.value) {
        el.appendChild(props.innerView.value.dom);
      }
    };
    const onUpdate = (e) => {
      e.preventDefault();
      props.updateValue.value();
    };
    return () => {
      return /* @__PURE__ */ h("div", { class: "container" }, props.innerView && /* @__PURE__ */ h("div", { ref: innerViewRef }), /* @__PURE__ */ h("button", { onPointerdown: onUpdate }, /* @__PURE__ */ h(Icon, { icon: props.config.inlineEditConfirm })));
    };
  }
});

const __typeError$2 = (msg) => {
  throw TypeError(msg);
};
const __accessCheck$2 = (obj, member, msg) => member.has(obj) || __typeError$2("Cannot " + msg);
const __privateGet$2 = (obj, member, getter) => (__accessCheck$2(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
const __privateAdd$2 = (obj, member, value) => member.has(obj) ? __typeError$2("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
const __privateSet$2 = (obj, member, value, setter) => (__accessCheck$2(obj, member, "write to private field"), member.set(obj, value), value);
let _content$1, _provider, _dom, _innerView, _updateValue, _app$1, _onHide, _shouldShow;
class LatexInlineTooltip {
  constructor(ctx, view, config) {
    this.ctx = ctx;
    __privateAdd$2(this, _content$1);
    __privateAdd$2(this, _provider);
    __privateAdd$2(this, _dom);
    __privateAdd$2(this, _innerView, shallowRef(null));
    __privateAdd$2(this, _updateValue, shallowRef(() => {
    }));
    __privateAdd$2(this, _app$1);
    __privateAdd$2(this, _onHide, () => {
      if (__privateGet$2(this, _innerView).value) {
        __privateGet$2(this, _innerView).value.destroy();
        __privateGet$2(this, _innerView).value = null;
      }
    });
    __privateAdd$2(this, _shouldShow, (view) => {
      const shouldShow = () => {
        const { selection, schema } = view.state;
        if (selection.empty) return false;
        if (!(selection instanceof NodeSelection)) return false;
        const node = selection.node;
        if (node.type.name !== mathInlineId) return false;
        const textFrom = selection.from;
        const paragraph = schema.nodes.paragraph.create(
          null,
          schema.text(node.attrs.value)
        );
        const innerView = new EditorView(__privateGet$2(this, _dom), {
          state: EditorState.create({
            doc: paragraph,
            schema: new Schema({
              nodes: {
                doc: {
                  content: "block+"
                },
                paragraph: {
                  content: "inline*",
                  group: "block",
                  parseDOM: [{ tag: "p" }],
                  toDOM() {
                    return ["p", 0];
                  }
                },
                text: {
                  group: "inline"
                }
              }
            }),
            plugins: [
              keymap$1({
                "Mod-z": undo,
                "Mod-Z": redo,
                "Mod-y": redo,
                Enter: () => {
                  __privateGet$2(this, _updateValue).value();
                  return true;
                }
              })
            ]
          })
        });
        __privateGet$2(this, _innerView).value = innerView;
        __privateGet$2(this, _updateValue).value = () => {
          const { tr } = view.state;
          tr.setNodeAttribute(textFrom, "value", innerView.state.doc.textContent);
          view.dispatch(tr);
          requestAnimationFrame(() => {
            view.focus();
          });
        };
        return true;
      };
      const show = shouldShow();
      if (!show) __privateGet$2(this, _onHide).call(this);
      return show;
    });
    this.update = (view, prevState) => {
      __privateGet$2(this, _provider).update(view, prevState);
    };
    this.destroy = () => {
      __privateGet$2(this, _app$1).unmount();
      __privateGet$2(this, _provider).destroy();
      __privateGet$2(this, _content$1).remove();
    };
    const content = document.createElement("div");
    content.className = "milkdown-latex-inline-edit";
    __privateSet$2(this, _content$1, content);
    __privateSet$2(this, _app$1, createApp(LatexTooltip, {
      config,
      innerView: __privateGet$2(this, _innerView),
      updateValue: __privateGet$2(this, _updateValue)
    }));
    __privateGet$2(this, _app$1).mount(content);
    __privateSet$2(this, _provider, new TooltipProvider({
      debounce: 0,
      content: __privateGet$2(this, _content$1),
      shouldShow: __privateGet$2(this, _shouldShow),
      offset: 10,
      floatingUIOptions: {
        placement: "bottom"
      }
    }));
    __privateGet$2(this, _provider).update(view);
    __privateSet$2(this, _dom, document.createElement("div"));
  }
}
_content$1 = new WeakMap();
_provider = new WeakMap();
_dom = new WeakMap();
_innerView = new WeakMap();
_updateValue = new WeakMap();
_app$1 = new WeakMap();
_onHide = new WeakMap();
_shouldShow = new WeakMap();

const mathInlineInputRule = $inputRule(
  (ctx) => nodeRule(/(?:\$)([^$]+)(?:\$)$/, mathInlineSchema.type(ctx), {
    getAttr: (match) => {
      let _a;
      return {
        value: (_a = match[1]) != null ? _a : ""
      };
    }
  })
);
const mathBlockInputRule = $inputRule(
  (ctx) => textblockTypeInputRule(/^\$\$[\s\n]$/, codeBlockSchema.type(ctx), () => ({
    language: "LaTeX"
  }))
);

const remarkMathPlugin = $remark(
  "remarkMath",
  () => remarkMath
);
function visitMathBlock(ast) {
  return visit(
    ast,
    "math",
    (node, index, parent) => {
      const { value } = node;
      const newNode = {
        type: "code",
        lang: "LaTeX",
        value
      };
      parent.children.splice(index, 1, newNode);
    }
  );
}
const remarkMathBlockPlugin = $remark(
  "remarkMathBlock",
  () => () => visitMathBlock
);

const latex = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.Latex)).config((ctx) => {
    const flags = useCrepeFeatures(ctx).get();
    const isCodeMirrorEnabled = flags.includes(CrepeFeature.CodeMirror);
    if (!isCodeMirrorEnabled) {
      throw new Error("You need to enable CodeMirror to use LaTeX feature");
    }
    ctx.update(codeBlockConfig.key, (prev) => ({
      ...prev,
      renderPreview: (language, content) => {
        if (language.toLowerCase() === "latex" && content.length > 0) {
          return renderLatex(content, config == null ? void 0 : config.katexOptions);
        }
        const renderPreview = prev.renderPreview;
        return renderPreview(language, content);
      }
    }));
    ctx.set(inlineLatexTooltip.key, {
      view: (view) => {
        let _a;
        return new LatexInlineTooltip(ctx, view, {
          inlineEditConfirm: (_a = config == null ? void 0 : config.inlineEditConfirm) != null ? _a : confirmIcon,
          ...config
        });
      }
    });
  }).use(remarkMathPlugin).use(remarkMathBlockPlugin).use(mathInlineSchema).use(inlineLatexTooltip).use(mathInlineInputRule).use(mathBlockInputRule).use(blockLatexSchema).use(toggleLatexCommand);
};
function renderLatex(content, options) {
  const html = katex.renderToString(content, {
    ...options,
    throwOnError: false,
    displayMode: true
  });
  return html;
}

const linkTooltip = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.LinkTooltip)).config(configureLinkTooltip).config((ctx) => {
    ctx.update(linkTooltipConfig.key, (prev) => {
      let _a, _b, _c, _d, _e, _f;
      return {
        ...prev,
        linkIcon: (_a = config == null ? void 0 : config.linkIcon) != null ? _a : copyIcon,
        editButton: (_b = config == null ? void 0 : config.editButton) != null ? _b : editIcon,
        removeButton: (_c = config == null ? void 0 : config.removeButton) != null ? _c : removeIcon,
        confirmButton: (_d = config == null ? void 0 : config.confirmButton) != null ? _d : confirmIcon,
        inputPlaceholder: (_e = config == null ? void 0 : config.inputPlaceholder) != null ? _e : "Paste link...",
        onCopyLink: (_f = config == null ? void 0 : config.onCopyLink) != null ? _f : () => {
        }
      };
    });
  }).use(linkTooltipPlugin);
};

function configureListItem(ctx, config) {
  ctx.set(listItemBlockConfig.key, {
    renderLabel: ({ label, listType, checked }) => {
      let _a, _b, _c;
      if (checked == null) {
        if (listType === "bullet") return (_a = config == null ? void 0 : config.bulletIcon) != null ? _a : bulletIcon;
        return label;
      }
      if (checked) return (_b = config == null ? void 0 : config.checkBoxCheckedIcon) != null ? _b : checkBoxCheckedIcon;
      return (_c = config == null ? void 0 : config.checkBoxUncheckedIcon) != null ? _c : checkBoxUncheckedIcon;
    }
  });
}
const listItem = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.ListItem)).config((ctx) => configureListItem(ctx, config)).use(listItemBlockComponent);
};

function isDocEmpty(doc) {
  let _a;
  return doc.childCount <= 1 && !((_a = doc.firstChild) == null ? void 0 : _a.content.size);
}
function createPlaceholderDecoration(state, placeholderText) {
  const { selection } = state;
  if (!selection.empty) return null;
  const $pos = selection.$anchor;
  const node = $pos.parent;
  if (node.content.size > 0) return null;
  const inTable = findParent((node2) => node2.type.name === "table")($pos);
  if (inTable) return null;
  const before = $pos.before();
  return Decoration.node(before, before + node.nodeSize, {
    class: "crepe-placeholder",
    "data-placeholder": placeholderText
  });
}
const placeholderConfig = $ctx(
  {
    text: "Please enter...",
    mode: "block"
  },
  "placeholderConfigCtx"
);
const placeholderPlugin = $prose((ctx) => {
  return new Plugin({
    key: new PluginKey("CREPE_PLACEHOLDER"),
    props: {
      decorations: (state) => {
        let _a;
        const config = ctx.get(placeholderConfig.key);
        if (config.mode === "doc" && !isDocEmpty(state.doc)) return null;
        if (isInCodeBlock(state.selection) || isInList(state.selection))
          return null;
        const placeholderText = (_a = config.text) != null ? _a : "Please enter...";
        const deco = createPlaceholderDecoration(state, placeholderText);
        if (!deco) return null;
        return DecorationSet.create(state.doc, [deco]);
      }
    }
  });
});
const placeholder = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.Placeholder)).config((ctx) => {
    if (config) {
      ctx.update(placeholderConfig.key, (prev) => {
        return {
          ...prev,
          ...config
        };
      });
    }
  }).use(placeholderPlugin).use(placeholderConfig);
};

const table = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.Table)).config((ctx) => {
    ctx.update(tableBlockConfig.key, (defaultConfig) => ({
      ...defaultConfig,
      renderButton: (renderType) => {
        let _a, _b, _c, _d, _e, _f, _g, _h, _i;
        switch (renderType) {
          case "add_row":
            return (_a = config == null ? void 0 : config.addRowIcon) != null ? _a : plusIcon;
          case "add_col":
            return (_b = config == null ? void 0 : config.addColIcon) != null ? _b : plusIcon;
          case "delete_row":
            return (_c = config == null ? void 0 : config.deleteRowIcon) != null ? _c : removeIcon;
          case "delete_col":
            return (_d = config == null ? void 0 : config.deleteColIcon) != null ? _d : removeIcon;
          case "align_col_left":
            return (_e = config == null ? void 0 : config.alignLeftIcon) != null ? _e : alignLeftIcon;
          case "align_col_center":
            return (_f = config == null ? void 0 : config.alignCenterIcon) != null ? _f : alignCenterIcon;
          case "align_col_right":
            return (_g = config == null ? void 0 : config.alignRightIcon) != null ? _g : alignRightIcon;
          case "col_drag_handle":
            return (_h = config == null ? void 0 : config.colDragHandleIcon) != null ? _h : dragHandleIcon;
          case "row_drag_handle":
            return (_i = config == null ? void 0 : config.rowDragHandleIcon) != null ? _i : dragHandleIcon;
        }
      }
    }));
  }).use(tableBlock);
};

function getGroups(config, ctx) {
  let _a, _b, _c, _d, _e, _f, _g;
  const groupBuilder = new GroupBuilder();
  groupBuilder.addGroup("formatting", "Formatting").addItem("bold", {
    icon: (_a = config == null ? void 0 : config.boldIcon) != null ? _a : boldIcon,
    active: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      return commands.call(isMarkSelectedCommand.key, strongSchema.type(ctx2));
    },
    onRun: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      commands.call(toggleStrongCommand.key);
    }
  }).addItem("italic", {
    icon: (_b = config == null ? void 0 : config.italicIcon) != null ? _b : italicIcon,
    active: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      return commands.call(
        isMarkSelectedCommand.key,
        emphasisSchema.type(ctx2)
      );
    },
    onRun: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      commands.call(toggleEmphasisCommand.key);
    }
  }).addItem("strikethrough", {
    icon: (_c = config == null ? void 0 : config.strikethroughIcon) != null ? _c : strikethroughIcon,
    active: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      return commands.call(
        isMarkSelectedCommand.key,
        strikethroughSchema.type(ctx2)
      );
    },
    onRun: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      commands.call(toggleStrikethroughCommand.key);
    }
  });
  const functionGroup = groupBuilder.addGroup("function", "Function");
  functionGroup.addItem("code", {
    icon: (_d = config == null ? void 0 : config.codeIcon) != null ? _d : codeIcon,
    active: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      return commands.call(
        isMarkSelectedCommand.key,
        inlineCodeSchema.type(ctx2)
      );
    },
    onRun: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      commands.call(toggleInlineCodeCommand.key);
    }
  });
  const flags = ctx && useCrepeFeatures(ctx).get();
  const isLatexEnabled = flags == null ? void 0 : flags.includes(CrepeFeature.Latex);
  if (isLatexEnabled) {
    functionGroup.addItem("latex", {
      icon: (_e = config == null ? void 0 : config.latexIcon) != null ? _e : functionsIcon,
      active: (ctx2) => {
        const commands = ctx2.get(commandsCtx);
        return commands.call(
          isNodeSelectedCommand.key,
          mathInlineSchema.type(ctx2)
        );
      },
      onRun: (ctx2) => {
        const commands = ctx2.get(commandsCtx);
        commands.call(toggleLatexCommand.key);
      }
    });
  }
  functionGroup.addItem("link", {
    icon: (_f = config == null ? void 0 : config.linkIcon) != null ? _f : linkIcon,
    active: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      return commands.call(isMarkSelectedCommand.key, linkSchema.type(ctx2));
    },
    onRun: (ctx2) => {
      const commands = ctx2.get(commandsCtx);
      commands.call(toggleLinkCommand.key);
    }
  });
  (_g = config == null ? void 0 : config.buildToolbar) == null ? void 0 : _g.call(config, groupBuilder);
  return groupBuilder.build();
}

const Toolbar = defineComponent({
  props: {
    ctx: {
      type: Object,
      required: true
    },
    hide: {
      type: Function,
      required: true
    },
    show: {
      type: Object,
      required: true
    },
    selection: {
      type: Object,
      required: true
    },
    config: {
      type: Object,
      required: false
    }
  },
  setup(props) {
    const { ctx, config } = props;
    const onClick = (fn) => (e) => {
      e.preventDefault();
      ctx && fn(ctx);
    };
    function checkActive(checker) {
      props.selection.value;
      const status = ctx.get(editorCtx).status;
      if (status !== EditorStatus.Created) return false;
      return checker(ctx);
    }
    const groupInfo = computed(() => getGroups(config, ctx));
    return () => {
      return /* @__PURE__ */ h(Fragment, null, groupInfo.value.map((group) => {
        return group.items.map((item) => {
          return /* @__PURE__ */ h(
            "button",
            {
              type: "button",
              class: clsx(
                "toolbar-item",
                ctx && checkActive(item.active) && "active"
              ),
              onPointerdown: onClick(item.onRun)
            },
            /* @__PURE__ */ h(Icon, { icon: item.icon })
          );
        });
      }).reduce((acc, curr, index) => {
        if (index === 0) {
          acc.push(...curr);
        } else {
          acc.push(/* @__PURE__ */ h("div", { class: "divider" }), ...curr);
        }
        return acc;
      }, []));
    };
  }
});

const __typeError$1 = (msg) => {
  throw TypeError(msg);
};
const __accessCheck$1 = (obj, member, msg) => member.has(obj) || __typeError$1("Cannot " + msg);
const __privateGet$1 = (obj, member, getter) => (__accessCheck$1(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
const __privateAdd$1 = (obj, member, value) => member.has(obj) ? __typeError$1("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
const __privateSet$1 = (obj, member, value, setter) => (__accessCheck$1(obj, member, "write to private field"), member.set(obj, value), value);
let _tooltipProvider, _content, _app, _selection, _show;
const toolbarTooltip = tooltipFactory("CREPE_TOOLBAR");
class ToolbarView {
  constructor(ctx, view, config) {
    __privateAdd$1(this, _tooltipProvider);
    __privateAdd$1(this, _content);
    __privateAdd$1(this, _app);
    __privateAdd$1(this, _selection);
    __privateAdd$1(this, _show, ref(false));
    this.update = (view, prevState) => {
      __privateGet$1(this, _tooltipProvider).update(view, prevState);
      __privateGet$1(this, _selection).value = view.state.selection;
    };
    this.destroy = () => {
      __privateGet$1(this, _tooltipProvider).destroy();
      __privateGet$1(this, _app).unmount();
      __privateGet$1(this, _content).remove();
    };
    this.hide = () => {
      __privateGet$1(this, _tooltipProvider).hide();
    };
    const content = document.createElement("div");
    content.className = "milkdown-toolbar";
    __privateSet$1(this, _selection, shallowRef(view.state.selection));
    const app = createApp(Toolbar, {
      ctx,
      hide: this.hide,
      config,
      selection: __privateGet$1(this, _selection),
      show: __privateGet$1(this, _show)
    });
    app.mount(content);
    __privateSet$1(this, _content, content);
    __privateSet$1(this, _app, app);
    __privateSet$1(this, _tooltipProvider, new TooltipProvider({
      content: __privateGet$1(this, _content),
      debounce: 20,
      offset: 10,
      shouldShow(view2) {
        const { doc, selection } = view2.state;
        const { empty, from, to } = selection;
        const isEmptyTextBlock = !doc.textBetween(from, to).length && selection instanceof TextSelection;
        const isNotTextBlock = !(selection instanceof TextSelection);
        const activeElement = view2.dom.getRootNode().activeElement;
        const isTooltipChildren = content.contains(activeElement);
        const notHasFocus = !view2.hasFocus() && !isTooltipChildren;
        const isReadonly = !view2.editable;
        if (notHasFocus || isNotTextBlock || empty || isEmptyTextBlock || isReadonly)
          return false;
        return true;
      }
    }));
    __privateGet$1(this, _tooltipProvider).onShow = () => {
      __privateGet$1(this, _show).value = true;
    };
    __privateGet$1(this, _tooltipProvider).onHide = () => {
      __privateGet$1(this, _show).value = false;
    };
    this.update(view);
  }
}
_tooltipProvider = new WeakMap();
_content = new WeakMap();
_app = new WeakMap();
_selection = new WeakMap();
_show = new WeakMap();
const toolbar = (editor, config) => {
  editor.config(crepeFeatureConfig(CrepeFeature.Toolbar)).config((ctx) => {
    ctx.set(toolbarTooltip.key, {
      view: (view) => new ToolbarView(ctx, view, config)
    });
  }).use(toolbarTooltip);
};

function loadFeature(feature, editor, config) {
  switch (feature) {
    case CrepeFeature.CodeMirror: {
      return codeMirror(editor, config);
    }
    case CrepeFeature.ListItem: {
      return listItem(editor, config);
    }
    case CrepeFeature.LinkTooltip: {
      return linkTooltip(editor, config);
    }
    case CrepeFeature.ImageBlock: {
      return imageBlock(editor, config);
    }
    case CrepeFeature.Cursor: {
      return cursor(editor, config);
    }
    case CrepeFeature.BlockEdit: {
      return blockEdit(editor, config);
    }
    case CrepeFeature.Placeholder: {
      return placeholder(editor, config);
    }
    case CrepeFeature.Toolbar: {
      return toolbar(editor, config);
    }
    case CrepeFeature.Table: {
      return table(editor, config);
    }
    case CrepeFeature.Latex: {
      return latex(editor, config);
    }
  }
}

const __typeError = (msg) => {
  throw TypeError(msg);
};
const __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
const __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
const __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
const __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), member.set(obj, value), value);
let _editor, _rootElement, _editable;
class CrepeBuilder {
  /// The constructor of the crepe builder.
  /// You can pass configs to the builder to configure the editor.
  constructor({ root, defaultValue = "" }) {
    /// @internal
    __privateAdd(this, _editor);
    /// @internal
    __privateAdd(this, _rootElement);
    /// @internal
    __privateAdd(this, _editable, true);
    /// Add a feature to the editor.
    this.addFeature = (feature, config) => {
      feature(__privateGet(this, _editor), config);
      return this;
    };
    /// Create the editor.
    this.create = () => {
      return __privateGet(this, _editor).create();
    };
    /// Destroy the editor.
    this.destroy = () => {
      return __privateGet(this, _editor).destroy();
    };
    /// Set the readonly mode of the editor.
    this.setReadonly = (value) => {
      __privateSet(this, _editable, !value);
      __privateGet(this, _editor).action((ctx) => {
        if (__privateGet(this, _editor).status === EditorStatus.Created) {
          const view = ctx.get(editorViewCtx);
          view.setProps({
            editable: () => !value
          });
        }
      });
      return this;
    };
    /// Get the markdown content of the editor.
    this.getMarkdown = () => {
      return __privateGet(this, _editor).action(getMarkdown());
    };
    /// Register event listeners.
    this.on = (fn) => {
      if (__privateGet(this, _editor).status !== EditorStatus.Created) {
        __privateGet(this, _editor).config((ctx) => {
          const listener2 = ctx.get(listenerCtx);
          fn(listener2);
        });
        return this;
      }
      __privateGet(this, _editor).action((ctx) => {
        const listener2 = ctx.get(listenerCtx);
        fn(listener2);
      });
      return this;
    };
    let _a;
    __privateSet(this, _rootElement, (_a = typeof root === "string" ? document.querySelector(root) : root) != null ? _a : document.body);
    __privateSet(this, _editor, Editor.make().config((ctx) => {
      ctx.inject(CrepeCtx, this);
      ctx.inject(FeaturesCtx, []);
    }).config((ctx) => {
      ctx.set(rootCtx, __privateGet(this, _rootElement));
      ctx.set(defaultValueCtx, defaultValue);
      ctx.set(editorViewOptionsCtx, {
        editable: () => __privateGet(this, _editable)
      });
      ctx.update(indentConfig.key, (value) => ({
        ...value,
        size: 4
      }));
    }).use(commonmark).use(listener).use(history).use(indent).use(trailing).use(clipboard).use(gfm));
  }
  /// Get the milkdown editor instance.
  get editor() {
    return __privateGet(this, _editor);
  }
}
_editor = new WeakMap();
_rootElement = new WeakMap();
_editable = new WeakMap();

class Crepe extends CrepeBuilder {
  /// The constructor of the crepe editor.
  /// You can pass configs to the editor to configure the editor.
  /// Calling the constructor will not create the editor, you need to call `create` to create the editor.
  constructor({
    features = {},
    featureConfigs = {},
    ...crepeBuilderConfig
  }) {
    super(crepeBuilderConfig);
    const finalConfigs = defaultsDeep(featureConfigs, defaultConfig);
    const enabledFeatures = Object.entries({
      ...defaultFeatures,
      ...features
    }).filter(([, enabled]) => enabled).map(([feature]) => feature);
    enabledFeatures.forEach((feature) => {
      let config = finalConfigs[feature];
      if (feature === CrepeFeature.Toolbar) {
        const origin = config == null ? void 0 : config.buildToolbar;
        config = {
          ...config,
          buildToolbar: (builder) => {
            origin == null ? void 0 : origin(builder);
            let formatting;
            try {
              formatting = builder.getGroup("formatting");
            } catch (e) {
              formatting = builder.addGroup("formatting", "Formatting");
            }
            formatting.addItem("editWithAI", {
              icon: editWithAiIcon,
              active: () => false,
              onRun: (ctx) => {
                ctx.get(editorViewCtx).dom.dispatchEvent(
                  new CustomEvent("editwithai_clicked", { bubbles: true })
                );
              }
            });
          }
        };
      }
      loadFeature(feature, this.editor, config);
    });
  }
}
/// This is an alias for the `CrepeFeature` enum.
Crepe.Feature = CrepeFeature;

export { Crepe, CrepeBuilder, CrepeFeature, useCrepe, useCrepeFeatures };
//# sourceMappingURL=index.js.map
