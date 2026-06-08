#ifndef API_PROTOCOL_H
#define API_PROTOCOL_H

// ============================================================
// HTTP Signaling API Endpoints
// ============================================================
//
// POST /api/signal/offer
//   Request:  { "sdp": string, "type": "offer", "streamType": "binocular-left"|"binocular-right", "sessionId": string }
//   Response: { "sdp": string, "type": "answer", "sessionId": string }
//
// POST /api/signal/answer
//   Request:  { "sdp": string, "type": "answer", "sessionId": string }
//   Response: 200 OK
//
// POST /api/signal/ice-candidate
//   Request:  { "candidate": string, "sdpMid": string, "sdpMLineIndex": number, "sessionId": string }
//   Response: 200 OK
//
// GET /api/system/status
//   Response: {
//     "webrtc": { "connectionState": string, "iceState": string, "videoCodec": string,
//                 "resolution": string, "bitrate": number, "packetsLost": number, "jitter": number },
//     "websocket": { "connected": boolean, "latencyMs": number, "hapticRateHz": number, "forceRateHz": number },
//     "robot": { "armed": boolean, "emergencyStop": boolean, "jointPositions": number[] },
//     "session": { "id": string, "startTime": number, "duration": number }
//   }
//

// ============================================================
// WebSocket Data Channel Protocol
// ============================================================
//
// Endpoint: ws://{gateway_host}:8765/haptic
//
// Client -> Server (500Hz binary frame):
//   JSON: { "timestamp": number, "position": { "x": number, "y": number, "z": number },
//           "gripOpenness": number, "quaternion": { "w": number, "x": number, "y": number, "z": number } }
//
// Server -> Client (100Hz binary frame):
//   JSON: { "timestamp": number, "force": { "x": number, "y": number, "z": number },
//           "torque": { "x": number, "y": number, "z": number },
//           "collisionDetected": boolean, "collisionIntensity": number }
//

// ============================================================
// Performance Requirements
// ============================================================
//
// WebRTC Video:
//   - End-to-end latency: < 100ms
//   - Resolution: 3840x2160 @ 60fps per eye
//   - Codec: H.265 (HEVC)
//   - Bitrate: 8-15 Mbps per stream
//   - Packet loss tolerance: < 0.1%
//
// WebSocket Haptic:
//   - Upstream (haptic input): 500Hz, < 2ms latency
//   - Downstream (force feedback): 100Hz, < 5ms latency
//   - Coordinate precision: 0.01mm
//   - Force range: ±25N (linear), ±10Nm (torque)
//
// Safety:
//   - Emergency stop latency: < 10ms
//   - Collision detection latency: < 5ms
//   - Heartbeat interval: 50ms
//   - Connection timeout: 200ms
//

#endif
