import React from "react";
import { useState } from "react";
// import LeaderboardHead from "../components/leaderboards/leaderboardHead";
import Community from "../components/leaderboards/community";
import Personal from "../components/leaderboards/personal";

import LeaderboardLogo from "../assets/logos/leaderboardLogo";

export default function Leaderboards() {
  const [activeBut, setactiveBut] = useState("personal");
  
  return (
    <>
      <header className="flex flex-col items-center  mt-15">
       
        <div className="flex justify-evenly bg-sky-500 w-[80%] ml-3 mr-3 mb-[3%] rounded-[30px] border-[none] max-w-lg">
          <button
          
           className={`w-4/5 text-base rounded-full border-none transition-all duration-300 ${
            activeBut === "personal" ? "bg-white text-black" : "bg-transparent text-white"
          }`}
            onClick={() => setactiveBut("personal")}
          >
            Personal
          </button>
          <button
         
            className={`w-4/5 text-base rounded-full border-none transition-all duration-300 ${
                activeBut === "community" ? "bg-white text-black" : "bg-transparent text-white"
              }`}
            onClick={() => setactiveBut("community")}
          >
            Community
          </button>
        </div>

   
      </header>

      <section className="leaderboardBody">
        {activeBut === "personal" ? <Personal/> : <Community />}
      </section>
    </>
  );
}
