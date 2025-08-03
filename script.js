// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    drawAIChart();
    initializeEventListeners();
});

// Draw the AI Assistant line chart
function drawAIChart() {
    const canvas = document.getElementById('aiChart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 200;
    canvas.height = 60;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chart data points (simulating AI activity)
    const dataPoints = [
        { x: 0, y: 30 },
        { x: 20, y: 25 },
        { x: 40, y: 35 },
        { x: 60, y: 20 },
        { x: 80, y: 40 },
        { x: 100, y: 30 },
        { x: 120, y: 45 },
        { x: 140, y: 35 },
        { x: 160, y: 50 },
        { x: 180, y: 40 },
        { x: 200, y: 45 }
    ];
    
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

// Initialize all event listeners
function initializeEventListeners() {
    // Settings icon click
    document.querySelector('.settings-icon').addEventListener('click', function() {
        alert('Settings clicked! This would open settings panel.');
    });
    
    // Search icon click
    document.querySelector('.search-icon').addEventListener('click', function() {
        alert('Search clicked! This would open search functionality.');
    });
    
    // Assistant card click
    document.querySelector('.assistant-card').addEventListener('click', function() {
        alert('Assistant button clicked! This would activate the AI assistant.');
    });
    
    // Copy functionality for prompt cards
    document.querySelectorAll('.copy-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            const promptText = this.closest('.prompt-card').querySelector('.prompt-text').textContent;
            copyToClipboard(promptText);
            showNotification('Prompt copied to clipboard!');
        });
    });
    
    // Edit functionality for prompt cards
    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            const promptCard = this.closest('.prompt-card');
            const promptText = promptCard.querySelector('.prompt-text');
            editPrompt(promptText);
        });
    });
    
    // Prompt card click
    document.querySelectorAll('.prompt-card').forEach(card => {
        card.addEventListener('click', function() {
            const promptText = this.querySelector('.prompt-text').textContent;
            alert(`Prompt selected: ${promptText}`);
        });
    });
    
    // Add new prompt button
    document.querySelector('.add-prompt-btn').addEventListener('click', function() {
        addNewPrompt();
    });
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied successfully');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// Fallback copy method for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('Text copied successfully');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Edit prompt functionality
function editPrompt(promptElement) {
    const currentText = promptElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText.replace('{ ', '').replace(' }', '');
    input.style.cssText = `
        width: 100%;
        padding: 8px;
        border: 2px solid #9c27b0;
        border-radius: 6px;
        font-size: 1.1rem;
        font-weight: 500;
        background: white;
    `;
    
    promptElement.textContent = '';
    promptElement.appendChild(input);
    input.focus();
    
    input.addEventListener('blur', function() {
        const newText = `{ ${this.value} }`;
        promptElement.textContent = newText;
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            this.blur();
        }
    });
}

// Add new prompt functionality
function addNewPrompt() {
    const promptsContainer = document.querySelector('.prompts-container');
    const colors = ['red', 'green', 'blue', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newPromptCard = document.createElement('div');
    newPromptCard.className = `prompt-card ${randomColor}`;
    newPromptCard.innerHTML = `
        <div class="prompt-content">
            <span class="prompt-text">{ new prompt }</span>
        </div>
        <div class="prompt-actions">
            <i class="fas fa-edit edit-icon"></i>
            <i class="fas fa-copy copy-icon"></i>
        </div>
    `;
    
    promptsContainer.appendChild(newPromptCard);
    
    // Add event listeners to new card
    const copyIcon = newPromptCard.querySelector('.copy-icon');
    const editIcon = newPromptCard.querySelector('.edit-icon');
    
    copyIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        const promptText = this.closest('.prompt-card').querySelector('.prompt-text').textContent;
        copyToClipboard(promptText);
        showNotification('Prompt copied to clipboard!');
    });
    
    editIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        const promptText = this.closest('.prompt-card').querySelector('.prompt-text');
        editPrompt(promptText);
    });
    
    newPromptCard.addEventListener('click', function() {
        const promptText = this.querySelector('.prompt-text').textContent;
        alert(`Prompt selected: ${promptText}`);
    });
    
    showNotification('New prompt added!');
}