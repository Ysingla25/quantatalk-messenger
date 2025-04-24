
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, Lock, MessageSquare, Users, Zap, Bell, Image, FileText, Smartphone, CheckCircle } from 'lucide-react';

const Features = () => {
  return (
    <Layout className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">QuantaTalk</span> Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, powerful messaging with everything you need
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            icon={<Shield />}
            title="End-to-End Encryption"
            description="Your messages are encrypted on your device and can only be decrypted by the recipient. Not even we can read your messages."
          />
          
          <FeatureCard 
            icon={<Users />}
            title="Secure Group Chats"
            description="Create encrypted group conversations for team collaboration, family discussions, or friend groups."
          />
          
          <FeatureCard 
            icon={<Lock />}
            title="Disappearing Messages"
            description="Set messages to automatically disappear after they've been read or after a set period of time."
          />
          
          <FeatureCard 
            icon={<Bell />}
            title="Silent Notifications"
            description="Receive notifications without revealing message content on your lock screen."
          />
          
          <FeatureCard 
            icon={<Image />}
            title="Encrypted Media Sharing"
            description="Share photos and videos with the same end-to-end encryption that protects your text messages."
          />
          
          <FeatureCard 
            icon={<FileText />}
            title="Secure File Transfer"
            description="Send documents and files of any type with complete encryption and privacy."
          />
          
          <FeatureCard 
            icon={<MessageSquare />}
            title="Read Receipts"
            description="Know when your messages have been delivered and read, with the option to disable this feature."
          />
          
          <FeatureCard 
            icon={<Smartphone />}
            title="Multi-Device Support"
            description="Access your messages securely across all your devices with perfect forward secrecy."
          />
          
          <FeatureCard 
            icon={<Zap />}
            title="Fast Performance"
            description="Enjoy lightning-fast message delivery and a responsive interface that works even on slow connections."
          />
        </div>
        
        <div className="glass-effect p-8 rounded-xl mb-12">
          <h2 className="text-2xl font-bold mb-6">Security Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SecurityFeature 
              title="Perfect Forward Secrecy" 
              description="Even if your encryption keys are compromised in the future, your past conversations remain secure."
            />
            
            <SecurityFeature 
              title="Code Audits" 
              description="Our code is regularly audited by independent security researchers to verify our security claims."
            />
            
            <SecurityFeature 
              title="No Metadata Storage" 
              description="We minimize the metadata we collect and encrypt what little is necessary for service operation."
            />
            
            <SecurityFeature 
              title="Local Encryption" 
              description="All messages are encrypted locally on your device before being transmitted."
            />
            
            <SecurityFeature 
              title="Secure Password Recovery" 
              description="Account recovery options that don't compromise your message security."
            />
            
            <SecurityFeature 
              title="Biometric Authentication" 
              description="Support for fingerprint and face recognition to access your messages."
            />
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to experience secure messaging?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join QuantaTalk today and take control of your privacy.
          </p>
        </div>
      </div>
    </Layout>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

interface SecurityFeatureProps {
  title: string;
  description: string;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({ title, description }) => {
  return (
    <div className="flex items-start">
      <div className="mt-1">
        <CheckCircle className="h-5 w-5 text-primary mr-3" />
      </div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default Features;
