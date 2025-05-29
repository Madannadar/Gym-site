import React from "react";

export default function EventLogo() {
  return (
    <div
      className="leaderboardTrophy bg-sky-100 p-2 rounded-full flex justify-center items-center"
      style={{ marginLeft: "6px", marginRight: "6px" }}
    >
      <div className="svg-cir">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0EA5E9"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-calendar h-5 w-5 text-fitness-blue"
          data-lov-id="src/components/PageHeader.tsx:23:12"
          data-lov-name="Icon"
          data-component-path="src/components/PageHeader.tsx"
          data-component-line="23"
          data-component-file="PageHeader.tsx"
          data-component-name="Icon"
          data-component-content="%7B%22className%22%3A%22h-5%20w-5%20text-fitness-blue%22%7D"
        >
          <path d="M8 2v4"></path>
          <path d="M16 2v4"></path>
          <rect width="18" height="18" x="3" y="4" rx="2"></rect>
          <path d="M3 10h18"></path>
        </svg>
      </div>
    </div>
  );
}
