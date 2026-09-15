import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../config';
import developerPhoto from '../assets/awais.png';

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
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24 lg:py-28 text-center">
          <span className="inline-block px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6"
            style={{backgroundColor: '#600000', color: '#fde8e8'}}>
            🇵🇰 Pakistan's #1 Community Skill Exchange Platform
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Find Trusted<br />
            <span style={{color: '#fbd5d5'}}>Local Skills</span>
          </h1>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto" style={{color: '#fde8e8'}}>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
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

      {/* About the Developer */}
      <div className="relative py-20 overflow-hidden" style={{backgroundColor: '#fdf8f0'}}>
        {/* decorative background accents, matching the hero section's style */}
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-40" style={{backgroundColor: '#fde8e8'}}></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-40" style={{backgroundColor: '#f5ede0'}}></div>

        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-4"
              style={{backgroundColor: '#fde8e8', color: '#800000'}}>
              THE DEVELOPER
            </span>
            <h2 className="text-4xl font-extrabold" style={{color: '#800000'}}>
              Built By
            </h2>
            <p className="text-gray-500 mt-2">The person behind SkillBridge's code</p>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row gap-10 lg:gap-12 items-center"
            style={{border: '2px solid #f5ede0'}}>

            {/* Photo + identity */}
            <div className="flex flex-col items-center text-center shrink-0 lg:w-72">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full blur-xl opacity-30 scale-105" style={{backgroundColor: '#800000'}}></div>
                <img
                  src={developerPhoto}
                  alt="Awais Hassan — Full Stack Developer"
                  className="relative w-40 h-40 rounded-full object-cover shadow-xl"
                  style={{border: '4px solid white', outline: '3px solid #fde8e8'}}
                />
                <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-500 border-4 border-white" title="Available for work"></span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Awais Hassan</h3>
              <p className="font-semibold mt-1" style={{color: '#800000'}}>Full Stack Developer</p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Available for freelance work
              </p>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-5">
                <a href="https://www.linkedin.com/in/awais-hassan-199726409" target="_blank" rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{backgroundColor: '#0A66C2'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/>
                  </svg>
                </a>
                <a href="https://github.com/awaishassan321" target="_blank" rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{backgroundColor: '#181717'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.42.36.78 1.07.78 2.16 0 1.56-.02 2.82-.02 3.2 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"/>
                  </svg>
                </a>
                <a href="mailto:awaishassancs@gmail.com"
                  aria-label="Email"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{backgroundColor: '#800000'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/>
                  </svg>
                </a>
              </div>

              <a href="https://www.fiverr.com/s/qb86jLV" target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md"
                style={{backgroundColor: '#1DBF73'}}>
                Hire me on Fiverr
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            {/* Bio + skills */}
            <div className="flex-1 text-center lg:text-left">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                className="w-8 h-8 mb-2 mx-auto lg:mx-0 opacity-20" style={{color: '#800000'}}>
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
              </svg>
              <p className="text-gray-600 text-lg leading-relaxed">
                I'm Awais — a Full Stack Developer specializing in React, Node.js, and modern web architecture,
                with a growing focus on AI-powered automation using tools like n8n. I build full-scale web
                applications and the automated workflows that make businesses run more efficiently.
              </p>

              <div className="flex flex-wrap gap-2 mt-6 justify-center lg:justify-start">
                {['React', 'Node.js', 'Express', 'PostgreSQL', 'AI Automation (n8n)', 'REST APIs'].map((skill) => (
                  <span key={skill}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-transform hover:scale-105 cursor-default"
                    style={{backgroundColor: '#fde8e8', color: '#800000'}}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-6 pt-6 flex items-center gap-2 justify-center lg:justify-start" style={{borderTop: '1px solid #f5ede0'}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" style={{color: '#800000'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <p className="text-sm text-gray-400">
                  SkillBridge — designed and built end-to-end, from database architecture to UI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{backgroundColor: '#600000'}} className="text-red-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
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
                <li><a href="mailto:awais.hassancs@gmail.com" className="hover:text-white transition-all">awais.hassancs@gmail.com</a></li>
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