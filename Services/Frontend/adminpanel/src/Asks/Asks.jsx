import { useState, useEffect } from 'react'

// Mock data - would be replaced with API calls
const mockAsks = [
  { 
    id: 1, 
    question: 'Are your bamboo toothbrushes biodegradable?', 
    user: 'Sarah Johnson', 
    email: 'sarah.j@example.com', 
    date: '2023-04-15T14:32:00Z',
    status: 'Pending',
    product: 'Bamboo Toothbrush'
  },
  { 
    id: 2, 
    question: 'Is the packaging for the reusable water bottle recyclable?', 
    user: 'Michael Chen', 
    email: 'mchen@example.com', 
    date: '2023-04-14T09:17:00Z',
    status: 'Answered',
    product: 'Reusable Water Bottle',
    answer: 'Yes, our packaging is made from 100% recycled cardboard and is fully recyclable.'
  },
  { 
    id: 3, 
    question: 'How long does the solar charger take to fully charge?', 
    user: 'Emma Wilson', 
    email: 'emma.w@example.com', 
    date: '2023-04-13T16:45:00Z',
    status: 'Pending',
    product: 'Solar Powered Charger'
  },
  { 
    id: 4, 
    question: 'Are the organic cotton sheets pre-shrunk?', 
    user: 'David Brown', 
    email: 'dbrown@example.com', 
    date: '2023-04-12T11:23:00Z',
    status: 'Answered',
    product: 'Organic Cotton Sheets',
    answer: 'Our organic cotton sheets are pre-shrunk and pre-washed, so they will maintain their size after washing.'
  },
  { 
    id: 5, 
    question: 'Is the recycled glass vase dishwasher safe?', 
    user: 'Lisa Garcia', 
    email: 'lgarcia@example.com', 
    date: '2023-04-11T15:10:00Z',
    status: 'Pending',
    product: 'Recycled Glass Vase'
  },
  { 
    id: 6, 
    question: 'What materials are used in the compostable cutlery set?', 
    user: 'John Smith', 
    email: 'john.smith@example.com', 
    date: '2023-04-10T13:40:00Z',
    status: 'Answered',
    product: 'Compostable Cutlery Set',
    answer: 'Our compostable cutlery is made from corn starch and contains no plastic. It will fully decompose in a commercial composting facility within 180 days.'
  },
  { 
    id: 7, 
    question: 'How do I care for the beeswax food wraps?', 
    user: 'Amanda Taylor', 
    email: 'ataylor@example.com', 
    date: '2023-04-09T10:15:00Z',
    status: 'Pending',
    product: 'Beeswax Food Wraps'
  },
]

export default function Asks() {
  const [asks, setAsks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [answerText, setAnswerText] = useState('')
  const [answeringId, setAnsweringId] = useState(null)

  // Simulate API call
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setAsks(mockAsks)
      setLoading(false)
    }, 500)
  }, [])

  const handleAnswer = (id) => {
    setAnsweringId(id)
    setAnswerText('')
  }

  const submitAnswer = (id) => {
    if (!answerText.trim()) return
    
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
                  
                  {ask.status === 'Answered' && (
                    <div className="mt-4 rounded-md bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-700">Answer:</p>
                      <p className="mt-1 text-sm text-gray-600">{ask.answer}</p>
                    </div>
                  )}

                  {ask.status === 'Pending' && (
                    <div className="mt-4">
                      {answeringId === ask.id ? (
                        <div>
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
                              disabled={!answerText.trim()}
                              className="rounded bg-cyan-500 px-3 py-1 text-sm text-white hover:bg-cyan-600 disabled:opacity-50"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAnswer(ask.id)}
                          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
                        >
                          Answer Question
                        </button>
                      )}
                    </div>
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