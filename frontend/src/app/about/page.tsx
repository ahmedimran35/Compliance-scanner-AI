'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Users, Globe, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Header from '../../components/sections/Header';

const AboutPage = () => {

  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "We believe everyone deserves access to enterprise-grade security tools, regardless of their budget or technical expertise."
    },
    {
      icon: Heart,
      title: "Community Driven",
      description: "Built by security professionals, for the global community. Your feedback and contributions shape our future."
    },
    {
      icon: Globe,
      title: "Democratizing Security",
      description: "Making cybersecurity accessible to small businesses, developers, and individuals who need protection the most."
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "Continuously evolving our tools with cutting-edge AI and the latest security research to stay ahead of threats."
    }
  ];

  const team = [
    {
      name: "Security Researchers",
      role: "Threat Intelligence",
      description: "Our team of security experts continuously monitor emerging threats and develop countermeasures."
    },
    {
      name: "AI Engineers",
      role: "Machine Learning",
      description: "Building intelligent systems that can detect and prevent security vulnerabilities automatically."
    },
    {
      name: "Open Source Contributors",
      role: "Community",
      description: "Dedicated developers and security professionals who contribute their expertise to make the web safer."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Heart className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm font-medium text-white">
              Made with ❤️ for the community
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Our
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Story
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to democratize cybersecurity and make the internet a safer place for everyone. 
            What started as a simple idea has grown into a comprehensive security platform that serves thousands of users worldwide.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Our Mission
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why We Do What We Do
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              In today's digital world, cybersecurity shouldn't be a luxury reserved for large corporations. 
              Every website, every application, and every user deserves protection. That's why we've made 
              WebShield AI completely free and accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4 mr-2" />
              Our Team
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're a diverse group of security professionals, developers, and researchers 
              united by a common goal: making cybersecurity accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Our Impact
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Since our launch, we've helped secure thousands of websites and applications, 
              making the internet a safer place for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <p className="text-gray-600">Websites Secured</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50,000+</div>
              <p className="text-gray-600">Security Scans</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">100+</div>
              <p className="text-gray-600">Countries Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Us in Making the Web Safer
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're a developer, business owner, or security enthusiast, 
            you can help us make the internet a safer place for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 border-0 shadow-lg">
              <span>Start Using WebShield AI</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              <span>Contribute to Our Mission</span>
              <Heart className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Message */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-3xl font-bold text-white mb-4">
            Thank You for Being Part of Our Journey
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Your trust and support inspire us to keep building better security tools for everyone.
          </p>
          <div className="flex items-center justify-center text-gray-400">
            <Heart className="w-5 h-5 mr-2 text-red-400" />
            <span>Made with love for the global community</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
