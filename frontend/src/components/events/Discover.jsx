import { useEffect, useState } from "react";
import { apiClient } from "../../AxiosSetup";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";

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

  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${import.meta.env.VITE_BACKEND_URL}/events`
      );

      const data = response.data.events;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when the component mounts

  useEffect(() => {
    fetchEvents();
  }, []);

  console.log(JSON.stringify(events, null, 2));

  if (loading) {
    return <p>Loading events...</p>;
  }

  const dummyEvents = [
    {
      id: 1,
      name: "CrossFit Challenge",
      category: "CrossFit",
      date: "Oct 25, 2023",
      event_time: "6:00 PM",
      event_location: "Elite Fitness Gym",
      number_of_participants: 30,
      image:
        "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "Yoga & Meditation Retreat",
      category: "Yoga",
      date: "Nov 5, 2023",
      event_time: "8:00 AM",
      event_location: "Greenwood Park",
      number_of_participants: 20,
      image:
        "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Marathon Training",
      category: "Running",
      date: "Dec 10, 2023",
      event_time: "7:00 AM",
      event_location: "Cycling Tour",
      number_of_participants: 50,
      image:
        "https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const detailModal = (eventId) => {
    const event = events.find((evt) => evt.event_id === eventId);
    setSelectedEvent(event);
    setOpen(true);
  };

  const filteredEvents = events.filter(
    (event) => event.name.toLowerCase().includes(filterevents.toLowerCase())
    //  || event.category.toLowerCase().includes(filterevents.toLowerCase())
  );

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
            {filteredEvents.length > 0 ? (
              filteredEvents.map((events, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative">
                    <img
                      className="w-full h-56 object-cover"
                      src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt={events.name}
                    />
                    {/* decide if we need category */}

                    {/* <p className="absolute top-2 right-2 bg-purple-500 text-white text-xs rounded-full px-2 py-1">
                      {events.category}
                    </p> */}
                  </div>

                  <div className="p-4">
                    <h4 className="text-base font-semibold mb-2">
                      {events.name}
                    </h4>
                    <div className="grid grid-cols-2 grid-rows-2 gap-2 mb-3">
                      <div>
                        <p className="text-sm text-gray-700 flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-500" />
                          {events.event_date
                            ? new Date(events.event_date).toDateString()
                            : ""}
                        </p>
                        <p className="text-xs text-gray-500 ml-5">
                          {events.event_time
                            ? events.event_time.slice(0, 5)
                            : "NOT DEFINED"}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 flex items-baseline gap-1">
                        <FaMapMarkerAlt className="text-gray-500" />
                        {events.event_location}
                      </p>
                      <p className="col-span-2 text-sm font-medium flex items-center gap-1 text-gray-700">
                        <FaUsers className="text-gray-500" />
                        {events.number_of_participants
                          ? events.number_of_participants
                          : 0}{" "}
                        participants
                      </p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        className="bg-gray-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-gray-600 transition duration-200"
                        onClick={() => detailModal(events.event_id)}
                      >
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
            )}
          </div>
        </div>
      </section>
      {/* Modal Component */}
      {open && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {selectedEvent.name}
            </h2>
            
            <p className="mb-2">
              <strong>Description:</strong>{" "}
              {selectedEvent.description || "Not available"}
            </p>
            
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
