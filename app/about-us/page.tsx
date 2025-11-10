"use client";

export default function AboutUs() {
  return (
    <section className="bg-white dark:bg-gray-900 py-16">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          About <span className="text-blue-600">King_Shopper</span>
        </h2>

        <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
          Welcome to <span className="font-semibold text-blue-600">KingShopper</span>, 
          your one-stop destination for fresh groceries, organic produce, and daily essentials. 
          We believe in providing high-quality, farm-fresh products straight to your doorstep — 
          ensuring your family enjoys healthy and tasty meals every day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
          <div className="p-6 bg-green-50 dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2">
              🌾 Our Mission
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              To make fresh and organic groceries accessible, affordable, and 
              delivered with care to every household.
            </p>
          </div>

          <div className="p-6 bg-green-50 dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2">
              🛒 What We Offer
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              From farm-fresh vegetables and fruits to pantry staples and 
              eco-friendly home products — all under one roof.
            </p>
          </div>

          <div className="p-6 bg-green-50 dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-2">
              🤝 Our Promise
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We stand by freshness, honesty, and sustainability — delivering only 
              the best to our valued customers.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Why Choose <span className="text-blue-600">KingShopper</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Because we care about what goes on your plate. Our team works directly 
            with trusted farmers and suppliers to ensure quality, freshness, and 
            ethical sourcing — every single day.
          </p>
        </div>
      </div>
    </section>
  );
}
