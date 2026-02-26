
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { EMOTION_DETAILS, ACTIVITIES } from '../constants';
import { Emotion, ActivityName } from '../types';

const StatsTab: React.FC = () => {
  const { emotionHistory, activityHistory } = useAppContext();

  const emotionCounts = emotionHistory.reduce((acc, log) => {
    acc[log.emotion] = (acc[log.emotion] || 0) + 1;
    return acc;
  }, {} as Record<Emotion, number>);

  const activityCounts = activityHistory.reduce((acc, log) => {
    acc[log.activityName] = (acc[log.activityName] || 0) + 1;
    return acc;
  }, {} as Record<ActivityName, number>);

  const totalEmotions = emotionHistory.length;
  const totalActivities = activityHistory.length;
  
  const sortedEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a) as [Emotion, number][];

  const sortedActivities = Object.entries(activityCounts)
    .sort(([, a], [, b]) => b - a) as [ActivityName, number][];

  return (
    <div className="p-4 pb-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6">Your Stats</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
          <p className="text-3xl font-bold text-indigo-500 dark:text-indigo-400">{totalEmotions}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Emotions Logged</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
          <p className="text-3xl font-bold text-purple-500 dark:text-purple-400">{totalActivities}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Activities Done</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-6">
        <h2 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-4">Emotion Distribution</h2>
        {totalEmotions > 0 ? (
          <div className="space-y-3">
            {sortedEmotions.map(([emotion, count]) => (
              <div key={emotion}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{EMOTION_DETAILS[emotion].emoji} {emotion}</span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{count} ({((count / totalEmotions) * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${EMOTION_DETAILS[emotion].color.replace('text-', 'bg-')}`} style={{ width: `${(count / totalEmotions) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No emotion data yet. Start detection on the Live tab!</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
        <h2 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-4">Activity Breakdown</h2>
        {totalActivities > 0 ? (
          <div className="space-y-2">
            {sortedActivities.map(([activityName, count]) => {
              const Icon = ACTIVITIES[activityName].icon;
              return (
              <div key={activityName} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center mr-3">
                    <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{activityName}</span>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{count}</span>
              </div>
            )})}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No activities completed. Try one from the Activities tab!</p>
        )}
      </div>
    </div>
  );
};

export default StatsTab;