#ifndef ROBOT_GATEWAY_H
#define ROBOT_GATEWAY_H

#include <array>
#include <functional>
#include <cstdint>

struct Position3D {
    double x;
    double y;
    double z;
};

struct Quaternion {
    double w;
    double x;
    double y;
    double z;
};

struct HapticInputFrame {
    uint64_t timestamp;
    Position3D position;
    double gripOpenness;
    Quaternion quaternion;
};

struct ForceFeedbackFrame {
    uint64_t timestamp;
    Position3D force;
    Position3D torque;
    bool collisionDetected;
    double collisionIntensity;
};

class HapticWebSocketServer {
public:
    using HapticHandler = std::function<void(const HapticInputFrame&)>;
    using ForceHandler = std::function<void(const ForceFeedbackFrame&)>;

    HapticWebSocketServer(const std::string& host, int port);
    ~HapticWebSocketServer();

    void onHapticInput(HapticHandler handler);
    void sendForceFeedback(const ForceFeedbackFrame& frame);
    void start();
    void stop();

    bool isClientConnected() const;
    double getCurrentHapticRateHz() const;

private:
    struct Impl;
    std::unique_ptr<Impl> pImpl;
};

struct WebRTCVideoConfig {
    int width = 3840;
    int height = 2160;
    int frameRate = 60;
    std::string codec = "H.265";
    uint32_t bitrateKbps = 12000;
};

class WebRTCVideoStreamer {
public:
    WebRTCVideoStreamer(const WebRTCVideoConfig& leftConfig,
                        const WebRTCVideoConfig& rightConfig);
    ~WebRTCVideoStreamer();

    void onSdpAnswer(const std::string& sdp);
    void onIceCandidate(const std::string& candidate);

    void pushLeftFrame(const uint8_t* data, size_t size);
    void pushRightFrame(const uint8_t* data, size_t size);

    void start();
    void stop();

    bool isStreaming() const;

private:
    struct Impl;
    std::unique_ptr<Impl> pImpl;
};

struct RobotArmConfig {
    std::array<double, 6> jointLimits;
    double maxVelocity;
    double collisionThreshold;
};

class RobotArmController {
public:
    RobotArmController(const RobotArmConfig& config);
    ~RobotArmController();

    ForceFeedbackFrame executeMotion(const HapticInputFrame& input);
    void emergencyStop();
    void releaseEmergencyStop();
    void arm();
    void disarm();

    bool isArmed() const;
    bool isEmergencyStopped() const;
    std::array<double, 6> getJointPositions() const;

private:
    struct Impl;
    std::unique_ptr<Impl> pImpl;
};

#endif
