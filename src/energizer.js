//////////////////////////////////////////////////////////////////////////////////////
// Energizer

// This handles how long the energizer lasts as well as how long the
// points will display after eating a ghost.

var energizer = (function() {

    // how many seconds to display points when ghost is eaten
    var pointsDuration = 1;

    // Store the original duration for doubling
    var originalDuration = 0;
    var isDurationDoubled = false;

    // how long to stay energized based on current level
    var getDuration = (function(){
        var seconds = [6,5,4,3,2,5,2,2,1,5,2,1,1,3,1,1,0,1];
        return function() {
            var i = level;
            if (i > 18) return 0;
            var duration = 60 * seconds[i-1];
            return isDurationDoubled ? duration * 2 : duration;
        };
    })();

    // how many ghost flashes happen near the end of frightened mode based on current level
    var getFlashes = (function(){
        var flashes = [5,5,5,5,5,5,5,5,3,5,5,3,3,5,3,3,0,3];
        return function() {
            var i = level;
            return (i > 18) ? 0 : flashes[i-1];
        };
    })();

    // "The ghosts change colors every 14 game cycles when they start 'flashing'" -Jamey Pittman
    var flashInterval = 14;

    var count;  // how long in frames energizer has been active
    var active; // indicates if energizer is currently active
    var points; // points that the last eaten ghost was worth
    var pointsFramesLeft; // number of frames left to display points earned from eating ghost

    var savedCount = {};
    var savedActive = {};
    var savedPoints = {};
    var savedPointsFramesLeft = {};

    // save state at time t
    var save = function(t) {
        savedCount[t] = count;
        savedActive[t] = active;
        savedPoints[t] = points;
        savedPointsFramesLeft[t] = pointsFramesLeft;
    };

    // load state at time t
    var load = function(t) {
        count = savedCount[t];
        active = savedActive[t];
        points = savedPoints[t];
        pointsFramesLeft = savedPointsFramesLeft[t];
    };

    // Timer for "Time x2" message
    var timeX2MessageFrames = 0;
    var timeX2MessageDuration = 180; // 3 seconds at 60fps

    return {
        save: save,
        load: load,
        reset: function() {
            count = 0;
            active = false;
            points = 100;
            pointsFramesLeft = 0;
            isDurationDoubled = false;
            timeX2MessageFrames = 0;
            for (var i=0; i<4; i++) {
                ghosts[i].scared = false;
            }
        },
        update: function() {
            if (active) {
                if (count == getDuration())
                    this.reset();
                else
                    count++;
            }
            if (timeX2MessageFrames > 0) {
                timeX2MessageFrames--;
            }
        },
        activate: function() {
            // Pause game first
            if (!executive.isPaused()) {
                executive.togglePause();
            }
            
            // Display quiz
            quiz.prompt(function(correct) {
                if (correct) {
                    // Double duration
                    isDurationDoubled = true;
                    
                    // Start "Time x2" message timer
                    timeX2MessageFrames = timeX2MessageDuration;
                    
                    // Spawn a fruit
                    if (fruit) {
                        if (typeof fruit.spawn === 'function') {
                            fruit.spawn();
                        } else if (typeof fruit.start === 'function') {
                            fruit.start();
                        } else if (typeof fruit.reset === 'function') {
                            fruit.reset();
                        }
                    }
                }
                
                // Activate energizer
                active = true;
                count = 0;
                points = 100;
                for (var i=0; i<4; i++) {
                    ghosts[i].onEnergized();
                }
                if (getDuration() == 0) { // if no duration, then immediately reset
                    this.reset();
                }
                
                // Resume game
                if (executive.isPaused()) {
                    executive.togglePause();
                }
            });
        },
        isActive: function() { return active; },
        isFlash: function() { 
            var i = Math.floor((getDuration()-count)/flashInterval);
            return (i<=2*getFlashes()-1) ? (i%2==0) : false;
        },

        getPoints: function() {
            return points;
        },
        addPoints: function() {
            addScore(points*=2);
            pointsFramesLeft = pointsDuration*60;
        },
        showingPoints: function() { return pointsFramesLeft > 0; },
        updatePointsTimer: function() { if (pointsFramesLeft > 0) pointsFramesLeft--; },
        
        // For "Time x2" message
        isShowingTimeX2: function() { return timeX2MessageFrames > 0; }
    };
})();
