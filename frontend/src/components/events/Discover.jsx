import { useEffect, useState } from "react";
import { apiClient } from "../../AxiosSetup";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { useAuth } from "../../AuthProvider";

export default function Discover() {
  const { uid, authenticated, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterevents, setFilterevents] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/events");
      const data = response.data.events;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchEvents();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return <p>Loading events...</p>;
  }

  const detailModal = (eventId) => {
    const event = events.find((evt) => evt.event_id === eventId);
    setSelectedEvent(event);
    setOpen(true);
  };

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(filterevents.toLowerCase())
  );

  const joinEvent = async (eventID) => {
    if (!authenticated || !uid) {
      alert("Please log in to join events.");
      return;
    }
    try {
      const response = await apiClient.post("/events/logs", {
        event_id: eventID,
        user_id: parseInt(uid),
        regiment_id: null,
        workout_template_values: null,
        user_score: null,
      });
      alert("Successfully joined the event!");
      console.log("Event joined successfully:", response.data);
    } catch (e) {
      console.error("Error joining event:", e);
      alert("Failed to join the event. Please try again later.");
    }
  };

  return (
    <>
      <div className="searchandFilter">
        <div className="search-filter flex flex-col items-start gap-2 my-4 mx-7">
          <div className="search-box w-full flex items-center bg-gray-200 p-2 rounded-full mb-4">
            <FaSearch className="icon ml-1 mr-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search events by name, category..."
              className="border-none bg-transparent outline-none flex-1"
              onChange={(e) => setFilterevents(e.target.value)}
            />
          </div>
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
                  </div>

                  <div className="p-4">
                    <h4 className="text-base font-semibold mb-2">
                      {events.name}
                    </h4>
                    <div className="grid grid-cols-2 grid-rows-2 gap-2 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-500" />
                          {events.event_date
                            ? new Date(events.event_date).toDateString()
                            : ""}
                        </p>
                        <p className="text-xs text-gray-500 ml-5">
                          {events.event_time
                            ? events.event_time.slice(0, 5)
                            : "NOT SPECIFIED"}
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
                      <button
                        className="bg-blue-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-blue-600 transition duration-200"
                        onClick={() => joinEvent(events.event_id)}
                      >
                        Join Event
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center col-span-full">
                No events found matching "{filterevents}"
              </p>
            )}
          </div>
        </div>
      </section>
      {open && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{selectedEvent.name}</h2>
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
