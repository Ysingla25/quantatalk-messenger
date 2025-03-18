
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Shield, Users, MessageSquare, Lock, Zap, Globe } from 'lucide-react';

const About = () => {
  return (
    <Layout className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-gradient">QuantaTalk</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure messaging for a privacy-focused world
          </p>
        </div>
        
        <div className="glass-effect p-8 rounded-xl mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg mb-6">
            At QuantaTalk, we believe that private communication is a fundamental right. 
            Our mission is to provide a secure, user-friendly platform that protects your 
            conversations with state-of-the-art encryption while delivering a seamless 
            user experience.
          </p>
          <p className="text-lg">
            Founded by a team of privacy advocates and security experts, QuantaTalk 
            was built from the ground up with your privacy in mind. We employ end-to-end 
            encryption, ensuring that only you and your intended recipients can read your messages.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Privacy First</h3>
            </div>
            <p className="text-muted-foreground">
              We don't store your message content on our servers. Your conversations are yours alone, 
              protected by industry-leading encryption.
            </p>
          </div>
          
          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Community Focus</h3>
            </div>
            <p className="text-muted-foreground">
              We're building more than just an app - we're creating a community of privacy-conscious 
              individuals who value secure communication.
            </p>
          </div>
          
          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Global Access</h3>
            </div>
            <p className="text-muted-foreground">
              We believe secure communication should be available to everyone, regardless of 
              location or technical expertise.
            </p>
          </div>
          
          <div className="glass-effect p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Continuous Innovation</h3>
            </div>
            <p className="text-muted-foreground">
              Our team is constantly working to improve QuantaTalk, adding new features while 
              keeping security at the forefront of everything we do.
            </p>
          </div>
        </div>
        
        <div className="glass-effect p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-6">Our Team</h2>
          <p className="text-lg mb-6">
            QuantaTalk is developed by a diverse team of security experts, software engineers,
            and privacy advocates dedicated to creating the most secure messaging platform possible.
          </p>
          <p className="text-lg">
            We're committed to transparency and maintaining an open dialogue with our community.
            If you have questions, suggestions, or concerns, we'd love to hear from you.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
