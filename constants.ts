import { ChangeType, Release } from './types';

// Mock data has been moved to static markdown files in /releases
export const MOCK_RELEASES: Release[] = [];

export const APP_CONFIG = {
  name: 'KeedaVault',
  version: '2.0.0', // This can be updated manually or via build scripts
  description: 'A modern, secure, and open-source password manager designed for simplicity and privacy.',
  githubUrl: 'https://github.com/daocatt/keedavault',
  features: [
    "Hybrid Storage password manage， local storage, connect to cloud storage",
    "基于keepass构建，支持keepass相关的加密手段",
    "简洁的易用的客户端",
    "Built with React + Tauri"
  ]
};
