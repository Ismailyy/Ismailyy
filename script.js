// Global variables
let prompts = [];
let activityData = {
    totalPrompts: 0,
    todayUsage: 0,
    favorites: 0,
    usageHistory: []
};
let selectedColor = 'purple';
let isVoiceActive = false;
let recognition = null;
let synthesis = window.speechSynthesis;
let autoLearningEnabled = true;
let voiceInputEnabled = true;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize all app functionality
function initializeApp() {
    loadData();
    drawAIChart();
    initializeEventListeners();
    initializeVoiceRecognition();
    updateStats();
    renderPrompts();
    setupAutoLearning();
}

// Load data from localStorage
function loadData() {
    const savedPrompts = localStorage.getItem('miraPrompts');
    const savedActivity = localStorage.getItem('miraActivity');
    
    if (savedPrompts) {
        prompts = JSON.parse(savedPrompts);
    }
    
    if (savedActivity) {
        activityData = JSON.parse(savedActivity);
    }
    
    // Initialize with sample data if empty
    if (prompts.length === 0) {
        prompts = [
            {
                id: 1,
                title: "Creative Writing",
                content: "Write a creative story about a magical forest",
                category: "creative",
                color: "purple",
                isFavorite: true,
                usageCount: 5,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Code Review",
                content: "Review this code and suggest improvements",
                category: "technical",
                color: "blue",
                isFavorite: false,
                usageCount: 3,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: "Business Plan",
                content: "Help me create a business plan for a startup",
                category: "business",
                color: "green",
                isFavorite: true,
                usageCount: 2,
                createdAt: new Date().toISOString()
            }
        ];
        saveData();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('miraPrompts', JSON.stringify(prompts));
    localStorage.setItem('miraActivity', JSON.stringify(activityData));
}

// Initialize voice recognition
function initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            isVoiceActive = true;
            updateVoiceUI();
            showNotification('Voice recognition started', 'success');
        };
        
        recognition.onresult = function(event) {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                handleVoiceInput(finalTranscript);
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isVoiceActive = false;
            updateVoiceUI();
            showNotification('Voice recognition error: ' + event.error, 'error');
        };
        
        recognition.onend = function() {
            isVoiceActive = false;
            updateVoiceUI();
        };
    } else {
        showNotification('Speech recognition not supported in this browser', 'warning');
        document.getElementById('startVoice').disabled = true;
        document.getElementById('stopVoice').disabled = true;
    }
}

// Handle voice input
function handleVoiceInput(transcript) {
    if (autoLearningEnabled) {
        // Auto-learn from voice input
        learnFromInput(transcript);
    }
    
    // Process the voice input
    if (transcript.toLowerCase().includes('add prompt')) {
        openPromptModal();
        document.getElementById('promptContent').value = transcript.replace(/add prompt/i, '').trim();
    } else if (transcript.toLowerCase().includes('activate ai')) {
        activateAI();
    } else if (transcript.toLowerCase().includes('search')) {
        const searchTerm = transcript.replace(/search/i, '').trim();
        searchPrompts(searchTerm);
    }
}

// Update voice UI
function updateVoiceUI() {
    const voiceIcon = document.getElementById('voiceToggle');
    const voiceStatus = document.getElementById('voiceStatus');
    const startBtn = document.getElementById('startVoice');
    const stopBtn = document.getElementById('stopVoice');
    
    if (isVoiceActive) {
        voiceIcon.classList.add('active');
        voiceStatus.textContent = 'Voice: Active';
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } else {
        voiceIcon.classList.remove('active');
        voiceStatus.textContent = 'Voice: Off';
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Voice controls
    document.getElementById('startVoice').addEventListener('click', startVoiceRecognition);
    document.getElementById('stopVoice').addEventListener('click', stopVoiceRecognition);
    document.getElementById('voiceToggle').addEventListener('click', toggleVoice);
    
    // Assistant
    document.getElementById('activateAssistant').addEventListener('click', activateAI);
    
    // Modals
    document.getElementById('addPromptBtn').addEventListener('click', openPromptModal);
    document.getElementById('closeModal').addEventListener('click', closePromptModal);
    document.getElementById('closeAIResponse').addEventListener('click', closeAIResponseModal);
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('cancelBtn').addEventListener('click', closePromptModal);
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    
    // Form submissions
    document.getElementById('savePromptBtn').addEventListener('click', savePrompt);
    document.getElementById('copyResponseBtn').addEventListener('click', copyAIResponse);
    document.getElementById('saveResponseBtn').addEventListener('click', saveAIResponse);
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            selectColor(this.dataset.color);
        });
    });
    
    // Settings controls
    document.getElementById('voiceSpeed').addEventListener('input', updateVoiceSpeed);
    document.getElementById('voicePitch').addEventListener('input', updateVoicePitch);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Voice control functions
