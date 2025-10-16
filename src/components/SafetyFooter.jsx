import React from "react";
import "./SafetyFooter.css";

const SafetyFooter = () => {
  return (
    <div className="safety-footer">
      <div className="safety-footer-content">
        <div className="safety-footer-header">
          <div className="caution-icon">
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
          <h3>Safety Notice</h3>
        </div>

        <div className="safety-footer-warning">
          <div className="warning-icon">
            <svg
              width="30"
              height="30"
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
          <p>
            Fireworks can be dangerous if not handled properly. Please read and
            follow all safety instructions.
          </p>
        </div>

        <div className="safety-footer-instructions">
          <h4>Important Safety Instructions:</h4>
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

        <div className="safety-footer-agreement">
          <p>
            <strong>
              By using this website, you agree to our Terms & Conditions and
              acknowledge that you have read and understood the safety
              instructions above.
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyFooter;
