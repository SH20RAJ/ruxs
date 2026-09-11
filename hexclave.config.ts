export const config = {
  "apps": {
    "installed": {
      "authentication": {
        "enabled": true
      },
      "rbac": {
        "enabled": true
      },
      "api-keys": {
        "enabled": true
      },
      "emails": {
        "enabled": true
      },
      "analytics": {
        "enabled": true
      }
    }
  },
  "auth": {
    "password": {
      "allowSignIn": true
    },
    "otp": {
      "allowSignIn": true
    },
    "passkey": {
      "allowSignIn": true
    },
    "oauth": {
      "providers": {
        "google": {
          "type": "google",
          "allowSignIn": true,
          "allowConnectedAccounts": true
        }
      }
    }
  },
  "emails": {
    "selectedThemeId": "1df07ae6-abf3-4a40-83a5-a1a2cbe336ac"
  }
};
