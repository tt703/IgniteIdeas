import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/client'

export default function LandingPage() {
  const [trending, setTrending] = useState([])

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const res = await API.get('/api/ideas/', { params: { trending: true, limit: 3 } })
        setTrending(res.data || [])
      } catch (err) {
        console.error('Failed to load trending ideas', err)
      }
    }
    loadTrending()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Hero Section */}
      <section className="px-6 md:px-16 py-10 md:py-16 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-600 mb-3">Ignite Ideas</h1>
          <h3 className="text-xl md:text-2xl text-gray-700 font-medium mb-4">Light your fire, inspire your campus </h3>
          <p className="text-gray-600 max-w-2xl">
            Ignite is a space where Vossies can share innovative ideas, collaborate with peers, 
            and highlight the best sparks that shape the future of our community.
          </p>

          <div className="mt-6 flex gap-4">
            <Link to="/register" className="px-5 py-2.5 rounded bg-orange-600 hover:bg-orange-700 text-white font-medium transition-all">
              Get Started
            </Link>
            <Link to="/home" className="px-5 py-2.5 rounded border border-orange-600 text-orange-600 hover:bg-orange-50 font-medium transition-all">
              Browse Ideas
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="px-6 md:px-16 py-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-600">🔥 Trending Ideas</h2>

          {trending.length === 0 ? (
            <p className="text-gray-500">No trending ideas yet. Be the first to start something amazing!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white rounded-xl shadow hover:shadow-md transition-all border border-gray-100 p-5"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{idea.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{idea.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>💡 {idea.category_name || 'General'}</span>
                    <span>❤️ {idea.votes ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 md:px-16 bg-white border-t text-sm text-gray-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} Ignite Ideas. Built by Vossies, for Vossies.</p>
        </div>
      </footer>
    </div>
  )
}
