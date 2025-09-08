"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star, Zap, Crown, Heart, Gift, Shield, Globe, Users } from 'lucide-react';
import Button from '../ui/Button';
import { useRouter } from 'next/navigation';

const supportTiers = [
  {
    name: 'Free User',
    price: '$0',
    period: 'forever',
    description: 'Use all features completely free',
    icon: Zap,
    features: [
      'Unlimited projects',
      'Unlimited URLs',
      'Unlimited scans',
      'Full AI analysis',
      'All compliance standards',
      'Email support',
      'Advanced reports',
      'Scheduling & automation',
      'API access',
      'Team collaboration',
    ],
    limitations: [],
    buttonText: 'Get Started Free',
    buttonVariant: 'outline' as const,
    popular: false,
    gradient: 'from-slate-500 to-slate-600'
  },
  {
    name: 'Supporter',
    price: '$5',
    period: 'one-time',
    description: 'Support our mission & get perks',
    icon: Heart,
    features: [
      'Everything in Free',
      'Supporter badge on profile',
      'Priority support',
      'Early access to new features',
      'Exclusive supporter updates',
      'Help keep the project free',
      'Support open source development',
    ],
    limitations: [],
    buttonText: 'Become a Supporter',
    buttonVariant: 'primary' as const,
    popular: true,
    gradient: 'from-red-500 to-pink-500'
  }
];

const Pricing = () => {
  const router = useRouter();

  const handleButtonClick = (tier: any) => {
    if (tier.name === 'Supporter') {
      router.push('/donation');
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Heart className="w-4 h-4 mr-2" />
            Community Supported
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Completely
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Free Forever
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Our mission is to democratize cybersecurity and make enterprise-grade security tools accessible to everyone. 
            Support us to keep this project free and help us protect the entire web.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {supportTiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative group ${
                tier.popular ? 'md:-mt-8 md:mb-8' : ''
              }`}
            >
              {tier.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
                >
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                    Support Our Mission
                  </span>
                </motion.div>
              )}

              <div className={`relative rounded-3xl p-8 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                tier.popular 
                  ? 'bg-gradient-to-br from-red-600 to-pink-600 text-white shadow-2xl' 
                  : 'bg-white border-2 border-slate-200 shadow-lg'
              }`}>
                
                {/* Background pattern */}
                <div className="absolute inset-0 rounded-3xl opacity-5" 
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                     }} />

                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-r ${tier.gradient} shadow-lg`}>
                      <tier.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-slate-900'}`}>
                      {tier.name}
                    </h3>
                    
                    <div className="mb-4">
                      <span className={`text-5xl font-bold ${tier.popular ? 'text-white' : 'text-slate-900'}`}>
                        {tier.price}
                      </span>
                      <span className={`ml-2 ${tier.popular ? 'text-red-100' : 'text-slate-600'}`}>
                        {tier.period}
                      </span>
                    </div>
                    
                    <p className={`${tier.popular ? 'text-red-100' : 'text-slate-600'}`}>
                      {tier.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className={`font-semibold mb-4 ${tier.popular ? 'text-white' : 'text-slate-900'}`}>
                      What you get:
                    </h4>
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${tier.popular ? 'text-green-300' : 'text-green-500'}`} />
                        <span className={tier.popular ? 'text-red-100' : 'text-slate-700'}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant={tier.buttonVariant}
                    size="lg"
                    onClick={() => handleButtonClick(tier)}
                    className={`w-full font-semibold ${
                      tier.popular 
                        ? 'bg-slate-800 text-white hover:bg-slate-700 border-0 shadow-lg' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg'
                    }`}
                  >
                    {tier.buttonText}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-12 shadow-xl border border-blue-200">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-6">
              Our Mission & Why It's Free
            </h3>
            <p className="text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed mb-8">
              We believe that security and compliance tools should be accessible to everyone, not just enterprises with big budgets. 
              Our comprehensive suite is completely free and will always remain free. Your support helps us maintain 
              the infrastructure, add new features, and protect the entire web community.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Democratize Security</h4>
                <p className="text-slate-600 text-sm">Make enterprise-grade security tools available to everyone, regardless of budget.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Protect the Web</h4>
                <p className="text-slate-600 text-sm">Help secure websites globally by providing free, accessible security tools.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Community Driven</h4>
                <p className="text-slate-600 text-sm">Built by the community, for the community. Your support keeps it free.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-slate-200">
            <h3 className="text-3xl font-bold text-slate-900 mb-8">
              Frequently Asked Questions
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Is it really free forever?</h4>
                <p className="text-slate-600">Yes, absolutely! All Scan More features including the Security Engine are completely free and will always remain free. No hidden costs, no limitations.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Why should I become a supporter?</h4>
                <p className="text-slate-600">Supporting helps us maintain the infrastructure, add new security tools, and keep everything free for everyone. You also get exclusive perks!</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">What security tools are available?</h4>
                <p className="text-slate-600">We offer 12+ security tools including Port Scanner, SSL Checker, DNS Analyzer, and more coming soon. All tools provide real results, no simulations.</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Can I use this for commercial projects?</h4>
                <p className="text-slate-600">Yes! You can use Scan More's compliance scanner and security tools for any project, personal or commercial, without any restrictions.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing; 