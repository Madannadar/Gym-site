import { useState, useRef } from "react";
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const LogCard = ({
    regiment,
    logs,
    workoutDetails,
    toggleRegiment,
    expandedRegimentId,
    onLoadMore,
    isLoading = false,
    hasMore = true,
    displayedCount = 5
}) => {
    const [visibleIndex, setVisibleIndex] = useState(0);
    const [visibleGraphs, setVisibleGraphs] = useState({});
    const scrollRef = useRef(null);

    const toggleGraph = (logId) => {
        setVisibleGraphs((prev) => ({
            ...prev,
            [logId]: !prev[logId],
        }));
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollLeft = scrollRef.current.scrollLeft;
            const itemWidth = scrollRef.current.clientWidth;
            const newIndex = Math.round(scrollLeft / itemWidth);
            setVisibleIndex(newIndex);
        }
    };

    const handleLoadMore = () => {
        if (onLoadMore) {
            onLoadMore(regiment.regiment_id);
        }
    };

    // Get the oldest displayed log date for the message
    const getOldestLogDate = () => {
        if (logs.length === 0) return null;
        const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const oldestLog = sortedLogs[sortedLogs.length - 1];
        return new Date(oldestLog.created_at).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const IntensityVsScoreChart = ({ planned = {}, actual = {} }) => {
        const plannedScores = planned?.setScores || [];
        const actualScores = actual?.setScores || [];
        const maxLength = Math.max(plannedScores.length, actualScores.length);

        const chartData = Array.from({ length: maxLength }).map((_, i) => ({
            name: `Set ${i + 1}`,
            Planned: parseFloat(plannedScores[i]?.toFixed(2)) || 0,
            Actual: parseFloat(actualScores[i]?.toFixed(2)) || 0,
        }));

        return (
            <div className="mt-6">
                <h5 className="font-semibold text-gray-700 mb-2">
                    Per-Set Intensity: Planned vs Actual
                </h5>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                            domain={[
                                (dataMin) => Math.floor(Math.min(...plannedScores, ...actualScores)) - 1,
                                (dataMax) => Math.ceil(Math.max(...plannedScores, ...actualScores)) + 1
                            ]}
                            allowDecimals={true}
                        />
                        <Tooltip formatter={(value) => value?.toFixed(2)} />
                        <Legend />
                        <Line type="monotone" dataKey="Planned" stroke="#34D399" strokeWidth={2} dot />
                        <Line type="monotone" dataKey="Actual" stroke="#3B82F6" strokeWidth={2} dot />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div
            key={regiment.regiment_id}
            className="bg-white shadow-lg rounded-xl mb-6 border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }}
        >
            <div className="p-6">
                <div
                    className="flex items-center space-x-3 cursor-pointer group"
                    onClick={() => toggleRegiment(regiment.regiment_id)}
                >
                    <div className="transition-transform duration-300 group-hover:rotate-180">
                        {expandedRegimentId === regiment.regiment_id ? (
                            <ChevronUp className="h-5 w-5 text-[#4B9CD3]" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-[#4B9CD3]" />
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-[#4B9CD3] group-hover:text-blue-600 transition-colors duration-200">
                        {regiment.name}
                    </h2>
                    <span className="bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-700 font-medium">
                        {logs.length} logs
                    </span>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${expandedRegimentId === regiment.regiment_id
                    ? 'max-h-[2000px] opacity-100 mt-6'
                    : 'max-h-0 opacity-0 mt-0'
                    } overflow-hidden`}>
                    <div className="space-y-4">
                        {logs
                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                            .map((log, index) => (
                                <div
                                    key={log.workout_log_id}
                                    className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-white transform transition-all duration-300 hover:shadow-md hover:border-[#4B9CD3]"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex flex-wrap gap-4 mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            <span className="font-semibold text-gray-700">Date:</span>
                                            <span className="text-gray-600">
                                                {new Date(log.created_at).toLocaleString("en-IN", {
                                                    timeZone: "Asia/Kolkata",
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            <span className="font-semibold text-gray-700">Workout:</span>
                                            <span className="text-gray-600">{log.planned_workout_name}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                            <span className="font-semibold text-gray-700">Intensity:</span>
                                            <span className="bg-yellow-100 px-2 py-1 rounded-full text-sm text-yellow-700 font-medium">
                                                {parseFloat(log.score) > 0
                                                    ? parseFloat(log.score).toFixed(2)
                                                    : (log.intensity?.normalizedIntensity
                                                        ? parseFloat(log.intensity.normalizedIntensity).toFixed(2)
                                                        : "N/A")}
                                            </span>
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            <span>
                                                Time: {Math.floor(log.timee / 3600)}h {Math.floor((log.timee % 3600) / 60)}m {log.timee % 60}s
                                            </span>
                                        </div>
                                    </div>

                                    {log.actual_workout?.length > 0 ? (
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                                                <span className="w-2 h-2 bg-[#4B9CD3] rounded-full mr-2"></span>
                                                Exercises
                                            </h4>
                                            <button
                                                onClick={() => toggleGraph(log.workout_log_id)}
                                                className="text-sm text-blue-500 hover:underline mb-3"
                                            >
                                                {visibleGraphs[log.workout_log_id] ? "Show Set Details" : "Show Graph"}
                                            </button>

                                            <div
                                                ref={scrollRef}
                                                onScroll={handleScroll}
                                                className="flex overflow-x-auto space-x-4 pb-2 snap-x snap-mandatory scrollbar-hide"
                                            >
                                                {log.actual_workout.map((actualExercise, index) => {
                                                    const plannedWorkout = workoutDetails[log.planned_workout_id];
                                                    const plannedExercise = plannedWorkout?.structure?.find(
                                                        (ex) => ex.exercise_id === actualExercise.exercise_id
                                                    );
                                                    const actualExerciseName = plannedExercise?.name?.trim().toLowerCase();
                                                    const breakdown = log.intensity?.breakdown || [];

                                                    const plannedIntensity = plannedWorkout?.intensity?.breakdown?.find(
                                                        (b) => b.exercise?.trim().toLowerCase() === plannedExercise?.name?.trim().toLowerCase()
                                                    );

                                                    const actualIntensity = breakdown.find(
                                                        (b) => b.exercise?.trim().toLowerCase() === plannedExercise?.name?.trim().toLowerCase()
                                                    );

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`w-full sm:min-w-[300px] lg:min-w-[33.3333%] lg:w-1/3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm flex-shrink-0 snap-center transform transition-all duration-300 hover:shadow-md ${visibleGraphs[log.workout_log_id] ? 'sm:w-full' : 'hover:scale-105'
                                                                }`}
                                                        >
                                                            <p className="font-semibold text-[#4B9CD3] mb-3 text-lg flex items-center">
                                                                <span className="w-6 h-6 bg-[#4B9CD3] rounded-full flex items-center justify-center mr-2">
                                                                    <span className="text-white font-bold text-xs">{index + 1}</span>
                                                                </span>
                                                                {plannedExercise?.name || `Exercise ${actualExercise.exercise_id}`}
                                                            </p>

                                                            {(plannedExercise?.sets || actualExercise.sets) ? (
                                                                <>
                                                                    {visibleGraphs[log.workout_log_id] ? (
                                                                        <IntensityVsScoreChart
                                                                            planned={plannedIntensity}
                                                                            actual={actualIntensity}
                                                                        />
                                                                    ) : (
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div>
                                                                                <p className="font-semibold text-green-600 mb-2 flex items-center">
                                                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                                                    Planned
                                                                                </p>
                                                                                <div className="space-y-1">
                                                                                    {Object.entries(plannedExercise?.sets || {}).map(([setKey, set]) => (
                                                                                        <div key={setKey} className="p-2 bg-green-50 rounded-md">
                                                                                            {set.reps ? `${set.reps} reps ` : ""}
                                                                                            {set.weight ? `${set.weight}${plannedExercise.weight_unit || "kg "}` : ""}
                                                                                            {set.time ? `${set.time} sec ` : ""}
                                                                                            {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            <div>
                                                                                <p className="font-semibold text-blue-600 mb-2 flex items-center">
                                                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                                                    Actual
                                                                                </p>
                                                                                <div className="space-y-1">
                                                                                    {Object.entries(actualExercise.sets || {}).map(([setKey, set]) => (
                                                                                        <div key={setKey} className="p-2 bg-blue-50 rounded-md">
                                                                                            {set.reps ? `${set.reps} reps ` : ""}
                                                                                            {set.weight ? `${set.weight}${plannedExercise?.weight_unit || "kg "}` : ""}
                                                                                            {set.time ? `${set.time} sec ` : ""}
                                                                                            {set.laps ? `${set.laps} lap${set.laps > 1 ? "s" : ""}${plannedExercise.lap_unit ? ` (${plannedExercise.lap_unit})` : ""}` : ""}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <p className="text-gray-500 text-sm italic">No set data available</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic mt-2">
                                            No actual workout data recorded.
                                        </p>
                                    )}
                                </div>
                            ))}

                        {/* Load More Section */}
                        {logs.length > 0 && (
                            <div className="mt-6 text-center space-y-3">
                                {getOldestLogDate() && (
                                    <p className="text-sm text-gray-500">
                                        Logs loaded till {getOldestLogDate()}
                                    </p>
                                )}



                                {!hasMore && logs.length > displayedCount && (
                                    <p className="text-sm text-gray-500 font-medium">
                                        All logs have been loaded
                                    </p>
                                )}
                                {hasMore && onLoadMore && (
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#4B9CD3] to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Load More Logs
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogCard;