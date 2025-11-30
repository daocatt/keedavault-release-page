import { ChangeType, Release } from './types';

// Mock data has been moved to static markdown files in /releases
export const MOCK_RELEASES: Release[] = [];

export const APP_CONFIG = {
  name: 'KeedaVault',
  version: '2.0.0', // This can be updated manually or via build scripts
  description: 'A modern, secure, and open-source password manager designed for simplicity and privacy.',
  githubUrl: 'https://github.com/daocatt/keedavault',
  features: [
    "Hybrid Storage. Architecture Local-First, Cloud-Ready. We believe in data sovereignty. Your password vault is stored locally by default, giving you complete ownership. ",
    "Fortified Security. Built on the Battle-Tested KeePass Standard. Don't compromise on security. We utilize the industry-standard KDBX 4.x format, protected by military-grade AES-256 and Argon2 encryption. Our Zero-Knowledge architecture means we never see your master password or your data.",
    "Engineered for Performance. Powered by Tauri + React. Say goodbye to bloated electron apps. By leveraging the power of Rust, our client delivers a tiny memory footprint and instant startup times. It’s lightweight, battery-friendly, and responsive—just as a utility tool should be.",
    "Uncompromising Simplicity. A UI You’ll Actually Enjoy Using. Traditional KeePass clients are powerful but often cluttered. We’ve reimagined the experience with a minimalist, distraction-free interface. Enjoy a modern workflow with intuitive auto-fill, dark mode support, and a clean organization system."
  ]
};
