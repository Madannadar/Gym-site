import React from "react";
// import "../../index.css";

export default function Personal() {
  const weeklyStats = [
    {
      label: "4+ Hours",
      description: "Intense Workout",
      color: "var(--intense)",
    },
    {
      label: "3-4 Hours",
      description: "High Intensity Workout",
      color: "var(--high)",
    },
    {
      label: "2-3 Hours",
      description: "Medium Workout",
      color: "var(--medium)",
    },
    {
      label: "1-2 Hours",
      description: "Low Intensity Workout",
      color: "var(--low)",
    },
    {
      label: "0.5-1 Hours",
      description: "Quick Workout",
      color: "var(--quick)",
    },
    {
      label: "0-0.5 Hours",
      description: "Minimal Workout",
      color: "var(--minimal)",
    },
  ];

  const weeklyActivity = [
    { day: "Monday, March 2", hours: 4, color: "#8B0000" },
    { day: "Tuesday, March 3", hours: 3.5, color: "#FF4500" },
    { day: "Wednesday, March 4", hours: 0, color: "#BEBEBE" },
    { day: "Thursday, March 5", hours: 1, color: "#32CD32" },
    { day: "Friday, March 6", hours: 2.4, color: "#FFD700" },
    { day: "Saturday, March 7", hours: 0.9, color: "#1E90FF" },
    { day: "Sunday, March 8", hours: 1.5, color: "#32CD32" },
  ];

  const findColour = (hours) => {
    if (hours <= 0.5 && hours >= 0) {
        return "var(--minimal)";
    }
    else if (hours >= 0.5 && hours < 1) {
        return "var(--quick)";
    }
    else if (hours >= 1 && hours < 2) {
        return "var(--low)";
    }
    else if (hours >= 2 && hours < 3) {
        return "var(--medium)";
    }
    else if (hours >= 3 && hours < 4) {
        return "var(--high)";
    }
    else if (hours >= 4) {
        return "var(--intense)";
    }
  }

  return (
    <div className="personal-leaderboard md:w-4/5 lg:w-[65%] flex flex-col items-center justify-center mx-auto">
      <section className="weekly-stats w-[85%] shadow-[0px_0px_5px_rgba(0,0,0,0.3)] flex flex-col mx-[10%] my-[5%] rounded-[30px] pt-[4%]">
        <p
          className="stats flex font-semibold text-xl ml-[10%] mb-2"
          style={{ fontWeight: "700" }}
        >
          Weekly Stats:
        </p>
        <div class="h_line flex w-[70%] h-px ml-[11%] bg-gray-200 mb-2"></div>
        <ul className="mb-[2%] p-6 sm:p-6">
          {weeklyStats.map((stat, index) => (
            <li key={index} className="stat-item flex items-center mb-[4%]">
              <span
                className="color-indicator h-4 w-4 rounded-full"
                style={{ backgroundColor: stat.color }}
              ></span>
              <div className="stat-info flex flex-col items-start mx-[5%] my-0">
                <strong className="text-sm">{stat.label}</strong>
                <p className="text-[10px] w-full text-[#888888] ml-[5%] m-0">
                  {stat.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section> 

      <section className="weekly-activity w-[85%] shadow-[0px_0px_5px_rgba(0,0,0,0.3)] flex flex-col mx-[10%] my-[5%] rounded-[30px] pb-2">
        <p className="stats flex font-semibold text-xl ml-[10%] mt-4 mb-[2%] " style={{ fontWeight:"700" }}>Weekly Stats:</p>
        {weeklyActivity.map((activity, key) => (
          <div key={key} className="activity-item flex flex-col items-start shadow-[1px_2px_5px_rgba(0,0,0,0.5)] mx-[5%] my-[2%] rounded-[20px] p-[2%]" style={{ backgroundColor: findColour(activity.hours) }}>
            <p className="activity-day text-[white] text-xs font-medium ml-[5%] mr-[2%] mt-[2%] mb-2">{activity.day}</p>
            <p className="workout text-[white] font-semibold ml-[5%] mr-[2%] mb-0">Workout: {activity.hours} hours</p>
          </div>
        ))}
      </section>
    </div>
  );
}
