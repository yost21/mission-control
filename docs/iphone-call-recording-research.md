# iPhone Call Recording Research

## Native Call Recording (iOS 18.1+)

Starting with iOS 18.1, iPhones (iPhone 13 and later) can record and transcribe phone calls natively.

### How It Works

1. During a call, tap the **Record** button on the in-call screen
2. A countdown plays, then an **audio announcement notifies all participants** that the call is being recorded
3. When you stop recording, another announcement plays saying the call is no longer being recorded
4. Recordings are saved to the **Notes app** (Call Recordings folder) with on-device transcription via Apple Intelligence

### Notification to Other Party

**The other party is always notified.** There is no way to disable or bypass the audio announcement. Apple designed this for compliance with privacy and consent laws (two-party consent states in the US, international regulations, etc.).

### Availability

- Available in: US, Canada, UK, Australia
- **Not available** in: EU, Azerbaijan, Bahrain, Egypt, Iran, Iraq, Jordan, Kuwait, Morocco, Nigeria, Oman, Pakistan, Qatar, Russia, Saudi Arabia, South Africa, Turkey, UAE, Yemen
- Requires: iPhone 13 or later, iOS 18.1+

### Privacy & Storage

- Recordings are stored locally in Notes with end-to-end encryption
- Transcription happens entirely on-device (Apple Intelligence)
- Conversations never leave the iPhone

## Screen Recording During Calls

**iOS blocks screen recording from capturing call audio.** When a phone call is active, the microphone is reserved for the call — screen recording will capture video only, not audio. There is no native way to anonymously screen-record a call with audio.

## Alternative Methods

| Method | Anonymous? | Notes |
|--------|-----------|-------|
| Native iOS 18.1 recording | No — notifies all parties | Best quality, on-device transcription |
| Speakerphone + second device | Effectively yes | Lower audio quality |
| Voice Memos on second device | Effectively yes | Requires physical proximity |
| Third-party apps (TapeACall, Rev) | Varies — may have own notifications | Uses conference call merging, requires subscription |
| Google Voice | No — plays notification tone | Only records incoming calls to GV number |
| Screen mirroring to Mac + QuickTime/OBS | Limited | Audio capture still restricted by iOS |

## Legal Considerations

- **One-party consent states (US):** Only one party needs to consent to recording
- **Two-party/all-party consent states (US):** All parties must consent (e.g., California, Florida, Illinois)
- **International laws vary significantly** — always check local regulations before recording

## Key Takeaway

There is **no way to secretly record a phone call natively on iPhone**. Apple intentionally prevents this for privacy and legal compliance. The built-in iOS 18.1 feature always announces to all participants. External workarounds (second device, speakerphone) are the only methods that don't produce an in-call notification.

## Sources

- [Apple Support — Record and transcribe a call on iPhone](https://support.apple.com/guide/iphone/record-and-transcribe-a-call-iph57c6590e9/ios)
- [MacRumors — iOS 18.1: How to Record and Transcribe iPhone Calls](https://www.macrumors.com/how-to/ios-record-your-phone-calls/)
- [Apple Insider — How to use call recording and transcription in iOS 18.1](https://appleinsider.com/articles/24/07/30/how-to-use-call-recording-and-transcription-in-ios-181)
- [Apple Community — Will others know if I'm using Call Recording?](https://discussions.apple.com/thread/255996201)
- [Techlicious — Apple Offers Native Way to Record Calls on iPhones](https://www.techlicious.com/tip/how-to-record-a-phone-call-iphone-ios-18.1-and-higher/)
