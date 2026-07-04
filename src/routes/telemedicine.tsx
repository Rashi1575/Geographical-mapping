import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { emergencyDoctors, type Doctor } from '@/data/doctors';
// Added Phone to the imports
import { Video, MessageCircle, Clock, Building2, Stethoscope, PhoneOff, Phone } from 'lucide-react';
import { PageHeader } from '@/components/healthcare/PageHeader';

// Import your existing video call room
// @ts-ignore
import TelemedicineRoom from '../components/healthcare/Telemedicine';

export const Route = createFileRoute('/telemedicine')({
  component: TelemedicineDirectory,
});

// Helper function to check if current time falls within a shift string
function checkIsCurrentlyAvailable(timingString: string): boolean {
  if (timingString.includes("24/7")) return true;
  if (!timingString.includes("-")) return false; 

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeVal = currentHours + currentMinutes / 60;

  try {
    const [startStr, endStr] = timingString.split("-").map(s => s.trim());
    
    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();
      
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours + minutes / 60;
    };

    const startVal = parseTime(startStr);
    const endVal = parseTime(endStr);

    if (startVal === null || endVal === null) return false;

    if (startVal < endVal) {
      return currentTimeVal >= startVal && currentTimeVal <= endVal;
    } else {
      return currentTimeVal >= startVal || currentTimeVal <= endVal;
    }
  } catch (e) {
    return false; 
  }
}

function TelemedicineDirectory() {
  // State to track if we are currently in a call, and with whom
  const [activeCall, setActiveCall] = useState<Doctor | null>(null);

  // 1. State for the specialty filter
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");

  // 2. Read the user's choice from the Home Page on load
  useEffect(() => {
    const savedFilter = localStorage.getItem("telemedicine_filter");
    if (savedFilter) {
      setSpecialtyFilter(savedFilter);
    }
  }, []);

  // 3. The Translator Dictionary
  const specialtyMap: Record<string, string> = {
    "general": "General Medicine",
    "cardio": "Cardiology",
    "ortho": "Orthopedics & Trauma", 
    "pedia": "Pediatrics",
    "neuro": "Neurology",
    "gastro": "Gastroenterology",
    "derm": "Dermatology"
  };

  // 4. Filter the doctors list based on the state
  const filteredDoctors = emergencyDoctors.filter((doc) => {
    if (specialtyFilter === "all") return true; 
    const mappedSpecialty = specialtyMap[specialtyFilter];
    if (!mappedSpecialty) return true; 
    return doc.specialty.includes(mappedSpecialty);
  });

  // If a call is active, render the WebRTC Video Room
  if (activeCall) {
    return (
      <div className="relative min-h-screen pt-12">
        <button 
          onClick={() => setActiveCall(null)}
          className="absolute top-0 left-4 z-50 bg-destructive text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-destructive/90 transition-colors"
        >
          ← End Call & Return to Directory
        </button>
        
        <TelemedicineRoom 
          role="patient" 
          roomId={`ROOM-${activeCall.id}`} 
          patientName="Emergency Patient" 
        />
      </div>
    );
  }

  // Otherwise, render the Doctor Directory
  return (
    <div>
      <PageHeader
        icon={Video}
        title="Emergency Telemedicine"
        description="Connect instantly with on-call specialists for immediate video consultation or WhatsApp support."
      />

      {/* 5. The Filter Bar UI for this page */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 mb-2 gap-3 bg-card p-3 rounded-xl border border-border shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">
          Showing: <span className="text-primary">{filteredDoctors.length} Specialists</span>
        </h2>
        <select
          value={specialtyFilter}
          onChange={(e) => {
            setSpecialtyFilter(e.target.value);
            localStorage.setItem("telemedicine_filter", e.target.value);
          }}
          className="border border-border bg-background text-foreground rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary transition-colors"
        >
          <option value="all">All Specialties</option>
          <option value="general">General Medicine</option>
          <option value="cardio">Cardiology</option>
          <option value="neuro">Neurology</option>
          <option value="ortho">Orthopedics & Trauma</option>
          <option value="pedia">Pediatrics</option>
          <option value="gastro">Gastroenterology</option>
          <option value="derm">Dermatology</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
        {/* 6. We map over filteredDoctors instead of emergencyDoctors */}
        {filteredDoctors.map((doc) => {
          const isRealTimeAvailable = checkIsCurrentlyAvailable(doc.timings);

          return (
            <div 
              key={doc.id} 
              className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md flex flex-col"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Header: Name & Status */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{doc.name}</h3>
                  <div className="flex items-center gap-1.5 text-primary mt-1 text-sm font-medium">
                    <Stethoscope className="h-4 w-4" />
                    {doc.specialty}
                  </div>
                </div>
                
                {/* Dynamic Availability Badge */}
                {isRealTimeAvailable ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    AVAILABLE
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold flex items-center gap-1.5">
                    <PhoneOff className="h-3.5 w-3.5" />
                    UNAVAILABLE
                  </span>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-2.5 mb-6 bg-muted/30 p-3 rounded-xl border border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{doc.hospital}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-accent-teal" />
                  <span>Duty Timings: <span className="font-medium text-foreground">{doc.timings}</span></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto flex gap-3">
                {isRealTimeAvailable ? (
                  <>
                    <a 
                      href={`https://wa.me/${doc.whatsapp}?text=Emergency%20Consultation%20Request%20for%20${encodeURIComponent(doc.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                    
                    {/* CHANGED: This is now an anchor tag utilizing the tel: protocol for a direct phone call */}
                    <a 
                      href={`tel:+${doc.whatsapp}`}
                      className="flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:brightness-110"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <Phone className="h-4 w-4" />
                      Call Now
                    </a>
                  </>
                ) : (
                  <button 
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
                  >
                    <Clock className="h-4 w-4" />
                    Outside Duty Hours
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}