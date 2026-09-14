import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';

function Home() {
  const [stats, setStats] = useState({ skills: 0 });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/skills`).then(res => {
      setStats({ skills: res.data.skills.length });
    });
  }, []);

  return (
    <div className="min-h-screen" style={{backgroundColor: '#fdf8f0'}}>
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{backgroundColor: '#800000'}}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center">
          <span className="inline-block px-6 py-2 rounded-full text-sm font-semibold mb-6"
            style={{backgroundColor: '#600000', color: '#fde8e8'}}>
            🇵🇰 Pakistan's #1 Community Skill Exchange Platform
          </span>
          <h1 className="text-6xl font-extrabold text-white mb-6 leading-tight">
            Find Trusted<br />
            <span style={{color: '#fbd5d5'}}>Local Skills</span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{color: '#fde8e8'}}>
            Connect with verified professionals in your community. From tutors to technicians — find the right person for the job.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/skills"
              className="bg-white font-bold text-lg px-10 py-4 rounded-xl hover:bg-red-50 transition-all shadow-lg"
              style={{color: '#800000'}}>
              Browse Skills
            </Link>
            <Link to="/register"
              className="font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-lg text-white"
              style={{backgroundColor: '#600000'}}>
              Join Now — Free!
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b py-8" style={{borderColor: '#f5ede0'}}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { number: '500+', label: 'Skilled Professionals' },
              { number: `${stats.skills}`, label: 'Active Skills Listed' },
              { number: '1000+', label: 'Services Completed' },
              { number: '4.8★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label} className="py-2">
                <h3 className="text-3xl font-extrabold" style={{color: '#800000'}}>{stat.number}</h3>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-extrabold text-center mb-3" style={{color: '#800000'}}>
          How It Works
        </h2>
        <p className="text-gray-500 text-center mb-12 text-lg">Get started in 3 simple steps</p>
        <div className="grid grid-cols-3 gap-8">
          {[
            { step: '01', icon: '🔍', title: 'Search Skills', desc: 'Browse or use AI-powered search to find the right professional for your needs.' },
            { step: '02', icon: '📩', title: 'Send Request', desc: 'Contact the professional directly and send a service request with one click.' },
            { step: '03', icon: '⭐', title: 'Get It Done', desc: 'Work with the professional and leave a review to help the community.' },
          ].map((item) => (
            <div key={item.step}
              className="text-center p-8 bg-white rounded-2xl hover:shadow-xl transition-all"
              style={{border: '2px solid #f5ede0'}}>
              <div className="text-5xl mb-4">{item.icon}</div>
              <div className="font-bold text-sm mb-2" style={{color: '#800000'}}>STEP {item.step}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="py-20" style={{backgroundColor: '#f5ede0'}}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center mb-3" style={{color: '#800000'}}>
            Popular Categories
          </h2>
          <p className="text-gray-500 text-center mb-12 text-lg">Find professionals in every field</p>
          <div className="grid grid-cols-4 gap-6">
            {[
              { name: 'Teaching', icon: '📚', count: '120+ Skills' },
              { name: 'Technical', icon: '🔧', count: '85+ Skills' },
              { name: 'Design', icon: '🎨', count: '95+ Skills' },
              { name: 'Healthcare', icon: '🏥', count: '60+ Skills' },
              { name: 'Cooking', icon: '👨‍🍳', count: '40+ Skills' },
              { name: 'Music', icon: '🎵', count: '35+ Skills' },
              { name: 'Fitness', icon: '💪', count: '50+ Skills' },
              { name: 'Business', icon: '💼', count: '70+ Skills' },
            ].map((cat) => (
              <Link to="/skills" key={cat.name}
                className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-all"
                style={{border: '2px solid #fde8e8'}}>
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1">{cat.name}</h3>
                <p className="text-sm font-medium" style={{color: '#800000'}}>{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20" style={{backgroundColor: '#800000'}}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10" style={{color: '#fde8e8'}}>
            Join thousands of professionals and service seekers in your community
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register"
              className="bg-white font-bold text-lg px-10 py-4 rounded-xl hover:bg-red-50 transition-all"
              style={{color: '#800000'}}>
              Create Free Account
            </Link>
            <Link to="/skills"
              className="font-bold text-lg px-10 py-4 rounded-xl transition-all text-white"
              style={{border: '2px solid white'}}>
              Browse Skills
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{backgroundColor: '#600000'}} className="text-red-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg" style={{color: '#800000'}}>S</div>
                <h3 className="text-white font-bold text-xl">SkillBridge</h3>
              </div>
              <p className="text-sm">Connecting communities through skills and services across Pakistan.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/skills" className="hover:text-white transition-all">Browse Skills</Link></li>
                <li><Link to="/register" className="hover:text-white transition-all">Post a Skill</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition-all">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-all">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>info@skillbridge.pk</li>
                <li>Islamabad, Pakistan</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 text-center text-sm" style={{borderTop: '1px solid #800000'}}>
            <p>© 2026 SkillBridge — All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;