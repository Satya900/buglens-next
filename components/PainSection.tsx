"use client";

import { useState, useEffect, useRef } from "react";

const SLIDES = [
  [
    { side: "left",  text: "Left the same SQL injection comment. Again. This is my third PR this week." },
    { side: "right", text: "I keep forgetting. Good thing you keep catching it!" },
    { side: "left",  text: "I did catch it. For the THIRD TIME." },
    { side: "right", text: "No need for all-caps energy. I'll learn eventually." },
  ],
  [
    { side: "left",  text: "Devin opened 12 PRs overnight. I have to review all of them." },
    { side: "right", text: "They all passed CI!" },
    { side: "left",  text: "CI doesn't check logic. Or security. Or if it even makes sense." },
    { side: "right", text: "...so what does CI check?" },
  ],
  [
    { side: "left",  text: "Why is there a bare try/catch here with no error handling?" },
    { side: "right", text: "It was just to make TypeScript stop complaining." },
    { side: "left",  text: "..." },
    { side: "right", text: "Is that not how you're supposed to do it?" },
  ],
  [
    { side: "left",  text: "This API key is hardcoded in the source file." },
    { side: "right", text: "It's a test key, doesn't matter." },
    { side: "left",  text: "It's in git history now. Forever." },
    { side: "right", text: "Okay but it was just a test." },
  ],
  [
    { side: "left",  text: "Did you read my review comments from last week?" },
    { side: "right", text: "I skimmed them!" },
    { side: "left",  text: "You made the exact same mistake." },
    { side: "right", text: "...I skimmed the wrong part." },
  ],
];

const BUBBLE_DELAY = 900;  // ms between each bubble appearing
const SLIDE_INTERVAL = 7000; // ms before auto-advancing to next slide

export default function PainSection() {
  const [slide, setSlide] = useState(0);
  const [visibleBubbles, setVisibleBubbles] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = (idx: number) => {
    setSlide(idx);
    setVisibleBubbles(0);
  };

  // Animate bubbles in one by one
  useEffect(() => {
    setVisibleBubbles(0);
    let count = 0;
    bubbleTimer.current = setInterval(() => {
      count++;
      setVisibleBubbles(count);
      if (count >= SLIDES[slide].length) {
        if (bubbleTimer.current) clearInterval(bubbleTimer.current);
      }
    }, BUBBLE_DELAY);
    return () => { if (bubbleTimer.current) clearInterval(bubbleTimer.current); };
  }, [slide]);

  // Auto-advance slides
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, []);

  return (
    <section className="section pain-section">
      <div className="pain-inner">

        <div className="pain-left">
          <div className="pain-corner pain-corner-tl" />
          <div className="pain-corner pain-corner-bl" />
          <h2 className="pain-title">
            Code reviews were hard before.<br />
            Now, they feel <em>impossible.</em>
          </h2>
          <p className="pain-sub">
            Your team moves fast with AI. But fast shouldn&apos;t mean sloppy.
            BugLens makes sure every line still earns its merge.
          </p>
        </div>

        <div className="pain-right">
          <div className="pain-corner pain-corner-tr" />
          <div className="pain-corner pain-corner-br" />
          <div className="pain-bubbles">
            {SLIDES[slide].map((msg, i) => (
              <div
                key={`${slide}-${i}`}
                className={`pain-bubble pain-bubble-${msg.side}${i < visibleBubbles ? " pain-bubble-in" : ""}`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="pain-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`pain-dot${slide === i ? " pain-dot-active" : ""}`}
                onClick={() => goToSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
