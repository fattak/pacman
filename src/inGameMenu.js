////////////////////////////////////////////////////
// In-Game Menu
var inGameMenu = (function() {

    // button dimensions
    var w = 7*tileSize;
    var h = 2*tileSize;

    var getMainMenu = function() {
        return practiceMode ? practiceMenu : menu;
    };
    var showMainMenu = function() {
        getMainMenu().enable();
    };
    var hideMainMenu = function() {
        getMainMenu().disable();
    };

    // POW button for potion activation (wider for longer text)
    var powBtn = new Button(mapWidth/2 + w/2 + tileSize,mapHeight,w+2*tileSize,h, function() {
        if (pacman.potionCount > 0) {
            potionConfirmMenu.enable();
        }
    });
    powBtn.setText("(Z)POW");
    powBtn.setFont(tileSize+"px ArcadeR","#FFF");

    // Draw invincibility progress bar
    var drawInvincibleProgress = function(ctx) {
        // Calculate progress based on current timer and max duration
        var maxDuration = pacman.invincibleDuration;
        var progressWidth = (pacman.invincibleTimer / maxDuration) * (w+2*tileSize);
        
        // Draw background
        ctx.fillStyle = "rgba(100,100,100,0.5)";
        ctx.fillRect(mapWidth/2 + w/2 + tileSize, mapHeight, w+2*tileSize, h);
        
        // Draw progress
        ctx.fillStyle = pacman.invincibleTimer > INVINCIBLE_DURATION_WRONG ? "#FFA500" : "#FFD700"; // Orange for bonus time
        ctx.fillRect(mapWidth/2 + w/2 + tileSize, mapHeight, progressWidth, h);
        
        // Draw time text
        ctx.fillStyle = "#000";
        ctx.font = tileSize+"px ArcadeR";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var secondsLeft = Math.ceil(pacman.invincibleTimer / 60); // Convert frames to seconds
        ctx.fillText(secondsLeft+"s", mapWidth/2 + w/2 + tileSize + (w+2*tileSize)/2, mapHeight + h/2);
    };

    // button to enable in-game menu
    var btn = new Button(mapWidth/2 - w/2,mapHeight,w,h, function() {
        showMainMenu();
        vcr.onHudDisable();
    });
    btn.setText("MENU");
    btn.setFont(tileSize+"px ArcadeR","#FFF");

    // confirms a menu action
    var confirmMenu = new Menu("QUESTION?",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    confirmMenu.addTextButton("YES", function() {
        confirmMenu.disable();
        confirmMenu.onConfirm();
    });
    confirmMenu.addTextButton("NO", function() {
        confirmMenu.disable();
        showMainMenu();
    });
    confirmMenu.addTextButton("CANCEL", function() {
        confirmMenu.disable();
        showMainMenu();
    });
    confirmMenu.backButton = confirmMenu.buttons[confirmMenu.buttonCount-1];

    var showConfirm = function(title,onConfirm) {
        hideMainMenu();
        confirmMenu.title = title;
        confirmMenu.onConfirm = onConfirm;
        confirmMenu.enable();
    };

    // regular menu
    var menu = new Menu("PAUSED",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    menu.addTextButton("RESUME", function() {
        menu.disable();
    });
    menu.addTextButton("QUIT", function() {
        showConfirm("QUIT GAME?", function() {
            switchState(homeState, 60);
        });
    });
    menu.backButton = menu.buttons[0];

    // practice menu
    var practiceMenu = new Menu("PAUSED",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    practiceMenu.addTextButton("RESUME", function() {
        hideMainMenu();
        vcr.onHudEnable();
    });
    practiceMenu.addTextButton("RESTART LEVEL", function() {
        showConfirm("RESTART LEVEL?", function() {
            level--;
            switchState(readyNewState, 60);
        });
    });
    practiceMenu.addTextButton("SKIP LEVEL", function() {
        showConfirm("SKIP LEVEL?", function() {
            switchState(readyNewState, 60);
        });
    });
    practiceMenu.addTextButton("CHEATS", function() {
        practiceMenu.disable();
        cheatsMenu.enable();
    });
    practiceMenu.addTextButton("QUIT", function() {
        showConfirm("QUIT GAME?", function() {
            switchState(homeState, 60);
            clearCheats();
            vcr.reset();
        });
    });
    practiceMenu.backButton = practiceMenu.buttons[0];

    // cheats menu
    var cheatsMenu = new Menu("CHEATS",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    cheatsMenu.addToggleTextButton("INVINCIBLE",
        function() {
            return pacman.invincible;
        },
        function(on) {
            pacman.invincible = on;
        });
    cheatsMenu.addToggleTextButton("TURBO",
        function() {
            return turboMode;
        },
        function(on) {
            turboMode = on;
        });
    cheatsMenu.addToggleTextButton("SHOW TARGETS",
        function() {
            return blinky.isDrawTarget;
        },
        function(on) {
            for (var i=0; i<4; i++) {
                ghosts[i].isDrawTarget = on;
            }
        });
    cheatsMenu.addToggleTextButton("SHOW PATHS",
        function() {
            return blinky.isDrawPath;
        },
        function(on) {
            for (var i=0; i<4; i++) {
                ghosts[i].isDrawPath = on;
            }
        });
    cheatsMenu.addSpacer(1);
    cheatsMenu.addTextButton("BACK", function() {
        cheatsMenu.disable();
        practiceMenu.enable();
    });
    cheatsMenu.backButton = cheatsMenu.buttons[cheatsMenu.buttons.length-1];

    // potion confirmation menu
    var potionConfirmMenu = new Menu("USE POTION?",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    potionConfirmMenu.addTextButton("INVINCIBLE POW", function() {
        potionConfirmMenu.disable();
        pacman.usePotion();
    });
    potionConfirmMenu.addTextButton("CANCEL", function() {
        potionConfirmMenu.disable();
    });
    potionConfirmMenu.backButton = potionConfirmMenu.buttons[1]; // Set CANCEL as back button

    var menus = [menu, practiceMenu, confirmMenu, cheatsMenu, potionConfirmMenu];
    var getVisibleMenu = function() {
        var len = menus.length;
        var i;
        var m;
        for (i=0; i<len; i++) {
            m = menus[i];
            if (m.isEnabled()) {
                return m;
            }
        }
    };

    return {
        onHudEnable: function() {
            btn.enable();
            powBtn.enable();
        },
        onHudDisable: function() {
            btn.disable();
            powBtn.disable();
        },
        update: function() {
            // Update both buttons
            btn.update();
            powBtn.update();
            
            var menu = getVisibleMenu();
            if (menu) {
                menu.update();
            }
        },
        draw: function(ctx) {
            var menu = getVisibleMenu();
            if (menu) {
                // Draw dark overlay when menu is open
                ctx.fillStyle = "rgba(0,0,0,0.8)";
                ctx.fillRect(-mapPad-1,-mapPad-1,mapWidth+1,mapHeight+1);
                menu.draw(ctx);
            }
            else {
                // Draw buttons only when menu is not visible
                btn.draw(ctx);
                // Show progress bar when invincible or quiz active, otherwise show POW button if has potions
                if (pacman.invincible) {
                    drawInvincibleProgress(ctx);
                } else if (pacman.quizActive) {
                    // Hide POW button during quiz
                } else if (pacman.potionCount > 0) {
                    powBtn.draw(ctx);
                }
            }
        },
        isOpen: function() {
            return getVisibleMenu() != undefined;
        },
        getMenu: function() {
            return getVisibleMenu();
        },
        getMenuButton: function() {
            return btn;
        },
        getPowButton: function() {
            return powBtn;
        },
    };
})();
