import React from "react";
import { useState } from "react";

import Discover from "../components/events/discover";

import AllHeader from "../components/allHeader";
import EventsLogo from "../assets/logos/eventlogo";
import MyEvents from "../components/events/myEvents";
import Host from "../components/events/hostEvent";

export default function Events() {
  const [events, setEvents] = useState("discover");

  return (
    <div className="events">
      <AllHeader title="Fitness Events" logo={<EventsLogo />} />
      {/* <EventsHead /> */}
      <p className=" pt-3 mx-4 text-left text-gray-500 text-sm font-medium">
        Discover, join, and track fitness events in your community. Participate
        in challenges, competitions, and group activities
      </p>
      <div className="flex flex-row gap-2 my-4 mx-7">
        <button
          style={{ borderRadius: "10px" }}
          className="flex-1 bg-gray-100 text-gray-500 border-2 border-gray-700 text-sm sm:(text-base p-2) md:(text-lg h-20) lg:h-13 rounded-lg hover:text-gray-800 hover:scale-105 transition-transform"
          onClick={() => setEvents("discover")}
        >
          Discover Events
        </button>
        <button
          style={{ borderRadius: "10px" }}
          className="flex-1 bg-gray-100 text-gray-500 border-2 border-gray-700 text-sm sm:(text-base py-2) md:(text-lg py-4) rounded-lg hover:text-gray-800 hover:scale-105 transition-transform"
          onClick={() => setEvents("my")}
        >
          My Events
        </button>
        <button
          style={{ borderRadius: "10px" }}
          className="flex-1 bg-gray-100 text-gray-500 border-2 border-gray-700 text-sm sm:(text-base py-2) md:(text-lg py-4) rounded-lg hover:text-gray-800 hover:scale-105 transition-transform"
          onClick={() => setEvents("host")}
        >
          Host Events
        </button>
      </div>
      <section className="eventsBody">
        {events === "discover" ? (
          <Discover />
        ) : events === "my" ? (
          <MyEvents />
        ) : (
          <Host />
        )}
      </section>
    </div>
  );
}
