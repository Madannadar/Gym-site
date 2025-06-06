import {useState} from "react";




export default function Community() {
  const [days, setDays] = useState(1);
  
  const communtiyLeaderboard1 = [
    { rank: 1, name: "Donald Trump", hours: 70, avatar: "👤", medal: "🥇" ,days: 1},
    { rank: 2, name: "Kamala Harris", hours: 69, avatar: "👩‍🦳", medal: "🥈",days: 2 },
    { rank: 3, name: "JD Vance", hours: 68, avatar: "🧔", medal: "🥉",days: 3 },
    { rank: 4, name: "Ron", hours: 65, avatar: "🧔", medal: "" },
    { rank: 5, name: "Barack Obama", hours: 63, avatar: "👱‍♂️", medal: "" ,days: 4},
    { rank: 6, name: "Wizard Snape", hours: 62, avatar: "🧙", medal: "" ,days: 5},
    { rank: 7, name: "Aditya Potter", hours: 60, avatar: "🎩", medal: "" ,days:6},
    { rank: 8, name: "Gini W", hours: 59, avatar: "👩‍🎓", medal: "",days: 7 },
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
    
    <div className="max-w-6xl mx-auto justify-items-center">
      <div className="flex justify-between items-center mt-4 mb-4 rounded-xl gap-2 bg-blue-100 text-xs sm:text-sm p-2 sm:p-3 sm:gap-4">
        <div className="flex 1 bg-black-300 px-2 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-200 text-center shadow hover:shadow-md transition-all duration-200 ease-in-out"
        onClick={(e) => setDays(1)}>
          1
        </div>
        <div className="flex 1 bg-black-300 px-2 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-200 text-center shadow hover:shadow-md transition-all duration-200 ease-in-out"
        onClick={(e) => setDays(2)}>
          2
        </div>
        <div className="flex 1 bg-black-300 px-2 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-200 text-center shadow hover:shadow-md transition-all duration-200 ease-in-out ">
          3
        </div>
        <div className="flex 1 bg-black-300 px-2 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-200 text-center shadow hover:shadow-md transition-all duration-200 ease-in-out ">
          4
        </div>
        <div className="flex 1 bg-black-300 px-2 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-200 text-center shadow hover:shadow-md transition-all duration-200 ease-in-out ">
          5
        </div>
        <div className="flex 1 bg-black-300 px-2 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-200 text-center shadow hover:shadow-md transition-all duration-200 ease-in-out ">
          6
        </div>
        <div className="flex 1 bg-black-300 px-2 py-2 sm:px-4 sm:py-3 rounded-lg bg-gray-200 text-center shadow hover:shadow-md transition-all duration-200 ease-in-out ">
          7
        </div>
        
      
      </div>
      <section className="community-leaderboard flex flex-col bg-[#DAECF9] items-center pb-4 rounded-3xl w-[85%] sm:w-[60%] ">
        {

            communtiyLeaderboard1.filter((person)=> person.days === days).map((person,index) => ( 
                <div className="communityCapsule flex w-[94%] bg-[white] items-center justify-between mt-[3%] mb-[0.5%] mx-[3%] rounded-[13px] " key={index}>
                    {person.rank > 3 ? (
                    <span className="medal ranks font-semibold text-xl ml-[4%] mr-0 my-[4%] ml-[7%] mr-[3%] my-[4%] md:ml-[5%] lg:text-2xl">{person.rank}</span>
                    ) : (
                    <span className="medal font-semibold text-xl ml-[4%] mr-0 my-[4%] lg:text-2xl">{person.medal}</span>
                    )}
                    <span className="avatar text-[35px] mx-[2%] my-[1%] lg:text-2xl"  >{person.avatar}</span>
                    <p className="names font-medium text-[17px] grow flex w-2/5 mb-0 lg:text-2xl">{person.name}</p>
                    <span className="hours font-semibold text-[10px] flex flex-col items-center mr-0 mr-[15px]  lg:text-lg">
                        <p className="m-0 p-0" style={{color: topRanker(index+1)}}>{person.hours}</p>
                        <p className="m-0 p-0" style={{color: topRanker(index+1)}}>hours</p>
                        
                    </span>
                </div>
            ))}
      </section>
    </div>
  );
}
