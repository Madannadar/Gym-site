import { Trash2, Pencil, Play, ChevronDown, ChevronUp } from 'lucide-react';

const RegimentCard = ({
    regiment,
    includeLogCount = true,
    workoutDetails,
    workoutNames,
    completedWorkoutIds,
    currentPlannedRegiments,
    toggleRegiment,
    expandedRegimentId,
    toggleWorkout,
    expandedWorkoutId,
    userId,
    handleDeleteRegiment,
    deletingRegiment,
    navigate,
    logCounts,
    handleMakeCurrentRegiment,
    activeRegimentId,

}) => {
    return (
        <div
            key={regiment.regiment_id}
            className={`bg-white shadow-lg rounded-xl mb-6 border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${deletingRegiment === regiment.regiment_id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }}
        >
            <div className="p-6">
                <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer group"
                    onClick={() => toggleRegiment(regiment.regiment_id)}
                >
                    <div className="flex items-center space-x-3">
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
                    </div>

                    <div className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4 italic">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                {Number(regiment.created_by) === userId ? "Created by you" : `Created by ${regiment.created_by_name || "someone"}`}
                            </span>
                            <span className="bg-blue-100 px-2 py-1 rounded-full text-xs text-blue-700">
                                Intensity: {regiment.intensity || "N/A"}
                            </span>
                            {regiment.regiment_id !== activeRegimentId && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMakeCurrentRegiment(regiment.regiment_id);
                                    }}
                                    className="ml-auto mt-2 sm:mt-0 bg-gradient-to-r from-green-300 to-green-300 hover:from-green-500 hover:to-green-400 text-green-700 px-3 py-1 text-xs rounded-full shadow-sm transition"
                                >
                                    Make Current
                                </button>
                            )}
                            {/* {regiment.regiment_id === activeRegimentId && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveCurrentRegiment();
                                    }}
                                    className="ml-auto mt-2 sm:mt-0 bg-gradient-to-r from-red-300 to-red-300 hover:from-red-500 hover:to-red-600 text-red-900 px-3 py-1 text-xs rounded-full shadow-sm transition"
                                >
                                    ❌ Remove from Current
                                </button>
                            )} */}

                            {includeLogCount && (
                                <span className="bg-green-100 px-2 py-1 rounded-full text-xs text-green-700">
                                    Logged {logCounts[regiment.regiment_id] || 0} times
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`transition-all duration-500 ease-in-out ${expandedRegimentId === regiment.regiment_id
                    ? 'max-h-[2000px] opacity-100 mt-6'
                    : 'max-h-0 opacity-0 mt-0'
                    } overflow-hidden`}>
                    {Number(regiment.created_by) === userId && (
                        <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:justify-end animate-fadeIn w-full">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/workouts/regiments/${regiment.regiment_id}`);
                                }}
                                className="w-full sm:w-auto text-center flex items-center justify-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-600 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                            >
                                <Pencil className="h-4 w-4" /> Update
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRegiment(regiment.regiment_id, regiment.created_by);
                                }}
                                className="w-full sm:w-auto text-center flex items-center justify-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-600 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    )}


                    <div className="space-y-3">
                        {regiment.workout_structure.map((day, index) => (
                            <div
                                key={day.workout_id}
                                className="transform transition-all duration-300 hover:translate-x-2"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#4B9CD3] transition-all duration-200">
                                    <div
                                        className="flex-1 cursor-pointer group"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWorkout(day.workout_id);
                                        }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <div>
                                                <p className="font-semibold text-gray-800 group-hover:text-[#4B9CD3] transition-colors duration-200">
                                                    {day.name} - {workoutNames[day.workout_id] || "Loading..."}
                                                </p>
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    {(() => {
                                                        const workout = workoutDetails[day.workout_id];
                                                        if (!workout) return <span className="text-xs">Loading...</span>;

                                                        let intensity = workout.intensity;
                                                        try {
                                                            if (typeof intensity === "string") {
                                                                intensity = JSON.parse(intensity);
                                                            }
                                                        } catch (e) {
                                                            console.warn("❌ Failed to parse intensity for workout ID", day.workout_id);
                                                            intensity = null;
                                                        }

                                                        return (
                                                            <span className="bg-blue-100 px-2 py-1 rounded-full text-xs">
                                                                Intensity: {intensity?.normalizedIntensity ?? "N/A"}
                                                            </span>
                                                        );
                                                    })()}


                                                    {completedWorkoutIds.has(`${regiment.regiment_id}-${day.workout_id}`) && (
                                                        <span className="bg-green-100 px-2 py-1 rounded-full text-xs text-green-700 animate-pulse">
                                                            ✅ Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/start-workout/${regiment.regiment_id}/${day.workout_id}`);
                                        }}
                                        disabled={
                                            currentPlannedRegiments.length > 0 &&
                                            regiment.regiment_id !== activeRegimentId
                                        }
                                        className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transform transition-all duration-200 shadow-md font-medium
                        ${currentPlannedRegiments.length > 0 &&
                                                regiment.regiment_id !== activeRegimentId
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-[#4B9CD3] to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 hover:scale-105 hover:shadow-lg"
                                            }`}>
                                        <Play className="h-4 w-4" /> Start
                                    </button>
                                </div>

                                <div className={`transition-all duration-500 ease-in-out ${expandedWorkoutId === day.workout_id
                                    ? 'max-h-[1000px] opacity-100 mt-4'
                                    : 'max-h-0 opacity-0 mt-0'
                                    } overflow-hidden`}>
                                    <div className="bg-white p-4 rounded-lg border-2 border-gray-100 shadow-inner">
                                        <h4 className="text-gray-700 font-semibold mb-3 flex items-center">
                                            <span className="w-2 h-2 bg-[#4B9CD3] rounded-full mr-2"></span>
                                            Exercises
                                        </h4>

                                        <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory scrollbar-hide py-2">
                                            {workoutDetails[day.workout_id]?.structure?.length > 0 ? (
                                                workoutDetails[day.workout_id].structure.map((exercise, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="min-w-full sm:min-w-[320px] p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-md flex-shrink-0 snap-center transform transition-all duration-300 hover:shadow-lg hover:scale-105"
                                                    >
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-[#4B9CD3] to-blue-500 rounded-full flex items-center justify-center">
                                                                <span className="text-white font-bold text-sm">{idx + 1}</span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                                                                <p className="text-[#4B9CD3] font-semibold text-lg">
                                                                    {exercise.name}
                                                                </p>
                                                                {/* <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full mt-1 sm:mt-0 sm:ml-4">
                                                                        Intensity: {
                                                                            workoutDetails[day.workout_id]?.intensity?.breakdown?.find(
                                                                                (b) => b.exercise.toLowerCase().trim() === exercise.name?.toLowerCase().trim()
                                                                            )?.exerciseTotal?.toFixed(2) ?? "N/A"
                                                                        }
                                                                    </span> */}
                                                            </div>
                                                        </div>

                                                        {exercise.sets && Object.keys(exercise.sets).length > 0 ? (
                                                            <div className="space-y-2">
                                                                {Object.values(exercise.sets).map((set, i) => {
                                                                    const parts = [];
                                                                    if (set.reps) parts.push(`${set.reps} reps`);
                                                                    if (set.weight) parts.push(`${set.weight}${exercise.weight_unit || "kg"}`);
                                                                    if (set.time) parts.push(`${set.time}${exercise.time_unit || " sec"}`);
                                                                    if (set.laps) parts.push(`${set.laps} lap${set.laps > 1 ? "s" : ""}${exercise.laps_unit ? ` of ${exercise.laps_unit}` : ""}`);

                                                                    return (
                                                                        <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                                                                            <div className="w-6 h-6 bg-[#4B9CD3] rounded-full flex items-center justify-center">
                                                                                <span className="text-white font-bold text-xs">{i + 1}</span>
                                                                            </div>
                                                                            <span className="text-sm text-gray-700">{parts.join(", ")}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 text-sm italic">No sets defined</p>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No exercises found.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegimentCard;