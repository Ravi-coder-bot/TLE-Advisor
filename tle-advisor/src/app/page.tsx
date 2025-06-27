'use client';

import { useState } from 'react';

const tabs = ['📊 Stats', '🧠 AI Plan', '📘 Rated Problems'];

export default function HomePage() {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [aiPlan, setAIPlan] = useState('');
  const [ratedProblems, setRatedProblems] = useState<any[]>([]);
  const [error, setError] = useState('');

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setAIPlan('');
    setRatedProblems([]);

    try {
      const res = await fetch(`/api/analysis?handle=${handle}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to connect to backend.');
    }

    setLoading(false);
  };

  const fetchAIPlan = async () => {
    if (!result) return;
    const weak = result.stats.weakTopics.map((w: any) => w.tag).join(',');
    const res = await fetch(`/api/advice?handle=${handle}&weak=${weak}`);
    const data = await res.json();
    setAIPlan(data.suggestion);
  };

  const fetchRatedSet = async () => {
    const res = await fetch(`/api/problemset?min=1200&max=1500&tags=dp,greedy`);
    const data = await res.json();
    setRatedProblems(data.problems || []);
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">TLE Advisor</h1>
          <p className="text-gray-600">AI-Powered Codeforces Problem Recommendation</p>
        </header>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Enter Codeforces handle"
            className="px-4 py-2 border rounded w-full sm:w-72 text-black"
          />
          <button
            onClick={fetchAnalysis}
            disabled={!handle || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}

        {result && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 justify-center mt-6">
              {tabs.map((label, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 rounded font-medium ${
                    tab === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'
                  }`}
                  onClick={() => {
                    setTab(i);
                    if (i === 1 && !aiPlan) fetchAIPlan();
                    if (i === 2 && ratedProblems.length === 0) fetchRatedSet();
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {/* 📊 Stats Tab */}
              {tab === 0 && (
                <>
                  <h2 className="text-xl font-bold mb-4 text-center">
                    📈 Performance for <span className="text-blue-700">@{result.handle}</span>
                  </h2>

                  {/* Tag Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(result.stats.tagStats).map(
                      ([tag, data]: [string, any]) => (
                        <div
                          key={tag}
                          className="bg-white p-4 rounded-lg shadow border border-gray-200"
                        >
                          <h4 className="font-semibold capitalize mb-1">{tag}</h4>
                          <p>Solved: {data.count}</p>
                          <p className="text-sm text-gray-500">
                            Avg Rating:{' '}
                            {data.ratings.length
                              ? Math.round(data.ratingSum / data.ratings.length)
                              : 'N/A'}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Weak Topics */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">⚠️ Weak Topics</h3>
                    <ul className="list-disc list-inside text-gray-800">
                      {result.stats.weakTopics.length > 0 ? (
                        result.stats.weakTopics.map((t: any, i: number) => (
                          <li key={i}>
                            <strong className="capitalize">{t.tag}</strong> — {t.count} solved
                          </li>
                        ))
                      ) : (
                        <li>None found 🎉</li>
                      )}
                    </ul>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h3 className="text-lg font-bold mb-2">🧠 CP-31 Suggestions</h3>
                    {result.suggestions.length > 0 ? (
                      result.suggestions.map((item: any) => (
                        <div
                          key={item.tag}
                          className="mb-4 p-4 bg-white rounded shadow border"
                        >
                          <h4 className="text-lg font-semibold capitalize mb-2">
                            {item.tag}
                          </h4>
                          <ul className="list-disc list-inside text-blue-600">
                            {item.problems.map((prob: any, i: number) => (
                              <li key={i}>
                                <a
                                  href={prob.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {prob.name} ({prob.rating})
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p>No suggestions 💤</p>
                    )}
                  </div>
                </>
              )}

              {/* 🧠 AI Tab */}
              {tab === 1 && (
                <div className="bg-yellow-50 p-6 rounded shadow border border-yellow-300">
                  <h3 className="text-xl font-bold mb-2">AI’s Study Plan</h3>
                  {aiPlan ? (
                    <p className="whitespace-pre-line text-gray-800">{aiPlan}</p>
                  ) : (
                    <p className="text-gray-500">Generating...</p>
                  )}
                </div>
              )}

              {/* 📘 Rated Problems Tab */}
              {tab === 2 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">📘 Problems [1200–1500]</h3>
                  {ratedProblems.length > 0 ? (
                    <ul className="space-y-2">
                      {ratedProblems.map((p, i) => (
                        <li key={i}>
                          <a
                            href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
                            target="_blank"
                            className="text-blue-700 hover:underline"
                          >
                            {p.name} ({p.rating})
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">Loading rated problems...</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
