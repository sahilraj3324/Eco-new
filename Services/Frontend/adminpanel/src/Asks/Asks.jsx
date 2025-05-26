import { useState, useEffect } from 'react'
import api from '../api'

export default function Asks() {
  const [asks, setAsks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [answerText, setAnswerText] = useState('')
  const [answeringId, setAnsweringId] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchAsks()
  }, [])

  const fetchAsks = async () => {
    try {
      setLoading(true)
      const data = await api.askAdmin.getAll()
      // Transform API response to match the expected structure
      const formattedAsks = data.map(ask => ({
        id: ask.id,
        question: ask.question || 'No question provided',
        user: ask.userName || 'Anonymous',
        email: ask.userEmail || 'No email provided',
        date: ask.createdAt || new Date().toISOString(),
        // Treat empty strings, "string", or null/undefined as unanswered
        status: ask.answer && ask.answer.trim() && ask.answer !== "string" ? 'Answered' : 'Pending',
        product: ask.productName || 'General Question',
        answer: ask.answer || '',
        userId: ask.userId
      }))
      setAsks(formattedAsks)
      setError(null)
    } catch (err) {
      console.error('Error fetching asks:', err)
      setError('Failed to load customer questions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (id) => {
    setAnsweringId(id)
    // Pre-fill with existing answer if any
    const ask = asks.find(a => a.id === id)
    setAnswerText(ask?.answer || '')
  }

  const submitAnswer = async (id) => {
    if (!answerText.trim()) return
    
    try {
      setUpdating(true)
      
      // Get the original question to keep it intact
      const askToUpdate = asks.find(ask => ask.id === id)
      if (!askToUpdate) return
      
      // Update only the answer, keeping the original question
      const updateData = {
        id: id,
        question: askToUpdate.question,  // Keep original question
        answer: answerText,              // Update answer
        userId: askToUpdate.userId       // Keep user ID reference
      }
      
      await api.askAdmin.update(id, updateData)
      
      // Update local state
      setAsks(asks.map(ask => {
        if (ask.id === id) {
          return {
            ...ask,
            status: 'Answered',
            answer: answerText
          }
        }
        return ask
      }))
      
      setAnsweringId(null)
      setAnswerText('')
    } catch (err) {
      console.error('Error updating answer:', err)
      alert('Failed to update answer. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const cancelAnswer = () => {
    setAnsweringId(null)
    setAnswerText('')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredAsks = asks.filter(ask => {
    const matchesSearch = 
      ask.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ask.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ask.product.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    return matchesSearch && ask.status.toLowerCase() === statusFilter.toLowerCase()
  })

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Customer Questions</h1>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAsks.length > 0 ? (
            filteredAsks.map((ask) => (
              <div key={ask.id} className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{ask.product}</span>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      ask.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {ask.status}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-4">
                  <div className="mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{ask.question}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {ask.user} • {formatDate(ask.date)}
                    </p>
                  </div>
                  
                  {answeringId === ask.id ? (
                    <div className="mt-4">
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here..."
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                        rows={3}
                      />
                      <div className="mt-3 flex justify-end space-x-2">
                        <button
                          onClick={cancelAnswer}
                          className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => submitAnswer(ask.id)}
                          disabled={!answerText.trim() || updating}
                          className="rounded bg-cyan-500 px-3 py-1 text-sm text-white hover:bg-cyan-600 disabled:opacity-50"
                        >
                          {updating ? 'Saving...' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {ask.answer && ask.answer.trim() && ask.answer !== "string" && (
                        <div className="mt-4 rounded-md bg-gray-50 p-3">
                          <p className="text-sm font-medium text-gray-700">Answer:</p>
                          <p className="mt-1 text-sm text-gray-600">{ask.answer}</p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <button
                          onClick={() => handleAnswer(ask.id)}
                          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
                        >
                          {ask.status === 'Answered' ? 'Edit Answer' : 'Answer Question'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 rounded-md bg-gray-50 p-4 text-center text-gray-500 md:col-span-2 lg:col-span-3">
              No questions found
            </div>
          )}
        </div>
      )}
    </div>
  )
} 