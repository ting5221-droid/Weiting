import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import confetti from "canvas-confetti";
import { Search, Map as MapIcon, Plane, Info, Landmark, ShieldAlert, Coins, Share2, Printer, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { fetchCountryDetails, CountryDetails } from "@/src/services/geminiService";

// World map data URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function App() {
  const [visited, setVisited] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryInfo, setCountryInfo] = useState<CountryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPostcard, setShowPostcard] = useState(false);
  const [postcardNote, setPostcardNote] = useState("");

  // Load visited from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("visited-countries");
    if (saved) {
      setVisited(JSON.parse(saved));
    }
  }, []);

  const toggleVisited = (countryName: string) => {
    let newVisited;
    if (visited.includes(countryName)) {
      newVisited = visited.filter(c => c !== countryName);
    } else {
      newVisited = [...visited, countryName];
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setVisited(newVisited);
    localStorage.setItem("visited-countries", JSON.stringify(newVisited));
  };

  const handleCountryClick = async (countryName: string) => {
    setSelectedCountry(countryName);
    setIsLoading(true);
    setCountryInfo(null);
    try {
      const details = await fetchCountryDetails(countryName);
      setCountryInfo(details);
    } catch (error) {
      console.error("Failed to fetch country details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-natural-paper text-natural-ink font-serif flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-natural-border flex items-center justify-between px-8 bg-natural-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-natural-accent rounded-full flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Terra Journal</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-natural-accent">
          <button className="border-b-2 border-natural-accent pb-1">World Map</button>
          <button className="opacity-50 hover:opacity-100 transition-opacity">My Postcards</button>
          <button className="opacity-50 hover:opacity-100 transition-opacity">Travel Stats</button>
        </div>
        <button className="px-6 py-2 bg-natural-olive text-white rounded-full text-xs uppercase tracking-[0.1em] font-sans font-bold hover:bg-opacity-90 transition-all">
          Explore World
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Left: Activity & Inspiration */}
        <aside className="w-64 border-r border-natural-border bg-natural-white hidden lg:flex flex-col">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-natural-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search world..." 
                className="w-full bg-natural-clay border-none rounded-lg py-2 pl-10 pr-4 text-sm font-sans focus:ring-1 ring-natural-accent outline-none"
              />
            </div>
          </div>
          
          <div className="px-6 flex-1 overflow-y-auto">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-natural-muted mb-6 font-sans font-bold">Recent Journeys</h3>
            <div className="space-y-6">
              {visited.slice(-4).reverse().map((name) => (
                <div key={name} className="flex items-center gap-3 group cursor-pointer" onClick={() => handleCountryClick(name)}>
                  <div className="w-10 h-10 rounded-full bg-natural-clay flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    🗺️
                  </div>
                  <div>
                    <p className="text-sm font-bold">{name}</p>
                    <p className="text-[11px] text-natural-muted font-sans uppercase tracking-wider">Visited</p>
                  </div>
                </div>
              ))}
              {visited.length === 0 && (
                <p className="text-xs italic text-natural-muted">Your passport is waiting...</p>
              )}
            </div>
          </div>

          <div className="p-6 bg-natural-paper m-4 rounded-2xl border border-natural-border/50">
            <p className="text-xs font-sans italic leading-relaxed text-natural-accent">
              "The world is a book and those who do not travel read only one page."
            </p>
          </div>
        </aside>

        {/* Main View: Map & Stats */}
        <main className="flex-1 relative bg-natural-clay flex flex-col p-6 overflow-hidden">
          <div className="relative bg-natural-white rounded-[32px] shadow-sm border border-natural-border flex-1 overflow-hidden flex flex-col">
            {/* Map Area */}
            <div className="flex-1 relative bg-stone-50 overflow-hidden">
              <div className="absolute top-8 left-8 z-20 pointer-events-none">
                <h2 className="text-4xl font-light italic text-natural-ink">
                  {selectedCountry ? `Explore ${selectedCountry}` : "Select a Country"}
                </h2>
                <p className="text-xs font-sans tracking-[0.2em] uppercase text-natural-muted mt-1">
                  {visited.length} Countries Visited
                </p>
              </div>

              <ComposableMap
                projectionConfig={{ scale: 120 }}
                className="w-full h-full outline-none"
              >
                <ZoomableGroup center={[20, 0]} zoom={1}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const countryName = geo.properties.name;
                        const isVisited = visited.includes(countryName);
                        const isSelected = selectedCountry === countryName;

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onClick={() => handleCountryClick(countryName)}
                            style={{
                              default: {
                                fill: isVisited ? "#8c7d6b" : isSelected ? "#5A5A40" : "#e8e4dc",
                                stroke: "#fff",
                                strokeWidth: 0.5,
                                outline: "none",
                              },
                              hover: {
                                fill: "#d6d1c7",
                                stroke: "#fff",
                                strokeWidth: 1,
                                outline: "none",
                                cursor: "pointer",
                              },
                              pressed: {
                                fill: "#5A5A40",
                                outline: "none",
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
            </div>

            {/* Quick Stats Panel */}
            <div className="min-h-48 h-auto border-t border-natural-border grid grid-cols-2 md:grid-cols-4 shrink-0 bg-natural-white/50 overflow-y-auto">
              <StatBlock 
                label="Climate" 
                value={countryInfo?.climate || "--"} 
                subtext="Regional Forecast"
                icon={<Info size={14} />}
              />
              <StatBlock 
                label="Visa Status" 
                value={countryInfo?.visa || "--"} 
                subtext="Entry Requirements"
                icon={<Plane size={14} />}
              />
              <StatBlock 
                label="Currency" 
                value={countryInfo?.currency || "--"} 
                subtext="Local Tender"
                icon={<Coins size={14} />}
              />
              <StatBlock 
                label="Status" 
                value={countryInfo ? "Accessed" : "--"} 
                subtext={countryInfo?.warHistory || "History context"}
                isAlert={!!countryInfo}
                icon={<ShieldAlert size={14} />}
              />
            </div>
          </div>
        </main>

        {/* Right Aside: Country Insights & Postcard */}
        <aside className="w-80 p-8 flex flex-col bg-natural-paper border-l border-natural-border lg:flex hidden overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedCountry ? (
              <motion.div
                key={selectedCountry}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-natural-accent mb-6 leading-none">Journal Entry</h3>
                  
                  {/* Postcard Preview Card */}
                  <div 
                    onClick={() => setShowPostcard(true)}
                    className="aspect-[3/2] bg-natural-white p-3 shadow-xl rotate-2 border border-natural-border mb-8 cursor-pointer hover:rotate-0 transition-all group"
                  >
                    <div className="w-full h-full border-2 border-dashed border-natural-border p-3 flex flex-col relative overflow-hidden bg-stone-50">
                      <img 
                        src={`https://picsum.photos/seed/${selectedCountry}/300/200`}
                        alt={selectedCountry}
                        className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale"
                        referrerPolicy="no-referrer"
                      />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="w-12 h-1 bg-natural-clay"></div>
                            <div className="w-24 h-2 bg-natural-clay"></div>
                          </div>
                          <div className="w-8 h-10 border border-natural-accent flex items-center justify-center text-[6px] font-mono shrink-0">STAMP</div>
                        </div>
                        <div className="mt-auto">
                          <p className="text-[10px] font-serif italic text-natural-accent">Greetings from {selectedCountry}...</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => toggleVisited(selectedCountry)}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all mb-4 border-2",
                      visited.includes(selectedCountry)
                        ? "bg-natural-accent text-white border-natural-accent hover:opacity-90"
                        : "border-natural-olive text-natural-olive hover:bg-natural-olive hover:text-white"
                    )}
                  >
                    {visited.includes(selectedCountry) ? "Unmark Journey" : "Log Journey"}
                  </button>
                </div>

                <div className="space-y-8 flex-1">
                  <section>
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                       <Landmark size={16} className="text-natural-accent" />
                       Cultural Highlight
                    </h4>
                    <p className="text-xs leading-relaxed text-natural-ink/70 italic whitespace-pre-wrap">
                      {countryInfo?.features || "Select a country to reveal its unique cultural footprint and historical depth."}
                    </p>
                  </section>
                  
                  {countryInfo && (
                    <section>
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <ShieldAlert size={16} className="text-red-800" />
                        Region Intelligence
                      </h4>
                      <p className="text-xs leading-relaxed text-natural-ink/70 whitespace-pre-wrap">
                        {countryInfo.warHistory}
                      </p>
                    </section>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-natural-border">
                  <button 
                    onClick={() => setShowPostcard(true)}
                    className="w-full py-4 border-2 border-natural-olive text-natural-olive rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-natural-olive hover:text-white transition-all shadow-sm"
                  >
                    Download Journal Page
                  </button>
                </div>
              </motion.div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Search size={40} className="text-natural-muted" />
                  <p className="text-xs italic font-serif px-10">Select a country on the map to begin documentation.</p>
                </div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* Postcard Modal - Re-styled for Natural Tones */}
      <AnimatePresence>
        {showPostcard && selectedCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-clay/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-natural-white w-full max-w-5xl rounded-[32px] shadow-2xl border border-natural-border overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="flex-1 bg-stone-50 p-8 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <Plane size={24} className="text-natural-accent" />
                    <h3 className="text-2xl font-light italic">Aerial View</h3>
                  </div>
                  <button onClick={() => setShowPostcard(false)} className="md:hidden text-natural-muted">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 relative rounded-2xl overflow-hidden shadow-inner group">
                  <img 
                    src={`https://picsum.photos/seed/${selectedCountry}/1200/800`}
                    alt={selectedCountry}
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-10 left-10">
                    <p className="text-6xl font-serif italic text-white drop-shadow-lg">{selectedCountry}</p>
                    <p className="text-xs font-sans tracking-[0.4em] uppercase text-white/70 mt-2">Terra Journal Entry 2026</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-96 p-10 flex flex-col border-l border-natural-border bg-natural-paper relative">
                <button 
                  onClick={() => setShowPostcard(false)} 
                  className="hidden md:flex absolute top-6 right-6 text-natural-muted hover:text-natural-ink transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex-1 space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-natural-accent underline decoration-natural-border underline-offset-8">Dispatch Address</h4>
                      <p className="text-xl italic font-light">To my future self,</p>
                    </div>
                    <div className="w-16 h-20 border-2 border-natural-accent/30 rounded flex items-center justify-center shrink-0">
                       <p className="text-[8px] font-mono uppercase text-natural-accent/40 rotate-90 whitespace-nowrap">Official Seal</p>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea 
                      value={postcardNote}
                      onChange={(e) => setPostcardNote(e.target.value)}
                      placeholder="Capture the essence of this landscape..."
                      className="w-full h-48 bg-transparent border-none outline-none font-serif text-lg leading-relaxed placeholder:text-natural-muted/50 resize-none p-0 italic"
                    />
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-b border-natural-border" />
                  </div>

                  <div className="space-y-4 pt-10">
                    <LabelValue label="Region" value={selectedCountry} />
                    <LabelValue label="Climate" value={countryInfo?.climate || "Determining..."} />
                    <LabelValue label="Currency" value={countryInfo?.currency || "Calculating..."} />
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <button 
                    onClick={() => window.print()}
                    className="w-full py-4 bg-natural-olive text-white font-bold rounded-xl hover:shadow-lg transition-all uppercase text-[10px] tracking-[0.2em]"
                  >
                    Finalize & Print
                  </button>
                  <p className="text-[9px] text-center font-sans uppercase tracking-widest text-natural-muted">
                    This document is a digital artifact of your personal history.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBlock({ label, value, subtext, icon, isAlert }: { label: string, value: string, subtext: string, icon: React.ReactNode, isAlert?: boolean }) {
  return (
    <div className="p-6 border-r border-natural-border last:border-r-0 flex flex-col justify-center gap-1 group">
      <div className="flex items-center gap-2 text-natural-muted group-hover:text-natural-accent transition-colors">
        {icon}
        <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold">{label}</p>
      </div>
      <p className={cn(
        "text-lg font-serif leading-tight",
        isAlert ? "text-natural-olive" : "text-natural-ink"
      )}>{value}</p>
      <p className="text-[10px] text-natural-muted italic mt-1 whitespace-pre-wrap">{subtext}</p>
    </div>
  );
}

function LabelValue({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-natural-border pb-2">
      <span className="text-[10px] uppercase font-sans font-bold text-natural-muted tracking-widest">{label}</span>
      <span className="text-sm font-bold leading-tight">{value}</span>
    </div>
  );
}

