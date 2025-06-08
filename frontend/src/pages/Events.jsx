import React from "react";
import { useState } from "react";

import Discover from "../components/events/Discover.jsx";

import EventsLogo from "../assets/logos/eventlogo.jsx";
import MyEvents from "../components/events/MyEvents.jsx";
import Host from "../components/events/hostEvent.jsx";

export default function Events() {
  const [events, setEvents] = useState("discover");

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <EventsLogo className="text-3xl sm:text-4xl text-[#4B9CD3]" />
        <h1 className="text-2xl sm:text-4xl font-bold text-black px-0.5">Fitness Events</h1>
      </div>
    
      <p className="text-gray-700 mt-2 text-sm sm:text-lg">
        Discover, join, and track fitness events in your community. Participate
        in challenges, competitions, and group activities
      </p>
      <div className="flex justify-between items-center gap-3 mt-5 text-xs sm:text-sm">
        <div className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out"
        onClick={() => setEvents("discover")}>
          Discover Events
        </div>
        <div
          className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
        onClick={() => setEvents("my")}
        >
          My Events
        </div>
        <div
          className="flex-1 px-2 py-2 sm:py-3 bg-white rounded-lg text-center font-medium text-gray-800 shadow hover:shadow-md transition-all duration-200 ease-in-out cursor-pointer"
           onClick={() => setEvents("host")}
        >
          Host Events
        </div>
      </div>
      
      <div className="eventsBody">
        {events === "discover" ? (
          <Discover />
        ) : events === "my" ? (
          <MyEvents />
        ) : (
          <Host />
        )}
      </div>
    </div>
  );
}
