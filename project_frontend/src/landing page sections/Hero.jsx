import React from 'react'
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div> {/* Hero Section */}
    <section className="text-center px-6 py-20 text-[#3b2762]">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-bold mb-4"
      >
        Ace Your IT Subjects with Peer Tutors
      </motion.h1>
      <p className="text-lg max-w-2xl mx-auto mb-6">
        Connect with experienced CS and IT tutors. Learn live via Google Meet.
      </p>
      <Link to='/login'>
      <button className="bg-[#3b2762] text-white hover:bg-[#2d1f52] text-lg px-6 py-2 rounded-2xl hover:cursor-pointer">
        Get Started
      </button>
      </Link>
    </section>
</div>
  )
}

export default Hero