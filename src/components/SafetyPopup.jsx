import React, { useState, useEffect } from "react";
import "./SafetyPopup.css";

const SafetyPopup = ({ onAccept, onReject }) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user has already accepted safety instructions in this session
    const safetyAccepted = sessionStorage.getItem("safetyAccepted");
    if (!safetyAccepted) {
      setShowPopup(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem("safetyAccepted", "true");
    setShowPopup(false);
    onAccept();
  };

  const handleReject = () => {
    onReject();
  };

  if (!showPopup) return null;

  return (
    <div className="safety-popup-overlay">
      <div className="safety-popup">
        <div className="safety-popup-header">
          <div className="caution-icon">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth="2"
              />
              <path
                d="M12 6V14"
                stroke="#B8860B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 18H12.01"
                stroke="#B8860B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2>Safety Caution & Instructions</h2>
        </div>

        <div className="safety-popup-content">
          <div className="safety-warning">
            <div className="warning-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="#FF6B6B"
                  stroke="#E53E3E"
                  strokeWidth="2"
                />
                <path
                  d="M12 6V14"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 18H12.01"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3>IMPORTANT SAFETY WARNING</h3>
              <p>
                Fireworks can be dangerous if not handled properly. Please read
                and follow all safety instructions.
              </p>
            </div>
          </div>

          <div className="safety-instructions">
            <h4>Safety Instructions:</h4>
            <ul>
              <li>
                <span className="check-icon">✓</span>
                Always read the instructions on the firecracker pack before use
              </li>
              <li>
                <span className="check-icon">✓</span>
                Maintain a safe distance from fireworks when lighting
              </li>
              <li>
                <span className="check-icon">✓</span>
                Never put your head above the exit point of a firework
              </li>
              <li>
                <span className="check-icon">✓</span>
                If a firework doesn't light, wait 15 minutes, then soak it in
                water
              </li>
              <li>
                <span className="check-icon">✓</span>
                Keep water or a fire extinguisher nearby
              </li>
              <li>
                <span className="check-icon">✓</span>
                Light fireworks in an open area away from buildings and trees
              </li>
              <li>
                <span className="check-icon">✓</span>
                Never relight a "dud" firework
              </li>
              <li>
                <span className="check-icon">✓</span>
                Supervise children at all times
              </li>
              <li>
                <span className="check-icon">✓</span>
                Wear safety glasses when handling fireworks
              </li>
              <li>
                <span className="check-icon">✓</span>
                Store fireworks in a cool, dry place
              </li>
            </ul>
          </div>

          <div className="safety-reminder">
            <p>
              <strong>Remember:</strong> Safety first! Always follow the
              manufacturer's instructions on each firecracker pack.
            </p>
          </div>
        </div>

        <div className="safety-popup-actions">
          <button className="safety-reject-btn" onClick={handleReject}>
            ❌ Reject - I don't agree
          </button>
          <button className="safety-accept-btn" onClick={handleAccept}>
            ✅ Accept - I understand and agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyPopup;
