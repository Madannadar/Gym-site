import React, { useState, useMemo } from "react";
import { CheckCircle } from "lucide-react";

const ImageInsert = ({
  topic = "diet",
  total = 30,
  pageSize = 6,
  title = "Pick an Image",
  selectedImage,
  onImageSelect,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const baseImages = useMemo(() => {
    return Array.from({ length: total }, (_, i) => {
      return `/stock-images/${topic}/${topic.slice(0, 1)}${i}.jpeg`;
    });
  }, [topic, total]);

  const visibleImages = useMemo(() => {
    let base = baseImages.slice(0, currentPage * pageSize);
    if (isCollapsed && selectedImage && !base.includes(selectedImage)) {
      base = [...base, selectedImage];
    }
    return base;
  }, [baseImages, currentPage, pageSize, selectedImage, isCollapsed]);

  const hasMore = currentPage * pageSize < total;

  const handleImageClick = (img) => {
    if (onImageSelect) onImageSelect(img);
    setTimeout(() => setShowPicker(false), 100);
  };

  const showMore = () => {
    setCurrentPage((prev) => prev + 1);
    setIsCollapsed(false);
  };

  const collapseView = () => {
    setCurrentPage(1);
    setIsCollapsed(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        data-testid="image-insert"
        onClick={() => setShowPicker(!showPicker)}
        className="px-4 py-2 bg-[#4B9CD3] text-white rounded-lg shadow hover:bg-blue-500 transition duration-200 ease-in-out font-semibold"
      >
        {showPicker ? "Hide Image Picker" : "Select Image"}
      </button>

      {selectedImage && (
        <div className="mt-2 text-sm text-gray-700">
          Selected: 
        </div>
      )}

      {showPicker && (
        <div className="mt-2 w-full p-4 border border-gray-300 rounded-lg shadow bg-white animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={() => setShowPicker(false)}
              className="text-gray-500 hover:text-red-600 font-semibold text-sm"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {visibleImages.map((url, idx) => (
              <div
                key={url}
                onClick={() => handleImageClick(url)}
                className={`relative rounded-md overflow-hidden border shadow cursor-pointer group transition-all ${
                  selectedImage === url
                    ? "ring-4 ring-[#4B9CD3]"
                    : "hover:ring-2 hover:ring-blue-300"
                }`}
              >
                <img
                  src={url}
                  alt={`img-${idx}`}
                  className="w-full h-28 object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
                {selectedImage === url && (
                  <div className="absolute top-1 right-1 bg-white rounded-full shadow p-1">
                    <CheckCircle className="text-[#4B9CD3] w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={showMore}
              disabled={!hasMore}
              className={`px-3 py-1 text-sm rounded-lg font-semibold transition ${
                hasMore
                  ? "bg-[#4B9CD3] text-white hover:bg-blue-500"
                  : "bg-blue-200 text-white cursor-not-allowed"
              }`}
            >
              Show More
            </button>

            <button
              onClick={collapseView}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageInsert;


/*
example use :
import React, { useState } from "react";
import ImageInsert from "./ImageInsert";

const MyComponent = () => {
  const [image, setImage] = useState(null);

  return (
    <div className="p-4">
      <ImageInsert
        topic="workout"
        total={24}
        selectedImage={image}
        onImageSelect={setImage}
      />
    </div>
  );
};

export default MyComponent;


*/
