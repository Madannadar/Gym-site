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
      <header className="flex flex-col">
       
        <div className="flex justify-evenly bg-sky-500 w-4/5 ml-[10%] mr-[7%] mt-[5%] mb-[3%] rounded-[30px] border-[none] lg:w-[65%] lg:ml-[17%] lg:h-[40px]">
          <button
          style={{ borderRadius: "20px" }}
           className={`w-4/5 text-base rounded-full border-none transition-all duration-300 ${
            activeBut === "personal" ? "bg-white text-black" : "bg-transparent text-white"
          }`}
            onClick={() => setactiveBut("personal")}
          >
            Personal
          </button>
          <button
          style={{ borderRadius: "20px" }}
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
