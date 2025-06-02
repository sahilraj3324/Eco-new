import React, { useState, useEffect } from "react";
import axios from "axios";

const AskAdmin = () => {
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [activeTab, setActiveTab] = useState("ask");

  useEffect(() => {
    // Get user info from localStorage
    const storedUserId = localStorage.getItem("Id");
    const storedUserName = localStorage.getItem("storename") || localStorage.getItem("username") || "Vendor";
    
    if (storedUserId) {
      setUserId(storedUserId);
      setUserName(storedUserName);
      fetchQuestions(storedUserId);
    } else {
      setMessage("❌ User not found. Please login again.");
      setFetchLoading(false);
    }
  }, []);

  const fetchQuestions = async (userIdParam) => {
    try {
      const response = await axios.get(`/api/AskAdmin/user/${userIdParam}`);
      setQuestions(response.data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      if (error.response?.status !== 404) {
        setMessage("Failed to load previous questions.");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setMessage("❌ Please enter a question.");
      return;
    }

    if (!userId) {
      setMessage("❌ User not found. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const questionData = {
        userId: userId,
        userName: userName,
        question: question.trim(),
        answer: "",
        createdAt: new Date().toISOString()
      };

      const response = await axios.post("/api/AskAdmin", questionData, {
        headers: { "Content-Type": "application/json" }
      });

      setMessage("✅ Question submitted successfully! Admin will respond soon.");
      setQuestion("");
      
      // Refresh the questions list
      await fetchQuestions(userId);
      
      // Switch to history tab to show the submitted question
      setActiveTab("history");
      
    } catch (error) {
      console.error("Error submitting question:", error);
      setMessage(`❌ Failed to submit question: ${error.response?.data?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (answer) => {
    if (answer && answer.trim()) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          ✅ Answered
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
        ⏳ Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ask Admin</h1>
          <p className="text-gray-600">Have questions? Ask our admin team and get quick responses!</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              className={`py-3 px-6 text-sm font-medium transition-colors ${
                activeTab === "ask" 
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("ask")}
            >
              📝 Ask Question
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium transition-colors ${
                activeTab === "history" 
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("history")}
            >
              📋 Question History ({questions.length})
            </button>
          </div>

          {/* Ask Question Tab */}
          {activeTab === "ask" && (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question here... (e.g., How do I update my product status? What are the commission rates?)"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="6"
                    maxLength="1000"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      Be specific and clear for faster responses
                    </p>
                    <span className="text-sm text-gray-400">
                      {question.length}/1000
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Quick Tips:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Include specific product IDs or order numbers if relevant</li>
                    <li>• Describe what you've already tried</li>
                    <li>• Ask one question at a time for clearer answers</li>
                  </ul>
                </div>

                {message && (
                  <div className={`p-4 rounded-lg ${
                    message.includes("✅") 
                      ? "bg-green-50 border border-green-200 text-green-800" 
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}>
                    {message}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      loading || !question.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Question"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Question History Tab */}
          {activeTab === "history" && (
            <div className="p-6">
              {fetchLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your questions...</p>
                  </div>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">❓</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Questions Yet</h3>
                  <p className="text-gray-600 mb-4">You haven't asked any questions yet.</p>
                  <button
                    onClick={() => setActiveTab("ask")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ask Your First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Your Questions</h3>
                    <div className="text-sm text-gray-500">
                      Total: {questions.length} questions
                    </div>
                  </div>

                  {questions
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((q, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusBadge(q.answer)}
                            <span className="text-sm text-gray-500">
                              Asked on {formatDate(q.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Question */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="mr-2">❓</span>
                            Your Question:
                          </h4>
                          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                            <p className="text-gray-800">{q.question}</p>
                          </div>
                        </div>

                        {/* Answer */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="mr-2">💬</span>
                            Admin Response:
                          </h4>
                          <div className={`p-4 rounded-lg border-l-4 ${
                            q.answer && q.answer.trim() 
                              ? "bg-green-50 border-green-500" 
                              : "bg-yellow-50 border-yellow-500"
                          }`}>
                            {q.answer && q.answer.trim() ? (
                              <p className="text-gray-800">{q.answer}</p>
                            ) : (
                              <p className="text-yellow-700 italic">
                                ⏳ Waiting for admin response...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        
      </div>
    </div>
  );
};

export default AskAdmin;
