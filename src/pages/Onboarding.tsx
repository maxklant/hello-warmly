import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ChevronRight, Heart, Clock, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const slides = [
  {
    title: "Check eenvoudig in met één klik.",
    description: "Laat je dierbaren weten hoe het gaat met een simpele tik.",
    icon: Heart,
    color: "text-primary"
  },
  {
    title: "Zie hoe het gaat met je dierbaren.",
    description: "Blijf op de hoogte van familie en vrienden in één overzicht.",
    icon: Clock,
    color: "text-secondary-foreground"
  },
  {
    title: "Ontvang een wekelijkse herinnering om contact te houden.",
    description: "Vergeet nooit meer om in contact te blijven met je dierbaren.",
    icon: Bell,
    color: "text-accent-foreground"
  }
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setIsRegistering(true);
    }
  };

  const handleRegistration = () => {
    // Store user info and navigate to main app
    localStorage.setItem("checkInUser", JSON.stringify({ name, email }));
    navigate("/");
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 contact-card">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welkom bij Check-in
            </h2>
            <p className="text-muted-foreground">
              Laten we je profiel aanmaken
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Naam</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je volledige naam"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="je.email@voorbeeld.nl"
                className="rounded-xl"
              />
            </div>

            <Button
              onClick={handleRegistration}
              disabled={!name || !email}
              className="w-full rounded-xl h-12 text-base font-semibold"
            >
              Start met Check-in
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Image */}
      <div className="w-full h-64 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Familie en vrienden die verbonden blijven via de Check-in App"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Header */}
      <div className="text-center pt-8 pb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Check-in App</h1>
        <p className="text-muted-foreground px-6">
          Blijf verbonden met de mensen die het belangrijkst zijn.
        </p>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <Card className="w-full max-w-md p-8 contact-card text-center">
          <div className="mb-8">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ${slide.color}`}>
              <Icon size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-4">
              {slide.title}
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              {slide.description}
            </p>
          </div>
        </Card>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentSlide ? "bg-primary w-6" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Next Button */}
      <div className="px-6 pb-safe">
        <Button
          onClick={nextSlide}
          className="w-full rounded-xl h-12 text-base font-semibold"
        >
          {currentSlide === slides.length - 1 ? "Aan de slag" : "Volgende"}
          <ChevronRight className="ml-2" size={20} />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;