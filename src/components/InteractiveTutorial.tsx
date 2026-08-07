import React, { useState } from 'react';
import { User, PlusCircle, Wallet, Maximize } from 'lucide-react';
import verifyAccountVideo from '@/assets/verify-account-tutorial.mp4.asset.json';
import createGigVideo from '@/assets/create-gig-tutorial.mp4.asset.json';
import withdrawVideo from '@/assets/withdraw-tutorial.mp4.asset.json';
import SmartVideo from '@/components/media/SmartVideo';


interface TutorialOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  videoSrc: string;
  steps: string[];
}

const InteractiveTutorial = () => {
  const [activeTab, setActiveTab] = useState('account');

  const tutorials: TutorialOption[] = [
    {
      id: 'account',
      title: 'Verify Account',
      icon: <User className="w-6 h-6" />,
      description: 'Set up and manage your freelancer profile',
      videoSrc: verifyAccountVideo.url,
      steps: [
        'Complete Profile Setup',
        'Verify Your Identity',
        'Add Skills & Portfolio',
        'Set Availability Status',
        'Configure Notifications'
      ]
    },
    {
      id: 'gig',
      title: 'Create Gig',
      icon: <PlusCircle className="w-6 h-6" />,
      description: 'Launch your services and attract clients',
      videoSrc: createGigVideo.url,
      steps: [
        'Choose Service Category',
        'Write Compelling Description',
        'Set Pricing Packages',
        'Upload Portfolio Images',
        'Publish Your Gig'
      ]
    },
    {
      id: 'withdraw',
      title: 'Withdraw',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Secure payment processing and withdrawal',
      videoSrc: withdrawVideo.url,
      steps: [
        'Complete Payment Setup',
        'Track Your Earnings',
        'Request Withdrawal',
        'Verify Bank Details',
        'Receive Your Payment'
      ]
    }
  ];


  const handleWatchFullTutorial = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      videoElement.controls = true;
      
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).msRequestFullscreen) {
        (videoElement as any).msRequestFullscreen();
      }
      
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          videoElement.controls = false;
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
          document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        }
      };
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('msfullscreenchange', handleFullscreenChange);
    }
  };

  const activeTutorial = tutorials.find(t => t.id === activeTab) || tutorials[0];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/30 to-muted/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Master FIVESOM in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow our step-by-step tutorials to quickly understand how each feature works
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tutorials.map((tutorial) => (
            <button
              key={tutorial.id}
              onClick={() => setActiveTab(tutorial.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                activeTab === tutorial.id
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-background/50 border border-border/30 hover:border-primary/30 hover:scale-105'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeTab === tutorial.id ? 'bg-primary-foreground/20' : 'bg-primary/10'
              }`}>
                {tutorial.icon}
              </div>
              <span className="font-semibold">{tutorial.title}</span>
            </button>
          ))}
        </div>

        {/* Active Tutorial Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center animate-fade-in">
          {/* Video Section */}
          <div className="relative">
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-primary/30 bg-muted/20 shadow-2xl shadow-primary/20 hover:shadow-primary/30 hover:border-primary/50 transition-all duration-500">
                <SmartVideo
                  key={activeTutorial.id}
                  id={`video-${activeTutorial.id}`}
                  src={activeTutorial.videoSrc}
                  label="tutorial video"
                  lazy
                  autoPlay
                  muted
                  loop
                />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-2xl blur-sm opacity-75 animate-pulse -z-10" />
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  {activeTutorial.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  {activeTutorial.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-lg">
                {activeTutorial.description}
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">
                Step-by-Step Process:
              </h4>
              <div className="space-y-3">
                {activeTutorial.steps.map((step, stepIndex) => (
                  <div
                    key={stepIndex}
                    className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:translate-x-1"
                  >
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {stepIndex + 1}
                    </div>
                    <span className="text-foreground font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  const video = document.getElementById(`video-${activeTutorial.id}`) as HTMLVideoElement;
                  handleWatchFullTutorial(video);
                }}
                className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Maximize className="w-4 h-4" />
                Watch Full Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveTutorial;