function startVoiceRecognition() {
    if (recognition && voiceInputEnabled) {
        recognition.start();
    }
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

function toggleVoice() {
    if (isVoiceActive) {
        stopVoiceRecognition();
    } else {
        startVoiceRecognition();
    }
}

// AI Assistant functions
function activateAI() {
    const userInput = prompt('Enter your question or request:');
    if (userInput) {
        showAIResponseModal(userInput);
        simulateAIResponse(userInput);
    }
}

function showAIResponseModal(userInput) {
    document.getElementById('aiInputDisplay').textContent = userInput;
    document.getElementById('aiResponseModal').style.display = 'block';
}

function closeAIResponseModal() {
    document.getElementById('aiResponseModal').style.display = 'none';
}

function simulateAIResponse(userInput) {
    const responseDisplay = document.getElementById('aiResponseDisplay');
    responseDisplay.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    
    // Simulate AI processing time
    setTimeout(() => {
        const response = generateAIResponse(userInput);
        responseDisplay.textContent = response;
        
        // Speak the response if voice is enabled
        if (synthesis && voiceInputEnabled) {
            speakText(response);
        }
        
        // Auto-learn from this interaction
        if (autoLearningEnabled) {
            learnFromInteraction(userInput, response);
        }
    }, 2000);
}

function generateAIResponse(userInput) {
    const responses = {
        'hello': 'Hello! How can I assist you today?',
        'help': 'I can help you with various tasks. Try asking me to write, analyze, or create something!',
        'write': 'I\'d be happy to help you write. What would you like me to write about?',
        'analyze': 'I can analyze text, data, or code for you. What would you like me to analyze?',
        'create': 'I can help you create content, plans, or solutions. What do you need?'
    };
    
    const lowerInput = userInput.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerInput.includes(key)) {
            return response;
        }
    }
    
    return `I understand you're asking about "${userInput}". Let me provide you with a comprehensive response based on my knowledge. This is a simulated AI response that would typically be generated by a more sophisticated AI model.`;
}

function speakText(text) {
    if (synthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = parseFloat(document.getElementById('voiceSpeed').value);
        utterance.pitch = parseFloat(document.getElementById('voicePitch').value);
        synthesis.speak(utterance);
    }
}

// Prompt management functions
function openPromptModal() {
    document.getElementById('promptModal').style.display = 'block';
    document.getElementById('promptTitle').focus();
    selectColor(selectedColor);
}

function closePromptModal() {
    document.getElementById('promptModal').style.display = 'none';
    clearPromptForm();
}

function clearPromptForm() {
    document.getElementById('promptTitle').value = '';
    document.getElementById('promptContent').value = '';
    document.getElementById('promptCategory').value = 'general';
    document.getElementById('isFavorite').checked = false;
    selectColor('purple');
}

function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-color="${color}"]`).classList.add('selected');
}

function savePrompt() {
    const title = document.getElementById('promptTitle').value.trim();
    const content = document.getElementById('promptContent').value.trim();
    const category = document.getElementById('promptCategory').value;
    const isFavorite = document.getElementById('isFavorite').checked;
    
    if (!title || !content) {
        showNotification('Please fill in both title and content', 'error');
        return;
    }
    
    const newPrompt = {
        id: Date.now(),
        title: title,
        content: content,
        category: category,
        color: selectedColor,
        isFavorite: isFavorite,
        usageCount: 0,
        createdAt: new Date().toISOString()
    };
    
    prompts.push(newPrompt);
    saveData();
    updateStats();
    renderPrompts();
    closePromptModal();
    showNotification('Prompt saved successfully!', 'success');
}

function renderPrompts() {
    const container = document.getElementById('promptsContainer');
    container.innerHTML = '';
    
    prompts.forEach(prompt => {
        const promptCard = createPromptCard(prompt);
        container.appendChild(promptCard);
    });
}

function createPromptCard(prompt) {
    const card = document.createElement('div');
    card.className = `prompt-card ${prompt.color}`;
    card.innerHTML = `
        <div class="prompt-content">
            <div class="prompt-title">${prompt.title}</div>
            <div class="prompt-text">${prompt.content}</div>
            <div class="prompt-meta">
                <span class="prompt-category">${prompt.category}</span>
                <span>Used ${prompt.usageCount} times</span>
            </div>
        </div>
        <div class="prompt-actions">
            <i class="fas fa-edit edit-icon" data-id="${prompt.id}"></i>
            <i class="fas fa-copy copy-icon" data-id="${prompt.id}"></i>
            <i class="fas fa-heart favorite-icon ${prompt.isFavorite ? 'active' : ''}" data-id="${prompt.id}"></i>
            <i class="fas fa-trash delete-icon" data-id="${prompt.id}"></i>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.edit-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        editPrompt(prompt.id);
    });
    
    card.querySelector('.copy-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        copyPrompt(prompt.id);
    });
    
    card.querySelector('.favorite-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(prompt.id);
    });
    
    card.querySelector('.delete-icon').addEventListener('click', (e) => {
        e.stopPropagation();
        deletePrompt(prompt.id);
    });
    
    card.addEventListener('click', () => {
        usePrompt(prompt.id);
    });
    
    return card;
}

