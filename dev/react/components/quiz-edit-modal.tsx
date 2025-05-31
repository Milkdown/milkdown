import React, { useState } from 'react'

import type { QuizOption } from '../types/quiz'

interface QuizEditModalProps {
  question: string
  options: QuizOption[]
  onSave: (question: string, options: QuizOption[]) => void
  onCancel: () => void
}

export function QuizEditModal({
  question,
  options,
  onSave,
  onCancel,
}: QuizEditModalProps) {
  const [q, setQ] = useState(question)
  const [opts, setOpts] = useState([...options])

  const updateOption = (idx: number, key: keyof QuizOption, value: any) => {
    setOpts((opts) =>
      opts.map((o, i) => (i === idx ? { ...o, [key]: value } : o))
    )
  }

  const addOption = () => {
    setOpts((opts) => [
      ...opts,
      { id: Date.now().toString(), text: '', isCorrect: false },
    ])
  }

  const removeOption = (idx: number) => {
    setOpts((opts) => opts.filter((_, i) => i !== idx))
  }

  return (
    <div
      className="quiz-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.3)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="quiz-modal"
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 8,
          minWidth: 320,
          maxWidth: 400,
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0' }}>Edit Quiz</h3>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}
          >
            Question:
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}
          >
            Options:
          </label>
          {opts.map((opt, idx) => (
            <div
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 6,
                gap: 8,
              }}
            >
              <input
                value={opt.text}
                onChange={(e) => updateOption(idx, 'text', e.target.value)}
                placeholder={`Option ${idx + 1}`}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                }}
              >
                <input
                  type="checkbox"
                  checked={!!opt.isCorrect}
                  onChange={(e) =>
                    updateOption(idx, 'isCorrect', e.target.checked)
                  }
                />
                Correct
              </label>
              <button
                onClick={() => removeOption(idx)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                title="Delete option"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            style={{
              marginTop: 8,
              padding: '8px 16px',
              border: '1px solid #007bff',
              background: '#fff',
              color: '#007bff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Add Option
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              background: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(q, opts)}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
