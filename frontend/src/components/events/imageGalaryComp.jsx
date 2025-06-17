import React from "react";

const GymImageGallery = ({
  topic = "fitness",
  total = 30,
  pageSize = 6,
  selectedImage,
  onSelectImage,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const baseImages = Array.from({ length: total }, (_, i) => {
    return `/stock-images/${topic}/t${i}.jpeg`;
  });

  const collapseView = () => {
    setCurrentPage(1);
    setIsCollapsed(true);
  };

  const showMore = () => {
    setCurrentPage((prev) => prev + 1);
    setIsCollapsed(false);
  };

  const visibleImages = React.useMemo(() => {
    let base = baseImages.slice(0, currentPage * pageSize);
    if (isCollapsed && selectedImage && !base.includes(selectedImage)) {
      base = [...base, selectedImage];
    }
    return base;
  }, [baseImages, currentPage, pageSize, selectedImage, isCollapsed]);

  const handleImageClick = (imagePath) => {
    if (onSelectImage) onSelectImage(imagePath);
  };

  const hasMore = !isCollapsed && currentPage * pageSize < total;
  const canCollapse = !isCollapsed && currentPage > 1;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Click an image to select
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {visibleImages.map((url, idx) => (
          <img
            key={url}
            src={url}
            alt={`img-${idx}`}
            className={`w-full h-auto rounded shadow-md cursor-pointer transition-transform duration-200 ${
              selectedImage === url
                ? "ring-4 ring-blue-500 scale-105"
                : "hover:scale-105"
            }`}
            onClick={() => handleImageClick(url)}
            onError={(e) => (e.target.style.display = "none")}
          />
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        {hasMore && (
          <button
            onClick={showMore}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            Show More
          </button>
        )}

        {canCollapse && (
          <button
            onClick={collapseView}
            className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700"
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
};

export default GymImageGallery;

/*
example use :


import React, { useState } from "react";
import GymImageGallery from "./GymImageGallery";

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Select a Gym Image
      </h1>

{/* Selected image preview */ /*} */
/*
      {selectedImage && (
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Selected Image</h2>
          <img
            src={selectedImage}
            alt="Selected"
            className="mx-auto max-h-64 rounded shadow-md"
          />
          <p className="mt-2 text-sm text-gray-600">{selectedImage}</p>
        </div>
      )}

      {/* Gym Image Gallery */ /* }*/
/*
      <GymImageGallery
        topic="gym"
        total={24}
        pageSize={6}
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
      />
    </div>
  );
};

export default App;


*/
