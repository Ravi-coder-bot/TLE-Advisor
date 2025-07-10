'use client';

import { useState } from 'react';
import SpotlightCard from '@/components/spolightCard';

const tabs = ['Stats', ' AI Plan', ' Rated Problems'];

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
      console.log(data);
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
    
    // Create detailed topic data with average ratings
    const topicData = result.stats.weakTopics.map((weakTopic: any) => {
      // Find corresponding data in tagStats for average rating
      const tagStat = result.stats.tagStats[weakTopic.tag];
      const avgRating = tagStat && tagStat.ratings.length > 0 
        ? Math.round(tagStat.ratingSum / tagStat.ratings.length)
        : 0;
      
      return {
        tag: weakTopic.tag,
        count: weakTopic.count,
        avgRating: avgRating
      };
    });

    // Create URL parameters
    const params = new URLSearchParams({
      handle: handle,
      topics: JSON.stringify(topicData)
    });

    try {
      const res = await fetch(`/api/advice?${params.toString()}`);
      const data = await res.json();
      setAIPlan(data.suggestion);
    } catch (error) {
      console.error('Error fetching AI plan:', error);
      setAIPlan('Failed to generate AI plan. Please try again.');
    }
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
          <div className='flex items-center justify-center '>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 via-blue-400 to-pink-400 bg-clip-text text-transparent mb-2">TLE Advisor</h1>
          </div>
          
          <p className=" bg-gradient-to-r from-purple-500 via-blue-400 to-pink-400 bg-clip-text text-transparent mb-2 ">AI-Powered Codeforces Problem Recommendation</p>
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
            className="bg-gradient-to-r from-purple-500 via-blue-400 to-pink-400  hover:bg-purple-600 text-white px-5 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {error && <p className="text-red-600 text-center">{error}</p>}
        <SpotlightCard className="custom-spotlight-card text-center font-extrabold text-xl"  spotlightColor="rgba(168, 85, 247, 0.4)">
       Analyze your skills and compete in better way 
     </SpotlightCard>

        {result && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 justify-center mt-6 ">
              {tabs.map((label, i) => (
                <button
                  key={i}
                  className={`px-4 py-2  font-medium rounded-md ${
                    tab === i ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border'
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
                  <h2 className="text-xl font-bold mb-4 text-center text-neutral-600">
                     Performance for <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent mb-2 ">@{result.handle}</span>
                  </h2>

                  {/* Weak Topics */}
                {/* Weak Topics */}
<div className="mb-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
 <div className="flex items-center mb-4">
   <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
    
   </div>
   <h3 className="text-xl font-bold text-red-700">Areas for Improvement</h3>
 </div>
 
 {result.stats.weakTopics.length > 0 ? (
   <div className="grid gap-3">
     {result.stats.weakTopics.map((t: any, i: number) => {
       const tagStat = result.stats.tagStats[t.tag];
       const avgRating = tagStat && tagStat.ratings.length > 0 
         ? Math.round(tagStat.ratingSum / tagStat.ratings.length)
         : 0;
       
       return (
         <div key={i} className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:bg-white/90">
           <div className="flex items-center justify-between">
             <div className="flex items-center">
               <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
               <span className="font-semibold text-gray-800 capitalize text-lg">{t.tag}</span>
             </div>
             <div className="flex items-center space-x-2">
               <div className="bg-red-100 px-3 py-1 rounded-full">
                 <span className="text-red-700 font-medium text-sm">{t.count} solved</span>
               </div>
               <div className="bg-blue-100 px-3 py-1 rounded-full">
                 <span className="text-blue-700 font-medium text-sm">Avg: {avgRating || 'N/A'}</span>
               </div>
             </div>
           </div>
           <div className="mt-2 ml-6">
             <div className="w-full bg-red-200 rounded-full h-2">
               <div 
                 className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-300" 
                 style={{width: `${Math.min((t.count / 10) * 100, 100)}%`}}
               ></div>
             </div>
             <p className="text-xs text-gray-600 mt-1">
               Focus on practicing more {t.tag} problems
               {avgRating > 0 && ` (current average: ${avgRating})`}
             </p>
           </div>
         </div>
       );
     })}
   </div>
 ) : (
   <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
     <div className="text-4xl mb-2">🎉</div>
     <h4 className="text-lg font-semibold text-green-700 mb-1">Excellent Work!</h4>
     <p className="text-green-600">No weak areas detected. Keep up the great work!</p>
   </div>
 )}
</div>

                  {/* Suggestions */}
                  <div className='border border-neutral-500 bg-neutral-300 rounded-r-3xl p-4 mb-6 '>
                    <h3 className="text-lg font-bold mb-2 "> CP-31 Suggestions</h3>
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

                  {/* Tag Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(result.stats.tagStats).map(
                      ([tag, data]: [string, any]) => (
                        <div
                          key={tag}
                          className="bg-white p-4 rounded-lg shadow border border-purple-200"
                        >
                          <h4 className="font-semibold capitalize mb-1 text-purple-500">{tag}</h4>
                          <p className='text-neutral-500 font-extrabold'>Solved: {data.count}</p>
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
                </>
              )}

              {/* 🧠 AI Tab */}
              {tab === 1 && (
                <div className="bg-yellow-50 p-6 rounded shadow border border-yellow-300">
                  <h3 className="text-xl font-bold mb-2">AI's Study Plan</h3>
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