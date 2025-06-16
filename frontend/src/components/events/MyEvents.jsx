import { useEffect, useState } from "react";
import { apiClient } from "../../AxiosSetup";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthProvider";

export default function MyEvents() {
  const { uid, authenticated, loading: authLoading } = useAuth();
  const [myevent, setMyevent] = useState([]);
  const [eventID, setEventID] = useState([]);
  const navigate = useNavigate();

  const joinEvent = async () => {
    try {
      const response = await apiClient.get("/events");
      const data = response.data.events;
      setMyevent(data);
    } catch (error) {
      console.error("Error joining event:", error);
      alert("Failed to fetch events. Please try again later.");
    }
  };

  const fetchMyEvents = async () => {
    if (!authenticated || !uid) {
      alert("Please log in to view your events.");
      return;
    }
    try {
      const response = await apiClient.get(`/events/logs/user/${uid}`);
      const data = response.data.logs || [];
      const eventIds = data.map((event) => event.event_id);
      setEventID(eventIds);
    } catch (error) {
      console.error("Error fetching events:", error);
      alert("Failed to fetch your events. Please try again later.");
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchMyEvents();
      joinEvent();
    }
  }, [authLoading, authenticated, uid]);

  const joinedEvents = myevent.filter((event) =>
    eventID.includes(event.event_id)
  );

  if (authLoading) return <p>Loading...</p>;
  if (!authenticated) return <p>Please log in to view your events.</p>;

  return (
    <section className="pt-4 sm:pt-6 mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Joined Events
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {joinedEvents.length > 0 ? (
          joinedEvents.map((events, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg overflow-hidden relative"
            >
              <img
                src="https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt={events.title}
                className="w-full h-56 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h4 className="text-left text-lg font-medium">{events.name}</h4>
                <div className="grid grid-cols-2 grid-rows-2 gap-2 mt-3 mb-0">
                  <div>
                    <p className="text-left mb-1 text-sm font-medium flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      {events.event_date
                        ? new Date(events.event_date).toDateString()
                        : ""}
                    </p>
                    <p className="text-xs ml-6 mb-0 text-gray-500">
                      {events.event_time
                        ? events.event_time.slice(0, 5)
                        : "NOT SPECIFIED"}
                    </p>
                  </div>
                  <p className="text-left text-sm font-medium flex items-start">
                    <FaMapMarkerAlt className="mr-2 text-gray-500" />
                    {events.event_location}
                  </p>
                  <div className="col-span-2 flex h-10 items-center justify-center text-white text-[10px]">
                    <p className="m-0 bg-green-600 px-3 py-2 rounded-full">
                      Registered
                    </p>
                  </div>
                </div>
                <div className="flex justify-center gap-5 mt-3">
                  <button className="bg-gray-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-gray-600 transition duration-200">
                    Details
                  </button>
                  <button
                    onClick={() => navigate("/eventLeaderboard")}
                    className="bg-blue-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    Leaderboard
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center col-span-full">
            No events joined yet. Explore and join some events to see them here!
          </p>
        )}
      </div>
    </section>
  );
}
