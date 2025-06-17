import React, { useState } from "react";
import { apiClient } from "../../AxiosSetup";
import { useAuth } from "../../AuthProvider";

export default function HostEvent() {
  const { uid, authenticated } = useAuth();
  const [images, setImage] = useState(null);
  const [form, setForm] = useState({
    created_by: uid || null,
    name: "",
    description: "",
    regiment_id: null,
    event_date: "",
    event_time: "",
    event_location: "",
    number_of_participants: null,
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authenticated || !uid) {
      alert("Please log in to create an event.");
      return;
    }
    try {
      const response = await apiClient.post("/events", {
        ...form,
        created_by: parseInt(uid),
        number_of_participants: form.number_of_participants
          ? parseInt(form.number_of_participants)
          : null,
      });
      alert("Event created successfully!");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6">
          Host an Event
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-lg font-semibold text-gray-800 mb-1"
            >
              Event Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              id="name"
              placeholder="Enter event name"
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-lg font-semibold text-gray-800 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows="4"
              name="description"
              value={form.description}
              placeholder="Describe your event"
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="mb-4">
            <label
              htmlFor="dropzone-file"
              className="block text-lg font-semibold text-gray-800 mb-1"
            >
              Cover Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="relative block w-full h-64 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50"
              >
                {images ? (
                  <img
                    src={images}
                    alt="Cover Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                )}
                <input
                  id="dropzone-file"
                  accept="image/*"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="event_date"
              className="block text-lg font-semibold text-gray-800 mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="event_date"
              name="event_date"
              value={form.event_date}
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="event_time"
              className="block text-lg font-semibold text-gray-800 mb-1"
            >
              Time
            </label>
            <input
              type="time"
              id="event_time"
              name="event_time"
              value={form.event_time}
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="event_location"
              className="block text-lg font-semibold text-gray-800 mb-1"
            >
              Location
            </label>
            <input
              type="text"
              id="event_location"
              name="event_location"
              value={form.event_location}
              placeholder="Enter event location"
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="number_of_participants"
              className="block text-lg font-semibold text-gray-800 mb-1"
            >
              Number of Participants
            </label>
            <input
              type="number"
              id="number_of_participants"
              name="number_of_participants"
              value={form.number_of_participants || ""}
              placeholder="Enter number of participants"
              className="mt-1 block w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              className="py-2.5 px-3 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-3 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-[#3588a2] focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
