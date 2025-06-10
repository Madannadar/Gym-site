import React from "react";

const Loader = React.memo(() => {
  return (
    <>
      {/* Inline CSS for the component */}
      <style>
        {`
          @keyframes ripple {
            0% {
              background-color: transparent;
            }
            30% {
              background-color: var(--cell-color);
            }
            60% {
              background-color: transparent;
            }
            100% {
              background-color: transparent;
            }
          }

          .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(0, 0, 0, 0.1); /* Semi-transparent background */
                        backdrop-filter: blur(2px); /* Apply blur effect */
                        -webkit-backdrop-filter: blur(5px); /* For Safari */
            z-index: 9999;
          }

          .loader {
            --cell-size: 52px;
            --cell-spacing: 1px;
            --cells: 3;
            --total-size: calc(var(--cells) * (var(--cell-size) + 2 * var(--cell-spacing)));
            display: flex;
            flex-wrap: wrap;
            width: var(--total-size);
            height: var(--total-size);
          }

          .cell {
            flex: 0 0 var(--cell-size);
            margin: var(--cell-spacing);
            background-color: transparent;
            box-sizing: border-box;
            border-radius: 4px;
            animation: ripple 1.5s ease infinite;
          }

          /* Base color: #e28c41 */
          .cell.d-0 {
            --cell-color: #e28c41; /* Base color */
          }

          .cell.d-1 {
            --cell-color: #d57f3e; /* Slightly darker shade */
          }

          .cell.d-2 {
            --cell-color: #c9743a; /* Lighter shade */
          }

          .cell.d-3 {
            --cell-color: #db883a; /* Another shade of base color */
          }

          .cell.d-4 {
            --cell-color: #f1a64d; /* Lighter tint of base color */
          }

          /* Customizing each cell's color based on base */
          .cell:nth-child(1) {
            --cell-color: #e28c41; /* Base color */
          }

          .cell:nth-child(2) {
            --cell-color: #d57f3e; /* Darker shade */
          }

          .cell:nth-child(3) {
            --cell-color: #c9743a; /* Lighter shade */
          }

          .cell:nth-child(4) {
            --cell-color: #db883a; /* Another shade */
          }

          .cell:nth-child(5) {
            --cell-color: #f1a64d; /* Lighter tint */
          }

          .cell:nth-child(6) {
            --cell-color: #d57f3e; /* Darker shade */
          }

          .cell:nth-child(7) {
            --cell-color: #c9743a; /* Lighter shade */
          }

          .cell:nth-child(8) {
            --cell-color: #db883a; /* Another shade */
          }

          .cell:nth-child(9) {
            --cell-color: #f1a64d; /* Lighter tint */
          }
        `}
      </style>

      {/* Loader with centered positioning */}
      <div className="loader-overlay">
        <div className="loader">
          <div className="cell d-0" />
          <div className="cell d-1" />
          <div className="cell d-2" />
          <div className="cell d-1" />
          <div className="cell d-2" />
          <div className="cell d-2" />
          <div className="cell d-3" />
          <div className="cell d-3" />
          <div className="cell d-4" />
        </div>
      </div>
    </>
  );
});

export default Loader;
