"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function useNYCTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const parts = fmt.formatToParts(now);
      const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
      setTime(
        `${get("month")}/${get("day")}/${get("year")} ${get("hour")}:${get("minute")} ${get("dayPeriod").toLowerCase()} NYC`
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nycTime = useNYCTime();

  useEffect(() => {
    // Check cookie
    if (document.cookie.includes("piw_sms_subscribed=1")) {
      setSubmitted(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    // Submit via hidden iframe
    form.submit();

    // Set cookie - 365 days
    const d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `piw_sms_subscribed=1;expires=${d.toUTCString()};path=/;SameSite=Lax`;

    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - matches Shopify shop page header */}
      <header className="flex flex-col items-center gap-3 w-full pt-6 pb-4">
        <div className="flex items-center justify-center">
          <a href="https://peaceinwar.com">
            <Image
              src="https://cdn.shopify.com/s/files/1/0671/1643/3712/files/peaceofwar10-1536x1536-1.webp?v=1769938111&width=284"
              alt="Peace In War"
              width={142}
              height={142}
              priority
              className="block"
              style={{ width: "139px", height: "auto" }}
            />
          </a>
        </div>
        {nycTime && (
          <span className="text-[13px] font-normal text-black text-center">
            {nycTime}
          </span>
        )}
        <a
          href="https://peaceinwar.com"
          className="text-[11px] font-normal text-black/60 hover:text-black transition-colors no-underline"
        >
          &#8592; back
        </a>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[320px] px-5 text-center">
          {!submitted ? (
            <>
              <p className="text-[11px] leading-relaxed mb-8 text-black/70">
                enter your phone number to get notified for every drop
                and discounts up to 50% off.
              </p>

              <form
                ref={formRef}
                action="https://api.postscript.io/subscribe/form"
                method="post"
                target="dummyframe"
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
              >
                <input type="hidden" name="shop_id" value="270229" />
                <input type="hidden" name="keyword_id" value="326457" />

                <input
                  name="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  required
                  autoFocus
                  className="w-full h-10 px-3 text-[13px] text-center border-b border-black/15 bg-transparent outline-none focus:border-black transition-colors placeholder:text-black/30"
                />

                <button
                  type="submit"
                  className="w-full h-10 text-[11px] font-bold tracking-wide text-white border-none cursor-pointer transition-opacity hover:opacity-90 uppercase"
                  style={{
                    borderRadius: "6px",
                    outline: "1px solid #404040",
                    background:
                      "linear-gradient(180deg, hsl(0 0% 25%) 0%, hsl(0 0% 10%) 100%)",
                  }}
                >
                  notify me
                </button>

                <p className="text-[9px] leading-tight text-black/40 mt-2">
                  By signing up you agree to receive marketing texts.
                  Msg &amp; data rates may apply.{" "}
                  <a href="https://terms.pscr.pt/legal/shop/pomcollection/terms_of_service" className="underline">Terms</a>
                  {" & "}
                  <a href="https://terms.pscr.pt/legal/shop/pomcollection/privacy_policy" className="underline">Privacy</a>.
                </p>
              </form>
            </>
          ) : (
            <div>
              <p className="text-[11px] text-black/70">
                you&apos;re on the list. we&apos;ll text you.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Hidden iframe for form submission */}
      <iframe
        ref={iframeRef}
        name="dummyframe"
        id="ps__dummyframe"
        width={0}
        height={0}
        style={{ display: "none", border: 0 }}
      />
    </div>
  );
}