function editPrompt(id) {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
        document.getElementById('promptTitle').value = prompt.title;
        document.getElementById('promptContent').value = prompt.content;
        document.getElementById('promptCategory').value = prompt.category;
        document.getElementById('isFavorite').checked = prompt.isFavorite;
        selectColor(prompt.color);
        
        // Change save button to update
        const saveBtn = document.getElementById('savePromptBtn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Prompt';
        saveBtn.onclick = () => updatePrompt(id);
        
        openPromptModal();
    }
}

function updatePrompt(id) {
    const title = document.getElementById('promptTitle').value.trim();
    const content = document.getElementById('promptContent').value.trim();
    const category = document.getElementById('promptCategory').value;
    const isFavorite = document.getElementById('isFavorite').checked;
    
    if (!title || !content) {
        showNotification('Please fill in both title and content', 'error');
        return;
    }
    
    const promptIndex = prompts.findIndex(p => p.id === id);
    if (promptIndex !== -1) {
        prompts[promptIndex] = {
            ...prompts[promptIndex],
            title,
            content,
            category,
            color: selectedColor,
            isFavorite
        };
        
        saveData();
        updateStats();
        renderPrompts();
        closePromptModal();
        showNotification('Prompt updated successfully!', 'success');
        
        // Reset save button
        const saveBtn = document.getElementById('savePromptBtn');
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Prompt';
        saveBtn.onclick = savePrompt;
    }
}

function copyPrompt(id) {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
        copyToClipboard(prompt.content);
        showNotification('Prompt copied to clipboard!', 'success');
    }
}

function toggleFavorite(id) {
    const promptIndex = prompts.findIndex(p => p.id === id);
    if (promptIndex !== -1) {
        prompts[promptIndex].isFavorite = !prompts[promptIndex].isFavorite;
        saveData();
        updateStats();
        renderPrompts();
        showNotification(
            prompts[promptIndex].isFavorite ? 'Added to favorites!' : 'Removed from favorites!',
            'success'
        );
    }
}

function deletePrompt(id) {
    if (confirm('Are you sure you want to delete this prompt?')) {
        prompts = prompts.filter(p => p.id !== id);
        saveData();
        updateStats();
        renderPrompts();
        showNotification('Prompt deleted successfully!', 'success');
    }
}

function usePrompt(id) {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
        prompt.usageCount++;
        activityData.todayUsage++;
        activityData.totalPrompts++;
        
        // Add to usage history
        activityData.usageHistory.push({
            promptId: id,
            timestamp: new Date().toISOString(),
            promptTitle: prompt.title
        });
        
        saveData();
        updateStats();
        renderPrompts();
        
        // Activate AI with the prompt
        showAIResponseModal(prompt.content);
        simulateAIResponse(prompt.content);
    }
}

// Stats and activity tracking
function updateStats() {
    document.getElementById('totalPrompts').textContent = activityData.totalPrompts;
    document.getElementById('todayUsage').textContent = activityData.todayUsage;
    document.getElementById('favorites').textContent = prompts.filter(p => p.isFavorite).length;
    
    drawAIChart();
}

