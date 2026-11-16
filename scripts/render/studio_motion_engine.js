/**
 * Studio Motion Engine — AsTrade Video Production
 * Injected into the browser page to provide:
 * 1. Animated SVG Vector Arrows (neon emerald, stroke-dashoffset drawing)
 * 2. Element Pulse Rings (neon attention rings around real DOM elements)
 * 3. Glassmorphic Callout Badges (anchored dynamically to bounding boxes)
 * 4. Realistic Virtual Cursor with Smooth Gliding & Click Ripples
 * 5. Spotlighting (dim background with emerald border cut-out)
 * 6. Realistic Typewriter Effect (character-by-character with input events)
 * 7. Native Confetti Celebration
 */

window.__initStudioMotionEngine = function() {
    if (document.getElementById('studio-motion-container')) return;

    // 1. Inject Styles
    const style = document.createElement('style');
    style.id = 'studio-motion-styles';
    style.innerHTML = `
        #studio-motion-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999900;
            overflow: hidden;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* SVG Motion Canvas */
        #studio-motion-svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999910;
        }

        /* Spotlight Overlay */
        #studio-spotlight-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(5, 8, 18, 0.68);
            opacity: 0;
            transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            z-index: 9999905;
            backdrop-filter: blur(2px);
        }
        #studio-spotlight-overlay.active {
            opacity: 1;
        }
        #studio-spotlight-hole {
            position: absolute;
            border: 2.5px solid #10b981;
            border-radius: 12px;
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.7), inset 0 0 15px rgba(16, 185, 129, 0.25);
            transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
            background: transparent;
        }

        /* Pulse Ring Around Active Element */
        .studio-pulse-ring {
            position: absolute;
            border-radius: 14px;
            border: 3px solid #10b981;
            box-shadow: 0 0 25px rgba(16, 185, 129, 0.8), inset 0 0 12px rgba(16, 185, 129, 0.35);
            pointer-events: none;
            z-index: 9999920;
            animation: studioPulseBreathing 1.4s ease-in-out infinite alternate;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes studioPulseBreathing {
            0% { transform: scale(1.0); box-shadow: 0 0 15px rgba(16, 185, 129, 0.6); }
            100% { transform: scale(1.035); box-shadow: 0 0 35px rgba(16, 185, 129, 0.95), inset 0 0 20px rgba(16, 185, 129, 0.45); }
        }

        /* Virtual Cursor */
        #studio-virtual-cursor {
            position: absolute;
            top: 0;
            left: 0;
            width: 32px;
            height: 32px;
            pointer-events: none;
            z-index: 9999999;
            transform: translate(960px, 540px);
            filter: drop-shadow(0 4px 14px rgba(0,0,0,0.95));
            transition: transform 0.04s linear;
        }
        #studio-cursor-ripple {
            position: absolute;
            top: 0;
            left: 0;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 3px solid #10b981;
            background: rgba(16, 185, 129, 0.3);
            transform: translate(-16px, -16px) scale(0);
            opacity: 0;
            pointer-events: none;
            box-shadow: 0 0 25px #10b981;
        }
        #studio-cursor-ripple.pulse {
            animation: studioRippleAnim 0.45s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
        @keyframes studioRippleAnim {
            0% { transform: translate(-16px, -16px) scale(0.2); opacity: 1; }
            100% { transform: translate(-16px, -16px) scale(2.2); opacity: 0; }
        }

        /* Glassmorphic Lower-Third / Floating Callout Badge */
        #studio-callout-badge {
            position: absolute;
            background: rgba(11, 15, 25, 0.92);
            border: 1.8px solid #10b981;
            border-radius: 16px;
            padding: 16px 22px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(16, 185, 129, 0.25);
            backdrop-filter: blur(14px);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 9999930;
            transform: translateY(20px) scale(0.96);
            opacity: 0;
            transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 580px;
            pointer-events: none;
        }
        #studio-callout-badge.active {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        .studio-pill-tag {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(16, 185, 129, 0.2);
            border: 1px solid #10b981;
            color: #10b981;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 999px;
            margin-bottom: 4px;
        }
        .studio-callout-title {
            font-size: 16px;
            font-weight: 700;
            color: #f8fafc;
            line-height: 1.35;
        }
        .studio-callout-subtitle {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 2px;
        }

        /* Lower Third Step Badge (Fixed at bottom left) */
        #studio-lower-third {
            position: fixed;
            bottom: 40px;
            left: 45px;
            background: rgba(11, 15, 25, 0.94);
            border: 1.8px solid rgba(16, 185, 129, 0.85);
            border-radius: 18px;
            padding: 16px 24px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(16, 185, 129, 0.2);
            backdrop-filter: blur(16px);
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 9999950;
            transform: translateY(120px);
            opacity: 0;
            transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 620px;
            pointer-events: none;
        }
        #studio-lower-third.active {
            transform: translateY(0);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

    // 2. Build Container & Elements
    const container = document.createElement('div');
    container.id = 'studio-motion-container';
    container.innerHTML = `
        <svg id="studio-motion-svg">
            <defs>
                <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#10b981" flood-opacity="0.9"/>
                </filter>
                <marker id="arrow-head-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" filter="url(#emerald-glow)"/>
                </marker>
            </defs>
        </svg>

        <div id="studio-spotlight-overlay">
            <div id="studio-spotlight-hole"></div>
        </div>

        <div id="studio-callout-badge">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16,185,129,0.18); border: 1.5px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #10b981; flex-shrink: 0;" id="studio-callout-icon">⚡</div>
            <div>
                <div class="studio-pill-tag" id="studio-callout-tag">PASO 1</div>
                <div class="studio-callout-title" id="studio-callout-title">Título</div>
                <div class="studio-callout-subtitle" id="studio-callout-subtitle">Subtítulo explicativo</div>
            </div>
        </div>

        <div id="studio-lower-third">
            <div style="width: 46px; height: 46px; border-radius: 14px; background: rgba(16,185,129,0.22); border: 1.5px solid #10b981; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #10b981; flex-shrink: 0;" id="studio-lt-icon">⚡</div>
            <div>
                <div class="studio-pill-tag" id="studio-lt-tag">PASO 1: ONBOARDING</div>
                <div style="font-size: 16px; font-weight: 700; color: #ffffff;" id="studio-lt-title">Acceso y bienvenida a AsTrade</div>
            </div>
        </div>

        <div id="studio-virtual-cursor">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5.65 2.15C5.35 1.85 4.8 2.06 4.8 2.5V20.5C4.8 2.95 5.38 21.15 5.68 20.8L10.3 15.68C10.45 15.52 10.66 15.43 10.88 15.43H18.5C18.94 15.43 19.16 14.88 18.83 14.58L5.65 2.15Z" fill="#0b0f19" stroke="#10b981" stroke-width="2.2"/>
            </svg>
            <div id="studio-cursor-ripple"></div>
        </div>
    `;
    document.body.appendChild(container);

    window.__curX = 960;
    window.__curY = 540;
    window.__pulseRingEl = null;
};

// -------------------------------------------------------------
// MOTION ARROWS (Animated SVG Bézier Curves)
// -------------------------------------------------------------
window.__drawAnimatedArrow = function(startConfig, targetSelector, curvature = 0.25, durationMs = 700) {
    return new Promise(resolve => {
        const svg = document.getElementById('studio-motion-svg');
        if (!svg) return resolve();

        const targetEl = document.querySelector(targetSelector);
        if (!targetEl) {
            console.warn("[StudioMotion] Target not found for arrow:", targetSelector);
            return resolve();
        }

        const tRect = targetEl.getBoundingClientRect();
        const endX = tRect.left + tRect.width / 2;
        const endY = tRect.top + tRect.height / 2;

        let startX, startY;
        if (startConfig && typeof startConfig === 'object') {
            if (startConfig.x !== undefined) {
                startX = startConfig.x;
                startY = startConfig.y;
            } else if (startConfig.offsetX !== undefined) {
                startX = endX + startConfig.offsetX;
                startY = endY + startConfig.offsetY;
            }
        } else {
            // Default: arrow comes from upper-left
            startX = endX - 220;
            startY = endY - 120;
        }

        // Control point for smooth curve
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const dx = endX - startX;
        const dy = endY - startY;
        const cpX = midX - dy * curvature;
        const cpY = midY + dx * curvature;

        const pathData = `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#10b981');
        path.setAttribute('stroke-width', '4');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('marker-end', 'url(#arrow-head-emerald)');
        path.setAttribute('filter', 'url(#emerald-glow)');
        path.classList.add('studio-dynamic-arrow');
        svg.appendChild(path);

        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        const startTime = performance.now();
        function draw(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            path.style.strokeDashoffset = length * (1 - ease);

            if (progress < 1) {
                requestAnimationFrame(draw);
            } else {
                path.style.strokeDashoffset = '0';
                resolve(path);
            }
        }
        requestAnimationFrame(draw);
    });
};

