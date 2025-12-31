// ===== Pomodoro Timer App =====

class PomodoroTimer {
    constructor() {
        // Timer state
        this.timeLeft = 25 * 60; // seconds
        this.totalTime = 25 * 60;
        this.isRunning = false;
        this.timerId = null;
        this.currentMode = 'work'; // 'work', 'short-break', 'long-break'

        // DOM Elements
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.todayCountEl = document.getElementById('todayCount');
        this.totalCountEl = document.getElementById('totalCount');
        this.timerDisplay = document.querySelector('.timer-display');
        this.timerContainer = document.querySelector('.timer-container');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.modeBtns = document.querySelectorAll('.mode-btn');

        // Progress ring setup
        this.circumference = 2 * Math.PI * 90;
        this.progressCircle.style.strokeDasharray = this.circumference;

        // Audio context for notification sound
        this.audioContext = null;

        // Initialize
        this.loadStats();
        this.bindEvents();
        this.updateDisplay();
        this.updateProgress();
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.reset());

        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.changeMode(e.target));
        });

        // Handle visibility change (pause when tab is hidden, resume when visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning) {
                // Store the time when hidden
                this.hiddenAt = Date.now();
            } else if (!document.hidden && this.isRunning && this.hiddenAt) {
                // Adjust time when visible again
                const elapsed = Math.floor((Date.now() - this.hiddenAt) / 1000);
                this.timeLeft = Math.max(0, this.timeLeft - elapsed);
                this.hiddenAt = null;
                this.updateDisplay();
                this.updateProgress();
                
                if (this.timeLeft <= 0) {
                    this.complete();
                }
            }
        });
    }

    changeMode(btn) {
        if (this.isRunning) return; // Don't change mode while running

        this.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const time = parseInt(btn.dataset.time);
        this.currentMode = btn.dataset.mode;
        this.totalTime = time * 60;
        this.timeLeft = time * 60;

        // Update progress circle color
        if (this.currentMode === 'work') {
            this.progressCircle.classList.remove('break-mode');
        } else {
            this.progressCircle.classList.add('break-mode');
        }

        this.updateDisplay();
        this.updateProgress();
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        this.startBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">일시정지</span>';
        this.startBtn.classList.add('running');
        this.timerDisplay.classList.remove('paused');

        // Disable mode buttons while running
        this.modeBtns.forEach(btn => btn.disabled = true);

        this.timerId = setInterval(() => this.tick(), 1000);
    }

    pause() {
        this.isRunning = false;
        this.startBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">계속</span>';
        this.startBtn.classList.remove('running');
        this.timerDisplay.classList.add('paused');

        // Enable mode buttons when paused
        this.modeBtns.forEach(btn => btn.disabled = false);

        clearInterval(this.timerId);
    }

    reset() {
        this.pause();
        const activeBtn = document.querySelector('.mode-btn.active');
        this.timeLeft = parseInt(activeBtn.dataset.time) * 60;
        this.totalTime = this.timeLeft;
        this.startBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">시작</span>';
        this.updateDisplay();
        this.updateProgress();
    }

    tick() {
        this.timeLeft--;
        this.updateDisplay();
        this.updateProgress();

        if (this.timeLeft <= 0) {
            this.complete();
        }
    }

    complete() {
        this.pause();
        this.playNotificationSound();
        this.timerContainer.classList.add('complete');
        
        setTimeout(() => {
            this.timerContainer.classList.remove('complete');
        }, 1500);

        // Only count completed work sessions
        if (this.currentMode === 'work') {
            this.incrementStats();
        }

        // Show notification if permitted
        this.showNotification();

        // Reset to start position
        this.reset();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');

        // Update page title
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - 🍅 Pomodoro`;
    }

    updateProgress() {
        const progress = this.timeLeft / this.totalTime;
        const offset = this.circumference * (1 - progress);
        this.progressCircle.style.strokeDashoffset = offset;
    }

    // ===== Audio =====
    playNotificationSound() {
        try {
            // Create audio context on demand (required by browsers)
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const ctx = this.audioContext;
            const now = ctx.currentTime;

            // Play a pleasant chime sequence
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((freq, i) => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = freq;
                
                const startTime = now + i * 0.15;
                const duration = 0.3;
                
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            });
        } catch (e) {
            console.log('Audio not available:', e);
        }
    }

    // ===== Notifications =====
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const message = this.currentMode === 'work' 
                ? '수고했어요! 🍅 휴식 시간입니다.' 
                : '휴식 끝! 다시 집중할 시간이에요.';
            
            new Notification('포모도로 완료!', {
                body: message,
                icon: '🍅'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    // ===== Stats (Local Storage) =====
    loadStats() {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('pomodoro_date');
        
        // Reset daily count if it's a new day
        if (savedDate !== today) {
            localStorage.setItem('pomodoro_date', today);
            localStorage.setItem('pomodoro_today', '0');
        }

        const todayCount = parseInt(localStorage.getItem('pomodoro_today') || '0');
        const totalCount = parseInt(localStorage.getItem('pomodoro_total') || '0');

        this.todayCountEl.textContent = todayCount;
        this.totalCountEl.textContent = totalCount;
    }

    incrementStats() {
        const todayCount = parseInt(localStorage.getItem('pomodoro_today') || '0') + 1;
        const totalCount = parseInt(localStorage.getItem('pomodoro_total') || '0') + 1;

        localStorage.setItem('pomodoro_today', todayCount.toString());
        localStorage.setItem('pomodoro_total', totalCount.toString());

        this.todayCountEl.textContent = todayCount;
        this.totalCountEl.textContent = totalCount;

        // Add a little celebration animation to stats
        this.todayCountEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.todayCountEl.style.transform = 'scale(1)';
        }, 200);
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();

    // Request notification permission on first interaction
    document.body.addEventListener('click', () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, { once: true });
});

