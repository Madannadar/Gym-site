import React from "react";

import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button } from "react-bootstrap";


export default function MyEvents() {
  const navigate = useNavigate();
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

  const goTonewPage = () => {
    navigate('/eventLeaderboard');
  };



  return (
    <section className="my-5 mx-3">
    <Row xs={1} sm={2} md={2} lg={3} className="g-4">
      {dummyEvents.map((events) => (
        <Col key={events.id}>
          <Card className="shadow-md rounded-lg overflow-hidden">
            <Card.Img
              variant="top"
              src={events.image}
              className="w-full h-56 object-cover rounded-t-lg"
              alt={events.title}
            />
            <p className="absolute top-2 right-2 bg-purple-500 text-white text-xs rounded-full px-2 py-1">
              {events.category}
            </p>
            <Card.Body>
              <Card.Title className="text-left text-lg font-medium">
                {events.title}
              </Card.Title>
              <Card.Text>
                <div className="grid grid-cols-2 grid-rows-2 gap-2 mt-3 mb-0">
                  <span>
                    <p className="text-left mb-1 text-sm font-medium flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      {events.date}
                    </p>
                    <p className="text-xs ml-6 mb-0 text-gray-500">{events.time}</p>
                  </span>
                  <p className="text-left text-sm font-medium flex items-center items-start">
                    <FaMapMarkerAlt className="mr-2 text-gray-500" />
                    {events.location}
                  </p>
                  <div className="col-span-2 flex h-10 items-center justify-center text-white text-[10px] rounded-full ">
                    <p className="m-0 bg-green-600 px-3 py-2 rounded-full">Registered</p>
                  </div>
                </div>
              </Card.Text>
              <div className="flex justify-center gap-5 mt-3 ">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-gray-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-gray-500 text-white text-sm px-4 py-2 w-1/2 sm:w-40 md:w-48 rounded-lg hover:bg-gray-600 transition duration-200"
                  onClick={goTonewPage}
                >
                  Leaderboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </section>
  );
}