window.__clearMotionArrows = function() {
    const svg = document.getElementById('studio-motion-svg');
    if (!svg) return;
    const arrows = svg.querySelectorAll('.studio-dynamic-arrow');
    arrows.forEach(a => {
        a.style.transition = 'opacity 0.3s ease';
        a.style.opacity = '0';
        setTimeout(() => a.remove(), 300);
    });
};

// -------------------------------------------------------------
// PULSE RING AROUND ELEMENT
// -------------------------------------------------------------
window.__pulseRingAround = function(selector, padding = 8) {
    window.__removePulseRing();
    const el = document.querySelector(selector);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const ring = document.createElement('div');
    ring.className = 'studio-pulse-ring';
    ring.style.left = (rect.left - padding) + 'px';
    ring.style.top = (rect.top - padding) + 'px';
    ring.style.width = (rect.width + padding * 2) + 'px';
    ring.style.height = (rect.height + padding * 2) + 'px';

    document.getElementById('studio-motion-container').appendChild(ring);
    window.__pulseRingEl = ring;
};

window.__removePulseRing = function() {
    if (window.__pulseRingEl) {
        window.__pulseRingEl.remove();
        window.__pulseRingEl = null;
    }
};

// -------------------------------------------------------------
// CALLOUT BADGE & LOWER THIRD
// -------------------------------------------------------------
window.__showCalloutBadge = function(targetSelector, icon, tag, title, subtitle, placement = 'right') {
    const badge = document.getElementById('studio-callout-badge');
    if (!badge) return;

    document.getElementById('studio-callout-icon').innerText = icon || '⚡';
    document.getElementById('studio-callout-tag').innerText = tag || 'DETALLE';
    document.getElementById('studio-callout-title').innerText = title || '';
    document.getElementById('studio-callout-subtitle').innerText = subtitle || '';

    const el = document.querySelector(targetSelector);
    if (el) {
        const rect = el.getBoundingClientRect();
        if (placement === 'right') {
            badge.style.left = (rect.right + 25) + 'px';
            badge.style.top = (rect.top + rect.height / 2 - 40) + 'px';
        } else if (placement === 'left') {
            badge.style.left = (rect.left - 420) + 'px';
            badge.style.top = (rect.top + rect.height / 2 - 40) + 'px';
        } else if (placement === 'bottom') {
            badge.style.left = (rect.left) + 'px';
            badge.style.top = (rect.bottom + 20) + 'px';
        } else {
            badge.style.left = (rect.left) + 'px';
            badge.style.top = (rect.top - 100) + 'px';
        }
    }
    badge.classList.add('active');
};

