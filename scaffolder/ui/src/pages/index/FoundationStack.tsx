export default function FoundationStack() {
    return (
        <div className="landing-foundation-stack" aria-hidden="true">
            <svg viewBox="0 0 520 440" role="presentation" focusable="false">
                <defs>
                    <pattern id="landing-grid" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="skewY(-25)">
                        <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#b8f34a" strokeOpacity="0.12" strokeWidth="0.7"/>
                    </pattern>
                    <linearGradient id="landing-top-face" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0" stopColor="#172216"/>
                        <stop offset="1" stopColor="#0a0e09"/>
                    </linearGradient>
                </defs>
                <rect x="12" y="18" width="496" height="404" fill="url(#landing-grid)" opacity="0.7"/>
                <g fill="none" stroke="#b8f34a" strokeOpacity="0.34" strokeWidth="1">
                    <path d="M 80 294 L 260 210 L 444 294 L 260 380 Z"/>
                    <path d="M 100 224 L 260 150 L 424 224 L 260 300 Z"/>
                    <path d="M 125 160 L 260 96 L 398 160 L 260 224 Z"/>
                </g>
                <g strokeLinejoin="round">
                    <polygon points="80,294 260,210 444,294 260,380" fill="url(#landing-top-face)" stroke="#b8f34a" strokeOpacity="0.76" strokeWidth="1.5"/>
                    <polygon points="80,294 260,380 260,411 80,325" fill="#090c08" stroke="#6f9130" strokeOpacity="0.65"/>
                    <polygon points="260,380 444,294 444,325 260,411" fill="#0c110a" stroke="#b8f34a" strokeOpacity="0.72"/>

                    <polygon points="100,224 260,150 424,224 260,300" fill="#101710" stroke="#789a37" strokeOpacity="0.78" strokeWidth="1.3"/>
                    <polygon points="100,224 260,300 260,326 100,250" fill="#090c08" stroke="#6f9130" strokeOpacity="0.64"/>
                    <polygon points="260,300 424,224 424,250 260,326" fill="#0c110a" stroke="#b8f34a" strokeOpacity="0.76"/>

                    <polygon points="125,160 260,96 398,160 260,224" fill="#121a10" stroke="#91bd37" strokeOpacity="0.88" strokeWidth="1.4"/>
                    <polygon points="125,160 260,224 260,250 125,186" fill="#090c08" stroke="#789a37" strokeOpacity="0.67"/>
                    <polygon points="260,224 398,160 398,186 260,250" fill="#0c110a" stroke="#b8f34a" strokeOpacity="0.84"/>

                    <polygon points="151,91 260,39 370,91 260,143" fill="#172216" stroke="#c5ff45" strokeWidth="1.8"/>
                    <polygon points="151,91 260,143 260,169 151,117" fill="#0a0e09" stroke="#82aa34" strokeOpacity="0.86"/>
                    <polygon points="260,143 370,91 370,117 260,169" fill="#101710" stroke="#c5ff45" strokeOpacity="0.9"/>
                </g>
                <g fill="#e7f1dc" fontFamily="Inter, Arial, sans-serif" fontSize="12" fontWeight="600" letterSpacing="1.1" textAnchor="middle">
                    <text x="260" y="105">BUSINESS LOGIC</text>
                    <text x="260" y="174">MODULES</text>
                    <text x="260" y="252">DEVELOPER GUIDANCE</text>
                    <text x="260" y="342">APPLICATION FOUNDATION</text>
                </g>
                <g fill="#c5ff45">
                    <circle cx="91" cy="225" r="3"/>
                    <circle cx="429" cy="158" r="3"/>
                    <circle cx="407" cy="276" r="2.5"/>
                </g>
            </svg>
        </div>
    );
}
