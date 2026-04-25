import React from 'react'
import { CheckCircle, Video, UserCheck, Lock, TrendingUp } from "lucide-react";

const Feature = () => {
  return (
    <div>{/* Features Section */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: <UserCheck />, title: "Find a Tutor", desc: "Get matched with tutors based on your subject." },
            { icon: <Video />, title: "Live Sessions", desc: "Interact via Google Meet for real-time help." },
          ].map((feature, i) => (
            <div key={i} className="rounded-2xl shadow-md hover:shadow-lg transition">
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4 text-[#3b2762]">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Feature