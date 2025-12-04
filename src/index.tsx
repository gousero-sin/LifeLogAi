// LifeLog IA - Life Goes On A.I.
// CloudyNC Aesthetic - Neo-Chinese Cloud Design
// Main Application Entry Point

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Routes
import authRoutes from './routes/auth';
import entriesRoutes from './routes/entries';
import tagsRoutes from './routes/tags';
import settingsRoutes from './routes/settings';
import dashboardRoutes from './routes/dashboard';

// Types
import type { Bindings, Variables } from './types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Middleware
app.use('*', logger());
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// API Routes
app.route('/api/auth', authRoutes);
app.route('/api/entries', entriesRoutes);
app.route('/api/tags', tagsRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    app: 'LifeLog IA',
    version: '2.0.0',
    theme: 'CloudyNC',
    timestamp: new Date().toISOString()
  });
});

// Main HTML page - CloudyNC Aesthetic
app.get('*', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LifeLog IA - Life Goes On A.I.</title>
    <meta name="description" content="Seu diário inteligente com IA - registre, analise e transforme sua vida">
    <meta name="theme-color" content="#f4f1ea">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☁️</text></svg>">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/pt-br.js"></script>
    
    <style>
      /* ========== CloudyNC Design System ========== */
      :root {
        --paper-white: #f4f1ea;
        --void-black: #0a0a0a;
        --mist-blue: #b0c4de;
        --cinnabar-red: #a83f39;
        --ink-gray: #4a4a4a;
        --cloud-white: #faf9f7;
        --jade-green: #5d8a66;
        --gold-accent: #c9a227;
        --shadow-ink: rgba(10, 10, 10, 0.1);
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        background: var(--paper-white);
        color: var(--void-black);
        min-height: 100vh;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Cormorant Garamond', serif;
        font-weight: 500;
      }
      
      /* Custom Scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-track {
        background: var(--paper-white);
      }
      ::-webkit-scrollbar-thumb {
        background: var(--mist-blue);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--cinnabar-red);
      }
      
      /* Selection */
      ::selection {
        background: var(--cinnabar-red);
        color: var(--paper-white);
      }
      
      /* ========== Subtle Background Pattern ========== */
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.03;
        background-image: radial-gradient(circle at 20% 50%, var(--mist-blue) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, var(--mist-blue) 0%, transparent 50%);
        pointer-events: none;
      }
      
      /* Goo Morphing Cursor */
      #goo-cursor {
        pointer-events: none;
        position: fixed;
        display: block;
        border-radius: 0;
        transform-origin: center center;
        top: 0;
        left: 0;
        z-index: 10000;
        filter: url("#goo");
      }
      
      #goo-cursor span {
        position: absolute;
        display: block;
        width: 26px;
        height: 26px;
        border-radius: 20px;
        background-color: var(--void-black);
        transform-origin: center center;
        transform: translate(-50%, -50%);
      }
      
      /* Hide default cursor on desktop */
      @media (pointer: fine) {
        * {
          cursor: none !important;
        }
      }
      
      /* ========== Layout Components ========== */
      .app-container {
        min-height: 100vh;
        position: relative;
      }
      
      /* Navigation */
      .nav-cloud {
        position: sticky;
        top: 0;
        z-index: 100;
        background: linear-gradient(to bottom, var(--paper-white) 0%, transparent 100%);
        padding: 1rem 0 2rem;
      }
      
      .nav-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
      }
      
      .logo-icon {
        font-size: 2rem;
      }
      
      .logo-text {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--void-black);
        letter-spacing: -0.02em;
      }
      
      .logo-badge {
        font-size: 0.6rem;
        background: var(--cinnabar-red);
        color: var(--paper-white);
        padding: 0.15rem 0.4rem;
        border-radius: 2rem;
        font-weight: 600;
        letter-spacing: 0.05em;
      }
      
      .nav-links {
        display: flex;
        gap: 0.5rem;
      }
      
      .nav-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid transparent;
        background: transparent;
        color: var(--ink-gray);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        transition: all 0.3s ease;
      }
      
      .nav-btn:hover {
        background: var(--void-black);
        color: var(--paper-white);
        transform: translateY(-2px);
      }
      
      .nav-btn.active {
        background: var(--void-black);
        color: var(--paper-white);
      }
      
      .nav-btn.logout:hover {
        background: var(--cinnabar-red);
        border-color: var(--cinnabar-red);
      }
      
      /* Cloud Divider */
      .cloud-divider {
        width: 100%;
        height: 80px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.15' fill='%23b0c4de'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.3' fill='%23b0c4de'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' fill='%23f4f1ea'%3E%3C/path%3E%3C/svg%3E");
        background-size: cover;
        margin: -1px 0;
      }
      
      .cloud-divider.flip {
        transform: rotate(180deg);
      }
      
      /* Main Content */
      .main-content {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 1.5rem 4rem;
      }
      
      /* ========== Cards ========== */
      .card {
        background: var(--cloud-white);
        border-radius: 1rem;
        padding: 1.5rem;
        border: 1px solid var(--shadow-ink);
        box-shadow: 0 4px 20px var(--shadow-ink);
        transition: all 0.4s ease;
      }
      
      .card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px var(--shadow-ink);
      }
      
      .card-ink {
        background: linear-gradient(135deg, var(--void-black) 0%, #1a1a1a 100%);
        color: var(--paper-white);
        border: none;
      }
      
      .card-ink .card-title {
        color: var(--paper-white);
      }
      
      .card-mist {
        background: linear-gradient(135deg, var(--mist-blue) 0%, #c8d9eb 100%);
        border: none;
      }
      
      .card-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--void-black);
        margin-bottom: 0.75rem;
      }
      
      .card-subtitle {
        font-size: 0.875rem;
        color: var(--ink-gray);
        opacity: 0.8;
      }
      
      /* ========== Buttons with Slide Animation ========== */
      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        border: 1px solid var(--void-black);
        background: transparent;
        color: var(--void-black);
        font-family: 'Cormorant Garamond', serif;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        position: relative;
        overflow: hidden;
        z-index: 1;
        transition: color 0.4s ease;
      }
      
      .btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 125%;
        height: 100%;
        background: var(--void-black);
        transform: translateX(-112%) skew(-10deg);
        transform-origin: right;
        transition: transform 0.65s cubic-bezier(0.77, 0, 0.175, 1);
        z-index: -1;
      }
      
      .btn:hover::before {
        transform: translateX(-12%) skew(-10deg);
      }
      
      .btn:hover {
        color: var(--paper-white);
      }
      
      .btn-primary {
        background: var(--void-black);
        color: var(--paper-white);
        border-color: var(--void-black);
      }
      
      .btn-primary::before {
        background: var(--cinnabar-red);
        transform: translateX(-112%) skew(-10deg);
      }
      
      .btn-primary:hover::before {
        transform: translateX(-12%) skew(-10deg);
      }
      
      .btn-ghost {
        border-color: transparent;
        color: var(--ink-gray);
      }
      
      .btn-ghost::before {
        background: var(--shadow-ink);
      }
      
      .btn-ghost:hover {
        color: var(--void-black);
      }
      
      .btn-cinnabar {
        background: var(--cinnabar-red);
        border-color: var(--cinnabar-red);
        color: var(--paper-white);
      }
      
      .btn-cinnabar::before {
        background: #8a3430;
      }
      
      /* ========== Forms ========== */
      .input-field {
        width: 100%;
        padding: 1rem 1.25rem;
        border: 1px solid var(--shadow-ink);
        border-radius: 0.5rem;
        background: var(--cloud-white);
        color: var(--void-black);
        font-family: 'Inter', sans-serif;
        font-size: 1rem;
        transition: all 0.3s ease;
      }
      
      .input-field:focus {
        outline: none;
        border-color: var(--mist-blue);
        box-shadow: 0 0 0 3px rgba(176, 196, 222, 0.3);
      }
      
      .input-field::placeholder {
        color: var(--ink-gray);
        opacity: 0.5;
      }
      
      .input-label {
        display: block;
        font-family: 'Cormorant Garamond', serif;
        font-size: 1rem;
        font-weight: 500;
        color: var(--void-black);
        margin-bottom: 0.5rem;
      }
      
      textarea.input-field {
        resize: none;
        min-height: 120px;
      }
      
      /* Range Slider */
      .slider-container {
        width: 100%;
      }
      
      .slider-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      
      .slider-value {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--cinnabar-red);
      }
      
      input[type="range"] {
        -webkit-appearance: none;
        width: 100%;
        height: 6px;
        background: linear-gradient(to right, var(--mist-blue), var(--cinnabar-red));
        border-radius: 3px;
        outline: none;
      }
      
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--void-black);
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }
      
      /* ========== Tags ========== */
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.75rem;
        border-radius: 2rem;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;
      }
      
      .tag:hover {
        transform: translateY(-2px);
      }
      
      .tag.selected {
        box-shadow: 0 0 0 2px var(--void-black);
      }
      
      /* ========== Mood Emojis ========== */
      .mood-selector {
        display: flex;
        justify-content: space-between;
        gap: 0.25rem;
        flex-wrap: wrap;
      }
      
      .mood-btn {
        font-size: 1.75rem;
        padding: 0.5rem;
        background: transparent;
        border: 2px solid transparent;
        border-radius: 0.75rem;
        cursor: pointer;
        transition: all 0.2s ease;
        filter: grayscale(0.5);
      }
      
      .mood-btn:hover {
        transform: scale(1.15);
        filter: grayscale(0);
      }
      
      .mood-btn.selected {
        background: var(--mist-blue);
        border-color: var(--void-black);
        filter: grayscale(0);
        transform: scale(1.2);
        box-shadow: 0 4px 12px var(--shadow-ink);
      }
      
      /* ========== Stats Grid ========== */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      
      @media (min-width: 640px) {
        .stats-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      
      .stat-card {
        text-align: center;
        padding: 1.25rem;
        background: var(--cloud-white);
        border-radius: 1rem;
        border: 1px solid var(--shadow-ink);
      }
      
      .stat-value {
        font-family: 'Cormorant Garamond', serif;
        font-size: 2rem;
        font-weight: 700;
        color: var(--void-black);
        line-height: 1;
      }
      
      .stat-label {
        font-size: 0.75rem;
        color: var(--ink-gray);
        margin-top: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      /* ========== Entry Cards ========== */
      .entry-card {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--cloud-white);
        border-radius: 1rem;
        border: 1px solid var(--shadow-ink);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .entry-card:hover {
        transform: translateX(8px);
        border-color: var(--mist-blue);
        box-shadow: -4px 0 0 var(--cinnabar-red);
      }
      
      .entry-emoji {
        font-size: 2.5rem;
        flex-shrink: 0;
      }
      
      .entry-content {
        flex: 1;
        min-width: 0;
      }
      
      .entry-date {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--void-black);
      }
      
      .entry-preview {
        font-size: 0.875rem;
        color: var(--ink-gray);
        margin-top: 0.25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .entry-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: var(--ink-gray);
      }
      
      /* ========== Animations ========== */
      .fade-in {
        animation: fadeIn 0.5s ease-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .slide-up {
        animation: slideUp 0.4s ease-out;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Loading */
      .ink-loader {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--void-black);
        animation: inkPulse 1.5s ease-in-out infinite;
      }
      
      @keyframes inkPulse {
        0%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        50% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      /* Toast */
      .toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: var(--void-black);
        color: var(--paper-white);
        border-radius: 0.5rem;
        font-size: 0.9rem;
        z-index: 1000;
        animation: toastIn 0.3s ease-out;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      }
      
      .toast.success {
        border-left: 4px solid var(--jade-green);
      }
      
      .toast.error {
        border-left: 4px solid var(--cinnabar-red);
      }
      
      .toast.warning {
        border-left: 4px solid var(--gold-accent);
      }
      
      @keyframes toastIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      /* ========== Discrete Mode ========== */
      .discrete-mode .sensitive {
        filter: blur(6px);
        transition: filter 0.3s ease;
      }
      
      .discrete-mode .sensitive:hover {
        filter: blur(0);
      }
      
      /* ========== Charts ========== */
      .chart-container {
        background: var(--cloud-white);
        border-radius: 1rem;
        padding: 1.5rem;
        border: 1px solid var(--shadow-ink);
      }
      
      /* ========== Insights Page ========== */
      .insight-card {
        background: var(--cloud-white);
        border-radius: 1rem;
        padding: 1.5rem;
        border-left: 4px solid var(--cinnabar-red);
        margin-bottom: 1rem;
      }
      
      .insight-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--void-black);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      
      .insight-list {
        list-style: none;
        padding: 0;
      }
      
      .insight-list li {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.5rem 0;
        color: var(--ink-gray);
        font-size: 0.95rem;
        line-height: 1.5;
      }
      
      .insight-list li i {
        color: var(--jade-green);
        margin-top: 0.25rem;
      }
      
      /* ========== Responsive ========== */
      @media (max-width: 640px) {
        .nav-btn {
          width: 40px;
          height: 40px;
          font-size: 1rem;
        }
        
        .logo-text {
          font-size: 1.4rem;
        }
        
        .card {
          padding: 1.25rem;
        }
        
        .mood-btn {
          font-size: 1.4rem;
          padding: 0.35rem;
        }
      }
      
      /* Hide cursor on touch devices */
      @media (pointer: coarse) {
        .ink-cursor, .ink-cursor-trail {
          display: none;
        }
      }
    </style>
</head>
<body>
    <!-- SVG Goo Filter -->
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="position: absolute; width: 0; height: 0;">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
        </filter>
      </defs>
    </svg>
    
    <div id="app"></div>
    
    <!-- Goo Morphing Cursor -->
    <div id="goo-cursor"></div>
    
    <script>
      // Initialize dayjs
      dayjs.locale('pt-br');
      
      // ========== Goo Morphing Cursor ==========
      const gooCursor = document.getElementById('goo-cursor');
      const amount = 20;
      const sineDots = Math.floor(amount * 0.3);
      const width = 26;
      const idleTimeout = 150;
      let lastFrame = 0;
      let mousePosition = {x: 0, y: 0};
      let dots = [];
      let timeoutID;
      let idle = false;
      
      // Only enable on desktop (pointer: fine)
      const isDesktop = window.matchMedia('(pointer: fine)').matches;
      
      if (!isDesktop) {
        gooCursor.style.display = 'none';
      }
      
      class Dot {
        constructor(index = 0) {
          this.index = index;
          this.anglespeed = 0.05;
          this.x = 0;
          this.y = 0;
          this.scale = 1 - 0.05 * index;
          this.range = width / 2 - width / 2 * this.scale + 2;
          this.limit = width * 0.75 * this.scale;
          this.element = document.createElement('span');
          this.element.style.transform = \`scale(\${this.scale})\`;
          gooCursor.appendChild(this.element);
        }
        
        lock() {
          this.lockX = this.x;
          this.lockY = this.y;
          this.angleX = Math.PI * 2 * Math.random();
          this.angleY = Math.PI * 2 * Math.random();
        }
        
        draw(delta) {
          if (!idle || this.index <= sineDots) {
            this.element.style.transform = \`translate(\${this.x}px, \${this.y}px) scale(\${this.scale})\`;
          } else {
            this.angleX += this.anglespeed;
            this.angleY += this.anglespeed;
            this.y = this.lockY + Math.sin(this.angleY) * this.range;
            this.x = this.lockX + Math.sin(this.angleX) * this.range;
            this.element.style.transform = \`translate(\${this.x}px, \${this.y}px) scale(\${this.scale})\`;
          }
        }
      }
      
      function buildDots() {
        for (let i = 0; i < amount; i++) {
          dots.push(new Dot(i));
        }
      }
      
      function startIdleTimer() {
        timeoutID = setTimeout(goInactive, idleTimeout);
        idle = false;
      }
      
      function resetIdleTimer() {
        clearTimeout(timeoutID);
        startIdleTimer();
      }
      
      function goInactive() {
        idle = true;
        dots.forEach(dot => dot.lock());
      }
      
      const onMouseMove = (e) => {
        mousePosition.x = e.clientX - width / 2;
        mousePosition.y = e.clientY - width / 2;
        resetIdleTimer();
      };
      
      const onTouchMove = (e) => {
        mousePosition.x = e.touches[0].clientX - width / 2;
        mousePosition.y = e.touches[0].clientY - width / 2;
        resetIdleTimer();
      };
      
      const render = (timestamp) => {
        const delta = timestamp - lastFrame;
        positionCursor(delta);
        lastFrame = timestamp;
        requestAnimationFrame(render);
      };
      
      const positionCursor = (delta) => {
        let x = mousePosition.x;
        let y = mousePosition.y;
        
        dots.forEach((dot, index, dots) => {
          let nextDot = dots[index + 1] || dots[0];
          dot.x = x;
          dot.y = y;
          dot.draw(delta);
          
          if (!idle || index <= sineDots) {
            const dx = (nextDot.x - dot.x) * 0.35;
            const dy = (nextDot.y - dot.y) * 0.35;
            x += dx;
            y += dy;
          }
        });
      };
      
      if (isDesktop) {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove);
        buildDots();
        lastFrame = Date.now();
        render(lastFrame);
      }
      
      // ========== App State ==========
      const state = {
        user: null,
        token: localStorage.getItem('lifelog_token'),
        currentView: 'login',
        entries: [],
        tags: [],
        settings: null,
        stats: null,
        isLoading: false,
        discreteMode: false,
        savingMessage: null,
        latestInsights: null,
        latestEntryId: null
      };
      
      // ========== API Helper ==========
      const api = {
        baseUrl: '/api',
        
        async request(endpoint, options = {}) {
          const headers = {
            'Content-Type': 'application/json',
            ...options.headers
          };
          
          if (state.token) {
            headers['Authorization'] = 'Bearer ' + state.token;
          }
          
          try {
            const response = await fetch(this.baseUrl + endpoint, {
              ...options,
              headers
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              if (response.status === 401) {
                logout();
              }
              throw new Error(data.error || 'Erro na requisição');
            }
            
            return data;
          } catch (error) {
            console.error('API Error:', error);
            throw error;
          }
        },
        
        get: (endpoint) => api.request(endpoint),
        post: (endpoint, body) => api.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
        patch: (endpoint, body) => api.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
        delete: (endpoint) => api.request(endpoint, { method: 'DELETE' })
      };
      
      // ========== Utility Functions ==========
      const getMoodEmoji = (mood) => {
        const emojis = ['😭', '😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];
        return emojis[mood] || '😐';
      };
      
      const formatDate = (date) => dayjs(date).format('D [de] MMMM');
      const formatDateShort = (date) => dayjs(date).format('DD/MM');
      
      const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      };
      
      // ========== Auth Functions ==========
      async function login(email, password) {
        try {
          state.isLoading = true;
          render();
          
          const data = await api.post('/auth/login', { email, password });
          state.token = data.token;
          state.user = data.user;
          localStorage.setItem('lifelog_token', data.token);
          
          await loadInitialData();
          state.currentView = 'home';
          showToast('Bem-vindo de volta, ' + state.user.name.split(' ')[0] + '!', 'success');
        } catch (error) {
          showToast(error.message, 'error');
        } finally {
          state.isLoading = false;
          render();
        }
      }
      
      async function register(name, email, password) {
        try {
          state.isLoading = true;
          render();
          
          const data = await api.post('/auth/register', { name, email, password });
          state.token = data.token;
          state.user = data.user;
          localStorage.setItem('lifelog_token', data.token);
          
          await loadInitialData();
          state.currentView = 'home';
          showToast('Bem-vindo ao LifeLog IA!', 'success');
        } catch (error) {
          showToast(error.message, 'error');
        } finally {
          state.isLoading = false;
          render();
        }
      }
      
      function logout() {
        state.token = null;
        state.user = null;
        state.entries = [];
        state.tags = [];
        state.settings = null;
        state.stats = null;
        localStorage.removeItem('lifelog_token');
        state.currentView = 'login';
        render();
      }
      
      async function checkAuth() {
        if (!state.token) return false;
        try {
          const data = await api.get('/auth/me');
          state.user = data.user;
          return true;
        } catch {
          logout();
          return false;
        }
      }
      
      async function loadInitialData() {
        try {
          const [tagsData, settingsData, statsData, entriesData] = await Promise.all([
            api.get('/tags'),
            api.get('/settings'),
            api.get('/dashboard/stats?period=7'),
            api.get('/entries?limit=30')
          ]);
          
          state.tags = tagsData.tags;
          state.settings = settingsData.settings;
          state.stats = statsData.stats;
          state.entries = entriesData.entries;
          state.discreteMode = settingsData.settings?.discrete_mode;
        } catch (error) {
          console.error('Error loading data:', error);
        }
      }
      
      // ========== Entry Functions ==========
      async function saveEntry(entryData) {
        try {
          state.isLoading = true;
          state.savingMessage = 'Salvando entrada...';
          render();
          
          const willProcessAI = state.settings?.has_api_key && !entryData.is_private;
          if (willProcessAI) {
            state.savingMessage = 'Processando com IA...';
            render();
          }
          
          const data = await api.post('/entries', entryData);
          
          const existingIndex = state.entries.findIndex(e => e.entry_date === data.entry_date);
          if (existingIndex >= 0) {
            state.entries[existingIndex] = data;
          } else {
            state.entries.unshift(data);
          }
          
          if (data.ai_insights) {
            showToast('Entrada salva com insights!', 'success');
            state.latestInsights = data.ai_insights;
            state.latestEntryId = data.id;
            state.currentView = 'insights-result';
          } else {
            showToast('Entrada salva!', 'success');
            state.currentView = 'home';
          }
          
          const statsData = await api.get('/dashboard/stats?period=7');
          state.stats = statsData.stats;
        } catch (error) {
          showToast(error.message, 'error');
        } finally {
          state.isLoading = false;
          state.savingMessage = null;
          render();
        }
      }
      
      async function generateInsights(entryId) {
        try {
          state.isLoading = true;
          render();
          
          const data = await api.post('/entries/' + entryId + '/insights');
          showToast('Insights gerados!', 'success');
          
          const entryData = await api.get('/entries/' + entryId);
          const index = state.entries.findIndex(e => e.id === entryId);
          if (index >= 0) {
            state.entries[index] = entryData;
          }
          
          return data.insights;
        } catch (error) {
          showToast(error.message, 'error');
          return null;
        } finally {
          state.isLoading = false;
          render();
        }
      }
      
      async function updateSettings(settingsData) {
        try {
          const data = await api.patch('/settings', settingsData);
          state.settings = data.settings;
          state.discreteMode = data.settings.discrete_mode;
          showToast('Configurações atualizadas!', 'success');
        } catch (error) {
          showToast(error.message, 'error');
        }
        render();
      }
      
      async function testApiKey(apiKey) {
        try {
          const data = await api.post('/settings/test-api-key', { api_key: apiKey });
          if (data.valid) {
            showToast('API Key válida!', 'success');
            return true;
          } else {
            showToast(data.error || 'API Key inválida', 'error');
            return false;
          }
        } catch (error) {
          showToast(error.message, 'error');
          return false;
        }
      }
      
      function viewEntry(entryId) {
        state.selectedEntryId = entryId;
        state.currentView = 'view-entry';
        render();
      }
      
      async function toggleFavorite(entryId) {
        try {
          const data = await api.patch('/entries/' + entryId + '/favorite');
          const entry = state.entries.find(e => e.id === entryId);
          if (entry) entry.is_favorite = data.is_favorite;
          render();
        } catch (error) {
          showToast('Erro ao atualizar', 'error');
        }
      }
      
      async function loadStats(days) {
        try {
          const data = await api.get('/dashboard/stats?period=' + days);
          state.stats = data.stats;
          render();
          setTimeout(renderCharts, 100);
        } catch (error) {
          showToast('Erro ao carregar estatísticas', 'error');
        }
      }
      
      // ========== Form Handlers ==========
      let selectedMood = null;
      
      function selectMood(mood) {
        selectedMood = mood;
        document.getElementById('entry-mood').value = mood;
        document.querySelectorAll('.mood-btn').forEach(el => {
          el.classList.toggle('selected', parseInt(el.dataset.mood) === mood);
        });
      }
      
      function toggleTag(tagId) {
        const input = document.getElementById('entry-tags');
        let tags = input.value ? input.value.split(',').map(Number) : [];
        
        if (tags.includes(tagId)) {
          tags = tags.filter(t => t !== tagId);
        } else {
          tags.push(tagId);
        }
        
        input.value = tags.join(',');
        
        document.querySelectorAll('.tag').forEach(el => {
          const id = parseInt(el.dataset.tag);
          el.classList.toggle('selected', tags.includes(id));
        });
      }
      
      function handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        if (email && password) {
          login(email, password);
        } else {
          showToast('Preencha todos os campos', 'warning');
        }
      }
      
      function handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        if (name && email && password) {
          register(name, email, password);
        } else {
          showToast('Preencha todos os campos', 'warning');
        }
      }
      
      function handleSaveEntry() {
        const entryData = {
          entry_date: document.getElementById('entry-date').value,
          mood: document.getElementById('entry-mood').value ? parseInt(document.getElementById('entry-mood').value) : null,
          energy: parseInt(document.getElementById('entry-energy').value),
          stress: parseInt(document.getElementById('entry-stress').value),
          sleep_hours: document.getElementById('entry-sleep-hours').value ? parseFloat(document.getElementById('entry-sleep-hours').value) : null,
          sleep_quality: parseInt(document.getElementById('entry-sleep-quality').value),
          focus: parseInt(document.getElementById('entry-focus').value),
          content: document.getElementById('entry-content').value || null,
          highlight: document.getElementById('entry-highlight').value || null,
          is_private: document.getElementById('entry-private').checked,
          tag_ids: document.getElementById('entry-tags').value ? document.getElementById('entry-tags').value.split(',').map(Number) : []
        };
        saveEntry(entryData);
      }
      
      function handleTestApiKey() {
        const apiKey = document.getElementById('api-key-input').value;
        if (!apiKey) {
          showToast('Digite uma API key', 'warning');
          return;
        }
        testApiKey(apiKey);
      }
      
      function handleSaveApiKey() {
        const apiKey = document.getElementById('api-key-input').value;
        if (!apiKey) {
          showToast('Digite uma API key', 'warning');
          return;
        }
        updateSettings({ deepseek_api_key: apiKey });
      }
      
      function showRegisterForm() {
        document.getElementById('auth-form').innerHTML = renderRegisterFormContent();
      }
      
      function showLoginForm() {
        render();
      }
      
      // ========== Render Functions ==========
      function renderNav() {
        return \`
          <nav class="nav-cloud">
            <div class="nav-inner">
              <div class="logo clickable" onclick="state.currentView = 'home'; render();">
                <span class="logo-icon">☁️</span>
                <span class="logo-text">LifeLog</span>
                <span class="logo-badge">IA</span>
              </div>
              
              <div class="nav-links">
                <button class="nav-btn \${state.currentView === 'home' ? 'active' : ''}" onclick="state.currentView = 'home'; render();" title="Início">
                  <i class="fas fa-home"></i>
                </button>
                <button class="nav-btn \${state.currentView === 'new-entry' ? 'active' : ''}" onclick="state.currentView = 'new-entry'; render();" title="Nova Entrada">
                  <i class="fas fa-feather-alt"></i>
                </button>
                <button class="nav-btn \${state.currentView === 'timeline' ? 'active' : ''}" onclick="state.currentView = 'timeline'; render();" title="Timeline">
                  <i class="fas fa-stream"></i>
                </button>
                <button class="nav-btn \${state.currentView === 'dashboard' ? 'active' : ''}" onclick="state.currentView = 'dashboard'; render();" title="Dashboard">
                  <i class="fas fa-chart-area"></i>
                </button>
                <button class="nav-btn \${state.currentView === 'settings' ? 'active' : ''}" onclick="state.currentView = 'settings'; render();" title="Configurações">
                  <i class="fas fa-cog"></i>
                </button>
                <button class="nav-btn logout" onclick="logout()" title="Sair">
                  <i class="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </nav>
        \`;
      }
      
      function renderLoginPage() {
        return \`
          <div class="app-container" style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem;">
            <div class="card fade-in" style="max-width: 420px; width: 100%;">
              <div style="text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">☁️</div>
                <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">LifeLog IA</h1>
                <p style="color: var(--ink-gray); font-style: italic; font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;">
                  Life Goes On A.I.
                </p>
                <p style="color: var(--ink-gray); font-size: 0.85rem; margin-top: 0.5rem;">
                  Seu diário inteligente
                </p>
              </div>
              
              <div id="auth-form">
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                  <div>
                    <label class="input-label">Email</label>
                    <input type="email" id="login-email" class="input-field" placeholder="seu@email.com">
                  </div>
                  <div>
                    <label class="input-label">Senha</label>
                    <input type="password" id="login-password" class="input-field" placeholder="••••••••">
                  </div>
                  <button onclick="handleLogin()" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 0.5rem;" \${state.isLoading ? 'disabled' : ''}>
                    \${state.isLoading ? '<div class="ink-loader" style="width: 20px; height: 20px;"></div>' : '<i class="fas fa-sign-in-alt"></i> Entrar'}
                  </button>
                </div>
                <p style="text-align: center; margin-top: 1.5rem; color: var(--ink-gray); font-size: 0.9rem;">
                  Não tem conta? <a onclick="showRegisterForm()" class="clickable" style="color: var(--cinnabar-red); cursor: pointer; font-weight: 500;">Criar conta</a>
                </p>
              </div>
            </div>
          </div>
        \`;
      }
      
      function renderRegisterFormContent() {
        return \`
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label class="input-label">Nome</label>
              <input type="text" id="register-name" class="input-field" placeholder="Seu nome">
            </div>
            <div>
              <label class="input-label">Email</label>
              <input type="email" id="register-email" class="input-field" placeholder="seu@email.com">
            </div>
            <div>
              <label class="input-label">Senha</label>
              <input type="password" id="register-password" class="input-field" placeholder="Mínimo 6 caracteres">
            </div>
            <button onclick="handleRegister()" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 0.5rem;">
              <i class="fas fa-user-plus"></i> Criar Conta
            </button>
          </div>
          <p style="text-align: center; margin-top: 1.5rem; color: var(--ink-gray); font-size: 0.9rem;">
            Já tem conta? <a onclick="showLoginForm()" class="clickable" style="color: var(--cinnabar-red); cursor: pointer; font-weight: 500;">Fazer login</a>
          </p>
        \`;
      }
      
      function renderHomePage() {
        const today = dayjs().format('YYYY-MM-DD');
        const todayEntry = state.entries.find(e => e.entry_date === today);
        
        return \`
          \${renderNav()}
          <div class="cloud-divider"></div>
          <main class="main-content \${state.discreteMode ? 'discrete-mode' : ''}">
            <!-- Welcome -->
            <div class="fade-in" style="margin-bottom: 2rem;">
              <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">
                Olá, \${state.user?.name?.split(' ')[0] || 'viajante'} <span style="font-size: 1.5rem;">☁️</span>
              </h1>
              <p style="color: var(--ink-gray); font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-style: italic;">
                \${dayjs().format('dddd, D [de] MMMM [de] YYYY')}
              </p>
            </div>
            
            <!-- Stats -->
            <div class="stats-grid fade-in" style="margin-bottom: 2rem; animation-delay: 0.1s;">
              <div class="stat-card">
                <div class="stat-value" style="color: var(--cinnabar-red);">\${state.stats?.currentStreak || 0}</div>
                <div class="stat-label">dias seguidos</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">\${getMoodEmoji(Math.round(state.stats?.avgMood || 5))}</div>
                <div class="stat-label">humor médio</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" style="color: var(--mist-blue);">\${state.stats?.avgSleep?.toFixed(1) || '-'}h</div>
                <div class="stat-label">sono médio</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" style="color: var(--jade-green);">\${state.stats?.avgEnergy?.toFixed(1) || '-'}</div>
                <div class="stat-label">energia</div>
              </div>
            </div>
            
            <!-- Today CTA -->
            \${!todayEntry ? \`
              <div class="card card-ink fade-in" style="margin-bottom: 2rem; animation-delay: 0.2s;">
                <h2 style="color: var(--paper-white); font-size: 1.5rem; margin-bottom: 0.5rem;">
                  Como foi seu dia? <span style="opacity: 0.7;">✨</span>
                </h2>
                <p style="color: var(--mist-blue); margin-bottom: 1.5rem; font-size: 0.95rem;">
                  Registre seus pensamentos e deixe a IA transformar em insights.
                </p>
                <button onclick="state.currentView = 'new-entry'; render();" class="btn" style="background: var(--paper-white); color: var(--void-black); border-color: var(--paper-white);">
                  <i class="fas fa-feather-alt"></i> Registrar agora
                </button>
              </div>
            \` : \`
              <div class="card fade-in" style="margin-bottom: 2rem; animation-delay: 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                  <h3 class="card-title" style="margin: 0;">
                    <i class="fas fa-check-circle" style="color: var(--jade-green); margin-right: 0.5rem;"></i>Entrada de hoje
                  </h3>
                  <button onclick="state.currentView = 'new-entry'; render();" class="btn btn-ghost" style="padding: 0.5rem 1rem;">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span style="font-size: 2.5rem;">\${getMoodEmoji(todayEntry.mood || 5)}</span>
                  <div>
                    <p style="font-weight: 500;">Humor: \${todayEntry.mood || '-'}/10</p>
                    <p style="font-size: 0.85rem; color: var(--ink-gray);">
                      Energia: \${todayEntry.energy || '-'}/10 · Sono: \${todayEntry.sleep_hours || '-'}h
                    </p>
                  </div>
                </div>
                \${todayEntry.content ? \`<p class="sensitive" style="margin-top: 1rem; color: var(--ink-gray); font-size: 0.9rem; line-height: 1.6;">\${todayEntry.content.substring(0, 200)}\${todayEntry.content.length > 200 ? '...' : ''}</p>\` : ''}
              </div>
            \`}
            
            <!-- Recent Entries -->
            <div class="fade-in" style="animation-delay: 0.3s;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2 style="font-size: 1.3rem;">Entradas recentes</h2>
                <button onclick="state.currentView = 'timeline'; render();" class="btn btn-ghost" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                  Ver todas <i class="fas fa-arrow-right" style="margin-left: 0.25rem;"></i>
                </button>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                \${state.entries.slice(0, 5).map(entry => \`
                  <div class="entry-card clickable" onclick="viewEntry(\${entry.id})">
                    <span class="entry-emoji">\${getMoodEmoji(entry.mood || 5)}</span>
                    <div class="entry-content">
                      <div class="entry-date">\${formatDate(entry.entry_date)}</div>
                      <div class="entry-preview sensitive">\${entry.highlight || entry.content?.substring(0, 60) || 'Sem descrição'}</div>
                      <div class="entry-meta">
                        \${entry.is_favorite ? '<i class="fas fa-star" style="color: var(--gold-accent);"></i>' : ''}
                        \${entry.is_private ? '<i class="fas fa-lock"></i>' : ''}
                        <span>Energia: \${entry.energy || '-'}</span>
                        <span>·</span>
                        <span>Sono: \${entry.sleep_hours || '-'}h</span>
                      </div>
                    </div>
                  </div>
                \`).join('') || '<p style="text-align: center; color: var(--ink-gray); padding: 2rem;">Nenhuma entrada ainda. Comece registrando seu dia!</p>'}
              </div>
            </div>
            
            <!-- API Key Warning -->
            \${!state.settings?.has_api_key ? \`
              <div class="card fade-in" style="margin-top: 2rem; border-left: 4px solid var(--gold-accent); animation-delay: 0.4s;">
                <div style="display: flex; gap: 1rem; align-items: flex-start;">
                  <i class="fas fa-key" style="color: var(--gold-accent); font-size: 1.25rem; margin-top: 0.25rem;"></i>
                  <div>
                    <h4 style="margin-bottom: 0.5rem;">Configure sua API Key</h4>
                    <p style="font-size: 0.9rem; color: var(--ink-gray); margin-bottom: 0.75rem;">
                      Para gerar insights personalizados com IA, configure sua API key da DeepSeek.
                    </p>
                    <button onclick="state.currentView = 'settings'; render();" class="btn btn-ghost" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                      Configurar <i class="fas fa-arrow-right" style="margin-left: 0.25rem;"></i>
                    </button>
                  </div>
                </div>
              </div>
            \` : ''}
          </main>
        \`;
      }
      
      function renderNewEntryPage() {
        const today = dayjs().format('YYYY-MM-DD');
        const existingEntry = state.entries.find(e => e.entry_date === today);
        
        return \`
          \${renderNav()}
          <div class="cloud-divider"></div>
          <main class="main-content">
            <div class="card fade-in">
              <h1 style="font-size: 1.75rem; margin-bottom: 1.5rem;">
                <i class="fas fa-feather-alt" style="color: var(--cinnabar-red); margin-right: 0.5rem;"></i>
                \${existingEntry ? 'Editar entrada' : 'Nova entrada'}
              </h1>
              
              <form id="entry-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <!-- Date -->
                <div>
                  <label class="input-label">Data</label>
                  <input type="date" id="entry-date" value="\${existingEntry?.entry_date || today}" class="input-field">
                </div>
                
                <!-- Mood -->
                <div>
                  <label class="input-label">Como você está se sentindo?</label>
                  <div class="mood-selector">
                    \${[0,1,2,3,4,5,6,7,8,9,10].map(i => \`
                      <button type="button" onclick="selectMood(\${i})" class="mood-btn \${existingEntry?.mood === i ? 'selected' : ''}" data-mood="\${i}">
                        \${getMoodEmoji(i)}
                      </button>
                    \`).join('')}
                  </div>
                  <input type="hidden" id="entry-mood" value="\${existingEntry?.mood ?? ''}">
                </div>
                
                <!-- Sliders -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                  <div class="slider-container">
                    <div class="slider-label">
                      <label class="input-label" style="margin: 0;">Energia</label>
                      <span class="slider-value" id="energy-value">\${existingEntry?.energy ?? 5}</span>
                    </div>
                    <input type="range" id="entry-energy" min="0" max="10" value="\${existingEntry?.energy ?? 5}" oninput="document.getElementById('energy-value').textContent = this.value">
                  </div>
                  <div class="slider-container">
                    <div class="slider-label">
                      <label class="input-label" style="margin: 0;">Estresse</label>
                      <span class="slider-value" id="stress-value">\${existingEntry?.stress ?? 5}</span>
                    </div>
                    <input type="range" id="entry-stress" min="0" max="10" value="\${existingEntry?.stress ?? 5}" oninput="document.getElementById('stress-value').textContent = this.value">
                  </div>
                </div>
                
                <!-- Sleep -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                  <div>
                    <label class="input-label">Horas de sono</label>
                    <input type="number" id="entry-sleep-hours" min="0" max="24" step="0.5" value="\${existingEntry?.sleep_hours ?? ''}" placeholder="7.5" class="input-field">
                  </div>
                  <div class="slider-container">
                    <div class="slider-label">
                      <label class="input-label" style="margin: 0;">Qualidade do sono</label>
                      <span class="slider-value" id="sleep-quality-value">\${existingEntry?.sleep_quality ?? 5}</span>
                    </div>
                    <input type="range" id="entry-sleep-quality" min="0" max="10" value="\${existingEntry?.sleep_quality ?? 5}" oninput="document.getElementById('sleep-quality-value').textContent = this.value">
                  </div>
                </div>
                
                <!-- Focus -->
                <div class="slider-container">
                  <div class="slider-label">
                    <label class="input-label" style="margin: 0;">Nível de foco</label>
                    <span class="slider-value" id="focus-value">\${existingEntry?.focus ?? 5}</span>
                  </div>
                  <input type="range" id="entry-focus" min="0" max="10" value="\${existingEntry?.focus ?? 5}" oninput="document.getElementById('focus-value').textContent = this.value">
                </div>
                
                <!-- Tags -->
                <div>
                  <label class="input-label">Tags</label>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    \${state.tags.map(tag => {
                      const isSelected = existingEntry?.tags?.some(t => t.id === tag.id);
                      return \`
                        <div class="tag clickable \${isSelected ? 'selected' : ''}" onclick="toggleTag(\${tag.id})" style="background-color: \${tag.color}20; color: \${tag.color};" data-tag="\${tag.id}">
                          <i class="fas fa-\${tag.icon}"></i>
                          <span>\${tag.name}</span>
                        </div>
                      \`;
                    }).join('')}
                  </div>
                  <input type="hidden" id="entry-tags" value="\${existingEntry?.tags?.map(t => t.id).join(',') || ''}">
                </div>
                
                <!-- Content -->
                <div>
                  <label class="input-label">Como foi seu dia?</label>
                  <textarea id="entry-content" class="input-field" placeholder="Escreva livremente sobre seu dia..." style="min-height: 150px;">\${existingEntry?.content || ''}</textarea>
                </div>
                
                <!-- Highlight -->
                <div>
                  <label class="input-label">Momento mais marcante</label>
                  <input type="text" id="entry-highlight" value="\${existingEntry?.highlight || ''}" class="input-field" placeholder="Ex: Terminei aquele projeto importante!">
                </div>
                
                <!-- Private -->
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <input type="checkbox" id="entry-private" \${existingEntry?.is_private ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--cinnabar-red);">
                  <label for="entry-private" style="font-size: 0.9rem; color: var(--ink-gray);">
                    <i class="fas fa-lock" style="margin-right: 0.25rem;"></i>Entrada privada (não será processada pela IA)
                  </label>
                </div>
                
                <!-- AI Notice -->
                \${state.settings?.has_api_key ? \`
                  <div style="padding: 1rem; background: var(--mist-blue); background: linear-gradient(135deg, rgba(176,196,222,0.2) 0%, rgba(176,196,222,0.1) 100%); border-radius: 0.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="fas fa-brain" style="color: var(--void-black);"></i>
                    <span style="font-size: 0.9rem; color: var(--ink-gray);">A IA irá analisar e gerar insights automaticamente.</span>
                  </div>
                \` : ''}
                
                <!-- Submit -->
                <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                  <button type="button" onclick="handleSaveEntry()" class="btn btn-primary" style="flex: 1; justify-content: center;" \${state.isLoading ? 'disabled' : ''}>
                    \${state.isLoading ? \`<div class="ink-loader" style="width: 20px; height: 20px;"></div> \${state.savingMessage || 'Salvando...'}\` : '<i class="fas fa-save"></i> Salvar entrada'}
                  </button>
                  <button type="button" onclick="state.currentView = 'home'; render();" class="btn btn-ghost" \${state.isLoading ? 'disabled' : ''}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </main>
        \`;
      }
      
      function renderTimelinePage() {
        return \`
          \${renderNav()}
          <div class="cloud-divider"></div>
          <main class="main-content \${state.discreteMode ? 'discrete-mode' : ''}">
            <h1 style="font-size: 1.75rem; margin-bottom: 1.5rem;">
              <i class="fas fa-stream" style="color: var(--mist-blue); margin-right: 0.5rem;"></i>Timeline
            </h1>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              \${state.entries.map((entry, i) => \`
                <div class="entry-card clickable fade-in" onclick="viewEntry(\${entry.id})" style="animation-delay: \${i * 0.05}s;">
                  <span class="entry-emoji">\${getMoodEmoji(entry.mood || 5)}</span>
                  <div class="entry-content">
                    <div class="entry-date">\${formatDate(entry.entry_date)}</div>
                    <div class="entry-preview sensitive">\${entry.highlight || entry.content?.substring(0, 80) || 'Sem descrição'}</div>
                    <div class="entry-meta">
                      \${entry.is_favorite ? '<i class="fas fa-star" style="color: var(--gold-accent);"></i>' : ''}
                      \${entry.is_private ? '<i class="fas fa-lock"></i>' : ''}
                      <span>Humor: \${entry.mood || '-'}/10</span>
                      <span>·</span>
                      <span>Energia: \${entry.energy || '-'}</span>
                      <span>·</span>
                      <span>Sono: \${entry.sleep_hours || '-'}h</span>
                    </div>
                    \${entry.tags?.length ? \`
                      <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem;">
                        \${entry.tags.map(tag => \`
                          <span class="tag" style="background-color: \${tag.color}20; color: \${tag.color}; padding: 0.2rem 0.5rem; font-size: 0.7rem;">\${tag.name}</span>
                        \`).join('')}
                      </div>
                    \` : ''}
                  </div>
                </div>
              \`).join('') || '<p style="text-align: center; color: var(--ink-gray); padding: 3rem;">Nenhuma entrada ainda.</p>'}
            </div>
          </main>
        \`;
      }
      
      function renderDashboardPage() {
        return \`
          \${renderNav()}
          <div class="cloud-divider"></div>
          <main class="main-content">
            <h1 style="font-size: 1.75rem; margin-bottom: 1.5rem;">
              <i class="fas fa-chart-area" style="color: var(--jade-green); margin-right: 0.5rem;"></i>Dashboard
            </h1>
            
            <!-- Period Selector -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
              <button onclick="loadStats(7)" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">7 dias</button>
              <button onclick="loadStats(14)" class="btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;">14 dias</button>
              <button onclick="loadStats(30)" class="btn" style="padding: 0.5rem 1rem; font-size: 0.85rem;">30 dias</button>
            </div>
            
            <!-- Stats -->
            <div class="stats-grid" style="margin-bottom: 2rem;">
              <div class="stat-card">
                <div class="stat-value">\${state.stats?.avgMood?.toFixed(1) || '-'}</div>
                <div class="stat-label">Humor Médio</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" style="color: var(--jade-green);">\${state.stats?.avgEnergy?.toFixed(1) || '-'}</div>
                <div class="stat-label">Energia Média</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" style="color: var(--mist-blue);">\${state.stats?.avgSleep?.toFixed(1) || '-'}h</div>
                <div class="stat-label">Sono Médio</div>
              </div>
              <div class="stat-card">
                <div class="stat-value" style="color: var(--cinnabar-red);">\${state.stats?.avgStress?.toFixed(1) || '-'}</div>
                <div class="stat-label">Estresse Médio</div>
              </div>
            </div>
            
            <!-- Charts -->
            <div style="display: grid; gap: 1.5rem; margin-bottom: 2rem;">
              <div class="chart-container">
                <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">Humor ao longo do tempo</h3>
                <canvas id="mood-chart" height="200"></canvas>
              </div>
              <div class="chart-container">
                <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">Horas de sono</h3>
                <canvas id="sleep-chart" height="200"></canvas>
              </div>
            </div>
            
            <!-- Top Tags -->
            <div class="card">
              <h3 class="card-title" style="font-size: 1.1rem;">Tags mais usadas</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem;">
                \${(state.stats?.topTags || []).map(tag => \`
                  <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: \${tag.color}15; border-radius: 2rem;">
                    <span style="color: \${tag.color}; font-weight: 500;">\${tag.name}</span>
                    <span style="font-size: 0.8rem; color: var(--ink-gray);">(\${tag.count})</span>
                  </div>
                \`).join('') || '<p style="color: var(--ink-gray);">Nenhuma tag usada ainda.</p>'}
              </div>
            </div>
          </main>
        \`;
      }
      
      function renderCharts() {
        if (!state.stats) return;
        
        const moodCtx = document.getElementById('mood-chart');
        if (moodCtx) {
          new Chart(moodCtx, {
            type: 'line',
            data: {
              labels: state.stats.moodTrend.map(d => formatDateShort(d.date)),
              datasets: [{
                label: 'Humor',
                data: state.stats.moodTrend.map(d => d.mood),
                borderColor: '#a83f39',
                backgroundColor: 'rgba(168, 63, 57, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#0a0a0a',
                pointBorderColor: '#f4f1ea',
                pointBorderWidth: 2
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { min: 0, max: 10, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
              }
            }
          });
        }
        
        const sleepCtx = document.getElementById('sleep-chart');
        if (sleepCtx) {
          new Chart(sleepCtx, {
            type: 'bar',
            data: {
              labels: state.stats.sleepTrend.map(d => formatDateShort(d.date)),
              datasets: [{
                label: 'Horas',
                data: state.stats.sleepTrend.map(d => d.hours),
                backgroundColor: '#b0c4de',
                borderRadius: 4
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { min: 0, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
              }
            }
          });
        }
      }
      
      function renderSettingsPage() {
        return \`
          \${renderNav()}
          <div class="cloud-divider"></div>
          <main class="main-content">
            <h1 style="font-size: 1.75rem; margin-bottom: 1.5rem;">
              <i class="fas fa-cog" style="color: var(--ink-gray); margin-right: 0.5rem;"></i>Configurações
            </h1>
            
            <!-- API Key -->
            <div class="card" style="margin-bottom: 1.5rem;">
              <h2 class="card-title" style="font-size: 1.2rem;">
                <i class="fas fa-key" style="color: var(--gold-accent); margin-right: 0.5rem;"></i>API Key da DeepSeek
              </h2>
              <p style="font-size: 0.9rem; color: var(--ink-gray); margin-bottom: 1rem;">
                Configure sua API key para gerar insights personalizados.
                <a href="https://platform.deepseek.com/" target="_blank" style="color: var(--cinnabar-red);">Obter uma API key</a>
              </p>
              
              <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
                <input type="password" id="api-key-input" placeholder="sk-..." class="input-field" style="flex: 1;">
                <button onclick="handleTestApiKey()" class="btn" style="white-space: nowrap;">Testar</button>
              </div>
              
              \${state.settings?.has_api_key ? \`
                <p style="font-size: 0.85rem; color: var(--jade-green);"><i class="fas fa-check-circle" style="margin-right: 0.25rem;"></i>API key configurada: \${state.settings.deepseek_api_key}</p>
              \` : ''}
              
              <button onclick="handleSaveApiKey()" class="btn btn-primary" style="margin-top: 1rem;">
                <i class="fas fa-save"></i> Salvar API Key
              </button>
            </div>
            
            <!-- AI Settings -->
            <div class="card" style="margin-bottom: 1.5rem;">
              <h2 class="card-title" style="font-size: 1.2rem;">
                <i class="fas fa-brain" style="color: var(--mist-blue); margin-right: 0.5rem;"></i>Configurações da IA
              </h2>
              
              <div style="margin-top: 1rem;">
                <label class="input-label">Profundidade das análises</label>
                <select id="ai-depth" onchange="updateSettings({ai_depth: this.value})" class="input-field">
                  <option value="shallow" \${state.settings?.ai_depth === 'shallow' ? 'selected' : ''}>Resumida - respostas curtas</option>
                  <option value="medium" \${state.settings?.ai_depth === 'medium' ? 'selected' : ''}>Equilibrada - análises moderadas</option>
                  <option value="deep" \${state.settings?.ai_depth === 'deep' ? 'selected' : ''}>Profunda - reflexões detalhadas</option>
                </select>
              </div>
            </div>
            
            <!-- Privacy -->
            <div class="card" style="margin-bottom: 1.5rem;">
              <h2 class="card-title" style="font-size: 1.2rem;">
                <i class="fas fa-shield-alt" style="color: var(--cinnabar-red); margin-right: 0.5rem;"></i>Privacidade
              </h2>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <div>
                  <p style="font-weight: 500;">Modo discreto</p>
                  <p style="font-size: 0.85rem; color: var(--ink-gray);">Oculta textos sensíveis na tela</p>
                </div>
                <label style="position: relative; display: inline-block; width: 50px; height: 28px;">
                  <input type="checkbox" id="discrete-mode" \${state.settings?.discrete_mode ? 'checked' : ''} onchange="updateSettings({discrete_mode: this.checked})" style="opacity: 0; width: 0; height: 0;">
                  <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: \${state.settings?.discrete_mode ? 'var(--cinnabar-red)' : '#ccc'}; border-radius: 28px; transition: 0.3s;">
                    <span style="position: absolute; content: ''; height: 20px; width: 20px; left: \${state.settings?.discrete_mode ? '26px' : '4px'}; bottom: 4px; background-color: white; border-radius: 50%; transition: 0.3s;"></span>
                  </span>
                </label>
              </div>
            </div>
            
            <!-- Account -->
            <div class="card">
              <h2 class="card-title" style="font-size: 1.2rem;">
                <i class="fas fa-user" style="color: var(--ink-gray); margin-right: 0.5rem;"></i>Conta
              </h2>
              
              <div style="margin-top: 1rem; font-size: 0.95rem; color: var(--ink-gray);">
                <p><strong>Nome:</strong> \${state.user?.name}</p>
                <p style="margin-top: 0.5rem;"><strong>Email:</strong> \${state.user?.email}</p>
                <p style="margin-top: 0.5rem;"><strong>Membro desde:</strong> \${formatDate(state.user?.created_at)}</p>
              </div>
              
              <button onclick="logout()" class="btn" style="margin-top: 1.5rem; border-color: var(--cinnabar-red); color: var(--cinnabar-red);">
                <i class="fas fa-sign-out-alt"></i> Sair da conta
              </button>
            </div>
          </main>
        \`;
      }
      
      function renderViewEntryPage() {
        const entry = state.entries.find(e => e.id === state.selectedEntryId);
        if (!entry) {
          state.currentView = 'home';
          render();
          return '';
        }
        
        return \`
          \${renderNav()}
          <div class="cloud-divider"></div>
          <main class="main-content \${state.discreteMode ? 'discrete-mode' : ''}">
            <div class="card fade-in">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <span style="font-size: 3rem;">\${getMoodEmoji(entry.mood || 5)}</span>
                  <div>
                    <h1 style="font-size: 1.5rem;">\${formatDate(entry.entry_date)}</h1>
                    <p style="color: var(--ink-gray); font-family: 'Cormorant Garamond', serif; font-style: italic;">\${dayjs(entry.entry_date).format('dddd')}</p>
                  </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <button onclick="toggleFavorite(\${entry.id})" class="nav-btn">
                    <i class="fas fa-star" style="color: \${entry.is_favorite ? 'var(--gold-accent)' : 'var(--ink-gray)'}"></i>
                  </button>
                  <button onclick="state.currentView = 'home'; render();" class="nav-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <!-- Metrics -->
              <div class="stats-grid" style="margin-bottom: 1.5rem;">
                <div class="stat-card">
                  <div class="stat-value">\${entry.mood ?? '-'}</div>
                  <div class="stat-label">Humor</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" style="color: var(--jade-green);">\${entry.energy ?? '-'}</div>
                  <div class="stat-label">Energia</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" style="color: var(--mist-blue);">\${entry.sleep_hours ?? '-'}h</div>
                  <div class="stat-label">Sono</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" style="color: var(--cinnabar-red);">\${entry.stress ?? '-'}</div>
                  <div class="stat-label">Estresse</div>
                </div>
              </div>
              
              <!-- Tags -->
              \${entry.tags?.length ? \`
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                  \${entry.tags.map(tag => \`
                    <span class="tag" style="background-color: \${tag.color}20; color: \${tag.color};">
                      <i class="fas fa-\${tag.icon}"></i>
                      <span>\${tag.name}</span>
                    </span>
                  \`).join('')}
                </div>
              \` : ''}
              
              <!-- Content -->
              \${entry.content ? \`
                <div style="margin-bottom: 1.5rem;">
                  <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Sobre o dia</h3>
                  <p class="sensitive" style="color: var(--ink-gray); line-height: 1.7; white-space: pre-wrap;">\${entry.content}</p>
                </div>
              \` : ''}
              
              <!-- Highlight -->
              \${entry.highlight ? \`
                <div style="padding: 1rem 1.25rem; background: linear-gradient(135deg, rgba(168,63,57,0.1) 0%, rgba(168,63,57,0.05) 100%); border-radius: 0.5rem; border-left: 4px solid var(--cinnabar-red); margin-bottom: 1.5rem;">
                  <p style="color: var(--cinnabar-red);">
                    <i class="fas fa-star" style="margin-right: 0.5rem;"></i>
                    <strong>Momento marcante:</strong> \${entry.highlight}
                  </p>
                </div>
              \` : ''}
              
              <!-- AI Insights -->
              \${!entry.is_private ? \`
                <div style="border-top: 1px solid var(--shadow-ink); padding-top: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="font-size: 1.1rem;">
                      <i class="fas fa-brain" style="color: var(--mist-blue); margin-right: 0.5rem;"></i>Insights da IA
                    </h3>
                    <button onclick="generateInsights(\${entry.id})" class="btn btn-ghost" style="padding: 0.4rem 0.75rem; font-size: 0.85rem;" \${!state.settings?.has_api_key ? 'disabled title="Configure sua API key"' : ''}>
                      <i class="fas fa-sync-alt"></i> Gerar
                    </button>
                  </div>
                  
                  \${entry.insights?.length ? \`
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                      \${entry.insights.map(insight => {
                        try {
                          const data = JSON.parse(insight.content);
                          return \`
                            <div class="insight-card">
                              <p style="color: var(--void-black); margin-bottom: 1rem;">\${data.summary}</p>
                              \${data.insights?.length ? \`
                                <div style="margin-bottom: 1rem;">
                                  <div class="insight-title"><i class="fas fa-lightbulb" style="color: var(--gold-accent);"></i> Insights</div>
                                  <ul class="insight-list">
                                    \${data.insights.map(i => '<li><i class="fas fa-check"></i><span>' + i + '</span></li>').join('')}
                                  </ul>
                                </div>
                              \` : ''}
                              \${data.tomorrowPlan?.length ? \`
                                <div>
                                  <div class="insight-title"><i class="fas fa-calendar-check" style="color: var(--mist-blue);"></i> Plano para amanhã</div>
                                  <ul class="insight-list">
                                    \${data.tomorrowPlan.map(i => '<li><i class="fas fa-arrow-right"></i><span>' + i + '</span></li>').join('')}
                                  </ul>
                                </div>
                              \` : ''}
                            </div>
                          \`;
                        } catch {
                          return '<p style="color: var(--ink-gray);">Erro ao carregar insights</p>';
                        }
                      }).join('')}
                    </div>
                  \` : \`
                    <p style="text-align: center; color: var(--ink-gray); padding: 2rem;">
                      \${state.settings?.has_api_key ? 'Clique em "Gerar" para criar insights.' : 'Configure sua API key nas configurações.'}
                    </p>
                  \`}
                </div>
              \` : \`
                <div style="border-top: 1px solid var(--shadow-ink); padding-top: 1.5rem; text-align: center; color: var(--ink-gray);">
                  <i class="fas fa-lock" style="margin-right: 0.5rem;"></i>Entrada privada
                </div>
              \`}
            </div>
          </main>
        \`;
      }
      
      function renderInsightsResultPage() {
        const insights = state.latestInsights;
        const entry = state.entries.find(e => e.id === state.latestEntryId);
        
        if (!insights || !entry) {
          state.currentView = 'home';
          render();
          return '';
        }
        
        return \`
          \${renderNav()}
          <div class="cloud-divider"></div>
          <main class="main-content">
            <!-- Header -->
            <div class="card card-ink fade-in" style="margin-bottom: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-brain" style="font-size: 1.5rem;"></i>
                </div>
                <div>
                  <h1 style="color: var(--paper-white); font-size: 1.5rem;">Insights Gerados! ✨</h1>
                  <p style="color: var(--mist-blue); font-size: 0.9rem;">\${formatDate(entry.entry_date)}</p>
                </div>
              </div>
              <p style="color: rgba(255,255,255,0.8);">A IA analisou sua entrada e gerou insights personalizados.</p>
            </div>
            
            <!-- Summary -->
            <div class="insight-card fade-in" style="animation-delay: 0.1s;">
              <div class="insight-title"><i class="fas fa-file-alt" style="color: var(--cinnabar-red);"></i> Resumo do Dia</div>
              <p style="color: var(--ink-gray); line-height: 1.6;">\${insights.summary || 'Nenhum resumo disponível.'}</p>
            </div>
            
            <!-- Insights -->
            \${insights.insights?.length ? \`
              <div class="insight-card fade-in" style="animation-delay: 0.2s;">
                <div class="insight-title"><i class="fas fa-lightbulb" style="color: var(--gold-accent);"></i> Insights</div>
                <ul class="insight-list">
                  \${insights.insights.map(i => '<li><i class="fas fa-check-circle"></i><span>' + i + '</span></li>').join('')}
                </ul>
              </div>
            \` : ''}
            
            <!-- Tomorrow Plan -->
            \${insights.tomorrowPlan?.length ? \`
              <div class="insight-card fade-in" style="animation-delay: 0.3s;">
                <div class="insight-title"><i class="fas fa-calendar-check" style="color: var(--mist-blue);"></i> Plano para Amanhã</div>
                <ul class="insight-list">
                  \${insights.tomorrowPlan.map((task, i) => \`
                    <li>
                      <span style="width: 24px; height: 24px; background: var(--cinnabar-red); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">\${i + 1}</span>
                      <span>\${task}</span>
                    </li>
                  \`).join('')}
                </ul>
              </div>
            \` : ''}
            
            <!-- Emotions -->
            \${insights.emotions?.length ? \`
              <div class="insight-card fade-in" style="animation-delay: 0.4s;">
                <div class="insight-title"><i class="fas fa-heart" style="color: var(--cinnabar-red);"></i> Emoções Detectadas</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                  \${insights.emotions.map(emotion => \`
                    <span class="tag" style="background: var(--mist-blue); color: var(--void-black);">\${emotion}</span>
                  \`).join('')}
                </div>
              </div>
            \` : ''}
            
            <!-- Actions -->
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
              <button onclick="state.currentView = 'home'; render();" class="btn btn-primary" style="flex: 1; justify-content: center;">
                <i class="fas fa-home"></i> Ir para Home
              </button>
              <button onclick="viewEntry(state.latestEntryId)" class="btn" style="flex: 1; justify-content: center;">
                <i class="fas fa-eye"></i> Ver Entrada
              </button>
            </div>
          </main>
        \`;
      }
      
      // ========== Main Render ==========
      function render() {
        const app = document.getElementById('app');
        
        if (!state.token || !state.user) {
          app.innerHTML = renderLoginPage();
          return;
        }
        
        switch (state.currentView) {
          case 'home':
            app.innerHTML = renderHomePage();
            break;
          case 'new-entry':
            app.innerHTML = renderNewEntryPage();
            break;
          case 'timeline':
            app.innerHTML = renderTimelinePage();
            break;
          case 'dashboard':
            app.innerHTML = renderDashboardPage();
            setTimeout(renderCharts, 100);
            break;
          case 'settings':
            app.innerHTML = renderSettingsPage();
            break;
          case 'view-entry':
            app.innerHTML = renderViewEntryPage();
            break;
          case 'insights-result':
            app.innerHTML = renderInsightsResultPage();
            break;
          default:
            app.innerHTML = renderHomePage();
        }
      }
      
      // ========== Initialize ==========
      async function init() {
        const app = document.getElementById('app');
        app.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;"><div class="ink-loader"></div></div>';
        
        if (state.token) {
          const isValid = await checkAuth();
          if (isValid) {
            await loadInitialData();
            state.currentView = 'home';
          }
        }
        
        render();
      }
      
      init();
    </script>
</body>
</html>`);
});

export default app;
