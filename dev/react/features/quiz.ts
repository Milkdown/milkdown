import type { DefineFeature } from '../../../packages/crepe/src/feature/shared'
import type { QuizOption, QuizAttrs } from '../types/quiz'

import { commandsCtx } from '../../../packages/kit/src/core'
import { $nodeSchema, $command, $component } from '../../../packages/utils/src'
import { QuizComponent } from '../components/quiz-component'

// Quiz node schema
export const quizSchema = $nodeSchema('quiz', () => ({
  group: 'block',
  content: '',
  atom: true,
  selectable: true,
  attrs: {
    question: { default: 'Enter your question here' },
    options: {
      default: [
        { id: '1', text: 'Option A', isCorrect: false },
        { id: '2', text: 'Option B', isCorrect: true },
        { id: '3', text: 'Option C', isCorrect: false },
      ] as QuizOption[],
    },
    selectedAnswer: { default: null },
    showResult: { default: false },
  },
  parseDOM: [
    {
      tag: 'div[data-type="quiz"]',
      getAttrs: (dom) => {
        const element = dom as HTMLElement
        return {
          question: element.dataset.question || 'Enter your question here',
          options: JSON.parse(element.dataset.options || '[]'),
          selectedAnswer: element.dataset.selectedAnswer || null,
          showResult: element.dataset.showResult === 'true',
        }
      },
    },
  ],
  toDOM: (node) => [
    'div',
    {
      'data-type': 'quiz',
      'data-question': node.attrs.question,
      'data-options': JSON.stringify(node.attrs.options),
      'data-selected-answer': node.attrs.selectedAnswer || '',
      'data-show-result': node.attrs.showResult.toString(),
      class: 'milkdown-quiz',
    },
  ],
  markdown: {
    serialize: 'quiz-block',
    parse: 'quiz-block',
  },
  toMarkdown: {
    match: (node) => node.type.name === 'quiz',
    runner: (state, node) => {
      state.addNode(
        'html',
        undefined,
        `<div data-type="quiz" data-attrs='${encodeURIComponent(
          JSON.stringify({
            question: node.attrs.question,
            options: node.attrs.options,
            selectedAnswer: node.attrs.selectedAnswer,
            showResult: node.attrs.showResult,
          })
        )}'></div>`
      )
    },
  },
  fromMarkdown: {
    match: (node) =>
      node.type === 'html' &&
      typeof node.value === 'string' &&
      node.value.includes('data-type="quiz"'),
    runner: (state, node, type) => {
      if (typeof node.value === 'string') {
        const match = node.value.match(/data-attrs='([^']+)'/)
        const attrs = match ? JSON.parse(decodeURIComponent(match[1])) : {}
        state.addNode(type, attrs)
      }
    },
  },
  parseMarkdown: {
    match: (node) =>
      node.type === 'html' &&
      typeof node.value === 'string' &&
      node.value.includes('data-type="quiz"'),
    runner: (state, node, type) => {
      if (typeof node.value === 'string') {
        const match = node.value.match(/data-attrs='([^']+)'/)
        const attrs = match ? JSON.parse(decodeURIComponent(match[1])) : {}
        state.addNode(type, attrs)
      }
    },
  },
}))

// Command to insert a quiz
export const insertQuizCommand = $command(
  'InsertQuiz',
  (ctx) => (attrs?: Partial<QuizAttrs>) => {
    return (state, dispatch) => {
      const quizType = quizSchema.type(ctx)
      const { tr, selection } = state
      const patchAttrs =
        typeof attrs === 'object' && attrs !== null ? attrs : {}

      const quizNode = quizType.create({
        question: 'What is the correct answer?',
        options: [
          { id: '1', text: 'Option A', isCorrect: false },
          { id: '2', text: 'Option B', isCorrect: true },
          { id: '3', text: 'Option C', isCorrect: false },
          { id: '4', text: 'Option D', isCorrect: false },
        ],
        selectedAnswer: null,
        showResult: false,
        ...patchAttrs,
      })

      // If selection is inside a paragraph, replace the parent block
      const $from = selection.$from
      const parent = $from.node($from.depth)
      if (parent.type.name === 'paragraph') {
        const pos = $from.before($from.depth)
        if (dispatch) {
          dispatch(tr.replaceWith(pos, pos + parent.nodeSize, quizNode))
        }
        return true
      }

      if (dispatch) {
        dispatch(tr.replaceSelectionWith(quizNode))
      }
      return true
    }
  }
)

// Quiz component registration
export const quizComponent = $component('quiz', (ctx) => {
  return {
    component: QuizComponent,
    as: 'div',
    shouldUpdate: (prev, next) => prev.attrs !== next.attrs,
  }
})

// Quiz feature that registers everything
export const quizFeature: DefineFeature = (editor) => {
  editor.use(quizSchema).use(insertQuizCommand).use(quizComponent)
}

// Custom slash menu builder function
export const customSlashMenu = (builder: any) => {
  builder.addGroup('custom', 'Custom').addItem('quiz', {
    label: 'Quiz',
    icon: '<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect width="20" height="20" rx="4" fill="#FFD600"/><text x="10" y="15" text-anchor="middle" font-size="12" fill="#222">Quiz</text></svg>',
    onRun: (ctx: any) => {
      const commands = ctx.get(commandsCtx)
      commands.call(insertQuizCommand.key)
    },
  })
}

export type { QuizOption, QuizAttrs }
