import React, { useEffect, useState } from "react";
import { Card, Col, Row, Button } from "react-bootstrap";

import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaFilter,
  FaSearch,
} from "react-icons/fa";

export default function Discover() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterevents, setFilterevents] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/event`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  console.log(JSON.stringify(events, null, 2));

  if (loading) {
    return <p>Loading events...</p>;
  }

  const dummyEvents = [
    {
      id: 1,
      title: "CrossFit Challenge",
      category: "CrossFit",
      date: "Oct 25, 2023",
      time: "6:00 PM",
      location: "Elite Fitness Gym",
      participants: 30,
      image:
        "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Yoga & Meditation Retreat",
      category: "Yoga",
      date: "Nov 5, 2023",
      time: "8:00 AM",
      location: "Greenwood Park",
      participants: 20,
      image:
        "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Marathon Training",
      category: "Running",
      date: "Dec 10, 2023",
      time: "7:00 AM",
      location: "Cycling Tour",
      participants: 50,
      image:
        "https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const filteredEvents = dummyEvents.filter((event) =>
    event.title.toLowerCase().includes(filterevents.toLowerCase()) ||
    event.category.toLowerCase().includes(filterevents.toLowerCase())
  )
  return (
    <>
      <div className="searchandFilter">
        <div class="search-filter flex flex-col items-start gap-2 my-4 mx-7">
          <div class="search-box w-full flex items-center bg-gray-200 p-2 rounded-full mb-4">
            <FaSearch class="icon ml-1 mr-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search events by name, category..."
              class="border-none bg-transparent outline-none flex-1"
              onChange={(e) => setFilterevents(e.target.value)}
            />
          </div>
          <button class="filter-btn flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 cursor-pointer">
            <FaFilter class="icon mr-2 text-gray-500" /> Filters
          </button>
        </div>
      </div>

      <section>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Explore Events
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {
            filteredEvents.length > 0 ? (
              filteredEvents.map((events, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    className="w-full h-56 object-cover"
                    src={events.image}
                    alt={events.title}
                  />
                  <div className="p-4">
                    <h4 className="text-base font-semibold mb-2">
                      {events.title}
                    </h4>
                    <div className="grid grid-cols-2 grid-rows-2 gap-2 mb-3">
                      <div>
                        <p className="text-sm text-gray-700 flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-500" />
                          {events.date}
                        </p>
                        <p className="text-xs text-gray-500 ml-5">
                          {events.time}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-500" />
                        {events.location}
                      </p>
                      <p className="col-span-2 text-sm font-medium flex items-center gap-1 text-gray-700">
                        <FaUsers className="text-gray-500" /> 30 participants
                      </p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button className="bg-gray-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-gray-600 transition duration-200">
                        Details
                      </button>
                      <button className="bg-blue-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-blue-600 transition duration-200">
                        Join Event
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center col-span-full">
                No diet plans found matching "{filterevents}"
              </p>
            )
          }
          </div>
        </div>
      </section>
    </>
  );
}
