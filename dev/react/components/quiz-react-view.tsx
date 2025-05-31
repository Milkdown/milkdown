import React from 'react'

import type { QuizOption } from '../types/quiz'

interface QuizReactViewProps {
  question: string
  options: QuizOption[]
  selectedAnswer: string | null
  showResult: boolean
  onSelect: (id: string) => void
  onEdit: () => void
  isSelected: boolean
}

export function QuizReactView({
  question,
  options,
  selectedAnswer,
  showResult,
  onSelect,
  onEdit,
  isSelected,
}: QuizReactViewProps) {
  return (
    <div
      className="quiz-component"
      style={{
        border: '2px solid #e1e5e9',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: isSelected ? '#f8f9fa' : '#fff',
        borderColor: isSelected ? '#007bff' : '#e1e5e9',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        className="quiz-question"
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '12px',
          color: '#333',
        }}
      >
        {question}
      </div>

      <div className="quiz-options">
        {options.map((option) => (
          <div
            key={option.id}
            className={`quiz-option${selectedAnswer === option.id ? ' selected' : ''}`}
            style={{
              padding: '10px',
              margin: '4px 0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor:
                selectedAnswer === option.id ? '#e3f2fd' : '#fff',
              borderColor: selectedAnswer === option.id ? '#2196f3' : '#ddd',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={() => onSelect(option.id)}
          >
            <span
              style={{
                marginRight: '8px',
                color: selectedAnswer === option.id ? '#2196f3' : '#666',
              }}
            >
              {selectedAnswer === option.id ? '●' : '○'}
            </span>
            {option.text}
            {showResult && option.isCorrect && (
              <span
                style={{
                  marginLeft: 'auto',
                  color: '#4caf50',
                  fontWeight: 'bold',
                }}
              >
                ✓
              </span>
            )}
          </div>
        ))}
      </div>

      {showResult && (
        <div
          className="quiz-result"
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: '#e8f5e8',
            borderRadius: '4px',
            color: '#2e7d32',
            fontWeight: 'bold',
          }}
        >
          Correct answer:{' '}
          {options
            .filter((o) => o.isCorrect)
            .map((o) => o.text)
            .join(', ')}
        </div>
      )}

      {isSelected && (
        <button
          className="quiz-edit-btn"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Edit Quiz
        </button>
      )}
    </div>
  )
}
