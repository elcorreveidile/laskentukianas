"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const KEY = "kentukianas_intro_v1";
type Phase = "idle" | "show" | "leaving" | "done";

export default function IntroOverlay() {
  const t = useTranslations("intro");
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) {
        setPhase("done");
        return;
      }
      setPhase("show");
    } catch {
      setPhase("done");
    }
  }, []);

  const enter = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setPhase("leaving");
    window.setTimeout(() => setPhase("done"), 700);
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    setMuted(v.muted);
  };

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      className={`intro ${phase === "leaving" ? "intro--leaving" : ""}`}
      role="dialog"
      aria-label={t("aria")}
    >
      <div className="intro__content">
        <p className="intro__kicker">{t("kicker")}</p>
        <h1 className="intro__title">
          Crónicas
          <br />
          Kentukianas
        </h1>
        <div className="intro__screen">
          <video
            ref={videoRef}
            className="intro__video"
            src="/videos/intro.mp4"
            poster="/videos/intro-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
          />
          <button className="intro__sound" onClick={toggleSound} type="button">
            {muted ? t("sound") : t("mute")}
          </button>
        </div>
        <button className="intro__enter" onClick={enter} type="button">
          {t("enter")}
        </button>
        <button className="intro__skip" onClick={enter} type="button">
          {t("skip")}
        </button>
      </div>
    </div>
  );
}