window.__hideCalloutBadge = function() {
    const badge = document.getElementById('studio-callout-badge');
    if (badge) badge.classList.remove('active');
};

window.__showLowerThird = function(icon, tag, title) {
    const lt = document.getElementById('studio-lower-third');
    if (!lt) return;
    document.getElementById('studio-lt-icon').innerText = icon;
    document.getElementById('studio-lt-tag').innerText = tag;
    document.getElementById('studio-lt-title').innerText = title;
    lt.classList.add('active');
};

window.__hideLowerThird = function() {
    const lt = document.getElementById('studio-lower-third');
    if (lt) lt.classList.remove('active');
};

// -------------------------------------------------------------
// SPOTLIGHT
// -------------------------------------------------------------
window.__spotlightElement = function(selector, padding = 12) {
    const overlay = document.getElementById('studio-spotlight-overlay');
    const hole = document.getElementById('studio-spotlight-hole');
    if (!overlay || !hole) return;

    const el = document.querySelector(selector);
    if (!el) {
        overlay.classList.remove('active');
        return;
    }

    const rect = el.getBoundingClientRect();
    hole.style.left = (rect.left - padding) + 'px';
    hole.style.top = (rect.top - padding) + 'px';
    hole.style.width = (rect.width + padding * 2) + 'px';
    hole.style.height = (rect.height + padding * 2) + 'px';
    overlay.classList.add('active');
};

