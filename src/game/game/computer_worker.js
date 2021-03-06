//
// This file contains the code for the web worker that
// computes moves for the computer to play.
//

function SimAPI() {
    this.__class_name__ = "SimAPI";
    this.simulators = {};

    postMessage(writeAIFunctionalityPacket(true, false, false).data);
    royalUrAnalysis.load(
        "/game/royal_ur_analysis.wasm",
        this.onRoyalUrAnalysisLoaded.bind(this),
        this.onRoyalUrAnalysisLoadErrored.bind(this)
    );
}
SimAPI.prototype.onMessage = function(event) {
    const packet = aiPackets.readPacket(event.data);

    if (packet.type === "ai_move_request") {
        this.onMoveRequest(packet);
    } else {
        throw "Unsupported packet type " + packet.type;
    }
};
SimAPI.prototype.onMoveRequest = function(request) {
    // Check if we should forward the request to RoyalUrAnalysis.
    if (request.usePanda) {
        // Create a new request for RoyalUrAnalysis.
        const pandaRequest = writeAIPandaMoveRequestPacket(
            request.state, request.roll, request.depth
        );

        // Send the request to RoyalUrAnalysis and read the response.
        const response = royalUrAnalysis.sendRequest(pandaRequest.getDataNoType()),
            responsePacket = new PacketIn(response, true),
            responseMove = responsePacket.nextLocation();
        responsePacket.assertEmpty();

        // Send the response back to the game.
        postMessage(writeAIMoveResponsePacket(responseMove).data);
        return;
    }

    // Find the best move and respond with it.
    const moveFrom = this.getSimulator(request.depth).findBestMove(request.state, request.roll);
    postMessage(writeAIMoveResponsePacket(moveFrom).data)
};
SimAPI.prototype.getSimulator = function(depth) {
    if (!this.simulators.hasOwnProperty(depth)) {
        this.simulators[depth] = new GameSimulator(depth);
    }
    return this.simulators[depth];
};
SimAPI.prototype.onRoyalUrAnalysisLoaded = function() {
    postMessage(writeAIFunctionalityPacket(true, true, false).data);
};
SimAPI.prototype.onRoyalUrAnalysisLoadErrored = function(error) {
    console.error("There was an error loading RoyalUrAnalysis: " + error);
    postMessage(writeAIFunctionalityPacket(true, false, true).data);
};


// Load the simulator!
const simAPI = new SimAPI();
onmessage = simAPI.onMessage.bind(simAPI);
