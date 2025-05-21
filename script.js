class CountdownTimer {
    constructor() {
        this.elements = {
            days: document.getElementById("days"),
            hours: document.getElementById("hours"),
            minutes: document.getElementById("minutes"),
            seconds: document.getElementById("seconds"),
            startBtn: document.getElementById("startBtn"),
            stopBtn: document.getElementById("stopBtn"),
            resetBtn: document.getElementById("resetBtn"),
            statusIndicator: document.getElementById("status-indicator"),
            progressPercentage: document.getElementById("progress-percentage"),
            progressFill: document.querySelector(".progress-fill"),
            currentYear: document.getElementById("currentYear"),
        };

        this.state = {
            interval: null,
            isRunning: false,
            targetTime: 0,
            initialTime: 0,
            totalSeconds: 0,
            lastDisplayedSeconds: -1,
        };

        this.progressRadius = 0;
        this.progressCircumference = 0;

        this.init();
    }

    init() {
        if (this.elements.currentYear) {
            this.elements.currentYear.textContent = new Date().getFullYear();
        }
        this.calculateProgressRing();
        this.setInitialTime();
        this.bindEvents();
        this.createParticles(30);
        this.updateDisplay();
        this.updateStatus("paused");
        this.updateButtonStates();
        window.timerInstance = this;
    }

    calculateProgressRing() {
        this.progressCircumference = parseFloat(
            this.elements.progressFill.getAttribute("stroke-dasharray")
        );
    }

    setInitialTime(days = 1, hours = 5, minutes = 47, seconds = 20) {
        this.state.totalSeconds =
            days * 86400 + hours * 3600 + minutes * 60 + seconds;
        this.state.initialTime = this.state.totalSeconds;
        this.state.targetTime = this.state.totalSeconds;
    }

    bindEvents() {
        this.elements.startBtn.addEventListener("click", () => this.start());
        this.elements.stopBtn.addEventListener("click", () => this.stop());
        this.elements.resetBtn.addEventListener("click", () => this.reset());
    }

    formatTime(time) {
        return time < 10 ? `0${time}` : String(time);
    }

    animateValueChange(element) {
        element.classList.add("value-changed");
        element.addEventListener(
            "animationend",
            () => {
                element.classList.remove("value-changed");
            },
            { once: true }
        );
    }

    updateDisplay() {
        if (this.state.targetTime < 0) this.state.targetTime = 0;

        const days = Math.floor(this.state.targetTime / 86400);
        const hours = Math.floor((this.state.targetTime % 86400) / 3600);
        const minutes = Math.floor((this.state.targetTime % 3600) / 60);
        const seconds = Math.floor(this.state.targetTime % 60);

        if (this.elements.days.textContent !== this.formatTime(days)) {
            this.elements.days.textContent = this.formatTime(days);
            this.animateValueChange(this.elements.days);
        }
        if (this.elements.hours.textContent !== this.formatTime(hours)) {
            this.elements.hours.textContent = this.formatTime(hours);
            this.animateValueChange(this.elements.hours);
        }
        if (this.elements.minutes.textContent !== this.formatTime(minutes)) {
            this.elements.minutes.textContent = this.formatTime(minutes);
            this.animateValueChange(this.elements.minutes);
        }
        if (this.elements.seconds.textContent !== this.formatTime(seconds)) {
            this.elements.seconds.textContent = this.formatTime(seconds);
            this.animateValueChange(this.elements.seconds);
        }
        this.updateProgress();
    }

    updateProgress() {
        const progress =
            this.state.initialTime > 0
                ? ((this.state.initialTime - this.state.targetTime) /
                        this.state.initialTime) *
                    100
                : this.state.targetTime <= 0
                ? 100
                : 0;

        this.elements.progressPercentage.textContent = `${Math.round(progress)}%`;

        const offset =
            this.progressCircumference -
            (progress / 100) * this.progressCircumference;
        this.elements.progressFill.style.strokeDashoffset = Math.max(
            0,
            Math.min(this.progressCircumference, offset)
        );
    }

    updateStatus(statusKey) {
        const statusConfig = {
            running: { icon: "fa-play", text: "Running", class: "status-running" },
            paused: { icon: "fa-pause", text: "Paused", class: "status-paused" },
            completed: {
                icon: "fa-check-circle",
                text: "Completed!",
                class: "status-completed",
            },
        };

        const config = statusConfig[statusKey];
        this.elements.statusIndicator.className = `status-indicator ${config.class}`;
        this.elements.statusIndicator.innerHTML = `
                        <i class="fas ${config.icon}"></i>
                        <span>${config.text}</span>
                `;
    }

    updateButtonStates() {
        this.elements.startBtn.disabled =
            this.state.isRunning || this.state.targetTime <= 0;
        this.elements.stopBtn.disabled = !this.state.isRunning;
        this.elements.resetBtn.disabled =
            this.state.isRunning && this.state.targetTime <= 0;

        if (this.state.isRunning) {
            this.elements.startBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i>Running';
        } else {
            this.elements.startBtn.innerHTML = '<i class="fas fa-play"></i>Start';
        }

        if (this.state.targetTime <= 0 && !this.state.isRunning) {
            this.elements.startBtn.innerHTML = '<i class="fas fa-check"></i>Done';
        }
    }

    start() {
        if (this.state.isRunning || this.state.targetTime <= 0) return;

        this.state.isRunning = true;
        this.updateStatus("running");
        this.updateButtonStates();

        this.state.interval = setInterval(() => {
            this.state.targetTime--;
            this.updateDisplay();

            if (this.state.targetTime <= 0) {
                this.complete();
            }
        }, 1000);
    }

    stop() {
        if (!this.state.isRunning) return;

        this.state.isRunning = false;
        clearInterval(this.state.interval);
        this.state.interval = null;

        this.updateStatus("paused");
        this.updateButtonStates();
    }

    reset() {
        this.stop();
        this.setInitialTime();
        this.updateDisplay();
        this.updateStatus("paused");
        this.updateButtonStates();
        this.showNotification(
            "⏱️ Timer Reset!",
            "Timer has been reset to initial values.",
            "warning"
        );
    }

    complete() {
        this.stop();
        this.state.targetTime = 0;
        this.updateDisplay();
        this.updateStatus("completed");
        this.updateButtonStates();

        const timerGrid = document.querySelector(".timer-grid");
        if (timerGrid) {
            timerGrid.classList.add("completion-animation");
            setTimeout(() => {
                timerGrid.classList.remove("completion-animation");
            }, 2100);
        }
        this.showNotification(
            "🎉 Countdown Complete!",
            "The countdown has finished.",
            "success"
        );
    }

    showNotification(title, message, type = "success") {
        const existingNotification = document.querySelector(".notification");
        if (existingNotification) existingNotification.remove();

        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;

        let iconClass = "fa-info-circle";
        if (type === "success") iconClass = "fa-check-circle";
        else if (type === "warning") iconClass = "fa-exclamation-triangle";
        else if (type === "error") iconClass = "fa-times-circle";

        notification.innerHTML = `
                        <i class="fas ${iconClass} notification-icon"></i>
                        <div>
                                <strong>${title}</strong>
                                ${
                                    message
                                        ? `<p style="font-size:0.875rem; color: var(--text-secondary);">${message}</p>`
                                        : ""
                                }
                        </div>
                `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("show");
        }, 100);

        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }

    createParticles(count = 50) {
        const container = document.getElementById("particles-container");
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement("div");
            particle.className = "particle";
            particle.style.left = Math.random() * 100 + "%";
            particle.style.top = Math.random() * 100 + "%";
            particle.style.animationDelay = Math.random() * 8 + "s";
            particle.style.animationDuration = Math.random() * 4 + 4 + "s";
            particle.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
            container.appendChild(particle);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const timer = new CountdownTimer();

    document.addEventListener("keydown", (e) => {
        if (
            e.code === "Space" &&
            !(e.target.tagName === "BUTTON" || e.target.tagName === "A")
        ) {
            e.preventDefault();
            if (timer.state.targetTime <= 0 && !timer.state.isRunning) {
                timer.reset();
                timer.start();
            } else {
                timer.state.isRunning ? timer.stop() : timer.start();
            }
        }
        if (e.code === "KeyR" && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            timer.reset();
        }
    });
});
