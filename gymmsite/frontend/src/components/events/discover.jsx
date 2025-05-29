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
            />
          </div>
          <button class="filter-btn flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 cursor-pointer">
            <FaFilter class="icon mr-2 text-gray-500" /> Filters
          </button>
        </div>
      </div>
      <section>
        <div className="mx-4">
          <Row xs={1} sm={2} md={2} lg={3} className="g-4">
            {dummyEvents.map((events, index) => (
              <Col key={index}>
                <Card>
                  <Card.Img
                    className="event-image w-full rounded-t-lg h-56 object-cover"
                    variant="top"
                    src={events.image}
                  />
                  <Card.Body >
                    <div className="px-1 pb-1">
                      <Card.Title className="m-2">{events.title}</Card.Title>
                      <Card.Text className="mb-0">
                        <div className="grid h-35 mb-0 grid-cols-2 grid-rows-2 gap-2 my-3">
                          <span>
                            <p className="txt mb-0  text-left m-2 text-sm font-medium flex-1">
                              {" "}
                              <FaCalendarAlt className="icon " />
                              {events.date}
                              <br />
                            </p>
                            <p className="time mt-0 text-xs m-2 text-gray-500 pl-">
                              {events.time}
                            </p>
                          </span>
                          <p className="txt">
                            {" "}
                            <FaMapMarkerAlt className="mx-1 text-gray-500" />{" "}
                            {events.location}
                          </p>

                          <p className="part col-span-2 text-left mx-2 text-sm font-medium">
                            <FaUsers className="icon" /> 30 participants
                          </p>
                        </div>
                      </Card.Text>
                      <div className="flex justify-center gap-5 mt-0 ">
                        <Button className="bg-gray-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-gray-600 transition duration-200" variant="secondary" size="sm">
                          Details
                        </Button>
                        <Button className="bg-blue-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48  rounded-lg hover:bg-blue-600 transition duration-200" variant="primary" size="sm">
                          Join Event
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          {/* <div key={events.id} className="individual-event">
                <img
                  src={events.image}
                  className="event-image"
                  alt={events.title}
                />
                <p className="eventCat">{events.category}</p>
                <div className="allText">
                  <h3 className="title">{events.title}</h3>
                  <div className="eventDetails">
                    <span>
                      <p className="txt">
                        {" "}
                        <FaCalendarAlt className="icon" />
                        {events.date}
                        <br />
                      </p>
                      <p className="txt time">{events.time}</p>
                    </span>
                    <p className="txt">
                      {" "}
                      <FaMapMarkerAlt className="icon" /> {events.location}
                    </p>

                    <p className="txt part">
                      <FaUsers className="icon" /> 30 participants
                    </p>
                  </div>
                  <div className="buttons">
                    <button className="btnn details-btn">Details</button>
                    <button className=" btnn join-btn">Join Event</button>
                  </div>
                </div>
              </div> */}
        </div>
      </section>
    </>
  );
}
