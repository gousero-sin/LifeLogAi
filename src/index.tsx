// LifeLog IA - Life Goes On A.I.
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
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main HTML page
app.get('*', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LifeLog IA - Life Goes On A.I.</title>
    <meta name="description" content="Seu diário inteligente com IA - registre, analise e transforme sua vida">
    <meta name="theme-color" content="#6366f1">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/pt-br.js"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              primary: {
                50: '#eef2ff',
                100: '#e0e7ff',
                200: '#c7d2fe',
                300: '#a5b4fc',
                400: '#818cf8',
                500: '#6366f1',
                600: '#4f46e5',
                700: '#4338ca',
                800: '#3730a3',
                900: '#312e81',
              }
            }
          }
        }
      }
    </script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * {
        font-family: 'Inter', sans-serif;
      }
      
      .mood-emoji {
        transition: transform 0.2s;
      }
      .mood-emoji:hover {
        transform: scale(1.2);
      }
      .mood-emoji.selected {
        transform: scale(1.3);
        filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
      }
      
      .slider-thumb::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: #6366f1;
        border-radius: 50%;
        cursor: pointer;
      }
      
      .tag-chip {
        transition: all 0.2s;
      }
      .tag-chip:hover {
        transform: translateY(-2px);
      }
      .tag-chip.selected {
        ring: 2px;
        ring-color: currentColor;
      }
      
      .card-hover {
        transition: all 0.3s;
      }
      .card-hover:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .loading-spinner {
        border: 3px solid #e5e7eb;
        border-top: 3px solid #6366f1;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .discrete-mode .sensitive-text {
        filter: blur(5px);
        user-select: none;
      }
      .discrete-mode .sensitive-text:hover {
        filter: blur(0);
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      
      .dark ::-webkit-scrollbar-track {
        background: #1e293b;
      }
      .dark ::-webkit-scrollbar-thumb {
        background: #475569;
      }
    </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div id="app"></div>
    
    <script>
      // Initialize dayjs
      dayjs.locale('pt-br');
      
      // App State
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
      
      // API Helper
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
      
      // Utility Functions
      const getMoodEmoji = (mood) => {
        const emojis = ['😭', '😢', '😔', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩', '🥳'];
        return emojis[mood] || '😐';
      };
      
      const getMoodColor = (mood) => {
        if (mood <= 3) return 'text-red-500';
        if (mood <= 5) return 'text-yellow-500';
        if (mood <= 7) return 'text-green-500';
        return 'text-emerald-500';
      };
      
      const formatDate = (date) => dayjs(date).format('DD [de] MMMM');
      const formatDateShort = (date) => dayjs(date).format('DD/MM');
      
      const showToast = (message, type = 'info') => {
        const colors = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          info: 'bg-primary-500',
          warning: 'bg-yellow-500'
        };
        
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white shadow-lg z-50 fade-in ' + colors[type];
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
      };
      
      // Auth Functions
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
          showToast('Bem-vindo de volta, ' + state.user.name + '!', 'success');
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
          showToast('Conta criada com sucesso! Bem-vindo ao LifeLog IA!', 'success');
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
      
      // Data Loading
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
      
      // Entry Functions
      async function saveEntry(entryData) {
        try {
          state.isLoading = true;
          state.savingMessage = 'Salvando entrada...';
          render();
          
          // Check if AI will process
          const willProcessAI = state.settings?.has_api_key && !entryData.is_private;
          if (willProcessAI) {
            state.savingMessage = 'Salvando e gerando insights com IA...';
            render();
          }
          
          const data = await api.post('/entries', entryData);
          
          // Update entries list
          const existingIndex = state.entries.findIndex(e => e.entry_date === data.entry_date);
          if (existingIndex >= 0) {
            state.entries[existingIndex] = data;
          } else {
            state.entries.unshift(data);
          }
          
          // Check if AI insights were generated
          if (data.ai_insights) {
            showToast('Entrada salva e insights gerados! ✨', 'success');
            // Store latest insights for display
            state.latestInsights = data.ai_insights;
            state.latestEntryId = data.id;
            state.currentView = 'insights-result';
          } else if (willProcessAI) {
            showToast('Entrada salva! (IA não disponível no momento)', 'warning');
            state.currentView = 'home';
          } else {
            showToast('Entrada salva com sucesso!', 'success');
            state.currentView = 'home';
          }
          
          // Refresh stats
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
          showToast('Insights gerados com sucesso!', 'success');
          
          // Reload entry
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
      
      // Settings Functions
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
      
      // Render Functions
      function renderLoginPage() {
        return \`
          <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in">
              <div class="text-center mb-8">
                <div class="text-6xl mb-4">📖</div>
                <h1 class="text-3xl font-bold text-gray-800 dark:text-white">LifeLog IA</h1>
                <p class="text-gray-500 dark:text-gray-400 mt-2">Life Goes On A.I.</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Seu diário inteligente</p>
              </div>
              
              <div id="auth-form">
                <div id="login-form">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input type="email" id="login-email" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="seu@email.com">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                      <input type="password" id="login-password" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="••••••••">
                    </div>
                    <button onclick="handleLogin()" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2" \${state.isLoading ? 'disabled' : ''}>
                      \${state.isLoading ? '<div class="loading-spinner"></div>' : '<i class="fas fa-sign-in-alt"></i> Entrar'}
                    </button>
                  </div>
                  <p class="text-center mt-4 text-gray-600 dark:text-gray-400">
                    Não tem conta? <button onclick="showRegisterForm()" class="text-primary-500 hover:underline font-medium">Criar conta</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        \`;
      }
      
      function renderRegisterForm() {
        document.getElementById('auth-form').innerHTML = \`
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
              <input type="text" id="register-name" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Seu nome">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" id="register-email" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="seu@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
              <input type="password" id="register-password" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Mínimo 6 caracteres">
            </div>
            <button onclick="handleRegister()" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <i class="fas fa-user-plus"></i> Criar Conta
            </button>
          </div>
          <p class="text-center mt-4 text-gray-600 dark:text-gray-400">
            Já tem conta? <button onclick="render()" class="text-primary-500 hover:underline font-medium">Fazer login</button>
          </p>
        \`;
      }
      
      function showRegisterForm() {
        renderRegisterForm();
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
      
      function renderNav() {
        return \`
          <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4">
              <div class="flex items-center justify-between h-16">
                <div class="flex items-center gap-2 cursor-pointer" onclick="state.currentView = 'home'; render();">
                  <span class="text-2xl">📖</span>
                  <span class="font-bold text-xl text-gray-800 dark:text-white">LifeLog</span>
                  <span class="text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-2 py-0.5 rounded-full">IA</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <button onclick="state.currentView = 'home'; render();" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 \${state.currentView === 'home' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-600 dark:text-gray-300'}">
                    <i class="fas fa-home text-lg"></i>
                  </button>
                  <button onclick="state.currentView = 'new-entry'; render();" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 \${state.currentView === 'new-entry' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-600 dark:text-gray-300'}">
                    <i class="fas fa-plus text-lg"></i>
                  </button>
                  <button onclick="state.currentView = 'timeline'; render();" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 \${state.currentView === 'timeline' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-600 dark:text-gray-300'}">
                    <i class="fas fa-calendar-alt text-lg"></i>
                  </button>
                  <button onclick="state.currentView = 'dashboard'; render();" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 \${state.currentView === 'dashboard' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-600 dark:text-gray-300'}">
                    <i class="fas fa-chart-line text-lg"></i>
                  </button>
                  <button onclick="state.currentView = 'settings'; render();" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 \${state.currentView === 'settings' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600' : 'text-gray-600 dark:text-gray-300'}">
                    <i class="fas fa-cog text-lg"></i>
                  </button>
                  <button onclick="logout()" class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-gray-600 dark:text-gray-300 hover:text-red-600">
                    <i class="fas fa-sign-out-alt text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </nav>
        \`;
      }
      
      function renderHomePage() {
        const today = dayjs().format('YYYY-MM-DD');
        const todayEntry = state.entries.find(e => e.entry_date === today);
        
        return \`
          \${renderNav()}
          <main class="max-w-7xl mx-auto px-4 py-6 \${state.discreteMode ? 'discrete-mode' : ''}">
            <!-- Welcome Section -->
            <div class="mb-8">
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
                Olá, \${state.user?.name?.split(' ')[0] || 'você'}! 👋
              </h1>
              <p class="text-gray-500 dark:text-gray-400">\${dayjs().format('dddd, D [de] MMMM [de] YYYY')}</p>
            </div>
            
            <!-- Quick Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm card-hover">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <i class="fas fa-fire text-primary-500"></i>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">\${state.stats?.currentStreak || 0}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">dias seguidos</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm card-hover">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <span class="text-xl">\${getMoodEmoji(Math.round(state.stats?.avgMood || 5))}</span>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">\${state.stats?.avgMood?.toFixed(1) || '-'}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">humor médio</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm card-hover">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <i class="fas fa-moon text-blue-500"></i>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">\${state.stats?.avgSleep?.toFixed(1) || '-'}h</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">sono médio</p>
                  </div>
                </div>
              </div>
              
              <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm card-hover">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <i class="fas fa-bolt text-green-500"></i>
                  </div>
                  <div>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">\${state.stats?.avgEnergy?.toFixed(1) || '-'}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">energia média</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Today's Entry CTA -->
            \${!todayEntry ? \`
              <div class="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-6 mb-8 text-white">
                <h2 class="text-xl font-bold mb-2">Como foi seu dia hoje? ✨</h2>
                <p class="opacity-90 mb-4">Registre seus pensamentos, sentimentos e momentos importantes.</p>
                <button onclick="state.currentView = 'new-entry'; render();" class="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  <i class="fas fa-pen mr-2"></i>Registrar agora
                </button>
              </div>
            \` : \`
              <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
                    <i class="fas fa-check-circle text-green-500 mr-2"></i>Entrada de hoje
                  </h2>
                  <button onclick="state.currentView = 'new-entry'; render();" class="text-primary-500 hover:underline text-sm">
                    <i class="fas fa-edit mr-1"></i>Editar
                  </button>
                </div>
                <div class="flex items-center gap-4 mb-3">
                  <span class="text-3xl">\${getMoodEmoji(todayEntry.mood || 5)}</span>
                  <div>
                    <p class="font-medium text-gray-800 dark:text-white">Humor: \${todayEntry.mood || '-'}/10</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Energia: \${todayEntry.energy || '-'}/10 • Sono: \${todayEntry.sleep_hours || '-'}h</p>
                  </div>
                </div>
                \${todayEntry.content ? \`
                  <p class="text-gray-600 dark:text-gray-300 sensitive-text line-clamp-3">\${todayEntry.content}</p>
                \` : ''}
                \${todayEntry.tags?.length ? \`
                  <div class="flex flex-wrap gap-2 mt-3">
                    \${todayEntry.tags.map(tag => \`
                      <span class="px-2 py-1 rounded-full text-xs font-medium" style="background-color: \${tag.color}20; color: \${tag.color}">\${tag.name}</span>
                    \`).join('')}
                  </div>
                \` : ''}
              </div>
            \`}
            
            <!-- Recent Entries -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Entradas recentes</h2>
                <button onclick="state.currentView = 'timeline'; render();" class="text-primary-500 hover:underline text-sm">Ver todas</button>
              </div>
              
              <div class="space-y-3">
                \${state.entries.slice(0, 5).map(entry => \`
                  <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm card-hover cursor-pointer" onclick="viewEntry(\${entry.id})">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <span class="text-2xl">\${getMoodEmoji(entry.mood || 5)}</span>
                        <div>
                          <p class="font-medium text-gray-800 dark:text-white">\${formatDate(entry.entry_date)}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">\${entry.highlight || 'Sem destaque'}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        \${entry.is_favorite ? '<i class="fas fa-star text-yellow-400"></i>' : ''}
                        \${entry.is_private ? '<i class="fas fa-lock text-gray-400"></i>' : ''}
                      </div>
                    </div>
                  </div>
                \`).join('') || '<p class="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma entrada ainda. Comece registrando seu dia!</p>'}
              </div>
            </div>
            
            <!-- API Key Warning -->
            \${!state.settings?.has_api_key ? \`
              <div class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div class="flex items-start gap-3">
                  <i class="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
                  <div>
                    <p class="font-medium text-yellow-800 dark:text-yellow-200">Configure sua API Key</p>
                    <p class="text-sm text-yellow-600 dark:text-yellow-400">Para gerar insights personalizados com IA, configure sua API key da DeepSeek nas configurações.</p>
                    <button onclick="state.currentView = 'settings'; render();" class="mt-2 text-sm text-yellow-700 dark:text-yellow-300 hover:underline font-medium">
                      Ir para configurações →
                    </button>
                  </div>
                </div>
              </div>
            \` : ''}
          </main>
        \`;
      }
      
      function viewEntry(entryId) {
        state.selectedEntryId = entryId;
        state.currentView = 'view-entry';
        render();
      }
      
      function renderNewEntryPage() {
        const today = dayjs().format('YYYY-MM-DD');
        const existingEntry = state.entries.find(e => e.entry_date === today);
        
        return \`
          \${renderNav()}
          <main class="max-w-2xl mx-auto px-4 py-6">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                \${existingEntry ? 'Editar entrada' : 'Nova entrada'} 📝
              </h1>
              
              <form id="entry-form" class="space-y-6">
                <!-- Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data</label>
                  <input type="date" id="entry-date" value="\${existingEntry?.entry_date || today}" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                </div>
                
                <!-- Mood -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Como você está se sentindo?</label>
                  <div class="flex justify-between items-center">
                    \${[0,1,2,3,4,5,6,7,8,9,10].map(i => \`
                      <button type="button" onclick="selectMood(\${i})" class="mood-emoji text-2xl p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 \${existingEntry?.mood === i ? 'selected bg-primary-100 dark:bg-primary-900' : ''}" data-mood="\${i}">
                        \${getMoodEmoji(i)}
                      </button>
                    \`).join('')}
                  </div>
                  <input type="hidden" id="entry-mood" value="\${existingEntry?.mood ?? ''}">
                </div>
                
                <!-- Sliders -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Energia: <span id="energy-value">\${existingEntry?.energy ?? 5}</span>/10
                    </label>
                    <input type="range" id="entry-energy" min="0" max="10" value="\${existingEntry?.energy ?? 5}" class="w-full slider-thumb" oninput="document.getElementById('energy-value').textContent = this.value">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estresse: <span id="stress-value">\${existingEntry?.stress ?? 5}</span>/10
                    </label>
                    <input type="range" id="entry-stress" min="0" max="10" value="\${existingEntry?.stress ?? 5}" class="w-full slider-thumb" oninput="document.getElementById('stress-value').textContent = this.value">
                  </div>
                </div>
                
                <!-- Sleep -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Horas de sono</label>
                    <input type="number" id="entry-sleep-hours" min="0" max="24" step="0.5" value="\${existingEntry?.sleep_hours ?? ''}" placeholder="7.5" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Qualidade do sono: <span id="sleep-quality-value">\${existingEntry?.sleep_quality ?? 5}</span>/10
                    </label>
                    <input type="range" id="entry-sleep-quality" min="0" max="10" value="\${existingEntry?.sleep_quality ?? 5}" class="w-full slider-thumb" oninput="document.getElementById('sleep-quality-value').textContent = this.value">
                  </div>
                </div>
                
                <!-- Focus -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nível de foco: <span id="focus-value">\${existingEntry?.focus ?? 5}</span>/10
                  </label>
                  <input type="range" id="entry-focus" min="0" max="10" value="\${existingEntry?.focus ?? 5}" class="w-full slider-thumb" oninput="document.getElementById('focus-value').textContent = this.value">
                </div>
                
                <!-- Tags -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                  <div class="flex flex-wrap gap-2" id="tags-container">
                    \${state.tags.map(tag => {
                      const isSelected = existingEntry?.tags?.some(t => t.id === tag.id);
                      return \`
                        <button type="button" onclick="toggleTag(\${tag.id})" class="tag-chip px-3 py-1.5 rounded-full text-sm font-medium transition-all \${isSelected ? 'ring-2' : ''}" style="background-color: \${tag.color}20; color: \${tag.color}; \${isSelected ? 'ring-color: ' + tag.color : ''}" data-tag="\${tag.id}">
                          <i class="fas fa-\${tag.icon} mr-1"></i>\${tag.name}
                        </button>
                      \`;
                    }).join('')}
                  </div>
                  <input type="hidden" id="entry-tags" value="\${existingEntry?.tags?.map(t => t.id).join(',') || ''}">
                </div>
                
                <!-- Content -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Como foi seu dia? (opcional)</label>
                  <textarea id="entry-content" rows="5" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white resize-none" placeholder="Escreva livremente sobre seu dia...">\${existingEntry?.content || ''}</textarea>
                </div>
                
                <!-- Highlight -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Momento mais marcante (opcional)</label>
                  <input type="text" id="entry-highlight" value="\${existingEntry?.highlight || ''}" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" placeholder="Ex: Terminei aquele projeto importante!">
                </div>
                
                <!-- Private -->
                <div class="flex items-center gap-3">
                  <input type="checkbox" id="entry-private" \${existingEntry?.is_private ? 'checked' : ''} class="w-5 h-5 text-primary-500 rounded focus:ring-primary-500">
                  <label for="entry-private" class="text-sm text-gray-700 dark:text-gray-300">
                    <i class="fas fa-lock mr-1"></i>Entrada privada (não será processada pela IA)
                  </label>
                </div>
                
                <!-- AI Notice -->
                \${state.settings?.has_api_key && !document.getElementById('entry-private')?.checked ? \`
                  <div class="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-sm text-primary-700 dark:text-primary-300">
                    <i class="fas fa-robot"></i>
                    <span>A IA irá analisar automaticamente e gerar insights para esta entrada.</span>
                  </div>
                \` : ''}
                
                <!-- Submit -->
                <div class="flex gap-3">
                  <button type="button" onclick="handleSaveEntry()" class="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2" \${state.isLoading ? 'disabled' : ''}>
                    \${state.isLoading ? \`<div class="loading-spinner"></div> \${state.savingMessage || 'Salvando...'}\` : '<i class="fas fa-save"></i> Salvar entrada'}
                  </button>
                  <button type="button" onclick="state.currentView = 'home'; render();" class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" \${state.isLoading ? 'disabled' : ''}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </main>
        \`;
      }
      
      let selectedMood = null;
      let selectedTags = [];
      
      function selectMood(mood) {
        selectedMood = mood;
        document.getElementById('entry-mood').value = mood;
        document.querySelectorAll('.mood-emoji').forEach(el => {
          el.classList.remove('selected', 'bg-primary-100', 'dark:bg-primary-900');
          if (parseInt(el.dataset.mood) === mood) {
            el.classList.add('selected', 'bg-primary-100', 'dark:bg-primary-900');
          }
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
        
        document.querySelectorAll('.tag-chip').forEach(el => {
          const id = parseInt(el.dataset.tag);
          if (tags.includes(id)) {
            el.classList.add('ring-2');
          } else {
            el.classList.remove('ring-2');
          }
        });
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
      
      function renderTimelinePage() {
        return \`
          \${renderNav()}
          <main class="max-w-4xl mx-auto px-4 py-6 \${state.discreteMode ? 'discrete-mode' : ''}">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Timeline 📅</h1>
            
            <div class="space-y-4">
              \${state.entries.map(entry => \`
                <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm card-hover">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <span class="text-3xl">\${getMoodEmoji(entry.mood || 5)}</span>
                      <div>
                        <p class="font-semibold text-gray-800 dark:text-white">\${formatDate(entry.entry_date)}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          Humor: \${entry.mood ?? '-'}/10 • Energia: \${entry.energy ?? '-'}/10 • Sono: \${entry.sleep_hours ?? '-'}h
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      \${entry.is_favorite ? '<i class="fas fa-star text-yellow-400"></i>' : ''}
                      \${entry.is_private ? '<i class="fas fa-lock text-gray-400"></i>' : ''}
                      <button onclick="viewEntry(\${entry.id})" class="text-primary-500 hover:text-primary-600">
                        <i class="fas fa-eye"></i>
                      </button>
                    </div>
                  </div>
                  
                  \${entry.content ? \`
                    <p class="text-gray-600 dark:text-gray-300 sensitive-text mb-3 line-clamp-3">\${entry.content}</p>
                  \` : ''}
                  
                  \${entry.highlight ? \`
                    <p class="text-sm text-primary-600 dark:text-primary-400 mb-3">
                      <i class="fas fa-star mr-1"></i>\${entry.highlight}
                    </p>
                  \` : ''}
                  
                  \${entry.tags?.length ? \`
                    <div class="flex flex-wrap gap-2">
                      \${entry.tags.map(tag => \`
                        <span class="px-2 py-1 rounded-full text-xs font-medium" style="background-color: \${tag.color}20; color: \${tag.color}">\${tag.name}</span>
                      \`).join('')}
                    </div>
                  \` : ''}
                </div>
              \`).join('') || '<p class="text-center text-gray-500 dark:text-gray-400 py-12">Nenhuma entrada ainda.</p>'}
            </div>
          </main>
        \`;
      }
      
      function renderDashboardPage() {
        return \`
          \${renderNav()}
          <main class="max-w-6xl mx-auto px-4 py-6">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard 📊</h1>
            
            <!-- Period Selector -->
            <div class="flex gap-2 mb-6">
              <button onclick="loadStats(7)" class="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium">7 dias</button>
              <button onclick="loadStats(14)" class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600">14 dias</button>
              <button onclick="loadStats(30)" class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600">30 dias</button>
            </div>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Humor Médio</p>
                <p class="text-3xl font-bold \${getMoodColor(state.stats?.avgMood || 5)}">\${state.stats?.avgMood?.toFixed(1) || '-'}</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Energia Média</p>
                <p class="text-3xl font-bold text-green-500">\${state.stats?.avgEnergy?.toFixed(1) || '-'}</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Sono Médio</p>
                <p class="text-3xl font-bold text-blue-500">\${state.stats?.avgSleep?.toFixed(1) || '-'}h</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Estresse Médio</p>
                <p class="text-3xl font-bold text-red-500">\${state.stats?.avgStress?.toFixed(1) || '-'}</p>
              </div>
            </div>
            
            <!-- Charts -->
            <div class="grid md:grid-cols-2 gap-6 mb-8">
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                <h3 class="font-semibold text-gray-800 dark:text-white mb-4">Humor ao longo do tempo</h3>
                <canvas id="mood-chart" height="200"></canvas>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                <h3 class="font-semibold text-gray-800 dark:text-white mb-4">Horas de sono</h3>
                <canvas id="sleep-chart" height="200"></canvas>
              </div>
            </div>
            
            <!-- Top Tags -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
              <h3 class="font-semibold text-gray-800 dark:text-white mb-4">Tags mais usadas</h3>
              <div class="flex flex-wrap gap-3">
                \${(state.stats?.topTags || []).map(tag => \`
                  <div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background-color: \${tag.color}20">
                    <span class="font-medium" style="color: \${tag.color}">\${tag.name}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">(\${tag.count})</span>
                  </div>
                \`).join('') || '<p class="text-gray-500 dark:text-gray-400">Nenhuma tag usada ainda.</p>'}
              </div>
            </div>
          </main>
        \`;
      }
      
      async function loadStats(days) {
        try {
          const data = await api.get('/dashboard/stats?period=' + days);
          state.stats = data.stats;
          render();
          renderCharts();
        } catch (error) {
          showToast('Erro ao carregar estatísticas', 'error');
        }
      }
      
      function renderCharts() {
        if (!state.stats) return;
        
        // Mood Chart
        const moodCtx = document.getElementById('mood-chart');
        if (moodCtx) {
          new Chart(moodCtx, {
            type: 'line',
            data: {
              labels: state.stats.moodTrend.map(d => formatDateShort(d.date)),
              datasets: [{
                label: 'Humor',
                data: state.stats.moodTrend.map(d => d.mood),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { min: 0, max: 10 }
              }
            }
          });
        }
        
        // Sleep Chart
        const sleepCtx = document.getElementById('sleep-chart');
        if (sleepCtx) {
          new Chart(sleepCtx, {
            type: 'bar',
            data: {
              labels: state.stats.sleepTrend.map(d => formatDateShort(d.date)),
              datasets: [{
                label: 'Horas',
                data: state.stats.sleepTrend.map(d => d.hours),
                backgroundColor: '#3b82f6'
              }]
            },
            options: {
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { min: 0 }
              }
            }
          });
        }
      }
      
      function renderSettingsPage() {
        return \`
          \${renderNav()}
          <main class="max-w-2xl mx-auto px-4 py-6">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Configurações ⚙️</h1>
            
            <!-- API Key Section -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
              <h2 class="font-semibold text-gray-800 dark:text-white mb-4">
                <i class="fas fa-key mr-2 text-primary-500"></i>API Key da DeepSeek
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Configure sua API key para gerar insights personalizados com IA.
                <a href="https://platform.deepseek.com/" target="_blank" class="text-primary-500 hover:underline">Obter uma API key</a>
              </p>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
                  <div class="flex gap-2">
                    <input type="password" id="api-key-input" placeholder="sk-..." value="" class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                    <button onclick="handleTestApiKey()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                      Testar
                    </button>
                  </div>
                  \${state.settings?.has_api_key ? \`
                    <p class="text-sm text-green-500 mt-2"><i class="fas fa-check-circle mr-1"></i>API key configurada: \${state.settings.deepseek_api_key}</p>
                  \` : ''}
                </div>
                
                <button onclick="handleSaveApiKey()" class="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors">
                  <i class="fas fa-save mr-2"></i>Salvar API Key
                </button>
              </div>
            </div>
            
            <!-- AI Settings -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
              <h2 class="font-semibold text-gray-800 dark:text-white mb-4">
                <i class="fas fa-robot mr-2 text-primary-500"></i>Configurações da IA
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profundidade das análises</label>
                  <select id="ai-depth" onchange="updateSettings({ai_depth: this.value})" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white">
                    <option value="shallow" \${state.settings?.ai_depth === 'shallow' ? 'selected' : ''}>Resumida - respostas curtas e diretas</option>
                    <option value="medium" \${state.settings?.ai_depth === 'medium' ? 'selected' : ''}>Equilibrada - análises moderadas</option>
                    <option value="deep" \${state.settings?.ai_depth === 'deep' ? 'selected' : ''}>Profunda - reflexões detalhadas</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Privacy Settings -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
              <h2 class="font-semibold text-gray-800 dark:text-white mb-4">
                <i class="fas fa-shield-alt mr-2 text-primary-500"></i>Privacidade
              </h2>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-800 dark:text-white">Modo discreto</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Oculta textos sensíveis na tela inicial</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="discrete-mode" \${state.settings?.discrete_mode ? 'checked' : ''} onchange="updateSettings({discrete_mode: this.checked})" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Account Info -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 class="font-semibold text-gray-800 dark:text-white mb-4">
                <i class="fas fa-user mr-2 text-primary-500"></i>Conta
              </h2>
              
              <div class="space-y-2">
                <p class="text-gray-600 dark:text-gray-300"><strong>Nome:</strong> \${state.user?.name}</p>
                <p class="text-gray-600 dark:text-gray-300"><strong>Email:</strong> \${state.user?.email}</p>
                <p class="text-gray-600 dark:text-gray-300"><strong>Membro desde:</strong> \${formatDate(state.user?.created_at)}</p>
              </div>
              
              <button onclick="logout()" class="mt-6 w-full border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 font-semibold py-3 rounded-lg transition-colors">
                <i class="fas fa-sign-out-alt mr-2"></i>Sair da conta
              </button>
            </div>
          </main>
        \`;
      }
      
      async function handleTestApiKey() {
        const apiKey = document.getElementById('api-key-input').value;
        if (!apiKey) {
          showToast('Digite uma API key', 'warning');
          return;
        }
        await testApiKey(apiKey);
      }
      
      async function handleSaveApiKey() {
        const apiKey = document.getElementById('api-key-input').value;
        if (!apiKey) {
          showToast('Digite uma API key', 'warning');
          return;
        }
        await updateSettings({ deepseek_api_key: apiKey });
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
          <main class="max-w-2xl mx-auto px-4 py-6 \${state.discreteMode ? 'discrete-mode' : ''}">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <span class="text-4xl">\${getMoodEmoji(entry.mood || 5)}</span>
                  <div>
                    <h1 class="text-xl font-bold text-gray-800 dark:text-white">\${formatDate(entry.entry_date)}</h1>
                    <p class="text-gray-500 dark:text-gray-400">\${dayjs(entry.entry_date).format('dddd')}</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button onclick="toggleFavorite(\${entry.id})" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-star \${entry.is_favorite ? 'text-yellow-400' : 'text-gray-400'}"></i>
                  </button>
                  <button onclick="state.currentView = 'home'; render();" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <!-- Metrics -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p class="text-2xl font-bold text-primary-500">\${entry.mood ?? '-'}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Humor</p>
                </div>
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p class="text-2xl font-bold text-green-500">\${entry.energy ?? '-'}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Energia</p>
                </div>
                <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p class="text-2xl font-bold text-blue-500">\${entry.sleep_hours ?? '-'}h</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Sono</p>
                </div>
              </div>
              
              <!-- Tags -->
              \${entry.tags?.length ? \`
                <div class="flex flex-wrap gap-2 mb-6">
                  \${entry.tags.map(tag => \`
                    <span class="px-3 py-1 rounded-full text-sm font-medium" style="background-color: \${tag.color}20; color: \${tag.color}">
                      <i class="fas fa-\${tag.icon} mr-1"></i>\${tag.name}
                    </span>
                  \`).join('')}
                </div>
              \` : ''}
              
              <!-- Content -->
              \${entry.content ? \`
                <div class="mb-6">
                  <h3 class="font-semibold text-gray-800 dark:text-white mb-2">Sobre o dia</h3>
                  <p class="text-gray-600 dark:text-gray-300 sensitive-text whitespace-pre-wrap">\${entry.content}</p>
                </div>
              \` : ''}
              
              <!-- Highlight -->
              \${entry.highlight ? \`
                <div class="mb-6 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                  <p class="text-primary-700 dark:text-primary-300">
                    <i class="fas fa-star mr-2"></i><strong>Momento marcante:</strong> \${entry.highlight}
                  </p>
                </div>
              \` : ''}
              
              <!-- AI Insights -->
              \${!entry.is_private ? \`
                <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-800 dark:text-white">
                      <i class="fas fa-brain mr-2 text-primary-500"></i>Insights da IA
                    </h3>
                    <button onclick="generateInsights(\${entry.id})" class="text-primary-500 hover:text-primary-600 text-sm font-medium" \${!state.settings?.has_api_key ? 'disabled title="Configure sua API key primeiro"' : ''}>
                      <i class="fas fa-sync-alt mr-1"></i>Gerar
                    </button>
                  </div>
                  
                  \${entry.insights?.length ? \`
                    <div class="space-y-3">
                      \${entry.insights.map(insight => {
                        try {
                          const data = JSON.parse(insight.content);
                          return \`
                            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                              <p class="text-gray-700 dark:text-gray-300 mb-3">\${data.summary}</p>
                              \${data.insights?.length ? \`
                                <div class="mb-3">
                                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Insights:</p>
                                  <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                    \${data.insights.map(i => '<li>' + i + '</li>').join('')}
                                  </ul>
                                </div>
                              \` : ''}
                              \${data.tomorrowPlan?.length ? \`
                                <div>
                                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Plano para amanhã:</p>
                                  <ul class="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                                    \${data.tomorrowPlan.map(i => '<li>' + i + '</li>').join('')}
                                  </ul>
                                </div>
                              \` : ''}
                            </div>
                          \`;
                        } catch {
                          return '<p class="text-gray-500">Erro ao carregar insights</p>';
                        }
                      }).join('')}
                    </div>
                  \` : \`
                    <p class="text-gray-500 dark:text-gray-400 text-center py-4">
                      \${state.settings?.has_api_key ? 'Clique em "Gerar" para criar insights com IA.' : 'Configure sua API key nas configurações para gerar insights.'}
                    </p>
                  \`}
                </div>
              \` : \`
                <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p class="text-gray-500 dark:text-gray-400 text-center py-4">
                    <i class="fas fa-lock mr-2"></i>Esta entrada está marcada como privada.
                  </p>
                </div>
              \`}
            </div>
          </main>
        \`;
      }
      
      // Render AI Insights Result Page (shown after saving entry with AI)
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
          <main class="max-w-2xl mx-auto px-4 py-6">
            <div class="bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl p-6 text-white mb-6 fade-in">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i class="fas fa-brain text-2xl"></i>
                </div>
                <div>
                  <h1 class="text-xl font-bold">Insights Gerados! ✨</h1>
                  <p class="text-white/80 text-sm">\${formatDate(entry.entry_date)}</p>
                </div>
              </div>
              <p class="text-white/90">A IA analisou sua entrada e gerou insights personalizados para você.</p>
            </div>
            
            <!-- Summary -->
            <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4 fade-in">
              <h2 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <i class="fas fa-file-alt text-primary-500"></i>Resumo do Dia
              </h2>
              <p class="text-gray-600 dark:text-gray-300">\${insights.summary || 'Nenhum resumo disponível.'}</p>
            </div>
            
            <!-- Insights -->
            \${insights.insights?.length ? \`
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4 fade-in">
                <h2 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <i class="fas fa-lightbulb text-yellow-500"></i>Insights
                </h2>
                <ul class="space-y-2">
                  \${insights.insights.map(insight => \`
                    <li class="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <i class="fas fa-check-circle text-green-500 mt-1 flex-shrink-0"></i>
                      <span>\${insight}</span>
                    </li>
                  \`).join('')}
                </ul>
              </div>
            \` : ''}
            
            <!-- Tomorrow Plan -->
            \${insights.tomorrowPlan?.length ? \`
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4 fade-in">
                <h2 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <i class="fas fa-calendar-check text-blue-500"></i>Plano para Amanhã
                </h2>
                <ul class="space-y-2">
                  \${insights.tomorrowPlan.map((task, i) => \`
                    <li class="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                      <span class="w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">\${i + 1}</span>
                      <span>\${task}</span>
                    </li>
                  \`).join('')}
                </ul>
              </div>
            \` : ''}
            
            <!-- Emotions -->
            \${insights.emotions?.length ? \`
              <div class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mb-4 fade-in">
                <h2 class="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <i class="fas fa-heart text-red-500"></i>Emoções Detectadas
                </h2>
                <div class="flex flex-wrap gap-2">
                  \${insights.emotions.map(emotion => \`
                    <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full text-sm font-medium">
                      \${emotion}
                    </span>
                  \`).join('')}
                </div>
              </div>
            \` : ''}
            
            <!-- Actions -->
            <div class="flex gap-3 mt-6">
              <button onclick="state.currentView = 'home'; render();" class="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors">
                <i class="fas fa-home mr-2"></i>Ir para Home
              </button>
              <button onclick="viewEntry(state.latestEntryId)" class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <i class="fas fa-eye mr-2"></i>Ver Entrada
              </button>
            </div>
          </main>
        \`;
      }
      
      async function toggleFavorite(entryId) {
        try {
          const data = await api.patch('/entries/' + entryId + '/favorite');
          const entry = state.entries.find(e => e.id === entryId);
          if (entry) {
            entry.is_favorite = data.is_favorite;
          }
          render();
        } catch (error) {
          showToast('Erro ao atualizar favorito', 'error');
        }
      }
      
      // Main render function
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
        
        // Apply dark mode based on settings or system preference
        if (state.settings?.theme === 'dark' || 
            (state.settings?.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      // Initialize app
      async function init() {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="min-h-screen flex items-center justify-center"><div class="loading-spinner"></div></div>';
        
        if (state.token) {
          const isValid = await checkAuth();
          if (isValid) {
            await loadInitialData();
            state.currentView = 'home';
          }
        }
        
        render();
      }
      
      // Start the app
      init();
    </script>
</body>
</html>`);
});

export default app;
