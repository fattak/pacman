//////////////////////////////////////////////////////////////////////////////////////
// Input
// (Handles all key presses and touches)

// Create a namespace for shared functions
var inputManager = {
    isPlayState: function() { 
        // Check if vcr is defined first
        if (typeof vcr === 'undefined') {
            return state == learnState || 
                state == newGameState || 
                state == playState || 
                state == readyNewState || 
                state == readyRestartState;
        }
        return !vcr.isSeeking() && (
            state == learnState || 
            state == newGameState || 
            state == playState || 
            state == readyNewState || 
            state == readyRestartState
        ); 
    },
    // Add scroll control functions to the namespace
    disableScroll: function() {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
        document.addEventListener('touchmove', function(e) {
            if (inputManager.isPlayState()) {
                e.preventDefault();
            }
        }, { passive: false });
    },
    enableScroll: function() {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
    }
};

(function(){
    // A Key Listener class (each key maps to an array of callbacks)
    var KeyEventListener = function() {
        this.listeners = {};
    };
    KeyEventListener.prototype = {
        add: function(key, callback, isActive) {
            this.listeners[key] = this.listeners[key] || [];
            this.listeners[key].push({
                isActive: isActive,
                callback: callback,
            });
        },
        exec: function(key, e) {
            var keyListeners = this.listeners[key];
            if (!keyListeners) {
                return;
            }
            var i,l;
            var numListeners = keyListeners.length;
            for (i=0; i<numListeners; i++) {
                l = keyListeners[i];
                if (!l.isActive || l.isActive()) {
                    e.preventDefault();
                    if (l.callback()) { // do not propagate keys if returns true
                        break;
                    }
                }
            }
        },
    };

    // declare key event listeners
    var keyDownListeners = new KeyEventListener();
    var keyUpListeners = new KeyEventListener();

    // helper functions for adding custom key listeners
    var addKeyDown = function(key,callback,isActive) { keyDownListeners.add(key,callback,isActive); };
    var addKeyUp   = function(key,callback,isActive) { keyUpListeners.add(key,callback,isActive); };

    // boolean states of each key
    var keyStates = {};

    // hook my key listeners to the window's listeners
    window.addEventListener("keydown", function(e) {
        var key = (e||window.event).keyCode;

        // only execute at first press event
        if (!keyStates[key]) {
            keyStates[key] = true;
            keyDownListeners.exec(key, e);
        }
    });
    window.addEventListener("keyup",function(e) {
        var key = (e||window.event).keyCode;

        keyStates[key] = false;
        keyUpListeners.exec(key, e);
    });

    // key enumerations

    var KEY_ENTER = 13;
    var KEY_ESC = 27;

    var KEY_LEFT = 37;
    var KEY_RIGHT = 39;
    var KEY_UP = 38;
    var KEY_DOWN = 40;

    var KEY_SHIFT = 16;
    var KEY_CTRL = 17;
    var KEY_ALT = 18;

    var KEY_SPACE = 32;

    var KEY_M = 77;
    var KEY_N = 78;
    var KEY_Q = 81;
    var KEY_W = 87;
    var KEY_E = 69;
    var KEY_R = 82;
    var KEY_T = 84;
    var KEY_Y = 89;
    var KEY_U = 85;
    var KEY_Z = 90;

    var KEY_A = 65;
    var KEY_S = 83;
    var KEY_D = 68;
    var KEY_F = 70;
    var KEY_G = 71;
    var KEY_H = 72;
    var KEY_J = 74;
    var KEY_K = 75;

    var KEY_I = 73;
    var KEY_O = 79;
    var KEY_P = 80;

    var KEY_1 = 49;
    var KEY_2 = 50;

    var KEY_END = 35;

    // Custom Key Listeners

    // Menu Navigation Keys
    var menu;
    var isInMenu = function() {
        menu = (state.getMenu && state.getMenu());
        if (!menu && inGameMenu.isOpen()) {
            menu = inGameMenu.getMenu();
        }
        return menu;
    };
    addKeyDown(KEY_ESC,   function(){ menu.backButton ? menu.backButton.onclick():0; return true; }, isInMenu);
    addKeyDown(KEY_ENTER, function(){ menu.clickCurrentOption(); }, isInMenu);
    addKeyDown(KEY_SPACE, function(){ menu.clickCurrentOption(); }, isInMenu);
    var isMenuKeysAllowed = function() {
        var menu = isInMenu();
        return menu && !menu.noArrowKeys;
    };
    addKeyDown(KEY_UP,    function(){ menu.selectPrevOption(); }, isMenuKeysAllowed);
    addKeyDown(KEY_DOWN,  function(){ menu.selectNextOption(); }, isMenuKeysAllowed);
    addKeyDown(KEY_W,    function(){ menu.selectPrevOption(); }, isMenuKeysAllowed);
    addKeyDown(KEY_S,  function(){ menu.selectNextOption(); }, isMenuKeysAllowed);
    var isInGameMenuButtonClickable = function() {
        return hud.isValidState() && !inGameMenu.isOpen();
    };
    addKeyDown(KEY_ESC, function() { inGameMenu.getMenuButton().onclick(); return true; }, isInGameMenuButtonClickable);

    // Move Pac-Man
    addKeyDown(KEY_LEFT,  function() { pacman.setInputDir(DIR_LEFT); },  inputManager.isPlayState);
    addKeyDown(KEY_RIGHT, function() { pacman.setInputDir(DIR_RIGHT); }, inputManager.isPlayState);
    addKeyDown(KEY_UP,    function() { pacman.setInputDir(DIR_UP); },    inputManager.isPlayState);
    addKeyDown(KEY_DOWN,  function() { pacman.setInputDir(DIR_DOWN); },  inputManager.isPlayState);
    addKeyUp  (KEY_LEFT,  function() { pacman.clearInputDir(DIR_LEFT); },  inputManager.isPlayState);
    addKeyUp  (KEY_RIGHT, function() { pacman.clearInputDir(DIR_RIGHT); }, inputManager.isPlayState);
    addKeyUp  (KEY_UP,    function() { pacman.clearInputDir(DIR_UP); },    inputManager.isPlayState);
    addKeyUp  (KEY_DOWN,  function() { pacman.clearInputDir(DIR_DOWN); },  inputManager.isPlayState);
    addKeyDown(KEY_A,  function() { pacman.setInputDir(DIR_LEFT); },  inputManager.isPlayState);
    addKeyDown(KEY_D, function() { pacman.setInputDir(DIR_RIGHT); }, inputManager.isPlayState);
    addKeyDown(KEY_W,    function() { pacman.setInputDir(DIR_UP); },    inputManager.isPlayState);
    addKeyDown(KEY_S,  function() { pacman.setInputDir(DIR_DOWN); },  inputManager.isPlayState);
    addKeyUp  (KEY_A,  function() { pacman.clearInputDir(DIR_LEFT); },  inputManager.isPlayState);
    addKeyUp  (KEY_D, function() { pacman.clearInputDir(DIR_RIGHT); }, inputManager.isPlayState);
    addKeyUp  (KEY_W,    function() { pacman.clearInputDir(DIR_UP); },    inputManager.isPlayState);
    addKeyUp  (KEY_S,  function() { pacman.clearInputDir(DIR_DOWN); },  inputManager.isPlayState);

    // Slow-Motion
    var isPracticeMode = function() { return inputManager.isPlayState() && practiceMode; };
    addKeyDown(KEY_1, function() { executive.setUpdatesPerSecond(30); }, isPracticeMode);
    addKeyDown(KEY_2,  function() { executive.setUpdatesPerSecond(15); }, isPracticeMode);
    addKeyUp  (KEY_1, function() { executive.setUpdatesPerSecond(60); }, isPracticeMode);
    addKeyUp  (KEY_2,  function() { executive.setUpdatesPerSecond(60); }, isPracticeMode);

    // Toggle VCR
    var canSeek = function() { return !isInMenu() && vcr.getMode() != VCR_NONE; };
    addKeyDown(KEY_SHIFT, function() { vcr.startSeeking(); },   canSeek);
    addKeyUp  (KEY_SHIFT, function() { vcr.startRecording(); }, canSeek);

    // Adjust VCR seeking
    var isSeekState = function() { return vcr.isSeeking(); };
    addKeyDown(KEY_UP,   function() { vcr.nextSpeed(1); },  isSeekState);
    addKeyDown(KEY_DOWN, function() { vcr.nextSpeed(-1); }, isSeekState);

    // Skip Level
    var canSkip = function() {
        return isPracticeMode() && 
            (state == newGameState ||
            state == readyNewState ||
            state == readyRestartState ||
            state == playState ||
            state == deadState ||
            state == finishState ||
            state == overState);
    };
    addKeyDown(KEY_N, function() { switchState(readyNewState, 60); }, canSkip);
    addKeyDown(KEY_M, function() { switchState(finishState); }, function() { return state == playState; });

    // use POW
    addKeyDown(KEY_Z, function() { 
        if (inputManager.isPlayState()) {
            inGameMenu.getPowButton().onclick();
        }
    }, isInGameMenuButtonClickable);

    // Draw Actor Targets (fishpoles)
    addKeyDown(KEY_E, function() { blinky.isDrawTarget = !blinky.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_R, function() { pinky.isDrawTarget = !pinky.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_T, function() { inky.isDrawTarget = !inky.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_Y, function() { clyde.isDrawTarget = !clyde.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_U, function() { pacman.isDrawTarget = !pacman.isDrawTarget; }, isPracticeMode);

    // Draw Actor Paths
    addKeyDown(KEY_F, function() { blinky.isDrawPath = !blinky.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_G, function() { pinky.isDrawPath = !pinky.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_H, function() { inky.isDrawPath = !inky.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_J, function() { clyde.isDrawPath = !clyde.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_K, function() { pacman.isDrawPath = !pacman.isDrawPath; }, isPracticeMode);

    // Miscellaneous Cheats
    addKeyDown(KEY_I, function() { 
        pacman.invincible = !pacman.invincible; 
        pacman.invincibleTimer = 3600; // 60 seconds (3600 frames)
    }, isPracticeMode);
    addKeyDown(KEY_O, function() { turboMode = !turboMode; }, isPracticeMode);
    addKeyDown(KEY_P, function() { pacman.ai = !pacman.ai; }, isPracticeMode);

    addKeyDown(KEY_END, function() { executive.togglePause(); });
})();

var initSwipe = function() {
    // Track touch start position
    var touchStartX = null;
    var touchStartY = null;
    var minSwipeDistance = 30; // Minimum distance for a swipe

    var handleStart = function(e) {
        if (!inputManager.isPlayState()) return;
        
        var touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        // Disable scrolling when touch starts in play state
        inputManager.disableScroll();
    };

    var handleMove = function(e) {
        if (!inputManager.isPlayState() || touchStartX === null || touchStartY === null) return;

        var touch = e.touches[0];
        var deltaX = touch.clientX - touchStartX;
        var deltaY = touch.clientY - touchStartY;
        
        // Determine swipe direction based on the largest delta
        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    pacman.setInputDir(DIR_RIGHT);
                } else {
                    pacman.setInputDir(DIR_LEFT);
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    pacman.setInputDir(DIR_DOWN);
                } else {
                    pacman.setInputDir(DIR_UP);
                }
            }
            // Reset touch start to allow for continuous motion
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
        
        // Prevent default behavior to avoid scrolling
        e.preventDefault();
    };

    var handleEnd = function() {
        // Reset touch tracking
        touchStartX = null;
        touchStartY = null;
        
        // Re-enable scrolling when not in play state
        if (!inputManager.isPlayState()) {
            inputManager.enableScroll();
        }
    };

    // Add touch event listeners
    document.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd, { passive: true });
    document.addEventListener('touchcancel', handleEnd, { passive: true });

    // Initialize scroll control
    if (inputManager.isPlayState()) {
        inputManager.disableScroll();
    }
};

initSwipe();
