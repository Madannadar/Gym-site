// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-gray-600 text-sm">
        <p className="mb-2 sm:mb-0">
          &copy; {new Date().getFullYear()} FitLife Gym. All rights reserved.
        </p>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-blue-600 transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-blue-600 transition">
            Terms of Use
          </a>
          <a href="#" className="hover:text-blue-600 transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
