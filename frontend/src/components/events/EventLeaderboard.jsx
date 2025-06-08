import React from "react";

import { GoTriangleUp, GoTriangleDown } from "react-icons/go";
import { FaEquals } from "react-icons/fa";


export default function EventLeaderboard() {
  const eventLeaderboard = [
    { rank: 1, name: "Donald Trump", points: 70, avatar: "👤", prevRank: 5 },
    { rank: 2, name: "Kamala Harris", points: 69, avatar: "👩‍🦳", prevRank: 6 },
    { rank: 3, name: "JD Vance", points: 68, avatar: "🧔", prevRank: 3 },
    { rank: 4, name: "Ron", points: 65, avatar: "🧔", prevRank: 1 },
    { rank: 5, name: "Barack Obama", points: 63, avatar: "👱‍♂️", prevRank: 4 },
    { rank: 6, name: "Wizard Snape", points: 62, avatar: "🧙", prevRank: 2 },
    { rank: 7, name: "Aditya Potter", points: 60, avatar: "🎩", prevRank: 7 },
    { rank: 8, name: "Gini W", points: 59, avatar: "👩‍🎓", prevRank: 8 },
  ];

  return (
    <div className="p-4 pb-0 sm:p-6 max-w-lg mx-auto">
      <AllHeader title="Event Leaderboard" />
      <div className="eventBody">
        <div className="topThree h-[40vh] flex justify-evenly items-end">
          <div className="topSec w-[15%] h-full flex flex-col items-center justify-end">
            <div className="topAvatar text-[30px]">
              {eventLeaderboard[1].avatar}
            </div>
            <div
              style={{
                WebkitTextStroke: "1px rgb(48, 48, 48)",
                WebkitTextFillColor: "white",
              }}
              className="Second flex justify-center w-full rounded-t-lg text-[30px] font-bold px-1 text-white bg-gray-400 h-[50%]"
            >
              2
            </div>
          </div>
          <div className="topFir flex justify-center w-[15%] h-full flex flex-col items-center justify-end">
            <div className="topAvatar text-[30px]">
              {eventLeaderboard[0].avatar}
            </div>
            <div
              style={{
                WebkitTextStroke: "1px rgb(48, 48, 48)",
                WebkitTextFillColor: "white",
              }}
              className="First flex justify-center w-full rounded-t-lg text-[30px] font-bold px-1 text-white bg-yellow-400 h-[70%]"
            >
              1
            </div>
          </div>
          <div className="topThir  w-[15%] h-full flex flex-col items-center justify-end">
            <div className="topAvatar text-[30px]">
              {eventLeaderboard[2].avatar}
            </div>
            <div
              style={{
                WebkitTextStroke: "1px rgb(48, 48, 48)",
                WebkitTextFillColor: "white",
              }}
              className="Third flex justify-center w-full rounded-t-lg text-[30px] font-bold px-1 text-white bg-orange-600 h-[30%]"
            >
              3
            </div>
          </div>
        </div>
        <div className="eventRow bg-blue-100 rounded-t-[45px]  px-4 py-2 ">
          {eventLeaderboard.map((person, index) =>
            person.rank > 3 ? (
              <div
                className="eventCapsule bg-white my-4 mx-1 px-3 py-0 flex items-center justify-between rounded-lg"
                key={index}
              >
                <span className="medal ranks font-medium">{person.rank}</span>
                <span className="avatar text-3xl ">{person.avatar}</span>
                <span className="ptsname w-[50%]">
                  <p className="name text-left text-lg font-medium mb-0 mt-3">
                    {person.name}
                  </p>
                  <p className="pts text-left text-xs text-gray-500">
                    {person.points} points
                  </p>
                </span>
                {person.rank > person.prevRank ? (
                  <span className="updowm font-semibold text-sm flex flex-row mr-4 w-[15%] items-center justify-center">
                    <p className="mb-0">
                      +{Math.abs(person.prevRank - person.rank)}
                    </p>
                    <GoTriangleUp size={30} color="green" />
                  </span>
                ) : person.rank < person.prevRank ? (
                  <span className="updowm font-semibold text-sm flex flex-row mr-4 w-[15%] items-center justify-center">
                    <p className="mb-0">
                      -{Math.abs(person.rank - person.prevRank)}
                    </p>
                    <GoTriangleDown size={30} color="red" />
                  </span>
                ) : (
                  <span className="updowm font-semibold text-sm flex flex-row mr-4 w-[15%] items-center justify-center">
                    <FaEquals />
                  </span>
                )}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
