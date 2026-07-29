import React, { useMemo } from 'react';

export function Avatar2D({ viseme = "REST", isSpeaking = false }) {
  // Define viseme mouth scales (width, height, borderRadius)
  const visemeStyles = useMemo(() => ({
    REST: { width: '30px', height: '4px', borderRadius: '4px' },
    AA:   { width: '25px', height: '22px', borderRadius: '50%' },
    EE:   { width: '40px', height: '10px', borderRadius: '10px' },
    OO:   { width: '15px', height: '15px', borderRadius: '50%' },
    IH:   { width: '35px', height: '12px', borderRadius: '8px' },
    OH:   { width: '20px', height: '25px', borderRadius: '50%' },
  }), []);

  const currentStyle = (isSpeaking && viseme !== "REST") 
    ? (visemeStyles[viseme] || visemeStyles.OO)
    : visemeStyles.REST;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center mx-auto my-8">
      {/* Outer pulsing ring when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full border-4 border-[#6c63ff] animate-ping opacity-20" />
      )}
      
      {/* Avatar Container */}
      <div className={`relative w-56 h-56 rounded-full overflow-hidden border-4 ${isSpeaking ? 'border-[#ff6584] shadow-[0_0_40px_rgba(255,101,132,0.4)]' : 'border-[#6c63ff] shadow-[0_0_30px_rgba(108,99,255,0.3)]'} bg-[#1e293b] transition-all duration-300`}>
        {/* The generated 2D Image */}
        <img 
          src="/teenager_2d.png" 
          alt="AI Avatar" 
          className={`w-full h-full object-cover transition-transform duration-300 ${isSpeaking ? 'scale-105' : 'scale-100'}`}
        />
        
        {/* Dynamic Lip-Sync Mouth Overlay */}
        {/* Positioned roughly where the mouth is on the generated image */}
        <div className="absolute left-1/2 bottom-[15%] -translate-x-1/2 flex items-center justify-center">
          <div 
            className="bg-[#3b1313] shadow-inner transition-all duration-100 ease-out overflow-hidden flex items-end justify-center"
            style={{
              width: currentStyle.width,
              height: currentStyle.height,
              borderRadius: currentStyle.borderRadius,
            }}
          >
            {/* Inner tongue effect for wide open mouths */}
            {(viseme === 'AA' || viseme === 'OH' || viseme === 'EE') && (
              <div className="w-3/4 h-[40%] bg-[#ff7a93] rounded-t-full opacity-90" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
