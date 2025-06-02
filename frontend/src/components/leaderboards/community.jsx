import React from "react";


export default function Community() {
  
  const communtiyLeaderboard = [
    { rank: 1, name: "Donald Trump", hours: 70, avatar: "👤", medal: "🥇" },
    { rank: 2, name: "Kamala Harris", hours: 69, avatar: "👩‍🦳", medal: "🥈" },
    { rank: 3, name: "JD Vance", hours: 68, avatar: "🧔", medal: "🥉" },
    { rank: 4, name: "Ron", hours: 65, avatar: "🧔", medal: "" },
    { rank: 5, name: "Barack Obama", hours: 63, avatar: "👱‍♂️", medal: "" },
    { rank: 6, name: "Wizard Snape", hours: 62, avatar: "🧙", medal: "" },
    { rank: 7, name: "Aditya Potter", hours: 60, avatar: "🎩", medal: "" },
    { rank: 8, name: "Gini W", hours: 59, avatar: "👩‍🎓", medal: "" },
  ];

const topRanker = (rank) => {
    if (rank === 1) {
        return "#CCAC43";
    }
    else if (rank === 2) {
        return "#9EA9B8";
    }
    else if (rank === 3) {
        return "#D54A38";
    }
}

  return (
    <div className="community flex justify-center md:w-4/5 lg:w-[65%] mx-auto">
      <section className="community-leaderboard flex flex-col bg-[#DAECF9] items-center pb-4 rounded-3xl w-[85%] ">
        {
            communtiyLeaderboard.map((person,index) => ( 
                <div className="communityCapsule flex w-[94%] bg-[white] items-center justify-between mt-[3%] mb-[0.5%] mx-[3%] rounded-[13px] " key={index}>
                    {person.rank > 3 ? (
                    <span className="medal ranks font-semibold text-xl ml-[4%] mr-0 my-[4%] ml-[7%] mr-[3%] my-[4%] md:ml-[5%] lg:text-2xl">{person.rank}</span>
                    ) : (
                    <span className="medal font-semibold text-xl ml-[4%] mr-0 my-[4%] lg:text-2xl">{person.medal}</span>
                    )}
                    <span className="avatar text-[35px] mx-[2%] my-[1%] lg:text-2xl"  >{person.avatar}</span>
                    <p className="names font-medium text-[17px] grow flex w-2/5 mb-0 lg:text-2xl">{person.name}</p>
                    <span className="hours font-semibold text-[10px] flex flex-col items-center mr-0 mr-[15px]  lg:text-lg">
                        <p className="m-0 p-0" style={{color: topRanker(person.rank)}}>{person.hours}</p>
                        <p className="m-0 p-0" style={{color: topRanker(person.rank)}}>hours</p>
                    </span>
                </div>
            ))}
      </section>
    </div>
  );
}