// Draw the AI Assistant line chart with real data
function drawAIChart() {
    const canvas = document.getElementById('aiChart');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 200;
    canvas.height = 60;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate chart data from usage history
    const dataPoints = generateChartData();
    
    // Draw the line
    ctx.beginPath();
    ctx.strokeStyle = '#9c27b0';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    dataPoints.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.stroke();
    
    // Add gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(156, 39, 176, 0.3)');
    gradient.addColorStop(1, 'rgba(156, 39, 176, 0.1)');
    
    ctx.beginPath();
    ctx.fillStyle = gradient;
    dataPoints.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.lineTo(200, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Add data points
    dataPoints.forEach(point => {
        ctx.beginPath();
        ctx.fillStyle = '#9c27b0';
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function generateChartData() {
    const dataPoints = [];
    const maxUsage = Math.max(activityData.todayUsage, 10);
    
    // Generate 11 data points based on usage
    for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * 200;
        const usageRatio = activityData.todayUsage / maxUsage;
        const baseY = 30;
        const variation = Math.sin(i * 0.5) * 10;
        const y = baseY + (usageRatio * 20) + variation;
        dataPoints.push({ x, y });
    }
    
    return dataPoints;
}

// Auto-learning functionality
function setupAutoLearning() {
    // Load learning preferences
    const savedAutoLearning = localStorage.getItem('miraAutoLearning');
    if (savedAutoLearning !== null) {
        autoLearningEnabled = JSON.parse(savedAutoLearning);
        document.getElementById('autoLearning').checked = autoLearningEnabled;
    }
    
    const savedVoiceInput = localStorage.getItem('miraVoiceInput');
    if (savedVoiceInput !== null) {
        voiceInputEnabled = JSON.parse(savedVoiceInput);
        document.getElementById('voiceInput').checked = voiceInputEnabled;
    }
}

function learnFromInput(input) {
    // Simple learning: track common phrases and patterns
    console.log('Learning from input:', input);
    // In a real implementation, this would update a learning model
}

function learnFromInteraction(input, response) {
    // Learn from user interactions
    console.log('Learning from interaction:', { input, response });
    // In a real implementation, this would improve the AI model
}

// Settings functions
function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'block';
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function updateVoiceSpeed() {
    const speed = document.getElementById('voiceSpeed').value;
    document.getElementById('voiceSpeedValue').textContent = speed + 'x';
}

function updateVoicePitch() {
    const pitch = document.getElementById('voicePitch').value;
    document.getElementById('voicePitchValue').textContent = pitch + 'x';
}

function exportData() {
    const data = {
        prompts: prompts,
        activity: activityData,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mira-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        prompts = [];
        activityData = {
            totalPrompts: 0,
            todayUsage: 0,
            favorites: 0,
            usageHistory: []
        };
        saveData();
        updateStats();
        renderPrompts();
        showNotification('All data cleared successfully!', 'success');
    }
}

// Utility functions
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function copyAIResponse() {
    const response = document.getElementById('aiResponseDisplay').textContent;
    copyToClipboard(response);
    showNotification('AI response copied to clipboard!', 'success');
}

function saveAIResponse() {
    const response = document.getElementById('aiResponseDisplay').textContent;
    const userInput = document.getElementById('aiInputDisplay').textContent;
    
    const newPrompt = {
        id: Date.now(),
        title: `AI Response: ${userInput.substring(0, 30)}...`,
        content: response,
        category: 'ai-response',
        color: 'teal',
        isFavorite: false,
        usageCount: 0,
        createdAt: new Date().toISOString()
    };
    
    prompts.push(newPrompt);
    saveData();
    updateStats();
    renderPrompts();
    closeAIResponseModal();
    showNotification('AI response saved as prompt!', 'success');
}

function searchPrompts(query) {
    const filteredPrompts = prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(query.toLowerCase()) ||
        prompt.content.toLowerCase().includes(query.toLowerCase()) ||
        prompt.category.toLowerCase().includes(query.toLowerCase())
    );
    
    const container = document.getElementById('promptsContainer');
    container.innerHTML = '';
    
    if (filteredPrompts.length === 0) {
        container.innerHTML = '<div class="no-results">No prompts found matching your search.</div>';
    } else {
        filteredPrompts.forEach(prompt => {
            const promptCard = createPromptCard(prompt);
            container.appendChild(promptCard);
        });
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Settings change handlers
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('autoLearning').addEventListener('change', function() {
        autoLearningEnabled = this.checked;
        localStorage.setItem('miraAutoLearning', JSON.stringify(autoLearningEnabled));
        showNotification(
            autoLearningEnabled ? 'Auto-learning enabled' : 'Auto-learning disabled',
            'success'
        );
    });
    
    document.getElementById('voiceInput').addEventListener('change', function() {
        voiceInputEnabled = this.checked;
        localStorage.setItem('miraVoiceInput', JSON.stringify(voiceInputEnabled));
        showNotification(
            voiceInputEnabled ? 'Voice input enabled' : 'Voice input disabled',
            'success'
        );
    });
});

// Reset daily usage at midnight
function resetDailyUsage() {
    const now = new Date();
    const lastReset = localStorage.getItem('miraLastReset');
    
    if (lastReset) {
        const lastResetDate = new Date(lastReset);
        if (now.toDateString() !== lastResetDate.toDateString()) {
            activityData.todayUsage = 0;
            localStorage.setItem('miraLastReset', now.toISOString());
            saveData();
            updateStats();
        }
    } else {
        localStorage.setItem('miraLastReset', now.toISOString());
    }
}

// Check for daily reset on page load
document.addEventListener('DOMContentLoaded', resetDailyUsage);