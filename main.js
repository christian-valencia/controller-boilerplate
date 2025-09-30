// Handheld Controller Boilerplate
// Main JavaScript File - ROG Ally Controller + Keyboard Integration

let inputManager;
let animationFrameId;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 ROG Ally Controller Boilerplate initialized');
    console.log('⌨️ Keyboard controls enabled!');
    init();
});

function init() {
    // Create unified input manager (gamepad + keyboard)
    inputManager = new InputManager();
    
    // Start update loop
    update();
    
    // Display keyboard controls
    console.log('Keyboard Controls:', inputManager.getKeyboardControls());
    console.log('Press A/D button to test rumble!');
}

// Main update loop
function update() {
    // Update input state (gamepad + keyboard)
    inputManager.update();
    
    // Update UI
    updateConnectionStatus();
    updateButtons();
    updateTriggers();
    updateSticks();
    updateActiveButtons();
    
    // Handle button presses
    handleInput();
    
    // Continue loop
    animationFrameId = requestAnimationFrame(update);
}

// Update connection status
function updateConnectionStatus() {
    const statusEl = document.getElementById('connection-status');
    const gamepad = inputManager.getGamepad();
    const inputMethod = inputManager.getActiveInputMethod();
    
    if (gamepad) {
        statusEl.textContent = `Connected: ${gamepad.id}`;
        statusEl.className = 'connected';
    } else if (inputMethod === 'keyboard') {
        statusEl.textContent = 'Using Keyboard Controls';
        statusEl.className = 'connected';
    } else {
        statusEl.textContent = 'Waiting for controller or press a key...';
        statusEl.className = '';
    }
}

// Update button visual states
function updateButtons() {
    const buttons = document.querySelectorAll('.button[data-button]');
    
    buttons.forEach(button => {
        const buttonName = button.getAttribute('data-button');
        const isPressed = inputManager.isButtonDown(buttonName);
        
        if (isPressed) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Update trigger bars
function updateTriggers() {
    const leftTrigger = inputManager.getTrigger('LT');
    const rightTrigger = inputManager.getTrigger('RT');
    
    const ltFill = document.querySelector('.trigger-fill[data-trigger="LT"]');
    const rtFill = document.querySelector('.trigger-fill[data-trigger="RT"]');
    
    if (ltFill) ltFill.style.width = `${leftTrigger * 100}%`;
    if (rtFill) rtFill.style.width = `${rightTrigger * 100}%`;
}

// Update analog stick positions
function updateSticks() {
    const leftStick = inputManager.getStick('LEFT');
    const rightStick = inputManager.getStick('RIGHT');
    
    // Update left stick indicator
    const leftIndicator = document.getElementById('left-stick');
    if (leftIndicator) {
        const offsetX = leftStick.x * 60; // 60px max offset
        const offsetY = -leftStick.y * 60; // Negative because CSS Y is inverted
        leftIndicator.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    }
    
    // Update right stick indicator
    const rightIndicator = document.getElementById('right-stick');
    if (rightIndicator) {
        const offsetX = rightStick.x * 60;
        const offsetY = -rightStick.y * 60;
        rightIndicator.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    }
    
    // Update values display
    document.getElementById('ls-x').textContent = leftStick.x.toFixed(2);
    document.getElementById('ls-y').textContent = leftStick.y.toFixed(2);
    document.getElementById('rs-x').textContent = rightStick.x.toFixed(2);
    document.getElementById('rs-y').textContent = rightStick.y.toFixed(2);
}

// Update active buttons display
function updateActiveButtons() {
    const pressedButtons = inputManager.getPressedButtons();
    const activeEl = document.getElementById('active-buttons');
    
    if (pressedButtons.length > 0) {
        activeEl.textContent = pressedButtons.join(' + ');
    } else {
        activeEl.textContent = 'None';
    }
}

// Handle input events
function handleInput() {
    // Test rumble when A is pressed (D key on keyboard)
    if (inputManager.justPressed('A')) {
        console.log('A button pressed! (D key or gamepad A)');
        inputManager.rumble(0.8, 200);
    }
    
    // Log other button presses
    if (inputManager.justPressed('B')) console.log('B pressed (S key or gamepad B)');
    if (inputManager.justPressed('X')) console.log('X pressed (A key or gamepad X)');
    if (inputManager.justPressed('Y')) console.log('Y pressed (W key or gamepad Y)');
    
    // Menu buttons
    if (inputManager.justPressed('VIEW')) console.log('VIEW pressed (Tab or gamepad)');
    if (inputManager.justPressed('MENU')) console.log('MENU pressed (Enter or gamepad)');
    if (inputManager.justPressed('HOME')) console.log('HOME pressed (Esc or gamepad)');
    
    // Stick clicks
    if (inputManager.justPressed('LS')) console.log('Left stick clicked');
    if (inputManager.justPressed('RS')) console.log('Right stick clicked');
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});
