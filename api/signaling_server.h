#ifndef SIGNALING_SERVER_H
#define SIGNALING_SERVER_H

#include <string>
#include <functional>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

struct SdpOffer {
    std::string sdp;
    std::string type;
    std::string streamType;
    std::string sessionId;
};

struct SdpAnswer {
    std::string sdp;
    std::string type;
    std::string sessionId;
};

struct IceCandidate {
    std::string candidate;
    std::string sdpMid;
    int sdpMLineIndex;
    std::string sessionId;
};

void from_json(const json& j, SdpOffer& o);
void from_json(const json& j, SdpAnswer& a);
void from_json(const json& j, IceCandidate& c);
void to_json(json& j, const SdpAnswer& a);
void to_json(json& j, const IceCandidate& c);

class SignalingServer {
public:
    using SdpHandler = std::function<SdpAnswer(const SdpOffer&)>;
    using IceHandler = std::function<void(const IceCandidate&)>;

    SignalingServer(const std::string& host, int port);
    ~SignalingServer();

    void onSdpOffer(SdpHandler handler);
    void onIceCandidate(IceHandler handler);
    void sendIceCandidate(const IceCandidate& candidate);
    void start();
    void stop();

private:
    struct Impl;
    std::unique_ptr<Impl> pImpl;
};

#endif
