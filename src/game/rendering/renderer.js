//
// This file stores all rendering logic for the game.
//

function redrawLoop() {
    redraw(false);
    window.requestAnimationFrame(redrawLoop);
}

/**
 * @param forceRedraw Whether to ignore any attempts to avoid redrawing elements.
 */
function redraw(forceRedraw) {
    forceRedraw = !!forceRedraw;

    function callRedraw(statistic, redrawFn) {
        recordRenderCallStatistics(statistic, () => {
            redrawFn(forceRedraw);
        });
    }

    recordRenderCallStatistics(STAT_OVERALL, () => {
        callRedraw(STAT_BOARD, redrawBoard);
        callRedraw(STAT_LOADING, redrawLoading);
        callRedraw(STAT_MENU, redrawMenu);
        callRedraw(STAT_TILES, redrawTiles);
        callRedraw(STAT_DICE, redrawDice);
        callRedraw(STAT_SCORES, redrawScores);
        callRedraw(STAT_NETWORK_STATUS, redrawNetworkStatus);
        callRedraw(STAT_WAITING_FOR_FRIEND, renderWaitingForFriendScreen);
        callRedraw(STAT_MESSAGE, redrawMessage);
        callRedraw(STAT_WIN_SCREEN, redrawWinScreen);
        callRedraw(STAT_OVERLAY, redrawOverlay);
    });
}