window.__hideSpotlight = function() {
    const overlay = document.getElementById('studio-spotlight-overlay');
    if (overlay) overlay.classList.remove('active');
};

// -------------------------------------------------------------
// VIRTUAL CURSOR GLIDE & CLICK
// -------------------------------------------------------------
window.__glideCursorTo = function(targetX, targetY, durationMs = 650) {
    return new Promise(resolve => {
        const startX = window.__curX;
        const startY = window.__curY;
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            // Smooth ease in-out cubic
            const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const curX = startX + (targetX - startX) * ease;
            const curY = startY + (targetY - startY) * ease;
            window.__curX = curX;
            window.__curY = curY;

            const el = document.getElementById('studio-virtual-cursor');
            if (el) el.style.transform = `translate(${curX}px, ${curY}px)`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
};

window.__glideCursorToElement = function(selector, durationMs = 650, offsetX = 0.5, offsetY = 0.5) {
    const el = document.querySelector(selector);
    if (!el) return Promise.resolve();
    const rect = el.getBoundingClientRect();
    const targetX = rect.left + rect.width * offsetX;
    const targetY = rect.top + rect.height * offsetY;
    return window.__glideCursorTo(targetX, targetY, durationMs);
};

window.__clickRipple = function() {
    const ripple = document.getElementById('studio-cursor-ripple');
    if (ripple) {
        ripple.classList.remove('pulse');
        void ripple.offsetWidth;
        ripple.classList.add('pulse');
    }
};

// -------------------------------------------------------------
// REALISTIC TYPEWRITER EFFECT
// -------------------------------------------------------------
window.__typeIntoInput = function(selector, text, keyDelayMs = 55) {
    return new Promise(resolve => {
        const input = document.querySelector(selector);
        if (!input) {
            console.warn("[StudioMotion] Input not found:", selector);
            return resolve();
        }

        input.focus();
        input.value = '';
        input.dispatchEvent(new Event('focus', { bubbles: true }));

        let idx = 0;
        function typeNext() {
            if (idx < text.length) {
                input.value += text[idx];
                idx++;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                setTimeout(typeNext, keyDelayMs);
            } else {
                input.dispatchEvent(new Event('blur', { bubbles: true }));
                resolve();
            }
        }
        typeNext();
    });
};

// -------------------------------------------------------------
// CELEBRATION CONFETTI TRIGGER
// -------------------------------------------------------------
window.__triggerCelebrationConfetti = function() {
    if (typeof window.confetti === 'function') {
        window.confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#38bdf8', '#fbbf24']
        });
        setTimeout(() => {
            window.confetti({
                particleCount: 80,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#10b981', '#38bdf8', '#fbbf24']
            });
            window.confetti({
                particleCount: 80,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#10b981', '#38bdf8', '#fbbf24']
            });
        }, 250);
    } else {
        console.log("[StudioMotion] Confetti fired (fallback mock)");
    }
};
